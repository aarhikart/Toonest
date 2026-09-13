'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, BookOpen } from 'lucide-react';

export function AnalysisLimitations() {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-700 dark:text-zinc-300 space-y-3.5">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Important Limitations & Responsible Use</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
        <div className="space-y-1.5">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Detection is Probabilistic</span>
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400">
            Automated synthetic media classifiers estimate statistical likelihood based on training data. Novel diffusion generators, video compression (H.264/HEVC), camera motion blur, and creative color grading can produce false positives or false negatives.
          </p>
        </div>

        <div className="space-y-1.5">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Responsible Use Advisory</span>
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400">
            Results should <strong>never</strong> be used as the sole basis for accusations, legal proceedings, employment actions, or disciplinary decisions. Always corroborate automated findings with verified provenance, digital signatures, and primary sources.
          </p>
        </div>
      </div>
    </div>
  );
}
