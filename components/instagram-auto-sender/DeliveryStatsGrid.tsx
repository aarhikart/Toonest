'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Zap, Users, Activity } from 'lucide-react';

interface DeliveryStatsGridProps {
  total: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
}

export function DeliveryStatsGrid({
  total,
  sentCount,
  skippedCount,
  failedCount,
  status,
}: DeliveryStatsGridProps) {
  const processed = sentCount + skippedCount + failedCount;
  const remaining = Math.max(0, total - processed);
  const successPct = total > 0 ? Math.min(100, Math.round((sentCount / total) * 100)) : 0;
  const progressPct = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

  return (
    <div className="bg-[#0f121d] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Live Delivery Performance</h3>
            <p className="text-[11px] text-zinc-500">Real-time status of 100% verified deliveries & skips</p>
          </div>
        </div>

        {/* Live indicator badge */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status === 'running'
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                : status === 'completed'
                ? 'bg-emerald-500'
                : 'bg-zinc-600'
            }`}
          />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            {status}
          </span>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total in Queue */}
        <div className="p-4 rounded-2xl bg-[#090b12] border border-zinc-800 text-center relative overflow-hidden">
          <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-100">{total}</div>
          <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <Users className="w-3 h-3 text-zinc-500" />
            Total Queue
          </div>
        </div>

        {/* 100% Sent */}
        <div className="p-4 rounded-2xl bg-[#090b12] border border-emerald-950/60 text-center relative overflow-hidden">
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">{sentCount}</div>
          <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            100% Sent
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">{successPct}% rate</div>
        </div>

        {/* Skipped */}
        <div className="p-4 rounded-2xl bg-[#090b12] border border-amber-950/60 text-center relative overflow-hidden">
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{skippedCount}</div>
          <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Skipped / Private
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">&lt;500ms skip</div>
        </div>

        {/* Remaining */}
        <div className="p-4 rounded-2xl bg-[#090b12] border border-cyan-950/60 text-center relative overflow-hidden">
          <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">{remaining}</div>
          <div className="text-[11px] font-bold text-cyan-500 uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            Remaining
          </div>
          <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">{progressPct}% complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-zinc-400">Queue Processing Progress</span>
          <span className="text-purple-400 font-mono font-bold">{progressPct}% ({processed}/{total})</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#090b12] border border-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
