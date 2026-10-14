'use client';

import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { PlayerInfo, BallState, PlayerGroup } from '@/lib/pool/types';
import { BALL_COLORS } from '@/lib/pool/constants';

interface TopBarProps {
  player1: PlayerInfo;
  player2: PlayerInfo;
  currentTurn: 'player1' | 'player2';
  timerSeconds: number;
  balls: BallState[];
  onBack?: () => void;
  onOpenSettings?: () => void;
}

export function TopBar({
  player1,
  player2,
  currentTurn,
  timerSeconds,
  balls,
  onBack,
  onOpenSettings,
}: TopBarProps) {
  // Format MM:SS
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const timeFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  // Helper to render remaining ball icons for a group (solids or stripes)
  const renderBallRack = (group: PlayerGroup, defaultType: 'stripes' | 'solids') => {
    const isStripes = group === 'stripes' || (group === 'unassigned' && defaultType === 'stripes');
    const ballRange = isStripes ? [9, 11, 12, 13, 14, 15] : [7, 6, 4, 1, 2, 3, 5];

    return (
      <div className="flex items-center gap-1.5">
        {ballRange.map((num) => {
          const ball = balls.find((b) => b.number === num);
          const isPocketed = ball?.isPocketed || false;
          const color = BALL_COLORS[num];
          const isStripe = num >= 9;

          if (isPocketed) {
            // Empty / pocketed slot (dark circle matching screenshot)
            return (
              <div
                key={num}
                className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700/60 shadow-inner flex items-center justify-center opacity-40"
              />
            );
          }

          return (
            <div
              key={num}
              className="relative w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shadow-md shrink-0"
              style={{
                backgroundColor: isStripe ? '#f8fafc' : color,
                color: '#09090b',
                boxShadow: 'inset -1px -1px 2px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.6)',
              }}
              title={`Ball ${num}`}
            >
              {isStripe && (
                <div
                  className="absolute inset-x-0 h-2 pointer-events-none"
                  style={{
                    backgroundColor: color,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}
              <span className="relative z-10">{num}</span>
            </div>
          );
        })}

        {/* 8-Ball indicator at end of rack */}
        {(() => {
          const eightBall = balls.find((b) => b.number === 8);
          const isEightPocketed = eightBall?.isPocketed || false;
          return (
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shadow-md shrink-0 ${
                isEightPocketed
                  ? 'bg-slate-900 border border-slate-700 opacity-40'
                  : 'bg-black text-white border border-slate-700'
              }`}
              title="8-Ball"
            >
              8
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="w-full flex items-center justify-between px-2 sm:px-4 py-2 select-none text-white">
      {/* Left Back Arrow and Settings Gear */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-100 transition-colors"
          title="Back to Lobby"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-100 transition-colors"
          title="Game Settings"
        >
          <Settings className="w-6 h-6 stroke-[2]" />
        </button>
      </div>

      {/* Center Match Hub (Player 1 + Timer + Player 2) */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Player 1 (You) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              (You) {player1.name || 'Interactive Fiddler'}
            </span>
            <div className="mt-1">
              {renderBallRack(player1.group, 'stripes')}
            </div>
          </div>

          {/* Player 1 Avatar (square cartoon box character) */}
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#c28859] border-2 overflow-hidden flex flex-col items-center justify-center shadow-lg transition-all ${
              currentTurn === 'player1'
                ? 'border-white ring-4 ring-white/30 scale-105'
                : 'border-slate-700 opacity-80'
            }`}
          >
            {/* Cartoon Face 1 (Thick eyebrows, gritting teeth) */}
            <div className="w-full h-full flex flex-col items-center justify-center p-1 relative">
              {/* Eyebrows */}
              <div className="flex gap-1 mb-0.5">
                <div className="w-3 h-1 bg-black rounded-sm rotate-6" />
                <div className="w-3 h-1 bg-black rounded-sm -rotate-6" />
              </div>
              {/* Eyes */}
              <div className="flex gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
              {/* Teeth */}
              <div className="w-4 h-1.5 bg-white border border-black rounded-sm" />
            </div>
          </div>
        </div>

        {/* Center Countdown Timer Box (0:27 in gold/yellow rounded rectangle) */}
        <div className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl bg-[#171923] border-2 border-amber-500/80 shadow-lg shadow-amber-900/30 flex items-center justify-center">
          <span className="text-base sm:text-xl font-mono font-black text-amber-400 tracking-wider drop-shadow">
            {timeFormatted}
          </span>
        </div>

        {/* Player 2 (Opponent / Bot) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Player 2 Avatar (square cartoon box character with glowing white border if turn) */}
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#78350f] border-2 overflow-hidden flex flex-col items-center justify-center shadow-lg transition-all ${
              currentTurn === 'player2'
                ? 'border-white ring-4 ring-white/40 scale-105'
                : 'border-slate-700 opacity-80'
            }`}
          >
            {/* Cartoon Face 2 (Smirking brown character exact match to screenshot) */}
            <div className="w-full h-full flex flex-col items-center justify-center p-1 relative">
              {/* Slanted Eyebrows */}
              <div className="flex gap-1 mb-0.5">
                <div className="w-3 h-1 bg-black rounded-sm -rotate-12" />
                <div className="w-3 h-1 bg-black rounded-sm rotate-12" />
              </div>
              {/* Eyes */}
              <div className="flex gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                <div className="w-1.5 h-1.5 bg-black rounded-full" />
              </div>
              {/* Smirk */}
              <div className="w-3 h-1 bg-black rounded-full rotate-6" />
            </div>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {player2.name || 'Vivid Reindeer'}
            </span>
            <div className="mt-1">
              {renderBallRack(player2.group, 'solids')}
            </div>
          </div>
        </div>
      </div>

      <div className="w-8" />
    </div>
  );
}
