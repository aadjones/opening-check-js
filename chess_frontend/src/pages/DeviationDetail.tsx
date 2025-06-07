import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { useDeviationById } from '../hooks/useDeviations';
import styles from './DeviationDetail.module.css';
import DeviationDisplay from '../components/chess/DeviationDisplay';
import { parsePgnHeaders } from '../utils/pgn';
import type { Database } from '../types/supabase';
import { SHOW_MOVE_COMPARISON_CARDS, SHOW_REPLAY_PREP_LINE_BUTTON } from '../featureFlags';
import DeviationMoveControls from '../components/chess/DeviationMoveControls';
import type { DeviationMoveControlState } from '../components/chess/DeviationMoveControls';

type Deviation = Database['public']['Tables']['opening_deviations']['Row'];

const DeviationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deviation, loading, error, refetch } = useDeviationById(id);
  const [moveControlState, setMoveControlState] = React.useState<DeviationMoveControlState | null>(null);

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
  const opponent = userColor && userColor.toLowerCase() === 'white' ? blackPlayer : whitePlayer;
  // Construct game URL (assuming Lichess)
  const gameUrl = deviation.game_id
    ? `https://lichess.org/${deviation.game_id}/${userColor?.toLowerCase() || 'white'}#${(deviation.move_number - 1) * 2 + (deviation.color?.toLowerCase() === 'black' ? 1 : 0)}`
    : '';
  // Use actual_move for played move
  const playedMove = deviation.actual_move;
  // Use detected_at for created_at
  const createdAt = new Date(deviation.detected_at ?? '');

  // When determining userColor, add a null check before using it
  const safeUserColor = userColor ?? '';
  if (safeUserColor.toLowerCase() === 'white') {
    // ...
  }

  return (
    <div className={styles.deviationDetailOuter}>
      <div className={styles.deviationDetailCard}>
        <div className={styles.deviationBanner}>
          <span className={styles.deviationIcon}>❌</span>
          <span className={styles.deviationBannerText}>
            You deviated from your prep on move {deviation.move_number}
          </span>
        </div>
        {/* Chessboard Section - flex layout */}
        <div className={styles.chessboardSectionCentered}>
          <div className={styles.chessboardWrapper}>
            <DeviationDisplay
              result={deviation as Deviation}
              gameNumber={1}
              renderControlsExternally={true}
              onMoveControlState={state => setMoveControlState(state)}
            />
          </div>
          <div className={styles.chessboardControls}>
            {moveControlState && (
              <DeviationMoveControls
                currentMoveIndex={moveControlState.currentMoveIndex}
                moveCount={moveControlState.moveCount}
                onStart={moveControlState.onStart}
                onPrev={moveControlState.onPrev}
                onNext={moveControlState.onNext}
                onEnd={moveControlState.onEnd}
                onDeviation={moveControlState.onDeviation}
                deviationIndex={moveControlState.deviationIndex}
                onMoveSlider={moveControlState.onMoveSlider}
              />
            )}
          </div>
        </div>
        {/* Move Comparison Section */}
        {SHOW_MOVE_COMPARISON_CARDS && (
          <div className={styles.moveComparisonPanel}>
            <div className={styles.moveComparisonCards}>
              <div className={styles.moveCardPlayed}>
                <div className={styles.moveCardIcon}>❌</div>
                <div className={styles.moveCardLabel}>You played</div>
                <div className={styles.moveCardMove}>{playedMove}</div>
              </div>
              <div className={styles.moveCardExpected}>
                <div className={styles.moveCardIcon}>✅</div>
                <div className={styles.moveCardLabel}>Expected</div>
                <div className={styles.moveCardMove}>{deviation.expected_move}</div>
              </div>
            </div>
          </div>
        )}
        {/* Actions Section */}
        <div className={styles.actionButtonsPanel}>
          {SHOW_REPLAY_PREP_LINE_BUTTON && <button className={styles.primaryAction}>▶️ Replay My Prep Line</button>}
          <div className={styles.primaryActionsGroup}>
            <button className={styles.primaryAction}>✓ Mark Reviewed</button>
            <button className={styles.primaryAction}>⭐ Adopt Move</button>
            <button className={styles.primaryAction}>🚫 Ignore Line</button>
          </div>
          <div className={styles.secondaryActionsGroup}>
            {gameUrl && (
              <a href={gameUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryAction}>
                View full game on Lichess →
              </a>
            )}
          </div>
        </div>
        {/* Game Info Card */}
        <div className={styles.gameInfoCard}>
          <div className={styles.openingInfo}>📖 Opening: {openingName}</div>
          <div className={styles.opponentInfo}>
            🤝 vs. {opponent}
            {timeControl ? ` — ${timeControl}` : ''}
            {gameResult ? ` — Result: ${gameResult}` : ''}
          </div>
        </div>
        {/* Meta Info (Collapsible) */}
        <details className={styles.metaInfoDetails}>
          <summary>Details</summary>
          <p>Deviation ID: {deviation.id}</p>
          <p>Game ID: {deviation.game_id}</p>
          <p>Created: {createdAt.toLocaleString()}</p>
        </details>
      </div>
    </div>
  );
};

export default DeviationDetail;
