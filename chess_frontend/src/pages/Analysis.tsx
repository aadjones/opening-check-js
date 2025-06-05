import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './Analysis.module.css';
import { useAuth } from '../hooks/useAuth';
import { fetchSupabaseJWT } from '../lib/auth/fetchSupabaseJWT';

interface GameResult {
  id: string;
  opponent: string;
  timeControl: string;
  result: 'win' | 'loss' | 'draw';
  hasDeviation: boolean;
  deviationMove?: number;
  timeAgo: string;
  color: 'white' | 'black';
}

const Analysis: React.FC = () => {
  usePageTitle('Live Analysis');
  const { session } = useAuth();
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(true);
  const [analyzingRecent, setAnalyzingRecent] = useState(false);
  const [analyzingToday, setAnalyzingToday] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2 minutes ago');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisSuccess, setAnalysisSuccess] = useState<string | null>(null);
  // Cache the JWT in memory for 1 hour
  const jwtCache = React.useRef<{ token: string, exp: number } | null>(null);

  // Mock data - in real app this would come from API
  const recentGames: GameResult[] = [
    {
      id: '1',
      opponent: 'ChessMaster99',
      timeControl: 'Blitz 5+3',
      result: 'win',
      hasDeviation: false,
      timeAgo: '5 minutes ago',
      color: 'white',
    },
    {
      id: '2',
      opponent: 'TacticalTiger',
      timeControl: 'Rapid 10+0',
      result: 'loss',
      hasDeviation: true,
      deviationMove: 8,
      timeAgo: '1 hour ago',
      color: 'black',
    },
    {
      id: '3',
      opponent: 'PawnStorm',
      timeControl: 'Blitz 3+2',
      result: 'draw',
      hasDeviation: false,
      timeAgo: '3 hours ago',
      color: 'white',
    },
    {
      id: '4',
      opponent: 'EndgameExpert',
      timeControl: 'Classical 15+10',
      result: 'win',
      hasDeviation: true,
      deviationMove: 12,
      timeAgo: '1 day ago',
      color: 'black',
    },
  ];

  const getSupabaseJWT = async () => {
    if (
      jwtCache.current &&
      jwtCache.current.exp > Math.floor(Date.now() / 1000) + 60 // 1 min leeway
    ) {
      return jwtCache.current.token;
    }
    if (!session?.user?.id) throw new Error('Not logged in');
    const token = await fetchSupabaseJWT({
      sub: session.user.id,
      email: session.user.email || undefined,
      lichess_username: session.user.lichessUsername || undefined,
    });
    // Decode exp from JWT (payload is the 2nd part, base64url encoded)
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    jwtCache.current = { token, exp: payload.exp };
    return token;
  };

  const handleManualAnalysis = async (scope: string) => {
    setAnalysisError(null);
    setAnalysisSuccess(null);
    if (!session?.user?.id) {
      setAnalysisError('You must be logged in to analyze games.');
      return;
    }
    if (scope === 'recent') {
      setAnalyzingRecent(true);
      try {
        const supabaseJwt = await getSupabaseJWT();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-games`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${supabaseJwt}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');
        setAnalysisSuccess('Analysis completed!');
        setLastSyncTime('just now');
      } catch (err: unknown) {
        let message = 'Analysis failed';
        if (err instanceof Error) message = err.message;
        else if (typeof err === 'string') message = err;
        setAnalysisError(message);
      } finally {
        setAnalyzingRecent(false);
      }
    } else if (scope === 'today') {
      setAnalyzingToday(true);
      // TODO: Implement analysis for today's games if supported by backend
      setTimeout(() => {
        setAnalyzingToday(false);
      }, 2000);
    }
  };

  const toggleAutoAnalysis = () => {
    setAutoAnalysisEnabled(!autoAnalysisEnabled);
  };

  return (
    <div className={styles.analysis}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎯 Live Analysis</h1>
        <p className={styles.subtitle}>Monitor your games for opening deviations in real-time</p>
      </header>

      {/* Auto-Analysis Controls */}
      <section className={styles.controlsSection}>
        <h2 className={styles.controlsTitle}>Analysis Controls</h2>

        <div className={styles.autoAnalysisToggle}>
          <label className={styles.toggleContainer}>
            <input
              type="checkbox"
              checked={autoAnalysisEnabled}
              onChange={toggleAutoAnalysis}
              className={styles.toggleInput}
            />
            <div className={`${styles.toggleSwitch} ${autoAnalysisEnabled ? styles.active : ''}`}>
              <div className={styles.toggleSlider}></div>
            </div>
          </label>

          <div className={styles.toggleLabel}>
            <div className={styles.toggleTitle}>Auto-Analysis</div>
            <div className={styles.toggleDescription}>
              {autoAnalysisEnabled
                ? `Automatically checking every 30 minutes • Last sync: ${lastSyncTime}`
                : 'Enable to automatically monitor your games for deviations'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          {analysisError && <div style={{ color: 'red' }}>{analysisError}</div>}
          {analysisSuccess && <div style={{ color: 'green' }}>{analysisSuccess}</div>}
        </div>

        <div className={styles.manualControls}>
          <button
            className={styles.manualButton}
            onClick={() => handleManualAnalysis('recent')}
            disabled={analyzingRecent || analyzingToday}
          >
            <div className={styles.manualButtonIcon}>{analyzingRecent ? '⏳' : '⚡'}</div>
            <div className={styles.manualButtonText}>{analyzingRecent ? 'Analyzing...' : 'Analyze Last 10 Games'}</div>
          </button>

          <button
            className={styles.manualButton}
            onClick={() => handleManualAnalysis('today')}
            disabled={analyzingRecent || analyzingToday}
          >
            <div className={styles.manualButtonIcon}>{analyzingToday ? '⏳' : '📅'}</div>
            <div className={styles.manualButtonText}>{analyzingToday ? 'Analyzing...' : "Analyze Today's Games"}</div>
          </button>

          <div className={styles.manualButton}>
            <div className={styles.manualButtonIcon}>🔍</div>
            <div className={styles.manualButtonText}>
              <input
                type="text"
                placeholder="Game ID"
                className="form-input"
                style={{ marginBottom: '8px', fontSize: '14px' }}
                disabled={analyzingRecent || analyzingToday}
              />
              <button className="btn btn-sm btn-primary" disabled={analyzingRecent || analyzingToday}>
                Analyze
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Games */}
      <section className={styles.gamesSection}>
        <div className={styles.gamesSectionHeader}>
          <h2 className={styles.gamesSectionTitle}>Recent Activity</h2>
        </div>

        <div className={styles.gamesList}>
          {recentGames.length > 0 ? (
            recentGames.map(game => (
              <Link key={game.id} to={`/deviation/${game.id}`} className={styles.gameCard}>
                <div className={`${styles.gameStatus} ${styles[game.hasDeviation ? 'deviation' : 'clean']}`}>
                  {game.hasDeviation ? '❌' : '✅'}
                </div>

                <div className={styles.gameInfo}>
                  <div className={styles.gameOpponent}>vs. {game.opponent}</div>
                  <div className={styles.gameMeta}>
                    <span>{game.timeControl}</span>
                    <span>Playing {game.color}</span>
                    <span>{game.timeAgo}</span>
                    {game.hasDeviation && <span>Deviation on move {game.deviationMove}</span>}
                  </div>
                </div>

                <div className={`${styles.gameResult} ${styles[game.result]}`}>
                  {game.result === 'win' ? '1-0' : game.result === 'loss' ? '0-1' : '½-½'}
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🎮</div>
              <div className={styles.emptyStateTitle}>No recent games found</div>
              <div className={styles.emptyStateText}>
                Play some games on Lichess and they'll appear here for analysis!
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Analysis;
