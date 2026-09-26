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
      account_profiles: {
        Row: { id: string; full_name: string | null; username: string | null; plan: string; status: string; valid_until: string | null; active_license_id: string | null; created_at: string; updated_at: string }
        Insert: { id: string; full_name?: string | null; username?: string | null; plan?: string; status?: string; valid_until?: string | null; active_license_id?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; full_name?: string | null; username?: string | null; plan?: string; status?: string; valid_until?: string | null; active_license_id?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      license_events: {
        Row: { id: string; license_id: string; event_type: string; actor_user_id: string | null; metadata: Json; created_at: string }
        Insert: { id?: string; license_id: string; event_type: string; actor_user_id?: string | null; metadata?: Json; created_at?: string }
        Update: { id?: string; license_id?: string; event_type?: string; actor_user_id?: string | null; metadata?: Json; created_at?: string }
        Relationships: []
      }
      audit_logs: {
        Row: { id: string; actor_user_id: string | null; action: string; target_user_id: string | null; target_license_id: string | null; metadata: Json; created_at: string }
        Insert: { id?: string; actor_user_id?: string | null; action: string; target_user_id?: string | null; target_license_id?: string | null; metadata?: Json; created_at?: string }
        Update: { id?: string; actor_user_id?: string | null; action?: string; target_user_id?: string | null; target_license_id?: string | null; metadata?: Json; created_at?: string }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string
          created_by: string
          customer_email: string | null
          duration_days: number
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          plan: string
          redeemed_at: string | null
          redeemed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          customer_email?: string | null
          duration_days: number
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          plan: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          customer_email?: string | null
          duration_days?: number
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          plan?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_account: {
        Args: Record<PropertyKey, never>
        Returns: { user_id: string; full_name: string | null; email: string | null; username: string | null; plan: string; status: string; valid_until: string | null; license_id: string | null; license_prefix: string | null; license_valid: boolean }[]
      }
      admin_list_accounts: {
        Args: Record<PropertyKey, never>
        Returns: { user_id: string; full_name: string | null; email: string | null; username: string | null; plan: string; status: string; valid_until: string | null; license_id: string | null; license_prefix: string | null; license_status: string | null; created_at: string }[]
      }
      admin_update_account: {
        Args: { _user_id: string; _full_name: string; _username: string; _plan: string; _status: string; _valid_until: string | null }
        Returns: boolean
      }
      admin_revoke_license: {
        Args: { _license_id: string }
        Returns: boolean
      }
      admin_issue_license: {
        Args: { _plan: string; _customer_email: string; _key_hash: string; _key_prefix: string; _duration_days: number }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_license: {
        Args: { _key_hash: string }
        Returns: {
          license_id: string
          plan_name: string
          valid_until: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
