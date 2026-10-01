'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ChessPiece } from './ChessPiece';
import { ChessColor, LegalMoveTarget } from '@/lib/chess/types';

interface ChessBoardProps {
  board: ({ type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; color: 'w' | 'b' } | null)[][];
  orientation?: ChessColor;
  selectedSquare: string | null;
  legalMoves: LegalMoveTarget[];
  lastMove: { from: string; to: string } | null;
  kingInCheckSquare: string | null;
  onSquareClick: (square: string) => void;
  disabled?: boolean;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface DragState {
  fromSquare: string;
  piece: { type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; color: 'w' | 'b' };
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
}

export function ChessBoard({
  board,
  orientation = 'white',
  selectedSquare,
  legalMoves,
  lastMove,
  kingInCheckSquare,
  onSquareClick,
  disabled = false,
}: ChessBoardProps) {
  const isFlipped = orientation === 'black';
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Map legal moves for O(1) lookup
  const legalTargetsMap = useMemo(() => {
    const map = new Map<string, { isCapture: boolean }>();
    legalMoves.forEach((m) => {
      map.set(m.to, { isCapture: m.isCapture });
    });
    return map;
  }, [legalMoves]);

  // Compute 64 square array in render order based on orientation
  const squares = useMemo(() => {
    const list: Array<{
      square: string;
      file: string;
      rank: string;
      rIdx: number;
      cIdx: number;
      isLight: boolean;
      piece: { type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'; color: 'w' | 'b' } | null;
    }> = [];

    const rankIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const fileIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    for (const r of rankIndices) {
      for (const c of fileIndices) {
        const file = FILES[c];
        const rank = RANKS[r];
        const square = `${file}${rank}`;
        const isLight = (r + c) % 2 === 0;
        const piece = board[r]?.[c] || null;

        list.push({
          square,
          file,
          rank,
          rIdx: r,
          cIdx: c,
          isLight,
          piece,
        });
      }
    }

    return list;
  }, [board, isFlipped]);

  // Global Pointer Events for Drag and Drop (Mouse & Touch)
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
      setDragState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentX: e.clientX,
          currentY: e.clientY,
          isDragging: prev.isDragging || dist > 4,
        };
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragState.isDragging && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;

        if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
          const col = Math.floor((relX / rect.width) * 8);
          const row = Math.floor((relY / rect.height) * 8);

          if (col >= 0 && col < 8 && row >= 0 && row < 8) {
            const rankIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
            const fileIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
            const dropSquare = `${FILES[fileIndices[col]]}${RANKS[rankIndices[row]]}`;

            if (dropSquare !== dragState.fromSquare) {
              if (legalTargetsMap.has(dropSquare)) {
                onSquareClick(dropSquare);
              } else {
                const targetPiece = board[rankIndices[row]]?.[fileIndices[col]];
                if (targetPiece && targetPiece.color === dragState.piece.color) {
                  onSquareClick(dropSquare);
                }
              }
            }
          }
        }
      }
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, board, isFlipped, legalTargetsMap, onSquareClick]);

  const squareSize = boardRef.current ? boardRef.current.getBoundingClientRect().width / 8 : 60;

  return (
    <div
      ref={boardRef}
      className="chess-board-container relative w-full aspect-square max-w-[560px] mx-auto select-none overflow-hidden shadow-2xl touch-none"
      style={{
        width: '100%',
        maxWidth: '560px',
        aspectRatio: '1 / 1',
        backgroundColor: '#ebecd0',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div
        className="chess-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 12.5%)',
          gridTemplateRows: 'repeat(8, 12.5%)',
          width: '100%',
          height: '100%',
          aspectRatio: '1 / 1',
        }}
      >
        {squares.map(({ square, file, rank, isLight, piece }, index) => {
          const isSelected = selectedSquare === square;
          const isLastMove = lastMove?.from === square || lastMove?.to === square;
          const isKingInCheck = kingInCheckSquare === square;
          const legalTarget = legalTargetsMap.get(square);
          const isBeingDragged = dragState?.isDragging && dragState?.fromSquare === square;

          // Rank label: top-left corner of column a
          const showRankCoord = index % 8 === 0;
          // File label: bottom-right corner of rank 1
          const showFileCoord = Math.floor(index / 8) === 7;

          const squareBgColor = isSelected
            ? '#baca44'
            : isLastMove
            ? (isLight ? '#f5f682' : '#baca44')
            : isLight
            ? '#ebecd0'
            : '#779556';

          return (
            <div
              key={square}
              onPointerDown={(e) => {
                if (disabled) return;
                // If a piece is already selected and this is a legal move target, click immediately
                if (selectedSquare && legalTargetsMap.has(square)) {
                  onSquareClick(square);
                  return;
                }
                // Start drag if clicking a piece
                if (piece) {
                  setDragState({
                    fromSquare: square,
                    piece,
                    startX: e.clientX,
                    startY: e.clientY,
                    currentX: e.clientX,
                    currentY: e.clientY,
                    isDragging: false,
                  });
                  onSquareClick(square);
                } else if (selectedSquare) {
                  onSquareClick(square);
                }
              }}
              className={`chess-sq ${isLight ? 'chess-sq-light' : 'chess-sq-dark'} cursor-pointer ${
                disabled ? 'cursor-not-allowed' : ''
              }`}
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: squareBgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Selected Square Highlight overlay */}
              {isSelected && (
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{ backgroundColor: 'rgba(186, 202, 68, 0.85)' }}
                />
              )}

              {/* Last Move Trail Highlight overlay */}
              {isLastMove && !isSelected && (
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{ backgroundColor: 'rgba(245, 246, 130, 0.5)' }}
                />
              )}

              {/* King In Check Radial Red Alert */}
              {isKingInCheck && (
                <div
                  className="absolute inset-0 z-10 animate-pulse pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.5) 60%, transparent 100%)',
                  }}
                />
              )}

              {/* Chess Piece Vector */}
              {piece && (
                <div
                  className="relative z-20 w-[92%] h-[92%] flex items-center justify-center transition-opacity"
                  style={{ opacity: isBeingDragged ? 0.25 : 1 }}
                >
                  <ChessPiece type={piece.type} color={piece.color} />
                </div>
              )}

              {/* Legal Move Indicators (translucent dot for empty, ring for capture) */}
              {legalTarget && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  {legalTarget.isCapture ? (
                    <div
                      className="w-[86%] h-[86%] rounded-full border-4 sm:border-[6px]"
                      style={{ borderColor: 'rgba(0, 0, 0, 0.22)' }}
                    />
                  ) : (
                    <div
                      className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.22)' }}
                    />
                  )}
                </div>
              )}

              {/* Rank Coordinate (top-left of left-most file) */}
              {showRankCoord && (
                <span
                  className="absolute top-0.5 left-1 text-[10px] sm:text-xs font-bold leading-none pointer-events-none select-none z-10"
                  style={{ color: isLight ? '#779556' : '#ebecd0' }}
                >
                  {rank}
                </span>
              )}

              {/* File Coordinate (bottom-right of bottom-most rank) */}
              {showFileCoord && (
                <span
                  className="absolute bottom-0.5 right-1 text-[10px] sm:text-xs font-bold leading-none pointer-events-none select-none z-10"
                  style={{ color: isLight ? '#779556' : '#ebecd0' }}
                >
                  {file}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Dragged Piece Clone Following Cursor/Touch */}
      {dragState?.isDragging && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-xl"
          style={{
            left: `${dragState.currentX}px`,
            top: `${dragState.currentY}px`,
            width: `${squareSize}px`,
            height: `${squareSize}px`,
          }}
        >
          <ChessPiece type={dragState.piece.type} color={dragState.piece.color} />
        </div>
      )}
    </div>
  );
}
