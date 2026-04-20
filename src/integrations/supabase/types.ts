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
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          label: string | null
          provider: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          label?: string | null
          provider: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          label?: string | null
          provider?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          asset_type: string
          created_at: string
          id: string
          image_url: string
          name: string
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          asset_type: string
          created_at?: string
          id?: string
          image_url: string
          name: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          asset_type?: string
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      brand_palettes: {
        Row: {
          colors: Json
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          colors?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          colors?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      design_templates: {
        Row: {
          created_at: string
          created_by: string | null
          field_zones: Json
          height_px: number | null
          id: string
          image_url: string
          kind: string
          name: string
          source: string
          storage_path: string | null
          updated_at: string
          width_px: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          field_zones?: Json
          height_px?: number | null
          id?: string
          image_url: string
          kind: string
          name: string
          source?: string
          storage_path?: string | null
          updated_at?: string
          width_px?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          field_zones?: Json
          height_px?: number | null
          id?: string
          image_url?: string
          kind?: string
          name?: string
          source?: string
          storage_path?: string | null
          updated_at?: string
          width_px?: number | null
        }
        Relationships: []
      }
      designs: {
        Row: {
          created_at: string
          field_values: Json
          id: string
          kind: string
          pages: Json
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_values?: Json
          id?: string
          kind: string
          pages?: Json
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_values?: Json
          id?: string
          kind?: string
          pages?: Json
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "designs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "design_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          addons: Json
          boundary_length_rmt: number | null
          capacity_kw: number | null
          civil_cost_per_rmt: number | null
          client_contact: string | null
          client_email: string | null
          client_location: string | null
          client_name: string | null
          computed: Json
          cost_per_kw: number | null
          cover_image_url: string | null
          cover_source: string | null
          created_at: string
          electricity_tariff: number | null
          footing_cost: number | null
          footing_count: number | null
          id: string
          inverter_capacity: number | null
          overrides: Json
          panel_count: number | null
          panel_wattage: number | null
          project_type: string | null
          proposal_number: string | null
          soil_type: string | null
          status: string
          structure_type: string | null
          title: string
          updated_at: string
          user_id: string
          wall_type: string | null
        }
        Insert: {
          addons?: Json
          boundary_length_rmt?: number | null
          capacity_kw?: number | null
          civil_cost_per_rmt?: number | null
          client_contact?: string | null
          client_email?: string | null
          client_location?: string | null
          client_name?: string | null
          computed?: Json
          cost_per_kw?: number | null
          cover_image_url?: string | null
          cover_source?: string | null
          created_at?: string
          electricity_tariff?: number | null
          footing_cost?: number | null
          footing_count?: number | null
          id?: string
          inverter_capacity?: number | null
          overrides?: Json
          panel_count?: number | null
          panel_wattage?: number | null
          project_type?: string | null
          proposal_number?: string | null
          soil_type?: string | null
          status?: string
          structure_type?: string | null
          title?: string
          updated_at?: string
          user_id: string
          wall_type?: string | null
        }
        Update: {
          addons?: Json
          boundary_length_rmt?: number | null
          capacity_kw?: number | null
          civil_cost_per_rmt?: number | null
          client_contact?: string | null
          client_email?: string | null
          client_location?: string | null
          client_name?: string | null
          computed?: Json
          cost_per_kw?: number | null
          cover_image_url?: string | null
          cover_source?: string | null
          created_at?: string
          electricity_tariff?: number | null
          footing_cost?: number | null
          footing_count?: number | null
          id?: string
          inverter_capacity?: number | null
          overrides?: Json
          panel_count?: number | null
          panel_wattage?: number | null
          project_type?: string | null
          proposal_number?: string | null
          soil_type?: string | null
          status?: string
          structure_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          wall_type?: string | null
        }
        Relationships: []
      }
      social_designs: {
        Row: {
          created_at: string
          format: string
          id: string
          image_url: string
          model: string | null
          prompt: string | null
          storage_path: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          format: string
          id?: string
          image_url: string
          model?: string | null
          prompt?: string | null
          storage_path?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          image_url?: string
          model?: string | null
          prompt?: string | null
          storage_path?: string | null
          title?: string
          updated_at?: string
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
      visiting_card_templates: {
        Row: {
          created_at: string
          field_zones: Json
          height_px: number | null
          id: string
          image_url: string
          name: string
          source: string
          updated_at: string
          user_id: string
          width_px: number | null
        }
        Insert: {
          created_at?: string
          field_zones?: Json
          height_px?: number | null
          id?: string
          image_url: string
          name: string
          source: string
          updated_at?: string
          user_id: string
          width_px?: number | null
        }
        Update: {
          created_at?: string
          field_zones?: Json
          height_px?: number | null
          id?: string
          image_url?: string
          name?: string
          source?: string
          updated_at?: string
          user_id?: string
          width_px?: number | null
        }
        Relationships: []
      }
      visiting_cards: {
        Row: {
          created_at: string
          field_values: Json
          id: string
          template_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_values?: Json
          id?: string
          template_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_values?: Json
          id?: string
          template_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visiting_cards_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "visiting_card_templates"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      app_role: ["admin", "user"],
    },
  },
} as const
