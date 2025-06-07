import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaMinusCircle } from 'react-icons/fa';
import styles from './PrepScoreWidget.module.css';

// Mock data for weekly prep score
const mockPrepScore = {
  held: 2, // ✅
  deviated: 3, // ❌
  untracked: 1, // ➖
};

const PrepScoreWidget: React.FC = () => {
  return (
    <div className={styles.prepScoreWidget}>
      <h3 className={styles.title}>Weekly Prep Score</h3>
      <div className={styles.scoresRow}>
        <div className={styles.scoreItem}>
          <FaCheckCircle className={styles.heldIcon} />
          <span className={styles.scoreCount}>{mockPrepScore.held}</span>
          <span className={styles.scoreLabel}>Followed</span>
        </div>
        <div className={styles.scoreItem}>
          <FaTimesCircle className={styles.deviatedIcon} />
          <span className={styles.scoreCount}>{mockPrepScore.deviated}</span>
          <span className={styles.scoreLabel}>Deviated</span>
        </div>
        <div className={styles.scoreItem}>
          <FaMinusCircle className={styles.untrackedIcon} />
          <span className={styles.scoreCount}>{mockPrepScore.untracked}</span>
          <span className={styles.scoreLabel}>Untracked</span>
        </div>
      </div>
    </div>
  );
};

export default PrepScoreWidget;
