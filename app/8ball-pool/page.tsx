'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { PoolGame } from '@/components/pool/PoolGame';
import { FriendGameSetup } from '@/components/pool/FriendGameSetup';
import { GameMode, BotDifficulty } from '@/lib/pool/types';
import {
  Users,
  Bot,
  Play,
  Sparkles,
  Trophy,
  Shield,
  CircleDot,
  Zap,
} from 'lucide-react';

export default function EightBallPoolPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active game session
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);

  // Start Bot Game
  const handleStartBot = (diff: BotDifficulty) => {
    setBotDifficulty(diff);
    setActiveMode('bot');
  };

  // Start Practice
  const handleStartPractice = () => {
    setActiveMode('practice');
  };

  // Create Friend Game
  const handleCreateFriendGame = async (
    creatorName: string,
    timeControl: number
  ): Promise<string | null> => {
    try {
      const res = await fetch('/api/pool/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorName, timeControl }),
      });
      const data = await res.json();
      if (data.success && data.gameId) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`pool_token_${data.gameId}`, data.playerToken);
        }
        return data.gameId;
      }
      return null;
    } catch (e) {
      console.error('Failed to create pool room:', e);
      return null;
    }
  };

  const handleJoinFriendGame = (gameId: string) => {
    router.push(`/8ball-pool/game/${gameId}`);
  };

  // If a game is currently playing, render the full pool game screen
  if (activeMode) {
    return (
      <PoolGame
        mode={activeMode}
        botDifficulty={botDifficulty}
        onExitToMenu={() => setActiveMode(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenHelp={() => {}}
        activeToolName="8 Ball Pool Multiplayer"
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="8ball-pool"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-slate-800 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Live Real-Time Multiplayer • Realistic Billiards Physics
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                8 Ball Pool Multiplayer
              </h1>
              <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                Play classic 8-Ball billiards with authentic cushion bounces, spin control,
                aim guidelines, and seamless real-time multiplayer room links.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsFriendModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <Users className="w-5 h-5 fill-current" />
                Play with a Friend
              </button>
            </div>
          </div>
        </div>

        {/* Game Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Play with a Friend (Online Room) */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-cyan-500/40 transition-all shadow-xl group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Play with a Friend
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create a private room, copy your invite link, and play in real-time with
                sub-second physics synchronization over Server-Sent Events.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFriendModalOpen(true)}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <Users className="w-4 h-4" />
              Create / Join Room
            </button>
          </div>

          {/* 2. Play vs AI Bot (Vivid Reindeer) */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-amber-500/40 transition-all shadow-xl group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                Play vs AI Bot
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Challenge <strong>Vivid Reindeer</strong> with automatic angle raycasting,
                pocket targeting, and adjustable skill levels.
              </p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setBotDifficulty(d)}
                    className={`py-1.5 rounded-lg font-bold capitalize transition-all ${
                      botDifficulty === d
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleStartBot(botDifficulty)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                Play vs AI
              </button>
            </div>
          </div>

          {/* 3. Pass & Play / Practice Sandbox */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition-all shadow-xl group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CircleDot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                Pass & Play / Solo
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practice bank shots, kick shots, ball-in-hand drills, or play locally on the
                same screen with no timers or limits.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartPractice}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 border border-slate-700"
            >
              <Zap className="w-4 h-4" />
              Start Solo Practice
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-cyan-400">⚡ Sub-Step Physics</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              10 sub-steps per frame guarantee smooth elastic ball collisions and cushion bounces with zero tunneling.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-amber-400">🎯 Aiming & Ghost Ball</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visual collision preview with red ghost ball outline and target deflection line.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-purple-400">🎱 Cue English & Spin</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full cue ball spin selector with topspin (follow), backspin (draw), and side english control.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-emerald-400">🔊 Synthesized Web Audio</span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crisp cue strike, ceramic ball clacks, rubber rail bounces, and hollow pocket drop sounds.
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {/* Friend Game Setup Modal */}
      <FriendGameSetup
        isOpen={isFriendModalOpen}
        onClose={() => setIsFriendModalOpen(false)}
        onCreateGame={handleCreateFriendGame}
        onJoinGame={handleJoinFriendGame}
      />
    </div>
  );
}
