'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { PoolGame } from '@/components/pool/PoolGame';
import { PoolGameDoc, PlayerRole } from '@/lib/pool/types';
import { Copy, Check, Users, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function PoolMultiplayerRoomPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = typeof params?.gameId === 'string' ? params.gameId : '';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<PoolGameDoc | null>(null);
  const [playerRole, setPlayerRole] = useState<PlayerRole>('spectator');
  const [playerToken, setPlayerToken] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!gameId) return;

    let storedToken = '';
    if (typeof window !== 'undefined') {
      storedToken = localStorage.getItem(`pool_token_${gameId}`) || '';
    }

    const fetchGame = async () => {
      try {
        const query = storedToken ? `?token=${encodeURIComponent(storedToken)}` : '';
        const res = await fetch(`/api/pool/${gameId}${query}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || 'Pool game room not found or expired.');
          setLoading(false);
          return;
        }

        setGame(data.game);
        setPlayerRole(data.playerRole);

        const finalToken = data.newToken || storedToken;
        if (finalToken) {
          setPlayerToken(finalToken);
          localStorage.setItem(`pool_token_${gameId}`, finalToken);
        }
      } catch (err: any) {
        setError(err?.message || 'Network error connecting to pool room.');
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
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col items-center justify-center p-4 space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Connecting to 8-Ball Pool Room...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Room Error</h2>
          <p className="text-sm text-slate-400">{error || 'Unable to join pool room.'}</p>
          <button
            type="button"
            onClick={() => router.push('/8ball-pool')}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors"
          >
            Back to Pool Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#07090f] text-slate-100 flex flex-col">
      {/* Top Invite Banner if waiting for Player 2 */}
      {game.status === 'waiting' && playerRole === 'player1' && (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-cyan-500/30 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-slate-200">
              Waiting for opponent to join room <code className="text-cyan-400 font-mono">#{gameId}</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Link Copied!' : 'Copy Invite Link'}
            </button>
          </div>
        </div>
      )}

      {/* Main Pool Game Component */}
      <PoolGame
        mode="friend"
        gameId={gameId}
        playerToken={playerToken}
        initialGame={game}
        multiplayerRole={playerRole}
        onExitToMenu={() => router.push('/8ball-pool')}
      />
    </div>
  );
}
