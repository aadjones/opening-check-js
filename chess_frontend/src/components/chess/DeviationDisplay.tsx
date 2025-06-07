// src/DeviationDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { Arrow, Square } from 'react-chessboard/dist/chessboard/types';
import type { Database } from '../../types/supabase';
type Deviation = Database['public']['Tables']['opening_deviations']['Row'];
import ChessBoard from '../ChessBoard';
import MoveNavigation from '../MoveNavigation';
import { useChessGame } from '../../hooks/useChessGame';
import { useAuth } from '../../hooks/useAuth';

interface DeviationDisplayProps {
  result: Deviation | null;
  gameNumber: number;
}

const DeviationDisplay: React.FC<DeviationDisplayProps> = ({ result, gameNumber }) => {
  const { user } = useAuth();
  const username = user?.lichessUsername || user?.name || '';
  const pgn = result && typeof (result as { pgn?: string }).pgn === 'string' ? (result as { pgn: string }).pgn : null;
  const { fens, whitePlayer, blackPlayer } = useChessGame(pgn);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Determine user's color in this game
  const userColor = username === whitePlayer ? 'white' : username === blackPlayer ? 'black' : null;

  // Only show deviation if the user made the move
  const deviationIsUsersMove = result && userColor && result.color?.toLowerCase() === userColor;

  // Deviation move index
  const deviationMoveIndex = result
    ? (result.move_number - 1) * 2 + (result.color?.toLowerCase() === 'black' ? 1 : 0)
    : 0;

  // Debug logging
  console.log('DeviationDisplay Debug:');
  console.log('PGN:', pgn);
  console.log('FENs:', fens);
  console.log('Deviation index:', deviationMoveIndex);
  console.log('position_fen from DB:', result?.position_fen);

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

  if (!result || !deviationIsUsersMove) {
    return (
      <div className="result-card">
        <h3>Game {gameNumber}: No user deviation found.</h3>
      </div>
    );
  }

  // Arrows only at deviation position
  const customArrows: Arrow[] = [];
  if (result?.deviation_uci && result.deviation_uci.length === 4) {
    customArrows.push([result.deviation_uci.slice(0, 2) as Square, result.deviation_uci.slice(2, 4) as Square, 'red']);
  }
  if (result?.reference_uci && result.reference_uci.length === 4) {
    customArrows.push([
      result.reference_uci.slice(0, 2) as Square,
      result.reference_uci.slice(2, 4) as Square,
      'green',
    ]);
  }

  // Only show arrows at the deviation position
  const showArrows = currentMoveIndex === deviationMoveIndex;
  const arrows = showArrows ? customArrows : [];

  const opponentName = result.color === 'White' ? blackPlayer : whitePlayer;

  // Only show the chessboard and navigation (no move comparison)
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
          arrows={arrows}
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
