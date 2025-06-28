import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

export interface ChessGameInfo {
  fens: string[];
  moves: string[];
  whitePlayer: string;
  blackPlayer: string;
}

export function useChessGame(pgn: string | null): ChessGameInfo {
  const [fens, setFens] = useState<string[]>([]);
  const [moves, setMoves] = useState<string[]>([]);
  const [whitePlayer, setWhitePlayer] = useState<string>('White');
  const [blackPlayer, setBlackPlayer] = useState<string>('Black');

  useEffect(() => {
    if (!pgn) {
      setFens([new Chess().fen()]);
      setMoves([]);
      setWhitePlayer('White');
      setBlackPlayer('Black');
      return;
    }
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
      setFens(positions);
      setMoves(history);
    } catch {
      setFens([new Chess().fen()]);
      setMoves([]);
      setWhitePlayer('White');
      setBlackPlayer('Black');
    }
  }, [pgn]);

  return { fens, moves, whitePlayer, blackPlayer };
}
