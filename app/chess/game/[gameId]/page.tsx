'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { ChessGame } from '@/components/chess/ChessGame';
import { ChessGameDoc, ChessColor } from '@/lib/chess/types';
import { Copy, Check, Users, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function MultiplayerGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = typeof params?.gameId === 'string' ? params.gameId : '';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<ChessGameDoc | null>(null);
  const [playerColor, setPlayerColor] = useState<ChessColor | 'spectator'>('spectator');
  const [playerToken, setPlayerToken] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    let storedToken = '';
    if (typeof window !== 'undefined') {
      storedToken = localStorage.getItem(`chess_token_${gameId}`) || '';
    }

    const fetchGame = async () => {
      try {
        const query = storedToken ? `?token=${encodeURIComponent(storedToken)}` : '';
        const res = await fetch(`/api/chess/${gameId}${query}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || 'Game not found or has expired.');
          setLoading(false);
          return;
        }

        setGame(data.game);
        setPlayerColor(data.playerColor);

        // If server provided a new token, persist it
        const finalToken = data.newToken || storedToken;
        if (finalToken) {
          setPlayerToken(finalToken);
          localStorage.setItem(`chess_token_${gameId}`, finalToken);
        }
      } catch (err: any) {
        setError(err?.message || 'Network error loading game.');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Header
        activeToolName="Chess Multiplayer"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeToolId="chess"
        onOpenHelp={() => {
          setIsSidebarOpen(false);
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-[#5722AF] animate-spin" />
            <p className="text-sm font-semibold text-zinc-500">Connecting to Chess Room...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Unable to Load Game</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
            <button
              type="button"
              onClick={() => router.push('/chess')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5722AF] text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chess</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Share Link Banner when waiting */}
            {game?.status === 'waiting' && playerColor !== 'spectator' && (
              <div className="max-w-xl mx-auto p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3 shadow-lg">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400">
                  <Users className="w-4 h-4 animate-pulse" />
                  <span>Share this link with your friend to play:</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-800 p-2 rounded-xl border border-zinc-700">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="flex-1 bg-transparent px-2 font-mono text-xs text-zinc-200 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3.5 py-1.5 rounded-lg bg-[#5722AF] hover:bg-[#682BC9] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-xs"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  You are playing as <span className="font-bold text-white capitalize">{playerColor}</span>. You can make your move now!
                </p>
              </div>
            )}

            {/* Always Render Live Interactive Board */}
            <ChessGame
              mode="friend"
              gameId={gameId}
              playerToken={playerToken}
              initialMultiplayerGame={game}
              multiplayerColor={playerColor}
              onGameChange={(updated) => setGame(updated)}
              onExitToMenu={() => router.push('/chess')}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
