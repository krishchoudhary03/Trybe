-- =============================================================================
-- TRYBE Migration 005: Colleges
-- =============================================================================
-- Tables created:
--   • colleges         – institutional directory
--   • college_members  – user ↔ college membership with roles
--
-- Deferred FK constraints added:
--   • user_education.college_id → colleges(id)
--   • posts.college_id          → colleges(id)
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. colleges
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.colleges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,
  short_name        TEXT,
  university        TEXT,
  location_city     TEXT,
  location_state    TEXT,
  location_country  TEXT NOT NULL DEFAULT 'India',
  description       TEXT,
  website           TEXT,
  image_url         TEXT,
  cover_image_url   TEXT,
  established_year  INT,
  student_count     INT NOT NULL DEFAULT 0
                      CONSTRAINT chk_student_count_non_neg
                      CHECK (student_count >= 0),
  is_verified       BOOLEAN NOT NULL DEFAULT false,
  metadata          JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fuzzy search on college name
CREATE INDEX IF NOT EXISTS idx_colleges_name_trgm
  ON public.colleges USING gin (name public.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_colleges_location_state
  ON public.colleges (location_state);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_colleges_updated_at ON public.colleges;
CREATE TRIGGER set_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 2. college_members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.college_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id  UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'student'
                CONSTRAINT chk_college_member_role
                CHECK (role IN ('student', 'alumni', 'faculty', 'admin', 'moderator')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_college_member
    UNIQUE (college_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_college_members_user
  ON public.college_members (user_id);

CREATE INDEX IF NOT EXISTS idx_college_members_college
  ON public.college_members (college_id);


-- ---------------------------------------------------------------------------
-- 3. Add deferred FK: user_education → colleges
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_user_education_college'
      AND table_schema = 'public'
      AND table_name = 'user_education'
  ) THEN
    ALTER TABLE public.user_education
      ADD CONSTRAINT fk_user_education_college
      FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE SET NULL;
  END IF;
END $$;


-- ---------------------------------------------------------------------------
-- 4. Add deferred FK: posts → colleges
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_posts_college'
      AND table_schema = 'public'
      AND table_name = 'posts'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT fk_posts_college
      FOREIGN KEY (college_id) REFERENCES public.colleges(id) ON DELETE SET NULL;
  END IF;
END $$;
