import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './ReviewQueue.module.css';
import { FaTimesCircle, FaCheck, FaBan, FaEye } from 'react-icons/fa';
import { useDeviations } from '../hooks/useDeviations';
import { parsePgnHeaders } from '../utils/pgn';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  SHOW_REVIEWED_COUNT,
  SHOW_REVIEW_PROGRESS_BAR,
  SHOW_REVIEW_ENCOURAGEMENT,
  SHOW_REVIEW_CELEBRATION,
  SHOW_REVIEW_STREAKS,
} from '../featureFlags';

const encouragementMessages = ['Nice! Keep going!', "You're on a roll!", 'Great job!', 'Crushing it!', 'Almost there!'];

const ReviewQueue: React.FC = () => {
  usePageTitle('Review Queue');
  const { deviations: initialDeviations, loading, error } = useDeviations({ reviewStatus: 'needs_review', limit: 20 });
  const { user } = useAuth();
  const [deviations, setDeviations] = React.useState(initialDeviations);
  const [markingIds, setMarkingIds] = React.useState<string[]>([]);
  const [reviewedCount, setReviewedCount] = React.useState(0);
  const [showEncouragement, setShowEncouragement] = React.useState(false);
  const [streak, setStreak] = React.useState(0);
  const navigate = useNavigate();

  // Stable batch: useRef to store the initial batch of IDs
  const userId = user?.id || 'anon';
  const queueKey = `reviewQueue_${userId}`;
  const initialBatchIdsRef = React.useRef<string[] | null>(null);

  // On first mount or when user/queue changes, set the batch if not already set and data is loaded
  React.useEffect(() => {
    if (!initialBatchIdsRef.current && initialDeviations.length > 0) {
      initialBatchIdsRef.current = initialDeviations.map(dev => dev.id).sort();
    }
  }, [userId, initialDeviations]);

  // Stable denominator for the session
  const [totalToReview, setTotalToReview] = React.useState(0);

  // On first load or when user/initial batch changes, initialize or reset session progress
  React.useEffect(() => {
    if (!initialBatchIdsRef.current || initialBatchIdsRef.current.length === 0) return;
    setDeviations(initialDeviations);
    const batchIds = initialBatchIdsRef.current;
    const stored = sessionStorage.getItem(queueKey);
    let shouldReset = true;
    if (stored) {
      try {
        const { batchIds: storedBatch, reviewedCount, streak, totalToReview } = JSON.parse(stored);
        const sortedStoredBatch = Array.isArray(storedBatch) ? storedBatch.slice().sort() : [];
        if (
          sortedStoredBatch.length === batchIds.length &&
          sortedStoredBatch.every((id, idx) => id === batchIds[idx])
        ) {
          // Same batch, restore progress
          setReviewedCount(reviewedCount || 0);
          setStreak(streak || 0);
          setTotalToReview(totalToReview || batchIds.length);
          shouldReset = false;
        }
      } catch {
        // Ignore parse errors, will reset below
      }
    }
    if (shouldReset) {
      setReviewedCount(0);
      setStreak(0);
      setTotalToReview(batchIds.length);
      sessionStorage.setItem(
        queueKey,
        JSON.stringify({ batchIds, reviewedCount: 0, streak: 0, totalToReview: batchIds.length })
      );
    }
    // Only run when user or initial batch changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, initialDeviations, initialBatchIdsRef.current && initialBatchIdsRef.current.join(',')]);

  // Persist reviewedCount, streak, and totalToReview to sessionStorage
  React.useEffect(() => {
    if (!initialBatchIdsRef.current || initialBatchIdsRef.current.length === 0) return;
    const batchIds = initialBatchIdsRef.current;
    sessionStorage.setItem(queueKey, JSON.stringify({ batchIds, reviewedCount, streak, totalToReview }));
  }, [reviewedCount, streak, totalToReview, queueKey]);

  async function handleMarkReviewed(id: string) {
    setMarkingIds(ids => [...ids, id]);
    await supabase.from('opening_deviations').update({ review_status: 'reviewed' }).eq('id', id);
    setTimeout(() => {
      setDeviations(deviations => deviations.filter(dev => dev.id !== id));
      setMarkingIds(ids => ids.filter(markId => markId !== id));
      setReviewedCount(count => count + 1);
      setStreak(s => s + 1);
      if (SHOW_REVIEW_ENCOURAGEMENT) {
        setShowEncouragement(true);
        setTimeout(() => setShowEncouragement(false), 1200);
      }
    }, 1200);
  }

  function getMoveNotation(moveNumber: number, color: string | null | undefined, move: string | null | undefined) {
    if (!moveNumber || !color || !move) return '';
    if (color.toLowerCase() === 'white') {
      return `${moveNumber}.${move}`;
    } else {
      return `${moveNumber}...${move}`;
    }
  }

  // Progress bar calculation
  const progress = totalToReview === 0 ? 1 : reviewedCount / totalToReview;
  const allReviewed = deviations.length === 0 && totalToReview > 0;
  const encouragementMsg = encouragementMessages[reviewedCount % encouragementMessages.length];

  return (
    <div className={styles.reviewQueue}>
      <div className={styles.header}>
        <h1>Review Queue</h1>
        <p className={styles.subtitle}>Review and resolve your deviations</p>
        {SHOW_REVIEWED_COUNT && totalToReview > 0 && (
          <div className={styles.reviewedCount}>
            You've reviewed <b>{reviewedCount}</b> of <b>{totalToReview}</b> deviations!
          </div>
        )}
        {SHOW_REVIEW_PROGRESS_BAR && totalToReview > 0 && (
          <div className={styles.progressBarWrapper}>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFg} style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <span className={styles.progressBarText}>{Math.round(progress * 100)}%</span>
          </div>
        )}
        {SHOW_REVIEW_STREAKS && streak > 1 && <div className={styles.streakMsg}>🔥 {streak} in a row!</div>}
        {SHOW_REVIEW_ENCOURAGEMENT && showEncouragement && !allReviewed && (
          <div className={styles.encouragementMsg}>{encouragementMsg}</div>
        )}
        {SHOW_REVIEW_CELEBRATION && allReviewed && (
          <div className={styles.celebrationMsg}>🎉 All caught up! No more deviations to review.</div>
        )}
      </div>

      <div className={styles.queueList}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>Error loading deviations.</div>
        ) : deviations.length === 0 ? (
          !SHOW_REVIEW_CELEBRATION && <div>No deviations need review. Nice job!</div>
        ) : (
          deviations.map(deviation => {
            const headers = parsePgnHeaders(deviation.pgn || '');
            const whitePlayer = headers.White || 'White';
            const blackPlayer = headers.Black || 'Black';
            const userLichess = user?.lichessUsername || user?.name || '';
            let userColor: 'white' | 'black' | null = null;
            if (userLichess.toLowerCase() === whitePlayer.toLowerCase()) {
              userColor = 'white';
            } else if (userLichess.toLowerCase() === blackPlayer.toLowerCase()) {
              userColor = 'black';
            }
            // Opponent is the other player
            let opponent = 'Unknown Opponent';
            if (userColor === 'white') {
              opponent = blackPlayer;
            } else if (userColor === 'black') {
              opponent = whitePlayer;
            }
            const timeControl = headers.TimeControl || '';
            const playedLabel = deviation.first_deviator === 'user' ? 'You played' : 'Opponent played';
            const isMarking = markingIds.includes(deviation.id);
            return (
              <div key={deviation.id} className={styles.deviationCard}>
                {isMarking ? (
                  <div className={styles.markedMessage}>✓ Marked as reviewed!</div>
                ) : (
                  <>
                    <div className={styles.deviationHeader}>
                      <span className={styles.statusBadge}>
                        <FaTimesCircle style={{ marginRight: 6, color: '#dc2626' }} /> Needs Review
                      </span>
                      <span className={styles.openingName}>{deviation.opening_name || 'Unknown Opening'}</span>
                    </div>

                    <div className={styles.deviationContent}>
                      <div className={styles.moveInfo}>
                        <div className={styles.moveComparison}>
                          <div className={styles.moveCard}>
                            <div className={styles.moveLabel}>{playedLabel}</div>
                            <div className={styles.moveValue}>
                              {getMoveNotation(deviation.move_number, deviation.color, deviation.actual_move)}
                            </div>
                          </div>
                          <div className={styles.moveCard}>
                            <div className={styles.moveLabel}>Expected</div>
                            <div className={styles.moveValue}>
                              {getMoveNotation(deviation.move_number, deviation.color, deviation.expected_move)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.gameInfo}>
                        <div>vs {opponent}</div>
                        <div>{timeControl}</div>
                        <div>{deviation.detected_at ? new Date(deviation.detected_at).toLocaleDateString() : ''}</div>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button className={styles.actionButton} onClick={() => navigate(`/deviation/${deviation.id}`)}>
                        <FaEye style={{ marginRight: 4 }} /> View
                      </button>
                      <button className={styles.actionButton} onClick={() => handleMarkReviewed(deviation.id)}>
                        <FaCheck style={{ marginRight: 4 }} /> Mark Reviewed
                      </button>
                      <button className={`${styles.actionButton} dev`}>⭐ Adopt Move</button>
                      <button className={`${styles.actionButton} dev`}>
                        <FaBan style={{ marginRight: 4 }} /> Ignore
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewQueue;
