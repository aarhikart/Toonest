'use client';

import React from 'react';
import { Trophy, RotateCcw, ArrowLeft, Award } from 'lucide-react';

interface GameResultModalProps {
  isOpen: boolean;
  winner: 'white' | 'black' | 'draw' | null;
  reason: string;
  onNewGame: () => void;
  onBackToMenu: () => void;
}

export function GameResultModal({
  isOpen,
  winner,
  reason,
  onNewGame,
  onBackToMenu,
}: GameResultModalProps) {
  if (!isOpen) return null;

  const isDraw = winner === 'draw';
  const title = isDraw ? 'Game Drawn' : winner === 'white' ? 'White Wins!' : 'Black Wins!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
          {isDraw ? <Award className="w-8 h-8" /> : <Trophy className="w-8 h-8 animate-bounce" />}
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{title}</h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 capitalize">{reason || 'Game completed.'}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onNewGame}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#5722AF] hover:bg-[#682BC9] text-white font-bold text-xs shadow-md shadow-[#5722AF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Game</span>
          </button>
          <button
            type="button"
            onClick={onBackToMenu}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Chess</span>
          </button>
        </div>
      </div>
    </div>
  );
}
