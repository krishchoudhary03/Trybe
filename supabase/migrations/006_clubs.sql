-- =============================================================================
-- TRYBE Migration 006: Clubs
-- =============================================================================
-- Tables created:
--   • clubs         – student organisations / interest groups
--   • club_members  – user ↔ club membership with roles
--
-- Deferred FK constraint added:
--   • posts.club_id → clubs(id)
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. clubs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clubs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL
                        CONSTRAINT chk_club_slug_format
                        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description         TEXT
                        CONSTRAINT chk_club_description_length
                        CHECK (char_length(description) <= 2000),
  short_description   TEXT
                        CONSTRAINT chk_club_short_desc_length
                        CHECK (char_length(short_description) <= 200),
  category            TEXT,
  college_id          UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  image_url           TEXT,
  cover_image_url     TEXT,
  join_policy         public.club_join_policy NOT NULL DEFAULT 'open',
  is_active           BOOLEAN NOT NULL DEFAULT true,
  member_count        INT NOT NULL DEFAULT 0
                        CONSTRAINT chk_member_count_non_neg
                        CHECK (member_count >= 0),
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Same club name is allowed at different colleges
  CONSTRAINT uq_club_name_per_college
    UNIQUE (name, college_id)
);

CREATE INDEX IF NOT EXISTS idx_clubs_college
  ON public.clubs (college_id);

CREATE INDEX IF NOT EXISTS idx_clubs_category
  ON public.clubs (category);

CREATE INDEX IF NOT EXISTS idx_clubs_name_trgm
  ON public.clubs USING gin (name public.gin_trgm_ops);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_clubs_updated_at ON public.clubs;
CREATE TRIGGER set_clubs_updated_at
  BEFORE UPDATE ON public.clubs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 2. club_members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.club_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        public.club_member_role NOT NULL DEFAULT 'member',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_club_member
    UNIQUE (club_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_club_members_user
  ON public.club_members (user_id);

CREATE INDEX IF NOT EXISTS idx_club_members_club
  ON public.club_members (club_id);

-- Find admins / owners of a club quickly
CREATE INDEX IF NOT EXISTS idx_club_members_club_role
  ON public.club_members (club_id, role);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_club_members_updated_at ON public.club_members;
CREATE TRIGGER set_club_members_updated_at
  BEFORE UPDATE ON public.club_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 3. Add deferred FK: posts → clubs
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_posts_club'
      AND table_schema = 'public'
      AND table_name = 'posts'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT fk_posts_club
      FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE SET NULL;
  END IF;
END $$;
