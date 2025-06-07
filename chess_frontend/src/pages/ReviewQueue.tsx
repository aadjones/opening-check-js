import React from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from './ReviewQueue.module.css';
import { FaTimesCircle, FaCheck, FaRegCheckCircle, FaBan, FaEye } from 'react-icons/fa';

// Mock data for development
const mockDeviations = [
  {
    id: '1',
    opening: "King's Indian",
    moveNumber: 8,
    playedMove: 'a6',
    expectedMove: 'Be2',
    opponent: 'Forknado',
    timeControl: 'Rapid 10+0',
    playedAt: '2 days ago',
    status: 'needs_review',
    color: 'black',
  },
  {
    id: '2',
    opening: 'Najdorf',
    moveNumber: 6,
    playedMove: 'h3',
    expectedMove: 'Be2',
    opponent: 'BigBlunder420',
    timeControl: 'Blitz 5+3',
    playedAt: '4 days ago',
    status: 'needs_review',
    color: 'white',
  },
];

function getMoveNotation(moveNumber: number, color: string, move: string) {
  if (color.toLowerCase() === 'white') {
    return `${moveNumber}.${move}`;
  } else {
    return `${moveNumber}...${move}`;
  }
}

const ReviewQueue: React.FC = () => {
  usePageTitle('Review Queue');

  return (
    <div className={styles.reviewQueue}>
      <div className={styles.header}>
        <h1>Review Queue</h1>
        <p className={styles.subtitle}>Review and resolve your deviations</p>
      </div>

      <div className={styles.queueList}>
        {mockDeviations.map(deviation => (
          <div key={deviation.id} className={styles.deviationCard}>
            <div className={styles.deviationHeader}>
              <span className={styles.statusBadge}><FaTimesCircle style={{ marginRight: 6, color: '#dc2626' }} /> Needs Review</span>
              <span className={styles.openingName}>{deviation.opening}</span>
            </div>

            <div className={styles.deviationContent}>
              <div className={styles.moveInfo}>
                <div className={styles.moveComparison}>
                  <div className={styles.moveCard}>
                    <div className={styles.moveLabel}>You played</div>
                    <div className={styles.moveValue}>{getMoveNotation(deviation.moveNumber, deviation.color, deviation.playedMove)}</div>
                  </div>
                  <div className={styles.moveCard}>
                    <div className={styles.moveLabel}>Expected</div>
                    <div className={styles.moveValue}>{deviation.expectedMove}</div>
                  </div>
                </div>
              </div>

              <div className={styles.gameInfo}>
                <div>vs {deviation.opponent}</div>
                <div>{deviation.timeControl}</div>
                <div>{deviation.playedAt}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.actionButton}><FaEye style={{ marginRight: 4 }} /> View</button>
              <button className={styles.actionButton}><FaCheck style={{ marginRight: 4 }} /> Mark Reviewed</button>
              <button className={styles.actionButton}><FaRegCheckCircle style={{ marginRight: 4 }} /> Adopt Move</button>
              <button className={styles.actionButton}><FaBan style={{ marginRight: 4 }} /> Ignore</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewQueue; 