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
