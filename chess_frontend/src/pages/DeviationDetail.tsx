import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useDeviations } from '../hooks/useDeviations';
import styles from './DeviationDetail.module.css';

const DeviationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deviations, loading, error, refetch } = useDeviations({ limit: 1 });

  // Find the specific deviation
  const deviation = deviations.find(d => d.id === id);

  // Always call usePageTitle at the top level
  usePageTitle(deviation ? `Deviation ${deviation.move_number}` : 'Deviation Details');

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}>⌛</div>
        <div className={styles.loadingText}>Loading deviation details...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorText}>{error.message || 'Failed to load deviation'}</div>
        <button className={styles.retryButton} onClick={() => refetch()}>
          Try Again
        </button>
      </div>
    );
  }

  // Show not found state
  if (!deviation) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>🔍</div>
        <div className={styles.errorText}>Deviation not found</div>
        <button className={styles.retryButton} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={styles.deviationDetail}>
      <div className={styles.deviationHeader}>
        <div className={`${styles.statusBanner} ${styles.error}`}>
          ❌ You deviated from your prep on move {deviation.move_number}
        </div>
        <div className={styles.gameInfo}>
          <div className={styles.openingInfo}>📖 Opening: {deviation.opening_name || 'Unknown Opening'}</div>
          <div className={styles.opponentInfo}>
            🤝 vs. {deviation.opponent || 'Unknown'}
            {deviation.time_control ? ` — ${deviation.time_control}` : ''}
            {deviation.game_result ? ` — Result: ${deviation.game_result}` : ''}
          </div>
        </div>
      </div>

      <div className={styles.moveComparison}>
        <div className={styles.moves}>
          <div className={`${styles.move} ${styles.played}`}>
            <span className={styles.label}>You played:</span>
            <span className={styles.moveText}>{deviation.played_move}</span>
            <span className={styles.status}>❌</span>
          </div>
          <div className={`${styles.move} ${styles.expected}`}>
            <span className={styles.label}>Expected:</span>
            <span className={styles.moveText}>{deviation.expected_move}</span>
            <span className={styles.status}>✅</span>
          </div>
        </div>
      </div>

      <div className={styles.chessboardPlaceholder}>
        <div className={styles.boardContainer}>
          <p>
            [Chessboard view at move {deviation.move_number} — {deviation.player_color.toLowerCase()} to move]
          </p>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <div className={styles.viewButtons}>
          <button className={styles.actionBtn}>View My Move</button>
          <button className={styles.actionBtn}>View My Prep</button>
        </div>

        <div className={styles.mainActions}>
          <button className={styles.primaryAction}>▶️ Replay My Prep Line</button>
          <button className={styles.secondaryAction} disabled={deviation.reviewed}>
            {deviation.reviewed ? '✅ Reviewed' : 'Mark as Reviewed'}
          </button>
        </div>

        <div className={styles.moreOptions}>
          <details>
            <summary>More Options</summary>
            <ul>
              <li>
                <button>I meant to play {deviation.played_move} (Adopt it)</button>
              </li>
              <li>
                <button>Ignore this chapter in the future</button>
              </li>
              <li>
                <a href={deviation.game_url} target="_blank" rel="noopener noreferrer">
                  View full game on Lichess →
                </a>
              </li>
            </ul>
          </details>
        </div>
      </div>

      {deviation.review_count > 0 && (
        <div className={styles.patternNotice}>
          <div className={styles.noticeCard}>
            🔄 You've reviewed this deviation {deviation.review_count} times.
            {deviation.next_review_date && (
              <> Next review: {new Date(deviation.next_review_date).toLocaleDateString()}</>
            )}
            <button className={styles.remindBtn}>Remind Me</button>
          </div>
        </div>
      )}

      <div className={styles.deviationMeta}>
        <p>Deviation ID: {deviation.id}</p>
        <p>Game ID: {deviation.game_id}</p>
        <p>Created: {new Date(deviation.created_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default DeviationDetail;
