import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export interface GamesListProps {
  games: GameListItem[];
  isLoading?: boolean;
  onGameClick?: (gameId: string) => void;
}

function formatTimeControl(tc: string) {
  if (tc === '1+0' || tc === '60') return 'Bullet';
  if (tc === '3+0' || tc === '180') return 'Blitz';
  if (tc === '10+0' || tc === '600') return 'Rapid';
  if (tc === '30+0' || tc === '1800') return 'Classical';
  return tc;
}

function formatResult(result: string, hasDeviation: boolean) {
  if (hasDeviation) return '❌ Deviation';
  if (result === '1-0') return '✅ White won';
  if (result === '0-1') return '✅ Black won';
  if (result === '1/2-1/2') return '½-½ Draw';
  return result;
}

const GamesList: React.FC<GamesListProps> = ({ games, isLoading, onGameClick }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={styles.gamesList} data-testid="games-list">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={styles.gameCardSkeleton} data-testid="game-card-skeleton" />
        ))}
      </div>
    );
  }

  if (!games.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>🎮</div>
        <div className={styles.emptyStateTitle}>No recent games found</div>
        <div className={styles.emptyStateText}>
          Play some games on Lichess and they'll appear here for analysis!
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
          role="button"
          tabIndex={0}
          aria-label={`Game vs ${game.opponent} - ${formatTimeControl(game.timeControl)} - ${formatResult(game.gameResult, game.hasDeviation)}`}
          data-testid="game-card"
          onClick={e => {
            if (game.hasDeviation && game.deviation) {
              e.preventDefault();
              navigate(`/deviation/${game.deviation.id}`);
            } else {
              onGameClick?.(game.gameId);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (game.hasDeviation && game.deviation) {
                navigate(`/deviation/${game.deviation.id}`);
              } else {
                onGameClick?.(game.gameId);
              }
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