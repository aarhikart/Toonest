'use client';

import React, { useEffect } from 'react';
import { DateTimeHistoryItem } from '@/lib/date-time/types';
import { History, Trash2, X, Clock, ArrowRight, Calendar } from 'lucide-react';

interface DateTimeHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  items: DateTimeHistoryItem[];
  onReuse: (item: DateTimeHistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const DateTimeHistory: React.FC<DateTimeHistoryProps> = ({
  isOpen,
  onClose,
  items,
  onReuse,
  onDelete,
  onClear,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTimeAgo = (ts: number) => {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Calculation History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stored locally on your device ({items.length})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No calculations yet
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Your calculations will automatically be stored here for convenient recall.
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-purple-300 dark:hover:border-purple-800 transition-all shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.title}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                </div>

                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {item.resultFormatted}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>{item.startFormatted}</span> → <span>{item.endFormatted}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => {
                      onReuse(item);
                      onClose();
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {items.length} records saved
            </span>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
