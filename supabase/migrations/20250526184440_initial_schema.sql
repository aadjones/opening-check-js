-- Chess Opening Trainer Database Schema
-- Initial migration for the chess opening deviation analyzer

-- Enable Row Level Security by default
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Lichess studies table
CREATE TABLE public.lichess_studies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lichess_study_id TEXT NOT NULL,
    study_name TEXT NOT NULL,
    study_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lichess_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own studies" ON public.lichess_studies
    FOR ALL USING (auth.uid() = user_id);

-- Opening deviations table (stores detected deviations from studies)
CREATE TABLE public.opening_deviations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    study_id UUID REFERENCES public.lichess_studies(id) ON DELETE CASCADE,
    game_id TEXT, -- Lichess game ID where deviation occurred
    position_fen TEXT NOT NULL, -- FEN of the position where deviation happened
    expected_move TEXT NOT NULL, -- The move from the study
    actual_move TEXT NOT NULL, -- The move that was played
    move_number INTEGER NOT NULL,
    color TEXT CHECK (color IN ('white', 'black')),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_result TEXT CHECK (review_result IN ('correct', 'incorrect', 'skip'))
);

ALTER TABLE public.opening_deviations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deviations" ON public.opening_deviations
    FOR ALL USING (auth.uid() = user_id);

-- Review queue (simple spaced repetition)
CREATE TABLE public.review_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    deviation_id UUID REFERENCES public.opening_deviations(id) ON DELETE CASCADE,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    review_count INTEGER DEFAULT 0,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own review queue" ON public.review_queue
    FOR ALL USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_lichess_studies_user_id ON public.lichess_studies(user_id);
CREATE INDEX idx_opening_deviations_user_id ON public.opening_deviations(user_id);
CREATE INDEX idx_opening_deviations_study_id ON public.opening_deviations(study_id);
CREATE INDEX idx_review_queue_user_id ON public.review_queue(user_id);
CREATE INDEX idx_review_queue_next_review ON public.review_queue(next_review_at); 