import React from 'react';
import styles from './DeviationMoveControls.module.css';

export interface DeviationMoveControlState {
  currentMoveIndex: number;
  moveCount: number;
  onStart: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEnd: () => void;
  onDeviation: () => void;
  deviationIndex: number;
  onMoveSlider: (moveIndex: number) => void;
}

const DeviationMoveControls: React.FC<DeviationMoveControlState> = ({
  currentMoveIndex,
  moveCount,
  onStart,
  onPrev,
  onNext,
  onEnd,
  onDeviation,
  deviationIndex,
  onMoveSlider,
}) => {
  return (
    <div className={styles.controlsRow}>
      <button
        className={styles.iconButton}
        onClick={onStart}
        disabled={currentMoveIndex === 0}
        title="Go to start"
        aria-label="Go to start"
      >
        ⏮
      </button>
      <button
        className={styles.iconButton}
        onClick={onPrev}
        disabled={currentMoveIndex === 0}
        title="Previous move"
        aria-label="Previous move"
      >
        ◀
      </button>
      <input
        type="range"
        min={0}
        max={moveCount - 1}
        value={currentMoveIndex}
        onChange={e => onMoveSlider(Number(e.target.value))}
        className={styles.moveSlider}
        aria-label="Move slider"
      />
      <button
        className={styles.iconButton}
        onClick={onNext}
        disabled={currentMoveIndex >= moveCount - 1}
        title="Next move"
        aria-label="Next move"
      >
        ▶
      </button>
      <button
        className={styles.iconButton}
        onClick={onEnd}
        disabled={currentMoveIndex >= moveCount - 1}
        title="Go to end"
        aria-label="Go to end"
      >
        ⏭
      </button>
      {typeof onDeviation === 'function' && typeof deviationIndex === 'number' && deviationIndex >= 0 && (
        <button
          className={styles.deviationButton}
          onClick={onDeviation}
          title="Go to deviation"
          aria-label="Go to deviation"
        >
          Deviation
        </button>
      )}
      <span className={styles.moveIndicator}>
        {currentMoveIndex}/{moveCount - 1}
      </span>
    </div>
  );
};

export default DeviationMoveControls;
