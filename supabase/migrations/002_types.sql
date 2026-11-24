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
