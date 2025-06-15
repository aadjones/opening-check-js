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
import { supabase } from '../lib/supabase';

type Deviation = Database['public']['Tables']['opening_deviations']['Row'];

const DeviationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deviation, loading, error, refetch } = useDeviationById(id);
  const [moveControlState, setMoveControlState] = React.useState<DeviationMoveControlState | null>(null);
  const [marking, setMarking] = React.useState(false);
  const [marked, setMarked] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Set page title dynamically
  usePageTitle(deviation ? `Deviation on Move ${deviation.move_number}` : 'Deviation Details');

  // Loading State
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}>⌛</div>
        <div className={styles.loadingText}>Loading deviation details...</div>
      </div>
    );
  }

  // Error State
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

  // Not Found State
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

  // --- Data Parsing and Logic ---
  const headers = parsePgnHeaders(deviation.pgn || '');
  const isUserDeviation = deviation.first_deviator === 'user';
  const userColor = isUserDeviation ? deviation.color : deviation.color === 'White' ? 'Black' : 'White';
  const whitePlayer = headers.White || 'White';
  const blackPlayer = headers.Black || 'Black';
  const opponent = userColor?.toLowerCase() === 'white' ? blackPlayer : whitePlayer;
  const openingName = headers.Opening || 'Unknown Opening';
  const timeControl = headers.TimeControl || 'Unknown';
  const gameResult = headers.Result || '';
  const gameUrl = deviation.game_id
    ? `https://lichess.org/${deviation.game_id}/${userColor?.toLowerCase() || 'white'}#${
        (deviation.move_number - 1) * 2 + (deviation.color?.toLowerCase() === 'black' ? 1 : 0)
      }`
    : '';
  const playedMove = deviation.actual_move;
  const createdAt = new Date(deviation.detected_at ?? '');

  const handleMarkReviewed = async () => {
    if (!deviation?.id) return;
    setMarking(true);
    setErrorMsg(null);
    const { error } = await supabase
      .from('opening_deviations')
      .update({ review_status: 'reviewed' })
      .eq('id', deviation.id);
    setMarking(false);
    if (error) {
      setErrorMsg('Failed to mark as reviewed.');
    } else {
      setMarked(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      refetch();
    }
  };

  return (
    <div className={styles.deviationDetailOuter}>
      <div className={styles.deviationDetailCard}>
        {/* --- DYNAMIC BANNER --- */}
        <div className={`${styles.deviationBanner} ${!isUserDeviation ? styles.opponentDeviatedBanner : ''}`}>
          {isUserDeviation ? (
            <>
              <span className={styles.deviationIcon}>❌</span>
              <span className={styles.deviationBannerText}>
                You deviated from your prep on move {deviation.move_number}
              </span>
            </>
          ) : (
            <>
              <span className={styles.deviationIcon}>✅</span>
              <span className={styles.deviationBannerText}>Opponent went off-book on move {deviation.move_number}</span>
            </>
          )}
        </div>

        {/* --- CHESSBOARD & CONTROLS --- */}
        <div className={styles.chessboardSectionCentered}>
          <div className={styles.chessboardWrapper}>
            <DeviationDisplay
              result={deviation as Deviation}
              gameNumber={1}
              renderControlsExternally={true}
              onMoveControlState={setMoveControlState}
              isUserDeviation={isUserDeviation} // Pass the flag
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

        {/* --- MOVE COMPARISON (Optional based on flag) --- */}
        {SHOW_MOVE_COMPARISON_CARDS && (
          <div className={styles.moveComparisonPanel}>
            <div className={styles.moveComparisonCards}>
              <div className={styles.moveCardPlayed}>
                <div className={styles.moveCardIcon}>{isUserDeviation ? '❌' : '➡️'}</div>
                <div className={styles.moveCardLabel}>{isUserDeviation ? 'You played' : 'Opponent played'}</div>
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

        {/* --- ACTION BUTTONS --- */}
        <div className={styles.actionButtonsPanel}>
          {SHOW_REPLAY_PREP_LINE_BUTTON && <button className={styles.primaryAction}>▶️ Replay My Prep Line</button>}
          <div className={styles.primaryActionsGroup}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={handleMarkReviewed}
              disabled={marking || marked}
              style={{
                backgroundColor: marked ? '#4caf50' : undefined,
                color: marked ? 'white' : undefined,
                cursor: marked ? 'default' : undefined,
                border: marked ? 'none' : undefined,
                transition: 'background 0.2s',
              }}
            >
              {marked ? '✓ Reviewed' : marking ? 'Marking...' : '✓ Mark Reviewed'}
            </button>
            <button className={`${styles.primaryAction} dev`}>⭐ Adopt Move</button>
            <button className={`${styles.primaryAction} dev`}>🚫 Ignore Line</button>
          </div>
          <div className={styles.secondaryActionsGroup}>
            {gameUrl && (
              <a href={gameUrl} target="_blank" rel="noopener noreferrer" className={styles.secondaryAction}>
                View full game on Lichess →
              </a>
            )}
          </div>
        </div>

        {/* --- GAME INFO & DETAILS --- */}
        <div className={styles.gameInfoCard}>
          <div className={styles.openingInfo}>📖 Opening: {openingName}</div>
          <div className={styles.opponentInfo}>
            🤝 vs. {opponent}
            {timeControl ? ` — ${timeControl}` : ''}
            {gameResult ? ` — Result: ${gameResult}` : ''}
          </div>
        </div>

        <details className={styles.metaInfoDetails}>
          <summary>Details</summary>
          <p>Deviation ID: {deviation.id}</p>
          <p>Game ID: {deviation.game_id}</p>
          <p>Created: {createdAt.toLocaleString()}</p>
        </details>

        {showSuccess && <div className={styles.successText}>Marked as reviewed!</div>}
        {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}
      </div>
    </div>
  );
};

export default DeviationDetail;
