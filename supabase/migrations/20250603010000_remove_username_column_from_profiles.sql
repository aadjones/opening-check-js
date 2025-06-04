-- Remove redundant username column from profiles
-- 1. Copy username to lichess_username where needed
UPDATE public.profiles
SET lichess_username = username
WHERE lichess_username IS NULL AND username IS NOT NULL;

-- 2. Drop the old username column
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS username;

-- 3. Add a unique constraint to lichess_username
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_lichess_username_unique UNIQUE (lichess_username); 