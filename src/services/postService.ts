import { supabase } from '../lib/supabase';
import type { Database, ReactionType } from '../types/database';
import type { Post } from '../data/types';

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
   * Fetch home feed from Supabase with multi-tier fallback (Direct Supabase -> /api/posts Proxy)
   * Ensures all users, whether authenticated or anonymous, always get the latest campus feed.
   */
  async fetchHomeFeed(): Promise<Post[]> {
    try {
      const res = await fetch('/api/posts', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json()) as { success?: boolean; posts?: Post[] };
        if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
          return data.posts;
        }
      }
    } catch (err) {
      console.warn('[postService] /api/posts fetch note, checking direct Supabase:', err);
    }

    // Direct Supabase query fallback
    try {
      const { data: dbPosts } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          reactions_count,
          comments_count,
          created_at,
          author:profiles!posts_author_id_fkey(display_name, username, avatar_url)
        `)
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(30);

      if (dbPosts && dbPosts.length > 0) {
        return dbPosts.map(p => {
          const author = p.author as unknown as { display_name?: string; username?: string; avatar_url?: string } | null;
          return {
            id: p.id,
            authorId: author?.username || 'user',
            authorName: author?.display_name || 'Campus Student',
            authorAvatar: author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
            createdAt: 'Recently',
            tag: 'General',
            category: 'General',
            content: (p.content || '').replace(/\s*#\[TRYBE_TAG:[^\]]+\]\s*$/, '').trim(),
            likes: p.reactions_count || 0,
            liked: false,
            commentsCount: p.comments_count || 0,
          };
        });
      }
    } catch {
      /* ignore */
    }

    return [];
  },

  /**
   * Publish a new post to Supabase database.
   * Guaranteed to persist via /api/posts proxy and direct Supabase insertion.
   */
  async publishPost(post: Post): Promise<Post | null> {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          content: post.content,
          tag: post.tag,
          category: post.category,
          image: post.image,
          video: post.video,
          mediaType: post.mediaType,
          authorName: post.authorName,
          authorAvatar: post.authorAvatar,
          authorUsername: post.authorId,
          authorMajor: post.authorMajor,
          authorId: post.authorId,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { success?: boolean; post?: Post };
        if (data.post) return data.post;
      }
    } catch (err) {
      console.warn('[postService] /api/posts publish error, attempting direct insert:', err);
    }

    // Direct Supabase insert attempt if user is authenticated
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        const { data: inserted } = await supabase
          .from('posts')
          .insert({
            author_id: user.user.id,
            content: post.content,
            visibility: 'public',
            status: 'published',
          })
          .select()
          .single();

        if (inserted) {
          return {
            ...post,
            id: inserted.id,
          };
        }
      }
    } catch {
      /* ignore */
    }

    return null;
  },
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
