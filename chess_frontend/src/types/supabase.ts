export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      lichess_studies: {
        Row: {
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          lichess_study_id: string;
          study_name: string;
          study_url: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          lichess_study_id: string;
          study_name: string;
          study_url: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          lichess_study_id?: string;
          study_name?: string;
          study_url?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lichess_studies_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      opening_deviations: {
        Row: {
          actual_move: string;
          color: string | null;
          detected_at: string | null;
          deviation_uci: string | null;
          expected_move: string;
          first_deviator: string | null;
          game_id: string | null;
          id: string;
          move_number: number;
          opening_name: string | null;
          pgn: string | null;
          position_fen: string;
          previous_position_fen: string | null;
          reference_uci: string | null;
          review_result: string | null;
          review_status: Database['public']['Enums']['review_status'] | null;
          reviewed_at: string | null;
          study_id: string | null;
          user_id: string | null;
        };
        Insert: {
          actual_move: string;
          color?: string | null;
          detected_at?: string | null;
          deviation_uci?: string | null;
          expected_move: string;
          first_deviator?: string | null;
          game_id?: string | null;
          id?: string;
          move_number: number;
          opening_name?: string | null;
          pgn?: string | null;
          position_fen: string;
          previous_position_fen?: string | null;
          reference_uci?: string | null;
          review_result?: string | null;
          review_status?: Database['public']['Enums']['review_status'] | null;
          reviewed_at?: string | null;
          study_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          actual_move?: string;
          color?: string | null;
          detected_at?: string | null;
          deviation_uci?: string | null;
          expected_move?: string;
          first_deviator?: string | null;
          game_id?: string | null;
          id?: string;
          move_number?: number;
          opening_name?: string | null;
          pgn?: string | null;
          position_fen?: string;
          previous_position_fen?: string | null;
          reference_uci?: string | null;
          review_result?: string | null;
          review_status?: Database['public']['Enums']['review_status'] | null;
          reviewed_at?: string | null;
          study_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'opening_deviations_study_id_fkey';
            columns: ['study_id'];
            isOneToOne: false;
            referencedRelation: 'lichess_studies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opening_deviations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          access_token: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          last_synced_at: string | null;
          lichess_username: string | null;
          onboarding_completed: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          access_token?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_synced_at?: string | null;
          lichess_username?: string | null;
          onboarding_completed?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          access_token?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          last_synced_at?: string | null;
          lichess_username?: string | null;
          onboarding_completed?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      puzzle_attempts: {
        Row: {
          attempt_number: number | null;
          attempted_at: string | null;
          created_at: string | null;
          deviation_id: string | null;
          id: string;
          user_id: string | null;
          was_correct: boolean;
        };
        Insert: {
          attempt_number?: number | null;
          attempted_at?: string | null;
          created_at?: string | null;
          deviation_id?: string | null;
          id?: string;
          user_id?: string | null;
          was_correct: boolean;
        };
        Update: {
          attempt_number?: number | null;
          attempted_at?: string | null;
          created_at?: string | null;
          deviation_id?: string | null;
          id?: string;
          user_id?: string | null;
          was_correct?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'puzzle_attempts_deviation_id_fkey';
            columns: ['deviation_id'];
            isOneToOne: false;
            referencedRelation: 'opening_deviations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'puzzle_attempts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      review_queue: {
        Row: {
          algorithm_type: string | null;
          consecutive_successes: number | null;
          created_at: string | null;
          deviation_id: string | null;
          difficulty_level: number | null;
          ease_factor: number | null;
          id: string;
          interval_days: number | null;
          last_reviewed_at: string | null;
          next_review_at: string | null;
          review_count: number | null;
          total_reviews: number | null;
          user_id: string | null;
        };
        Insert: {
          algorithm_type?: string | null;
          consecutive_successes?: number | null;
          created_at?: string | null;
          deviation_id?: string | null;
          difficulty_level?: number | null;
          ease_factor?: number | null;
          id?: string;
          interval_days?: number | null;
          last_reviewed_at?: string | null;
          next_review_at?: string | null;
          review_count?: number | null;
          total_reviews?: number | null;
          user_id?: string | null;
        };
        Update: {
          algorithm_type?: string | null;
          consecutive_successes?: number | null;
          created_at?: string | null;
          deviation_id?: string | null;
          difficulty_level?: number | null;
          ease_factor?: number | null;
          id?: string;
          interval_days?: number | null;
          last_reviewed_at?: string | null;
          next_review_at?: string | null;
          review_count?: number | null;
          total_reviews?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'review_queue_deviation_id_fkey';
            columns: ['deviation_id'];
            isOneToOne: true;
            referencedRelation: 'opening_deviations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'review_queue_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      spaced_repetition_config: {
        Row: {
          algorithm_type: string;
          created_at: string | null;
          ease_adjustment_factor: number | null;
          id: string;
          initial_ease_factor: number | null;
          max_daily_reviews: number | null;
          maximum_interval_days: number | null;
          minimum_interval_hours: number | null;
          target_retention_rate: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          algorithm_type?: string;
          created_at?: string | null;
          ease_adjustment_factor?: number | null;
          id?: string;
          initial_ease_factor?: number | null;
          max_daily_reviews?: number | null;
          maximum_interval_days?: number | null;
          minimum_interval_hours?: number | null;
          target_retention_rate?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          algorithm_type?: string;
          created_at?: string | null;
          ease_adjustment_factor?: number | null;
          id?: string;
          initial_ease_factor?: number | null;
          max_daily_reviews?: number | null;
          maximum_interval_days?: number | null;
          minimum_interval_hours?: number | null;
          target_retention_rate?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'spaced_repetition_config_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      sync_preferences: {
        Row: {
          created_at: string | null;
          id: string;
          is_auto_sync_enabled: boolean;
          sync_frequency_minutes: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_auto_sync_enabled?: boolean;
          sync_frequency_minutes?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_auto_sync_enabled?: boolean;
          sync_frequency_minutes?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'sync_preferences_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_profile_columns: {
        Args: Record<PropertyKey, never>;
        Returns: {
          column_name: string;
        }[];
      };
    };
    Enums: {
      review_status: 'needs_review' | 'reviewed' | 'adopted' | 'ignored';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      review_status: ['needs_review', 'reviewed', 'adopted', 'ignored'],
    },
  },
} as const;
