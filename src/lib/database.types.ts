// Database types for 4Camryn (Supabase project: xhdipmbdrcxnbutrjmhc)
// Generated from: supabase/migrations/** + actual query/insert payloads
// Status: PARTIAL — regenerate from `supabase gen types typescript` once CLI access is available.
// Known gaps:
//   - camryn_exercise: table used by app (BodySection.tsx) but no migration exists → partial type
//   - camryn_state / daily_items: FrontDoor cross-project tables; kept in camrynSyncService.ts
//     which uses its own untyped client — intentionally excluded here.

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
          confidence_note: string
          rebrand_note: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date?: string
          confidence_note?: string
          rebrand_note?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          confidence_note?: string
          rebrand_note?: string
          created_at?: string
          updated_at?: string
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
          space_wins: string
          friction_note: string
          systems_note: string
          environment_check: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date?: string
          space_wins?: string
          friction_note?: string
          systems_note?: string
          environment_check?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          space_wins?: string
          friction_note?: string
          systems_note?: string
          environment_check?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      camryn_confidence_profile: {
        Row: {
          id: string
          user_id: string
          style_words: string
          lifestyle_context: string
          body_fit_dread: string
          closet_best_outfit: string
          closet_skip_piece: string
          signal_wish: string
          style_influence: string
          rebrand_prompt: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          style_words?: string
          lifestyle_context?: string
          body_fit_dread?: string
          closet_best_outfit?: string
          closet_skip_piece?: string
          signal_wish?: string
          style_influence?: string
          rebrand_prompt?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          style_words?: string
          lifestyle_context?: string
          body_fit_dread?: string
          closet_best_outfit?: string
          closet_skip_piece?: string
          signal_wish?: string
          style_influence?: string
          rebrand_prompt?: string
          created_at?: string
          updated_at?: string
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
          camryn_reply: string
          phase: string
          protocol_phase: number
          energy: string
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
          camryn_reply?: string
          phase?: string
          protocol_phase?: number
          energy?: string
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
          camryn_reply?: string
          phase?: string
          protocol_phase?: number
          energy?: string
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

      // NOTE: camryn_exercise is queried by BodySection.tsx but has NO migration.
      // This type is app-derived only. A migration must be created before this
      // table can be trusted in production.
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
