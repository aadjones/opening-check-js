import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { Arrow, BoardOrientation } from 'react-chessboard/dist/chessboard/types';

export interface ChessBoardProps {
  fen: string;
  arrows?: Arrow[];
  customSquareStyles?: Record<string, Record<string, string | number>>;
  orientation?: BoardOrientation;
  boardWidth?: number;
  arePiecesDraggable?: boolean;
  onMove?: (from: string, to: string) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  arrows = [],
  customSquareStyles = {},
  orientation = 'white',
  boardWidth = 300,
  arePiecesDraggable = false,
  onMove,
}) => {
  return (
    <Chessboard
      position={fen}
      customArrows={arrows}
      customSquareStyles={customSquareStyles}
      boardOrientation={orientation}
      boardWidth={boardWidth}
      arePiecesDraggable={arePiecesDraggable}
      onPieceDrop={
        onMove
          ? (from, to) => {
              onMove(from, to);
              return true;
            }
          : undefined
      }
    />
  );
};

export default ChessBoard; 