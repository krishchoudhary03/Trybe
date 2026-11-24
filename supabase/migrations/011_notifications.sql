-- ============================================================================
-- Migration 011: Notifications
-- ============================================================================
-- Depends on: profiles table, notification_type enum
-- ============================================================================

-- ============================================================================
-- TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type            notification_type NOT NULL,
    title           TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    body            TEXT CHECK (length(body) <= 1000),
    entity_type     TEXT,           -- 'post', 'comment', 'club', 'event', 'message', 'connection', 'project', 'opportunity', 'roadmap'
    entity_id       UUID,           -- FK intentionally omitted: references many tables
    metadata        JSONB DEFAULT '{}',
    read_at         TIMESTAMPTZ,
    clicked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'In-app notifications delivered to users';
COMMENT ON COLUMN public.notifications.entity_type IS 'Polymorphic type of the related entity';
COMMENT ON COLUMN public.notifications.entity_id IS 'Polymorphic ID of the related entity';
COMMENT ON COLUMN public.notifications.read_at IS 'Set when user marks notification as read';
COMMENT ON COLUMN public.notifications.clicked_at IS 'Set when user taps/clicks through to the entity';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id
    ON public.notifications (recipient_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON public.notifications (recipient_id, read_at);

CREATE INDEX IF NOT EXISTS idx_notifications_feed
    ON public.notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_actor_id
    ON public.notifications (actor_id) WHERE actor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_entity_id
    ON public.notifications (entity_id) WHERE entity_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_type
    ON public.notifications (type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = recipient_id);

-- Notifications are created server-side (service_role) or by triggers.
-- Allow insert only when the authenticated user is the actor (for peer actions)
-- or via service role.  A SECURITY DEFINER function is the preferred path;
-- this policy is a safety net.
CREATE POLICY "System or actor can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        auth.uid() = actor_id
        OR actor_id IS NULL          -- system notifications have no actor
    );

-- Recipients can mark their own notifications as read / clicked
CREATE POLICY "Recipients can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- Recipients can delete (dismiss) their own notifications
CREATE POLICY "Recipients can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = recipient_id);
