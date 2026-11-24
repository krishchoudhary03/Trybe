import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export const notificationService = {
  /**
   * Get notifications for authenticated user
   */
  async getNotifications(limit = 30) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url)
      `)
      .eq('recipient_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.user.id)
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Mark notifications as read using RPC
   */
  async markAsRead(notificationIds?: string[]) {
    const { data, error } = await supabase.rpc('mark_notifications_read', {
      p_notification_ids: notificationIds || null,
    });
    if (error) throw error;
    return data as number;
  },

  /**
   * Subscribe to incoming notifications in realtime
   */
  subscribeToNotifications(
    userId: string,
    onNewNotification: (notification: NotificationRow) => void
  ) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          onNewNotification(payload.new as NotificationRow);
        }
      )
      .subscribe();
  },
};
