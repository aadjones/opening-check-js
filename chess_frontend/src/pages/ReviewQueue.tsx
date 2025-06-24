import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './ReviewQueue.module.css';
import { useDeviations } from '../hooks/useDeviations';

const ReviewQueue: React.FC = () => {
  usePageTitle('Review Queue');
  const { deviations, loading, error } = useDeviations({ 
    reviewStatus: 'needs_review',
    limit: 20 
  });
  const [showPuzzleMode, setShowPuzzleMode] = React.useState(false);

  const availablePuzzles = deviations.filter(d => d.first_deviator === 'user');

  if (showPuzzleMode) {
    return (
      <div className={styles.reviewQueue}>
        <div className={styles.header}>
          <h1>Puzzle Mode</h1>
          <p className={styles.subtitle}>Coming soon! 🧩</p>
          <button 
            className={styles.backButton}
            onClick={() => setShowPuzzleMode(false)}
          >
            ← Back to launcher
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.reviewQueue}>
      <div className={styles.header}>
        <h1>Ready to review?</h1>
        <p className={styles.subtitle}>
          Transform your opening mistakes into memory through spaced repetition puzzles
        </p>
      </div>

      <div className={styles.launcherContent}>
        {loading ? (
          <div className={styles.loadingMessage}>Loading your puzzles...</div>
        ) : error ? (
          <div className={styles.errorMessage}>
            Error loading deviations: {error.message}
          </div>
        ) : availablePuzzles.length === 0 ? (
          <div className={styles.noPuzzlesMessage}>
            <h3>No puzzles available!</h3>
            <p>You don't have any unresolved deviations where you went off-book first.</p>
            <p>Play some games and come back when you have deviations to review.</p>
          </div>
        ) : (
          <div className={styles.launcherCard}>
            <div className={styles.puzzleCount}>
              <span className={styles.countNumber}>{availablePuzzles.length}</span>
              <span className={styles.countLabel}>
                puzzle{availablePuzzles.length === 1 ? '' : 's'} ready
              </span>
            </div>
            
            <button 
              className={styles.startButton}
              onClick={() => setShowPuzzleMode(true)}
            >
              Let's go!
            </button>
            
            <p className={styles.explainer}>
              <a href="#" className={styles.explainerLink}>What is this?</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewQueue;
