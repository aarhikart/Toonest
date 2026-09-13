'use client';

import React from 'react';
import { History, X, Trash2, ArrowUpRight, Clock } from 'lucide-react';
import { ConversionHistoryItem } from '@/lib/text/types';

interface TextHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: ConversionHistoryItem[];
  onLoadItem: (item: ConversionHistoryItem) => void;
  onClearHistory: () => void;
}

export function TextHistory({
  isOpen,
  onClose,
  history,
  onLoadItem,
  onClearHistory,
}: TextHistoryProps) {
  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h2
              id="history-modal-title"
              className="text-sm font-bold text-zinc-900 dark:text-white"
            >
              Recent Conversions ({history.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              aria-label="Close history modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-zinc-600 dark:text-zinc-400">No recent conversions</p>
              <p className="text-[11px]">Your conversions will be saved locally in this session.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onLoadItem(item);
                  onClose();
                }}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-[#5722AF]/50 dark:hover:border-[#5722AF]/50 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-[#5722AF] dark:text-[#9B6BE8]">
                    {item.mode}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500">
                    {formatTime(item.timestamp)} • {item.charCount} chars
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 font-mono truncate">
                  {item.outputPreview}
                </p>
                <div className="mt-1.5 flex items-center justify-end text-[11px] font-semibold text-[#5722AF] dark:text-[#9B6BE8] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-0.5">
                    Load into Converter <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
