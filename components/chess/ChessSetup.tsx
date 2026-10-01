'use client';

import React, { useState } from 'react';
import { GameMode, ChessColor, ChessDifficulty, PlayerColorPreference, TimeControl } from '@/lib/chess/types';
import { BotSetup } from './BotSetup';
import { FriendGameSetup } from './FriendGameSetup';
import { Bot, Users } from 'lucide-react';

interface ChessSetupProps {
  onStartBotGame: (params: { color: PlayerColorPreference; difficulty: ChessDifficulty }) => void;
  onCreateFriendGame: (params: { color: PlayerColorPreference; timeControl: TimeControl }) => Promise<string | null>;
}

export function ChessSetup({ onStartBotGame, onCreateFriendGame }: ChessSetupProps) {
  const [mode, setMode] = useState<GameMode>('bot');
  const [botColor, setBotColor] = useState<PlayerColorPreference>('white');
  const [botDifficulty, setBotDifficulty] = useState<ChessDifficulty>('medium');

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex p-1.5 rounded-2xl bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-300/60 dark:border-zinc-700/60 shadow-xs">
        <button
          type="button"
          onClick={() => setMode('bot')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'bot'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Bot className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Play vs Bot</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('friend')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === 'friend'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Play With Friend</span>
        </button>
      </div>

      {mode === 'bot' ? (
        <BotSetup
          color={botColor}
          difficulty={botDifficulty}
          onColorChange={setBotColor}
          onDifficultyChange={setBotDifficulty}
          onStartGame={() => onStartBotGame({ color: botColor, difficulty: botDifficulty })}
        />
      ) : (
        <FriendGameSetup onCreateGame={onCreateFriendGame} />
      )}
    </div>
  );
}
