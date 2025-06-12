-- Add sync and review system columns and tables
-- Migration: 20250604000000_add_sync_and_review_system.sql

-- Add last_synced_at column if it does not exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.last_synced_at IS 'Timestamp of last successful game sync';

-- Update review_result in opening_deviations to use new status values
-- First, create a new type for review status if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
    CREATE TYPE public.review_status AS ENUM (
      'needs_review',
      'reviewed',
      'adopted',
      'ignored'
    );
  END IF;
END
$$;

-- Add a new column for the new status system
ALTER TABLE public.opening_deviations 
ADD COLUMN IF NOT EXISTS review_status public.review_status DEFAULT 'needs_review';

-- Migrate existing review_result data to new review_status
UPDATE public.opening_deviations
SET review_status = CASE 
    WHEN review_result = 'correct' THEN 'reviewed'::public.review_status
    WHEN review_result = 'incorrect' THEN 'reviewed'::public.review_status
    WHEN review_result = 'skip' THEN 'ignored'::public.review_status
    ELSE 'needs_review'::public.review_status
END
WHERE review_result IS NOT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.opening_deviations.review_status IS 'Current status of the deviation review (needs_review, reviewed, adopted, ignored)';

-- Create sync_preferences table
CREATE TABLE IF NOT EXISTS public.sync_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sync_frequency_minutes INTEGER NOT NULL DEFAULT 60 CHECK (sync_frequency_minutes >= 5),
    is_auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure one preference set per user
    CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.sync_preferences ENABLE ROW LEVEL SECURITY;

-- Add RLS policies with existence checks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sync_preferences' AND policyname = 'Users can view own sync preferences'
  ) THEN
    CREATE POLICY "Users can view own sync preferences"
      ON public.sync_preferences
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sync_preferences' AND policyname = 'Users can update own sync preferences'
  ) THEN
    CREATE POLICY "Users can update own sync preferences"
      ON public.sync_preferences
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sync_preferences' AND policyname = 'Users can insert own sync preferences'
  ) THEN
    CREATE POLICY "Users can insert own sync preferences"
      ON public.sync_preferences
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Add comment to explain the table
COMMENT ON TABLE public.sync_preferences IS 'User preferences for game sync frequency and behavior';

-- Create function to automatically create sync preferences for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_sync_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.sync_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create sync preferences if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_created'
  ) THEN
    CREATE TRIGGER on_profile_created
      AFTER INSERT ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user_sync_preferences();
  END IF;
END
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_opening_deviations_review_status 
    ON public.opening_deviations(review_status);

CREATE INDEX IF NOT EXISTS idx_sync_preferences_user_id 
    ON public.sync_preferences(user_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_sync_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_sync_preferences_updated_at
      BEFORE UPDATE ON public.sync_preferences
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;

-- Add comments to explain the purpose of each object
COMMENT ON TYPE public.review_status IS 'Possible states for a deviation review';
COMMENT ON FUNCTION public.handle_new_user_sync_preferences() IS 'Creates default sync preferences for new users';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at timestamp'; 