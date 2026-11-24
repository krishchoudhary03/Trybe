-- =============================================================================
-- TRYBE Migration 001: Extensions
-- =============================================================================
-- Enables required PostgreSQL extensions for the TRYBE platform.
--   • uuid-ossp  – UUID generation functions (uuid_generate_v4, etc.)
--   • pgcrypto   – Cryptographic functions (gen_random_uuid, crypt, etc.)
--   • pg_trgm    – Trigram-based fuzzy text search (GIN indexes, similarity())
--   • unaccent   – Accent-insensitive text search (unaccent())
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
-- =============================================================================
-- TRYBE Migration 002: Custom Enum Types
-- =============================================================================
-- All application enums. Each is wrapped in a DO block so the migration is
-- idempotent — re-running it after the types already exist is a no-op.
-- =============================================================================

-- Post visibility
DO $$ BEGIN
  CREATE TYPE public.post_visibility AS ENUM ('public', 'college', 'club', 'connections', 'private');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Post status
DO $$ BEGIN
  CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'archived', 'removed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Connection status
DO $$ BEGIN
  CREATE TYPE public.connection_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Club membership role
DO $$ BEGIN
  CREATE TYPE public.club_member_role AS ENUM ('owner', 'president', 'admin', 'moderator', 'member');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Club join policy
DO $$ BEGIN
  CREATE TYPE public.club_join_policy AS ENUM ('open', 'approval', 'invite');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Event attendance status
DO $$ BEGIN
  CREATE TYPE public.event_attendance_status AS ENUM ('going', 'interested', 'not_going', 'waitlisted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Project status
DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('idea', 'planning', 'active', 'paused', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Project visibility
DO $$ BEGIN
  CREATE TYPE public.project_visibility AS ENUM ('public', 'college', 'private', 'team');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Opportunity type
DO $$ BEGIN
  CREATE TYPE public.opportunity_type AS ENUM ('internship', 'job', 'hackathon', 'certification', 'competition', 'project', 'research');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Opportunity user status
DO $$ BEGIN
  CREATE TYPE public.opportunity_user_status AS ENUM ('saved', 'applied', 'dismissed', 'interviewing', 'offered', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Task status
DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('not_started', 'in_progress', 'completed', 'skipped', 'blocked');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AI message role
DO $$ BEGIN
  CREATE TYPE public.ai_message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AI run status
DO $$ BEGIN
  CREATE TYPE public.ai_run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Notification type
DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM (
    'connection_request', 'connection_accepted',
    'post_liked', 'post_commented', 'post_mentioned',
    'club_joined', 'club_invite', 'club_role_changed',
    'event_reminder', 'event_rsvp',
    'message_received',
    'mention',
    'career_milestone', 'assessment_complete',
    'mentor_session', 'mentor_action_due',
    'opportunity_match', 'opportunity_deadline',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Report status
DO $$ BEGIN
  CREATE TYPE public.report_status AS ENUM ('pending', 'reviewing', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Moderation action type
DO $$ BEGIN
  CREATE TYPE public.moderation_action AS ENUM ('warn', 'mute', 'suspend', 'ban', 'remove_content', 'restore_content');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Conversation type
DO $$ BEGIN
  CREATE TYPE public.conversation_type AS ENUM ('direct', 'group');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Message delivery status
DO $$ BEGIN
  CREATE TYPE public.message_delivery_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Skill source
DO $$ BEGIN
  CREATE TYPE public.skill_source AS ENUM ('profile', 'project', 'assessment', 'certificate', 'ai', 'mentor', 'manual');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Experience level
DO $$ BEGIN
  CREATE TYPE public.experience_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Academic status
DO $$ BEGIN
  CREATE TYPE public.academic_status AS ENUM ('current', 'alumni', 'faculty', 'staff');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Profile visibility
DO $$ BEGIN
  CREATE TYPE public.profile_visibility AS ENUM ('public', 'college', 'connections', 'private');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Account status
DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'deactivated', 'deleted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Media type
DO $$ BEGIN
  CREATE TYPE public.media_type AS ENUM ('image', 'video', 'audio', 'document', 'file');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Reaction type
DO $$ BEGIN
  CREATE TYPE public.reaction_type AS ENUM ('like', 'love', 'celebrate', 'insightful', 'curious');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Career goal status
DO $$ BEGIN
  CREATE TYPE public.goal_status AS ENUM ('active', 'completed', 'abandoned', 'paused');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Career goal priority
DO $$ BEGIN
  CREATE TYPE public.goal_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Mentor session status
DO $$ BEGIN
  CREATE TYPE public.mentor_session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Onboarding status
DO $$ BEGIN
  CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;
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
-- =============================================================================
-- TRYBE Migration 004: Social Graph & Posts
-- =============================================================================
-- Tables created:
--   • connections       – friend/connection requests between users
--   • blocked_users     – user-level blocks
--   • hashtags          – global hashtag registry
--   • posts             – main feed content
--   • post_hashtags     – many-to-many posts ↔ hashtags
--   • post_mentions     – @-mentions inside a post
--   • post_reactions    – reactions (like, love, etc.) on posts
--   • comments          – threaded comments on posts (max 3 levels)
--   • comment_reactions – reactions on comments
--
-- NOTE: posts.college_id FK → colleges is added in 005_colleges.sql
--       posts.club_id    FK → clubs    is added in 006_clubs.sql
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. connections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        public.connection_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at   TIMESTAMPTZ,

  CONSTRAINT chk_no_self_connection
    CHECK (requester_id != recipient_id),

  CONSTRAINT uq_connection_pair
    UNIQUE (requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester
  ON public.connections (requester_id);

CREATE INDEX IF NOT EXISTS idx_connections_recipient
  ON public.connections (recipient_id);

-- Optimised for "show my pending requests" queries
CREATE INDEX IF NOT EXISTS idx_connections_recipient_status
  ON public.connections (recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_connections_requester_status
  ON public.connections (requester_id, status);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_connections_updated_at ON public.connections;
CREATE TRIGGER set_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 2. blocked_users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_no_self_block
    CHECK (blocker_id != blocked_id),

  CONSTRAINT uq_block_pair
    UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker
  ON public.blocked_users (blocker_id);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked
  ON public.blocked_users (blocked_id);


-- ---------------------------------------------------------------------------
-- 3. hashtags
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hashtags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL
                CONSTRAINT chk_hashtag_format
                CHECK (name ~ '^[a-z0-9]{1,100}$'),
  usage_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hashtags_name_trgm
  ON public.hashtags USING gin (name public.gin_trgm_ops);


-- ---------------------------------------------------------------------------
-- 4. posts
-- ---------------------------------------------------------------------------
-- college_id and club_id FK constraints are added in later migrations (005, 006)
-- once those tables exist.  project_id FK will be added when projects table is
-- created in a future migration.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content             TEXT
                        CONSTRAINT chk_post_content_length
                        CHECK (char_length(content) <= 5000),
  visibility          public.post_visibility NOT NULL DEFAULT 'public',
  status              public.post_status     NOT NULL DEFAULT 'published',
  college_id          UUID,              -- FK added in 005_colleges.sql
  club_id             UUID,              -- FK added in 006_clubs.sql
  project_id          UUID,              -- FK added in future projects migration
  location            TEXT,
  is_pinned           BOOLEAN NOT NULL DEFAULT false,
  comments_enabled    BOOLEAN NOT NULL DEFAULT true,
  content_warning     TEXT,
  moderation_status   TEXT NOT NULL DEFAULT 'clean'
                        CONSTRAINT chk_post_moderation_status
                        CHECK (moderation_status IN ('clean', 'flagged', 'removed')),
  reply_to_post_id    UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  reactions_count     INT NOT NULL DEFAULT 0
                        CONSTRAINT chk_reactions_count_non_neg
                        CHECK (reactions_count >= 0),
  comments_count      INT NOT NULL DEFAULT 0
                        CONSTRAINT chk_comments_count_non_neg
                        CHECK (comments_count >= 0),
  published_at        TIMESTAMPTZ DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_posts_author
  ON public.posts (author_id);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON public.posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_college
  ON public.posts (college_id) WHERE college_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_club
  ON public.posts (club_id) WHERE club_id IS NOT NULL;

-- Primary feed query index
CREATE INDEX IF NOT EXISTS idx_posts_feed
  ON public.posts (status, visibility, created_at DESC);

-- Only active (non-deleted) posts
CREATE INDEX IF NOT EXISTS idx_posts_active
  ON public.posts (deleted_at) WHERE deleted_at IS NULL;

-- updated_at trigger
DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 5. post_hashtags (junction)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id  UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);


-- ---------------------------------------------------------------------------
-- 6. post_mentions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_mentions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_post_mention
    UNIQUE (post_id, mentioned_user_id)
);


-- ---------------------------------------------------------------------------
-- 7. post_reactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction    public.reaction_type NOT NULL DEFAULT 'like',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_post_reaction_per_user
    UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post
  ON public.post_reactions (post_id);

CREATE INDEX IF NOT EXISTS idx_post_reactions_user
  ON public.post_reactions (user_id);


-- ---------------------------------------------------------------------------
-- 8. comments (threaded, max depth 3)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id             UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_comment_id   UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content             TEXT NOT NULL
                        CONSTRAINT chk_comment_content_length
                        CHECK (char_length(content) BETWEEN 1 AND 2000),
  depth               INT NOT NULL DEFAULT 0
                        CONSTRAINT chk_comment_depth
                        CHECK (depth >= 0 AND depth <= 3),
  reactions_count     INT NOT NULL DEFAULT 0
                        CONSTRAINT chk_comment_reactions_non_neg
                        CHECK (reactions_count >= 0),
  moderation_status   TEXT NOT NULL DEFAULT 'clean'
                        CONSTRAINT chk_comment_moderation_status
                        CHECK (moderation_status IN ('clean', 'flagged', 'removed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_comments_post
  ON public.comments (post_id);

CREATE INDEX IF NOT EXISTS idx_comments_author
  ON public.comments (author_id);

CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON public.comments (parent_comment_id) WHERE parent_comment_id IS NOT NULL;

-- Chronological comments per post
CREATE INDEX IF NOT EXISTS idx_comments_post_created
  ON public.comments (post_id, created_at);

-- updated_at trigger
DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;
CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- ---------------------------------------------------------------------------
-- 9. comment_reactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id  UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction    public.reaction_type NOT NULL DEFAULT 'like',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT uq_comment_reaction_per_user
    UNIQUE (comment_id, user_id)
);
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
-- ============================================================================
-- 007_events.sql
-- Events and event attendees tables
-- Depends on: profiles, clubs, colleges, event_attendance_status enum,
--             handle_updated_at() trigger function
-- ============================================================================

-- --------------------------------------------------------------------------
-- Table: events
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description     TEXT CHECK (length(description) <= 5000),
    organizer_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    club_id         UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
    college_id      UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    category        TEXT,
    image_url       TEXT,
    location        TEXT,
    location_url    TEXT,                           -- for virtual events, meeting links
    is_virtual      BOOLEAN DEFAULT false,
    start_at        TIMESTAMPTZ NOT NULL,
    end_at          TIMESTAMPTZ NOT NULL,
    timezone        TEXT DEFAULT 'Asia/Kolkata',
    capacity        INT CHECK (capacity IS NULL OR capacity > 0),
    registration_deadline TIMESTAMPTZ,
    is_cancelled    BOOLEAN DEFAULT false,
    is_featured     BOOLEAN DEFAULT false,
    attendee_count  INT DEFAULT 0 CHECK (attendee_count >= 0),
    interested_count INT DEFAULT 0 CHECK (interested_count >= 0),
    tags            TEXT[] DEFAULT '{}',
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT chk_events_end_after_start CHECK (end_at >= start_at)
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_organizer_id
    ON public.events (organizer_id);

CREATE INDEX IF NOT EXISTS idx_events_club_id
    ON public.events (club_id)
    WHERE club_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_college_id
    ON public.events (college_id)
    WHERE college_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_start_at
    ON public.events (start_at);

CREATE INDEX IF NOT EXISTS idx_events_upcoming
    ON public.events (start_at, is_cancelled);

CREATE INDEX IF NOT EXISTS idx_events_category
    ON public.events (category);

-- updated_at trigger for events
CREATE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------
-- Table: event_attendees
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_attendees (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status      event_attendance_status NOT NULL DEFAULT 'going',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT uq_event_attendees_event_user UNIQUE (event_id, user_id)
);

-- Indexes for event_attendees
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id
    ON public.event_attendees (user_id);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id
    ON public.event_attendees (event_id);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event_status
    ON public.event_attendees (event_id, status);

-- updated_at trigger for event_attendees
CREATE TRIGGER trg_event_attendees_updated_at
    BEFORE UPDATE ON public.event_attendees
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
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
-- ============================================================================
-- 015_functions.sql
-- RPC functions and helper functions for TRYBE application
-- Dependencies: All tables from migrations 001-014, handle_updated_at() from 003
-- ============================================================================

-- ============================================================================
-- SECTION 1: RLS HELPER FUNCTIONS
-- These are used inside RLS policies; SECURITY DEFINER so they can access
-- auth.uid() on behalf of the calling role.
-- ============================================================================

-- Check if the authenticated user is an admin/owner/president of a club
CREATE OR REPLACE FUNCTION public.is_club_admin(p_club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = p_club_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'president', 'admin')
  );
$$;

-- Check if the authenticated user is a member of a club
CREATE OR REPLACE FUNCTION public.is_club_member(p_club_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM club_members
    WHERE club_id = p_club_id
      AND user_id = auth.uid()
  );
$$;

-- Check if the authenticated user is a member of a conversation (and has not left)
CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = p_conversation_id
      AND user_id = auth.uid()
      AND left_at IS NULL
  );
$$;

-- Check if the authenticated user is a college admin or moderator
CREATE OR REPLACE FUNCTION public.is_college_admin(p_college_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM college_members
    WHERE college_id = p_college_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'moderator')
  );
$$;

-- Check if two users have an accepted connection
CREATE OR REPLACE FUNCTION public.are_connected(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM connections
    WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND recipient_id = p_user_id)
        OR (requester_id = p_user_id AND recipient_id = auth.uid())
      )
  );
$$;

-- Check if a block exists between two users (in either direction)
CREATE OR REPLACE FUNCTION public.is_blocked(p_user1 UUID, p_user2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = p_user1 AND blocked_id = p_user2)
       OR (blocker_id = p_user2 AND blocked_id = p_user1)
  );
$$;


-- ============================================================================
-- SECTION 2: RPC FUNCTIONS — Atomic operations called from the client
-- ============================================================================

-- --------------------------------------------------------------------------
-- Toggle post reaction (like / unlike atomically)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.toggle_post_reaction(
  p_post_id UUID,
  p_reaction reaction_type DEFAULT 'like'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing UUID;
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if reaction already exists
  SELECT id INTO v_existing
  FROM post_reactions
  WHERE post_id = p_post_id AND user_id = v_user_id;

  IF v_existing IS NOT NULL THEN
    -- Remove existing reaction
    DELETE FROM post_reactions WHERE id = v_existing;
    UPDATE posts SET reactions_count = GREATEST(reactions_count - 1, 0) WHERE id = p_post_id;
    v_result := jsonb_build_object('action', 'removed', 'post_id', p_post_id);
  ELSE
    -- Add new reaction
    INSERT INTO post_reactions (post_id, user_id, reaction)
    VALUES (p_post_id, v_user_id, p_reaction);
    UPDATE posts SET reactions_count = reactions_count + 1 WHERE id = p_post_id;
    v_result := jsonb_build_object('action', 'added', 'post_id', p_post_id, 'reaction', p_reaction::text);
  END IF;

  RETURN v_result;
END;
$$;

-- --------------------------------------------------------------------------
-- Toggle comment reaction
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.toggle_comment_reaction(
  p_comment_id UUID,
  p_reaction reaction_type DEFAULT 'like'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing UUID;
  v_result JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_existing
  FROM comment_reactions
  WHERE comment_id = p_comment_id AND user_id = v_user_id;

  IF v_existing IS NOT NULL THEN
    DELETE FROM comment_reactions WHERE id = v_existing;
    UPDATE comments SET reactions_count = GREATEST(reactions_count - 1, 0) WHERE id = p_comment_id;
    v_result := jsonb_build_object('action', 'removed', 'comment_id', p_comment_id);
  ELSE
    INSERT INTO comment_reactions (comment_id, user_id, reaction)
    VALUES (p_comment_id, v_user_id, p_reaction);
    UPDATE comments SET reactions_count = reactions_count + 1 WHERE id = p_comment_id;
    v_result := jsonb_build_object('action', 'added', 'comment_id', p_comment_id);
  END IF;

  RETURN v_result;
END;
$$;

-- --------------------------------------------------------------------------
-- Send connection request (with duplicate / self / block prevention)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.send_connection_request(p_recipient_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing connections;
  v_reverse  connections;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_user_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot connect to yourself';
  END IF;

  -- Block check
  IF is_blocked(v_user_id, p_recipient_id) THEN
    RAISE EXCEPTION 'Cannot send request to this user';
  END IF;

  -- Check for existing request (this user → recipient)
  SELECT * INTO v_existing FROM connections
  WHERE requester_id = v_user_id AND recipient_id = p_recipient_id;

  -- Check for reverse request (recipient → this user)
  SELECT * INTO v_reverse FROM connections
  WHERE requester_id = p_recipient_id AND recipient_id = v_user_id;

  IF v_existing IS NOT NULL THEN
    IF v_existing.status = 'accepted' THEN
      RETURN jsonb_build_object('status', 'already_connected');
    ELSIF v_existing.status = 'pending' THEN
      RETURN jsonb_build_object('status', 'already_pending');
    ELSIF v_existing.status IN ('rejected', 'cancelled') THEN
      -- Allow re-requesting
      UPDATE connections SET status = 'pending', updated_at = now()
      WHERE id = v_existing.id;
      RETURN jsonb_build_object('status', 'request_resent');
    ELSIF v_existing.status = 'blocked' THEN
      RAISE EXCEPTION 'Cannot send request to this user';
    END IF;
  END IF;

  IF v_reverse IS NOT NULL THEN
    IF v_reverse.status = 'pending' THEN
      -- Auto-accept: they already sent us a request
      UPDATE connections SET status = 'accepted', accepted_at = now(), updated_at = now()
      WHERE id = v_reverse.id;
      RETURN jsonb_build_object('status', 'auto_accepted');
    ELSIF v_reverse.status = 'accepted' THEN
      RETURN jsonb_build_object('status', 'already_connected');
    ELSIF v_reverse.status = 'blocked' THEN
      RAISE EXCEPTION 'Cannot send request to this user';
    END IF;
  END IF;

  -- Create new request
  INSERT INTO connections (requester_id, recipient_id, status)
  VALUES (v_user_id, p_recipient_id, 'pending');

  RETURN jsonb_build_object('status', 'request_sent');
END;
$$;

-- --------------------------------------------------------------------------
-- Accept connection request
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_connection_request(p_connection_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_conn connections;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_conn FROM connections
  WHERE id = p_connection_id AND recipient_id = v_user_id AND status = 'pending';

  IF v_conn IS NULL THEN
    RAISE EXCEPTION 'Connection request not found or not authorized';
  END IF;

  UPDATE connections
  SET status = 'accepted', accepted_at = now(), updated_at = now()
  WHERE id = p_connection_id;

  RETURN jsonb_build_object('status', 'accepted', 'connection_id', p_connection_id);
END;
$$;

-- --------------------------------------------------------------------------
-- Reject connection request
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reject_connection_request(p_connection_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE connections
  SET status = 'rejected', updated_at = now()
  WHERE id = p_connection_id AND recipient_id = v_user_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Connection request not found or not authorized';
  END IF;

  RETURN jsonb_build_object('status', 'rejected');
END;
$$;

-- --------------------------------------------------------------------------
-- Join club (with open/approval support)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_club(p_club_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_club clubs;
  v_existing club_members;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_club FROM clubs WHERE id = p_club_id AND is_active = true;
  IF v_club IS NULL THEN
    RAISE EXCEPTION 'Club not found';
  END IF;

  SELECT * INTO v_existing FROM club_members
  WHERE club_id = p_club_id AND user_id = v_user_id;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'already_member');
  END IF;

  INSERT INTO club_members (club_id, user_id, role)
  VALUES (p_club_id, v_user_id, 'member');

  UPDATE clubs SET member_count = member_count + 1 WHERE id = p_club_id;

  RETURN jsonb_build_object('status', 'joined', 'club_id', p_club_id);
END;
$$;

-- --------------------------------------------------------------------------
-- Leave club
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.leave_club(p_club_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_member club_members;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_member FROM club_members
  WHERE club_id = p_club_id AND user_id = v_user_id;

  IF v_member IS NULL THEN
    RETURN jsonb_build_object('status', 'not_member');
  END IF;

  IF v_member.role = 'owner' THEN
    RAISE EXCEPTION 'Owner cannot leave club. Transfer ownership first.';
  END IF;

  DELETE FROM club_members WHERE club_id = p_club_id AND user_id = v_user_id;
  UPDATE clubs SET member_count = GREATEST(member_count - 1, 0) WHERE id = p_club_id;

  RETURN jsonb_build_object('status', 'left', 'club_id', p_club_id);
END;
$$;

-- --------------------------------------------------------------------------
-- RSVP to event
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rsvp_event(
  p_event_id UUID,
  p_status event_attendance_status DEFAULT 'going'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_event events;
  v_existing event_attendees;
  v_old_status event_attendance_status;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_event FROM events WHERE id = p_event_id AND is_cancelled = false;
  IF v_event IS NULL THEN
    RAISE EXCEPTION 'Event not found or cancelled';
  END IF;

  -- Auto-waitlist if capacity reached
  IF p_status = 'going' AND v_event.capacity IS NOT NULL AND v_event.attendee_count >= v_event.capacity THEN
    p_status := 'waitlisted';
  END IF;

  SELECT * INTO v_existing FROM event_attendees
  WHERE event_id = p_event_id AND user_id = v_user_id;

  IF v_existing IS NOT NULL THEN
    v_old_status := v_existing.status;

    UPDATE event_attendees SET status = p_status, updated_at = now()
    WHERE event_id = p_event_id AND user_id = v_user_id;

    -- Adjust attendee_count
    IF v_old_status = 'going' AND p_status != 'going' THEN
      UPDATE events SET attendee_count = GREATEST(attendee_count - 1, 0) WHERE id = p_event_id;
    ELSIF v_old_status != 'going' AND p_status = 'going' THEN
      UPDATE events SET attendee_count = attendee_count + 1 WHERE id = p_event_id;
    END IF;

    -- Adjust interested_count
    IF v_old_status = 'interested' AND p_status != 'interested' THEN
      UPDATE events SET interested_count = GREATEST(interested_count - 1, 0) WHERE id = p_event_id;
    ELSIF v_old_status != 'interested' AND p_status = 'interested' THEN
      UPDATE events SET interested_count = interested_count + 1 WHERE id = p_event_id;
    END IF;
  ELSE
    INSERT INTO event_attendees (event_id, user_id, status)
    VALUES (p_event_id, v_user_id, p_status);

    IF p_status = 'going' THEN
      UPDATE events SET attendee_count = attendee_count + 1 WHERE id = p_event_id;
    ELSIF p_status = 'interested' THEN
      UPDATE events SET interested_count = interested_count + 1 WHERE id = p_event_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('status', p_status::text, 'event_id', p_event_id);
END;
$$;

-- --------------------------------------------------------------------------
-- Cancel RSVP
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_rsvp(p_event_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing event_attendees;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_existing FROM event_attendees
  WHERE event_id = p_event_id AND user_id = v_user_id;

  IF v_existing IS NULL THEN
    RETURN jsonb_build_object('status', 'not_attending');
  END IF;

  DELETE FROM event_attendees WHERE event_id = p_event_id AND user_id = v_user_id;

  IF v_existing.status = 'going' THEN
    UPDATE events SET attendee_count = GREATEST(attendee_count - 1, 0) WHERE id = p_event_id;
  ELSIF v_existing.status = 'interested' THEN
    UPDATE events SET interested_count = GREATEST(interested_count - 1, 0) WHERE id = p_event_id;
  END IF;

  RETURN jsonb_build_object('status', 'cancelled', 'event_id', p_event_id);
END;
$$;

-- --------------------------------------------------------------------------
-- Send message (validates membership, updates conversation preview)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.send_message(
  p_conversation_id UUID,
  p_content TEXT,
  p_reply_to UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_message_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify membership
  IF NOT is_conversation_member(p_conversation_id) THEN
    RAISE EXCEPTION 'Not a member of this conversation';
  END IF;

  -- Insert message
  INSERT INTO messages (conversation_id, sender_id, content, reply_to_message_id)
  VALUES (p_conversation_id, v_user_id, p_content, p_reply_to)
  RETURNING id INTO v_message_id;

  -- Update conversation preview
  UPDATE conversations
  SET last_message_at = now(),
      last_message_preview = LEFT(p_content, 200),
      updated_at = now()
  WHERE id = p_conversation_id;

  -- Update message count for AI conversations (no-op if row doesn't exist)
  UPDATE ai_conversations
  SET message_count = message_count + 1
  WHERE id = p_conversation_id;

  RETURN v_message_id;
END;
$$;

-- --------------------------------------------------------------------------
-- Get or create a direct conversation between two users
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(p_other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_conversation_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_user_id = p_other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  -- Block check
  IF is_blocked(v_user_id, p_other_user_id) THEN
    RAISE EXCEPTION 'Cannot message this user';
  END IF;

  -- Find existing direct conversation between the two users
  SELECT cm1.conversation_id INTO v_conversation_id
  FROM conversation_members cm1
  JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
  JOIN conversations c ON c.id = cm1.conversation_id
  WHERE cm1.user_id = v_user_id
    AND cm2.user_id = p_other_user_id
    AND c.type = 'direct'
    AND cm1.left_at IS NULL
    AND cm2.left_at IS NULL
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Create new direct conversation
  INSERT INTO conversations (type, created_by)
  VALUES ('direct', v_user_id)
  RETURNING id INTO v_conversation_id;

  -- Add both participants
  INSERT INTO conversation_members (conversation_id, user_id)
  VALUES (v_conversation_id, v_user_id), (v_conversation_id, p_other_user_id);

  RETURN v_conversation_id;
END;
$$;

-- --------------------------------------------------------------------------
-- Mark notifications as read
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.mark_notifications_read(p_notification_ids UUID[] DEFAULT NULL)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_count INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_notification_ids IS NULL THEN
    -- Mark ALL unread notifications as read
    UPDATE notifications SET read_at = now()
    WHERE recipient_id = v_user_id AND read_at IS NULL;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications SET read_at = now()
    WHERE recipient_id = v_user_id AND id = ANY(p_notification_ids) AND read_at IS NULL;
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- --------------------------------------------------------------------------
-- Complete a roadmap task (with progress recalculation)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_roadmap_task(p_task_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id  UUID := auth.uid();
  v_task     roadmap_tasks;
  v_roadmap  career_roadmaps;
  v_total    INT;
  v_completed INT;
  v_progress NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get task and verify ownership through roadmap
  SELECT t.* INTO v_task
  FROM roadmap_tasks t
  JOIN career_roadmaps r ON r.id = t.roadmap_id
  WHERE t.id = p_task_id AND r.user_id = v_user_id;

  IF v_task IS NULL THEN
    RAISE EXCEPTION 'Task not found or not authorized';
  END IF;

  IF v_task.status = 'completed' THEN
    RETURN jsonb_build_object('status', 'already_completed');
  END IF;

  -- Mark completed
  UPDATE roadmap_tasks
  SET status = 'completed', completed_at = now(), updated_at = now()
  WHERE id = p_task_id;

  -- Recalculate roadmap progress percentage
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total, v_completed
  FROM roadmap_tasks WHERE roadmap_id = v_task.roadmap_id;

  v_progress := CASE WHEN v_total > 0
    THEN (v_completed::numeric / v_total::numeric) * 100
    ELSE 0
  END;

  UPDATE career_roadmaps
  SET progress_pct = v_progress, updated_at = now()
  WHERE id = v_task.roadmap_id;

  -- Update user skill if task has a skill association
  IF v_task.skill_id IS NOT NULL AND v_task.skill_gain IS NOT NULL THEN
    INSERT INTO user_skills (user_id, skill_id, proficiency, source)
    VALUES (v_user_id, v_task.skill_id, v_task.skill_gain, 'assessment')
    ON CONFLICT (user_id, skill_id) DO UPDATE
    SET proficiency = LEAST(COALESCE(user_skills.proficiency, 0) + v_task.skill_gain, 100),
        updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'status', 'completed',
    'task_id', p_task_id,
    'roadmap_progress', v_progress
  );
END;
$$;

-- --------------------------------------------------------------------------
-- Add comment to post (with reply support and count update)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.add_comment(
  p_post_id UUID,
  p_content TEXT,
  p_parent_comment_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_comment_id UUID;
  v_depth      INT := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check post exists and comments are enabled
  IF NOT EXISTS (
    SELECT 1 FROM posts
    WHERE id = p_post_id AND deleted_at IS NULL AND comments_enabled = true
  ) THEN
    RAISE EXCEPTION 'Post not found or comments disabled';
  END IF;

  -- Calculate depth for replies
  IF p_parent_comment_id IS NOT NULL THEN
    SELECT depth + 1 INTO v_depth
    FROM comments WHERE id = p_parent_comment_id AND post_id = p_post_id;

    IF v_depth IS NULL THEN
      RAISE EXCEPTION 'Parent comment not found';
    END IF;

    IF v_depth > 3 THEN
      RAISE EXCEPTION 'Maximum comment nesting depth reached';
    END IF;
  END IF;

  INSERT INTO comments (post_id, author_id, parent_comment_id, content, depth)
  VALUES (p_post_id, v_user_id, p_parent_comment_id, p_content, v_depth)
  RETURNING id INTO v_comment_id;

  UPDATE posts SET comments_count = comments_count + 1 WHERE id = p_post_id;

  RETURN v_comment_id;
END;
$$;
-- ============================================================================
-- 016_triggers.sql
-- Automated triggers for business rules, counter caches, and notifications
-- Dependencies: 001-015
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. COMMENT DEPTH SANITIZER TRIGGER
-- Ensures nested comments do not exceed maximum permitted depth (3)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_comment_depth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT COALESCE(depth + 1, 1) INTO NEW.depth
    FROM comments WHERE id = NEW.parent_comment_id;

    IF NEW.depth > 3 THEN
      RAISE EXCEPTION 'Maximum comment nesting depth (3) exceeded';
    END IF;
  ELSE
    NEW.depth := 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_comment_depth ON public.comments;
CREATE TRIGGER trg_set_comment_depth
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_comment_depth();


-- ----------------------------------------------------------------------------
-- 2. NOTIFICATION: CONNECTION REQUEST / ACCEPTED
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_connection_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When new pending connection is created
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO public.notifications (
      recipient_id,
      actor_id,
      type,
      title,
      body,
      entity_type,
      entity_id
    ) VALUES (
      NEW.recipient_id,
      NEW.requester_id,
      'connection_request',
      'New connection request',
      'wants to connect with you.',
      'connection',
      NEW.id
    );

  -- When status changes to accepted
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO public.notifications (
      recipient_id,
      actor_id,
      type,
      title,
      body,
      entity_type,
      entity_id
    ) VALUES (
      NEW.requester_id,
      NEW.recipient_id,
      'connection_accepted',
      'Connection accepted',
      'accepted your connection request.',
      'connection',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_connection ON public.connections;
CREATE TRIGGER trg_notify_connection
  AFTER INSERT OR UPDATE OF status ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_connection_event();


-- ----------------------------------------------------------------------------
-- 3. NOTIFICATION: POST REACTION / LIKE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_post_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author UUID;
  v_actor_name  TEXT;
BEGIN
  SELECT author_id INTO v_post_author FROM public.posts WHERE id = NEW.post_id;
  
  -- Prevent notifying when author reacts to their own post
  IF v_post_author IS NOT NULL AND v_post_author != NEW.user_id THEN
    SELECT display_name INTO v_actor_name FROM public.profiles WHERE id = NEW.user_id;

    INSERT INTO public.notifications (
      recipient_id,
      actor_id,
      type,
      title,
      body,
      entity_type,
      entity_id
    ) VALUES (
      v_post_author,
      NEW.user_id,
      'post_liked',
      'New reaction on your post',
      COALESCE(v_actor_name, 'Someone') || ' reacted to your post.',
      'post',
      NEW.post_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_post_reaction ON public.post_reactions;
CREATE TRIGGER trg_notify_post_reaction
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_reaction();


-- ----------------------------------------------------------------------------
-- 4. NOTIFICATION: POST COMMENT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_post_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author UUID;
  v_actor_name  TEXT;
BEGIN
  SELECT author_id INTO v_post_author FROM public.posts WHERE id = NEW.post_id;

  -- Don't notify self
  IF v_post_author IS NOT NULL AND v_post_author != NEW.author_id THEN
    SELECT display_name INTO v_actor_name FROM public.profiles WHERE id = NEW.author_id;

    INSERT INTO public.notifications (
      recipient_id,
      actor_id,
      type,
      title,
      body,
      entity_type,
      entity_id
    ) VALUES (
      v_post_author,
      NEW.author_id,
      'post_commented',
      'New comment on your post',
      COALESCE(v_actor_name, 'Someone') || ' commented: "' || LEFT(NEW.content, 60) || '"',
      'post',
      NEW.post_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_post_comment ON public.comments;
CREATE TRIGGER trg_notify_post_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_comment();


-- ----------------------------------------------------------------------------
-- 5. NOTIFICATION: POST MENTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_post_mention()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_author_id   UUID;
  v_actor_name  TEXT;
BEGIN
  SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.post_id;

  IF v_author_id IS NOT NULL AND v_author_id != NEW.mentioned_user_id THEN
    SELECT display_name INTO v_actor_name FROM public.profiles WHERE id = v_author_id;

    INSERT INTO public.notifications (
      recipient_id,
      actor_id,
      type,
      title,
      body,
      entity_type,
      entity_id
    ) VALUES (
      NEW.mentioned_user_id,
      v_author_id,
      'mention',
      'You were mentioned in a post',
      COALESCE(v_actor_name, 'Someone') || ' mentioned you in a post.',
      'post',
      NEW.post_id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_post_mention ON public.post_mentions;
CREATE TRIGGER trg_notify_post_mention
  AFTER INSERT ON public.post_mentions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_mention();


-- ----------------------------------------------------------------------------
-- 6. NOTIFICATION: NEW DIRECT / GROUP MESSAGE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  IF NEW.is_system_message = true OR NEW.deleted_at IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT display_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  INSERT INTO public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    entity_type,
    entity_id
  )
  SELECT
    cm.user_id,
    NEW.sender_id,
    'message_received',
    'New message from ' || COALESCE(v_sender_name, 'a member'),
    LEFT(NEW.content, 100),
    'conversation',
    NEW.conversation_id
  FROM public.conversation_members cm
  WHERE cm.conversation_id = NEW.conversation_id
    AND cm.user_id != NEW.sender_id
    AND cm.left_at IS NULL
    AND cm.is_muted = false;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();


-- ----------------------------------------------------------------------------
-- 7. COMMENT COUNTER CACHE MAINTENANCE (HARD DELETE & SOFT DELETE)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_comment_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts
  SET comments_count = GREATEST(comments_count - 1, 0)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_comment_hard_delete_count ON public.comments;
CREATE TRIGGER trg_comment_hard_delete_count
  AFTER DELETE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_comment_delete();

CREATE OR REPLACE FUNCTION public.sync_comment_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE public.posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = NEW.post_id;
  ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    UPDATE public.posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_comment_soft_delete_count ON public.comments;
CREATE TRIGGER trg_comment_soft_delete_count
  AFTER UPDATE OF deleted_at ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_comment_soft_delete();


-- ----------------------------------------------------------------------------
-- 8. PROJECT TEAM COUNT MAINTENANCE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_project_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects
    SET team_size_current = team_size_current + 1
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects
    SET team_size_current = GREATEST(team_size_current - 1, 0)
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_member_count ON public.project_members;
CREATE TRIGGER trg_project_member_count
  AFTER INSERT OR DELETE ON public.project_members
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_project_member_count();


-- ----------------------------------------------------------------------------
-- 9. USER ONLINE PRESENCE & LAST SEEN UPDATE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen_at = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$;
-- ============================================================================
-- 017_rls.sql
-- Production-Grade Row Level Security (RLS) Policies for TRYBE
-- Dependencies: 001-016
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENABLE RLS ON ALL PUBLIC TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_education              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings               ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.connections                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_mentions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions           ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.colleges                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_members             ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.clubs                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members                ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.events                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees             ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.projects                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies        ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.skills                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_aliases              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_target_roles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_target_industries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_goals                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_role_skills          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certification_skills        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_roadmaps             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_phases              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_tasks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_task_dependencies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_adaptations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_skills          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_opportunity_status     ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.mentor_relationships        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_session_action_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.conversations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions           ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media                  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ai_conversations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_runs                     ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.reports                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log           ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 1. PROFILES & USER ACCOUNTS
-- ============================================================================

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    profile_visibility = 'public'
    OR id = auth.uid()
    OR (profile_visibility = 'connections' AND are_connected(id))
  );

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE TO authenticated
  USING (id = auth.uid());


-- ----------------------------------------------------------------------------
-- USER EDUCATION
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_education_select" ON public.user_education;
CREATE POLICY "user_education_select" ON public.user_education
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "user_education_insert" ON public.user_education;
CREATE POLICY "user_education_insert" ON public.user_education
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_education_update" ON public.user_education;
CREATE POLICY "user_education_update" ON public.user_education
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_education_delete" ON public.user_education;
CREATE POLICY "user_education_delete" ON public.user_education
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- ----------------------------------------------------------------------------
-- USER SETTINGS (Strictly private)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_settings_owner_access" ON public.user_settings;
CREATE POLICY "user_settings_owner_access" ON public.user_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================================
-- 2. SOCIAL GRAPH & CONNECTIONS
-- ============================================================================

DROP POLICY IF EXISTS "connections_select" ON public.connections;
CREATE POLICY "connections_select" ON public.connections
  FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "connections_insert" ON public.connections;
CREATE POLICY "connections_insert" ON public.connections
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid() AND recipient_id != auth.uid());

DROP POLICY IF EXISTS "connections_update" ON public.connections;
CREATE POLICY "connections_update" ON public.connections
  FOR UPDATE TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "connections_delete" ON public.connections;
CREATE POLICY "connections_delete" ON public.connections
  FOR DELETE TO authenticated
  USING (requester_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "blocked_users_policy" ON public.blocked_users;
CREATE POLICY "blocked_users_policy" ON public.blocked_users
  FOR ALL TO authenticated
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());


-- ============================================================================
-- 3. POSTS, COMMENTS, REACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND status = 'published'
    AND (
      author_id = auth.uid()
      OR visibility = 'public'
      OR (visibility = 'college' AND college_id IN (
        SELECT college_id FROM public.college_members WHERE user_id = auth.uid()
      ))
      OR (visibility = 'club' AND club_id IN (
        SELECT club_id FROM public.club_members WHERE user_id = auth.uid()
      ))
      OR (visibility = 'connections' AND are_connected(author_id))
    )
  );

DROP POLICY IF EXISTS "posts_insert" ON public.posts;
CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "posts_update" ON public.posts;
CREATE POLICY "posts_update" ON public.posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "posts_delete" ON public.posts;
CREATE POLICY "posts_delete" ON public.posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- Hashtags
DROP POLICY IF EXISTS "hashtags_select" ON public.hashtags;
CREATE POLICY "hashtags_select" ON public.hashtags
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "hashtags_insert" ON public.hashtags;
CREATE POLICY "hashtags_insert" ON public.hashtags
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "post_hashtags_select" ON public.post_hashtags;
CREATE POLICY "post_hashtags_select" ON public.post_hashtags
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "post_hashtags_insert" ON public.post_hashtags;
CREATE POLICY "post_hashtags_insert" ON public.post_hashtags
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
  );

-- Post Mentions
DROP POLICY IF EXISTS "post_mentions_select" ON public.post_mentions;
CREATE POLICY "post_mentions_select" ON public.post_mentions
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "post_mentions_insert" ON public.post_mentions;
CREATE POLICY "post_mentions_insert" ON public.post_mentions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
  );

-- Reactions
DROP POLICY IF EXISTS "post_reactions_select" ON public.post_reactions;
CREATE POLICY "post_reactions_select" ON public.post_reactions
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "post_reactions_insert" ON public.post_reactions;
CREATE POLICY "post_reactions_insert" ON public.post_reactions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "post_reactions_delete" ON public.post_reactions;
CREATE POLICY "post_reactions_delete" ON public.post_reactions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Comments
DROP POLICY IF EXISTS "comments_select" ON public.comments;
CREATE POLICY "comments_select" ON public.comments
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "comments_update" ON public.comments;
CREATE POLICY "comments_update" ON public.comments
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "comments_delete" ON public.comments;
CREATE POLICY "comments_delete" ON public.comments
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "comment_reactions_policy" ON public.comment_reactions;
CREATE POLICY "comment_reactions_policy" ON public.comment_reactions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================================
-- 4. COLLEGES & CLUBS
-- ============================================================================

DROP POLICY IF EXISTS "colleges_select" ON public.colleges;
CREATE POLICY "colleges_select" ON public.colleges
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "college_members_select" ON public.college_members;
CREATE POLICY "college_members_select" ON public.college_members
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "college_members_insert" ON public.college_members;
CREATE POLICY "college_members_insert" ON public.college_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_college_admin(college_id));

DROP POLICY IF EXISTS "college_members_delete" ON public.college_members;
CREATE POLICY "college_members_delete" ON public.college_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_college_admin(college_id));

-- Clubs
DROP POLICY IF EXISTS "clubs_select" ON public.clubs;
CREATE POLICY "clubs_select" ON public.clubs
  FOR SELECT TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "clubs_insert" ON public.clubs;
CREATE POLICY "clubs_insert" ON public.clubs
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "clubs_update" ON public.clubs;
CREATE POLICY "clubs_update" ON public.clubs
  FOR UPDATE TO authenticated
  USING (is_club_admin(id))
  WITH CHECK (is_club_admin(id));

DROP POLICY IF EXISTS "club_members_select" ON public.club_members;
CREATE POLICY "club_members_select" ON public.club_members
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "club_members_insert" ON public.club_members;
CREATE POLICY "club_members_insert" ON public.club_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_club_admin(club_id));

DROP POLICY IF EXISTS "club_members_update" ON public.club_members;
CREATE POLICY "club_members_update" ON public.club_members
  FOR UPDATE TO authenticated
  USING (is_club_admin(club_id));

DROP POLICY IF EXISTS "club_members_delete" ON public.club_members;
CREATE POLICY "club_members_delete" ON public.club_members
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR is_club_admin(club_id));


-- ============================================================================
-- 5. EVENTS & ATTENDANCE
-- ============================================================================

DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_select" ON public.events
  FOR SELECT TO authenticated
  USING (is_cancelled = false OR organizer_id = auth.uid());

DROP POLICY IF EXISTS "events_insert" ON public.events;
CREATE POLICY "events_insert" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (organizer_id = auth.uid());

DROP POLICY IF EXISTS "events_update" ON public.events;
CREATE POLICY "events_update" ON public.events
  FOR UPDATE TO authenticated
  USING (organizer_id = auth.uid() OR (club_id IS NOT NULL AND is_club_admin(club_id)))
  WITH CHECK (organizer_id = auth.uid() OR (club_id IS NOT NULL AND is_club_admin(club_id)));

DROP POLICY IF EXISTS "events_delete" ON public.events;
CREATE POLICY "events_delete" ON public.events
  FOR DELETE TO authenticated
  USING (organizer_id = auth.uid() OR (club_id IS NOT NULL AND is_club_admin(club_id)));

DROP POLICY IF EXISTS "event_attendees_select" ON public.event_attendees;
CREATE POLICY "event_attendees_select" ON public.event_attendees
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "event_attendees_all_own" ON public.event_attendees;
CREATE POLICY "event_attendees_all_own" ON public.event_attendees
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================================
-- 6. PROJECTS & COLLABORATION
-- ============================================================================

DROP POLICY IF EXISTS "projects_select" ON public.projects;
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      visibility = 'public'
      OR owner_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "projects_insert" ON public.projects;
CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "projects_update" ON public.projects;
CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "projects_delete" ON public.projects;
CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "project_members_select" ON public.project_members;
CREATE POLICY "project_members_select" ON public.project_members
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "project_members_modify" ON public.project_members;
CREATE POLICY "project_members_modify" ON public.project_members
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid())
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "project_tech_policy" ON public.project_technologies;
CREATE POLICY "project_tech_policy" ON public.project_technologies
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid())
  );


-- ============================================================================
-- 7. CAREER ENGINE, ROADMAPS, ASSESSMENTS & OPPORTUNITIES
-- ============================================================================

-- Reference data (Read-only for users)
DROP POLICY IF EXISTS "skills_read" ON public.skills;
CREATE POLICY "skills_read" ON public.skills FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "skill_aliases_read" ON public.skill_aliases;
CREATE POLICY "skill_aliases_read" ON public.skill_aliases FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "career_roles_read" ON public.career_roles;
CREATE POLICY "career_roles_read" ON public.career_roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "career_role_skills_read" ON public.career_role_skills;
CREATE POLICY "career_role_skills_read" ON public.career_role_skills FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "certifications_read" ON public.certifications;
CREATE POLICY "certifications_read" ON public.certifications FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "certification_skills_read" ON public.certification_skills;
CREATE POLICY "certification_skills_read" ON public.certification_skills FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "opportunities_read" ON public.opportunities;
CREATE POLICY "opportunities_read" ON public.opportunities FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "opportunity_skills_read" ON public.opportunity_skills;
CREATE POLICY "opportunity_skills_read" ON public.opportunity_skills FOR SELECT TO authenticated USING (true);

-- User-Specific Career Data (Full CRUD on own records)
DROP POLICY IF EXISTS "user_skills_owner" ON public.user_skills;
CREATE POLICY "user_skills_owner" ON public.user_skills FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_skills_public_read" ON public.user_skills;
CREATE POLICY "user_skills_public_read" ON public.user_skills FOR SELECT TO authenticated
  USING (true); -- User profile skills are visible on public profiles

DROP POLICY IF EXISTS "career_profiles_owner" ON public.career_profiles;
CREATE POLICY "career_profiles_owner" ON public.career_profiles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "career_target_roles_owner" ON public.career_target_roles;
CREATE POLICY "career_target_roles_owner" ON public.career_target_roles FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "career_target_industries_owner" ON public.career_target_industries;
CREATE POLICY "career_target_industries_owner" ON public.career_target_industries FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "career_goals_owner" ON public.career_goals;
CREATE POLICY "career_goals_owner" ON public.career_goals FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_certifications_owner" ON public.user_certifications;
CREATE POLICY "user_certifications_owner" ON public.user_certifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "assessments_owner" ON public.assessments;
CREATE POLICY "assessments_owner" ON public.assessments FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_opportunity_status_owner" ON public.user_opportunity_status;
CREATE POLICY "user_opportunity_status_owner" ON public.user_opportunity_status FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Roadmap and tasks
DROP POLICY IF EXISTS "career_roadmaps_owner" ON public.career_roadmaps;
CREATE POLICY "career_roadmaps_owner" ON public.career_roadmaps FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "roadmap_phases_owner" ON public.roadmap_phases;
CREATE POLICY "roadmap_phases_owner" ON public.roadmap_phases FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.career_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.career_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "roadmap_tasks_owner" ON public.roadmap_tasks;
CREATE POLICY "roadmap_tasks_owner" ON public.roadmap_tasks FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.career_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.career_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "roadmap_deps_owner" ON public.roadmap_task_dependencies;
CREATE POLICY "roadmap_deps_owner" ON public.roadmap_task_dependencies FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.roadmap_tasks t
    JOIN public.career_roadmaps r ON r.id = t.roadmap_id
    WHERE t.id = task_id AND r.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "roadmap_adapt_owner" ON public.roadmap_adaptations;
CREATE POLICY "roadmap_adapt_owner" ON public.roadmap_adaptations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.career_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()));


-- ============================================================================
-- 8. MENTORSHIP
-- ============================================================================

DROP POLICY IF EXISTS "mentor_relationships_access" ON public.mentor_relationships;
CREATE POLICY "mentor_relationships_access" ON public.mentor_relationships
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid() OR mentee_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid() OR mentee_id = auth.uid());

DROP POLICY IF EXISTS "mentor_sessions_access" ON public.mentor_sessions;
CREATE POLICY "mentor_sessions_access" ON public.mentor_sessions
  FOR ALL TO authenticated
  USING (mentor_id = auth.uid() OR mentee_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid() OR mentee_id = auth.uid());

DROP POLICY IF EXISTS "mentor_action_items_access" ON public.mentor_session_action_items;
CREATE POLICY "mentor_action_items_access" ON public.mentor_session_action_items
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.mentor_sessions s
    WHERE s.id = session_id AND (s.mentor_id = auth.uid() OR s.mentee_id = auth.uid())
  ));


-- ============================================================================
-- 9. CHAT & DIRECT MESSAGES (Strict RLS Isolation)
-- ============================================================================

DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT TO authenticated
  USING (is_conversation_member(id));

DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "conversations_update" ON public.conversations;
CREATE POLICY "conversations_update" ON public.conversations
  FOR UPDATE TO authenticated
  USING (is_conversation_member(id));

-- Conversation Members
DROP POLICY IF EXISTS "conversation_members_select" ON public.conversation_members;
CREATE POLICY "conversation_members_select" ON public.conversation_members
  FOR SELECT TO authenticated
  USING (is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "conversation_members_insert" ON public.conversation_members;
CREATE POLICY "conversation_members_insert" ON public.conversation_members
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "conversation_members_update" ON public.conversation_members;
CREATE POLICY "conversation_members_update" ON public.conversation_members
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Messages
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (is_conversation_member(conversation_id) AND deleted_at IS NULL);

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND is_conversation_member(conversation_id));

DROP POLICY IF EXISTS "messages_update" ON public.messages;
CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "messages_delete" ON public.messages;
CREATE POLICY "messages_delete" ON public.messages
  FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- Message Attachments & Reactions
DROP POLICY IF EXISTS "message_attachments_select" ON public.message_attachments;
CREATE POLICY "message_attachments_select" ON public.message_attachments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = message_id AND is_conversation_member(m.conversation_id)
  ));

DROP POLICY IF EXISTS "message_attachments_insert" ON public.message_attachments;
CREATE POLICY "message_attachments_insert" ON public.message_attachments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = message_id AND m.sender_id = auth.uid()
  ));

DROP POLICY IF EXISTS "message_reactions_access" ON public.message_reactions;
CREATE POLICY "message_reactions_access" ON public.message_reactions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = message_id AND is_conversation_member(m.conversation_id)
  ))
  WITH CHECK (user_id = auth.uid());


-- ============================================================================
-- 10. NOTIFICATIONS
-- ============================================================================

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE TO authenticated
  USING (recipient_id = auth.uid());


-- ============================================================================
-- 11. MEDIA ASSETS & POST MEDIA
-- ============================================================================

DROP POLICY IF EXISTS "media_assets_select" ON public.media_assets;
CREATE POLICY "media_assets_select" ON public.media_assets
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "media_assets_insert" ON public.media_assets;
CREATE POLICY "media_assets_insert" ON public.media_assets
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "media_assets_update" ON public.media_assets;
CREATE POLICY "media_assets_update" ON public.media_assets
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "media_assets_delete" ON public.media_assets;
CREATE POLICY "media_assets_delete" ON public.media_assets
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "post_media_select" ON public.post_media;
CREATE POLICY "post_media_select" ON public.post_media
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "post_media_insert" ON public.post_media;
CREATE POLICY "post_media_insert" ON public.post_media
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid()
  ));

DROP POLICY IF EXISTS "post_media_delete" ON public.post_media;
CREATE POLICY "post_media_delete" ON public.post_media
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid()
  ));


-- ============================================================================
-- 12. AI CONVERSATIONS, MESSAGES & RUN AUDIT
-- ============================================================================

DROP POLICY IF EXISTS "ai_conv_owner" ON public.ai_conversations;
CREATE POLICY "ai_conv_owner" ON public.ai_conversations
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ai_msgs_owner" ON public.ai_messages;
CREATE POLICY "ai_msgs_owner" ON public.ai_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = conversation_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "ai_runs_owner" ON public.ai_runs;
CREATE POLICY "ai_runs_owner" ON public.ai_runs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ============================================================================
-- 13. MODERATION, AUDIT & REPORTS
-- ============================================================================

DROP POLICY IF EXISTS "reports_insert" ON public.reports;
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "reports_select_own" ON public.reports;
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "user_activity_log_owner" ON public.user_activity_log;
CREATE POLICY "user_activity_log_owner" ON public.user_activity_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_activity_log_insert" ON public.user_activity_log;
CREATE POLICY "user_activity_log_insert" ON public.user_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
-- ============================================================================
-- 018_indexes.sql
-- Performance Indexes, Composite Cursor Indexes & Trigram Full-Text Search
-- Dependencies: 001-017
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TRIGRAM FULL-TEXT SEARCH INDEXES (GIN)
-- Allows fast ILIKE and %keyword% matching across Discover, Search & Feeds
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_gin_profiles_display_name
  ON public.profiles USING gin (display_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_profiles_username
  ON public.profiles USING gin (username gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_profiles_headline
  ON public.profiles USING gin (headline gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_posts_content
  ON public.posts USING gin (content gin_trgm_ops)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_gin_colleges_name
  ON public.colleges USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_clubs_name
  ON public.clubs USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_events_title
  ON public.events USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_projects_title
  ON public.projects USING gin (title gin_trgm_ops)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_gin_skills_name
  ON public.skills USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_career_roles_title
  ON public.career_roles USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_opportunities_title
  ON public.opportunities USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gin_opportunities_tags
  ON public.opportunities USING gin (tags);

CREATE INDEX IF NOT EXISTS idx_gin_opportunities_roles
  ON public.opportunities USING gin (roles);


-- ----------------------------------------------------------------------------
-- 2. HIGH-PERFORMANCE CURSOR PAGINATION INDEXES
-- Designed for infinite scroll: WHERE (created_at, id) < (cursor_created_at, cursor_id)
-- ----------------------------------------------------------------------------

-- Feed pagination
CREATE INDEX IF NOT EXISTS idx_posts_feed_pagination
  ON public.posts (status, visibility, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_author_feed
  ON public.posts (author_id, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_college_feed
  ON public.posts (college_id, created_at DESC, id DESC)
  WHERE deleted_at IS NULL AND college_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_club_feed
  ON public.posts (club_id, created_at DESC, id DESC)
  WHERE deleted_at IS NULL AND club_id IS NOT NULL;

-- Comments list pagination (hierarchical top-level + replies)
CREATE INDEX IF NOT EXISTS idx_comments_post_hierarchy
  ON public.comments (post_id, parent_comment_id, created_at ASC, id ASC)
  WHERE deleted_at IS NULL;

-- Chat message pagination
CREATE INDEX IF NOT EXISTS idx_messages_conversation_cursor
  ON public.messages (conversation_id, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

-- Notification inbox cursor
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_inbox
  ON public.notifications (recipient_id, read_at NULLS FIRST, created_at DESC, id DESC);

-- Connections relationship lookup
CREATE INDEX IF NOT EXISTS idx_connections_lookup
  ON public.connections (recipient_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_connections_requester_lookup
  ON public.connections (requester_id, status, created_at DESC);

-- Active Upcoming Events
CREATE INDEX IF NOT EXISTS idx_events_upcoming
  ON public.events (is_cancelled, start_at ASC)
  WHERE is_cancelled = false;

-- Active Roadmaps & Tasks
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_lookup
  ON public.roadmap_tasks (roadmap_id, status, sort_order ASC);

-- Opportunities filter
CREATE INDEX IF NOT EXISTS idx_opportunities_active_filter
  ON public.opportunities (is_active, opportunity_type, deadline ASC)
  WHERE is_active = true;
-- ============================================================================
-- 019_seed.sql
-- Production Seed Reference Data for TRYBE (Colleges, Clubs, Skills, Roles, Opportunities)
-- Safe & Idempotent (ON CONFLICT DO NOTHING / UPDATE)
-- Uses 100% Valid Hexadecimal UUIDs (0-9, a-f)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. COLLEGES SEED DATA (Prefix: c000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.colleges (id, name, short_name, university, location_city, location_state, location_country, description, website, established_year, is_verified)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Indian Institute of Technology Bombay', 'IIT Bombay', 'Autonomous', 'Mumbai', 'Maharashtra', 'India', 'Premier engineering and research institute in Powai, Mumbai.', 'https://www.iitb.ac.in', 1958, true),
  ('c0000000-0000-0000-0000-000000000002', 'Indian Institute of Technology Delhi', 'IIT Delhi', 'Autonomous', 'New Delhi', 'Delhi', 'India', 'Leading technical university located in Hauz Khas, Delhi.', 'https://home.iitd.ac.in', 1961, true),
  ('c0000000-0000-0000-0000-000000000003', 'Birla Institute of Technology and Science, Pilani', 'BITS Pilani', 'Deemed University', 'Pilani', 'Rajasthan', 'India', 'Pioneering private higher education and research institute.', 'https://www.bits-pilani.ac.in', 1964, true),
  ('c0000000-0000-0000-0000-000000000004', 'National Institute of Technology Tiruchirappalli', 'NIT Trichy', 'Autonomous', 'Tiruchirappalli', 'Tamil Nadu', 'India', 'Top ranked NIT known for engineering and technological innovations.', 'https://www.nitt.edu', 1964, true),
  ('c0000000-0000-0000-0000-000000000005', 'RV College of Engineering', 'RVCE', 'VTU Autonomous', 'Bengaluru', 'Karnataka', 'India', 'Prominent engineering college in the silicon valley of India.', 'https://www.rvce.edu.in', 1963, true)
ON CONFLICT (name) DO UPDATE
SET
  short_name = EXCLUDED.short_name,
  location_city = EXCLUDED.location_city,
  location_state = EXCLUDED.location_state,
  website = EXCLUDED.website;


-- ----------------------------------------------------------------------------
-- 2. CANONICAL SKILLS SEED DATA (Prefix: a000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.skills (id, name, category, description, is_canonical)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'TypeScript', 'Programming Language', 'Typed superset of JavaScript providing static type definitions.', true),
  ('a0000000-0000-0000-0000-000000000002', 'React', 'Frontend Framework', 'Declarative UI library for building component-driven web applications.', true),
  ('a0000000-0000-0000-0000-000000000003', 'Node.js', 'Backend Runtime', 'JavaScript runtime built on Chrome''s V8 engine for server-side logic.', true),
  ('a0000000-0000-0000-0000-000000000004', 'PostgreSQL', 'Database', 'Powerful, open-source object-relational database system.', true),
  ('a0000000-0000-0000-0000-000000000005', 'Python', 'Programming Language', 'Versatile programming language widely used for AI/ML, backend, and scripts.', true),
  ('a0000000-0000-0000-0000-000000000006', 'Docker', 'DevOps & Tooling', 'Containerization platform to package software into standardized units.', true),
  ('a0000000-0000-0000-0000-000000000007', 'Machine Learning', 'AI & Data Science', 'Algorithms and statistical models that systems use to perform tasks without explicit instructions.', true),
  ('a0000000-0000-0000-0000-000000000008', 'System Design', 'Architecture', 'Designing high-scale, fault-tolerant distributed software architectures.', true),
  ('a0000000-0000-0000-0000-000000000009', 'Git', 'DevOps & Tooling', 'Distributed version control system tracking changes in source code.', true),
  ('a0000000-0000-0000-0000-000000000010', 'Tailwind CSS', 'Frontend Framework', 'Utility-first CSS framework for rapid UI development.', true),
  ('a0000000-0000-0000-0000-000000000011', 'PyTorch', 'AI & Data Science', 'Deep learning framework facilitating transition from research prototyping to deployment.', true),
  ('a0000000-0000-0000-0000-000000000012', 'AWS', 'Cloud Infrastructure', 'Comprehensive cloud computing platform providing compute, storage, and database services.', true)
ON CONFLICT (name) DO NOTHING;

-- Skill Aliases
INSERT INTO public.skill_aliases (skill_id, alias)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'TS'),
  ('a0000000-0000-0000-0000-000000000002', 'React.js'),
  ('a0000000-0000-0000-0000-000000000002', 'ReactJS'),
  ('a0000000-0000-0000-0000-000000000004', 'Postgres'),
  ('a0000000-0000-0000-0000-000000000005', 'Python3'),
  ('a0000000-0000-0000-0000-000000000007', 'ML')
ON CONFLICT (alias) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 3. CAREER ROLES SEED DATA (Prefix: d000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.career_roles (id, title, slug, summary, description, industries, experience_level, growth_outlook)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'Full-Stack Developer',
    'full-stack-developer',
    'Designs and builds responsive client-side web apps and high-throughput backend services.',
    'Full-Stack Developers manage end-to-end web workflows including frontend interfaces, backend APIs, relational databases, and cloud deployments.',
    ARRAY['SaaS', 'FinTech', 'E-Commerce', 'EdTech'],
    'intermediate',
    'High Demand'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'AI / Machine Learning Engineer',
    'ai-ml-engineer',
    'Builds predictive models, neural architectures, and integrates generative AI into scalable pipelines.',
    'Focuses on feature engineering, model training, evaluation, quantization, and LLM inference optimization.',
    ARRAY['Artificial Intelligence', 'HealthTech', 'Autonomous Systems', 'FinTech'],
    'intermediate',
    'Exponential Growth'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'Cloud / DevOps Engineer',
    'cloud-devops-engineer',
    'Architects cloud infrastructure, CI/CD pipelines, container orchestration, and security reliability.',
    'Specializes in containerization, observability, infrastructure-as-code, and resilient automated deployment.',
    ARRAY['Cloud Infrastructure', 'Enterprise Software', 'Cybersecurity'],
    'intermediate',
    'Very High Demand'
  )
ON CONFLICT (title) DO NOTHING;

-- Map Required Skills to Career Roles
INSERT INTO public.career_role_skills (role_id, skill_id, is_required, proficiency_required)
VALUES
  -- Full-Stack Developer
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', true, 80), -- TypeScript
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', true, 85), -- React
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', true, 75), -- Node.js
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', true, 70), -- PostgreSQL
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000009', true, 80), -- Git
  
  -- AI/ML Engineer
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000005', true, 90), -- Python
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000007', true, 85), -- Machine Learning
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000011', true, 80), -- PyTorch
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006', false, 60),-- Docker

  -- Cloud/DevOps
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', true, 90), -- Docker
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000012', true, 85), -- AWS
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000008', true, 75)  -- System Design
ON CONFLICT (role_id, skill_id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 4. CAMPUS CLUBS SEED DATA (Prefix: b000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.clubs (id, name, slug, description, short_description, category, college_id, join_policy, is_active)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'Open Source & Coding Club',
    'iitb-coding-club',
    'Fostering open-source contributions, competitive programming contests, and software development hackathons.',
    'Premier competitive programming and developer community.',
    'Technology',
    'c0000000-0000-0000-0000-000000000001',
    'open',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'AI & Robotics Society',
    'iitd-robotics-society',
    'Building autonomous robots, quadcopters, and researching computer vision and embedded systems.',
    'Hands-on robotics, computer vision, and autonomous drone hardware.',
    'Robotics & AI',
    'c0000000-0000-0000-0000-000000000002',
    'approval',
    true
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'Entrepreneurship Cell (E-Cell)',
    'bits-ecell',
    'Empowering student founders with pitch competitions, mentorship from alumni founders, and seed grant funding.',
    'Incubating student startups and founder journeys.',
    'Entrepreneurship',
    'c0000000-0000-0000-0000-000000000003',
    'open',
    true
  )
ON CONFLICT (slug) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 5. CANONICAL OPPORTUNITIES SEED DATA (Prefix: e000...)
-- ----------------------------------------------------------------------------
INSERT INTO public.opportunities (
  id,
  title,
  organization,
  description,
  opportunity_type,
  experience_level,
  location,
  is_remote,
  deadline,
  is_active,
  is_featured,
  tags,
  roles
)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'Full-Stack Engineering Summer Fellowship',
    'HyperScale Labs',
    'Work alongside senior staff engineers building distributed real-time collaborative web systems using React, TypeScript, and Supabase.',
    'internship',
    'intermediate',
    'Bengaluru, Karnataka',
    true,
    now() + INTERVAL '45 days',
    true,
    true,
    ARRAY['React', 'TypeScript', 'PostgreSQL', 'Paid'],
    ARRAY['Full-Stack Developer']
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'National Generative AI Student Hackathon 2026',
    'TRYBE AI Foundation',
    '48-hour virtual national hackathon solving campus intelligence, agentic learning roadmaps, and student productivity.',
    'hackathon',
    'beginner',
    'Online / Pan-India',
    true,
    now() + INTERVAL '21 days',
    true,
    true,
    ARRAY['AI', 'Hackathon', 'Cash Prize', 'Mentorship'],
    ARRAY['AI / Machine Learning Engineer', 'Full-Stack Developer']
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'Cloud Systems & Security Research Assistantship',
    'Center for Network Security',
    'Undergraduate research exploring eBPF observability, micro-segmentation, and zero-trust container networking.',
    'research',
    'advanced',
    'New Delhi, Delhi',
    false,
    now() + INTERVAL '60 days',
    true,
    false,
    ARRAY['Docker', 'Linux', 'Networking', 'Research Publication'],
    ARRAY['Cloud / DevOps Engineer']
  )
ON CONFLICT (id) DO NOTHING;
