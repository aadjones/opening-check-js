import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
import { useDeviations } from '../hooks/useDeviations';
import styles from './Dashboard.module.css';
import GamesList, { type GameListItem } from '../components/GamesList';
import { parsePgnHeaders } from '../utils/pgn';
import PrepScoreWidget from '../components/dashboard/PrepScoreWidget';
import LastGameSummaryWidget from '../components/dashboard/LastGameSummaryWidget';
import InsightsBlock from '../components/dashboard/InsightsBlock';

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const { deviations, loading: deviationsLoading } = useDeviations({ limit: 8 });

  // Transform deviations into game list items
  const recentGames: GameListItem[] = deviations.map(deviation => {
    const headers = parsePgnHeaders(deviation.pgn || '');
    const userColor = deviation.color;
    const whitePlayer = headers.White || 'White';
    const blackPlayer = headers.Black || 'Black';
    const opponent =
      userColor && typeof userColor === 'string' && userColor.toLowerCase() === 'white' ? blackPlayer : whitePlayer;
    const timeControl = headers.TimeControl || '600';
    const gameResult = headers.Result || '1/2-1/2';
    const playedAt = deviation.detected_at ?? '';
    const gameUrl = deviation.game_id ? `https://lichess.org/${deviation.game_id}` : '';

    return {
      id: deviation.id ?? '',
      gameId: deviation.game_id ?? '',
      gameUrl,
      opponent: opponent ?? '',
      timeControl: timeControl ?? '',
      gameResult: gameResult ?? '',
      playedAt: playedAt ?? '',
      hasDeviation: true,
      deviation,
    };
  });

  const username = user?.lichessUsername || user?.name || 'there';

  return (
    <div className={styles.dashboardOuter}>
      <div className={styles.dashboardInner}>
        <div className={styles.greetingBlock}>
          <h1 className={styles.greetingTitle}>
            Welcome back, {username}! <span className={styles.wave}>👋</span>
          </h1>
          <div className={styles.greetingSubtitle}>Here's your chess progress this week.</div>
        </div>
        <div className={styles.topRow}>
          <PrepScoreWidget />
          <LastGameSummaryWidget />
        </div>
        <InsightsBlock />
        <section className={styles.recentGamesSection}>
          <h2 className={styles.sectionTitle}>Recent Games</h2>
          <GamesList games={recentGames} isLoading={deviationsLoading} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
