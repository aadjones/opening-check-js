import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
import { useDeviations } from '../hooks/useDeviations';
import styles from './Dashboard.module.css';
import GamesList, { type GameListItem } from '../components/GamesList';

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    deviations,
    loading: deviationsLoading,
    error: deviationsError,
    hasMore,
    loadMore,
    refetch,
  } = useDeviations({ limit: 5 });

  // Transform deviations into game list items
  const recentGames: GameListItem[] = deviations.map(deviation => ({
    id: deviation.id,
    gameId: deviation.game_id,
    gameUrl: deviation.game_url,
    opponent: deviation.opponent || 'Unknown',
    timeControl: deviation.time_control || '600', // Default to 10+0 if not specified
    gameResult: deviation.game_result || '1/2-1/2',
    playedAt: deviation.created_at,
    hasDeviation: true,
    deviation,
  }));

  // Show loading state while auth or data is loading
  if (authLoading || deviationsLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}>⌛</div>
        <div className={styles.loadingText}>Loading your dashboard...</div>
      </div>
    );
  }

  // Show error state if there's an error
  if (deviationsError) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorText}>{deviationsError.message || 'Failed to load deviations'}</div>
        <button className={styles.retryButton} onClick={() => refetch()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          {user ? `Welcome back, ${user.name}!` : 'Welcome back!'} Here's your recent chess activity.
        </p>

        {/* Auth Status Display */}
        <div className={styles.authStatus}>
          <strong>🔐 Auth Status:</strong>
          <br />
          Loading: {authLoading ? 'Yes' : 'No'}
          <br />
          User: {user ? `Logged in as ${user.name} (Lichess)` : 'Not logged in'}
          <br />
          {user && (
            <button onClick={signOut} className={styles.signOutButton}>
              Sign Out
            </button>
          )}
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Games</h2>
          </div>
          <div className={styles.sectionContent}>
            <GamesList
              games={recentGames}
              isLoading={deviationsLoading}
              onGameClick={gameId => {
                // Navigate to game details or open in new tab
                window.open(`https://lichess.org/${gameId}`, '_blank');
              }}
            />
            {hasMore && (
              <button className={styles.loadMoreButton} onClick={() => loadMore()}>
                Load More
              </button>
            )}
          </div>
        </section>
      </div>

      <section className={styles.filters}>
        <h3 className={styles.filtersTitle}>Quick Filters</h3>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Time Control</label>
          <select className={styles.filterSelect}>
            <option value="all">All Games</option>
            <option value="bullet">Bullet</option>
            <option value="blitz">Blitz</option>
            <option value="rapid">Rapid</option>
            <option value="classical">Classical</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date Range</label>
          <select className={styles.filterSelect}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
