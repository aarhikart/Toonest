'use client';

import React from 'react';
import { History, Trash2, Download, ExternalLink, Film } from 'lucide-react';
import { SavedReelItem } from '@/lib/instagram/types';

interface RecentReelsHistoryProps {
  history: SavedReelItem[];
  onSelectReel: (url: string) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
}

export function RecentReelsHistory({
  history,
  onSelectReel,
  onRemoveItem,
  onClearHistory,
}: RecentReelsHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Recent Downloads ({history.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-center justify-between gap-3 group hover:border-[#5722AF]/50 transition-all"
          >
            {/* Thumbnail */}
            <div className="w-12 h-14 rounded-lg bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.caption || 'Reel thumbnail'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Film className="w-5 h-5 text-zinc-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                {item.creator ? `@${item.creator}` : 'Instagram Reel'}
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                {new Date(item.downloadedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectReel(item.url)}
                title="Download again"
                className="p-1.5 rounded-lg bg-[#5722AF] text-white hover:bg-[#491B93] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                title="Remove from history"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
