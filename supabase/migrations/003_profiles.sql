-- =============================================================================
-- TRYBE Migration 003: Profiles & User Tables
-- =============================================================================
-- Core user identity tables:
--   • profiles          – public profile data, 1:1 with auth.users
--   • user_education    – education history (college FK deferred to 005)
--   • user_settings     – per-user preferences & privacy settings
--
-- Also creates:
--   • handle_updated_at()  – reusable trigger function for updated_at columns
--   • handle_new_user()    – auto-creates profile + settings on signup
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Reusable updated_at trigger function
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ---------------------------------------------------------------------------
-- 2. profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username            TEXT UNIQUE NOT NULL
                        CONSTRAINT chk_username_format
                        CHECK (username ~ '^[a-z0-9_]{3,30}$'),
  display_name        TEXT NOT NULL
                        CONSTRAINT chk_display_name_length
                        CHECK (char_length(display_name) BETWEEN 1 AND 100),
  first_name          TEXT,
  last_name           TEXT,
  bio                 TEXT
                        CONSTRAINT chk_bio_length
                        CHECK (char_length(bio) <= 500),
  headline            TEXT
                        CONSTRAINT chk_headline_length
                        CHECK (char_length(headline) <= 200),
  avatar_url          TEXT,
  cover_image_url     TEXT,
  location_country    TEXT,
  location_state      TEXT,
  location_city       TEXT,
  github_url          TEXT,
  linkedin_url        TEXT,
  portfolio_url       TEXT,
  profile_visibility  public.profile_visibility NOT NULL DEFAULT 'public',
  account_status      public.account_status     NOT NULL DEFAULT 'active',
  onboarding_status   public.onboarding_status  NOT NULL DEFAULT 'not_started',
  is_verified         BOOLEAN NOT NULL DEFAULT false,
  last_seen_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes (username UNIQUE already creates an implicit index)
CREATE INDEX IF NOT EXISTS idx_profiles_created_at
  ON public.profiles (created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_display_name_trgm
  ON public.profiles USING gin (display_name public.gin_trgm_ops);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 3. user_education
-- ---------------------------------------------------------------------------
-- NOTE: college_id FK to public.colleges is added in migration 005 after that
--       table is created.  The column is typed UUID now so the FK can be added
--       with a simple ALTER TABLE.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_education (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  college_id        UUID,                       -- FK added in 005_colleges.sql
  college_name      TEXT NOT NULL,
  university        TEXT,
  department        TEXT,
  major             TEXT,
  degree            TEXT,
  enrollment_year   INT
                      CONSTRAINT chk_enrollment_year
                      CHECK (enrollment_year > 1900 AND enrollment_year < 2100),
  graduation_year   INT
                      CONSTRAINT chk_graduation_year
                      CHECK (graduation_year > 1900 AND graduation_year < 2100),
  academic_status   public.academic_status NOT NULL DEFAULT 'current',
  is_primary        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Graduation must not precede enrollment
  CONSTRAINT chk_graduation_after_enrollment
    CHECK (
      graduation_year IS NULL
      OR enrollment_year IS NULL
      OR graduation_year >= enrollment_year
    ),

  -- Prevent exact duplicate education entries
  CONSTRAINT uq_user_education_entry
    UNIQUE (user_id, college_name, degree)
);

CREATE INDEX IF NOT EXISTS idx_user_education_user_id
  ON public.user_education (user_id);

CREATE INDEX IF NOT EXISTS idx_user_education_college_name
  ON public.user_education (college_name);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_user_education_updated_at ON public.user_education;
CREATE TRIGGER set_user_education_updated_at
  BEFORE UPDATE ON public.user_education
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 4. user_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Notification preferences
  notification_connections        BOOLEAN NOT NULL DEFAULT true,
  notification_messages           BOOLEAN NOT NULL DEFAULT true,
  notification_posts              BOOLEAN NOT NULL DEFAULT true,
  notification_clubs              BOOLEAN NOT NULL DEFAULT true,
  notification_events             BOOLEAN NOT NULL DEFAULT true,
  notification_career             BOOLEAN NOT NULL DEFAULT true,
  notification_mentions           BOOLEAN NOT NULL DEFAULT true,
  notification_email              BOOLEAN NOT NULL DEFAULT false,
  -- Privacy settings
  privacy_show_online             BOOLEAN NOT NULL DEFAULT true,
  privacy_allow_messages          TEXT NOT NULL DEFAULT 'everyone'
                                    CONSTRAINT chk_privacy_allow_messages
                                    CHECK (privacy_allow_messages IN ('everyone', 'connections', 'nobody')),
  privacy_allow_connection_requests BOOLEAN NOT NULL DEFAULT true,
  privacy_show_activity           BOOLEAN NOT NULL DEFAULT true,
  -- Content preferences
  content_language                TEXT NOT NULL DEFAULT 'en',
  content_nsfw_filter             BOOLEAN NOT NULL DEFAULT true,
  theme                           TEXT NOT NULL DEFAULT 'system'
                                    CONSTRAINT chk_theme_value
                                    CHECK (theme IN ('light', 'dark', 'system')),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 5. Auto-create profile + settings on auth.users INSERT
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'username',
      'New User'
    )
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger on auth.users (safe to recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
