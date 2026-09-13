'use client';

import React from 'react';
import { Check, X as XIcon, HelpCircle, Lock } from 'lucide-react';

export function SupportedUrlsCard() {
  return (
    <div className="w-full max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#12151c] shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          Supported Instagram Link Formats
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Supported */}
        <div className="p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            <span>Supported (Public Content)</span>
          </div>
          <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
            <li className="flex items-center gap-1.5 truncate">
              <span className="text-emerald-500">•</span>
              <span>instagram.com/reel/C123abcXYZ/</span>
            </li>
            <li className="flex items-center gap-1.5 truncate">
              <span className="text-emerald-500">•</span>
              <span>instagram.com/reels/C123abcXYZ/</span>
            </li>
            <li className="flex items-center gap-1.5 truncate">
              <span className="text-emerald-500">•</span>
              <span>instagram.com/p/C123abcXYZ/ (Video)</span>
            </li>
          </ul>
        </div>

        {/* Unsupported / Private */}
        <div className="p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
            <Lock className="w-4 h-4" />
            <span>Unsupported (Restricted / Private)</span>
          </div>
          <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400 text-[11px]">
            <li className="flex items-start gap-1.5">
              <XIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Private Instagram accounts and closed groups</span>
            </li>
            <li className="flex items-start gap-1.5">
              <XIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Ephemeral 24-hour Stories or Close Friends Reels</span>
            </li>
            <li className="flex items-start gap-1.5">
              <XIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Direct messages, drafts, or expired media</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
