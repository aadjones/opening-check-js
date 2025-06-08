-- Add first_deviator column to track who deviated first
-- Migration: 20250608000000_add_first_deviator.sql

-- Add first_deviator column to track who deviated first
ALTER TABLE public.opening_deviations
ADD COLUMN first_deviator TEXT CHECK (first_deviator IN ('user', 'opponent'));

-- Add comment to explain the column
COMMENT ON COLUMN public.opening_deviations.first_deviator IS 
    'Indicates who deviated first in the game: user (we deviated from our prep) or opponent (they deviated from theory)';

-- Add index for faster filtering by first_deviator
CREATE INDEX idx_opening_deviations_first_deviator 
    ON public.opening_deviations(first_deviator);

-- Add comment to explain the index
COMMENT ON INDEX public.idx_opening_deviations_first_deviator IS 
    'Index for faster filtering of deviations by who deviated first (user or opponent)'; 