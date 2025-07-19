import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LastGameSummaryWidget.module.css';
import { parsePgnHeaders } from '../../utils/pgn';
import type { Database } from '../../types/supabase';
import { useAuth } from '../../hooks/useAuth';
import { formatTimeControl } from '../../utils/time';
import { deriveOutcome } from '../../utils/outcome';
import OutcomeBadge from '../ui/OutcomeBadge';

type Deviation = Database['public']['Tables']['opening_deviations']['Row'];

interface LastGameSummaryWidgetProps {
  lastDeviation: Deviation | null;
  isLoading: boolean;
}

const LastGameSummaryWidget: React.FC<LastGameSummaryWidgetProps> = ({ lastDeviation, isLoading }) => {
  const { user } = useAuth();

  if (isLoading) {
    return <div className={`${styles.card} ${styles.skeleton}`}></div>;
  }

  if (!lastDeviation) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Last Game</h3>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🎮</span>
          <p>Play a game to see your summary here!</p>
        </div>
      </div>
    );
  }

  const opening = lastDeviation.opening_name || 'Unknown Opening';
  const headers = parsePgnHeaders(lastDeviation.pgn || '');
  const result = headers.Result || '?:?';
  const timeControl = headers.TimeControl || 'N/A';
  const whitePlayer = headers.White || '';
  const blackPlayer = headers.Black || '';

  const userActualColor = user?.lichessUsername?.toLowerCase() === whitePlayer.toLowerCase() ? 'white' : 'black';
  const opponent = userActualColor === 'white' ? blackPlayer : whitePlayer;

  const isUserDeviation = lastDeviation.first_deviator === 'user';

  const outcome = deriveOutcome(result, userActualColor);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Last Game</h3>
        <span className={styles.opening}>{opening.split(':')[0]}</span>
      </div>

      <div className={styles.gameInfo}>
        <span className={isUserDeviation ? styles.statusDeviation : styles.statusFollowed}>
          {isUserDeviation ? '❌ Deviation' : '✅ Prep Held'}
        </span>
        <span className={styles.opponent}>vs {opponent}</span>
        <span>{formatTimeControl(timeControl)}</span>
        <OutcomeBadge outcome={outcome} />
      </div>

      <div className={styles.deviationDetails}>
        {isUserDeviation ? (
          <>
            Deviation on move {lastDeviation.move_number}: played{' '}
            <span className={styles.playedMove}>{lastDeviation.actual_move}</span>, expected{' '}
            <span className={styles.expectedMove}>{lastDeviation.expected_move}</span>
          </>
        ) : (
          <>
            Opponent deviated on move {lastDeviation.move_number} with {lastDeviation.actual_move}
          </>
        )}
      </div>

      <Link to={`/deviation/${lastDeviation.id}`} className={styles.reviewButton}>
        Review Now
      </Link>
    </div>
  );
};

export default LastGameSummaryWidget;
