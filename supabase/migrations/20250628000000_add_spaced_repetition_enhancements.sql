-- Spaced Repetition Algorithm Enhancements
-- Migration: 20250628000000_add_spaced_repetition_enhancements.sql

-- Create puzzle_attempts table (currently referenced but missing)
CREATE TABLE IF NOT EXISTS public.puzzle_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    deviation_id UUID REFERENCES public.opening_deviations(id) ON DELETE CASCADE NOT NULL,
    attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
    was_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER CHECK (response_time_ms > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure we can track multiple attempts per deviation per user
    CONSTRAINT unique_user_deviation_attempt UNIQUE (user_id, deviation_id, attempt_number)
);

-- Enable RLS
ALTER TABLE public.puzzle_attempts ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view own puzzle attempts" ON public.puzzle_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own puzzle attempts" ON public.puzzle_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add algorithm-specific columns to review_queue
ALTER TABLE public.review_queue 
ADD COLUMN IF NOT EXISTS ease_factor REAL DEFAULT 2.5 CHECK (ease_factor >= 1.3 AND ease_factor <= 2.5),
ADD COLUMN IF NOT EXISTS interval_days REAL DEFAULT 1.0 CHECK (interval_days >= 0.0416), -- minimum 1 hour
ADD COLUMN IF NOT EXISTS algorithm_type TEXT DEFAULT 'sm2plus' CHECK (algorithm_type IN ('basic', 'sm2plus', 'fsrs')),
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS consecutive_successes INTEGER DEFAULT 0 CHECK (consecutive_successes >= 0),
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0);

-- Add unique constraint to prevent duplicate queue entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_deviation_queue'
  ) THEN
    ALTER TABLE public.review_queue 
    ADD CONSTRAINT unique_user_deviation_queue UNIQUE (user_id, deviation_id);
  END IF;
END
$$;

-- Create algorithm configuration table
CREATE TABLE IF NOT EXISTS public.spaced_repetition_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    algorithm_type TEXT NOT NULL DEFAULT 'sm2plus' CHECK (algorithm_type IN ('basic', 'sm2plus', 'fsrs')),
    max_daily_reviews INTEGER DEFAULT 20 CHECK (max_daily_reviews > 0),
    target_retention_rate REAL DEFAULT 0.9 CHECK (target_retention_rate BETWEEN 0.7 AND 0.99),
    initial_ease_factor REAL DEFAULT 2.5 CHECK (initial_ease_factor >= 1.3 AND initial_ease_factor <= 2.5),
    ease_adjustment_factor REAL DEFAULT 0.15 CHECK (ease_adjustment_factor > 0),
    minimum_interval_hours REAL DEFAULT 1.0 CHECK (minimum_interval_hours >= 0.25),
    maximum_interval_days REAL DEFAULT 365.0 CHECK (maximum_interval_days > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one config per user
    CONSTRAINT unique_user_config UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.spaced_repetition_config ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view own spaced repetition config" ON public.spaced_repetition_config
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own spaced repetition config" ON public.spaced_repetition_config
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spaced repetition config" ON public.spaced_repetition_config
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create default spaced repetition config for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_spaced_rep_config()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.spaced_repetition_config (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create config for new users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_created_spaced_rep'
  ) THEN
    CREATE TRIGGER on_profile_created_spaced_rep
      AFTER INSERT ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user_spaced_rep_config();
  END IF;
END
$$;

-- Add trigger to update updated_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_spaced_rep_config_updated_at'
  ) THEN
    CREATE TRIGGER update_spaced_rep_config_updated_at
      BEFORE UPDATE ON public.spaced_repetition_config
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_user_deviation 
    ON public.puzzle_attempts(user_id, deviation_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_created_at 
    ON public.puzzle_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_review_queue_algorithm_type 
    ON public.review_queue(algorithm_type);
CREATE INDEX IF NOT EXISTS idx_review_queue_ease_factor 
    ON public.review_queue(ease_factor);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_config_user_id 
    ON public.spaced_repetition_config(user_id);

-- Add helpful comments
COMMENT ON TABLE public.puzzle_attempts IS 'Records each attempt a user makes at solving a puzzle';
COMMENT ON TABLE public.spaced_repetition_config IS 'User-specific configuration for spaced repetition algorithms';
COMMENT ON COLUMN public.review_queue.ease_factor IS 'SM2+ ease factor (1.3-2.5) indicating item difficulty';
COMMENT ON COLUMN public.review_queue.interval_days IS 'Current interval in days until next review';
COMMENT ON COLUMN public.review_queue.algorithm_type IS 'Which spaced repetition algorithm to use for this item';
COMMENT ON COLUMN public.review_queue.consecutive_successes IS 'Number of consecutive correct attempts';

-- Create default config for existing users
INSERT INTO public.spaced_repetition_config (user_id)
SELECT id FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;