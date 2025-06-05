// API types
export interface ApiDeviationResult {
  id: string;
  user_id: string;
  study_id: string;
  game_id: string;
  position_fen: string;
  expected_move: string;
  actual_move: string;
  move_number: number;
  color: string;
  detected_at: string;
  reviewed_at: string | null;
  review_result?: string | null;
  pgn: string | null;
  // Add any other fields from the schema as needed
}

// UI types
export interface GameFilter {
  timeControls: string[];
  gameTypes: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface NotificationSettings {
  frequency: 'every' | 'daily' | 'weekly';
  celebrateSuccess: boolean;
  email?: string;
}
