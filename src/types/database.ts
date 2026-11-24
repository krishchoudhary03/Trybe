export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PostVisibility = 'public' | 'college' | 'club' | 'connections' | 'private';
export type PostStatus = 'draft' | 'published' | 'archived' | 'removed';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected' | 'blocked' | 'cancelled';
export type ClubMemberRole = 'owner' | 'president' | 'admin' | 'moderator' | 'member';
export type ClubJoinPolicy = 'open' | 'approval' | 'invite';
export type EventAttendanceStatus = 'going' | 'interested' | 'not_going' | 'waitlisted';
export type ProjectStatus = 'idea' | 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ProjectVisibility = 'public' | 'college' | 'private' | 'team';
export type OpportunityType = 'internship' | 'job' | 'hackathon' | 'certification' | 'competition' | 'project' | 'research';
export type OpportunityUserStatus = 'saved' | 'applied' | 'dismissed' | 'interviewing' | 'offered' | 'accepted' | 'rejected';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'blocked';
export type AiMessageRole = 'user' | 'assistant' | 'system';
export type AiRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type NotificationType =
  | 'connection_request' | 'connection_accepted'
  | 'post_liked' | 'post_commented' | 'post_mentioned'
  | 'club_joined' | 'club_invite' | 'club_role_changed'
  | 'event_reminder' | 'event_rsvp'
  | 'message_received'
  | 'mention'
  | 'career_milestone' | 'assessment_complete'
  | 'mentor_session' | 'mentor_action_due'
  | 'opportunity_match' | 'opportunity_deadline'
  | 'system';
export type ConversationType = 'direct' | 'group';
export type SkillSource = 'profile' | 'project' | 'assessment' | 'certificate' | 'ai' | 'mentor' | 'manual';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type AcademicStatus = 'current' | 'alumni' | 'faculty' | 'staff';
export type ProfileVisibility = 'public' | 'college' | 'connections' | 'private';
export type AccountStatus = 'active' | 'suspended' | 'deactivated' | 'deleted';
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'file';
export type ReactionType = 'like' | 'love' | 'celebrate' | 'insightful' | 'curious';
export type GoalStatus = 'active' | 'completed' | 'abandoned' | 'paused';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type MentorSessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          first_name: string | null;
          last_name: string | null;
          bio: string | null;
          headline: string | null;
          avatar_url: string | null;
          cover_image_url: string | null;
          location_country: string | null;
          location_state: string | null;
          location_city: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          profile_visibility: ProfileVisibility;
          account_status: AccountStatus;
          onboarding_status: OnboardingStatus;
          is_verified: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          first_name?: string | null;
          last_name?: string | null;
          bio?: string | null;
          headline?: string | null;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          location_country?: string | null;
          location_state?: string | null;
          location_city?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          profile_visibility?: ProfileVisibility;
          account_status?: AccountStatus;
          onboarding_status?: OnboardingStatus;
          is_verified?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      user_education: {
        Row: {
          id: string;
          user_id: string;
          college_id: string | null;
          college_name: string;
          university: string | null;
          department: string | null;
          major: string | null;
          degree: string | null;
          enrollment_year: number | null;
          graduation_year: number | null;
          academic_status: AcademicStatus;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          college_id?: string | null;
          college_name: string;
          university?: string | null;
          department?: string | null;
          major?: string | null;
          degree?: string | null;
          enrollment_year?: number | null;
          graduation_year?: number | null;
          academic_status?: AcademicStatus;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_education']['Insert']>;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          notification_connections: boolean;
          notification_messages: boolean;
          notification_posts: boolean;
          notification_clubs: boolean;
          notification_events: boolean;
          notification_career: boolean;
          notification_mentions: boolean;
          notification_email: boolean;
          privacy_show_online: boolean;
          privacy_allow_messages: string;
          privacy_allow_connection_requests: boolean;
          privacy_show_activity: boolean;
          content_language: string;
          content_nsfw_filter: boolean;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['user_settings']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['user_settings']['Row']>;
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string | null;
          visibility: PostVisibility;
          status: PostStatus;
          college_id: string | null;
          club_id: string | null;
          project_id: string | null;
          location: string | null;
          is_pinned: boolean;
          comments_enabled: boolean;
          content_warning: string | null;
          moderation_status: string;
          reply_to_post_id: string | null;
          reactions_count: number;
          comments_count: number;
          published_at: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          author_id: string;
          content?: string | null;
          visibility?: PostVisibility;
          status?: PostStatus;
          college_id?: string | null;
          club_id?: string | null;
          project_id?: string | null;
          location?: string | null;
          is_pinned?: boolean;
          comments_enabled?: boolean;
          content_warning?: string | null;
          moderation_status?: string;
          reply_to_post_id?: string | null;
          reactions_count?: number;
          comments_count?: number;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['posts']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          parent_comment_id: string | null;
          content: string;
          depth: number;
          reactions_count: number;
          moderation_status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          parent_comment_id?: string | null;
          content: string;
          depth?: number;
          reactions_count?: number;
          moderation_status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      post_reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reaction: ReactionType;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          reaction?: ReactionType;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['post_reactions']['Insert']>;
      };
      connections: {
        Row: {
          id: string;
          requester_id: string;
          recipient_id: string;
          status: ConnectionStatus;
          created_at: string;
          updated_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          requester_id: string;
          recipient_id: string;
          status?: ConnectionStatus;
          created_at?: string;
          updated_at?: string;
          accepted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['connections']['Insert']>;
      };
      colleges: {
        Row: {
          id: string;
          name: string;
          short_name: string | null;
          university: string | null;
          location_city: string | null;
          location_state: string | null;
          location_country: string;
          description: string | null;
          website: string | null;
          image_url: string | null;
          cover_image_url: string | null;
          established_year: number | null;
          student_count: number;
          is_verified: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          short_name?: string | null;
          university?: string | null;
          location_city?: string | null;
          location_state?: string | null;
          location_country?: string;
          description?: string | null;
          website?: string | null;
          image_url?: string | null;
          cover_image_url?: string | null;
          established_year?: number | null;
          student_count?: number;
          is_verified?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['colleges']['Insert']>;
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          category: string | null;
          college_id: string | null;
          image_url: string | null;
          cover_image_url: string | null;
          join_policy: ClubJoinPolicy;
          is_active: boolean;
          member_count: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          category?: string | null;
          college_id?: string | null;
          image_url?: string | null;
          cover_image_url?: string | null;
          join_policy?: ClubJoinPolicy;
          is_active?: boolean;
          member_count?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['clubs']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          organizer_id: string;
          club_id: string | null;
          college_id: string | null;
          category: string | null;
          image_url: string | null;
          location: string | null;
          location_url: string | null;
          is_virtual: boolean;
          start_at: string;
          end_at: string;
          timezone: string;
          capacity: number | null;
          registration_deadline: string | null;
          is_cancelled: boolean;
          is_featured: boolean;
          attendee_count: number;
          interested_count: number;
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          organizer_id: string;
          club_id?: string | null;
          college_id?: string | null;
          category?: string | null;
          image_url?: string | null;
          location?: string | null;
          location_url?: string | null;
          is_virtual?: boolean;
          start_at: string;
          end_at: string;
          timezone?: string;
          capacity?: number | null;
          registration_deadline?: string | null;
          is_cancelled?: boolean;
          is_featured?: boolean;
          attendee_count?: number;
          interested_count?: number;
          tags?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          owner_id: string;
          college_id: string | null;
          status: ProjectStatus;
          visibility: ProjectVisibility;
          project_type: string | null;
          campus_type: string | null;
          team_size_required: number | null;
          team_size_current: number;
          deadline: string | null;
          repository_url: string | null;
          live_url: string | null;
          image_url: string | null;
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          owner_id: string;
          college_id?: string | null;
          status?: ProjectStatus;
          visibility?: ProjectVisibility;
          project_type?: string | null;
          campus_type?: string | null;
          team_size_required?: number | null;
          team_size_current?: number;
          deadline?: string | null;
          repository_url?: string | null;
          live_url?: string | null;
          image_url?: string | null;
          tags?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          type: ConversationType;
          title: string | null;
          image_url: string | null;
          created_by: string;
          last_message_at: string | null;
          last_message_preview: string | null;
          is_archived: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type?: ConversationType;
          title?: string | null;
          image_url?: string | null;
          created_by: string;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          is_archived?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          reply_to_message_id: string | null;
          is_edited: boolean;
          is_system_message: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          reply_to_message_id?: string | null;
          is_edited?: boolean;
          is_system_message?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          actor_id: string | null;
          type: NotificationType;
          title: string;
          body: string | null;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json;
          read_at: string | null;
          clicked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          actor_id?: string | null;
          type: NotificationType;
          title: string;
          body?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          read_at?: string | null;
          clicked_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          description: string | null;
          is_canonical: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          description?: string | null;
          is_canonical?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['skills']['Insert']>;
      };
      user_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          level: ExperienceLevel;
          proficiency: number | null;
          source: SkillSource;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          level?: ExperienceLevel;
          proficiency?: number | null;
          source?: SkillSource;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_skills']['Insert']>;
      };
      career_roadmaps: {
        Row: {
          id: string;
          user_id: string;
          target_role: string;
          target_role_id: string | null;
          title: string;
          description: string | null;
          is_active: boolean;
          estimated_weeks: number | null;
          progress_pct: number;
          source: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_role: string;
          target_role_id?: string | null;
          title: string;
          description?: string | null;
          is_active?: boolean;
          estimated_weeks?: number | null;
          progress_pct?: number;
          source?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['career_roadmaps']['Insert']>;
      };
      roadmap_tasks: {
        Row: {
          id: string;
          roadmap_id: string;
          phase_id: string;
          skill_id: string | null;
          title: string;
          description: string | null;
          sort_order: number;
          tier: number;
          origin: string;
          estimated_hours: number | null;
          status: TaskStatus;
          skill_gain: number | null;
          resource_url: string | null;
          notes: string | null;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          roadmap_id: string;
          phase_id: string;
          skill_id?: string | null;
          title: string;
          description?: string | null;
          sort_order?: number;
          tier?: number;
          origin?: string;
          estimated_hours?: number | null;
          status?: TaskStatus;
          skill_gain?: number | null;
          resource_url?: string | null;
          notes?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['roadmap_tasks']['Insert']>;
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          organization: string | null;
          description: string | null;
          opportunity_type: OpportunityType;
          experience_level: ExperienceLevel | null;
          location: string | null;
          is_remote: boolean;
          url: string | null;
          internal_path: string | null;
          source: string;
          deadline: string | null;
          posted_at: string;
          salary_range: Json | null;
          tags: string[];
          roles: string[];
          is_active: boolean;
          is_featured: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          organization?: string | null;
          description?: string | null;
          opportunity_type: OpportunityType;
          experience_level?: ExperienceLevel | null;
          location?: string | null;
          is_remote?: boolean;
          url?: string | null;
          internal_path?: string | null;
          source?: string;
          deadline?: string | null;
          posted_at?: string;
          salary_range?: Json | null;
          tags?: string[];
          roles?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['opportunities']['Insert']>;
      };
      user_opportunity_status: {
        Row: {
          id: string;
          user_id: string;
          opportunity_id: string;
          status: OpportunityUserStatus;
          notes: string | null;
          applied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opportunity_id: string;
          status?: OpportunityUserStatus;
          notes?: string | null;
          applied_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_opportunity_status']['Insert']>;
      };
    };
    Functions: {
      toggle_post_reaction: {
        Args: { p_post_id: string; p_reaction?: ReactionType };
        Returns: Json;
      };
      toggle_comment_reaction: {
        Args: { p_comment_id: string; p_reaction?: ReactionType };
        Returns: Json;
      };
      send_connection_request: {
        Args: { p_recipient_id: string };
        Returns: Json;
      };
      accept_connection_request: {
        Args: { p_connection_id: string };
        Returns: Json;
      };
      reject_connection_request: {
        Args: { p_connection_id: string };
        Returns: Json;
      };
      join_club: {
        Args: { p_club_id: string };
        Returns: Json;
      };
      leave_club: {
        Args: { p_club_id: string };
        Returns: Json;
      };
      rsvp_event: {
        Args: { p_event_id: string; p_status?: EventAttendanceStatus };
        Returns: Json;
      };
      cancel_rsvp: {
        Args: { p_event_id: string };
        Returns: Json;
      };
      send_message: {
        Args: { p_conversation_id: string; p_content: string; p_reply_to?: string | null };
        Returns: string;
      };
      get_or_create_direct_conversation: {
        Args: { p_other_user_id: string };
        Returns: string;
      };
      mark_notifications_read: {
        Args: { p_notification_ids?: string[] | null };
        Returns: number;
      };
      complete_roadmap_task: {
        Args: { p_task_id: string };
        Returns: Json;
      };
      add_comment: {
        Args: { p_post_id: string; p_content: string; p_parent_comment_id?: string | null };
        Returns: string;
      };
    };
  };
}
