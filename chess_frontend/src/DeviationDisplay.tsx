// src/DeviationDisplay.tsx
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
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
  const [chessJsBoard, setChessJsBoard] = useState<Chess | null>(null);


  useEffect(() => {
    // Initialize FEN when the result prop changes (e.g., new game analysis)
    if (result) {
      setCurrentFen(result.board_fen_before_deviation);
      setChessJsBoard(new Chess(result.board_fen_before_deviation)); // Initialize chess.js instance
    } else {
      setCurrentFen(new Chess().fen()); // Or some default empty board FEN if no result
      setChessJsBoard(new Chess());
    }
  }, [result]); // Re-run when 'result' changes

  if (!result) {
    // You might want a placeholder even for no deviation, or just different text
    return (
      <div className="result-card">
        <h3>Game {gameNumber}: No deviation found.</h3>
        {/* Optionally show an empty interactive board */}
        {/* <Chessboard position={currentFen} boardWidth={300} /> */}
      </div>
    );
  }

  const customArrows: Arrow[] = [];
  const refArrow = uciToArrow(result.reference_uci, 'blue');
  const devArrow = uciToArrow(result.deviation_uci, 'red');
  if (refArrow) customArrows.push(refArrow);
  if (devArrow) customArrows.push(devArrow);

  const onPieceDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (!chessJsBoard) return false;

    try {
      const move = chessJsBoard.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity in this example
      });

      if (move === null) { // Illegal move
        return false;
      }
      setCurrentFen(chessJsBoard.fen()); // Update our FEN state
      return true; // Move was successful
    } catch (error) {
      console.log("Error making move:", error);
      return false; // Move failed
    }
  };


  return (
    <div className="result-card">
      <h3>Game {gameNumber} - Deviation:</h3>
      <p>Move: {result.whole_move_number} ({result.player_color})</p>
      <div className="chess-board-container">
        <Chessboard
          position={currentFen}
          customArrows={customArrows}
          boardOrientation={result.player_color.toLowerCase() as BoardOrientation}
          arePiecesDraggable={true}
          onPieceDrop={onPieceDrop}
          boardWidth={300}
        />
      </div>
      <p>Your move: {result.deviation_san} (Ref: {result.reference_san})</p>
      <button onClick={() => {
          setCurrentFen(result.board_fen_before_deviation);
          setChessJsBoard(new Chess(result.board_fen_before_deviation));
        }}
      >
        Reset Board
      </button>
    </div>
  );
};

export default DeviationDisplay;