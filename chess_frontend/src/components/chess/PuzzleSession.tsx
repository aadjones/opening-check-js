import React, { useState } from 'react';
import { useReviewQueue } from '../../hooks/useReviewQueue';
import PuzzlePlayer from './PuzzlePlayer';
import styles from './PuzzleSession.module.css';
import { useAuth } from '../../hooks/useAuth';
import { spacedRepetitionService } from '../../lib/spaced-repetition';

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
      // Authenticate the spaced repetition service
      await spacedRepetitionService.authenticate(
        session.user.id,
        session.user.email || undefined,
        session.user.lichessUsername || undefined
      );

      // Record the puzzle attempt and update review queue using the new algorithm
      await spacedRepetitionService.recordPuzzleAttempt(
        {
          deviationId: currentPuzzle.deviation_id,
          userId: session.user.id,
          attemptNumber: attempts,
          wasCorrect: success,
        },
        currentPuzzle // Pass the current queue entry for algorithm calculations
      );
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
