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
