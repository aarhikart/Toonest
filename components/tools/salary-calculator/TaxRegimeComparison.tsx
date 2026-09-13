'use client';

import React from 'react';
import { TaxCalculationResult } from '@/lib/salary/types';
import { formatCurrencyINR } from '@/lib/salary/formatting';
import { Scale, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaxRegimeComparisonProps {
  newTax: TaxCalculationResult;
  oldTax: TaxCalculationResult;
  grossSalaryMonthly: number;
  pfMonthly: number;
  ptMonthly: number;
}

export const TaxRegimeComparison: React.FC<TaxRegimeComparisonProps> = ({
  newTax,
  oldTax,
  grossSalaryMonthly,
  pfMonthly,
  ptMonthly,
}) => {
  const taxDiff = Math.abs(newTax.totalTax - oldTax.totalTax);
  const isNewBetter = newTax.totalTax < oldTax.totalTax;
  const isOldBetter = oldTax.totalTax < newTax.totalTax;
  const isEqual = newTax.totalTax === oldTax.totalTax;

  // Monthly take home under each
  const newMonthlyInHand = grossSalaryMonthly - pfMonthly - ptMonthly - newTax.totalTax / 12;
  const oldMonthlyInHand = grossSalaryMonthly - pfMonthly - ptMonthly - oldTax.totalTax / 12;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            New vs. Old Tax Regime Comparison
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Automated analysis to see which income tax regime leaves more money in your bank account
          </p>
        </div>
      </div>

      {/* Outcome Recommendation Banner */}
      <div
        className={`mt-4 p-4 rounded-xl border flex items-center justify-between flex-wrap gap-2 ${
          isNewBetter
            ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
            : isOldBetter
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {isEqual
              ? 'Both tax regimes yield the exact same net tax liability.'
              : isNewBetter
              ? `New Tax Regime saves you ${formatCurrencyINR(taxDiff)} annually (${formatCurrencyINR(taxDiff / 12)} / month)!`
              : `Old Tax Regime saves you ${formatCurrencyINR(taxDiff)} annually due to your high deductions!`}
          </span>
        </div>
      </div>

      {/* Side by Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* New Regime Card */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isNewBetter
              ? 'border-[#5722AF] dark:border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20 dark:bg-purple-950/10'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              New Tax Regime (Section 115BAC)
            </h4>
            {isNewBetter && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5722AF] dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">
                Recommended
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Gross Salary:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrencyINR(newTax.grossSalary)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Standard Deduction:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{formatCurrencyINR(newTax.standardDeduction)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Other Deductions / HRA:</span>
              <span className="font-semibold text-slate-400">Nil (Disallowed)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Net Taxable Income:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrencyINR(newTax.taxableIncome)}</span>
            </div>
            {newTax.rebate87A > 0 && (
              <div className="flex justify-between py-1 text-emerald-600 dark:text-emerald-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <span>Section 87A Rebate:</span>
                <span>-{formatCurrencyINR(newTax.rebate87A)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 font-bold border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-800 dark:text-slate-200">Total Tax Payable (Annual):</span>
              <span className="text-red-600 dark:text-red-400">{formatCurrencyINR(newTax.totalTax)}</span>
            </div>
            <div className="flex justify-between py-2 pt-3 font-extrabold text-sm sm:text-base text-[#5722AF] dark:text-purple-300">
              <span>Monthly In-Hand:</span>
              <span>{formatCurrencyINR(newMonthlyInHand)}</span>
            </div>
          </div>
        </div>

        {/* Old Regime Card */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isOldBetter
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Old Tax Regime (With 80C & HRA)
            </h4>
            {isOldBetter && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Recommended
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Gross Salary:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrencyINR(oldTax.grossSalary)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Standard Deduction:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{formatCurrencyINR(oldTax.standardDeduction)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">HRA Exemption:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{formatCurrencyINR(oldTax.exemptions.hraExemption)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">80C, 80D & Chapter VI-A:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">-{formatCurrencyINR(oldTax.exemptions.chapterVIA + oldTax.exemptions.homeLoanInterest)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Net Taxable Income:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrencyINR(oldTax.taxableIncome)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-800 dark:text-slate-200">Total Tax Payable (Annual):</span>
              <span className="text-red-600 dark:text-red-400">{formatCurrencyINR(oldTax.totalTax)}</span>
            </div>
            <div className="flex justify-between py-2 pt-3 font-extrabold text-sm sm:text-base text-emerald-700 dark:text-emerald-400">
              <span>Monthly In-Hand:</span>
              <span>{formatCurrencyINR(oldMonthlyInHand)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
