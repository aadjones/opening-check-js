// src/DeviationDisplay.tsx
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Chessboard } from 'react-chessboard';
import type { Arrow, Square, BoardOrientation } from 'react-chessboard/dist/chessboard/types';
import { Chess } from 'chess.js'; // <--- IMPORT chess.js

export interface ApiDeviationResult {
  whole_move_number: number;
  deviation_san: string;
  reference_san: string;
  player_color: string;
  board_fen_before_deviation: string;
  reference_uci: string | null;
  deviation_uci: string | null;
  pgn: string; // Added PGN field
}

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
  // State for the current board position (FEN)
  const [currentFen, setCurrentFen] = useState<string | undefined>(undefined);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(0);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [whitePlayer, setWhitePlayer] = useState<string>('');
  const [blackPlayer, setBlackPlayer] = useState<string>('');

  // Parse PGN and create move history
  const parsePGN = useCallback((pgn: string) => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      const history = chess.history();
      const positions: string[] = [];

      // Extract player names from PGN headers
      const whiteMatch = pgn.match(/\[White "([^"]+)"\]/);
      const blackMatch = pgn.match(/\[Black "([^"]+)"\]/);
      setWhitePlayer(whiteMatch ? whiteMatch[1] : 'White');
      setBlackPlayer(blackMatch ? blackMatch[1] : 'Black');

      // Reset and replay to get all positions
      chess.reset();
      positions.push(chess.fen()); // Starting position

      for (const move of history) {
        chess.move(move);
        positions.push(chess.fen());
      }

      setGameHistory(positions);
      return positions;
    } catch (error) {
      console.error('Error parsing PGN:', error);
      return [new Chess().fen()];
    }
  }, []);

  // Navigate to specific move
  const goToMove = useCallback(
    (moveIndex: number) => {
      if (moveIndex >= 0 && moveIndex < gameHistory.length) {
        setCurrentMoveIndex(moveIndex);
        setCurrentFen(gameHistory[moveIndex]);
      }
    },
    [gameHistory]
  );

  // Navigation functions
  const goToStart = useCallback(() => goToMove(0), [goToMove]);
  const goToPrevious = useCallback(() => goToMove(currentMoveIndex - 1), [currentMoveIndex, goToMove]);
  const goToNext = useCallback(() => goToMove(currentMoveIndex + 1), [currentMoveIndex, goToMove]);
  const goToEnd = useCallback(() => goToMove(gameHistory.length - 1), [gameHistory.length, goToMove]);
  const goToDeviation = useCallback(() => {
    if (result) {
      // Find the move index for the deviation
      const deviationMoveIndex = (result.whole_move_number - 1) * 2 + (result.player_color === 'Black' ? 1 : 0);
      goToMove(Math.min(deviationMoveIndex, gameHistory.length - 1));
    }
  }, [result, gameHistory.length, goToMove]);

  // Keyboard event handler - only works when this component is focused
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isFocused) return; // Only handle keys when this game is focused

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
    // Initialize when the result prop changes
    if (result && result.pgn) {
      const positions = parsePGN(result.pgn);
      // Auto-navigate to deviation position
      const deviationMoveIndex = (result.whole_move_number - 1) * 2 + (result.player_color === 'Black' ? 1 : 0);
      const targetIndex = Math.min(deviationMoveIndex, positions.length - 1);

      setCurrentFen(positions[targetIndex]);
      setCurrentMoveIndex(targetIndex);
    } else {
      const startFen = new Chess().fen();
      setCurrentFen(startFen);
      setGameHistory([startFen]);
      setCurrentMoveIndex(0);
    }
  }, [result, parsePGN]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  if (!result) {
    return (
      <div className="result-card">
        <h3>Game {gameNumber}: No deviation found.</h3>
      </div>
    );
  }

  const customArrows: Arrow[] = [];
  // Show arrows at the deviation position
  if (result) {
    const deviationMoveIndex = (result.whole_move_number - 1) * 2 + (result.player_color === 'Black' ? 1 : 0);
    if (currentMoveIndex === deviationMoveIndex) {
      const refArrow = uciToArrow(result.reference_uci, 'blue');
      const devArrow = uciToArrow(result.deviation_uci, 'red');
      if (refArrow) customArrows.push(refArrow);
      if (devArrow) customArrows.push(devArrow);
    }
  }

  // Determine opponent name (the player who is NOT the user)
  const opponentName = result.player_color === 'White' ? blackPlayer : whitePlayer;

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
        <Chessboard
          position={currentFen}
          customArrows={customArrows}
          boardOrientation={result.player_color.toLowerCase() as BoardOrientation}
          arePiecesDraggable={false}
          boardWidth={300}
        />
      </div>

      <div className="navigation-controls">
        <button onClick={goToStart} disabled={currentMoveIndex === 0} title="Go to start">
          ⏮
        </button>
        <button onClick={goToPrevious} disabled={currentMoveIndex === 0} title="Previous move">
          ◀
        </button>
        <button onClick={goToNext} disabled={currentMoveIndex >= gameHistory.length - 1} title="Next move">
          ▶
        </button>
        <button onClick={goToEnd} disabled={currentMoveIndex >= gameHistory.length - 1} title="Go to end">
          ⏭
        </button>
        <button onClick={goToDeviation} className="deviation-button" title="Go to deviation">
          Deviation
        </button>
      </div>

      <div className="move-slider">
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max={gameHistory.length - 1}
            value={currentMoveIndex}
            onChange={e => goToMove(parseInt(e.target.value))}
          />
          <div
            className="deviation-marker"
            style={{
              left: `${(((result.whole_move_number - 1) * 2 + (result.player_color === 'Black' ? 1 : 0)) / Math.max(gameHistory.length - 1, 1)) * 100}%`,
            }}
            title="Deviation position"
          />
        </div>
        <div className="slider-info">
          {currentMoveIndex}/{gameHistory.length - 1}
        </div>
      </div>
    </div>
  );
};

export default DeviationDisplay;
