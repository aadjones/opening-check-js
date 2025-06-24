import React, { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './ReviewQueue.module.css';
import { useReviewQueue } from '../hooks/useReviewQueue';
import PuzzleSession from '../components/chess/PuzzleSession';
import { getRandomReviewQuote } from '../data/reviewQuotes';

const ReviewQueue: React.FC = () => {
  usePageTitle('Review');
  const { puzzles, loading, error, refetch } = useReviewQueue();
  const [showPuzzleMode, setShowPuzzleMode] = React.useState(false);
  const [motivationalQuote] = React.useState(() => getRandomReviewQuote());
  const [showInfo, setShowInfo] = useState(false);

  const handleExitSession = () => {
    setShowPuzzleMode(false);
    // Refetch to get updated queue after spaced repetition updates
    refetch();
  };

  if (showPuzzleMode) {
    return <PuzzleSession onExit={handleExitSession} />;
  }

  return (
    <div className={styles.reviewQueue}>
      <div className={styles.header}>
        <h1>Ready to review?</h1>
        <p className={styles.subtitle}>{motivationalQuote}</p>
      </div>

      <div className={styles.launcherContent}>
        {loading ? (
          <div className={styles.loadingMessage}>Loading your puzzles...</div>
        ) : error ? (
          <div className={styles.errorMessage}>Error loading deviations: {error.message}</div>
        ) : puzzles.length === 0 ? (
          <div className={styles.noPuzzlesMessage}>
            <h3>No puzzles available!</h3>
            <p>You don't have any unresolved deviations where you went off-book first.</p>
            <p>Play some games and come back when you have deviations to review.</p>
          </div>
        ) : (
          <div className={styles.launcherCard}>
            <div className={styles.puzzleCount}>
              <span className={styles.countNumber}>{puzzles.length}</span>
              <span className={styles.countLabel}>puzzle{puzzles.length === 1 ? '' : 's'} ready</span>
            </div>

            <button className={styles.startButton} onClick={() => setShowPuzzleMode(true)}>
              Let's go!
            </button>

            <p className={styles.explainer}>
              <a
                href="#"
                className={styles.explainerLink}
                onClick={e => {
                  e.preventDefault();
                  setShowInfo(v => !v);
                }}
              >
                What is this?
              </a>
            </p>
            {showInfo && (
              <div
                style={{
                  background: 'var(--color-background-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '1.25rem',
                  marginTop: '1rem',
                  maxWidth: 340,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  color: 'var(--color-text)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <strong>What is Review?</strong>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: 'var(--color-text-muted)' }}>
                  Review puzzles are personalized drills based on your real off-book moves. Practice your weaknesses
                  until they become strengths.
                </p>
                <button
                  style={{
                    marginTop: '1rem',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.5rem 1.25rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  onClick={() => setShowInfo(false)}
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewQueue;
