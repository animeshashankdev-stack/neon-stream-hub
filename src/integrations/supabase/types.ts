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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banned_devices: {
        Row: {
          created_at: string
          created_by: string | null
          device_hash: string
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          device_hash: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          device_hash?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      channel_favorites: {
        Row: {
          channel_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          featured: boolean | null
          id: string
          language: string | null
          poster_url: string | null
          rating: number | null
          release_year: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          thumbnail_url: string | null
          title: string
          type: Database["public"]["Enums"]["content_type"]
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          featured?: boolean | null
          id?: string
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          thumbnail_url?: string | null
          title: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          featured?: boolean | null
          id?: string
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          thumbnail_url?: string | null
          title?: string
          type?: Database["public"]["Enums"]["content_type"]
          updated_at?: string
        }
        Relationships: []
      }
      content_genres: {
        Row: {
          content_id: string
          genre_id: string
          id: string
        }
        Insert: {
          content_id: string
          genre_id: string
          id?: string
        }
        Update: {
          content_id?: string
          genre_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_genres_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
        ]
      }
      endpoint_hits: {
        Row: {
          bucket_key: string
          count: number
          created_at: string
          id: string
          window_start: string
        }
        Insert: {
          bucket_key: string
          count?: number
          created_at?: string
          id?: string
          window_start: string
        }
        Update: {
          bucket_key?: string
          count?: number
          created_at?: string
          id?: string
          window_start?: string
        }
        Relationships: []
      }
      episode_chapters: {
        Row: {
          created_at: string
          end_seconds: number | null
          episode_id: string
          id: string
          kind: string
          label: string | null
          start_seconds: number
        }
        Insert: {
          created_at?: string
          end_seconds?: number | null
          episode_id: string
          id?: string
          kind?: string
          label?: string | null
          start_seconds: number
        }
        Update: {
          created_at?: string
          end_seconds?: number | null
          episode_id?: string
          id?: string
          kind?: string
          label?: string | null
          start_seconds?: number
        }
        Relationships: []
      }
      episodes: {
        Row: {
          content_id: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          episode_number: number
          id: string
          season_number: number
          thumbnail_url: string | null
          title: string | null
        }
        Insert: {
          content_id: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          episode_number: number
          id?: string
          season_number?: number
          thumbnail_url?: string | null
          title?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          episode_number?: number
          id?: string
          season_number?: number
          thumbnail_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      iptv_channels: {
        Row: {
          channel_id: string | null
          country: string | null
          created_at: string
          group_title: string | null
          id: string
          language: string | null
          last_synced_at: string
          logo_url: string | null
          name: string
          playlist_id: string | null
          stream_url: string
        }
        Insert: {
          channel_id?: string | null
          country?: string | null
          created_at?: string
          group_title?: string | null
          id?: string
          language?: string | null
          last_synced_at?: string
          logo_url?: string | null
          name: string
          playlist_id?: string | null
          stream_url: string
        }
        Update: {
          channel_id?: string | null
          country?: string | null
          created_at?: string
          group_title?: string | null
          id?: string
          language?: string | null
          last_synced_at?: string
          logo_url?: string | null
          name?: string
          playlist_id?: string | null
          stream_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "iptv_channels_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "iptv_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      iptv_epg_programs: {
        Row: {
          category: string | null
          channel_id: string
          created_at: string
          description: string | null
          end_time: string
          id: string
          start_time: string
          title: string
        }
        Insert: {
          category?: string | null
          channel_id: string
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          title: string
        }
        Update: {
          category?: string | null
          channel_id?: string
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          title?: string
        }
        Relationships: []
      }
      iptv_playlists: {
        Row: {
          created_at: string
          epg_url: string | null
          id: string
          is_default: boolean
          last_synced_at: string | null
          m3u_url: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          epg_url?: string | null
          id?: string
          is_default?: boolean
          last_synced_at?: string | null
          m3u_url: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          epg_url?: string | null
          id?: string
          is_default?: boolean
          last_synced_at?: string | null
          m3u_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      manga_progress: {
        Row: {
          chapter_id: string
          created_at: string
          id: string
          manga_id: string
          page: number
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: string
          manga_id: string
          page?: number
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: string
          manga_id?: string
          page?: number
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_premium: boolean
          level: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean
          level?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean
          level?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      read_history: {
        Row: {
          created_at: string
          id: string
          pages_read: number
          read_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pages_read?: number
          read_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pages_read?: number
          read_date?: string
          user_id?: string
        }
        Relationships: []
      }
      stream_tokens: {
        Row: {
          created_at: string
          episode_id: string
          expires_at: string
          id: string
          ip_hash: string | null
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          expires_at: string
          id?: string
          ip_hash?: string | null
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          expires_at?: string
          id?: string
          ip_hash?: string | null
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_servers: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          language: string
          quality: string
          server_name: string
          stream_url: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          language?: string
          quality?: string
          server_name?: string
          stream_url: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          language?: string
          quality?: string
          server_name?: string
          stream_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_servers_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_history: {
        Row: {
          completed: boolean
          created_at: string
          episode_id: string
          id: string
          last_watched_at: string
          progress_seconds: number
          total_seconds: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          episode_id: string
          id?: string
          last_watched_at?: string
          progress_seconds?: number
          total_seconds?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          episode_id?: string
          id?: string
          last_watched_at?: string
          progress_seconds?: number
          total_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_parties: {
        Row: {
          code: string
          content_id: string
          created_at: string
          episode_id: string
          host_id: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          code: string
          content_id: string
          created_at?: string
          episode_id: string
          host_id: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          content_id?: string
          created_at?: string
          episode_id?: string
          host_id?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      watch_party_messages: {
        Row: {
          body: string
          created_at: string
          display_name: string | null
          id: string
          party_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          display_name?: string | null
          id?: string
          party_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          display_name?: string | null
          id?: string
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_party_messages_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "watch_parties"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          is_admin: boolean
          is_premium: boolean
          user_id: string
        }[]
      }
      admin_set_premium: {
        Args: { _is_premium: boolean; _target: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _target: string
        }
        Returns: undefined
      }
      get_episode_servers: {
        Args: { _episode_id: string }
        Returns: {
          embed_url: string
          episode_id: string
          id: string
          language: string
          quality: string
          server_name: string
        }[]
      }
      has_active_ban: {
        Args: { _device_hash: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_moderator: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "banned"
      content_status: "ongoing" | "completed" | "upcoming"
      content_type: "movie" | "series"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "banned"],
      content_status: ["ongoing", "completed", "upcoming"],
      content_type: ["movie", "series"],
    },
  },
} as const
