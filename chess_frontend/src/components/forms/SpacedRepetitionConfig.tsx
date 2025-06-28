import React, { useState } from 'react';
import { useSpacedRepetition } from '../../hooks';
import styles from './SpacedRepetitionConfig.module.css';

const SpacedRepetitionConfig: React.FC = () => {
  const { config, stats, updateConfig, loading, error } = useSpacedRepetition();
  const [saving, setSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  // Update local config when remote config changes
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    if (!localConfig) return;

    setSaving(true);
    try {
      await updateConfig(localConfig);
    } catch (err) {
      console.error('Failed to save configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading spaced repetition settings...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error loading settings: {error.message}</div>;
  }

  if (!localConfig) {
    return <div className={styles.error}>No configuration available</div>;
  }

  return (
    <div className={styles.container}>
      <h3>Spaced Repetition Settings</h3>
      
      {/* Algorithm Selection */}
      <div className={styles.field}>
        <label htmlFor="algorithm">Algorithm:</label>
        <select
          id="algorithm"
          value={localConfig.algorithmType}
          onChange={(e) => setLocalConfig({
            ...localConfig,
            algorithmType: e.target.value as 'basic' | 'sm2plus' | 'fsrs'
          })}
        >
          <option value="basic">Basic (Simple intervals)</option>
          <option value="sm2plus">SM2+ (Recommended)</option>
          <option value="fsrs">FSRS (Advanced)</option>
        </select>
        <p className={styles.description}>
          SM2+ provides better learning efficiency than Basic, adapting intervals based on your performance.
        </p>
      </div>

      {/* Daily Review Limit */}
      <div className={styles.field}>
        <label htmlFor="dailyReviews">Max daily reviews:</label>
        <input
          id="dailyReviews"
          type="number"
          min="5"
          max="100"
          value={localConfig.maxDailyReviews}
          onChange={(e) => setLocalConfig({
            ...localConfig,
            maxDailyReviews: parseInt(e.target.value)
          })}
        />
        <p className={styles.description}>
          Maximum number of puzzles to review per day.
        </p>
      </div>

      {/* Target Retention Rate */}
      <div className={styles.field}>
        <label htmlFor="retention">Target retention rate:</label>
        <input
          id="retention"
          type="range"
          min="0.7"
          max="0.99"
          step="0.05"
          value={localConfig.targetRetentionRate}
          onChange={(e) => setLocalConfig({
            ...localConfig,
            targetRetentionRate: parseFloat(e.target.value)
          })}
        />
        <span className={styles.rangeValue}>
          {Math.round(localConfig.targetRetentionRate * 100)}%
        </span>
        <p className={styles.description}>
          Higher values mean more frequent reviews but better retention.
        </p>
      </div>

      {/* Advanced Settings (only for SM2+) */}
      {localConfig.algorithmType === 'sm2plus' && (
        <details className={styles.advanced}>
          <summary>Advanced Settings</summary>
          
          <div className={styles.field}>
            <label htmlFor="easeFactor">Initial ease factor:</label>
            <input
              id="easeFactor"
              type="range"
              min="1.3"
              max="2.5"
              step="0.1"
              value={localConfig.initialEaseFactor}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                initialEaseFactor: parseFloat(e.target.value)
              })}
            />
            <span className={styles.rangeValue}>
              {localConfig.initialEaseFactor.toFixed(1)}
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="minInterval">Minimum interval (hours):</label>
            <input
              id="minInterval"
              type="number"
              min="0.25"
              max="24"
              step="0.25"
              value={localConfig.minimumIntervalHours}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                minimumIntervalHours: parseFloat(e.target.value)
              })}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="maxInterval">Maximum interval (days):</label>
            <input
              id="maxInterval"
              type="number"
              min="30"
              max="730"
              value={localConfig.maximumIntervalDays}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                maximumIntervalDays: parseInt(e.target.value)
              })}
            />
          </div>
        </details>
      )}

      {/* Statistics */}
      {stats && (
        <div className={styles.stats}>
          <h4>Your Statistics (Last 30 Days)</h4>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{stats.totalAttempts}</span>
              <span className={styles.statLabel}>Total Attempts</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {Math.round(stats.accuracyRate * 100)}%
              </span>
              <span className={styles.statLabel}>Accuracy</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {stats.averageAttempts.toFixed(1)}
              </span>
              <span className={styles.statLabel}>Avg Attempts</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{stats.reviewsToday}</span>
              <span className={styles.statLabel}>Today's Reviews</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SpacedRepetitionConfig;