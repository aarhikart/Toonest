'use client';

import React, { useState } from 'react';
import { Users, Sparkles, Trash2, CheckCircle2, UserCheck, X, RefreshCw } from 'lucide-react';

interface QueueManagerCardProps {
  usernames: string[];
  onChangeUsernames: (users: string[]) => void;
  rawInput: string;
  onChangeRawInput: (val: string) => void;
  onCleanUsernames: () => void;
  onLoadSample: () => void;
  onClearAll: () => void;
  onRemoveUser: (username: string) => void;
  disabled?: boolean;
}

export function QueueManagerCard({
  usernames,
  onChangeUsernames,
  rawInput,
  onChangeRawInput,
  onCleanUsernames,
  onLoadSample,
  onClearAll,
  onRemoveUser,
  disabled = false,
}: QueueManagerCardProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'list'>('paste');

  return (
    <div className="bg-[#0f121d] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>Target Usernames Queue</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                {usernames.length} Users
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500">Paste usernames one per line or comma-separated</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#161b2b] border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'paste'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Queue ({usernames.length})
          </button>
        </div>
      </div>

      {/* Main Body */}
      {activeTab === 'paste' ? (
        <div className="flex-1 flex flex-col space-y-3">
          <div className="relative flex-1">
            <textarea
              value={rawInput}
              onChange={(e) => onChangeRawInput(e.target.value)}
              disabled={disabled}
              placeholder="capcut_update&#10;_m.anav_&#10;hariicharanlreddy&#10;13_piyush&#10;sincedec1996&#10;lazy_leo_456"
              rows={8}
              className="w-full h-full min-h-[180px] p-4 rounded-2xl font-mono text-xs bg-[#090b12] border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onLoadSample}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Users
              </button>
              {usernames.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onCleanUsernames}
              disabled={disabled || !rawInput.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Format & Clean Queue
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-2">
          <div className="flex-1 overflow-y-auto max-h-[220px] rounded-2xl bg-[#090b12] border border-zinc-800 p-2 divide-y divide-zinc-800/60">
            {usernames.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500">
                Queue is empty. Switch to "Paste Text" to add target usernames.
              </div>
            ) : (
              usernames.map((u, i) => (
                <div
                  key={u + i}
                  className="flex items-center justify-between py-1.5 px-2.5 hover:bg-[#131b2e] rounded-lg group transition-colors text-xs"
                >
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] text-zinc-600 w-5">#{i + 1}</span>
                    <span className="text-purple-300 font-semibold">@{u}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveUser(u)}
                    disabled={disabled}
                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Remove user"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 px-1 pt-1">
            <span>{usernames.length} total users in queue</span>
            <button
              type="button"
              onClick={onClearAll}
              disabled={disabled || usernames.length === 0}
              className="text-red-400 hover:underline cursor-pointer"
            >
              Clear Entire Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
