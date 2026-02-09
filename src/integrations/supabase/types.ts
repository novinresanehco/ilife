export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      behavior_events: {
        Row: {
          chain_impact: number | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          importance: number | null
          page_context: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          chain_impact?: number | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          importance?: number | null
          page_context?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          chain_impact?: number | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          importance?: number | null
          page_context?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      behavioral_hypotheses: {
        Row: {
          confidence: number | null
          council_member: string | null
          created_at: string | null
          evidence: Json | null
          id: string
          pattern: string
          resolved_at: string | null
          status: string | null
          suggested_action: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          council_member?: string | null
          created_at?: string | null
          evidence?: Json | null
          id?: string
          pattern: string
          resolved_at?: string | null
          status?: string | null
          suggested_action?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          council_member?: string | null
          created_at?: string | null
          evidence?: Json | null
          id?: string
          pattern?: string
          resolved_at?: string | null
          status?: string | null
          suggested_action?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          linked_goal_id: string | null
          linked_task_id: string | null
          recurrence_rule: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          linked_goal_id?: string | null
          linked_task_id?: string | null
          recurrence_rule?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          linked_goal_id?: string | null
          linked_task_id?: string | null
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_linked_goal_id_fkey"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          council_member: string | null
          created_at: string | null
          from_system: boolean | null
          has_voice: boolean | null
          id: string
          importance: number | null
          user_id: string
        }
        Insert: {
          content: string
          council_member?: string | null
          created_at?: string | null
          from_system?: boolean | null
          has_voice?: boolean | null
          id?: string
          importance?: number | null
          user_id: string
        }
        Update: {
          content?: string
          council_member?: string | null
          created_at?: string | null
          from_system?: boolean | null
          has_voice?: boolean | null
          id?: string
          importance?: number | null
          user_id?: string
        }
        Relationships: []
      }
      contextual_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          category: string | null
          context_page: string | null
          council_member: string | null
          created_at: string | null
          id: string
          options: Json | null
          question_text: string
          question_type: string
          skipped: boolean | null
          trigger_condition: Json | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          category?: string | null
          context_page?: string | null
          council_member?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          question_text: string
          question_type: string
          skipped?: boolean | null
          trigger_condition?: Json | null
          user_id: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          category?: string | null
          context_page?: string | null
          council_member?: string | null
          created_at?: string | null
          id?: string
          options?: Json | null
          question_text?: string
          question_type?: string
          skipped?: boolean | null
          trigger_condition?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          description: string | null
          goal_type: string | null
          hierarchy_level: number | null
          id: string
          parent_id: string | null
          priority: number | null
          progress: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          goal_type?: string | null
          hierarchy_level?: number | null
          id?: string
          parent_id?: string | null
          priority?: number | null
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          goal_type?: string | null
          hierarchy_level?: number | null
          id?: string
          parent_id?: string | null
          priority?: number | null
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          linked_goal_id: string | null
          status: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          linked_goal_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          linked_goal_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_linked_goal_id_fkey"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      nudges: {
        Row: {
          action_data: Json | null
          action_type: string | null
          auto_open: boolean | null
          content: string
          council_member: string | null
          created_at: string | null
          dismissed_at: string | null
          id: string
          importance: number | null
          nudge_type: string
          read_at: string | null
          related_goal_id: string | null
          related_task_id: string | null
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type?: string | null
          auto_open?: boolean | null
          content: string
          council_member?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          importance?: number | null
          nudge_type: string
          read_at?: string | null
          related_goal_id?: string | null
          related_task_id?: string | null
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string | null
          auto_open?: boolean | null
          content?: string
          council_member?: string | null
          created_at?: string | null
          dismissed_at?: string | null
          id?: string
          importance?: number | null
          nudge_type?: string
          read_at?: string | null
          related_goal_id?: string | null
          related_task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nudges_related_goal_id_fkey"
            columns: ["related_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nudges_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      perception_models: {
        Row: {
          agreeableness: number | null
          confidence_score: number | null
          conscientiousness: number | null
          consistency: number | null
          created_at: string | null
          energy_level: number | null
          extraversion: number | null
          id: string
          last_analysis_at: string | null
          motivation: number | null
          neuroticism: number | null
          openness: number | null
          overwhelm: number | null
          perfectionism: number | null
          procrastination: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agreeableness?: number | null
          confidence_score?: number | null
          conscientiousness?: number | null
          consistency?: number | null
          created_at?: string | null
          energy_level?: number | null
          extraversion?: number | null
          id?: string
          last_analysis_at?: string | null
          motivation?: number | null
          neuroticism?: number | null
          openness?: number | null
          overwhelm?: number | null
          perfectionism?: number | null
          procrastination?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agreeableness?: number | null
          confidence_score?: number | null
          conscientiousness?: number | null
          consistency?: number | null
          created_at?: string | null
          energy_level?: number | null
          extraversion?: number | null
          id?: string
          last_analysis_at?: string | null
          motivation?: number | null
          neuroticism?: number | null
          openness?: number | null
          overwhelm?: number | null
          perfectionism?: number | null
          procrastination?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personality_answers: {
        Row: {
          answer_type: string
          answer_value: string
          confidence: number | null
          created_at: string | null
          id: string
          question_id: string
          source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer_type: string
          answer_value: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          question_id: string
          source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer_type?: string
          answer_value?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          question_id?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          language: string | null
          onboarding_completed: boolean | null
          role: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          language?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          language?: string | null
          onboarding_completed?: boolean | null
          role?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          linked_goal_id: string | null
          milestones: Json | null
          progress: number | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          linked_goal_id?: string | null
          milestones?: Json | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          linked_goal_id?: string | null
          milestones?: Json | null
          progress?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_linked_goal_id_fkey"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_minutes: number | null
          completed_at: string | null
          created_at: string | null
          defer_count: number | null
          description: string | null
          due_date: string | null
          due_time: string | null
          estimated_minutes: number | null
          goal_id: string | null
          id: string
          importance: number | null
          kanban_column: string | null
          order_index: number | null
          parent_task_id: string | null
          priority: number | null
          status: string | null
          subtask_options: Json | null
          subtask_type: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_minutes?: number | null
          completed_at?: string | null
          created_at?: string | null
          defer_count?: number | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          importance?: number | null
          kanban_column?: string | null
          order_index?: number | null
          parent_task_id?: string | null
          priority?: number | null
          status?: string | null
          subtask_options?: Json | null
          subtask_type?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_minutes?: number | null
          completed_at?: string | null
          created_at?: string | null
          defer_count?: number | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          estimated_minutes?: number | null
          goal_id?: string | null
          id?: string
          importance?: number | null
          kanban_column?: string | null
          order_index?: number | null
          parent_task_id?: string | null
          priority?: number | null
          status?: string | null
          subtask_options?: Json | null
          subtask_type?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          pages_visited: string[] | null
          productive_minutes: number | null
          session_end: string | null
          session_start: string | null
          total_events: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pages_visited?: string[] | null
          productive_minutes?: number | null
          session_end?: string | null
          session_start?: string | null
          total_events?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pages_visited?: string[] | null
          productive_minutes?: number | null
          session_end?: string | null
          session_start?: string | null
          total_events?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
