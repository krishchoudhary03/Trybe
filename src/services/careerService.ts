import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type CareerProfileRow = Database['public']['Tables']['career_profiles']['Row'];
export type RoadmapRow = Database['public']['Tables']['career_roadmaps']['Row'];
export type RoadmapTaskRow = Database['public']['Tables']['roadmap_tasks']['Row'];
export type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];

export const careerService = {
  /**
   * Get user career profile and related skills
   */
  async getCareerProfile() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const [profileRes, skillsRes, targetRolesRes] = await Promise.all([
      supabase
        .from('career_profiles')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle(),
      supabase
        .from('user_skills')
        .select('*, skill:skills(id, name, category)')
        .eq('user_id', user.user.id),
      supabase
        .from('career_target_roles')
        .select('*')
        .eq('user_id', user.user.id),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (skillsRes.error) throw skillsRes.error;
    if (targetRolesRes.error) throw targetRolesRes.error;

    return {
      profile: profileRes.data,
      skills: skillsRes.data || [],
      targetRoles: targetRolesRes.data || [],
    };
  },

  /**
   * Get active career roadmap with phases and tasks
   */
  async getActiveRoadmap() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: roadmap, error: roadmapError } = await supabase
      .from('career_roadmaps')
      .select(`
        *,
        phases:roadmap_phases(
          id,
          title,
          sort_order,
          status,
          tasks:roadmap_tasks(
            id,
            title,
            description,
            status,
            sort_order,
            estimated_hours,
            tier,
            due_date,
            skill:skills(id, name)
          )
        )
      `)
      .eq('user_id', user.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (roadmapError) throw roadmapError;
    return roadmap;
  },

  /**
   * Complete roadmap task atomically and recalculate progress percentage
   */
  async completeTask(taskId: string) {
    const { data, error } = await supabase.rpc('complete_roadmap_task', {
      p_task_id: taskId,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Fetch opportunities with filters
   */
  async getOpportunities(filter?: {
    type?: Database['public']['Tables']['opportunities']['Row']['opportunity_type'];
    isRemote?: boolean;
    search?: string;
  }) {
    let query = supabase
      .from('opportunities')
      .select(`
        *,
        skills:opportunity_skills(
          is_required,
          teaches,
          skill:skills(id, name)
        ),
        user_status:user_opportunity_status(status)
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('posted_at', { ascending: false });

    if (filter?.type) {
      query = query.eq('opportunity_type', filter.type);
    }
    if (filter?.isRemote !== undefined) {
      query = query.eq('is_remote', filter.isRemote);
    }
    if (filter?.search) {
      query = query.ilike('title', `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Update opportunity user status (saved, applied, dismissed)
   */
  async setOpportunityStatus(
    opportunityId: string,
    status: Database['public']['Tables']['user_opportunity_status']['Row']['status'] | null
  ) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    if (status === null) {
      const { error } = await supabase
        .from('user_opportunity_status')
        .delete()
        .eq('user_id', user.user.id)
        .eq('opportunity_id', opportunityId);
      if (error) throw error;
      return null;
    }

    const { data, error } = await supabase
      .from('user_opportunity_status')
      .upsert(
        {
          user_id: user.user.id,
          opportunity_id: opportunityId,
          status,
          applied_at: status === 'applied' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,opportunity_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
