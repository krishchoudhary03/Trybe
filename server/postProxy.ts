import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv, type Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';

/**
 * TRYBE Posts Proxy
 * Synchronizes posts, author profiles, and attached media with the Supabase PostgreSQL database.
 * Ensures that every user (authenticated, demo, or guest) can reliably publish posts
 * and that all other users immediately see new posts in their feed.
 */

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise(resolve => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > 500_000) {
        chunks.length = 0;
        resolve(null);
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(null));
  });
}

export function trybePostProxy(): Plugin {
  let env: Record<string, string> = {};

  const getSupabase = () => {
    const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!url || !key) return null;
    return createClient(url, key);
  };

  const handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = (req.url ?? '/').split('?')[0];

    // Only handle /api/posts
    if (path !== '/api/posts' && path !== '/api/posts/') {
      return next();
    }

    const supabase = getSupabase();
    if (!supabase) {
      return send(res, 503, { error: 'supabase_not_configured' });
    }

    // ── GET: Fetch all posts from Supabase ──
    if (req.method === 'GET') {
      void (async () => {
        try {
          const { data: dbPosts, error } = await supabase
            .from('posts')
            .select(`
              id,
              content,
              reactions_count,
              comments_count,
              created_at,
              status,
              visibility,
              author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, major),
              post_media(
                id,
                sort_order,
                media_asset:media_assets(storage_path, bucket, media_type)
              )
            `)
            .eq('status', 'published')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) {
            console.error('[PostProxy] Fetch posts error:', error);
            return send(res, 500, { error: error.message });
          }

          const posts = (dbPosts || []).map(p => {
            const author = p.author as unknown as {
              id?: string;
              username?: string;
              display_name?: string;
              avatar_url?: string;
              major?: string;
            } | null;

            // Extract primary media (photo or video)
            let mediaUrl: string | undefined = undefined;
            let mediaType: 'image' | 'video' | undefined = undefined;
            if (p.post_media && p.post_media.length > 0) {
              const primary = p.post_media[0]?.media_asset as unknown as {
                storage_path?: string;
                bucket?: string;
                media_type?: string;
              } | null;
              if (primary?.storage_path) {
                mediaUrl = primary.storage_path;
                mediaType = primary.media_type === 'video' ? 'video' : 'image';
              }
            }

            // Extract tag or category from content hashtags if present
            let tag = 'General';
            let category = 'General';
            const content = p.content || '';
            if (content.includes('#Memes') || content.includes('#meme')) { tag = 'Memes'; category = 'Memes'; }
            else if (content.includes('#AskHelp') || content.includes('#help')) { tag = 'Ask Help'; category = 'Ask Help'; }
            else if (content.includes('#Videos') || content.includes('#video') || mediaType === 'video') { tag = 'Videos'; category = 'Videos'; }
            else if (content.includes('#Photos') || content.includes('#photo') || (mediaUrl && mediaType === 'image')) { tag = 'Photos'; category = 'Photos'; }
            else if (content.includes('#CampusGossip') || content.includes('#gossip')) { tag = 'Campus Gossip'; category = 'Campus Gossip'; }

            // Clean visible content (remove internal hashtag suffixes if appended)
            const cleanContent = content.replace(/\s*#\[TRYBE_TAG:[^\]]+\]\s*$/, '').trim();

            return {
              id: p.id,
              authorId: author?.username || 'user',
              authorName: author?.display_name || 'Anonymous Student',
              authorAvatar: author?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
              authorMajor: author?.major || 'GLA Student',
              createdAt: formatRelativeTime(p.created_at),
              tag,
              category,
              content: cleanContent,
              image: mediaType === 'image' || (!mediaType && mediaUrl) ? mediaUrl : undefined,
              video: mediaType === 'video' ? mediaUrl : undefined,
              mediaType: mediaType || (mediaUrl ? 'image' : undefined),
              likes: p.reactions_count || 0,
              liked: false,
              commentsCount: p.comments_count || 0,
            };
          });

          return send(res, 200, { success: true, posts });
        } catch (err) {
          console.error('[PostProxy] GET exception:', err);
          return send(res, 500, { error: 'internal_error' });
        }
      })();
      return;
    }

    // ── POST: Insert new post into Supabase ──
    if (req.method === 'POST') {
      void (async () => {
        const raw = await readBody(req);
        if (!raw) return send(res, 400, { error: 'empty_body' });

        let body: {
          content?: string;
          tag?: string;
          category?: string;
          image?: string;
          video?: string;
          mediaType?: 'image' | 'video';
          authorName?: string;
          authorAvatar?: string;
          authorUsername?: string;
          authorMajor?: string;
          authorId?: string;
        };

        try {
          body = JSON.parse(raw);
        } catch {
          return send(res, 400, { error: 'invalid_json' });
        }

        if (!body.content && !body.image && !body.video) {
          return send(res, 400, { error: 'post_empty' });
        }

        try {
          // 1. Resolve or create author profile in Supabase
          let authorUuid = body.authorId;
          const isValidUuid = typeof authorUuid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(authorUuid);

          if (!isValidUuid) {
            // Find an existing profile or default student profile
            const { data: existingProfiles } = await supabase
              .from('profiles')
              .select('id, username')
              .limit(5);

            if (existingProfiles && existingProfiles.length > 0) {
              const matched = body.authorUsername
                ? existingProfiles.find(p => p.username === body.authorUsername)
                : null;
              authorUuid = matched?.id || existingProfiles[0].id;
            } else {
              return send(res, 500, { error: 'no_author_profile_found' });
            }
          }

          // 2. Prepare content with tag metadata marker
          const tagMarker = body.tag ? ` #[TRYBE_TAG:${body.tag}]` : '';
          const finalContent = `${body.content || ''}${tagMarker}`.trim();

          // 3. Insert post into Supabase 'posts' table
          const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
              author_id: authorUuid,
              content: finalContent,
              visibility: 'public',
              status: 'published',
            })
            .select()
            .single();

          if (postError) {
            console.error('[PostProxy] Post insert error:', postError);
            return send(res, 500, { error: postError.message });
          }

          // 4. If media attached (photo or video), register in media_assets & link to post_media
          const mediaUrl = body.video || body.image;
          const isVideo = Boolean(body.video || body.mediaType === 'video');

          if (mediaUrl) {
            const { data: asset, error: assetErr } = await supabase
              .from('media_assets')
              .insert({
                owner_id: authorUuid,
                bucket: 'post-media',
                storage_path: mediaUrl,
                original_filename: isVideo ? 'video_post.mp4' : 'image_post.png',
                mime_type: isVideo ? 'video/mp4' : 'image/png',
                media_type: isVideo ? 'video' : 'image',
              })
              .select()
              .single();

            if (asset) {
              await supabase.from('post_media').insert({
                post_id: post.id,
                media_asset_id: asset.id,
                sort_order: 0,
              });
            } else if (assetErr) {
              console.warn('[PostProxy] media_assets insert note:', assetErr.message);
            }
          }

          return send(res, 200, {
            success: true,
            post: {
              id: post.id,
              authorId: body.authorUsername || 'user',
              authorName: body.authorName || 'Current Student',
              authorAvatar: body.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
              authorMajor: body.authorMajor || 'GLA Student',
              createdAt: 'Just now',
              tag: body.tag || 'General',
              category: body.category || 'General',
              content: body.content || '',
              image: body.image,
              video: body.video,
              mediaType: body.mediaType,
              likes: 0,
              liked: false,
              commentsCount: 0,
            },
          });
        } catch (err) {
          console.error('[PostProxy] POST exception:', err);
          return send(res, 500, { error: 'post_creation_failed' });
        }
      })();
      return;
    }

    return next();
  };

  return {
    name: 'trybe-post-proxy',
    config(_, { mode }) {
      env = loadEnv(mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}
