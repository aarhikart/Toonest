'use client';

import React from 'react';
import { VideoSignal } from '@/lib/ai-video/types';
import { Play, Clock, AlertTriangle } from 'lucide-react';

interface EvidenceTimelineProps {
  duration: number; // in seconds
  signals: VideoSignal[];
  currentTime?: number;
  onSeek: (seconds: number) => void;
}

export function EvidenceTimeline({
  duration,
  signals,
  onSeek,
}: EvidenceTimelineProps) {
  const timestampedSignals = signals.filter(
    (s) => typeof s.timestamp === 'number' && s.timestamp >= 0
  );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
          <Clock className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Timeline Evidence Markers</span>
        </div>
        <span className="text-[11px] text-zinc-400">
          Click any marker to seek video
        </span>
      </div>

      {timestampedSignals.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 py-2">
          No localized timestamp markers reported for this video segment.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Timeline Bar with Dots */}
          <div className="relative w-full h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full my-3">
            {timestampedSignals.map((sig, idx) => {
              const pct = duration > 0 ? ((sig.timestamp || 0) / duration) * 100 : 0;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSeek(sig.timestamp || 0)}
                  style={{ left: `${Math.min(96, Math.max(2, pct))}%` }}
                  title={`${formatTime(sig.timestamp || 0)}: ${sig.description}`}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 border-2 border-white dark:border-zinc-900 hover:scale-125 transition-transform cursor-pointer shadow-sm"
                />
              );
            })}
          </div>

          {/* List of Clickable Evidence Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {timestampedSignals.map((sig, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSeek(sig.timestamp || 0)}
                className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#5722AF] transition-all text-left flex items-start gap-2 text-xs group cursor-pointer"
              >
                <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-1 shrink-0 group-hover:bg-[#5722AF] group-hover:text-white transition-colors">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  {formatTime(sig.timestamp || 0)}
                </span>
                <span className="text-zinc-700 dark:text-zinc-300 line-clamp-1">
                  {sig.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
