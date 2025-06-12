import React from 'react';
import styles from './PrepScoreWidget.module.css';
import type { Database } from '../../types/supabase';

type Deviation = Database['public']['Tables']['opening_deviations']['Row'];

interface PrepScoreWidgetProps {
  deviations: Deviation[];
  isLoading: boolean;
}

const PrepScoreWidget: React.FC<PrepScoreWidgetProps> = ({ deviations, isLoading }) => {
  const scores = React.useMemo(() => {
    if (isLoading || !deviations) {
      return { followed: 0, deviated: 0 };
    }
    return deviations.reduce(
      (acc, deviation) => {
        if (deviation.first_deviator === 'user') {
          acc.deviated += 1;
        } else if (deviation.first_deviator === 'opponent') {
          acc.followed += 1;
        }
        return acc;
      },
      { followed: 0, deviated: 0 }
    );
  }, [deviations, isLoading]);

  if (isLoading) {
    return <div className={`${styles.card} ${styles.skeleton}`}></div>;
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Prep Score</h3>
      <div className={styles.scores}>
        <div className={styles.scoreItem}>
          <div className={`${styles.icon} ${styles.followed}`}>✅</div>
          <div className={styles.count}>{scores.followed}</div>
          <div className={styles.label}>Followed</div>
        </div>
        <div className={styles.scoreItem}>
          <div className={`${styles.icon} ${styles.deviated}`}>❌</div>
          <div className={styles.count}>{scores.deviated}</div>
          <div className={styles.label}>Deviated</div>
        </div>
      </div>
      <p className={styles.footerText}>Based on the last {deviations.length} games with deviations.</p>
    </div>
  );
};

export default PrepScoreWidget;
