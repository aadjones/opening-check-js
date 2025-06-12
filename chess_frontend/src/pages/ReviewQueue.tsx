import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './ReviewQueue.module.css';
import { FaTimesCircle, FaCheck, FaBan, FaEye } from 'react-icons/fa';
import { useDeviations } from '../hooks/useDeviations';
import { parsePgnHeaders } from '../utils/pgn';
import { useAuth } from '../hooks/useAuth';

const ReviewQueue: React.FC = () => {
  usePageTitle('Review Queue');
  const { deviations, loading, error } = useDeviations({ reviewStatus: 'needs_review', limit: 20 });
  const { user } = useAuth();

  function getMoveNotation(moveNumber: number, color: string | null | undefined, move: string | null | undefined) {
    if (!moveNumber || !color || !move) return '';
    if (color.toLowerCase() === 'white') {
      return `${moveNumber}.${move}`;
    } else {
      return `${moveNumber}...${move}`;
    }
  }

  return (
    <div className={styles.reviewQueue}>
      <div className={styles.header}>
        <h1>Review Queue</h1>
        <p className={styles.subtitle}>Review and resolve your deviations</p>
      </div>

      <div className={styles.queueList}>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>Error loading deviations.</div>
        ) : deviations.length === 0 ? (
          <div>No deviations need review. Nice job!</div>
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
            return (
              <div key={deviation.id} className={styles.deviationCard}>
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

                <div className={`${styles.actions} dev`}>
                  <button className={styles.actionButton}>
                    <FaEye style={{ marginRight: 4 }} /> View
                  </button>
                  <button className={styles.actionButton}>
                    <FaCheck style={{ marginRight: 4 }} /> Mark Reviewed
                  </button>
                  <button className={styles.actionButton}>⭐ Adopt Move</button>
                  <button className={styles.actionButton}>
                    <FaBan style={{ marginRight: 4 }} /> Ignore
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewQueue;
