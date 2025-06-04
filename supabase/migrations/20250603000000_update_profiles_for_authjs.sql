-- Update profiles table for Auth.js compatibility
-- This migration modifies the profiles table to work with Auth.js instead of Supabase Auth
-- while preserving existing data and relationships

-- First, drop the existing trigger and function since we'll modify them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Modify profiles table
ALTER TABLE public.profiles
    -- Remove Supabase auth.users reference if it exists
    DROP CONSTRAINT IF EXISTS profiles_id_fkey,
    -- Add new columns for Lichess integration
    ADD COLUMN IF NOT EXISTS lichess_username TEXT,
    ADD COLUMN IF NOT EXISTS access_token TEXT,
    -- Keep existing columns but make them nullable since they might not come from Auth.js
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN username DROP NOT NULL;

-- Update RLS policies to work with custom JWT
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- New policies using custom JWT claims
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.jwt() ->> 'sub' = id::text);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.jwt() ->> 'sub' = id::text);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = id::text);

-- Create new function to handle Auth.js user creation
CREATE OR REPLACE FUNCTION public.handle_authjs_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        lichess_username,
        access_token,
        email,
        username,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'lichess_username',
        NEW.raw_user_meta_data->>'access_token',
        NEW.email,
        NEW.raw_user_meta_data->>'username',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
        lichess_username = EXCLUDED.lichess_username,
        access_token = EXCLUDED.access_token,
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for Auth.js user creation
CREATE TRIGGER on_authjs_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_authjs_user();

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_lichess_username ON public.profiles(lichess_username);
CREATE INDEX IF NOT EXISTS idx_profiles_access_token ON public.profiles(access_token);

-- Add comment to table explaining the Auth.js integration
COMMENT ON TABLE public.profiles IS 'User profiles table integrated with Auth.js and Lichess OAuth. Stores essential user data and Lichess credentials.';

-- Add comments to new columns
COMMENT ON COLUMN public.profiles.lichess_username IS 'Lichess username from OAuth';
COMMENT ON COLUMN public.profiles.access_token IS 'Lichess OAuth access token'; 