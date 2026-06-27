// Database types for 4Camryn (Supabase project: xhdipmbdrcxnbutrjmhc)
// Status: VERIFIED AGAINST LIVE SCHEMA — 2026-06-27
// Source: information_schema.columns query against live DB + migration cross-reference
// Notes:
//   - camryn_state / daily_items: FrontDoor cross-project tables; kept in camrynSyncService.ts
//     which uses its own untyped client — intentionally excluded here

// Simplified to unknown to avoid TypeScript instantiation-depth failures in
// component files with many imports. Callers always cast jsonb columns to
// their specific types at the point of use.
export type Json = unknown

export interface Database {
  public: {
    Tables: {
      camryn_sessions: {
        Row: {
          id: string
          user_id: string
          current_phase: number
          cycle_phase_name: string
          cycle_day: number | null
          last_period_date: string | null
          energy: string
          stress: string
          save_count: number
          phase_start_save_count: number
          display_name: string | null
          onboarding_complete: boolean
          protocol_complete: boolean
          protocol_completed_at: string | null
          protocol_mode: string
          mastery_data: Json | null
          personal_notes: Json
          last_winddown: string | null
          cycle_action_pick: Json | null
          intentional_action: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          current_phase?: number
          cycle_phase_name?: string
          cycle_day?: number | null
          last_period_date?: string | null
          energy?: string
          stress?: string
          save_count?: number
          phase_start_save_count?: number
          display_name?: string | null
          onboarding_complete?: boolean
          protocol_complete?: boolean
          protocol_completed_at?: string | null
          protocol_mode?: string
          mastery_data?: Json | null
          personal_notes?: Json
          last_winddown?: string | null
          cycle_action_pick?: Json | null
          intentional_action?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          current_phase?: number
          cycle_phase_name?: string
          cycle_day?: number | null
          last_period_date?: string | null
          energy?: string
          stress?: string
          save_count?: number
          phase_start_save_count?: number
          display_name?: string | null
          onboarding_complete?: boolean
          protocol_complete?: boolean
          protocol_completed_at?: string | null
          protocol_mode?: string
          mastery_data?: Json | null
          personal_notes?: Json
          last_winddown?: string | null
          cycle_action_pick?: Json | null
          intentional_action?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_daily_saves: {
        Row: {
          id: string
          user_id: string
          save_date: string
          tasks_complete: number
          tasks_total: number
          is_complete: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          save_date: string
          tasks_complete?: number
          tasks_total?: number
          is_complete?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          save_date?: string
          tasks_complete?: number
          tasks_total?: number
          is_complete?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_unlocks: {
        Row: {
          id: string
          user_id: string
          phase_id: number
          unlock_index: number
          title: string
          total_days: number
          remaining_days: number
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          phase_id: number
          unlock_index: number
          title?: string
          total_days?: number
          remaining_days?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          phase_id?: number
          unlock_index?: number
          title?: string
          total_days?: number
          remaining_days?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_confidence: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          confidence_note: string | null
          rebrand_note: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          confidence_note?: string | null
          rebrand_note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          confidence_note?: string | null
          rebrand_note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_body: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          weight: number | null
          energy: number | null
          symptoms: string | null
          vitamins: Json | null
          cycle_status: string | null
          cycle_note: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          weight?: number | null
          energy?: number | null
          symptoms?: string | null
          vitamins?: Json | null
          cycle_status?: string | null
          cycle_note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          weight?: number | null
          energy?: number | null
          symptoms?: string | null
          vitamins?: Json | null
          cycle_status?: string | null
          cycle_note?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_space: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          space_wins: string | null
          friction_note: string | null
          systems_note: string | null
          environment_check: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          space_wins?: string | null
          friction_note?: string | null
          systems_note?: string | null
          environment_check?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          space_wins?: string | null
          friction_note?: string | null
          systems_note?: string | null
          environment_check?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_confidence_profile: {
        Row: {
          id: string
          user_id: string
          style_words: string | null
          lifestyle_context: string | null
          body_fit_dread: string | null
          closet_best_outfit: string | null
          closet_skip_piece: string | null
          signal_wish: string | null
          style_influence: string | null
          rebrand_prompt: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          style_words?: string | null
          lifestyle_context?: string | null
          body_fit_dread?: string | null
          closet_best_outfit?: string | null
          closet_skip_piece?: string | null
          signal_wish?: string | null
          style_influence?: string | null
          rebrand_prompt?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          style_words?: string | null
          lifestyle_context?: string | null
          body_fit_dread?: string | null
          closet_best_outfit?: string | null
          closet_skip_piece?: string | null
          signal_wish?: string | null
          style_influence?: string | null
          rebrand_prompt?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_journal: {
        Row: {
          id: string
          user_id: string
          created_at: string | null
          entry_date: string
          user_text: string
          camryn_reply: string | null
          phase: string | null
          protocol_phase: number | null
          energy: string | null
          body_snapshot: Json | null
          confidence_snapshot: Json | null
          mastery_snapshot: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string | null
          entry_date: string
          user_text?: string
          camryn_reply?: string | null
          phase?: string | null
          protocol_phase?: number | null
          energy?: string | null
          body_snapshot?: Json | null
          confidence_snapshot?: Json | null
          mastery_snapshot?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string | null
          entry_date?: string
          user_text?: string
          camryn_reply?: string | null
          phase?: string | null
          protocol_phase?: number | null
          energy?: string | null
          body_snapshot?: Json | null
          confidence_snapshot?: Json | null
          mastery_snapshot?: Json | null
        }
        Relationships: []
      }

      camryn_food_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          meal_type: string
          description: string
          protein_g: number | null
          notes: string
          calories: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          sugar_g: number | null
          serving_size: string | null
          brand_name: string | null
          barcode: string | null
          source: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entry_date?: string
          meal_type?: string
          description?: string
          protein_g?: number | null
          notes?: string
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          serving_size?: string | null
          brand_name?: string | null
          barcode?: string | null
          source?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          meal_type?: string
          description?: string
          protein_g?: number | null
          notes?: string
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          serving_size?: string | null
          brand_name?: string | null
          barcode?: string | null
          source?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_food_daily: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          water_ml: number
          hunger_rating: number | null
          energy_after_eating: number | null
          notes: string
          exercised: boolean
          water_cups: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entry_date?: string
          water_ml?: number
          hunger_rating?: number | null
          energy_after_eating?: number | null
          notes?: string
          exercised?: boolean
          water_cups?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          water_ml?: number
          hunger_rating?: number | null
          energy_after_eating?: number | null
          notes?: string
          exercised?: boolean
          water_cups?: number
          updated_at?: string | null
        }
        Relationships: []
      }

      camryn_food_profile: {
        Row: {
          user_id: string
          height_cm: number | null
          weight_kg: number | null
          age: number | null
          goal: string
          activity_baseline: string
          updated_at: string | null
        }
        Insert: {
          user_id: string
          height_cm?: number | null
          weight_kg?: number | null
          age?: number | null
          goal?: string
          activity_baseline?: string
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          height_cm?: number | null
          weight_kg?: number | null
          age?: number | null
          goal?: string
          activity_baseline?: string
          updated_at?: string | null
        }
        Relationships: []
      }

      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth_key: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth_key: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth_key?: string
          created_at?: string | null
        }
        Relationships: []
      }

      camryn_vitals: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          resting_hr: number | null
          hrv_ms: number | null
          sleep_hours: number | null
          steps: number | null
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date?: string
          resting_hr?: number | null
          hrv_ms?: number | null
          sleep_hours?: number | null
          steps?: number | null
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          resting_hr?: number | null
          hrv_ms?: number | null
          sleep_hours?: number | null
          steps?: number | null
          source?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      camryn_reactions: {
        Row: {
          id: string
          user_id: string
          journal_entry_id: string
          reaction: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          journal_entry_id: string
          reaction: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          journal_entry_id?: string
          reaction?: string
          created_at?: string
        }
        Relationships: []
      }

      camryn_likes: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          note: string
          url: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          category?: string
          note?: string
          url?: string
          image_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          category?: string
          note?: string
          url?: string
          image_url?: string
          created_at?: string
        }
        Relationships: []
      }

      camryn_products: {
        Row: {
          id: string
          user_id: string
          name: string
          url: string
          category: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          url: string
          category?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          url?: string
          category?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // camryn_exercise: created via migration create_camryn_exercise.
      // Columns match actual app usage in BodySection.tsx.
      camryn_exercise: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          movement_type: string | null
          duration_min: number | null
          intensity: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          movement_type?: string | null
          duration_min?: number | null
          intensity?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          movement_type?: string | null
          duration_min?: number | null
          intensity?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Convenience type helpers (mirrors Supabase CLI output)
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
