import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv, type Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';

/**
 * TRYBE Media Upload Proxy
 * Handles uploading photos and videos to Supabase Storage (post-media bucket).
 * Uses SUPABASE_SERVICE_ROLE_KEY server-side so keys are never exposed to the browser.
 */

const MAX_UPLOAD_BYTES = 30 * 1024 * 1024; // 30 MB

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
      if (size > MAX_UPLOAD_BYTES) {
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

export function trybeMediaProxy(): Plugin {
  let env: Record<string, string> = {};

  const getSupabase = () => {
    const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!url || !key) return null;
    return createClient(url, key);
  };

  const handler = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const path = (req.url ?? '/').split('?')[0];
    if (req.method !== 'POST' || (path !== '/' && path !== '')) return next();

    void (async () => {
      const supabase = getSupabase();
      if (!supabase) {
        return send(res, 503, { error: 'supabase_not_configured' });
      }

      const raw = await readBody(req);
      if (!raw) {
        return send(res, 413, { error: 'file_too_large' });
      }

      let body: {
        filename?: string;
        mimeType?: string;
        base64?: string;
        ownerId?: string;
      };

      try {
        body = JSON.parse(raw);
      } catch {
        return send(res, 400, { error: 'invalid_json' });
      }

      if (!body.base64 || !body.mimeType) {
        return send(res, 400, { error: 'missing_media_data' });
      }

      try {
        const base64Data = body.base64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const isVideo = body.mimeType.startsWith('video/');
        const ext = (body.filename?.split('.').pop() || (isVideo ? 'mp4' : 'png')).toLowerCase();
        const safeFilename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const storagePath = `posts/${safeFilename}`;

        // Upload to Supabase Storage 'post-media' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(storagePath, buffer, {
            contentType: body.mimeType,
            upsert: true,
          });

        if (uploadError) {
          console.error('[MediaProxy] Storage upload error:', uploadError);
          return send(res, 500, { error: uploadError.message });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('post-media')
          .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // Register in media_assets if ownerId provided
        let assetId: string | null = null;
        if (body.ownerId) {
          const { data: assetData } = await supabase
            .from('media_assets')
            .insert({
              owner_id: body.ownerId,
              bucket: 'post-media',
              storage_path: storagePath,
              original_filename: body.filename || safeFilename,
              mime_type: body.mimeType,
              media_type: isVideo ? 'video' : 'image',
              size_bytes: buffer.length,
            })
            .select('id')
            .single();

          if (assetData) assetId = assetData.id;
        }

        return send(res, 200, {
          success: true,
          publicUrl,
          storagePath,
          assetId,
        });
      } catch (err) {
        console.error('[MediaProxy] Upload processing error:', err);
        return send(res, 500, { error: 'upload_failed' });
      }
    })();
  };

  return {
    name: 'trybe-media-proxy',
    config(_, { mode }) {
      env = loadEnv(mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use('/api/media/upload', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/media/upload', handler);
    },
  };
}
