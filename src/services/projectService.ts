import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type ProjectRow = Database['public']['Tables']['projects']['Row'];

export const projectService = {
  /**
   * Fetch active collaborative projects with members and tech stack
   */
  async getProjects(filter?: { campusType?: string; status?: string; search?: string }) {
    let query = supabase
      .from('projects')
      .select(`
        *,
        owner:profiles!projects_owner_id_fkey(id, username, display_name, avatar_url),
        technologies:project_technologies(name),
        members:project_members(
          role,
          profile:profiles(id, username, display_name, avatar_url)
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filter?.campusType) {
      query = query.eq('campus_type', filter.campusType);
    }
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    if (filter?.search) {
      query = query.ilike('title', `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Create a new project with technologies
   */
  async createProject(params: {
    title: string;
    description?: string;
    technologies: string[];
    teamSizeRequired?: number;
    deadline?: string;
    campusType?: string;
    projectType?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        owner_id: user.user.id,
        title: params.title,
        description: params.description || null,
        team_size_required: params.teamSizeRequired || null,
        deadline: params.deadline || null,
        campus_type: params.campusType || null,
        project_type: params.projectType || null,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Add owner to project_members
    await supabase.from('project_members').insert({
      project_id: project.id,
      user_id: user.user.id,
      role: 'owner',
    });

    // Add tech tags
    if (params.technologies && params.technologies.length > 0) {
      const techInserts = params.technologies.map((tech) => ({
        project_id: project.id,
        name: tech.trim(),
      }));
      await supabase.from('project_technologies').insert(techInserts);
    }

    return project;
  },

  /**
   * Join a project team
   */
  async joinProject(projectId: string, role = 'member') {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: user.user.id,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
