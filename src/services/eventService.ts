import { supabase } from '../lib/supabase';
import type { Database, EventAttendanceStatus } from '../types/database';

export type EventRow = Database['public']['Tables']['events']['Row'];

export const eventService = {
  /**
   * Fetch upcoming events with filters
   */
  async getUpcomingEvents(filter?: { collegeId?: string; clubId?: string; category?: string }) {
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(id, username, display_name, avatar_url),
        club:clubs(id, name, slug, image_url),
        college:colleges(id, name, short_name)
      `)
      .eq('is_cancelled', false)
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true });

    if (filter?.collegeId) {
      query = query.eq('college_id', filter.collegeId);
    }
    if (filter?.clubId) {
      query = query.eq('club_id', filter.clubId);
    }
    if (filter?.category) {
      query = query.eq('category', filter.category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * RSVP to event atomically via RPC (with capacity & waitlist check)
   */
  async rsvpEvent(eventId: string, status: EventAttendanceStatus = 'going') {
    const { data, error } = await supabase.rpc('rsvp_event', {
      p_event_id: eventId,
      p_status: status,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Cancel RSVP atomically via RPC
   */
  async cancelRsvp(eventId: string) {
    const { data, error } = await supabase.rpc('cancel_rsvp', {
      p_event_id: eventId,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get events current user has RSVPed to
   */
  async getMyEvents() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        status,
        created_at,
        event:events(*)
      `)
      .eq('user_id', user.user.id);

    if (error) throw error;
    return data;
  },
};
