import React from 'react';
import styles from './OutcomeBadge.module.css';
import type { Outcome } from '../../utils/outcome';
import { SHOW_OUTCOME_BADGE } from '../../featureFlags';

interface OutcomeBadgeProps {
  outcome: Outcome | null | undefined;
  className?: string;
}

const OutcomeBadge: React.FC<OutcomeBadgeProps> = ({ outcome, className }) => {
  if (!SHOW_OUTCOME_BADGE || !outcome) return null;
  return (
    <span
      className={`${styles.badge} ${
        outcome === 'win' ? styles.win : outcome === 'loss' ? styles.loss : styles.draw
      } ${className ?? ''}`.trim()}
      aria-label={`Game outcome: ${outcome}`}
    >
      {outcome}
    </span>
  );
};

export default OutcomeBadge;
