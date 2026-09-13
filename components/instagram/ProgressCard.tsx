'use client';

import React from 'react';
import { CampaignStats } from '@/lib/instagram/types';
import { CheckCircle2, Clock, SkipForward, AlertTriangle, BarChart3 } from 'lucide-react';

interface ProgressCardProps {
  stats: CampaignStats;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ stats }) => {
  const completed = stats.sent + stats.skipped + stats.invalid;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Messaging Progress
          </h3>
        </div>
        <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span className="font-bold text-[#5722AF] dark:text-[#9B6BE8]">{completed}</span>
          <span className="text-slate-400"> / {stats.total} completed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, stats.percentage))}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span>{stats.total > 0 ? `${stats.percentage}% processed` : 'No users imported yet'}</span>
          <span>{stats.pending} pending</span>
        </div>
      </div>

      {/* Stats Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Sent */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Sent</div>
            <div className="text-lg font-extrabold text-emerald-900 dark:text-emerald-100 leading-tight">
              {stats.sent}
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-[#5722AF] dark:text-purple-300 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300">Pending</div>
            <div className="text-lg font-extrabold text-purple-900 dark:text-purple-100 leading-tight">
              {stats.pending}
            </div>
          </div>
        </div>

        {/* Skipped */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
            <SkipForward className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Skipped</div>
            <div className="text-lg font-extrabold text-amber-900 dark:text-amber-100 leading-tight">
              {stats.skipped}
            </div>
          </div>
        </div>

        {/* Invalid */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300">Invalid</div>
            <div className="text-lg font-extrabold text-rose-900 dark:text-rose-100 leading-tight">
              {stats.invalid}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
