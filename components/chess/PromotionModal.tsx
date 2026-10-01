'use client';

import React from 'react';
import { ChessPiece } from './ChessPiece';

interface PromotionModalProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

export function PromotionModal({ isOpen, color, onSelect, onCancel }: PromotionModalProps) {
  if (!isOpen) return null;

  const choices: Array<{ type: 'q' | 'r' | 'b' | 'n'; label: string }> = [
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Promote Pawn</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Select a piece to promote your pawn to:</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {choices.map((c) => (
            <button
              key={c.type}
              type="button"
              onClick={() => onSelect(c.type)}
              className="p-3 rounded-2xl bg-zinc-100 hover:bg-purple-100 dark:bg-zinc-800 dark:hover:bg-purple-950/60 border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] transition-all flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 group-hover:scale-110 transition-transform">
                <ChessPiece type={c.type} color={color} />
              </div>
              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-[#5722AF] dark:group-hover:text-purple-300">
                {c.label}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
