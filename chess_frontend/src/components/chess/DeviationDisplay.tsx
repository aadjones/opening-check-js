import React, { useState, useEffect, useCallback } from 'react';
import type { Arrow, Square } from 'react-chessboard/dist/chessboard/types';
import type { Database } from '../../types/supabase';
import ChessBoard from './ChessBoard';
import { useChessGame } from '../../hooks/useChessGame';
import { useAuth } from '../../hooks/useAuth';
import DeviationMoveControls from './DeviationMoveControls';

type Deviation = Database['public']['Tables']['opening_deviations']['Row'];

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

interface DeviationDisplayProps {
  result: Deviation | null;
  gameNumber: number;
  isUserDeviation: boolean; // Prop to determine behavior
  renderControlsExternally?: boolean;
  onMoveControlState?: (state: DeviationMoveControlState) => void;
}

const DeviationDisplay: React.FC<DeviationDisplayProps> = ({
  result,
  gameNumber,
  isUserDeviation,
  renderControlsExternally = false,
  onMoveControlState,
}) => {
  const { user } = useAuth();
  const username = user?.lichessUsername || user?.name || '';
  const pgn = result?.pgn ?? null;

  const { fens, whitePlayer } = useChessGame(pgn);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // This is the user's color in the game, needed for board orientation
  const userColor = username.toLowerCase() === whitePlayer.toLowerCase() ? 'white' : 'black';

  // The move index in the FEN array where the deviation occurred
  const deviationMoveIndex = result
    ? (result.move_number - 1) * 2 + (result.color?.toLowerCase() === 'black' ? 1 : 0)
    : 0;

  // Set the board to the deviation position when the component loads or data changes
  useEffect(() => {
    if (result && fens.length > 0) {
      const targetIndex = Math.min(deviationMoveIndex, fens.length - 1);
      setCurrentMoveIndex(targetIndex);
    } else {
      setCurrentMoveIndex(0);
    }
  }, [result, fens.length, deviationMoveIndex]);

  // Keyboard navigation logic (no changes needed here)
  const goToMove = useCallback(
    (moveIndex: number) => {
      if (moveIndex >= 0 && moveIndex < fens.length) {
        setCurrentMoveIndex(moveIndex);
      }
    },
    [fens.length]
  );
  const goToStart = useCallback(() => goToMove(0), [goToMove]);
  const goToPrevious = useCallback(() => goToMove(currentMoveIndex - 1), [currentMoveIndex, goToMove]);
  const goToNext = useCallback(() => goToMove(currentMoveIndex + 1), [currentMoveIndex, goToMove]);
  const goToEnd = useCallback(() => goToMove(fens.length - 1), [fens.length, goToMove]);
  const goToDeviation = useCallback(() => goToMove(deviationMoveIndex), [deviationMoveIndex, goToMove]);
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isFocused) return;
      event.preventDefault();
      switch (event.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Home':
          goToStart();
          break;
        case 'End':
          goToEnd();
          break;
      }
    },
    [goToPrevious, goToNext, goToStart, goToEnd, isFocused]
  );
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Expose controls state to parent if needed
  useEffect(() => {
    if (onMoveControlState) {
      onMoveControlState({
        currentMoveIndex,
        moveCount: fens.length,
        onStart: goToStart,
        onPrev: goToPrevious,
        onNext: goToNext,
        onEnd: goToEnd,
        onDeviation: goToDeviation,
        deviationIndex: deviationMoveIndex,
        onMoveSlider: goToMove,
      });
    }
  }, [
    currentMoveIndex,
    fens.length,
    goToStart,
    goToPrevious,
    goToNext,
    goToEnd,
    goToDeviation,
    deviationMoveIndex,
    goToMove,
    onMoveControlState,
  ]);

  if (!result) {
    return (
      <div className="result-card">
        <h3>Game {gameNumber}: No deviation data available.</h3>
      </div>
    );
  }

  // --- NEW ARROW LOGIC ---
  const customArrows: Arrow[] = [];
  // The deviating move is always red
  if (result.deviation_uci && result.deviation_uci.length === 4) {
    customArrows.push([result.deviation_uci.slice(0, 2) as Square, result.deviation_uci.slice(2, 4) as Square, 'red']);
  }

  if (isUserDeviation) {
    // If user deviated, the single expected move is green
    if (result.reference_uci && result.reference_uci.length === 4) {
      customArrows.push([
        result.reference_uci.slice(0, 2) as Square,
        result.reference_uci.slice(2, 4) as Square,
        'blue',
      ]);
    }
  } else {
    // If opponent deviated, all prepared responses are blue
    if (result.reference_uci) {
      const expectedUcis = result.reference_uci.split(', ');
      for (const uci of expectedUcis) {
        if (uci.length === 4) {
          customArrows.push([uci.slice(0, 2) as Square, uci.slice(2, 4) as Square, 'blue']);
        }
      }
    }
  }

  // Only show the arrows when viewing the exact deviation position
  const showArrows = currentMoveIndex === deviationMoveIndex;

  return (
    <div
      className={`result-card ${isFocused ? 'focused' : ''}`}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={() => setIsFocused(true)}
      style={{ outline: 'none' }} // Remove default browser focus ring
    >
      <div className="chess-board-container">
        <ChessBoard
          fen={fens[currentMoveIndex]}
          arrows={showArrows ? customArrows : []}
          orientation={userColor}
          boardWidth={360} // A slightly larger, more modern size
          arePiecesDraggable={false}
        />
      </div>

      {/* Conditionally render controls based on prop */}
      {!renderControlsExternally && (
        <DeviationMoveControls
          currentMoveIndex={currentMoveIndex}
          moveCount={fens.length}
          onStart={goToStart}
          onPrev={goToPrevious}
          onNext={goToNext}
          onEnd={goToEnd}
          onDeviation={goToDeviation}
          deviationIndex={deviationMoveIndex}
          onMoveSlider={goToMove}
        />
      )}
    </div>
  );
};

export default DeviationDisplay;
