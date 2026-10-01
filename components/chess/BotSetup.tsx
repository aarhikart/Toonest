'use client';

import React from 'react';
import { ChessColor, ChessDifficulty, PlayerColorPreference } from '@/lib/chess/types';
import { Bot, Play, Sparkles } from 'lucide-react';
import { ChessPiece } from './ChessPiece';

interface BotSetupProps {
  color: PlayerColorPreference;
  difficulty: ChessDifficulty;
  onColorChange: (color: PlayerColorPreference) => void;
  onDifficultyChange: (diff: ChessDifficulty) => void;
  onStartGame: () => void;
}

export function BotSetup({
  color,
  difficulty,
  onColorChange,
  onDifficultyChange,
  onStartGame,
}: BotSetupProps) {
  const difficulties: Array<{
    id: ChessDifficulty;
    name: string;
    elo: string;
    desc: string;
    badgeColor: string;
  }> = [
    { id: 'beginner', name: 'Beginner', elo: '400 ELO', desc: 'Makes beginner mistakes, fun for casual players', badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    { id: 'easy', name: 'Easy', elo: '900 ELO', desc: 'Plays solid basics, occasional inaccuracies', badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { id: 'medium', name: 'Medium', elo: '1400 ELO', desc: 'Tactical awareness and center control', badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { id: 'hard', name: 'Hard', elo: '1750 ELO', desc: 'Sharp calculation with capture search', badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
    { id: 'expert', name: 'Expert', elo: '2000+ ELO', desc: 'Deep positional foresight & king safety', badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Play vs Intelligent Bot</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose your side and bot intelligence level</p>
        </div>
      </div>

      {/* 1. Color Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          I want to play as:
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'white' as PlayerColorPreference, label: 'White', piece: <ChessPiece type="k" color="w" className="w-8 h-8" /> },
            { id: 'black' as PlayerColorPreference, label: 'Black', piece: <ChessPiece type="k" color="b" className="w-8 h-8" /> },
            { id: 'random' as PlayerColorPreference, label: 'Random', piece: <Sparkles className="w-6 h-6 text-amber-500" /> },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onColorChange(item.id)}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                color === item.id
                  ? 'border-[#5722AF] bg-purple-50/60 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 ring-2 ring-[#5722AF]/30 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center">{item.piece}</div>
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Difficulty Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Bot Difficulty Level:
        </label>
        <div className="space-y-2">
          {difficulties.map((diff) => (
            <div
              key={diff.id}
              onClick={() => onDifficultyChange(diff.id)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                difficulty === diff.id
                  ? 'border-[#5722AF] bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-[#5722AF]/30 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">{diff.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff.badgeColor}`}>
                    {diff.elo}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{diff.desc}</p>
              </div>

              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  difficulty === diff.id ? 'border-[#5722AF] bg-[#5722AF]' : 'border-zinc-400'
                }`}
              >
                {difficulty === diff.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        type="button"
        onClick={onStartGame}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#682BC9] hover:to-[#8C52FF] text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>Start Game vs Bot</span>
      </button>
    </div>
  );
}
