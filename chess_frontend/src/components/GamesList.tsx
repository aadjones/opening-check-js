import React from 'react';
import { Link } from 'react-router-dom';
import styles from './GamesList.module.css';
import type { ApiDeviationResult } from '../types';

export interface GameListItem {
  id: string;
  gameId: string;
  gameUrl: string;
  opponent: string;
  timeControl: string;
  gameResult: string;
  playedAt: string;
  hasDeviation: boolean;
  deviation?: ApiDeviationResult;
}

interface GamesListProps {
  games: GameListItem[];
  isLoading?: boolean;
  onGameClick?: (gameId: string) => void;
}

const formatTimeControl = (timeControl: string): string => {
  const minutes = parseInt(timeControl) / 60;
  if (minutes < 3) return 'Bullet';
  if (minutes < 10) return 'Blitz';
  if (minutes < 30) return 'Rapid';
  return 'Classical';
};

const formatResult = (result: string, hasDeviation: boolean): string => {
  if (hasDeviation) return '❌ Deviation';
  switch (result) {
    case '1-0':
      return '✅ White won';
    case '0-1':
      return '✅ Black won';
    case '1/2-1/2':
      return '🤝 Draw';
    default:
      return result;
  }
};

const GamesList: React.FC<GamesListProps> = ({ games, isLoading = false, onGameClick }) => {
  if (isLoading) {
    return (
      <div className={styles.gamesList} data-testid="games-list-loading">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.gameCardSkeleton} data-testid="game-card-skeleton">
            <div className={styles.skeletonHeader} />
            <div className={styles.skeletonContent} />
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className={styles.gamesList} data-testid="games-list-empty">
        <div className={styles.emptyState}>
          <p>No games found</p>
          <p className={styles.emptyStateSubtext}>Play some games on Lichess to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gamesList} data-testid="games-list">
      {games.map(game => (
        <div
          key={game.id}
          className={`${styles.gameCard} ${game.hasDeviation ? styles.hasDeviation : ''}`}
          onClick={() => onGameClick?.(game.gameId)}
          role="button"
          tabIndex={0}
          aria-label={`Game vs ${game.opponent} - ${formatTimeControl(game.timeControl)} - ${formatResult(game.gameResult, game.hasDeviation)}`}
          data-testid="game-card"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onGameClick?.(game.gameId);
            }
          }}
        >
          <div className={styles.gameHeader}>
            <span className={styles.timeControl}>{formatTimeControl(game.timeControl)}</span>
            <span className={styles.gameResult}>{formatResult(game.gameResult, game.hasDeviation)}</span>
          </div>
          
          <div className={styles.gameContent}>
            <div className={styles.opponent}>
              vs {game.opponent}
            </div>
            <div className={styles.gameMeta}>
              <time dateTime={game.playedAt}>{new Date(game.playedAt).toLocaleDateString()}</time>
            </div>
          </div>

          <div className={styles.gameActions}>
            <a
              href={game.gameUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.lichessLink}
              onClick={e => e.stopPropagation()}
            >
              View on Lichess →
            </a>
            {game.hasDeviation && (
              <Link
                to={`/deviation/${game.deviation?.id}`}
                className={styles.deviationLink}
                onClick={e => e.stopPropagation()}
              >
                Review Deviation →
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GamesList; 