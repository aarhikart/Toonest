'use client';

import React from 'react';
import {
  History,
  Trash2,
  X,
  FileVideo,
  Globe,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { VideoHistoryItem } from '@/lib/ai-video/types';

interface DetectorHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  items: VideoHistoryItem[];
  onClearHistory: () => void;
}

export const DetectorHistory: React.FC<DetectorHistoryProps> = ({
  isOpen,
  onClose,
  items,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getVerdictBadge = (verdict: VideoHistoryItem['verdict'], conf: number) => {
    switch (verdict) {
      case 'likely_ai':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
            Likely AI ({conf}%)
          </span>
        );
      case 'likely_real':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
            Likely Real ({conf}%)
          </span>
        );
      case 'possibly_manipulated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
            Manipulated ({conf}%)
          </span>
        );
      case 'inconclusive':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Inconclusive
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Analysis History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saved locally on this device ({items.length})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close history drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No analysis history yet
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Videos you analyze will appear here for quick reference during your session.
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-purple-300 dark:hover:border-purple-800 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {item.isUrl ? (
                      <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    ) : (
                      <FileVideo className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  {getVerdictBadge(item.verdict, item.confidence)}
                  {item.duration && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {item.duration}s
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {items.length} records stored
            </span>
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
