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
