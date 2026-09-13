'use client';

import React from 'react';
import { Table, ArrowRight } from 'lucide-react';

interface ReferenceRow {
  percentage: string;
  decimal: string;
  fraction: string;
}

const ROWS: ReferenceRow[] = [
  { percentage: '1%', decimal: '0.01', fraction: '1/100' },
  { percentage: '5%', decimal: '0.05', fraction: '1/20' },
  { percentage: '10%', decimal: '0.10', fraction: '1/10' },
  { percentage: '12.5%', decimal: '0.125', fraction: '1/8' },
  { percentage: '20%', decimal: '0.20', fraction: '1/5' },
  { percentage: '25%', decimal: '0.25', fraction: '1/4' },
  { percentage: '33.33%', decimal: '0.3333', fraction: '1/3' },
  { percentage: '50%', decimal: '0.50', fraction: '1/2' },
  { percentage: '66.67%', decimal: '0.6667', fraction: '2/3' },
  { percentage: '75%', decimal: '0.75', fraction: '3/4' },
  { percentage: '100%', decimal: '1.00', fraction: '1/1' },
];

export const PercentageReference: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Table className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Quick Percentage Reference Table
          </h3>
        </div>
        <span className="text-xs text-slate-400">Decimals & Fractions</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Percentage</th>
              <th className="py-2.5 px-3">Decimal</th>
              <th className="py-2.5 px-3">Fraction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
            {ROWS.map((row) => (
              <tr
                key={row.percentage}
                className="hover:bg-purple-50/40 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2.5 px-3 font-semibold text-purple-700 dark:text-purple-400">
                  {row.percentage}
                </td>
                <td className="py-2.5 px-3">{row.decimal}</td>
                <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                  {row.fraction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
