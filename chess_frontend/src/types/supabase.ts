export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
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
          game_id: string | null;
          id: string;
          move_number: number;
          pgn: string | null;
          position_fen: string;
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
          game_id?: string | null;
          id?: string;
          move_number: number;
          pgn?: string | null;
          position_fen: string;
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
          game_id?: string | null;
          id?: string;
          move_number?: number;
          pgn?: string | null;
          position_fen?: string;
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
      review_queue: {
        Row: {
          created_at: string | null;
          deviation_id: string | null;
          difficulty_level: number | null;
          id: string;
          next_review_at: string | null;
          review_count: number | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          deviation_id?: string | null;
          difficulty_level?: number | null;
          id?: string;
          next_review_at?: string | null;
          review_count?: number | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          deviation_id?: string | null;
          difficulty_level?: number | null;
          id?: string;
          next_review_at?: string | null;
          review_count?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'review_queue_deviation_id_fkey';
            columns: ['deviation_id'];
            isOneToOne: false;
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

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes'] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
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
