import { supabase } from '../lib/supabase';
import type { Database, ReactionType } from '../types/database';

export type PostRow = Database['public']['Tables']['posts']['Row'];
export type CommentRow = Database['public']['Tables']['comments']['Row'];

export interface PostWithAuthor extends PostRow {
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  post_media: {
    id: string;
    sort_order: number;
    media_asset: {
      storage_path: string;
      bucket: string;
      media_type: string;
    };
  }[];
  user_has_liked?: boolean;
}

export const postService = {
  /**
   * Fetch home feed with cursor pagination (created_at, id)
   */
  async getHomeFeed(options?: {
    cursorCreatedAt?: string;
    cursorId?: string;
    limit?: number;
    collegeId?: string;
    clubId?: string;
  }) {
    const limit = options?.limit ?? 15;
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url),
        post_media(
          id,
          sort_order,
          media_asset:media_assets(storage_path, bucket, media_type)
        )
      `)
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);

    if (options?.collegeId) {
      query = query.eq('college_id', options.collegeId);
    }
    if (options?.clubId) {
      query = query.eq('club_id', options.clubId);
    }

    if (options?.cursorCreatedAt && options?.cursorId) {
      query = query.lt('created_at', options.cursorCreatedAt);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as PostWithAuthor[];
  },

  /**
   * Create a new post
   */
  async createPost(params: {
    content: string;
    visibility?: Database['public']['Tables']['posts']['Insert']['visibility'];
    collegeId?: string | null;
    clubId?: string | null;
    mediaAssetIds?: string[];
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: user.user.id,
        content: params.content,
        visibility: params.visibility ?? 'public',
        college_id: params.collegeId ?? null,
        club_id: params.clubId ?? null,
      })
      .select()
      .single();

    if (postError) throw postError;

    if (params.mediaAssetIds && params.mediaAssetIds.length > 0) {
      const mediaLinks = params.mediaAssetIds.map((mediaId, index) => ({
        post_id: post.id,
        media_asset_id: mediaId,
        sort_order: index,
      }));

      const { error: mediaError } = await supabase.from('post_media').insert(mediaLinks);
      if (mediaError) throw mediaError;
    }

    return post;
  },

  /**
   * Toggle reaction atomically using RPC
   */
  async toggleReaction(postId: string, reaction: ReactionType = 'like') {
    const { data, error } = await supabase.rpc('toggle_post_reaction', {
      p_post_id: postId,
      p_reaction: reaction,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Add comment to post using RPC (with nested depth limit enforcement)
   */
  async addComment(postId: string, content: string, parentCommentId?: string) {
    const { data, error } = await supabase.rpc('add_comment', {
      p_post_id: postId,
      p_content: content,
      p_parent_comment_id: parentCommentId || null,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get comments for a post
   */
  async getPostComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('post_id', postId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },
};
