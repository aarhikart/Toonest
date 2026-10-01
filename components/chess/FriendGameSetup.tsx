'use client';

import React, { useState } from 'react';
import { PlayerColorPreference, TimeControl } from '@/lib/chess/types';
import { Users, Link as LinkIcon, Check, Copy, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { ChessPiece } from './ChessPiece';

interface FriendGameSetupProps {
  onCreateGame: (params: { color: PlayerColorPreference; timeControl: TimeControl }) => Promise<string | null>;
}

export function FriendGameSetup({ onCreateGame }: FriendGameSetupProps) {
  const [color, setColor] = useState<PlayerColorPreference>('random');
  const [timeControl, setTimeControl] = useState<TimeControl>(600); // 10 min default
  const [isCreating, setIsCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeOptions: Array<{ value: TimeControl; label: string }> = [
    { value: 0, label: 'No Timer' },
    { value: 60, label: '1 min' },
    { value: 180, label: '3 min' },
    { value: 300, label: '5 min' },
    { value: 600, label: '10 min' },
    { value: 900, label: '15 min' },
    { value: 1800, label: '30 min' },
  ];

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const gameId = await onCreateGame({ color, timeControl });
      if (gameId) {
        const fullUrl = `${window.location.origin}/chess/game/${gameId}`;
        setCreatedUrl(fullUrl);
      } else {
        setError('Failed to create game. Please try again.');
      }
    } catch (e: any) {
      setError(e?.message || 'Error creating game.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdUrl) return;
    try {
      await navigator.clipboard.writeText(createdUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Play With a Friend</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Create an invite link and share it with your friend to play online
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      {!createdUrl ? (
        <>
          {/* Color Preference */}
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
                  onClick={() => setColor(item.id)}
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

          {/* Time Control */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-[#5722AF]" />
              <span>Time Control:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeControl(opt.value)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    timeControl === opt.value
                      ? 'bg-[#5722AF] text-white border-[#5722AF] shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button
            type="button"
            disabled={isCreating}
            onClick={handleCreate}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
            <span>{isCreating ? 'Creating Game...' : 'Create Game'}</span>
          </button>
        </>
      ) : (
        /* Game Created State */
        <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-4 text-center animate-in fade-in">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Game Created!</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Share this link with your friend. The game will automatically start when they join:
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              readOnly
              value={createdUrl}
              className="flex-1 bg-transparent px-2 font-mono text-xs text-zinc-800 dark:text-zinc-200 outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <a
            href={createdUrl}
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#5722AF] hover:bg-[#682BC9] text-white font-bold text-xs shadow-md shadow-[#5722AF]/25 transition-all"
          >
            <span>Open Game Board</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
