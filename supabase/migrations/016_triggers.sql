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
