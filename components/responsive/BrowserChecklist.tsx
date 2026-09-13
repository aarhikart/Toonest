'use client';

import React from 'react';
import { BrowserTarget, TestStatus } from '@/lib/responsive/types';
import { Check, AlertTriangle, X, HelpCircle, Info } from 'lucide-react';

interface BrowserChecklistProps {
  statuses: Record<BrowserTarget, TestStatus>;
  onUpdateStatus: (browser: BrowserTarget, status: TestStatus) => void;
}

const BROWSERS: { id: BrowserTarget; name: string; engine: string }[] = [
  { id: 'chrome', name: 'Google Chrome', engine: 'Blink Engine' },
  { id: 'firefox', name: 'Mozilla Firefox', engine: 'Gecko Engine' },
  { id: 'safari', name: 'Apple Safari', engine: 'WebKit Engine' },
  { id: 'edge', name: 'Microsoft Edge', engine: 'Blink Engine' },
  { id: 'ios-safari', name: 'iOS Safari (Mobile)', engine: 'WebKit iOS' },
  { id: 'android-chrome', name: 'Chrome for Android', engine: 'Blink Mobile' },
];

export const BrowserChecklist: React.FC<BrowserChecklistProps> = ({
  statuses,
  onUpdateStatus,
}) => {
  return (
    <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
      <div>
        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
          Browser Compatibility QA Checklist
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Track verified rendering across desktop and mobile browser engines
        </p>
      </div>

      {/* Honest limitation notice */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Browser Environment Note:</strong> This iframe executes within your currently active browser engine.
          It does not emulate Safari WebKit or Firefox Gecko on a Chrome host. Use this checklist to manually track real-browser testing passes.
        </p>
      </div>

      {/* Browser table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
              <th className="py-2.5 px-3 font-bold uppercase text-[11px]">Browser Target</th>
              <th className="py-2.5 px-3 font-bold uppercase text-[11px]">Rendering Engine</th>
              <th className="py-2.5 px-3 font-bold uppercase text-[11px] text-right">QA Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {BROWSERS.map((b) => {
              const currentStatus = statuses[b.id] || 'untested';
              return (
                <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">
                    {b.name}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                    {b.engine}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(b.id, 'pass')}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          currentStatus === 'pass'
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'text-zinc-500 hover:text-emerald-500'
                        }`}
                      >
                        Pass
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(b.id, 'warning')}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          currentStatus === 'warning'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-zinc-500 hover:text-amber-500'
                        }`}
                      >
                        Warn
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(b.id, 'fail')}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                          currentStatus === 'fail'
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'text-zinc-500 hover:text-rose-500'
                        }`}
                      >
                        Fail
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(b.id, 'untested')}
                        className={`px-2 py-1 rounded text-[10px] font-medium cursor-pointer ${
                          currentStatus === 'untested'
                            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                            : 'text-zinc-400'
                        }`}
                      >
                        Clear
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
