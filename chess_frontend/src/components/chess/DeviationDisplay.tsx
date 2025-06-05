// src/DeviationDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { Arrow, Square } from 'react-chessboard/dist/chessboard/types';
import type { ApiDeviationResult } from '../../types';
import ChessBoard from '../ChessBoard';
import MoveNavigation from '../MoveNavigation';
import { useChessGame } from '../../hooks/useChessGame';

interface DeviationDisplayProps {
  result: ApiDeviationResult | null;
  gameNumber: number;
}

const uciToArrow = (uciMove: string | null, color: string): Arrow | null => {
  if (!uciMove || uciMove.length < 4) return null;
  const fromSquare = uciMove.substring(0, 2) as Square;
  const toSquare = uciMove.substring(2, 4) as Square;
  return [fromSquare, toSquare, color];
};

const DeviationDisplay: React.FC<DeviationDisplayProps> = ({ result, gameNumber }) => {
  const { fens, whitePlayer, blackPlayer } = useChessGame(result?.pgn || null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Deviation move index
  const deviationMoveIndex = result
    ? (result.whole_move_number - 1) * 2 + (result.color === 'Black' ? 1 : 0)
    : 0;

  // Set initial move index to deviation when result changes
  useEffect(() => {
    if (result && fens.length > 0) {
      const targetIndex = Math.min(deviationMoveIndex, fens.length - 1);
      setCurrentMoveIndex(targetIndex);
    } else {
      setCurrentMoveIndex(0);
    }
  }, [result, fens.length, deviationMoveIndex]);

  // Keyboard navigation
  const goToMove = useCallback((moveIndex: number) => {
    if (moveIndex >= 0 && moveIndex < fens.length) {
      setCurrentMoveIndex(moveIndex);
    }
  }, [fens.length]);

  const goToStart = useCallback(() => goToMove(0), [goToMove]);
  const goToPrevious = useCallback(() => goToMove(currentMoveIndex - 1), [currentMoveIndex, goToMove]);
  const goToNext = useCallback(() => goToMove(currentMoveIndex + 1), [currentMoveIndex, goToMove]);
  const goToEnd = useCallback(() => goToMove(fens.length - 1), [fens.length, goToMove]);
  const goToDeviation = useCallback(() => goToMove(deviationMoveIndex), [deviationMoveIndex, goToMove]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isFocused) return;
      switch (event.key) {
        case 'ArrowLeft': event.preventDefault(); goToPrevious(); break;
        case 'ArrowRight': event.preventDefault(); goToNext(); break;
        case 'Home': event.preventDefault(); goToStart(); break;
        case 'End': event.preventDefault(); goToEnd(); break;
      }
    },
    [goToPrevious, goToNext, goToStart, goToEnd, isFocused]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!result) {
    return (
      <div className="result-card">
        <h3>Game {gameNumber}: No deviation found.</h3>
      </div>
    );
  }

  // Arrows only at deviation position
  const customArrows: Arrow[] = [];
  if (currentMoveIndex === deviationMoveIndex && result) {
    const refArrow = uciToArrow(result.reference_uci, 'blue');
    const devArrow = uciToArrow(result.deviation_uci, 'red');
    if (refArrow) customArrows.push(refArrow);
    if (devArrow) customArrows.push(devArrow);
  }

  const opponentName = result.color === 'White' ? blackPlayer : whitePlayer;

  return (
    <div
      className={`result-card ${isFocused ? 'focused' : ''}`}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onClick={() => setIsFocused(true)}
    >
      <h3>Game {gameNumber}</h3>
      <div className="opponent-name">{opponentName}</div>
      <div className="chess-board-container">
        <ChessBoard
          fen={fens[currentMoveIndex]}
          arrows={customArrows}
          orientation={typeof result.color === 'string' ? result.color.toLowerCase() as 'white' | 'black' : 'white'}
          boardWidth={300}
          arePiecesDraggable={false}
        />
      </div>
      <MoveNavigation
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
    </div>
  );
};

export default DeviationDisplay;
