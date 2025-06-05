// API types
export interface ApiDeviationResult {
  id: string;
  whole_move_number: number;
  deviation_san: string;
  reference_san: string;
  color: string;
  board_fen_before_deviation: string;
  reference_uci: string | null;
  deviation_uci: string | null;
  pgn: string;
  opening_name: string | null;
  move_number: number;
  played_move: string;
  expected_move: string;
  created_at: string;
  opponent: string | null;
  game_url: string;
  game_id: string;
  time_control: string | null;
  game_result: string | null;
  reviewed: boolean;
  review_count: number;
  ease_factor: number;
  interval_days: number;
  next_review_date: string | null;
  last_reviewed: string | null;
  is_resolved: boolean;
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
