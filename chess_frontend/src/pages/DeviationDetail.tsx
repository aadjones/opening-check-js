import React from 'react';
import { useParams } from 'react-router-dom';
import UnderConstruction from '../components/ui/UnderConstruction';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './DeviationDetail.module.css';

const DeviationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock data - in real app this would come from API based on the ID
  const mockGames = {
    '1': { hasDeviation: false, opponent: 'ChessMaster99', result: 'Win' },
    '2': { hasDeviation: true, opponent: 'TacticalTiger', result: 'Loss' },
    '3': { hasDeviation: false, opponent: 'PawnStorm', result: 'Draw' },
    '4': { hasDeviation: true, opponent: 'EndgameExpert', result: 'Win' },
  };

  const gameData = mockGames[id as keyof typeof mockGames];
  const hasDeviation = gameData?.hasDeviation ?? true; // Default to deviation for unknown IDs

  usePageTitle(hasDeviation ? `Deviation ${id}` : `Game ${id}`);

  return (
    <div className={styles.deviationDetail}>
      <UnderConstruction
        title={hasDeviation ? 'Deviation Analysis' : 'Game Review'}
        message={
          hasDeviation
            ? 'This detailed deviation review interface is currently being developed. The backend analysis is working, but the interactive review features are coming soon!'
            : 'This game review interface is under development. You can see the game details, but full analysis features are coming soon!'
        }
        variant="banner"
      />

      <div className={styles.deviationHeader}>
        <div className={`${styles.statusBanner} ${hasDeviation ? styles.error : styles.success}`}>
          {hasDeviation ? '❌ You deviated from your prep on move 6' : '✅ Perfect prep execution!'}
        </div>
        <div className={styles.gameInfo}>
          <div className={styles.openingInfo}>📖 Opening: King's Indian – Classical</div>
          <div className={styles.opponentInfo}>
            🤝 vs. {gameData?.opponent || 'Unknown'} (1740) — Blitz 5+3 — Result: {gameData?.result || 'Unknown'}
          </div>
        </div>
      </div>

      {hasDeviation && (
        <div className={styles.moveComparison}>
          <div className={styles.moves}>
            <div className={`${styles.move} ${styles.played}`}>
              <span className={styles.label}>You played:</span>
              <span className={styles.moveText}>6.h3</span>
              <span className={styles.status}>❌</span>
            </div>
            <div className={`${styles.move} ${styles.expected}`}>
              <span className={styles.label}>Expected:</span>
              <span className={styles.moveText}>6.Be2</span>
              <span className={styles.status}>✅</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.chessboardPlaceholder}>
        <div className={styles.boardContainer}>
          <p>[Chessboard view at move 6 — white to move]</p>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <div className={styles.viewButtons}>
          <button className={styles.actionBtn}>View My Move</button>
          <button className={styles.actionBtn}>View My Prep</button>
        </div>

        <div className={styles.mainActions}>
          <button className={styles.primaryAction}>▶️ Replay My Prep Line</button>
          <button className={styles.secondaryAction}>✅ Mark as Reviewed</button>
        </div>

        <div className={styles.moreOptions}>
          <details>
            <summary>More Options</summary>
            <ul>
              <li>
                <button>I meant to play h3 (Adopt it)</button>
              </li>
              <li>
                <button>Ignore this chapter in the future</button>
              </li>
              <li>
                <a href="#" target="_blank">
                  View full study on Lichess →
                </a>
              </li>
            </ul>
          </details>
        </div>
      </div>

      {hasDeviation && (
        <div className={styles.patternNotice}>
          <div className={styles.noticeCard}>
            🔄 You've deviated from this line 3 times recently. Want to revisit it again next week?
            <button className={styles.remindBtn}>Remind Me</button>
          </div>
        </div>
      )}

      <div className={styles.deviationMeta}>
        <p>
          {hasDeviation ? 'Deviation' : 'Game'} ID: {id}
        </p>
      </div>
    </div>
  );
};

export default DeviationDetail;
