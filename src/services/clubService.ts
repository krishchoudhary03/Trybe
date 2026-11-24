import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type ClubRow = Database['public']['Tables']['clubs']['Row'];

export const clubService = {
  /**
   * Fetch all active clubs with optional college or category filter
   */
  async getClubs(filter?: { collegeId?: string; category?: string; search?: string }) {
    let query = supabase
      .from('clubs')
      .select(`
        *,
        college:colleges(id, name, short_name, location_city)
      `)
      .eq('is_active', true)
      .order('member_count', { ascending: false });

    if (filter?.collegeId) {
      query = query.eq('college_id', filter.collegeId);
    }
    if (filter?.category) {
      query = query.eq('category', filter.category);
    }
    if (filter?.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Get single club with member roster and college info
   */
  async getClubBySlug(slug: string) {
    const { data, error } = await supabase
      .from('clubs')
      .select(`
        *,
        college:colleges(*),
        members:club_members(
          role,
          joined_at,
          profile:profiles(id, username, display_name, avatar_url)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Join club atomically via RPC
   */
  async joinClub(clubId: string) {
    const { data, error } = await supabase.rpc('join_club', {
      p_club_id: clubId,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Leave club atomically via RPC
   */
  async leaveClub(clubId: string) {
    const { data, error } = await supabase.rpc('leave_club', {
      p_club_id: clubId,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Get clubs joined by current authenticated user
   */
  async getMyClubs() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('club_members')
      .select(`
        role,
        joined_at,
        club:clubs(*)
      `)
      .eq('user_id', user.user.id);

    if (error) throw error;
    return data;
  },
};
