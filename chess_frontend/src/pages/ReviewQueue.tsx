import React, { useState, useEffect } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './ReviewQueue.module.css';
import { useReviewQueue } from '../hooks/useReviewQueue';
import PuzzleSession from '../components/chess/PuzzleSession';
import { ReviewTimePlanner, ReviewLearningStatus } from '../components/review';
import { getRandomReviewQuote } from '../data/reviewQuotes';
import { useAuth } from '../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { fetchSupabaseJWT } from '../lib/auth/fetchSupabaseJWT';

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

      <div className={styles.contentLayout}>
        <div className={styles.mainContent}>
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
                
                {/* Debug reset section when no puzzles */}
                <ResetQueueSection onReset={refetch} />
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

                {/* Debug reset section when puzzles exist */}
                <ResetQueueSection onReset={refetch} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidebar}>
          <ReviewTimePlanner />
          <ReviewLearningStatus />
        </div>
      </div>
    </div>
  );
};

// Reset Queue component for debugging/testing
const ResetQueueSection: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const { session } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetSection, setShowResetSection] = useState(false);

  // Clear reset message after 3 seconds
  useEffect(() => {
    if (resetMessage) {
      const timer = setTimeout(() => setResetMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [resetMessage]);

  const handleResetReviewQueue = async () => {
    if (!session?.user?.id) {
      setResetMessage({ type: 'error', text: 'You must be logged in to reset the review queue.' });
      return;
    }

    if (!confirm('Are you sure you want to reset your review queue? This will make all your puzzles available for review again.')) {
      return;
    }

    setIsResetting(true);
    setResetMessage(null);

    try {
      const supabaseJwt = await fetchSupabaseJWT({
        sub: session.user.id!,
        email: session.user.email || undefined,
        lichess_username: session.user.lichessUsername || undefined,
      });

      const supabaseWithAuth = createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${supabaseJwt}`,
            },
          },
        }
      );

      // Delete existing review queue entries for this user
      const { error: deleteError } = await supabaseWithAuth
        .from('review_queue')
        .delete()
        .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      // Get user deviations where they went off-book first
      const { data: deviations, error: fetchError } = await supabaseWithAuth
        .from('opening_deviations')
        .select('id, user_id')
        .eq('user_id', session.user.id)
        .eq('first_deviator', 'user');

      if (fetchError) throw fetchError;

      if (deviations && deviations.length > 0) {
        // Insert fresh review queue entries
        const queueEntries = deviations.map(deviation => ({
          user_id: deviation.user_id,
          deviation_id: deviation.id,
          review_count: 0,
          difficulty_level: 1,
          // Don't set next_review_at - let it default to NOW()
        }));

        const { error: insertError } = await supabaseWithAuth
          .from('review_queue')
          .insert(queueEntries);

        if (insertError) throw insertError;

        setResetMessage({ 
          type: 'success', 
          text: `Review queue reset! ${deviations.length} puzzles are now available for review.` 
        });
      } else {
        setResetMessage({ 
          type: 'success', 
          text: 'Review queue reset, but no puzzles found. Play some games to create deviations!' 
        });
      }

      // Refresh the queue after reset
      onReset();

    } catch (err: unknown) {
      let message = 'Failed to reset review queue';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      setResetMessage({ type: 'error', text: message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div style={{ 
      marginTop: '2rem', 
      padding: '1rem',
      background: 'var(--color-background-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      maxWidth: 340,
      marginLeft: 'auto',
      marginRight: 'auto',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: showResetSection ? '1rem' : '0'
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          🛠️ Debug Tools
        </span>
        <button
          onClick={() => setShowResetSection(!showResetSection)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: '0.25rem 0.5rem',
          }}
        >
          {showResetSection ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {showResetSection && (
        <>
          <div style={{ 
            fontSize: '0.85rem', 
            color: 'var(--color-text-muted)', 
            marginBottom: '1rem' 
          }}>
            Reset your review queue to make all puzzles available again. Useful for testing.
          </div>
          <button
            onClick={handleResetReviewQueue}
            disabled={isResetting}
            style={{
              width: '100%',
              backgroundColor: isResetting ? '#6b7280' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: isResetting ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {isResetting ? 'Resetting...' : '🔄 Reset Review Queue'}
          </button>
          {resetMessage && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.5rem',
              borderRadius: 4,
              fontSize: '0.85rem',
              backgroundColor: resetMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: resetMessage.type === 'success' ? '#166534' : '#dc2626',
              border: `1px solid ${resetMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            }}>
              {resetMessage.text}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewQueue;
