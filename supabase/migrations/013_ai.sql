-- ============================================================================
-- Migration 013: AI Conversations, Messages & Run Tracking
-- ============================================================================
-- Depends on: profiles table, ai_message_role enum, ai_run_status enum,
--             handle_updated_at() trigger function
-- ============================================================================
-- IMPORTANT: No secrets, API keys, or raw prompt templates are stored here.
-- The request_metadata / response_metadata columns must contain only
-- non-sensitive operational context (feature flags, version tags, etc.).
-- ============================================================================

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ai_conversations: A thread of AI messages scoped to a user + feature
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    feature         TEXT NOT NULL CHECK (
                        feature IN (
                            'copilot',
                            'mentor_summary',
                            'roadmap_gen',
                            'skill_gap',
                            'opportunity_match',
                            'general'
                        )
                    ),
    title           TEXT CHECK (length(title) <= 200),
    is_active       BOOLEAN DEFAULT true,
    message_count   INT DEFAULT 0 CHECK (message_count >= 0),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.ai_conversations IS 'Tracks AI chat threads per user and feature';

-- ----------------------------------------------------------------------------
-- ai_messages: Individual turns in an AI conversation
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role                ai_message_role NOT NULL,
    content             TEXT NOT NULL,
    structured_response JSONB,                                  -- parsed / structured AI output
    source              TEXT,                                   -- which AI feature produced this
    model               TEXT,                                   -- model name / version
    is_error            BOOLEAN DEFAULT false,
    error_message       TEXT,
    token_usage         JSONB,                                  -- { prompt_tokens, completion_tokens, total_tokens }
    latency_ms          INT,
    created_at          TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.ai_messages IS 'Messages within AI conversations (user prompts, assistant replies, system messages)';
COMMENT ON COLUMN public.ai_messages.token_usage IS 'Token counts — never store actual prompt text here';

-- ----------------------------------------------------------------------------
-- ai_runs: Audit / observability log for every AI invocation
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    feature             TEXT NOT NULL,                           -- 'copilot', 'roadmap_gen', etc.
    conversation_id     UUID REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
    status              ai_run_status DEFAULT 'pending',
    model               TEXT,
    prompt_version      TEXT,                                   -- tracks which prompt template version was used
    request_metadata    JSONB DEFAULT '{}',                     -- NON-SENSITIVE request context only
    response_metadata   JSONB DEFAULT '{}',                     -- NON-SENSITIVE response metadata only
    token_usage         JSONB,
    latency_ms          INT,
    error_type          TEXT,
    error_message       TEXT,
    created_at          TIMESTAMPTZ DEFAULT now(),
    completed_at        TIMESTAMPTZ
);

COMMENT ON TABLE public.ai_runs IS 'Audit trail for AI feature invocations — no secrets or raw prompts';
COMMENT ON COLUMN public.ai_runs.request_metadata IS 'Non-sensitive context only (feature flags, entity IDs). Never store raw prompts.';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ai_conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id
    ON public.ai_conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_feature
    ON public.ai_conversations (user_id, feature);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_active
    ON public.ai_conversations (user_id, is_active);

-- ai_messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id
    ON public.ai_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_timeline
    ON public.ai_messages (conversation_id, created_at);

-- ai_runs
CREATE INDEX IF NOT EXISTS idx_ai_runs_user_id
    ON public.ai_runs (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_feature
    ON public.ai_runs (feature);
CREATE INDEX IF NOT EXISTS idx_ai_runs_status
    ON public.ai_runs (status);
CREATE INDEX IF NOT EXISTS idx_ai_runs_created_at
    ON public.ai_runs (created_at);

-- ============================================================================
-- TRIGGERS — updated_at
-- ============================================================================

CREATE OR REPLACE TRIGGER set_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_runs          ENABLE ROW LEVEL SECURITY;

-- ---- ai_conversations -------------------------------------------------------

CREATE POLICY "Users can view own AI conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations"
    ON public.ai_conversations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI conversations"
    ON public.ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- ---- ai_messages ------------------------------------------------------------

-- Users can read messages in their own conversations
CREATE POLICY "Users can view own AI messages"
    ON public.ai_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations ac
            WHERE ac.id = ai_messages.conversation_id
              AND ac.user_id = auth.uid()
        )
    );

-- Users can insert messages into their own conversations
CREATE POLICY "Users can insert AI messages"
    ON public.ai_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations ac
            WHERE ac.id = conversation_id
              AND ac.user_id = auth.uid()
        )
    );

-- No UPDATE or DELETE by users — AI messages are append-only.
-- Service-role can still modify if needed.

-- ---- ai_runs ----------------------------------------------------------------

-- Users can view their own run history
CREATE POLICY "Users can view own AI runs"
    ON public.ai_runs FOR SELECT
    USING (auth.uid() = user_id);

-- Runs are typically created server-side (service_role).
-- Allow insert if the user matches, for client-initiated tracking.
CREATE POLICY "Users can insert own AI runs"
    ON public.ai_runs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own runs (e.g. marking as cancelled)
CREATE POLICY "Users can update own AI runs"
    ON public.ai_runs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
