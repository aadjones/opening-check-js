import React from 'react';
import { Chessboard } from 'react-chessboard';
import type { Arrow, BoardOrientation } from 'react-chessboard/dist/chessboard/types';

export interface ChessBoardProps {
  fen: string;
  arrows?: Arrow[];
  orientation?: BoardOrientation;
  boardWidth?: number;
  arePiecesDraggable?: boolean;
  // For future extensibility
  onMove?: (from: string, to: string) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  arrows = [],
  orientation = 'white',
  boardWidth = 300,
  arePiecesDraggable = false,
  onMove,
}) => {
  return (
    <Chessboard
      position={fen}
      customArrows={arrows}
      boardOrientation={orientation}
      boardWidth={boardWidth}
      arePiecesDraggable={arePiecesDraggable}
      onPieceDrop={onMove ? ((from, to) => { onMove(from, to); return true; }) : undefined}
    />
  );
};

export default ChessBoard; 