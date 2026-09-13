'use client';

import React, { useState } from 'react';
import { EMICalculationResult } from '@/lib/emi/types';
import { formatCurrencyINR, numberToWordsINR } from '@/lib/emi/formatting';
import { Copy, Check, Share2, Printer } from 'lucide-react';

interface EMIResultCardProps {
  result: EMICalculationResult;
  onShareURL?: () => void;
}

export const EMIResultCard: React.FC<EMIResultCardProps> = ({ result, onShareURL }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Donut chart math
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.159
  const principalDash = (result.principalPercentage / 100) * circumference;
  const interestDash = (result.interestPercentage / 100) * circumference;

  const fullSummary = `Loan EMI Calculation:
- Monthly EMI: ${formatCurrencyINR(result.monthlyEMI)}
- Principal Loan Amount: ${formatCurrencyINR(result.principal)}
- Annual Interest Rate: ${result.annualRate}%
- Loan Tenure: ${result.tenureMonths} Months (${(result.tenureMonths / 12).toFixed(1)} Years)
- Total Interest Payable: ${formatCurrencyINR(result.totalInterest)} (${result.interestPercentage}%)
- Total Amount Payable: ${formatCurrencyINR(result.totalPayment)}
- In Words: ${numberToWordsINR(result.monthlyEMI)}
Calculated on ToolNest EMI Calculator`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 rounded-md">
            Loan Repayment Summary
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Copy Summary"
              onClick={() => handleCopy(fullSummary, 'summary')}
              className="p-1.5 text-slate-500 hover:text-[#5722AF] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              {copiedKey === 'summary' ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            {onShareURL && (
              <button
                type="button"
                title="Share Calculation"
                onClick={onShareURL}
                className="p-1.5 text-slate-500 hover:text-[#5722AF] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              title="Print Schedule"
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-[#5722AF] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monthly EMI Highlight */}
        <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 mb-6">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Monthly Loan EMI
          </div>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#5722AF] dark:text-[#9B6BE8] tracking-tight">
              {formatCurrencyINR(result.monthlyEMI)}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(result.monthlyEMI.toString(), 'emi')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#5722AF] bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              {copiedKey === 'emi' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
            In Words:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {numberToWordsINR(result.monthlyEMI)}
            </span>
          </p>
        </div>

        {/* Donut Chart & Breakdown Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center mb-6">
          {/* SVG Donut Chart (5 cols) */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="14"
                  fill="none"
                />
                {/* Principal Segment */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#5722AF"
                  strokeWidth="14"
                  fill="none"
                  strokeDasharray={`${principalDash} ${circumference}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                {/* Interest Segment */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#F59E0B"
                  strokeWidth="14"
                  fill="none"
                  strokeDasharray={`${interestDash} ${circumference}`}
                  strokeDashoffset={-principalDash}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Principal
                </span>
                <span className="text-base font-extrabold text-[#5722AF] dark:text-[#9B6BE8]">
                  {result.principalPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Legend / Metrics (7 cols) */}
          <div className="sm:col-span-7 space-y-3 text-xs sm:text-sm">
            {/* Principal */}
            <div className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5722AF] inline-block" />
                  <span>Principal Loan</span>
                </div>
                <span className="text-xs font-bold text-[#5722AF] dark:text-purple-400">
                  {result.principalPercentage}%
                </span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white pl-4">
                {formatCurrencyINR(result.principal)}
              </div>
            </div>

            {/* Total Interest */}
            <div className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Total Interest</span>
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {result.interestPercentage}%
                </span>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white pl-4">
                {formatCurrencyINR(result.totalInterest)}
              </div>
            </div>
          </div>
        </div>

        {/* Total Amount Payable Card */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          <span>Total Payment (Principal + Interest)</span>
          <span className="text-[#5722AF] dark:text-[#9B6BE8]">
            {formatCurrencyINR(result.totalPayment)}
          </span>
        </div>
      </div>
    </div>
  );
};
