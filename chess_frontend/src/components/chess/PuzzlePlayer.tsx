import React, { useState } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../ChessBoard';
import type { PuzzleData } from '../../hooks/useReviewQueue';
import type { Arrow } from 'react-chessboard/dist/chessboard/types';
import styles from './PuzzlePlayer.module.css';

interface PuzzlePlayerProps {
  puzzle: PuzzleData;
  onComplete: (success: boolean, attempts: number) => void;
  onNext: () => void;
}

type PuzzleState = 'animating_opponent' | 'setup' | 'waiting_for_move' | 'correct' | 'incorrect' | 'show_answer';

const PuzzlePlayer: React.FC<PuzzlePlayerProps> = ({ puzzle, onComplete, onNext }) => {
  const [state, setState] = useState<PuzzleState>(() =>
    puzzle.previous_position_fen ? 'animating_opponent' : 'setup'
  );
  const [attempts, setAttempts] = useState(0);
  const [game] = useState(() => new Chess(puzzle.position_fen));
  const [userMadeMove, setUserMadeMove] = useState(false);
  const [currentFen, setCurrentFen] = useState(() => puzzle.previous_position_fen || puzzle.position_fen);
  const [moveHighlight, setMoveHighlight] = useState<{
    arrows: Arrow[];
    squares: Record<string, Record<string, string | number>>;
  }>({ arrows: [], squares: {} });

  // Helper function to find opponent's move between two positions
  const findOpponentMove = (fromFen: string, toFen: string) => {
    try {
      const fromGame = new Chess(fromFen);

      // Get all legal moves from the starting position
      const legalMoves = fromGame.moves({ verbose: true });

      // Find which move leads to the target position
      for (const move of legalMoves) {
        const testGame = new Chess(fromFen);
        testGame.move(move);
        if (testGame.fen() === toFen) {
          return move.san;
        }
      }
    } catch (error) {
      console.error('Could not find opponent move:', error);
    }
    return null;
  };

  // Animation sequence
  React.useEffect(() => {
    if (state === 'animating_opponent' && puzzle.previous_position_fen) {
      // Show previous position first
      setCurrentFen(puzzle.previous_position_fen);

      const animateTimer = setTimeout(() => {
        // Animate to current position and highlight opponent's move
        setCurrentFen(puzzle.position_fen);

        // Find and highlight the opponent's move
        if (puzzle.previous_position_fen) {
          const opponentMove = findOpponentMove(puzzle.previous_position_fen, puzzle.position_fen);
          if (opponentMove) {
            setMoveHighlight(createMoveHighlight(opponentMove, puzzle.previous_position_fen));
          }
        }

        setState('setup');
      }, 1000);

      return () => clearTimeout(animateTimer);
    }
  }, [state, puzzle.previous_position_fen, puzzle.position_fen]);

  // Start the puzzle - show the setup briefly then prompt for move
  React.useEffect(() => {
    if (state === 'setup') {
      const timer = setTimeout(() => {
        setState('waiting_for_move');
      }, 1000); // Brief pause to show the position
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Animate the correct move when showing answer
  React.useEffect(() => {
    if (state === 'show_answer') {
      // Reset to original position first
      setCurrentFen(puzzle.position_fen);

      const animateTimer = setTimeout(() => {
        // Make the correct move and show the result
        const correctGame = new Chess(puzzle.position_fen);
        try {
          correctGame.move(puzzle.expected_move);
          setCurrentFen(correctGame.fen());
          // Highlight the correct move with arrow and square highlighting
          setMoveHighlight(createMoveHighlight(puzzle.expected_move, puzzle.position_fen));
        } catch (error) {
          console.error('Could not animate correct move:', error);
        }
      }, 1000);

      return () => clearTimeout(animateTimer);
    }
  }, [state, puzzle.position_fen, puzzle.expected_move]);

  // Helper function to create move highlighting
  const createMoveHighlight = (move: string, fen: string) => {
    try {
      const tempGame = new Chess(fen);
      const moveObject = tempGame.move(move);

      if (moveObject) {
        return {
          arrows: [{ from: moveObject.from, to: moveObject.to, color: '#4f46e5' } as unknown as Arrow],
          squares: {
            [moveObject.from]: { backgroundColor: 'rgba(79, 70, 229, 0.3)' },
            [moveObject.to]: { backgroundColor: 'rgba(79, 70, 229, 0.5)' },
          },
        };
      }
    } catch (error) {
      console.error('Could not create move highlight:', error);
    }
    return { arrows: [], squares: {} };
  };

  const handleMove = (from: string, to: string) => {
    if (state !== 'waiting_for_move') return;

    const moveAttempt = attempts + 1;
    setAttempts(moveAttempt);
    setUserMadeMove(true);

    // Create move string in format like "Nf3" or "exd5"
    const tempGame = new Chess(game.fen());
    try {
      const move = tempGame.move({ from, to });
      const moveNotation = move.san;

      // Check if this matches the expected move
      if (moveNotation === puzzle.expected_move) {
        // Update the board to show the correct move
        setCurrentFen(tempGame.fen());
        // Highlight the correct move
        setMoveHighlight(createMoveHighlight(puzzle.expected_move, puzzle.position_fen));
        setState('correct');
        onComplete(true, moveAttempt);
      } else {
        setState('incorrect');
        // Give second chance if first attempt
        if (moveAttempt < 2) {
          setTimeout(() => {
            setState('waiting_for_move');
            setUserMadeMove(false);
          }, 1500);
        } else {
          // Failed both attempts, show answer
          onComplete(false, moveAttempt);
          setTimeout(() => {
            setState('show_answer');
          }, 1500);
        }
      }
    } catch {
      // Invalid move, don't count as attempt
      console.log('Invalid move attempted');
    }
  };

  const getMoveNotation = (moveNumber: number, color: string, move: string) => {
    if (color.toLowerCase() === 'white') {
      return `${moveNumber}.${move}`;
    } else {
      return `${moveNumber}...${move}`;
    }
  };

  const getPromptText = () => {
    switch (state) {
      case 'animating_opponent':
        return "Showing opponent's last move...";
      case 'setup':
        return 'Setting up position...';
      case 'waiting_for_move':
        return attempts === 0 ? 'Your move' : 'Try again';
      case 'correct':
        return '✅ Correct!';
      case 'incorrect':
        return attempts < 2 ? '❌ Not quite...' : '❌ Incorrect';
      case 'show_answer':
        return `${getMoveNotation(puzzle.move_number, puzzle.color, puzzle.expected_move)}`;
      default:
        return '';
    }
  };

  return (
    <div className={styles.puzzlePlayer}>
      <div className={styles.header}>
        <h2>{puzzle.opening_name || 'Opening Puzzle'}</h2>
        <p className={styles.prompt}>{getPromptText()}</p>
      </div>

      <div className={styles.gameArea}>
        <div className={styles.boardContainer}>
          <ChessBoard
            fen={currentFen}
            arrows={moveHighlight.arrows}
            customSquareStyles={moveHighlight.squares}
            orientation={puzzle.color.toLowerCase() === 'white' ? 'white' : 'black'}
            boardWidth={400}
            arePiecesDraggable={state === 'waiting_for_move' && !userMadeMove}
            onMove={handleMove}
          />
        </div>

        <div className={styles.sidebar}>
          {(state === 'correct' || state === 'show_answer') && (
            <>
              <div className={styles.info}>
                <div className={styles.moveInfo}>
                  <span className={styles.label}>Expected:</span>
                  <span className={`${styles.move} ${styles.expected}`}>
                    {getMoveNotation(puzzle.move_number, puzzle.color, puzzle.expected_move)}
                  </span>
                </div>
                <div className={styles.moveInfo}>
                  <span className={styles.label}>Your deviation:</span>
                  <span className={`${styles.move} ${styles.deviation}`}>
                    {getMoveNotation(puzzle.move_number, puzzle.color, puzzle.actual_move)}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <button className={styles.nextButton} onClick={onNext}>
                  Next Puzzle →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuzzlePlayer;
