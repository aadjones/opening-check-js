import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useDeviationById } from '../hooks/useDeviations';
import styles from './DeviationDetail.module.css';
import DeviationDisplay from '../components/chess/DeviationDisplay';
import { parsePgnHeaders } from '../utils/pgn';

const DeviationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deviation, loading, error, refetch } = useDeviationById(id);

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

  // Parse PGN headers for inferred fields
  const headers = parsePgnHeaders(deviation.pgn || '');
  const openingName = headers.Opening || 'Unknown Opening';
  const timeControl = headers.TimeControl || 'Unknown';
  const gameResult = headers.Result || '';
  const userColor = deviation.color;
  const whitePlayer = headers.White || 'White';
  const blackPlayer = headers.Black || 'Black';
  // Infer opponent name (the non-user player)
  const opponent = userColor.toLowerCase() === 'white' ? blackPlayer : whitePlayer;
  // Construct game URL (assuming Lichess)
  const gameUrl = deviation.game_id ? `https://lichess.org/${deviation.game_id}` : '';
  // Use actual_move for played move
  const playedMove = deviation.actual_move;
  // Use detected_at for created_at
  const createdAt = deviation.detected_at;

  return (
    <div className={styles.deviationDetail}>
      <div className={styles.deviationHeader}>
        <div className={`${styles.statusBanner} ${styles.error}`}>
          ❌ You deviated from your prep on move {deviation.move_number}
        </div>
        <div className={styles.gameInfo}>
          <div className={styles.openingInfo}>📖 Opening: {openingName}</div>
          <div className={styles.opponentInfo}>
            🤝 vs. {opponent}
            {timeControl ? ` — ${timeControl}` : ''}
            {gameResult ? ` — Result: ${gameResult}` : ''}
          </div>
        </div>
      </div>

      <div className={styles.moveComparison}>
        <div className={styles.moves}>
          <div className={`${styles.move} ${styles.played}`}>
            <span className={styles.label}>You played:</span>
            <span className={styles.moveText}>{playedMove}</span>
            <span className={styles.status}>❌</span>
          </div>
          <div className={`${styles.move} ${styles.expected}`}>
            <span className={styles.label}>Expected:</span>
            <span className={styles.moveText}>{deviation.expected_move}</span>
            <span className={styles.status}>✅</span>
          </div>
        </div>
      </div>

      <div className={styles.chessboardSection}>
        <DeviationDisplay result={deviation} gameNumber={1} />
      </div>

      <div className={styles.actionButtons}>
        <div className={styles.viewButtons}>
          <button className={styles.actionBtn}>View My Move</button>
          <button className={styles.actionBtn}>View My Prep</button>
        </div>

        <div className={styles.mainActions}>
          <button className={styles.primaryAction}>▶️ Replay My Prep Line</button>
        </div>

        <div className={styles.moreOptions}>
          <details>
            <summary>More Options</summary>
            <ul>
              <li>
                <button>I meant to play {playedMove} (Adopt it)</button>
              </li>
              <li>
                <button>Ignore this chapter in the future</button>
              </li>
              {gameUrl && (
                <li>
                  <a href={gameUrl} target="_blank" rel="noopener noreferrer">
                    View full game on Lichess →
                  </a>
                </li>
              )}
            </ul>
          </details>
        </div>
      </div>

      <div className={styles.deviationMeta}>
        <p>Deviation ID: {deviation.id}</p>
        <p>Game ID: {deviation.game_id}</p>
        <p>Created: {new Date(createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default DeviationDetail;
