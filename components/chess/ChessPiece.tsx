'use client';

import React from 'react';

export interface ChessPieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

export function ChessPiece({ type, color, className = 'w-full h-full' }: ChessPieceProps) {
  const pieceCode = `${color}${type.toUpperCase()}`;
  const label = `${color === 'w' ? 'White' : 'Black'} ${
    type === 'p'
      ? 'Pawn'
      : type === 'n'
      ? 'Knight'
      : type === 'b'
      ? 'Bishop'
      : type === 'r'
      ? 'Rook'
      : type === 'q'
      ? 'Queen'
      : 'King'
  }`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/chess/neo/${pieceCode}.svg`}
      alt={label}
      draggable={false}
      className={`select-none pointer-events-none object-contain w-full h-full ${className}`}
      loading="eager"
    />
  );
}
