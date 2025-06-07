import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaMinusCircle, FaPlay } from 'react-icons/fa';
import styles from './LastGameSummaryWidget.module.css';

// Mock data for the most recent game
const mockLastGame = {
  status: 'deviation', // 'followed', 'deviation', or 'untracked'
  opening: 'Najdorf',
  moveNumber: 6,
  deviationMove: 'h3',
  expectedMove: 'Be2',
  opponent: 'BigBlunder420',
  timeControl: 'Blitz 5+3',
  result: 'loss', // 'win', 'loss', 'draw'
  reviewed: false,
};

function getStatusBadge(status: string) {
  if (status === 'followed') {
    return <span className={styles.statusBadgeFollowed}><FaCheckCircle /> Followed</span>;
  } else if (status === 'deviation') {
    return <span className={styles.statusBadgeDeviation}><FaTimesCircle /> Deviation</span>;
  } else {
    return <span className={styles.statusBadgeUntracked}><FaMinusCircle /> Untracked</span>;
  }
}

function getResultText(result: string) {
  if (result === 'win') return '1-0';
  if (result === 'loss') return '0-1';
  return '½-½';
}

const LastGameSummaryWidget: React.FC = () => {
  return (
    <div className={styles.lastGameSummaryWidget}>
      <div className={styles.widgetTitle}>Last Game</div>
      <div className={styles.headerRow}>
        <div className={styles.status}>{getStatusBadge(mockLastGame.status)}</div>
        <div className={styles.opening}>{mockLastGame.opening ? mockLastGame.opening : 'Unknown Opening'}</div>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.opponent}>vs {mockLastGame.opponent}</span>
        <span className={styles.timeControl}>{mockLastGame.timeControl}</span>
        <span className={styles.result}>{getResultText(mockLastGame.result)}</span>
      </div>
      {mockLastGame.status === 'deviation' && !mockLastGame.reviewed && (
        <div className={styles.reviewRow}>
          <span className={styles.deviationInfo}>
            Deviation on move {mockLastGame.moveNumber}: played <b>{mockLastGame.deviationMove}</b>, expected <b>{mockLastGame.expectedMove}</b>
          </span>
          <button className={styles.reviewButton}><FaPlay style={{ marginRight: 6 }} /> Review Now</button>
        </div>
      )}
    </div>
  );
};

export default LastGameSummaryWidget; 