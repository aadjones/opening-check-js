import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
import { useDeviations } from '../hooks/useDeviations';
import { useStudyUpdate } from '../contexts/useStudyUpdate';
import styles from './Dashboard.module.css';
import GamesList, { type GameListItem } from '../components/GamesList';
import { parsePgnHeaders } from '../utils/pgn';
import PrepScoreWidget from '../components/dashboard/PrepScoreWidget';
import LastGameSummaryWidget from '../components/dashboard/LastGameSummaryWidget';
import InsightsBlock from '../components/dashboard/InsightsBlock';

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const lastStudyUpdate = useStudyUpdate();
  // Fetch a decent number of deviations for the weekly score.
  const { deviations, loading: deviationsLoading } = useDeviations({ limit: 10 }, lastStudyUpdate);

  // Find the most recent deviation for the "Last Game" card.
  const lastDeviation = deviations.length > 0 ? deviations[0] : null;

  // --- NEW, TARGETED LOG ---
  // This will run whenever lastDeviation changes from null to a real object.
  React.useEffect(() => {
    if (lastDeviation) {
      console.log('--- Last Game Summary Data ---');
      console.log('lastDeviation object:', lastDeviation);

      // Now, let's parse it right here and see the result.
      const headers = parsePgnHeaders(lastDeviation.pgn || '');
      console.log('Parsed headers from its PGN:', headers);
      console.log('Value of Opening header:', headers.Opening);
    }
  }, [lastDeviation]);
  // --- END OF LOG ---

  // Transform deviations for the "Recent Games" list (this logic is already fixed)
  const recentGames: GameListItem[] = deviations.map(deviation => {
    const headers = parsePgnHeaders(deviation.pgn || '');
    const whitePlayer = headers.White || 'White';
    const blackPlayer = headers.Black || 'Black';
    let userActualColor: 'white' | 'black' | null = null;
    if (user?.lichessUsername?.toLowerCase() === whitePlayer.toLowerCase()) {
      userActualColor = 'white';
    } else if (user?.lichessUsername?.toLowerCase() === blackPlayer.toLowerCase()) {
      userActualColor = 'black';
    }
    const opponent = userActualColor === 'white' ? blackPlayer : whitePlayer;
    const timeControl = headers.TimeControl || '600';
    const gameResult = headers.Result || '1/2-1/2';
    const playedAt = deviation.detected_at ?? '';
    const gameUrl = deviation.game_id ? `https://lichess.org/${deviation.game_id}` : '';

    return {
      id: deviation.id ?? '',
      gameId: deviation.game_id ?? '',
      gameUrl,
      opponent: opponent ?? 'Unknown Opponent',
      timeControl: timeControl ?? '',
      gameResult: gameResult ?? '',
      playedAt: playedAt ?? '',
      hasDeviation: true,
      deviation,
      firstDeviator: deviation.first_deviator as 'user' | 'opponent' | undefined,
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
          <div className={styles.greetingSubtitle}>Here's your recent chess progress.</div>
        </div>
        <div className={styles.topRow}>
          {/* Pass the full list to the Prep Score and the single last one to the summary */}
          <PrepScoreWidget deviations={deviations} isLoading={deviationsLoading} />
          <LastGameSummaryWidget lastDeviation={recentGames[0]?.deviation ?? null} isLoading={deviationsLoading} />
        </div>
        <InsightsBlock />
        <section className={styles.recentGamesSection}>
          <h2 className={styles.sectionTitle}>Recent Games</h2>
          {/* Show all games in the list, including the most recent */}
          <GamesList games={recentGames} isLoading={deviationsLoading} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
