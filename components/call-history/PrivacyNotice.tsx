import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export function PrivacyNotice() {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 text-purple-900 dark:text-purple-200">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#5722AF] text-white flex items-center justify-center shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Privacy & Local Processing Guarantee
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <Lock className="w-3 h-3" />
              100% Client-Side
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-xs sm:text-[13px]">
            This tool analyzes call-history data that you provide or access through an authorized account.
            It cannot retrieve another person&apos;s private call history from their phone number alone.
            <strong className="text-zinc-900 dark:text-zinc-200 font-semibold ml-1">
              Your call records are processed strictly locally in your browser.
            </strong>
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
            <span className="flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5 text-emerald-500" />
              No data sent to any remote server
            </span>
            <span>•</span>
            <span>No telecom credentials stored</span>
            <span>•</span>
            <span>Records erased when tab is closed or cleared</span>
          </div>
        </div>
      </div>
    </div>
  );
}
