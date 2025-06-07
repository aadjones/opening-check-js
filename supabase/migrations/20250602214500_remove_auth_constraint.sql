-- Remove foreign key constraint from profiles table
-- This allows us to use Auth.js with Lichess OAuth instead of Supabase auth

-- Drop the foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;

-- Update the id column to be a regular UUID primary key (not a foreign key)
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Drop the trigger and function that were meant for Supabase auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Update RLS policies to work without auth.uid()
-- Since we're not using Supabase auth, we'll temporarily disable RLS for development
-- In production, you'd want to implement custom RLS policies based on your JWT claims

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create simpler policies for development (or disable RLS entirely)
-- For now, let's allow all operations for development
CREATE POLICY "Allow all operations for development" ON public.profiles
    FOR ALL USING (true);

-- Update other table policies to reference profiles.id instead of auth.uid()
DROP POLICY IF EXISTS "Users can manage own studies" ON public.lichess_studies;
CREATE POLICY "Allow all operations for development" ON public.lichess_studies
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own deviations" ON public.opening_deviations;
CREATE POLICY "Allow all operations for development" ON public.opening_deviations
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can manage own review queue" ON public.review_queue;
CREATE POLICY "Allow all operations for development" ON public.review_queue
    FOR ALL USING (true); 