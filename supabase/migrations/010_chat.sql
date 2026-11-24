-- ============================================================================
-- Migration 010: Chat & Messaging System
-- ============================================================================
-- Depends on: profiles table, conversation_type enum, message_delivery_status
--             enum, media_type enum, handle_updated_at() trigger function
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- conversations: Container for direct messages and group chats
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            conversation_type NOT NULL DEFAULT 'direct',
    title           TEXT CHECK (length(title) <= 200),          -- group chat title
    image_url       TEXT,                                       -- group chat avatar
    created_by      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message_at     TIMESTAMPTZ,
    last_message_preview TEXT CHECK (length(last_message_preview) <= 200),
    is_archived     BOOLEAN DEFAULT false,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.conversations IS 'Chat conversations (direct or group)';
COMMENT ON COLUMN public.conversations.type IS 'direct = 1-on-1, group = multi-party';
COMMENT ON COLUMN public.conversations.last_message_preview IS 'Denormalized preview of the latest message for listing';

-- ----------------------------------------------------------------------------
-- conversation_members: Membership + per-user state for each conversation
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role            TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    last_read_at    TIMESTAMPTZ,
    is_muted        BOOLEAN DEFAULT false,
    joined_at       TIMESTAMPTZ DEFAULT now(),
    left_at         TIMESTAMPTZ,                                -- NULL = still active

    UNIQUE (conversation_id, user_id)
);

COMMENT ON TABLE public.conversation_members IS 'Maps users to conversations with per-user settings';
COMMENT ON COLUMN public.conversation_members.left_at IS 'Non-null means the user has left the conversation';

-- ----------------------------------------------------------------------------
-- messages: Individual chat messages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content             TEXT CHECK (length(content) <= 10000),
    reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    is_edited           BOOLEAN DEFAULT false,
    is_system_message   BOOLEAN DEFAULT false,                  -- e.g. "X joined the group"
    metadata            JSONB DEFAULT '{}',                     -- link previews, special content
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now(),
    deleted_at          TIMESTAMPTZ                             -- soft-delete
);

COMMENT ON TABLE public.messages IS 'Chat messages within conversations';
COMMENT ON COLUMN public.messages.is_system_message IS 'True for auto-generated messages like join/leave events';

-- ----------------------------------------------------------------------------
-- message_attachments: Files attached to a message (stored in Supabase Storage)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_url        TEXT NOT NULL,                              -- public/signed Supabase Storage URL
    storage_path    TEXT NOT NULL,                              -- path within the storage bucket
    mime_type       TEXT,
    size_bytes      BIGINT CHECK (size_bytes IS NULL OR size_bytes > 0),
    media_type      media_type,
    width           INT,
    height          INT,
    duration_seconds NUMERIC(10,2),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.message_attachments IS 'File attachments linked to chat messages';

-- ----------------------------------------------------------------------------
-- message_reactions: Emoji reactions on messages
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id  UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    emoji       TEXT NOT NULL CHECK (length(emoji) BETWEEN 1 AND 20),
    created_at  TIMESTAMPTZ DEFAULT now(),

    UNIQUE (message_id, user_id, emoji)
);

COMMENT ON TABLE public.message_reactions IS 'Emoji reactions per message (one reaction type per user per message)';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- conversations
CREATE INDEX IF NOT EXISTS idx_conversations_created_by
    ON public.conversations (created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at
    ON public.conversations (last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_conversations_type
    ON public.conversations (type);

-- conversation_members
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id
    ON public.conversation_members (user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation_id
    ON public.conversation_members (conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user_active
    ON public.conversation_members (user_id, left_at);

-- messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
    ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id
    ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at
    ON public.messages (created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timeline
    ON public.messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_not_deleted
    ON public.messages (deleted_at) WHERE deleted_at IS NULL;

-- message_attachments
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id
    ON public.message_attachments (message_id);

-- message_reactions
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id
    ON public.message_reactions (message_id);

-- ============================================================================
-- TRIGGERS — updated_at
-- ============================================================================

CREATE OR REPLACE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.conversations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions     ENABLE ROW LEVEL SECURITY;

-- ---- conversations --------------------------------------------------------

-- Users can view conversations they belong to
CREATE POLICY "Members can view their conversations"
    ON public.conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversations.id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
        )
    );

-- Authenticated users can create conversations
CREATE POLICY "Authenticated users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Only conversation admin or creator can update
CREATE POLICY "Admin or creator can update conversation"
    ON public.conversations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversations.id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
              AND cm.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversations.id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
              AND cm.role = 'admin'
        )
    );

-- Only creator can delete a conversation
CREATE POLICY "Creator can delete conversation"
    ON public.conversations FOR DELETE
    USING (auth.uid() = created_by);

-- ---- conversation_members --------------------------------------------------

-- Members can see other members in their conversations
CREATE POLICY "Members can view conversation members"
    ON public.conversation_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversation_members.conversation_id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
        )
    );

-- Admins can add members; creators can add the initial membership
CREATE POLICY "Admins can add conversation members"
    ON public.conversation_members FOR INSERT
    WITH CHECK (
        -- The creator can add initial members (including themselves)
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
              AND c.created_by = auth.uid()
        )
        OR
        -- Existing admin can add new members
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversation_members.conversation_id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
              AND cm.role = 'admin'
        )
    );

-- Members can update their own membership (mute, read status, leave)
CREATE POLICY "Members can update own membership"
    ON public.conversation_members FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can remove members; members can remove themselves
CREATE POLICY "Admins or self can remove membership"
    ON public.conversation_members FOR DELETE
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversation_members.conversation_id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
              AND cm.role = 'admin'
        )
    );

-- ---- messages ---------------------------------------------------------------

-- Members of the conversation can read messages
CREATE POLICY "Members can view messages"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = messages.conversation_id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
        )
    );

-- Active members can send messages
CREATE POLICY "Members can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversation_id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
        )
    );

-- Sender can edit their own messages
CREATE POLICY "Sender can update own messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

-- Sender can delete (soft-delete) their own messages
CREATE POLICY "Sender can delete own messages"
    ON public.messages FOR DELETE
    USING (auth.uid() = sender_id);

-- ---- message_attachments ----------------------------------------------------

-- Viewable by conversation members
CREATE POLICY "Members can view message attachments"
    ON public.message_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
            WHERE m.id = message_attachments.message_id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
        )
    );

-- Sender of the parent message can attach files
CREATE POLICY "Sender can add attachments"
    ON public.message_attachments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_id
              AND m.sender_id = auth.uid()
        )
    );

-- Sender can delete their attachments
CREATE POLICY "Sender can delete attachments"
    ON public.message_attachments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            WHERE m.id = message_attachments.message_id
              AND m.sender_id = auth.uid()
        )
    );

-- ---- message_reactions ------------------------------------------------------

-- Conversation members can view reactions
CREATE POLICY "Members can view reactions"
    ON public.message_reactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
            WHERE m.id = message_reactions.message_id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
        )
    );

-- Members can react to messages in their conversations
CREATE POLICY "Members can add reactions"
    ON public.message_reactions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversation_members cm ON cm.conversation_id = m.conversation_id
            WHERE m.id = message_id
              AND cm.user_id = auth.uid()
              AND cm.left_at IS NULL
        )
    );

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
    ON public.message_reactions FOR DELETE
    USING (auth.uid() = user_id);
