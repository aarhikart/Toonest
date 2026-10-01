'use client';

import React from 'react';
import { User, Settings } from 'lucide-react';

interface ChessClockProps {
  timeRemainingMs: number;
  isActive: boolean;
  isUnlimited?: boolean;
  playerName?: string;
  rating?: string | number;
  flag?: string;
  hasSignalBars?: boolean;
  isOpponent?: boolean;
  avatarInitial?: string;
  avatarColor?: string;
  isWhite?: boolean;
  onSettingsClick?: () => void;
}

export function ChessClock({
  timeRemainingMs,
  isActive,
  isUnlimited = false,
  playerName = 'Player',
  rating,
  flag,
  hasSignalBars = false,
  isOpponent = false,
  avatarInitial = 'H',
  avatarColor = 'bg-[#8035ea]',
  isWhite = true,
  onSettingsClick,
}: ChessClockProps) {
  const totalSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isLowTime = !isUnlimited && totalSeconds < 30;

  const formattedTime = isUnlimited ? '∞' : `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="flex items-center justify-between w-full px-1 py-1.5 select-none">
      {/* Left: Avatar and Identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        {isOpponent ? (
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border"
            style={{ backgroundColor: '#21201d', borderColor: '#383531' }}
          >
            <User className="w-5 h-5 text-[#8b8987]" />
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center font-bold text-base text-white shadow-xs shrink-0"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {avatarInitial}
          </div>
        )}

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-semibold text-white truncate max-w-[140px] sm:max-w-[180px]">
            {playerName}
          </span>
          {rating !== undefined && (
            <span className="text-sm font-normal text-zinc-400 shrink-0">
              ({rating})
            </span>
          )}
          {flag && <span className="text-base shrink-0">{flag}</span>}
          {hasSignalBars && (
            <div className="flex items-end gap-0.5 h-3 shrink-0 ml-0.5">
              <div className="w-0.5 h-1.5 bg-zinc-400 rounded-xs" />
              <div className="w-0.5 h-2 bg-zinc-400 rounded-xs" />
              <div className="w-0.5 h-2.5 bg-zinc-400 rounded-xs" />
              <div className="w-0.5 h-3 bg-zinc-400 rounded-xs" />
            </div>
          )}
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active turn" />
          )}
        </div>
      </div>

      {/* Right: Digital Pill Timer Clock & Optional Settings Cog */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="flex items-center justify-center min-w-[76px] sm:min-w-[84px] px-3 py-1 rounded-sm font-mono font-bold text-base sm:text-lg tracking-wider transition-colors shadow-xs"
          style={{
            backgroundColor: isLowTime ? '#450a0a' : isActive ? '#54524f' : isOpponent ? '#21201d' : '#383633',
            color: isLowTime ? '#fca5a5' : isActive ? '#ffffff' : isOpponent ? '#bab7b3' : '#e4e4e7',
            border: isActive ? '1px solid #71717a' : isOpponent ? '1px solid #33312e' : 'none',
          }}
        >
          <span>{formattedTime}</span>
        </div>

        {isOpponent && onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            className="text-[#8b8987] hover:text-white transition-colors p-1 cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
