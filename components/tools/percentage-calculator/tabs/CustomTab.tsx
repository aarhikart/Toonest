'use client';

import React from 'react';
import { CustomOperation } from '@/lib/percentage/types';

interface CustomTabProps {
  baseValue: string;
  setBaseValue: (v: string) => void;
  percentValue: string;
  setPercentValue: (v: string) => void;
  operation: CustomOperation;
  setOperation: (op: CustomOperation) => void;
}

const OPERATIONS: { id: CustomOperation; label: string; formulaSnippet: string }[] = [
  { id: 'add_percent', label: 'Add Percentage (+ %)', formulaSnippet: 'Base + %' },
  { id: 'subtract_percent', label: 'Subtract Percentage (- %)', formulaSnippet: 'Base - %' },
  { id: 'percent_of', label: 'Percentage of Number (% of)', formulaSnippet: '% of Base' },
  { id: 'increase_by', label: 'Increase by %', formulaSnippet: 'Base × (1 + %)' },
  { id: 'decrease_by', label: 'Decrease by %', formulaSnippet: 'Base × (1 - %)' },
];

export const CustomTab: React.FC<CustomTabProps> = ({
  baseValue,
  setBaseValue,
  percentValue,
  setPercentValue,
  operation,
  setOperation,
}) => {
  return (
    <div className="space-y-4">
      {/* Operation Selection Dropdown / Buttons */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Mathematical Operation
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {OPERATIONS.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => setOperation(op.id)}
              className={`p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                operation === op.id
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="font-semibold">{op.label}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {op.formulaSnippet}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Base Value
          </label>
          <input
            type="number"
            step="any"
            value={baseValue}
            onChange={(e) => setBaseValue(e.target.value)}
            placeholder="e.g. 500"
            className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <p className="text-[11px] text-slate-400">The primary starting amount</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Percentage Rate
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={percentValue}
              onChange={(e) => setPercentValue(e.target.value)}
              placeholder="e.g. 20"
              className="w-full text-sm font-semibold bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-sm">
              %
            </span>
          </div>
          <p className="text-[11px] text-slate-400">The percentage to apply</p>
        </div>
      </div>
    </div>
  );
};
