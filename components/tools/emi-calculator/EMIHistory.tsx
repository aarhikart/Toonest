'use client';

import React from 'react';
import { EMIHistoryItem } from '@/lib/emi/types';
import { formatCurrencyINR, formatTenure } from '@/lib/emi/formatting';
import { History, Trash2, RotateCcw } from 'lucide-react';

interface EMIHistoryProps {
  history: EMIHistoryItem[];
  onSelect: (item: EMIHistoryItem) => void;
  onClear: () => void;
}

export const EMIHistory: React.FC<EMIHistoryProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Loan Calculations ({history.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#5722AF] dark:hover:border-purple-500 cursor-pointer bg-slate-50/50 dark:bg-slate-800/50 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase">
                {item.loanType} ({item.annualRate}%)
              </span>
              <span className="text-[10px] text-slate-400">
                {formatTenure(item.tenureMonths)}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs text-slate-500">
                  Loan: {formatCurrencyINR(item.principal)}
                </div>
                <div className="text-sm font-bold text-[#5722AF] dark:text-[#9B6BE8]">
                  EMI: {formatCurrencyINR(item.monthlyEMI)}/mo
                </div>
              </div>
              <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#5722AF] transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
