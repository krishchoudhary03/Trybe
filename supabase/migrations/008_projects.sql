-- ============================================================================
-- 008_projects.sql
-- Projects, project members, project technologies
-- Depends on: profiles, colleges, posts, project_status & project_visibility
--             enums, handle_updated_at() trigger function
-- ============================================================================

-- --------------------------------------------------------------------------
-- Table: projects
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description         TEXT CHECK (length(description) <= 5000),
    owner_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id          UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    status              project_status DEFAULT 'idea',
    visibility          project_visibility DEFAULT 'public',
    project_type        TEXT CHECK (project_type IS NULL OR project_type IN (
                            'academic', 'personal', 'startup',
                            'open_source', 'research', 'hackathon', 'freelance'
                        )),
    campus_type         TEXT CHECK (campus_type IS NULL OR campus_type IN (
                            'on_campus', 'off_campus', 'hybrid'
                        )),
    team_size_required  INT CHECK (team_size_required IS NULL OR team_size_required > 0),
    team_size_current   INT DEFAULT 1 CHECK (team_size_current >= 0),
    deadline            TIMESTAMPTZ,
    repository_url      TEXT,
    live_url            TEXT,
    image_url           TEXT,
    tags                TEXT[] DEFAULT '{}',
    metadata            JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id
    ON public.projects (owner_id);

CREATE INDEX IF NOT EXISTS idx_projects_college_id
    ON public.projects (college_id)
    WHERE college_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projects_status
    ON public.projects (status);

CREATE INDEX IF NOT EXISTS idx_projects_created_at
    ON public.projects (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_not_deleted
    ON public.projects (deleted_at)
    WHERE deleted_at IS NULL;

-- updated_at trigger for projects
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: project_members
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role        TEXT DEFAULT 'member' CHECK (role IN ('owner', 'lead', 'member', 'contributor')),
    joined_at   TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_project_members_project_user UNIQUE (project_id, user_id)
);

-- Indexes for project_members
CREATE INDEX IF NOT EXISTS idx_project_members_user_id
    ON public.project_members (user_id);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id
    ON public.project_members (project_id);

-- --------------------------------------------------------------------------
-- Table: project_technologies
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_technologies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name        TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
    created_at  TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_project_technologies_project_name UNIQUE (project_id, name)
);

-- --------------------------------------------------------------------------
-- FK from posts to projects (posts.project_id column assumed to exist)
-- --------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_posts_project'
          AND table_schema = 'public'
          AND table_name = 'posts'
    ) THEN
        ALTER TABLE public.posts
            ADD CONSTRAINT fk_posts_project
            FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
    END IF;
END $$;
