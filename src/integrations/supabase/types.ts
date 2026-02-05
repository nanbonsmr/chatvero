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
      chatbot_channels: {
        Row: {
          chatbot_id: string
          connected_at: string | null
          created_at: string
          credentials: Json | null
          id: string
          is_active: boolean
          page_id: string | null
          page_name: string | null
          platform: string
          updated_at: string
          webhook_token: string | null
        }
        Insert: {
          chatbot_id: string
          connected_at?: string | null
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean
          page_id?: string | null
          page_name?: string | null
          platform: string
          updated_at?: string
          webhook_token?: string | null
        }
        Update: {
          chatbot_id?: string
          connected_at?: string | null
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean
          page_id?: string | null
          page_name?: string | null
          platform?: string
          updated_at?: string
          webhook_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_channels_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_chunks: {
        Row: {
          chatbot_id: string
          chunk_index: number
          content: string
          created_at: string
          document_id: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source_type: string
          source_url: string | null
        }
        Insert: {
          chatbot_id: string
          chunk_index?: number
          content: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_type?: string
          source_url?: string | null
        }
        Update: {
          chatbot_id?: string
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_type?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_chunks_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "chatbot_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_documents: {
        Row: {
          chatbot_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          status: string
        }
        Insert: {
          chatbot_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          status?: string
        }
        Update: {
          chatbot_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_documents_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          auto_show_welcome: boolean | null
          created_at: string
          follow_up_message: string | null
          goal: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          tone: string
          updated_at: string
          user_id: string
          website_url: string
          welcome_delay_seconds: number | null
          welcome_message: string | null
        }
        Insert: {
          auto_show_welcome?: boolean | null
          created_at?: string
          follow_up_message?: string | null
          goal?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          tone?: string
          updated_at?: string
          user_id: string
          website_url: string
          welcome_delay_seconds?: number | null
          welcome_message?: string | null
        }
        Update: {
          auto_show_welcome?: boolean | null
          created_at?: string
          follow_up_message?: string | null
          goal?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          tone?: string
          updated_at?: string
          user_id?: string
          website_url?: string
          welcome_delay_seconds?: number | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      conversation_analytics: {
        Row: {
          avg_sources_used: number | null
          chatbot_id: string
          context_hit_count: number | null
          conversation_count: number | null
          created_at: string
          date: string
          id: string
          intent: string
          lead_conversion_count: number | null
          message_count: number | null
          updated_at: string
        }
        Insert: {
          avg_sources_used?: number | null
          chatbot_id: string
          context_hit_count?: number | null
          conversation_count?: number | null
          created_at?: string
          date?: string
          id?: string
          intent: string
          lead_conversion_count?: number | null
          message_count?: number | null
          updated_at?: string
        }
        Update: {
          avg_sources_used?: number | null
          chatbot_id?: string
          context_hit_count?: number | null
          conversation_count?: number | null
          created_at?: string
          date?: string
          id?: string
          intent?: string
          lead_conversion_count?: number | null
          message_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_analytics_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_at: string | null
          category: string | null
          chatbot_id: string
          ended_at: string | null
          has_lead: boolean | null
          id: string
          message_count: number | null
          page_url: string | null
          platform: string | null
          primary_intent: string | null
          started_at: string
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          archived_at?: string | null
          category?: string | null
          chatbot_id: string
          ended_at?: string | null
          has_lead?: boolean | null
          id?: string
          message_count?: number | null
          page_url?: string | null
          platform?: string | null
          primary_intent?: string | null
          started_at?: string
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          archived_at?: string | null
          category?: string | null
          chatbot_id?: string
          ended_at?: string | null
          has_lead?: boolean | null
          id?: string
          message_count?: number | null
          page_url?: string | null
          platform?: string | null
          primary_intent?: string | null
          started_at?: string
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      crawled_pages: {
        Row: {
          chatbot_id: string
          content: string
          crawled_at: string
          id: string
          title: string | null
          url: string
        }
        Insert: {
          chatbot_id: string
          content: string
          crawled_at?: string
          id?: string
          title?: string | null
          url: string
        }
        Update: {
          chatbot_id?: string
          content?: string
          crawled_at?: string
          id?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawled_pages_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          chatbot_id: string
          company_name: string | null
          conversation_id: string | null
          created_at: string
          custom_data: Json | null
          email: string | null
          enriched_data: Json | null
          enrichment_status: string | null
          id: string
          linkedin_url: string | null
          name: string | null
          phone: string | null
        }
        Insert: {
          chatbot_id: string
          company_name?: string | null
          conversation_id?: string | null
          created_at?: string
          custom_data?: Json | null
          email?: string | null
          enriched_data?: Json | null
          enrichment_status?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          phone?: string | null
        }
        Update: {
          chatbot_id?: string
          company_name?: string | null
          conversation_id?: string | null
          created_at?: string
          custom_data?: Json | null
          email?: string | null
          enriched_data?: Json | null
          enrichment_status?: string | null
          id?: string
          linkedin_url?: string | null
          name?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          has_context: boolean | null
          id: string
          intent: string | null
          role: string
          sources_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          has_context?: boolean | null
          id?: string
          intent?: string | null
          role: string
          sources_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          has_context?: boolean | null
          id?: string
          intent?: string | null
          role?: string
          sources_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          dodo_transaction_id: string | null
          expires_at: string | null
          id: string
          plan: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dodo_transaction_id?: string | null
          expires_at?: string | null
          id?: string
          plan: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dodo_transaction_id?: string | null
          expires_at?: string | null
          id?: string
          plan?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_chunks: {
        Args: {
          match_chatbot_id: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
          source_type: string
          source_url: string
        }[]
      }
      owns_chatbot: { Args: { chatbot_uuid: string }; Returns: boolean }
      update_conversation_analytics: {
        Args: {
          p_chatbot_id: string
          p_has_context?: boolean
          p_intent: string
          p_is_lead?: boolean
          p_sources_used?: number
        }
        Returns: undefined
      }
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
