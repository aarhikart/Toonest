'use client';

import React from 'react';
import { ShieldCheck, Info, Lock } from 'lucide-react';

export const SafetyNotice: React.FC = () => {
  return (
    <div className="rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 p-4 sm:p-5">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <span>Client-Side Privacy & Manual Messaging Notice</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Lock className="w-3 h-3" />
              100% In-Browser
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Use this assistant only for accounts and messages you are authorized to contact. Respect Instagram&apos;s community rules, spam policies, and recipient preferences.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400 text-xs pt-0.5">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              Never asks for your Instagram password, cookies, or session tokens.
            </span>
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              Does not automatically send messages — all sending remains strictly manual.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
