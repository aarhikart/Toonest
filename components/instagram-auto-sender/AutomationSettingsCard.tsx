'use client';

import React from 'react';
import { Sliders, Zap, Clock, ShieldCheck, Layers, Repeat } from 'lucide-react';

interface AutomationSettingsCardProps {
  concurrentTabs: number;
  onChangeConcurrentTabs: (tabs: number) => void;
  delaySec: number;
  onChangeDelaySec: (sec: number) => void;
  autoCloseTabs: boolean;
  onChangeAutoCloseTabs: (close: boolean) => void;
  skipPrivate: boolean;
  onChangeSkipPrivate: (skip: boolean) => void;
  maxLimit: number;
  onChangeMaxLimit: (limit: number) => void;
  disabled?: boolean;
}

export function AutomationSettingsCard({
  concurrentTabs,
  onChangeConcurrentTabs,
  delaySec,
  onChangeDelaySec,
  autoCloseTabs,
  onChangeAutoCloseTabs,
  skipPrivate,
  onChangeSkipPrivate,
  maxLimit,
  onChangeMaxLimit,
  disabled = false,
}: AutomationSettingsCardProps) {
  return (
    <div className="bg-[#0f121d] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Automation Speed & Tabs</h3>
            <p className="text-[11px] text-zinc-500">Configure multi-tab workers and safe delivery delays</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Concurrency Selector */}
        <div className="p-4 rounded-2xl bg-[#090b12] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Concurrent Tabs
            </span>
            <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800">
              {concurrentTabs} Tab(s)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { val: 1, label: '1 Tab', sub: 'Safe' },
              { val: 2, label: '2 Tabs', sub: 'Fast (Rec.)' },
              { val: 3, label: '3 Tabs', sub: 'Turbo' },
            ].map((tab) => (
              <button
                key={tab.val}
                type="button"
                onClick={() => onChangeConcurrentTabs(tab.val)}
                disabled={disabled}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                  concurrentTabs === tab.val
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                    : 'bg-[#131b2e] text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold">{tab.label}</div>
                <div className="text-[9px] opacity-75">{tab.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Delay Speed Selector */}
        <div className="p-4 rounded-2xl bg-[#090b12] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Cooldown Delay
            </span>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
              {delaySec}s delay
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { val: 1.5, label: '1.5s', sub: 'Turbo' },
              { val: 2.5, label: '2.5s', sub: 'Balanced' },
              { val: 4.0, label: '4.0s', sub: 'Safe' },
            ].map((d) => (
              <button
                key={d.val}
                type="button"
                onClick={() => onChangeDelaySec(d.val)}
                disabled={disabled}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                  delaySec === d.val
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                    : 'bg-[#131b2e] text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold">{d.label}</div>
                <div className="text-[9px] opacity-75">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Max Send Limit */}
        <div className="p-4 rounded-2xl bg-[#090b12] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-emerald-400" />
              Send Limit
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              {maxLimit === 0 ? 'All Users' : `${maxLimit} Users`}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { val: 0, label: 'All', sub: 'No limit' },
              { val: 20, label: '20', sub: 'Limit' },
              { val: 50, label: '50', sub: 'Limit' },
            ].map((lim) => (
              <button
                key={lim.val}
                type="button"
                onClick={() => onChangeMaxLimit(lim.val)}
                disabled={disabled}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer border ${
                  maxLimit === lim.val
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-[#131b2e] text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold">{lim.label}</div>
                <div className="text-[9px] opacity-75">{lim.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800/80 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoCloseTabs}
            onChange={(e) => onChangeAutoCloseTabs(e.target.checked)}
            disabled={disabled}
            className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-zinc-300 font-medium">Auto-close worker tabs after message is sent</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={skipPrivate}
            onChange={(e) => onChangeSkipPrivate(e.target.checked)}
            disabled={disabled}
            className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-zinc-300 font-medium">Skip private accounts immediately (&lt;500ms)</span>
        </label>
      </div>
    </div>
  );
}
