-- ============================================================================
-- Migration 012: Media Assets, Post Media & Supabase Storage Buckets/Policies
-- ============================================================================
-- Depends on: profiles table, posts table, media_type enum,
--             conversation_members table (for chat-media storage policy)
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- media_assets: Central registry of every uploaded file
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    bucket              TEXT NOT NULL,
    storage_path        TEXT NOT NULL,                           -- path within the bucket
    original_filename   TEXT,
    mime_type           TEXT,
    size_bytes          BIGINT CHECK (size_bytes IS NULL OR size_bytes > 0),
    width               INT CHECK (width IS NULL OR width > 0),
    height              INT CHECK (height IS NULL OR height > 0),
    duration_seconds    NUMERIC(10,2) CHECK (duration_seconds IS NULL OR duration_seconds > 0),
    media_type          media_type NOT NULL,
    checksum            TEXT,                                   -- SHA-256 or similar
    alt_text            TEXT CHECK (length(alt_text) <= 500),
    metadata            JSONB DEFAULT '{}',                     -- EXIF, processing, variants
    created_at          TIMESTAMPTZ DEFAULT now(),
    deleted_at          TIMESTAMPTZ,

    UNIQUE (bucket, storage_path)
);

COMMENT ON TABLE public.media_assets IS 'Central registry for all uploaded media files';

-- ----------------------------------------------------------------------------
-- post_media: Join table linking posts to media assets (carousel support)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    media_asset_id  UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
    sort_order      INT NOT NULL DEFAULT 0,
    caption         TEXT CHECK (length(caption) <= 500),
    media_role      TEXT DEFAULT 'attachment' CHECK (media_role IN ('attachment', 'cover', 'thumbnail')),

    UNIQUE (post_id, media_asset_id),
    UNIQUE (post_id, sort_order)
);

COMMENT ON TABLE public.post_media IS 'Associates media assets with posts in a defined order';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- media_assets
CREATE INDEX IF NOT EXISTS idx_media_assets_owner_id
    ON public.media_assets (owner_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_media_type
    ON public.media_assets (media_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at
    ON public.media_assets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_not_deleted
    ON public.media_assets (deleted_at) WHERE deleted_at IS NULL;

-- post_media
CREATE INDEX IF NOT EXISTS idx_post_media_post_id
    ON public.post_media (post_id);
CREATE INDEX IF NOT EXISTS idx_post_media_media_asset_id
    ON public.post_media (media_asset_id);

-- ============================================================================
-- ROW LEVEL SECURITY — media_assets
-- ============================================================================

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Owner can view their own assets; public assets are discoverable via post_media
CREATE POLICY "Owner can view own media assets"
    ON public.media_assets FOR SELECT
    USING (auth.uid() = owner_id);

-- Authenticated users can view media linked to posts they can see
-- (The actual post-level visibility is enforced on the posts table.)
CREATE POLICY "Anyone can view media linked to posts"
    ON public.media_assets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.post_media pm
            WHERE pm.media_asset_id = media_assets.id
        )
    );

CREATE POLICY "Owner can insert media assets"
    ON public.media_assets FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can update own media assets"
    ON public.media_assets FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can delete own media assets"
    ON public.media_assets FOR DELETE
    USING (auth.uid() = owner_id);

-- ============================================================================
-- ROW LEVEL SECURITY — post_media
-- ============================================================================

ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

-- Anyone who can see the post can see its media links
CREATE POLICY "Post media is viewable by anyone"
    ON public.post_media FOR SELECT
    USING (true);  -- post-level visibility enforced on the posts table

-- Only the media owner (who should also be the post author) can link
CREATE POLICY "Post author can link media"
    ON public.post_media FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.media_assets ma
            WHERE ma.id = media_asset_id
              AND ma.owner_id = auth.uid()
        )
    );

CREATE POLICY "Post author can update post media"
    ON public.post_media FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.media_assets ma
            WHERE ma.id = post_media.media_asset_id
              AND ma.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.media_assets ma
            WHERE ma.id = media_asset_id
              AND ma.owner_id = auth.uid()
        )
    );

CREATE POLICY "Post author can remove post media"
    ON public.post_media FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.media_assets ma
            WHERE ma.id = post_media.media_asset_id
              AND ma.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- SUPABASE STORAGE — Bucket Creation
-- ============================================================================
-- NOTE: In Supabase, bucket creation is typically done via dashboard or API.
-- These INSERT statements work when run directly in the SQL Editor.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars',       'avatars',       true,  5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
    ('covers',        'covers',        true,  10485760, ARRAY['image/jpeg','image/png','image/webp']),
    ('post-media',    'post-media',    true,  52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']),
    ('chat-media',    'chat-media',    false, 52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    ('project-media', 'project-media', true,  52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4']),
    ('documents',     'documents',     false, 20971520, ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain']),
    ('certificates',  'certificates',  false, 10485760, ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
    ('event-media',   'event-media',   true,  10485760, ARRAY['image/jpeg','image/png','image/webp']),
    ('club-media',    'club-media',    true,  10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUPABASE STORAGE — Policies on storage.objects
-- ============================================================================
-- Supabase storage policies are standard RLS policies on storage.objects.
-- Key functions:
--   storage.foldername(name) → TEXT[]   (path segments excluding filename)
--   bucket_id                           (the bucket the object belongs to)
--   name                                (full object path including filename)
--   auth.uid()                          (current authenticated user's UUID)
-- ============================================================================

-- ============================================================================
-- AVATARS (public bucket)
-- ============================================================================

-- Anyone can view avatars (public bucket — Supabase serves without policy
-- check for public buckets on GET, but we add the policy for completeness).
CREATE POLICY "Avatars are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Users can upload to their own folder: avatars/{user_id}/...
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- COVERS (public bucket)
-- ============================================================================

CREATE POLICY "Covers are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'covers');

CREATE POLICY "Users can upload own cover"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'covers'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own cover"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own cover"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'covers'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- POST-MEDIA (public bucket)
-- Path convention: post-media/{user_id}/{post_id}/filename
-- ============================================================================

CREATE POLICY "Post media is publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'post-media');

CREATE POLICY "Users can upload own post media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'post-media'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own post media"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'post-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'post-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own post media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'post-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- CHAT-MEDIA (private bucket)
-- Path convention: chat-media/{conversation_id}/{sender_id}/filename
-- Access requires active conversation membership.
-- ============================================================================

CREATE POLICY "Chat media visible to conversation members"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'chat-media'
        AND EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.user_id = auth.uid()
              AND cm.conversation_id = (storage.foldername(name))[1]::uuid
              AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Conversation members can upload chat media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'chat-media'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.user_id = auth.uid()
              AND cm.conversation_id = (storage.foldername(name))[1]::uuid
              AND cm.left_at IS NULL
        )
    );

-- Only the uploader (sender) can update their own chat media
CREATE POLICY "Sender can update own chat media"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'chat-media'
        AND (storage.foldername(name))[2] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'chat-media'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

CREATE POLICY "Sender can delete own chat media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'chat-media'
        AND (storage.foldername(name))[2] = auth.uid()::text
    );

-- ============================================================================
-- PROJECT-MEDIA (public bucket)
-- ============================================================================

CREATE POLICY "Project media is publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'project-media');

CREATE POLICY "Users can upload own project media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'project-media'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own project media"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'project-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'project-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own project media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'project-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- EVENT-MEDIA (public bucket)
-- ============================================================================

CREATE POLICY "Event media is publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-media');

CREATE POLICY "Users can upload own event media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'event-media'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own event media"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'event-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'event-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own event media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'event-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- CLUB-MEDIA (public bucket)
-- ============================================================================

CREATE POLICY "Club media is publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'club-media');

CREATE POLICY "Users can upload own club media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'club-media'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own club media"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'club-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'club-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own club media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'club-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- DOCUMENTS (private bucket)
-- ============================================================================

CREATE POLICY "Owner can view own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own documents"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================================================
-- CERTIFICATES (private bucket) — same pattern as documents
-- ============================================================================

CREATE POLICY "Owner can view own certificates"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'certificates'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can upload own certificates"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'certificates'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update own certificates"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'certificates'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'certificates'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own certificates"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'certificates'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
