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
