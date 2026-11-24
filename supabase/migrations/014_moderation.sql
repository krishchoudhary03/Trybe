-- ============================================================================
-- Migration 014: Moderation — Reports, Actions & User Activity Log
-- ============================================================================
-- Depends on: profiles table, report_status enum, moderation_action enum,
--             handle_updated_at() trigger function
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- reports: User-submitted content/abuse reports
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type     TEXT NOT NULL CHECK (
                        target_type IN (
                            'user', 'post', 'comment', 'message',
                            'club', 'event', 'project'
                        )
                    ),
    target_id       UUID NOT NULL,                              -- polymorphic FK
    reason          TEXT NOT NULL CHECK (
                        reason IN (
                            'spam', 'harassment', 'hate_speech', 'violence',
                            'nudity', 'misinformation', 'impersonation',
                            'copyright', 'other'
                        )
                    ),
    description     TEXT CHECK (length(description) <= 2000),
    status          report_status DEFAULT 'pending',
    reviewed_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.reports IS 'User-submitted abuse / content reports';
COMMENT ON COLUMN public.reports.target_type IS 'Polymorphic: which entity type is being reported';
COMMENT ON COLUMN public.reports.target_id IS 'ID of the reported entity';

-- ----------------------------------------------------------------------------
-- moderation_actions: Actions taken by moderators
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.moderation_actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_user_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    target_type     TEXT NOT NULL CHECK (
                        target_type IN ('user', 'post', 'comment', 'message', 'club')
                    ),
    target_id       UUID NOT NULL,
    action          moderation_action NOT NULL,
    reason          TEXT CHECK (length(reason) <= 2000),
    report_id       UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    expires_at      TIMESTAMPTZ,                                -- for temporary actions (mute, suspend)
    created_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.moderation_actions IS 'Log of moderator actions (warn, mute, ban, content removal, etc.)';
COMMENT ON COLUMN public.moderation_actions.expires_at IS 'Non-null for temporary actions that auto-expire';

-- ----------------------------------------------------------------------------
-- user_activity_log: High-level user activity audit trail
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action      TEXT NOT NULL,                                  -- 'login', 'profile_updated', 'post_created', etc.
    entity_type TEXT,                                           -- 'post', 'comment', 'club', 'event', etc.
    entity_id   UUID,
    metadata    JSONB DEFAULT '{}',
    ip_address  INET,                                           -- store only if privacy policy allows
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.user_activity_log IS 'Audit trail for significant user actions';
COMMENT ON COLUMN public.user_activity_log.ip_address IS 'Only stored when permitted by privacy policy';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id
    ON public.reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_target
    ON public.reports (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status
    ON public.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at
    ON public.reports (created_at);

-- moderation_actions
CREATE INDEX IF NOT EXISTS idx_moderation_actions_moderator_id
    ON public.moderation_actions (moderator_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target_user_id
    ON public.moderation_actions (target_user_id) WHERE target_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target
    ON public.moderation_actions (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_report_id
    ON public.moderation_actions (report_id) WHERE report_id IS NOT NULL;

-- user_activity_log
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id
    ON public.user_activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_action
    ON public.user_activity_log (user_id, action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at
    ON public.user_activity_log (created_at);

-- ============================================================================
-- TRIGGERS — updated_at
-- ============================================================================

CREATE OR REPLACE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log    ENABLE ROW LEVEL SECURITY;

-- ---- reports ----------------------------------------------------------------

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON public.reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Authenticated users can submit reports
CREATE POLICY "Authenticated users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Reporters can update their own pending reports (e.g. add description)
CREATE POLICY "Reporters can update own pending reports"
    ON public.reports FOR UPDATE
    USING (
        auth.uid() = reporter_id
        AND status = 'pending'
    )
    WITH CHECK (
        auth.uid() = reporter_id
        AND status = 'pending'
    );

-- Note: Moderators review / resolve reports via service_role or a separate
-- admin RLS policy keyed on a moderator role (added when admin system is built).

-- ---- moderation_actions -----------------------------------------------------

-- Moderation actions are managed server-side via service_role.
-- Users who are targeted can see actions against them (transparency).
CREATE POLICY "Target users can view actions against them"
    ON public.moderation_actions FOR SELECT
    USING (auth.uid() = target_user_id);

-- Moderators can view their own actions
CREATE POLICY "Moderators can view own actions"
    ON public.moderation_actions FOR SELECT
    USING (auth.uid() = moderator_id);

-- INSERT / UPDATE / DELETE on moderation_actions is service_role only.
-- No client-side policies for write operations.

-- ---- user_activity_log ------------------------------------------------------

-- Users can view their own activity log
CREATE POLICY "Users can view own activity log"
    ON public.user_activity_log FOR SELECT
    USING (auth.uid() = user_id);

-- Activity log entries are created server-side (service_role) or by triggers.
-- Allow insert if the user matches (for client-reported events like login).
CREATE POLICY "Users can insert own activity"
    ON public.user_activity_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Activity logs are append-only. No UPDATE or DELETE from clients.
