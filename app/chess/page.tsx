'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { ChessSetup } from '@/components/chess/ChessSetup';
import { ChessGame } from '@/components/chess/ChessGame';
import {
  ChessColor,
  ChessDifficulty,
  PlayerColorPreference,
  TimeControl,
} from '@/lib/chess/types';
import { Crown, Sparkles, Shield, Cpu } from 'lucide-react';

export default function ChessPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeBotGame, setActiveBotGame] = useState<{
    color: ChessColor;
    difficulty: ChessDifficulty;
  } | null>(null);

  const handleStartBotGame = ({
    color,
    difficulty,
  }: {
    color: PlayerColorPreference;
    difficulty: ChessDifficulty;
  }) => {
    let chosenColor: ChessColor = 'white';
    if (color === 'random') {
      chosenColor = Math.random() < 0.5 ? 'white' : 'black';
    } else {
      chosenColor = color;
    }

    setActiveBotGame({
      color: chosenColor,
      difficulty,
    });
  };

  const handleCreateFriendGame = async ({
    color,
    timeControl,
  }: {
    color: PlayerColorPreference;
    timeControl: TimeControl;
  }): Promise<string | null> => {
    try {
      const res = await fetch('/api/chess/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorColor: color,
          timeControl,
          creatorName: 'Host Player',
        }),
      });

      const data = await res.json();
      if (data.success && data.gameId) {
        // Store creator token in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`chess_token_${data.gameId}`, data.playerToken);
        }
        return data.gameId;
      }
      return null;
    } catch (e) {
      console.error('Failed to create friend game:', e);
      return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Header */}
      <Header
        activeToolName="Chess"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeToolId="chess"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {!activeBotGame ? (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#B68BFF] text-xs font-bold border border-[#5722AF]/20 shadow-xs">
                <Crown className="w-4 h-4" />
                <span>Classic Grandmaster Chess</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Play Chess Online &amp; AI
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Play against smart, adaptive computer bots or invite a friend with an instant, zero-lag shareable room link.
              </p>
            </div>

            {/* Setup Hub Component */}
            <ChessSetup
              onStartBotGame={handleStartBotGame}
              onCreateFriendGame={handleCreateFriendGame}
            />

            {/* Feature Highlights Card */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/80">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">5 Smart AI Levels</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  From 400 ELO beginner blunders to 2000+ tactical foresight with quiescence capture analysis.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Server Validated</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Authoritative rules with chess.js. Castling, en passant, promotions, checks, and timers are verified.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Visual Move Guidance</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Subtle indicators for legal moves, captures, last move traces, and King-in-check warnings.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Bot Game Arena */
          <ChessGame
            mode="bot"
            botDifficulty={activeBotGame.difficulty}
            userAssignedColor={activeBotGame.color}
            onExitToMenu={() => setActiveBotGame(null)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
