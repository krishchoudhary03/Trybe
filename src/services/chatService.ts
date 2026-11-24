import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type ConversationRow = Database['public']['Tables']['conversations']['Row'];

export interface MessageWithSender extends MessageRow {
  sender: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  message_attachments: {
    id: string;
    file_name: string;
    file_url: string;
    media_type: string | null;
  }[];
}

export const chatService = {
  /**
   * Get active conversations for the authenticated user
   */
  async getConversations() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_members!inner(user_id, last_read_at, left_at),
        all_members:conversation_members(
          user_id,
          profile:profiles(id, username, display_name, avatar_url)
        )
      `)
      .eq('conversation_members.user_id', user.user.id)
      .is('conversation_members.left_at', null)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get or create a direct conversation with another user
   */
  async getOrCreateDirectConversation(otherUserId: string) {
    const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
      p_other_user_id: otherUserId,
    });
    if (error) throw error;
    return data as string;
  },

  /**
   * Fetch messages for a conversation with cursor pagination
   */
  async getMessages(conversationId: string, limit = 30, cursorCreatedAt?: string) {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, display_name, avatar_url),
        message_attachments(id, file_name, file_url, media_type)
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursorCreatedAt) {
      query = query.lt('created_at', cursorCreatedAt);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).reverse() as unknown as MessageWithSender[];
  },

  /**
   * Send a message atomically via RPC
   */
  async sendMessage(conversationId: string, content: string, replyToMessageId?: string) {
    const { data, error } = await supabase.rpc('send_message', {
      p_conversation_id: conversationId,
      p_content: content,
      p_reply_to: replyToMessageId || null,
    });
    if (error) throw error;
    return data as string;
  },

  /**
   * Subscribe to real-time incoming messages for a conversation
   */
  subscribeToConversation(
    conversationId: string,
    onNewMessage: (message: MessageRow) => void
  ) {
    return supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onNewMessage(payload.new as MessageRow);
        }
      )
      .subscribe();
  },
};
