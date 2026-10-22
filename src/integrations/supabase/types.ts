export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          item_data: Json
          item_id: number
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_data: Json
          item_id: number
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_data?: Json
          item_id?: number
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_watched: {
        Row: {
          id: string
          item_data: Json
          item_id: number
          item_type: string
          rating: number | null
          user_id: string
          watched_date: string | null
        }
        Insert: {
          id?: string
          item_data: Json
          item_id: number
          item_type: string
          rating?: number | null
          user_id: string
          watched_date?: string | null
        }
        Update: {
          id?: string
          item_data?: Json
          item_id?: number
          item_type?: string
          rating?: number | null
          user_id?: string
          watched_date?: string | null
        }
        Relationships: []
      }
      user_watchlist: {
        Row: {
          created_at: string | null
          id: string
          item_data: Json
          item_id: number
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_data: Json
          item_id: number
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_data?: Json
          item_id?: number
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          user_id: string
          settings: Json
          updated_at: string
        }
        Insert: {
          user_id: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          user_id?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_custom_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          items: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          items?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          items?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          id: string
          username: string
          nickname: string | null
          bio: string | null
          profile_image: string | null
          cover_image: string | null
          social_media: Json | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          nickname?: string | null
          bio?: string | null
          profile_image?: string | null
          cover_image?: string | null
          social_media?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          nickname?: string | null
          bio?: string | null
          profile_image?: string | null
          cover_image?: string | null
          social_media?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reported_movies: {
        Row: {
          id: number
          title: string
          status: string | null
          reports_count: number | null
          updated_at: string | null
        }
        Insert: {
          id: number
          title: string
          status?: string | null
          reports_count?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          status?: string | null
          reports_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_favorites: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          item_id: number
          item_type: string
          title?: string
          poster_path?: string
          vote_average?: number
          release_date?: string
          genre_ids?: number[]
          item_data?: Json
        }[]
      }
      get_public_watched: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          item_id: number
          item_type: string
          title?: string
          poster_path?: string
          vote_average?: number
          release_date?: string
          rating?: number | null
          genre_ids?: number[]
          item_data?: Json
        }[]
      }
      increment_movie_report: {
        Args: {
          p_movie_id: number
          p_title: string
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
