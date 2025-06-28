// API types
// (ApiDeviationResult interface removed; use generated Supabase types instead)

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
