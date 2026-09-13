'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function LegalResponsibleNotice() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 text-zinc-600 dark:text-zinc-400 text-xs flex items-start gap-3 leading-relaxed">
      <ShieldAlert className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
      <div className="space-y-1">
        <span className="font-bold text-zinc-900 dark:text-white block">
          Responsible Use Notice
        </span>
        <p>
          Please download only Reels that you own or have explicit permission to save.
          Always respect intellectual property rights, creator copyrights, and
          Instagram&apos;s Terms of Service. This tool is intended solely for personal backup,
          fair use, and offline review of authorized media.
        </p>
      </div>
    </div>
  );
}
