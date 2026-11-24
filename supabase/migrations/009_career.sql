-- ============================================================================
-- 009_career.sql
-- Career module: skills, career profiles, goals, roles, certifications,
-- assessments, roadmaps, opportunities, mentoring
-- Depends on: profiles, pg_trgm extension,
--             experience_level, skill_source, goal_status, goal_priority,
--             task_status, opportunity_type, opportunity_user_status,
--             mentor_session_status enums,
--             handle_updated_at() trigger function
-- ============================================================================

-- ==========================================================================
-- SKILLS & SKILL ALIASES
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Table: skills (canonical skill registry)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL UNIQUE CHECK (length(name) BETWEEN 1 AND 100),
    category        TEXT,           -- e.g., 'programming', 'soft_skill', 'tool', 'framework'
    description     TEXT,
    is_canonical    BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- GIN trigram index for fuzzy search on skill name
CREATE INDEX IF NOT EXISTS idx_skills_name_trgm
    ON public.skills USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_skills_category
    ON public.skills (category);

-- --------------------------------------------------------------------------
-- Table: skill_aliases
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_aliases (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id    UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    alias       TEXT NOT NULL UNIQUE CHECK (length(alias) BETWEEN 1 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_skill_aliases_skill_id
    ON public.skill_aliases (skill_id);

-- --------------------------------------------------------------------------
-- Table: user_skills
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id    UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    level       experience_level DEFAULT 'beginner',
    proficiency INT CHECK (proficiency IS NULL OR (proficiency >= 0 AND proficiency <= 100)),
    source      skill_source DEFAULT 'manual',
    is_verified BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_user_skills_user_skill UNIQUE (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id
    ON public.user_skills (user_id);

CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id
    ON public.user_skills (skill_id);

-- updated_at trigger
CREATE TRIGGER trg_user_skills_updated_at
    BEFORE UPDATE ON public.user_skills
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================================
-- CAREER PROFILES, TARGET ROLES & INDUSTRIES, GOALS
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Table: career_profiles
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    experience_level        experience_level DEFAULT 'beginner',
    weekly_learning_hours   NUMERIC(4,1) DEFAULT 0
                            CHECK (weekly_learning_hours >= 0 AND weekly_learning_hours <= 168),
    preferred_work_mode     TEXT CHECK (preferred_work_mode IS NULL OR preferred_work_mode IN (
                                'remote', 'onsite', 'hybrid'
                            )),
    preferred_locations     TEXT[] DEFAULT '{}',
    learning_preferences    JSONB DEFAULT '[]',     -- flexible array of learning style preferences
    career_interests        JSONB DEFAULT '[]',     -- flexible array of interest strings
    career_readiness_score  NUMERIC(5,2)
                            CHECK (career_readiness_score IS NULL OR (
                                career_readiness_score >= 0 AND career_readiness_score <= 100
                            )),
    last_assessment_at      TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);

-- user_id already has UNIQUE index; no extra index needed

-- updated_at trigger
CREATE TRIGGER trg_career_profiles_updated_at
    BEFORE UPDATE ON public.career_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: career_target_roles
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_target_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_name   TEXT NOT NULL CHECK (length(role_name) BETWEEN 1 AND 200),
    priority    INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_career_target_roles_user_role UNIQUE (user_id, role_name)
);

CREATE INDEX IF NOT EXISTS idx_career_target_roles_user_id
    ON public.career_target_roles (user_id);

-- --------------------------------------------------------------------------
-- Table: career_target_industries
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_target_industries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    industry    TEXT NOT NULL CHECK (length(industry) BETWEEN 1 AND 200),
    created_at  TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_career_target_industries_user_industry UNIQUE (user_id, industry)
);

CREATE INDEX IF NOT EXISTS idx_career_target_industries_user_id
    ON public.career_target_industries (user_id);

-- --------------------------------------------------------------------------
-- Table: career_goals
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_goals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description     TEXT,
    target_date     DATE,
    status          goal_status DEFAULT 'active',
    priority        goal_priority DEFAULT 'medium',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_career_goals_user_id
    ON public.career_goals (user_id);

CREATE INDEX IF NOT EXISTS idx_career_goals_user_status
    ON public.career_goals (user_id, status);

-- updated_at trigger
CREATE TRIGGER trg_career_goals_updated_at
    BEFORE UPDATE ON public.career_goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================================
-- CANONICAL CAREER ROLES & ROLE-SKILL MAPPING
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Table: career_roles (canonical role definitions)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_roles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL UNIQUE CHECK (length(title) BETWEEN 1 AND 200),
    slug                TEXT UNIQUE NOT NULL,
    summary             TEXT,
    description         TEXT,
    industries          TEXT[] DEFAULT '{}',
    experience_level    experience_level,
    avg_salary_range    JSONB,              -- { min, max, currency }
    growth_outlook      TEXT,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- GIN trigram index for fuzzy search on role title
CREATE INDEX IF NOT EXISTS idx_career_roles_title_trgm
    ON public.career_roles USING GIN (title gin_trgm_ops);

-- updated_at trigger
CREATE TRIGGER trg_career_roles_updated_at
    BEFORE UPDATE ON public.career_roles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: career_role_skills
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_role_skills (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id                 UUID NOT NULL REFERENCES public.career_roles(id) ON DELETE CASCADE,
    skill_id                UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    is_required             BOOLEAN DEFAULT true,   -- required vs recommended
    proficiency_required    INT CHECK (proficiency_required IS NULL OR (
                                proficiency_required >= 0 AND proficiency_required <= 100
                            )),
    created_at              TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_career_role_skills_role_skill UNIQUE (role_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_career_role_skills_role_id
    ON public.career_role_skills (role_id);

CREATE INDEX IF NOT EXISTS idx_career_role_skills_skill_id
    ON public.career_role_skills (skill_id);

-- ==========================================================================
-- CERTIFICATIONS
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Table: certifications (canonical certifications)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 300),
    issuer      TEXT NOT NULL CHECK (length(issuer) BETWEEN 1 AND 200),
    description TEXT,
    url         TEXT,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_certifications_name_issuer UNIQUE (name, issuer)
);

CREATE INDEX IF NOT EXISTS idx_certifications_name_trgm
    ON public.certifications USING GIN (name gin_trgm_ops);

-- --------------------------------------------------------------------------
-- Table: user_certifications
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_certifications (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    certification_id        UUID REFERENCES public.certifications(id) ON DELETE SET NULL,
    custom_name             TEXT,           -- if cert not in canonical table
    custom_issuer           TEXT,
    credential_id           TEXT,
    issue_date              DATE,
    expiration_date         DATE,
    verification_url        TEXT,
    certificate_file_url    TEXT,
    is_verified             BOOLEAN DEFAULT false,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT chk_user_certifications_source CHECK (
        certification_id IS NOT NULL
        OR (custom_name IS NOT NULL AND custom_issuer IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id
    ON public.user_certifications (user_id);

-- updated_at trigger
CREATE TRIGGER trg_user_certifications_updated_at
    BEFORE UPDATE ON public.user_certifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: certification_skills
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certification_skills (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certification_id    UUID NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
    skill_id            UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,

    CONSTRAINT uq_certification_skills_cert_skill UNIQUE (certification_id, skill_id)
);

-- ==========================================================================
-- ASSESSMENTS
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Table: assessments
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id            UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    assessment_type     TEXT DEFAULT 'quiz' CHECK (assessment_type IN (
                            'quiz', 'project', 'peer_review', 'self', 'ai', 'mentor'
                        )),
    score               NUMERIC(5,2) CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    max_score           NUMERIC(5,2) DEFAULT 100,
    source              TEXT DEFAULT 'platform',
    attempt_number      INT DEFAULT 1 CHECK (attempt_number > 0),
    metadata            JSONB DEFAULT '{}',     -- flexible: answers, rubric, etc.
    taken_at            TIMESTAMPTZ DEFAULT now(),
    created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id
    ON public.assessments (user_id);

CREATE INDEX IF NOT EXISTS idx_assessments_skill_id
    ON public.assessments (skill_id)
    WHERE skill_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assessments_user_skill
    ON public.assessments (user_id, skill_id);

CREATE INDEX IF NOT EXISTS idx_assessments_taken_at
    ON public.assessments (taken_at);

-- ==========================================================================
-- CAREER ROADMAPS, PHASES, TASKS, DEPENDENCIES, ADAPTATIONS
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Table: career_roadmaps
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_roadmaps (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_role         TEXT NOT NULL,
    target_role_id      UUID REFERENCES public.career_roles(id) ON DELETE SET NULL,
    title               TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description         TEXT,
    is_active           BOOLEAN DEFAULT true,
    estimated_weeks     INT CHECK (estimated_weeks IS NULL OR estimated_weeks > 0),
    progress_pct        NUMERIC(5,2) DEFAULT 0
                        CHECK (progress_pct >= 0 AND progress_pct <= 100),
    source              TEXT DEFAULT 'engine' CHECK (source IN ('engine', 'ai', 'mentor', 'manual')),
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_user_id
    ON public.career_roadmaps (user_id);

CREATE INDEX IF NOT EXISTS idx_career_roadmaps_user_active
    ON public.career_roadmaps (user_id, is_active);

-- updated_at trigger
CREATE TRIGGER trg_career_roadmaps_updated_at
    BEFORE UPDATE ON public.career_roadmaps
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: roadmap_phases
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmap_phases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id          UUID NOT NULL REFERENCES public.career_roadmaps(id) ON DELETE CASCADE,
    title               TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description         TEXT,
    sort_order          INT NOT NULL DEFAULT 0,
    estimated_weeks     INT,
    status              task_status DEFAULT 'not_started',
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_roadmap_phases_roadmap_order UNIQUE (roadmap_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_phases_roadmap_id
    ON public.roadmap_phases (roadmap_id);

-- updated_at trigger
CREATE TRIGGER trg_roadmap_phases_updated_at
    BEFORE UPDATE ON public.roadmap_phases
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: roadmap_tasks
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id          UUID NOT NULL REFERENCES public.career_roadmaps(id) ON DELETE CASCADE,
    phase_id            UUID NOT NULL REFERENCES public.roadmap_phases(id) ON DELETE CASCADE,
    skill_id            UUID REFERENCES public.skills(id) ON DELETE SET NULL,
    title               TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
    description         TEXT,
    sort_order          INT NOT NULL DEFAULT 0,
    tier                INT DEFAULT 1 CHECK (tier BETWEEN 1 AND 5),
    origin              TEXT DEFAULT 'engine' CHECK (origin IN ('engine', 'ai', 'mentor', 'manual')),
    estimated_hours     NUMERIC(6,1) CHECK (estimated_hours IS NULL OR estimated_hours > 0),
    status              task_status DEFAULT 'not_started',
    skill_gain          NUMERIC(5,2) CHECK (skill_gain IS NULL OR (
                            skill_gain >= 0 AND skill_gain <= 100
                        )),
    resource_url        TEXT,
    notes               TEXT,
    due_date            DATE,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_roadmap_id
    ON public.roadmap_tasks (roadmap_id);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_phase_id
    ON public.roadmap_tasks (phase_id);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_skill_id
    ON public.roadmap_tasks (skill_id)
    WHERE skill_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_status
    ON public.roadmap_tasks (status);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_roadmap_status
    ON public.roadmap_tasks (roadmap_id, status);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_due_date_pending
    ON public.roadmap_tasks (due_date)
    WHERE due_date IS NOT NULL AND status != 'completed';

-- updated_at trigger
CREATE TRIGGER trg_roadmap_tasks_updated_at
    BEFORE UPDATE ON public.roadmap_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: roadmap_task_dependencies
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmap_task_dependencies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID NOT NULL REFERENCES public.roadmap_tasks(id) ON DELETE CASCADE,
    depends_on_task_id  UUID NOT NULL REFERENCES public.roadmap_tasks(id) ON DELETE CASCADE,

    CONSTRAINT uq_roadmap_task_deps UNIQUE (task_id, depends_on_task_id),
    CONSTRAINT chk_no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- --------------------------------------------------------------------------
-- Table: roadmap_adaptations
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmap_adaptations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id      UUID NOT NULL REFERENCES public.career_roadmaps(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,              -- e.g., 'assessment_completed', 'skill_updated', 'goal_changed'
    description     TEXT,
    changes         JSONB DEFAULT '{}',         -- what was changed
    source          TEXT DEFAULT 'engine',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_adaptations_roadmap_id
    ON public.roadmap_adaptations (roadmap_id);

CREATE INDEX IF NOT EXISTS idx_roadmap_adaptations_created_at
    ON public.roadmap_adaptations (created_at);

-- ==========================================================================
-- OPPORTUNITIES
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Table: opportunities
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
    organization        TEXT CHECK (length(organization) <= 200),
    description         TEXT,
    opportunity_type    opportunity_type NOT NULL,
    experience_level    experience_level,
    location            TEXT,
    is_remote           BOOLEAN DEFAULT false,
    url                 TEXT,
    internal_path       TEXT,                       -- in-app route if internal
    source              TEXT DEFAULT 'platform',
    deadline            TIMESTAMPTZ,
    posted_at           TIMESTAMPTZ DEFAULT now(),
    salary_range        JSONB,                      -- { min, max, currency, period }
    tags                TEXT[] DEFAULT '{}',
    roles               TEXT[] DEFAULT '{}',
    is_active           BOOLEAN DEFAULT true,
    is_featured         BOOLEAN DEFAULT false,
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_type
    ON public.opportunities (opportunity_type);

CREATE INDEX IF NOT EXISTS idx_opportunities_experience
    ON public.opportunities (experience_level)
    WHERE experience_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_opportunities_deadline
    ON public.opportunities (deadline)
    WHERE deadline IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_opportunities_is_active
    ON public.opportunities (is_active);

CREATE INDEX IF NOT EXISTS idx_opportunities_created_at
    ON public.opportunities (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_opportunities_title_trgm
    ON public.opportunities USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_opportunities_tags
    ON public.opportunities USING GIN (tags);

-- updated_at trigger
CREATE TRIGGER trg_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: opportunity_skills
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunity_skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id  UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    skill_id        UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    is_required     BOOLEAN DEFAULT true,
    teaches         BOOLEAN DEFAULT false,      -- does this opportunity teach the skill?

    CONSTRAINT uq_opportunity_skills_opp_skill UNIQUE (opportunity_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_skills_opportunity_id
    ON public.opportunity_skills (opportunity_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_skills_skill_id
    ON public.opportunity_skills (skill_id);

-- --------------------------------------------------------------------------
-- Table: user_opportunity_status
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_opportunity_status (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opportunity_id  UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    status          opportunity_user_status NOT NULL DEFAULT 'saved',
    notes           TEXT,
    applied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_user_opportunity_status UNIQUE (user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_user_opportunity_status_user_id
    ON public.user_opportunity_status (user_id);

CREATE INDEX IF NOT EXISTS idx_user_opportunity_status_opportunity_id
    ON public.user_opportunity_status (opportunity_id);

CREATE INDEX IF NOT EXISTS idx_user_opportunity_status_user_status
    ON public.user_opportunity_status (user_id, status);

-- updated_at trigger
CREATE TRIGGER trg_user_opportunity_status_updated_at
    BEFORE UPDATE ON public.user_opportunity_status
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================================
-- MENTORING
-- ==========================================================================

-- --------------------------------------------------------------------------
-- Table: mentor_relationships
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mentor_relationships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentee_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    focus_areas     TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_mentor_relationships UNIQUE (mentor_id, mentee_id),
    CONSTRAINT chk_mentor_not_self CHECK (mentor_id != mentee_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_relationships_mentor_id
    ON public.mentor_relationships (mentor_id);

CREATE INDEX IF NOT EXISTS idx_mentor_relationships_mentee_id
    ON public.mentor_relationships (mentee_id);

-- updated_at trigger
CREATE TRIGGER trg_mentor_relationships_updated_at
    BEFORE UPDATE ON public.mentor_relationships
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: mentor_sessions
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mentor_sessions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id         UUID NOT NULL REFERENCES public.mentor_relationships(id) ON DELETE CASCADE,
    mentor_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentee_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title                   TEXT CHECK (length(title) <= 200),
    notes                   TEXT,
    scheduled_at            TIMESTAMPTZ,
    duration_minutes        INT CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    status                  mentor_session_status DEFAULT 'scheduled',
    ai_summary              TEXT,
    ai_recommendations      JSONB DEFAULT '[]',
    summary_source          TEXT CHECK (summary_source IS NULL OR summary_source IN (
                                'manual', 'ai', 'both'
                            )),
    metadata                JSONB DEFAULT '{}',
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_sessions_relationship_id
    ON public.mentor_sessions (relationship_id);

CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor_id
    ON public.mentor_sessions (mentor_id);

CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentee_id
    ON public.mentor_sessions (mentee_id);

CREATE INDEX IF NOT EXISTS idx_mentor_sessions_scheduled_at
    ON public.mentor_sessions (scheduled_at);

-- updated_at trigger
CREATE TRIGGER trg_mentor_sessions_updated_at
    BEFORE UPDATE ON public.mentor_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: mentor_session_action_items
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mentor_session_action_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES public.mentor_sessions(id) ON DELETE CASCADE,
    assigned_to     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title           TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 300),
    description     TEXT,
    due_date        DATE,
    is_completed    BOOLEAN DEFAULT false,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mentor_session_action_items_session_id
    ON public.mentor_session_action_items (session_id);

CREATE INDEX IF NOT EXISTS idx_mentor_session_action_items_assigned_to
    ON public.mentor_session_action_items (assigned_to)
    WHERE assigned_to IS NOT NULL;

-- updated_at trigger
CREATE TRIGGER trg_mentor_session_action_items_updated_at
    BEFORE UPDATE ON public.mentor_session_action_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
