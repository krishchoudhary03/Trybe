import { supabase } from '../lib/supabase';

export interface UploadResult {
  publicUrl: string;
  storagePath?: string;
  assetId?: string | null;
  source: 'supabase' | 'local';
}

export const mediaService = {
  /**
   * Uploads an image or video file to Supabase Storage ('post-media' bucket).
   * Falls back gracefully to local Data URL if network or storage is unreachable.
   */
  async uploadPostMedia(
    file: File,
    base64DataUrl: string,
    ownerId?: string,
  ): Promise<UploadResult> {
    try {
      // Get current authenticated user if ownerId not provided
      let currentOwnerId = ownerId;
      if (!currentOwnerId) {
        const { data: user } = await supabase.auth.getUser();
        currentOwnerId = user?.user?.id;
      }

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          base64: base64DataUrl,
          ownerId: currentOwnerId,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          publicUrl: string;
          storagePath?: string;
          assetId?: string | null;
        };
        if (data.publicUrl) {
          return {
            publicUrl: data.publicUrl,
            storagePath: data.storagePath,
            assetId: data.assetId,
            source: 'supabase',
          };
        }
      }
    } catch (err) {
      console.warn('[mediaService] Supabase upload failed, falling back to local media:', err);
    }

    // Fallback: return the local base64 Data URL so the UI always works
    return {
      publicUrl: base64DataUrl,
      source: 'local',
    };
  },
};
