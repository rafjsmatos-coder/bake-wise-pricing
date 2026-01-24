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
      categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      decoration_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      decorations: {
        Row: {
          brand: string | null
          category_id: string | null
          cost_per_unit: number | null
          created_at: string
          id: string
          min_stock_alert: number | null
          name: string
          package_quantity: number
          purchase_price: number
          stock_quantity: number | null
          supplier: string | null
          unit: Database["public"]["Enums"]["measurement_unit"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          min_stock_alert?: number | null
          name: string
          package_quantity: number
          purchase_price: number
          stock_quantity?: number | null
          supplier?: string | null
          unit: Database["public"]["Enums"]["measurement_unit"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          min_stock_alert?: number | null
          name?: string
          package_quantity?: number
          purchase_price?: number
          stock_quantity?: number | null
          supplier?: string | null
          unit?: Database["public"]["Enums"]["measurement_unit"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decorations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "decoration_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredient_price_history: {
        Row: {
          id: string
          ingredient_id: string
          package_quantity: number
          price: number
          recorded_at: string
        }
        Insert: {
          id?: string
          ingredient_id: string
          package_quantity: number
          price: number
          recorded_at?: string
        }
        Update: {
          id?: string
          ingredient_id?: string
          package_quantity?: number
          price?: number
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_price_history_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          brand: string | null
          category_id: string | null
          cost_per_unit: number | null
          created_at: string
          expiry_date: string | null
          id: string
          min_stock_alert: number | null
          name: string
          package_quantity: number
          purchase_price: number
          stock_quantity: number | null
          supplier: string | null
          unit: Database["public"]["Enums"]["measurement_unit"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          cost_per_unit?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          min_stock_alert?: number | null
          name: string
          package_quantity: number
          purchase_price: number
          stock_quantity?: number | null
          supplier?: string | null
          unit: Database["public"]["Enums"]["measurement_unit"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          cost_per_unit?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          min_stock_alert?: number | null
          name?: string
          package_quantity?: number
          purchase_price?: number
          stock_quantity?: number | null
          supplier?: string | null
          unit?: Database["public"]["Enums"]["measurement_unit"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging: {
        Row: {
          brand: string | null
          category_id: string | null
          cost_per_unit: number | null
          created_at: string
          dimensions: string | null
          id: string
          min_stock_alert: number | null
          name: string
          package_quantity: number
          purchase_price: number
          stock_quantity: number | null
          supplier: string | null
          unit: Database["public"]["Enums"]["measurement_unit"]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          cost_per_unit?: number | null
          created_at?: string
          dimensions?: string | null
          id?: string
          min_stock_alert?: number | null
          name: string
          package_quantity: number
          purchase_price: number
          stock_quantity?: number | null
          supplier?: string | null
          unit: Database["public"]["Enums"]["measurement_unit"]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          cost_per_unit?: number | null
          created_at?: string
          dimensions?: string | null
          id?: string
          min_stock_alert?: number | null
          name?: string
          package_quantity?: number
          purchase_price?: number
          stock_quantity?: number | null
          supplier?: string | null
          unit?: Database["public"]["Enums"]["measurement_unit"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packaging_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "packaging_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_decorations: {
        Row: {
          created_at: string
          decoration_id: string
          id: string
          product_id: string
          quantity: number
          unit: Database["public"]["Enums"]["measurement_unit"]
        }
        Insert: {
          created_at?: string
          decoration_id: string
          id?: string
          product_id: string
          quantity: number
          unit: Database["public"]["Enums"]["measurement_unit"]
        }
        Update: {
          created_at?: string
          decoration_id?: string
          id?: string
          product_id?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["measurement_unit"]
        }
        Relationships: [
          {
            foreignKeyName: "product_decorations_decoration_id_fkey"
            columns: ["decoration_id"]
            isOneToOne: false
            referencedRelation: "decorations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_decorations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          product_id: string
          quantity: number
          unit: Database["public"]["Enums"]["measurement_unit"]
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          product_id: string
          quantity: number
          unit: Database["public"]["Enums"]["measurement_unit"]
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          product_id?: string
          quantity?: number
          unit?: Database["public"]["Enums"]["measurement_unit"]
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_packaging: {
        Row: {
          created_at: string
          id: string
          packaging_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          packaging_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          packaging_id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_packaging_packaging_id_fkey"
            columns: ["packaging_id"]
            isOneToOne: false
            referencedRelation: "packaging"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_packaging_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recipes: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          recipe_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          recipe_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          recipe_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_costs: number | null
          category_id: string | null
          created_at: string
          decoration_time_minutes: number | null
          id: string
          name: string
          notes: string | null
          profit_margin_percent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_costs?: number | null
          category_id?: string | null
          created_at?: string
          decoration_time_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
          profit_margin_percent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_costs?: number | null
          category_id?: string | null
          created_at?: string
          decoration_time_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
          profit_margin_percent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_name: string | null
          city: string | null
          created_at: string
          facebook: string | null
          full_name: string | null
          id: string
          instagram: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
          whatsapp: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          facebook?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          whatsapp?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          facebook?: string | null
          full_name?: string | null
          id?: string
          instagram?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          whatsapp?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      recipe_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          quantity: number
          recipe_id: string
          unit: Database["public"]["Enums"]["measurement_unit"]
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          quantity: number
          recipe_id: string
          unit: Database["public"]["Enums"]["measurement_unit"]
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          quantity?: number
          recipe_id?: string
          unit?: Database["public"]["Enums"]["measurement_unit"]
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          additional_costs: number | null
          category_id: string
          created_at: string
          id: string
          instructions: string | null
          name: string
          notes: string | null
          oven_time_minutes: number | null
          prep_time_minutes: number
          safety_margin_percent: number | null
          updated_at: string
          user_id: string
          yield_quantity: number
          yield_unit: string
        }
        Insert: {
          additional_costs?: number | null
          category_id: string
          created_at?: string
          id?: string
          instructions?: string | null
          name: string
          notes?: string | null
          oven_time_minutes?: number | null
          prep_time_minutes: number
          safety_margin_percent?: number | null
          updated_at?: string
          user_id: string
          yield_quantity: number
          yield_unit?: string
        }
        Update: {
          additional_costs?: number | null
          category_id?: string
          created_at?: string
          id?: string
          instructions?: string | null
          name?: string
          notes?: string | null
          oven_time_minutes?: number | null
          prep_time_minutes?: number
          safety_margin_percent?: number | null
          updated_at?: string
          user_id?: string
          yield_quantity?: number
          yield_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "recipe_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          trial_end: string
          trial_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          trial_end?: string
          trial_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          default_safety_margin: number | null
          energy_cost_per_hour: number | null
          gas_cost_per_hour: number | null
          id: string
          include_energy_cost: boolean | null
          include_gas_cost: boolean | null
          include_labor_cost: boolean | null
          indirect_operational_cost_percent: number | null
          labor_cost_per_hour: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_safety_margin?: number | null
          energy_cost_per_hour?: number | null
          gas_cost_per_hour?: number | null
          id?: string
          include_energy_cost?: boolean | null
          include_gas_cost?: boolean | null
          include_labor_cost?: boolean | null
          indirect_operational_cost_percent?: number | null
          labor_cost_per_hour?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_safety_margin?: number | null
          energy_cost_per_hour?: number | null
          gas_cost_per_hour?: number | null
          id?: string
          include_energy_cost?: boolean | null
          include_gas_cost?: boolean | null
          include_labor_cost?: boolean | null
          indirect_operational_cost_percent?: number | null
          labor_cost_per_hour?: number | null
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
      [_ in never]: never
    }
    Enums: {
      measurement_unit: "kg" | "g" | "L" | "ml" | "un" | "m" | "cm"
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
      measurement_unit: ["kg", "g", "L", "ml", "un", "m", "cm"],
    },
  },
} as const
