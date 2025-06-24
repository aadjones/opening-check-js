-- Reset review queue for a single user
DELETE FROM review_queue WHERE user_id = 'USER_ID_HERE';

INSERT INTO review_queue (user_id, deviation_id, next_review_at, review_count, difficulty_level)
SELECT 
    user_id,
    id as deviation_id,
    NOW(),
    0,
    1
FROM opening_deviations
WHERE first_deviator = 'user' AND user_id = 'USER_ID_HERE'
ON CONFLICT (deviation_id) DO NOTHING;

SELECT 'Single user review queue reset complete' as status, COUNT(*) as puzzles_available
FROM review_queue WHERE user_id = 'USER_ID_HERE'; 