import React from 'react';
import styles from './DeviationCard.module.css';

export interface DeviationCardProps {
  type: 'deviation' | 'success';
  title: string;
  description?: string;
  time: string;
  opponent: string;
  gameUrl: string;
}

const DeviationCard: React.FC<DeviationCardProps> = ({ type, title, description, time, opponent, gameUrl }) => {
  return (
    <li className={styles.card}>
      <div className={`${styles.icon} ${styles[type]}`}>{type === 'deviation' ? '❌' : '✅'}</div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.description}>{description}</div>}
        <div className={styles.meta}>
          vs {opponent} • {time}
        </div>
        <a href={gameUrl} target="_blank" rel="noopener noreferrer" className={`${styles.link} dev`}>
          View Game on Lichess →
        </a>
      </div>
    </li>
  );
};

export default DeviationCard;
