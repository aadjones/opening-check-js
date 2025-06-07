import React from 'react';
import { FaLightbulb, FaBullseye, FaPlusCircle, FaRegCheckCircle, FaBan } from 'react-icons/fa';
import styles from './InsightsBlock.module.css';

// Mock data for insights
const mockInsights = [
  {
    id: '1',
    message: "You've deviated from 6.Be2 in the Najdorf 3 times this week.",
    actions: [
      { label: 'Drill This Line', icon: <FaBullseye />, onClick: () => {} },
      { label: 'Adopt h3 Instead', icon: <FaRegCheckCircle />, onClick: () => {} },
    ],
  },
  {
    id: '2',
    message: '20% of your White opponents played 3.Nf3 in the English Opening (not in your study).',
    actions: [
      { label: 'Add Variation', icon: <FaPlusCircle />, onClick: () => {} },
      { label: 'Ignore', icon: <FaBan />, onClick: () => {} },
    ],
  },
];

const InsightsBlock: React.FC = () => {
  return (
    <div className={styles.insightsBlock}>
      <div className={styles.header}>
        <FaLightbulb className={styles.icon} />
        <span className={styles.title}>Insights</span>
      </div>
      <div className={styles.insightsList}>
        {mockInsights.map(insight => (
          <div key={insight.id} className={styles.insightCard}>
            <div className={styles.message}>{insight.message}</div>
            <div className={styles.actions}>
              {insight.actions.map((action, idx) => (
                <button key={idx} className={styles.actionButton} onClick={action.onClick}>
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsBlock;
