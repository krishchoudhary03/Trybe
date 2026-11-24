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
