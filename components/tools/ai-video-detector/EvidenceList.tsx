'use client';

import React, { useState } from 'react';
import { VideoSignal } from '@/lib/ai-video/types';
import {
  Eye,
  Activity,
  Mic,
  FileCode,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';

interface EvidenceListProps {
  signals: VideoSignal[];
  onSelectTimestamp?: (seconds: number) => void;
}

export function EvidenceList({ signals, onSelectTimestamp }: EvidenceListProps) {
  const [filter, setFilter] = useState<'all' | 'visual' | 'temporal' | 'audio' | 'metadata'>('all');

  const filtered = signals.filter((s) => (filter === 'all' ? true : s.type === filter));

  const getIcon = (type: string) => {
    switch (type) {
      case 'visual':
        return <Eye className="w-3.5 h-3.5 text-purple-500" />;
      case 'temporal':
        return <Activity className="w-3.5 h-3.5 text-amber-500" />;
      case 'audio':
        return <Mic className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            HIGH SIGNAL
          </span>
        );
      case 'medium':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
            MODERATE
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            OBSERVATION
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {(['all', 'visual', 'temporal', 'audio', 'metadata'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === cat
                ? 'bg-[#5722AF] text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Signals List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-center">
            No specific signals recorded under this category.
          </div>
        ) : (
          filtered.map((sig, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white capitalize">
                  {getIcon(sig.type)}
                  <span>{sig.type} Signal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {typeof sig.timestamp === 'number' && (
                    <button
                      type="button"
                      onClick={() => onSelectTimestamp?.(sig.timestamp!)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors"
                      title="Seek to timestamp in video"
                    >
                      {Math.floor(sig.timestamp / 60)}:{String(sig.timestamp % 60).padStart(2, '0')}
                    </button>
                  )}
                  {getSeverityBadge(sig.severity)}
                </div>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {sig.description}
              </p>
              {sig.details && (
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                  {sig.details}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
