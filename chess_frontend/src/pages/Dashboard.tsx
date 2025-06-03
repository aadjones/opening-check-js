import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';
import { useDeviations } from '../hooks/useDeviations';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  usePageTitle('Dashboard');
  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    deviations, 
    loading: deviationsLoading, 
    error: deviationsError,
    hasMore,
    loadMore,
    refetch 
  } = useDeviations({ limit: 5 });

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
        <div className={styles.errorText}>
          {deviationsError.message || 'Failed to load deviations'}
        </div>
        <button 
          className={styles.retryButton}
          onClick={() => refetch()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Transform deviations into activity items
  const recentActivity = deviations.map(deviation => ({
    id: deviation.id,
    type: 'deviation',
    title: `Deviation in ${deviation.opening_name || 'Unknown Opening'}`,
    description: `Move ${deviation.move_number}: played ${deviation.played_move} instead of ${deviation.expected_move}`,
    time: new Date(deviation.created_at).toLocaleString(),
    opponent: deviation.opponent || 'Unknown',
    gameUrl: deviation.game_url,
  }));

  const recentGames = [
    {
      id: 1,
      opponent: 'ChessMaster2000',
      rating: 1650,
      timeControl: 'Blitz 5+3',
      result: 'Loss',
      status: 'deviation',
      time: '2 hours ago',
    },
    {
      id: 2,
      opponent: 'BlitzKing99',
      rating: 1580,
      timeControl: 'Blitz 3+2',
      result: 'Win',
      status: 'clean',
      time: '1 day ago',
    },
    {
      id: 3,
      opponent: 'PawnStorm',
      rating: 1720,
      timeControl: 'Rapid 10+0',
      result: 'Draw',
      status: 'clean',
      time: '2 days ago',
    },
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          {user ? `Welcome back, ${user.name}!` : 'Welcome back!'} Here's your recent chess activity.
        </p>

        {/* Auth Status Display - you can see the AuthContext working! */}
        <div
          style={{
            background: '#f0f0f0',
            padding: '10px',
            borderRadius: '5px',
            margin: '10px 0',
            fontSize: '14px',
          }}
        >
          <strong>🔐 Auth Status:</strong>
          <br />
          Loading: {authLoading ? 'Yes' : 'No'}
          <br />
          User: {user ? `Logged in as ${user.name} (Lichess)` : 'Not logged in'}
          <br />
          {user && (
            <button
              onClick={signOut}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <div className={styles.grid}>
        <section className={`${styles.section} ${styles.recentActivity}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            {hasMore && (
              <button 
                className={styles.loadMoreButton}
                onClick={() => loadMore()}
              >
                Load More
              </button>
            )}
          </div>
          <div className={styles.sectionContent}>
            {recentActivity.length > 0 ? (
              <ul className={styles.activityList}>
                {recentActivity.map(activity => (
                  <li key={activity.id} className={styles.activityItem}>
                    <div className={`${styles.activityIcon} ${styles[activity.type]}`}>
                      {activity.type === 'deviation' ? '❌' : '✅'}
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityTitle}>{activity.title}</div>
                      <div className={styles.activityMeta}>
                        vs {activity.opponent} • {activity.time}
                      </div>
                      <a 
                        href={activity.gameUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.gameLink}
                      >
                        View Game on Lichess →
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🎯</div>
                <div className={styles.emptyStateText}>No recent activity</div>
                <div className={styles.emptyStateSubtext}>
                  Play some games on Lichess to see your prep tracking here!
                </div>
              </div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Games</h2>
          </div>
          <div className={styles.sectionContent}>
            {recentGames.length > 0 ? (
              <ul className={styles.gamesList}>
                {recentGames.map(game => (
                  <li key={game.id} className={styles.gameItem}>
                    <div className={styles.gameInfo}>
                      <div className={styles.gameOpponent}>
                        {game.opponent} ({game.rating})
                      </div>
                      <div className={styles.gameMeta}>
                        {game.timeControl} • {game.time}
                      </div>
                    </div>
                    <div className={`${styles.gameStatus} ${styles[game.status]}`}>
                      {game.status === 'clean' ? '✅' : '❌'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>♟️</div>
                <div className={styles.emptyStateText}>No games yet</div>
                <div className={styles.emptyStateSubtext}>
                  Your recent games will appear here once you start playing.
                </div>
              </div>
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
