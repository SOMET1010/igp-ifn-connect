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
      agent_actions: {
        Row: {
          action_type: string
          agent_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          outcome: string | null
          target_merchant_id: string | null
          validation_id: string | null
        }
        Insert: {
          action_type: string
          agent_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          outcome?: string | null
          target_merchant_id?: string | null
          validation_id?: string | null
        }
        Update: {
          action_type?: string
          agent_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          outcome?: string | null
          target_merchant_id?: string | null
          validation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_actions_target_merchant_id_fkey"
            columns: ["target_merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_actions_validation_id_fkey"
            columns: ["validation_id"]
            isOneToOne: false
            referencedRelation: "trust_validations"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_requests: {
        Row: {
          created_at: string
          full_name: string
          id: string
          motivation: string | null
          organization: string
          phone: string
          preferred_zone: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          motivation?: string | null
          organization?: string
          phone: string
          preferred_zone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          motivation?: string | null
          organization?: string
          phone?: string
          preferred_zone?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      audio_recordings: {
        Row: {
          audio_key: string
          created_at: string
          duration_seconds: number | null
          file_path: string
          id: string
          language_code: string
          recorded_by: string | null
          updated_at: string
        }
        Insert: {
          audio_key: string
          created_at?: string
          duration_seconds?: number | null
          file_path: string
          id?: string
          language_code: string
          recorded_by?: string | null
          updated_at?: string
        }
        Update: {
          audio_key?: string
          created_at?: string
          duration_seconds?: number | null
          file_path?: string
          id?: string
          language_code?: string
          recorded_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      auth_context_logs: {
        Row: {
          created_at: string | null
          decision: string
          device_fingerprint: string | null
          factors: Json | null
          hour_bucket: number | null
          id: string
          ip_address: string | null
          latitude: number | null
          longitude: number | null
          market_code: string | null
          merchant_id: string | null
          outcome: string | null
          phone: string
          reason_codes: Json | null
          trust_score: number | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          decision: string
          device_fingerprint?: string | null
          factors?: Json | null
          hour_bucket?: number | null
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          market_code?: string | null
          merchant_id?: string | null
          outcome?: string | null
          phone: string
          reason_codes?: Json | null
          trust_score?: number | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          decision?: string
          device_fingerprint?: string | null
          factors?: Json | null
          hour_bucket?: number | null
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          market_code?: string | null
          merchant_id?: string | null
          outcome?: string | null
          phone?: string
          reason_codes?: Json | null
          trust_score?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_context_logs_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_context_scores: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          device_name: string | null
          failed_logins: number | null
          gps_tolerance_meters: number | null
          id: string
          is_primary_device: boolean | null
          last_login_at: string | null
          last_login_ip: string | null
          merchant_id: string
          successful_logins: number | null
          trust_score: number | null
          trust_score_updated_at: string | null
          updated_at: string | null
          usual_days_of_week: number[] | null
          usual_gps_latitude: number | null
          usual_gps_longitude: number | null
          usual_login_hours_end: number | null
          usual_login_hours_start: number | null
          usual_market_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_name?: string | null
          failed_logins?: number | null
          gps_tolerance_meters?: number | null
          id?: string
          is_primary_device?: boolean | null
          last_login_at?: string | null
          last_login_ip?: string | null
          merchant_id: string
          successful_logins?: number | null
          trust_score?: number | null
          trust_score_updated_at?: string | null
          updated_at?: string | null
          usual_days_of_week?: number[] | null
          usual_gps_latitude?: number | null
          usual_gps_longitude?: number | null
          usual_login_hours_end?: number | null
          usual_login_hours_start?: number | null
          usual_market_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          device_name?: string | null
          failed_logins?: number | null
          gps_tolerance_meters?: number | null
          id?: string
          is_primary_device?: boolean | null
          last_login_at?: string | null
          last_login_ip?: string | null
          merchant_id?: string
          successful_logins?: number | null
          trust_score?: number | null
          trust_score_updated_at?: string | null
          updated_at?: string | null
          usual_days_of_week?: number[] | null
          usual_gps_latitude?: number | null
          usual_gps_longitude?: number | null
          usual_login_hours_end?: number | null
          usual_login_hours_start?: number | null
          usual_market_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_context_scores_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_context_scores_usual_market_id_fkey"
            columns: ["usual_market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          beneficiary_wallet_id: string
          created_at: string
          id: string
          is_favorite: boolean | null
          last_transfer_at: string | null
          nickname: string | null
          owner_wallet_id: string
          transfer_count: number | null
        }
        Insert: {
          beneficiary_wallet_id: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          last_transfer_at?: string | null
          nickname?: string | null
          owner_wallet_id: string
          transfer_count?: number | null
        }
        Update: {
          beneficiary_wallet_id?: string
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          last_transfer_at?: string | null
          nickname?: string | null
          owner_wallet_id?: string
          transfer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_beneficiary_wallet_id_fkey"
            columns: ["beneficiary_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_owner_wallet_id_fkey"
            columns: ["owner_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
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
      community_validations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          merchant_id: string
          notes: string | null
          rejection_reason: string | null
          request_context: string | null
          requested_at: string | null
          status: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by_user_id: string | null
          validation_location_latitude: number | null
          validation_location_longitude: number | null
          validation_method: string | null
          validator_name: string | null
          validator_phone: string | null
          validator_type: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          merchant_id: string
          notes?: string | null
          rejection_reason?: string | null
          request_context?: string | null
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by_user_id?: string | null
          validation_location_latitude?: number | null
          validation_location_longitude?: number | null
          validation_method?: string | null
          validator_name?: string | null
          validator_phone?: string | null
          validator_type: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          merchant_id?: string
          notes?: string | null
          rejection_reason?: string | null
          request_context?: string | null
          requested_at?: string | null
          status?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by_user_id?: string | null
          validation_location_latitude?: number | null
          validation_location_longitude?: number | null
          validation_method?: string | null
          validator_name?: string | null
          validator_phone?: string | null
          validator_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_validations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_producer_orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cooperative_id: string
          created_at: string | null
          delivery_date: string | null
          harvest_id: string | null
          id: string
          notes: string | null
          producer_id: string
          product_id: string
          quantity: number
          status: string | null
          total_amount: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cooperative_id: string
          created_at?: string | null
          delivery_date?: string | null
          harvest_id?: string | null
          id?: string
          notes?: string | null
          producer_id: string
          product_id: string
          quantity: number
          status?: string | null
          total_amount: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cooperative_id?: string
          created_at?: string | null
          delivery_date?: string | null
          harvest_id?: string | null
          id?: string
          notes?: string | null
          producer_id?: string
          product_id?: string
          quantity?: number
          status?: string | null
          total_amount?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_producer_orders_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooperative_producer_orders_harvest_id_fkey"
            columns: ["harvest_id"]
            isOneToOne: false
            referencedRelation: "producer_harvests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooperative_producer_orders_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooperative_producer_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      customer_credits: {
        Row: {
          amount_owed: number
          amount_paid: number
          created_at: string
          customer_name: string
          customer_phone: string
          due_date: string | null
          id: string
          merchant_id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_owed?: number
          amount_paid?: number
          created_at?: string
          customer_name: string
          customer_phone: string
          due_date?: string | null
          id?: string
          merchant_id: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_owed?: number
          amount_paid?: number
          created_at?: string
          customer_name?: string
          customer_phone?: string
          due_date?: string | null
          id?: string
          merchant_id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      directions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "directions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_ht: number
          amount_ttc: number
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          customer_name: string | null
          customer_ncc: string | null
          customer_phone: string | null
          id: string
          invoice_number: string
          merchant_id: string
          qr_code_data: string | null
          signature_hash: string | null
          status: string | null
          transaction_id: string | null
          tva_amount: number | null
          tva_rate: number | null
        }
        Insert: {
          amount_ht: number
          amount_ttc: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_name?: string | null
          customer_ncc?: string | null
          customer_phone?: string | null
          id?: string
          invoice_number: string
          merchant_id: string
          qr_code_data?: string | null
          signature_hash?: string | null
          status?: string | null
          transaction_id?: string | null
          tva_amount?: number | null
          tva_rate?: number | null
        }
        Update: {
          amount_ht?: number
          amount_ttc?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          customer_name?: string | null
          customer_ncc?: string | null
          customer_phone?: string | null
          id?: string
          invoice_number?: string
          merchant_id?: string
          qr_code_data?: string | null
          signature_hash?: string | null
          status?: string | null
          transaction_id?: string | null
          tva_amount?: number | null
          tva_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_requests: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          id_document_expiry: string | null
          id_document_number: string | null
          id_document_type: string | null
          id_document_url: string | null
          level: Database["public"]["Enums"]["kyc_level"]
          merchant_id: string | null
          phone_verified: boolean | null
          phone_verified_at: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_url: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          id_document_expiry?: string | null
          id_document_number?: string | null
          id_document_type?: string | null
          id_document_url?: string | null
          level?: Database["public"]["Enums"]["kyc_level"]
          merchant_id?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          id_document_expiry?: string | null
          id_document_number?: string | null
          id_document_type?: string | null
          id_document_url?: string | null
          level?: Database["public"]["Enums"]["kyc_level"]
          merchant_id?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_requests_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
      merchant_daily_sessions: {
        Row: {
          cash_difference: number | null
          closed_at: string | null
          closing_cash: number | null
          created_at: string
          expected_cash: number | null
          id: string
          merchant_id: string
          notes: string | null
          opened_at: string
          opening_cash: number
          session_date: string
          status: string
          total_sales: number | null
          total_transactions: number | null
          updated_at: string
        }
        Insert: {
          cash_difference?: number | null
          closed_at?: string | null
          closing_cash?: number | null
          created_at?: string
          expected_cash?: number | null
          id?: string
          merchant_id: string
          notes?: string | null
          opened_at?: string
          opening_cash?: number
          session_date?: string
          status?: string
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string
        }
        Update: {
          cash_difference?: number | null
          closed_at?: string | null
          closing_cash?: number | null
          created_at?: string
          expected_cash?: number | null
          id?: string
          merchant_id?: string
          notes?: string | null
          opened_at?: string
          opening_cash?: number
          session_date?: string
          status?: string
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_daily_sessions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_security_questions: {
        Row: {
          answer_hash: string
          answer_normalized: string
          audio_prompt_key: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          merchant_id: string
          question_text: string
          question_text_dioula: string | null
          question_type: string
          updated_at: string | null
        }
        Insert: {
          answer_hash: string
          answer_normalized: string
          audio_prompt_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          merchant_id: string
          question_text: string
          question_text_dioula?: string | null
          question_type: string
          updated_at?: string | null
        }
        Update: {
          answer_hash?: string
          answer_normalized?: string
          audio_prompt_key?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          merchant_id?: string
          question_text?: string
          question_text_dioula?: string | null
          question_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merchant_security_questions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchant_stocks: {
        Row: {
          created_at: string
          id: string
          last_restocked_at: string | null
          merchant_id: string
          min_threshold: number | null
          product_id: string
          quantity: number
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          merchant_id: string
          min_threshold?: number | null
          product_id: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_restocked_at?: string | null
          merchant_id?: string
          min_threshold?: number | null
          product_id?: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string
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
          fiscal_regime: string | null
          full_name: string
          id: string
          invoice_counter: number | null
          latitude: number | null
          location_photo_url: string | null
          longitude: number | null
          market_id: string | null
          ncc: string | null
          persona: string | null
          phone: string
          preferred_lang: string | null
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
          fiscal_regime?: string | null
          full_name: string
          id?: string
          invoice_counter?: number | null
          latitude?: number | null
          location_photo_url?: string | null
          longitude?: number | null
          market_id?: string | null
          ncc?: string | null
          persona?: string | null
          phone: string
          preferred_lang?: string | null
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
          fiscal_regime?: string | null
          full_name?: string
          id?: string
          invoice_counter?: number | null
          latitude?: number | null
          location_photo_url?: string | null
          longitude?: number | null
          market_id?: string | null
          ncc?: string | null
          persona?: string | null
          phone?: string
          preferred_lang?: string | null
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
      notification_logs: {
        Row: {
          body: string
          data: Json | null
          delivered: boolean | null
          error: string | null
          id: string
          sent_at: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body: string
          data?: Json | null
          delivered?: boolean | null
          error?: string | null
          id?: string
          sent_at?: string
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          data?: Json | null
          delivered?: boolean | null
          error?: string | null
          id?: string
          sent_at?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string | null
          icon: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category: string
          created_at?: string | null
          icon?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
          cancellation_reason: string | null
          cancelled_at: string | null
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
          cancellation_reason?: string | null
          cancelled_at?: string | null
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
          cancellation_reason?: string | null
          cancelled_at?: string | null
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
      otp_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      producer_harvests: {
        Row: {
          available_quantity: number
          created_at: string | null
          expiry_date: string | null
          harvest_date: string
          id: string
          notes: string | null
          producer_id: string
          product_id: string
          quality_grade: string | null
          quantity: number
          status: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          available_quantity: number
          created_at?: string | null
          expiry_date?: string | null
          harvest_date: string
          id?: string
          notes?: string | null
          producer_id: string
          product_id: string
          quality_grade?: string | null
          quantity: number
          status?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number
          created_at?: string | null
          expiry_date?: string | null
          harvest_date?: string
          id?: string
          notes?: string | null
          producer_id?: string
          product_id?: string
          quality_grade?: string | null
          quantity?: number
          status?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producer_harvests_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producer_harvests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          commune: string
          cooperative_id: string | null
          created_at: string | null
          full_name: string
          id: string
          igp_certified: boolean | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string
          region: string
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          commune: string
          cooperative_id?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          igp_certified?: boolean | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone: string
          region: string
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          commune?: string
          cooperative_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          igp_certified?: boolean | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string
          region?: string
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producers_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
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
      profile_permissions: {
        Row: {
          action_id: string
          created_at: string | null
          field_restrictions: Json | null
          id: string
          is_enabled: boolean | null
          profile_id: string
          resource_id: string
          scope_id: string | null
          status_restrictions: Json | null
          updated_at: string | null
        }
        Insert: {
          action_id: string
          created_at?: string | null
          field_restrictions?: Json | null
          id?: string
          is_enabled?: boolean | null
          profile_id: string
          resource_id: string
          scope_id?: string | null
          status_restrictions?: Json | null
          updated_at?: string | null
        }
        Update: {
          action_id?: string
          created_at?: string | null
          field_restrictions?: Json | null
          id?: string
          is_enabled?: boolean | null
          profile_id?: string
          resource_id?: string
          scope_id?: string | null
          status_restrictions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_permissions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "rbac_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "rbac_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_permissions_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "rbac_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_permissions_scope_id_fkey"
            columns: ["scope_id"]
            isOneToOne: false
            referencedRelation: "rbac_scopes"
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
      promotions: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean
          merchant_id: string
          min_purchase: number | null
          name: string
          product_id: string | null
          start_date: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean
          merchant_id: string
          min_purchase?: number | null
          name: string
          product_id?: string | null
          start_date: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean
          merchant_id?: string
          min_purchase?: number | null
          name?: string
          product_id?: string | null
          start_date?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rbac_actions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          label: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          label: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      rbac_audit_log: {
        Row: {
          action: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          performed_at: string | null
          performed_by: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rbac_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      rbac_profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          default_scope_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          default_scope_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          default_scope_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rbac_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "rbac_profiles_default_scope_id_fkey"
            columns: ["default_scope_id"]
            isOneToOne: false
            referencedRelation: "rbac_scopes"
            referencedColumns: ["id"]
          },
        ]
      }
      rbac_resources: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
        }
        Relationships: []
      }
      rbac_scopes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          label: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          label: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      risk_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          merchant_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          merchant_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          merchant_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_events_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      social_answers_hashed: {
        Row: {
          answer_hash: string
          answer_salt: string
          challenge_key: string
          created_at: string | null
          id: string
          merchant_id: string
          updated_at: string | null
        }
        Insert: {
          answer_hash: string
          answer_salt: string
          challenge_key: string
          created_at?: string | null
          id?: string
          merchant_id: string
          updated_at?: string | null
        }
        Update: {
          answer_hash?: string
          answer_salt?: string
          challenge_key?: string
          created_at?: string | null
          id?: string
          merchant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_answers_hashed_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
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
      system_logs: {
        Row: {
          actor_id: string | null
          actor_type: string | null
          created_at: string
          description: string | null
          event_type: string
          id: string
          metadata: Json | null
          severity: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          severity?: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          severity?: string
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          product_name: string
          quantity: number
          total_price: number
          transaction_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          product_name: string
          quantity?: number
          total_price: number
          transaction_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          transaction_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
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
      trust_validations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          merchant_id: string
          method: string | null
          notes: string | null
          reason: string | null
          requested_by_phone: string | null
          result: string | null
          validated_at: string | null
          validated_by: string | null
          validation_code: string
          validation_type: string
          validator_role: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          merchant_id: string
          method?: string | null
          notes?: string | null
          reason?: string | null
          requested_by_phone?: string | null
          result?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_code: string
          validation_type: string
          validator_role?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          merchant_id?: string
          method?: string | null
          notes?: string | null
          reason?: string | null
          requested_by_phone?: string | null
          result?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_code?: string
          validation_type?: string
          validator_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_validations_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_devices: {
        Row: {
          device_fingerprint: string
          device_label: string | null
          first_seen_at: string | null
          id: string
          is_revoked: boolean | null
          last_seen_at: string | null
          merchant_id: string
        }
        Insert: {
          device_fingerprint: string
          device_label?: string | null
          first_seen_at?: string | null
          id?: string
          is_revoked?: boolean | null
          last_seen_at?: string | null
          merchant_id: string
        }
        Update: {
          device_fingerprint?: string
          device_label?: string | null
          first_seen_at?: string | null
          id?: string
          is_revoked?: boolean | null
          last_seen_at?: string | null
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trusted_devices_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rbac_profiles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          direction_id: string | null
          id: string
          is_active: boolean | null
          profile_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          direction_id?: string | null
          id?: string
          is_active?: boolean | null
          profile_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          direction_id?: string | null
          id?: string
          is_active?: boolean | null
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_rbac_profiles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_rbac_profiles_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rbac_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "rbac_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rbac_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
      vivriers_cooperatives: {
        Row: {
          address: string | null
          code: string | null
          commune: string | null
          created_at: string
          effectif_cmu: number | null
          effectif_cnps: number | null
          effectif_total: number | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          region: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          commune?: string | null
          created_at?: string
          effectif_cmu?: number | null
          effectif_cnps?: number | null
          effectif_total?: number | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          commune?: string | null
          created_at?: string
          effectif_cmu?: number | null
          effectif_cnps?: number | null
          effectif_total?: number | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vivriers_members: {
        Row: {
          actor_key: string
          cmu_status: string | null
          cnps_status: string | null
          cooperative_id: string | null
          cooperative_name: string
          created_at: string
          full_name: string
          id: string
          identifier_code: string | null
          notes: string | null
          phone: string | null
          phone2: string | null
          row_number: number | null
          updated_at: string
        }
        Insert: {
          actor_key: string
          cmu_status?: string | null
          cnps_status?: string | null
          cooperative_id?: string | null
          cooperative_name: string
          created_at?: string
          full_name: string
          id?: string
          identifier_code?: string | null
          notes?: string | null
          phone?: string | null
          phone2?: string | null
          row_number?: number | null
          updated_at?: string
        }
        Update: {
          actor_key?: string
          cmu_status?: string | null
          cnps_status?: string | null
          cooperative_id?: string | null
          cooperative_name?: string
          created_at?: string
          full_name?: string
          id?: string
          identifier_code?: string | null
          notes?: string | null
          phone?: string | null
          phone2?: string | null
          row_number?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vivriers_members_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "vivriers_cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          counterparty_name: string | null
          counterparty_phone: string | null
          counterparty_wallet_id: string | null
          created_at: string
          description: string | null
          fee: number | null
          id: string
          metadata: Json | null
          reference: string
          status: string
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          counterparty_name?: string | null
          counterparty_phone?: string | null
          counterparty_wallet_id?: string | null
          created_at?: string
          description?: string | null
          fee?: number | null
          id?: string
          metadata?: Json | null
          reference: string
          status?: string
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          counterparty_name?: string | null
          counterparty_phone?: string | null
          counterparty_wallet_id?: string | null
          created_at?: string
          description?: string | null
          fee?: number | null
          id?: string
          metadata?: Json | null
          reference?: string
          status?: string
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_counterparty_wallet_id_fkey"
            columns: ["counterparty_wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          is_active: boolean
          merchant_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          merchant_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          merchant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_agent_role: { Args: { p_user_id: string }; Returns: undefined }
      assign_cooperative_role: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      assign_merchant_role: { Args: { p_user_id: string }; Returns: undefined }
      calculate_trust_score: {
        Args: {
          p_device_fingerprint: string
          p_latitude?: number
          p_login_hour?: number
          p_longitude?: number
          p_merchant_id: string
        }
        Returns: {
          factors: Json
          trust_score: number
        }[]
      }
      check_rbac_permission: {
        Args: { _action_code: string; _resource_code: string; _user_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_category: string
          p_icon?: string
          p_message: string
          p_metadata?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      decrement_stock: {
        Args: { p_quantity: number; p_stock_id: string }
        Returns: undefined
      }
      expire_old_validations: { Args: never; Returns: undefined }
      generate_validation_code: { Args: never; Returns: string }
      generate_wallet_reference: { Args: never; Returns: string }
      get_merchant_today_total: {
        Args: { _merchant_id: string }
        Returns: number
      }
      get_total_transactions_amount: { Args: never; Returns: number }
      get_user_kyc_level: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["kyc_level"]
      }
      get_user_rbac_permissions: {
        Args: { _user_id: string }
        Returns: {
          action_code: string
          action_label: string
          field_restrictions: Json
          resource_code: string
          resource_label: string
          scope_code: string
          scope_label: string
          status_restrictions: Json
        }[]
      }
      get_user_rbac_profiles: {
        Args: { _user_id: string }
        Returns: {
          assigned_at: string
          direction_id: string
          direction_name: string
          profile_description: string
          profile_id: string
          profile_name: string
        }[]
      }
      has_kyc_level: {
        Args: {
          _min_level: Database["public"]["Enums"]["kyc_level"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_rbac_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "agent"
        | "merchant"
        | "cooperative"
        | "user"
        | "client"
        | "producer"
      kyc_level: "level_0" | "level_1" | "level_2"
      kyc_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
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
      app_role: [
        "admin",
        "agent",
        "merchant",
        "cooperative",
        "user",
        "client",
        "producer",
      ],
      kyc_level: ["level_0", "level_1", "level_2"],
      kyc_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
      ],
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
