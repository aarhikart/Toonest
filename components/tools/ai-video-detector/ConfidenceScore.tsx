'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ConfidenceScoreProps {
  score: number; // 0 to 100
  verdict: 'likely_ai' | 'likely_real' | 'possibly_manipulated' | 'inconclusive';
}

export function ConfidenceScore({ score, verdict }: ConfidenceScoreProps) {
  const getColor = () => {
    switch (verdict) {
      case 'likely_ai':
        return 'from-purple-600 to-rose-600';
      case 'likely_real':
        return 'from-emerald-600 to-teal-500';
      case 'possibly_manipulated':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-zinc-500 to-zinc-400';
    }
  };

  return (
    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
          <span>Confidence Score:</span>
        </span>
        <span className="text-lg font-extrabold font-mono text-zinc-900 dark:text-white">
          {score}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
        />
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
        Confidence reflects the model&apos;s statistical signal strength, not an absolute guarantee of authenticity.
      </p>
    </div>
  );
}
