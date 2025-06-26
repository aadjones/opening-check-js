import React, { useState } from 'react';
import { useReviewQueue } from '../../hooks/useReviewQueue';
import PuzzlePlayer from './PuzzlePlayer';
import styles from './PuzzleSession.module.css';
import { fetchSupabaseJWT } from '../../lib/auth/fetchSupabaseJWT';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../hooks/useAuth';

interface PuzzleSessionProps {
  onExit: () => void;
}

const PuzzleSession: React.FC<PuzzleSessionProps> = ({ onExit }) => {
  const { puzzles, loading, error } = useReviewQueue();
  const { session } = useAuth();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [isRecordingAttempt, setIsRecordingAttempt] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Track puzzle attempt and update spaced repetition
  const handlePuzzleComplete = async (success: boolean, attempts: number) => {
    const currentPuzzle = puzzles[currentPuzzleIndex];
    if (!currentPuzzle || isRecordingAttempt) return;
    if (!session?.user?.id) {
      console.error('No user session found. Cannot record puzzle attempt.');
      return;
    }

    setIsRecordingAttempt(true);

    try {
      // Get a JWT for the current user
      const supabaseJwt = await fetchSupabaseJWT({
        sub: session.user.id,
        email: session.user.email || undefined,
        lichess_username: session.user.lichessUsername || undefined,
      });
      // Create an authenticated Supabase client
      const supabaseWithAuth = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseJwt}`,
          },
        },
      });
      // Record the puzzle attempt with user_id
      await supabaseWithAuth.from('puzzle_attempts').insert({
        deviation_id: currentPuzzle.deviation_id,
        user_id: session?.user?.id,
        attempt_number: attempts,
        was_correct: success,
      });

      // Update review queue with basic spaced repetition logic
      const now = new Date();
      let nextReviewDate: Date;

      if (success) {
        // Success: longer interval based on review count
        const intervalDays = Math.min(1 + currentPuzzle.review_count * 2, 30);
        nextReviewDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      } else {
        // Failed: review again soon
        nextReviewDate = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour
      }

      await supabaseWithAuth
        .from('review_queue')
        .update({
          next_review_at: nextReviewDate.toISOString(),
          review_count: currentPuzzle.review_count + 1,
        })
        .eq('id', currentPuzzle.id);
    } catch (err) {
      console.error('Error recording puzzle attempt:', err);
    } finally {
      setIsRecordingAttempt(false);
    }
  };

  const handleNextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      // Session complete - show celebration!
      setShowCelebration(true);

      // Auto-exit after celebration
      setTimeout(() => {
        onExit();
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className={styles.puzzleSession}>
        <div className={styles.loading}>Loading puzzles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.puzzleSession}>
        <div className={styles.error}>
          <h3>Error loading puzzles</h3>
          <p>{error.message}</p>
          <button onClick={onExit} className={styles.exitButton}>
            Back to launcher
          </button>
        </div>
      </div>
    );
  }

  if (puzzles.length === 0) {
    return (
      <div className={styles.puzzleSession}>
        <div className={styles.noPuzzles}>
          <h3>No puzzles available!</h3>
          <p>All caught up! Come back later for more puzzles.</p>
          <button onClick={onExit} className={styles.exitButton}>
            Back to launcher
          </button>
        </div>
      </div>
    );
  }

  // Show celebration when session is complete
  if (showCelebration) {
    return (
      <div className={styles.puzzleSession}>
        <div className={styles.celebration}>
          <div className={styles.celebrationIcon}>🎉</div>
          <h3>Session Complete!</h3>
          <p>Great job! You've finished all your puzzles for now.</p>
          <div className={styles.celebrationStats}>
            <span>
              Completed {puzzles.length} puzzle{puzzles.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const currentPuzzle = puzzles[currentPuzzleIndex];
  const progress = ((currentPuzzleIndex + 1) / puzzles.length) * 100;

  return (
    <div className={styles.puzzleSession}>
      <div className={styles.header}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.sessionInfo}>
          <span className={styles.progressText}>
            Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
          </span>
          <button onClick={onExit} className={styles.exitButton}>
            Exit Session
          </button>
        </div>
      </div>

      <PuzzlePlayer
        key={currentPuzzle.id}
        puzzle={currentPuzzle}
        onComplete={handlePuzzleComplete}
        onNext={handleNextPuzzle}
      />
    </div>
  );
};

export default PuzzleSession;
