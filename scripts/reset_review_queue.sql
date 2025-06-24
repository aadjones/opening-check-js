-- Reset Review Queue Script
-- Use this script to reset the review queue for debugging/testing
--
-- USAGE:
-- 1. Copy and paste this entire script into Supabase SQL Editor
-- 2. OR run via CLI: supabase db reset --db-url "your-db-url" < scripts/reset_review_queue.sql
-- 3. OR use the mcp_supabase_execute_sql tool in Claude

-- Clear existing review queue data
DELETE FROM review_queue;

-- Clear puzzle attempts history (optional - comment out if you want to keep history)
DELETE FROM puzzle_attempts;

-- Repopulate review queue with fresh data
-- Only includes user deviations (first_deviator = 'user')
INSERT INTO review_queue (user_id, deviation_id, next_review_at, review_count, difficulty_level)
SELECT 
    user_id,
    id as deviation_id,
    NOW() as next_review_at,  -- All due immediately for testing
    0 as review_count,        -- Reset review counts
    1 as difficulty_level     -- Reset to level 1
FROM opening_deviations
WHERE first_deviator = 'user'
ON CONFLICT (deviation_id) DO NOTHING;

-- Show summary of what was reset
SELECT 
    'Review Queue Reset Complete' as status,
    COUNT(*) as puzzles_available
FROM review_queue; 