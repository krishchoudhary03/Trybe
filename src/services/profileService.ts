import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type EducationRow = Database['public']['Tables']['user_education']['Row'];
export type SettingsRow = Database['public']['Tables']['user_settings']['Row'];

export const profileService = {
  /**
   * Get full profile for the currently logged-in user
   */
  async getMyProfile() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const [profileRes, eduRes, settingsRes, skillsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.user.id).single(),
      supabase.from('user_education').select('*').eq('user_id', user.user.id),
      supabase.from('user_settings').select('*').eq('user_id', user.user.id).single(),
      supabase
        .from('user_skills')
        .select('*, skill:skills(id, name, category)')
        .eq('user_id', user.user.id),
    ]);

    if (profileRes.error) throw profileRes.error;

    return {
      profile: profileRes.data,
      education: eduRes.data || [],
      settings: settingsRes.data || null,
      skills: skillsRes.data || [],
    };
  },

  /**
   * Get public profile by username
   */
  async getProfileByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        education:user_education(*),
        skills:user_skills(*, skill:skills(id, name, category))
      `)
      .eq('username', username.toLowerCase())
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update profile fields for current user
   */
  async updateProfile(updates: Database['public']['Tables']['profiles']['Update']) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user settings
   */
  async updateSettings(settings: Partial<SettingsRow>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upload user avatar to avatars bucket
   */
  async uploadAvatar(file: File) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const ext = file.name.split('.').pop() || 'webp';
    const filePath = `${user.user.id}/avatar_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Save avatar_url to profile
    await this.updateProfile({ avatar_url: publicUrl });
    return publicUrl;
  },
};
