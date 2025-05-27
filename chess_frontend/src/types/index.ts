// API types
export interface ApiDeviationResult {
  whole_move_number: number;
  deviation_san: string;
  reference_san: string;
  player_color: string;
  board_fen_before_deviation: string;
  reference_uci: string | null;
  deviation_uci: string | null;
  pgn: string;
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
