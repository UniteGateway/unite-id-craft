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
      community_proposals: {
        Row: {
          blocks: number | null
          community_name: string | null
          computed: Json
          cover_image_url: string | null
          created_at: string
          id: string
          investor_required: boolean | null
          location: string | null
          monthly_bill: number | null
          monthly_units: number | null
          preferred_model: string | null
          roof_type: string | null
          rooftop_area_sft: number | null
          sanction_load_kw: number | null
          slides: Json
          target_savings_pct: number | null
          theme: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blocks?: number | null
          community_name?: string | null
          computed?: Json
          cover_image_url?: string | null
          created_at?: string
          id?: string
          investor_required?: boolean | null
          location?: string | null
          monthly_bill?: number | null
          monthly_units?: number | null
          preferred_model?: string | null
          roof_type?: string | null
          rooftop_area_sft?: number | null
          sanction_load_kw?: number | null
          slides?: Json
          target_savings_pct?: number | null
          theme?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blocks?: number | null
          community_name?: string | null
          computed?: Json
          cover_image_url?: string | null
          created_at?: string
          id?: string
          investor_required?: boolean | null
          location?: string | null
          monthly_bill?: number | null
          monthly_units?: number | null
          preferred_model?: string | null
          roof_type?: string | null
          rooftop_area_sft?: number | null
          sanction_load_kw?: number | null
          slides?: Json
          target_savings_pct?: number | null
          theme?: string
          title?: string
          updated_at?: string
          user_id?: string
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
      fixed_slides: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string
          slide_number: number
          sort_order: number
          storage_path: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          slide_number: number
          sort_order?: number
          storage_path?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          slide_number?: number
          sort_order?: number
          storage_path?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          brand_logo_url: string | null
          brand_primary_color: string | null
          brand_theme: string | null
          company: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          brand_logo_url?: string | null
          brand_primary_color?: string | null
          brand_theme?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          brand_logo_url?: string | null
          brand_primary_color?: string | null
          brand_theme?: string | null
          company?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      proposal_settings: {
        Row: {
          created_at: string
          general_terms: string
          id: string
          service_amc: string
          singleton: boolean
          updated_at: string
          updated_by: string | null
          warranties: string
        }
        Insert: {
          created_at?: string
          general_terms?: string
          id?: string
          service_amc?: string
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
          warranties?: string
        }
        Update: {
          created_at?: string
          general_terms?: string
          id?: string
          service_amc?: string
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
          warranties?: string
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
      residential_offers: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          description: string | null
          discount_amount: number
          flyer_image_url: string | null
          flyer_storage_path: string | null
          freebie_label: string | null
          id: string
          max_kw: number
          min_kw: number
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number
          flyer_image_url?: string | null
          flyer_storage_path?: string | null
          freebie_label?: string | null
          id?: string
          max_kw?: number
          min_kw?: number
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_amount?: number
          flyer_image_url?: string | null
          flyer_storage_path?: string | null
          freebie_label?: string | null
          id?: string
          max_kw?: number
          min_kw?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      residential_presets: {
        Row: {
          boq: Json
          capacity_kw: number
          category: string
          cost_per_kw: number
          created_at: string
          id: string
          inverter_capacity: number
          label: string
          notes: string | null
          panel_count: number
          panel_wattage: number
          structure_type: string
          subsidy_amount: number
          subsidy_per_kw: number
          terms_and_conditions: string
          updated_at: string
        }
        Insert: {
          boq?: Json
          capacity_kw: number
          category?: string
          cost_per_kw?: number
          created_at?: string
          id?: string
          inverter_capacity?: number
          label: string
          notes?: string | null
          panel_count?: number
          panel_wattage?: number
          structure_type?: string
          subsidy_amount?: number
          subsidy_per_kw?: number
          terms_and_conditions?: string
          updated_at?: string
        }
        Update: {
          boq?: Json
          capacity_kw?: number
          category?: string
          cost_per_kw?: number
          created_at?: string
          id?: string
          inverter_capacity?: number
          label?: string
          notes?: string | null
          panel_count?: number
          panel_wattage?: number
          structure_type?: string
          subsidy_amount?: number
          subsidy_per_kw?: number
          terms_and_conditions?: string
          updated_at?: string
        }
        Relationships: []
      }
      residential_proposals: {
        Row: {
          bill_summary: Json
          boq: Json
          capacity_kw: number | null
          category: string
          client_contact: string | null
          client_email: string | null
          client_location: string | null
          client_name: string | null
          computed: Json
          cost_per_kw: number | null
          cover_image_url: string | null
          cover_source: string | null
          created_at: string
          daily_generation_kwh_per_kw: number | null
          id: string
          inverter_capacity: number | null
          is_customised: boolean
          loan_interest_rate: number
          loan_tenure_years: number
          location_city: string | null
          location_state: string | null
          monthly_savings_per_kw: number
          offer_discount: number
          offer_id: string | null
          offer_label: string | null
          panel_count: number | null
          panel_wattage: number | null
          payment_mode: string
          preset_id: string | null
          proposal_number: string | null
          service_amc: string | null
          status: string
          structure_type: string | null
          subsidy_amount: number
          subsidy_in_loan: boolean
          subsidy_per_kw: number
          terms_and_conditions: string | null
          title: string
          updated_at: string
          user_id: string
          warranties: string | null
        }
        Insert: {
          bill_summary?: Json
          boq?: Json
          capacity_kw?: number | null
          category?: string
          client_contact?: string | null
          client_email?: string | null
          client_location?: string | null
          client_name?: string | null
          computed?: Json
          cost_per_kw?: number | null
          cover_image_url?: string | null
          cover_source?: string | null
          created_at?: string
          daily_generation_kwh_per_kw?: number | null
          id?: string
          inverter_capacity?: number | null
          is_customised?: boolean
          loan_interest_rate?: number
          loan_tenure_years?: number
          location_city?: string | null
          location_state?: string | null
          monthly_savings_per_kw?: number
          offer_discount?: number
          offer_id?: string | null
          offer_label?: string | null
          panel_count?: number | null
          panel_wattage?: number | null
          payment_mode?: string
          preset_id?: string | null
          proposal_number?: string | null
          service_amc?: string | null
          status?: string
          structure_type?: string | null
          subsidy_amount?: number
          subsidy_in_loan?: boolean
          subsidy_per_kw?: number
          terms_and_conditions?: string | null
          title?: string
          updated_at?: string
          user_id: string
          warranties?: string | null
        }
        Update: {
          bill_summary?: Json
          boq?: Json
          capacity_kw?: number | null
          category?: string
          client_contact?: string | null
          client_email?: string | null
          client_location?: string | null
          client_name?: string | null
          computed?: Json
          cost_per_kw?: number | null
          cover_image_url?: string | null
          cover_source?: string | null
          created_at?: string
          daily_generation_kwh_per_kw?: number | null
          id?: string
          inverter_capacity?: number | null
          is_customised?: boolean
          loan_interest_rate?: number
          loan_tenure_years?: number
          location_city?: string | null
          location_state?: string | null
          monthly_savings_per_kw?: number
          offer_discount?: number
          offer_id?: string | null
          offer_label?: string | null
          panel_count?: number | null
          panel_wattage?: number | null
          payment_mode?: string
          preset_id?: string | null
          proposal_number?: string | null
          service_amc?: string | null
          status?: string
          structure_type?: string | null
          subsidy_amount?: number
          subsidy_in_loan?: boolean
          subsidy_per_kw?: number
          terms_and_conditions?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          warranties?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residential_proposals_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "residential_presets"
            referencedColumns: ["id"]
          },
        ]
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
      solar_proposals: {
        Row: {
          ai_recommendation: Json | null
          approx_budget: string | null
          capacity_mw: number
          computed: Json
          created_at: string
          custom_notes: string | null
          id: string
          investment_model: string | null
          location: string | null
          overrides: Json
          project_name: string
          project_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_recommendation?: Json | null
          approx_budget?: string | null
          capacity_mw?: number
          computed?: Json
          created_at?: string
          custom_notes?: string | null
          id?: string
          investment_model?: string | null
          location?: string | null
          overrides?: Json
          project_name: string
          project_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_recommendation?: Json | null
          approx_budget?: string | null
          capacity_mw?: number
          computed?: Json
          created_at?: string
          custom_notes?: string | null
          id?: string
          investment_model?: string | null
          location?: string | null
          overrides?: Json
          project_name?: string
          project_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tile_clicks: {
        Row: {
          created_at: string
          destination: string
          id: string
          tile_key: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          tile_key: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          tile_key?: string
          user_id?: string | null
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
