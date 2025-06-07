-- Add onboarding_completed flag to profiles table
ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Optionally, add a comment for clarity
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'True if the user has completed onboarding flow.'; 