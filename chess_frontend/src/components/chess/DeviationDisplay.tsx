// src/DeviationDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { Arrow } from 'react-chessboard/dist/chessboard/types';
import type { ApiDeviationResult } from '../../types';
import ChessBoard from '../ChessBoard';
import MoveNavigation from '../MoveNavigation';
import { useChessGame } from '../../hooks/useChessGame';

interface DeviationDisplayProps {
  result: ApiDeviationResult | null;
  gameNumber: number;
}

const DeviationDisplay: React.FC<DeviationDisplayProps> = ({ result, gameNumber }) => {
  const pgn = result && typeof (result as { pgn?: string }).pgn === 'string' ? (result as { pgn: string }).pgn : null;
  const { fens, whitePlayer, blackPlayer } = useChessGame(pgn);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Deviation move index
  const deviationMoveIndex = result ? (result.move_number - 1) * 2 + (result.color === 'Black' ? 1 : 0) : 0;

  // The move played at the deviation index (from DB)
  const playedMove = result?.actual_move || '[unknown]';
  // The expected move (from DB/prep)
  const expectedMove = result?.expected_move || '[unknown]';

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
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNext();
          break;
        case 'Home':
          event.preventDefault();
          goToStart();
          break;
        case 'End':
          event.preventDefault();
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

  if (!result) {
    return (
      <div className="result-card">
        <h3>Game {gameNumber}: No deviation found.</h3>
      </div>
    );
  }

  // Arrows only at deviation position
  const customArrows: Arrow[] = [];
  // (Optional) Add arrows if you have UCI fields in your schema

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
      {/* Move Comparison Section */}
      <div style={{ display: 'flex', gap: 24, margin: '24px 0', justifyContent: 'center' }}>
        <div
          style={{
            flex: 1,
            background: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: 12,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#991b1b' }}>You Played:</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ef4444' }}>{playedMove}</div>
        </div>
        <div
          style={{
            flex: 1,
            background: '#dcfce7',
            border: '2px solid #22c55e',
            borderRadius: 12,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#166534' }}>Expected:</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#22c55e' }}>{expectedMove}</div>
        </div>
      </div>
      <div className="chess-board-container">
        <ChessBoard
          fen={fens[currentMoveIndex]}
          arrows={customArrows}
          orientation={typeof result.color === 'string' ? (result.color.toLowerCase() as 'white' | 'black') : 'white'}
          boardWidth={300}
          arePiecesDraggable={false}
        />
      </div>
      <div style={{ textAlign: 'center', margin: '12px 0', fontWeight: 500 }}>
        Move {currentMoveIndex}/{fens.length - 1}
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
