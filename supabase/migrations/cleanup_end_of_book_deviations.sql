-- Migration: Clean up false "End of book" deviations and their dependent records
-- This migration removes records that were incorrectly flagged as deviations
-- when games simply continued beyond the end of prepared opening lines

-- Before applying this fix, there should be:
-- - 20 false deviations with expected_move = 'End of book'
-- - 7 review queue items referencing these deviations
-- - 20 puzzle attempts referencing these deviations

BEGIN;

-- First, delete puzzle attempts that reference End of book deviations
DELETE FROM puzzle_attempts 
WHERE deviation_id IN (
    SELECT id FROM opening_deviations 
    WHERE expected_move = 'End of book'
);

-- Second, delete review queue items that reference End of book deviations  
DELETE FROM review_queue
WHERE deviation_id IN (
    SELECT id FROM opening_deviations 
    WHERE expected_move = 'End of book'
);

-- Finally, delete the false End of book deviation records themselves
DELETE FROM opening_deviations 
WHERE expected_move = 'End of book';

COMMIT;

-- After this migration:
-- - All false "End of book" deviations should be removed
-- - Associated puzzle attempts and review queue items should be cleaned up
-- - Only true deviations (where actual alternatives existed) should remain