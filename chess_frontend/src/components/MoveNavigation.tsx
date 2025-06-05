import React from 'react';

export interface MoveNavigationProps {
  currentMoveIndex: number;
  moveCount: number;
  onStart: () => void;
  onPrev: () => void;
  onNext: () => void;
  onEnd: () => void;
  onDeviation?: () => void;
  deviationIndex?: number;
  disabled?: boolean;
  onMoveSlider?: (index: number) => void;
}

const MoveNavigation: React.FC<MoveNavigationProps> = ({
  currentMoveIndex,
  moveCount,
  onStart,
  onPrev,
  onNext,
  onEnd,
  onDeviation,
  deviationIndex,
  disabled = false,
  onMoveSlider,
}) => {
  return (
    <div className="move-navigation-controls" aria-label="Move navigation controls">
      <button onClick={onStart} disabled={disabled || currentMoveIndex === 0} title="Go to start" aria-label="Go to start">
        ⏮
      </button>
      <button onClick={onPrev} disabled={disabled || currentMoveIndex === 0} title="Previous move" aria-label="Previous move">
        ◀
      </button>
      <button onClick={onNext} disabled={disabled || currentMoveIndex >= moveCount - 1} title="Next move" aria-label="Next move">
        ▶
      </button>
      <button onClick={onEnd} disabled={disabled || currentMoveIndex >= moveCount - 1} title="Go to end" aria-label="Go to end">
        ⏭
      </button>
      {typeof onDeviation === 'function' && typeof deviationIndex === 'number' && (
        <button onClick={onDeviation} disabled={disabled} className="deviation-button" title="Go to deviation" aria-label="Go to deviation">
          Deviation
        </button>
      )}
      <div className="move-slider" style={{ display: 'inline-block', marginLeft: 16 }}>
        <input
          type="range"
          min={0}
          max={moveCount - 1}
          value={currentMoveIndex}
          onChange={e => onMoveSlider?.(parseInt(e.target.value))}
          aria-label="Move slider"
          disabled={disabled}
        />
        <span style={{ marginLeft: 8 }}>{currentMoveIndex}/{moveCount - 1}</span>
      </div>
    </div>
  );
};

export default MoveNavigation; 