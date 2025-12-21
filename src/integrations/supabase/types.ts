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
      agents: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          is_active: boolean | null
          organization: string
          total_enrollments: number | null
          user_id: string
          zone: string | null
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          is_active?: boolean | null
          organization?: string
          total_enrollments?: number | null
          user_id: string
          zone?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          is_active?: boolean | null
          organization?: string
          total_enrollments?: number | null
          user_id?: string
          zone?: string | null
        }
        Relationships: []
      }
      cmu_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          merchant_id: string
          period_end: string
          period_start: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          merchant_id: string
          period_end: string
          period_start: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          merchant_id?: string
          period_end?: string
          period_start?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cmu_payments_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cmu_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperatives: {
        Row: {
          address: string | null
          code: string
          commune: string
          created_at: string
          email: string | null
          id: string
          igp_certified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          region: string
          total_members: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          code: string
          commune: string
          created_at?: string
          email?: string | null
          id?: string
          igp_certified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          region: string
          total_members?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          commune?: string
          created_at?: string
          email?: string | null
          id?: string
          igp_certified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          region?: string
          total_members?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      markets: {
        Row: {
          commune: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          region: string
        }
        Insert: {
          commune: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          region: string
        }
        Update: {
          commune?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string
        }
        Relationships: []
      }
      merchants: {
        Row: {
          activity_description: string | null
          activity_type: string
          cmu_number: string
          cmu_photo_url: string | null
          cmu_valid_until: string | null
          created_at: string
          enrolled_at: string
          enrolled_by: string | null
          full_name: string
          id: string
          latitude: number | null
          location_photo_url: string | null
          longitude: number | null
          market_id: string | null
          phone: string
          rsti_balance: number | null
          status: Database["public"]["Enums"]["merchant_status"] | null
          updated_at: string
          user_id: string | null
          validated_at: string | null
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          cmu_number: string
          cmu_photo_url?: string | null
          cmu_valid_until?: string | null
          created_at?: string
          enrolled_at?: string
          enrolled_by?: string | null
          full_name: string
          id?: string
          latitude?: number | null
          location_photo_url?: string | null
          longitude?: number | null
          market_id?: string | null
          phone: string
          rsti_balance?: number | null
          status?: Database["public"]["Enums"]["merchant_status"] | null
          updated_at?: string
          user_id?: string | null
          validated_at?: string | null
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          cmu_number?: string
          cmu_photo_url?: string | null
          cmu_valid_until?: string | null
          created_at?: string
          enrolled_at?: string
          enrolled_by?: string | null
          full_name?: string
          id?: string
          latitude?: number | null
          location_photo_url?: string | null
          longitude?: number | null
          market_id?: string | null
          phone?: string
          rsti_balance?: number | null
          status?: Database["public"]["Enums"]["merchant_status"] | null
          updated_at?: string
          user_id?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchants_enrolled_by_fkey"
            columns: ["enrolled_by"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merchants_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      offline_sync: {
        Row: {
          action: string
          created_at: string
          data: Json
          entity_id: string
          entity_type: string
          id: string
          synced: boolean | null
          synced_at: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          data: Json
          entity_id: string
          entity_type: string
          id?: string
          synced?: boolean | null
          synced_at?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          data?: Json
          entity_id?: string
          entity_type?: string
          id?: string
          synced?: boolean | null
          synced_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          cooperative_id: string
          created_at: string
          delivery_date: string | null
          id: string
          merchant_id: string
          notes: string | null
          product_id: string
          quantity: number
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          transport_cost: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          cooperative_id: string
          created_at?: string
          delivery_date?: string | null
          id?: string
          merchant_id: string
          notes?: string | null
          product_id: string
          quantity: number
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          transport_cost?: number | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          cooperative_id?: string
          created_at?: string
          delivery_date?: string | null
          id?: string
          merchant_id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          transport_cost?: number | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          image_url: string | null
          is_igp: boolean | null
          name: string
          unit: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_igp?: boolean | null
          name: string
          unit?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_igp?: boolean | null
          name?: string
          unit?: string
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
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stocks: {
        Row: {
          cooperative_id: string
          expiry_date: string | null
          harvest_date: string | null
          id: string
          lot_number: string | null
          product_id: string
          quantity: number
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          cooperative_id: string
          expiry_date?: string | null
          harvest_date?: string | null
          id?: string
          lot_number?: string | null
          product_id: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          cooperative_id?: string
          expiry_date?: string | null
          harvest_date?: string | null
          id?: string
          lot_number?: string | null
          product_id?: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stocks_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stocks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          cmu_deduction: number | null
          created_at: string
          id: string
          merchant_id: string
          qr_code: string | null
          reference: string | null
          rsti_deduction: number | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          cmu_deduction?: number | null
          created_at?: string
          id?: string
          merchant_id: string
          qr_code?: string | null
          reference?: string | null
          rsti_deduction?: number | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          cmu_deduction?: number | null
          created_at?: string
          id?: string
          merchant_id?: string
          qr_code?: string | null
          reference?: string | null
          rsti_deduction?: number | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "agent" | "merchant" | "cooperative" | "user"
      merchant_status: "pending" | "validated" | "rejected" | "suspended"
      order_status:
        | "pending"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "cancelled"
      transaction_type: "cash" | "mobile_money" | "transfer"
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
      app_role: ["admin", "agent", "merchant", "cooperative", "user"],
      merchant_status: ["pending", "validated", "rejected", "suspended"],
      order_status: [
        "pending",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      transaction_type: ["cash", "mobile_money", "transfer"],
    },
  },
} as const
