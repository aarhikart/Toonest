'use client';

import React, { useState } from 'react';
import { Copy, Check, Users, Sparkles, Clock, ArrowRight } from 'lucide-react';

interface FriendGameSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGame: (creatorName: string, timeControl: number) => Promise<string | null>;
  onJoinGame: (gameId: string) => void;
}

export function FriendGameSetup({
  isOpen,
  onClose,
  onCreateGame,
  onJoinGame,
}: FriendGameSetupProps) {
  const [creatorName, setCreatorName] = useState('Interactive Fiddler');
  const [timeControl, setTimeControl] = useState(30); // 30s per turn default
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [joinInputId, setJoinInputId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setIsCreating(true);
    const gid = await onCreateGame(creatorName, timeControl);
    setIsCreating(false);
    if (gid) {
      setCreatedGameId(gid);
    }
  };

  const shareableUrl =
    typeof window !== 'undefined' && createdGameId
      ? `${window.location.origin}/8ball-pool/game/${createdGameId}`
      : '';

  const handleCopy = async () => {
    if (!shareableUrl) return;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold">Play with a Friend</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {!createdGameId ? (
          <div className="space-y-5 py-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Your Player Name</label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="Interactive Fiddler"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Turn Shot Clock
              </label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: '30 Seconds', val: 30 },
                  { label: '60 Seconds', val: 60 },
                  { label: 'Unlimited', val: 0 },
                ].map((tc) => (
                  <button
                    key={tc.val}
                    type="button"
                    onClick={() => setTimeControl(tc.val)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      timeControl === tc.val
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isCreating ? 'Creating Room...' : 'Create Private Game Room'}
            </button>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-400">Or Join Friend by Room ID</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={joinInputId}
                  onChange={(e) => setJoinInputId(e.target.value)}
                  placeholder="e.g. p_9a4f21bc"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => joinInputId.trim() && onJoinGame(joinInputId.trim())}
                  disabled={!joinInputId.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors disabled:opacity-40"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-2">
              <div className="inline-flex p-2 rounded-full bg-cyan-500/20 text-cyan-300">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Room Created!</h4>
              <p className="text-xs text-slate-300">
                Share this invite link with your friend. When they open it, you will play live in real-time!
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 bg-transparent text-xs text-slate-300 px-2 outline-none font-mono truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => onJoinGame(createdGameId)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              Enter Game Room
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
