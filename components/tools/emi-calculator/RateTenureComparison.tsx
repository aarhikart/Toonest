'use client';

import React from 'react';
import { calculateEMI } from '@/lib/emi/calculations';
import { formatCurrencyINR } from '@/lib/emi/formatting';
import { Grid, TrendingDown } from 'lucide-react';

interface RateTenureComparisonProps {
  principal: number;
  currentRate: number;
  currentTenureMonths: number;
}

export const RateTenureComparison: React.FC<RateTenureComparisonProps> = ({
  principal,
  currentRate,
  currentTenureMonths,
}) => {
  const tenuresYears = [5, 10, 15, 20, 25, 30];
  const rateDeltas = [-1.0, -0.5, 0, 0.5, 1.0];

  const rates = rateDeltas
    .map((delta) => parseFloat((currentRate + delta).toFixed(2)))
    .filter((r) => r > 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <Grid className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Interest Rate vs. Tenure Sensitivity Matrix
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            See how different interest rates and tenures impact your monthly EMI for ₹{principal.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-center text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 text-left">Interest Rate</th>
              {tenuresYears.map((yrs) => (
                <th key={yrs} className="py-3 px-3">
                  {yrs} Years
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rates.map((rate) => {
              const isCurrentRate = Math.abs(rate - currentRate) < 0.01;
              return (
                <tr
                  key={rate}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                    isCurrentRate ? 'bg-purple-50/50 dark:bg-purple-950/20 font-bold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-left font-bold text-slate-900 dark:text-white">
                    {rate}% {isCurrentRate && <span className="text-[10px] text-[#5722AF] dark:text-purple-400">(Current)</span>}
                  </td>
                  {tenuresYears.map((yrs) => {
                    const emiVal = calculateEMI(principal, rate, yrs * 12).monthlyEMI;
                    const isCurrentCell = isCurrentRate && currentTenureMonths === yrs * 12;

                    return (
                      <td
                        key={yrs}
                        className={`py-2.5 px-3 text-xs sm:text-sm ${
                          isCurrentCell
                            ? 'bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-purple-200 font-extrabold ring-1 ring-[#5722AF] rounded-md'
                            : 'text-slate-700 dark:text-slate-300 font-medium'
                        }`}
                      >
                        {formatCurrencyINR(emiVal)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
