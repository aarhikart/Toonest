'use client';

import React, { useState } from 'react';
import { SalaryBreakdownResult } from '@/lib/salary/types';
import { formatCurrencyINR, numberToWordsINR } from '@/lib/salary/formatting';
import { Copy, Check, Share2, Printer, ArrowRight } from 'lucide-react';

interface SalaryResultCardProps {
  breakdown: SalaryBreakdownResult;
  onShareURL?: () => void;
}

export const SalaryResultCard: React.FC<SalaryResultCardProps> = ({
  breakdown,
  onShareURL,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const ctc = breakdown.annualCTC;
  const inHandPct = ctc > 0 ? Math.round((breakdown.netInHandAnnual / ctc) * 100) : 0;
  const taxPct = ctc > 0 ? Math.round((breakdown.incomeTaxAnnual / ctc) * 100) : 0;
  const pfPct = ctc > 0 ? Math.round(((breakdown.employeePFAnnual + breakdown.employerPFAnnual) / ctc) * 100) : 0;
  const otherPct = Math.max(0, 100 - inHandPct - taxPct - pfPct);

  const fullSummary = `Salary Breakdown Summary (FY 2026-27):
- Annual CTC: ${formatCurrencyINR(breakdown.annualCTC)}
- Monthly Take-Home (In-Hand): ${formatCurrencyINR(breakdown.netInHandMonthly)}
- Annual Take-Home: ${formatCurrencyINR(breakdown.netInHandAnnual)}
- Monthly Gross Salary: ${formatCurrencyINR(breakdown.grossSalaryMonthly)}
- Monthly Income Tax (TDS): ${formatCurrencyINR(breakdown.incomeTaxMonthly)}
- Monthly Employee PF: ${formatCurrencyINR(breakdown.employeePFMonthly)}
- Professional Tax: ${formatCurrencyINR(breakdown.professionalTaxMonthly)}/mo
- Tax Regime: ${breakdown.taxResult.regime.toUpperCase()} Regime
- In Words: ${numberToWordsINR(breakdown.netInHandMonthly)}
Calculated on ToolNest Salary Calculator`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 rounded-md">
              Take-Home Pay
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {breakdown.taxResult.regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}
            </span>
          </div>

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
              title="Print Calculation"
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-[#5722AF] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-md transition-colors hidden sm:block"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlight Net In-Hand */}
        <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 mb-5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Monthly In-Hand (Take-Home) Salary
          </div>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#5722AF] dark:text-[#9B6BE8] tracking-tight">
              {formatCurrencyINR(breakdown.netInHandMonthly)}
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400"> / month</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(breakdown.netInHandMonthly.toString(), 'inhand')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#5722AF] bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              {copiedKey === 'inhand' ? (
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

          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>
              Annual Take-Home: <strong className="text-slate-900 dark:text-white">{formatCurrencyINR(breakdown.netInHandAnnual)}</strong>
            </span>
            <span className="text-purple-700 dark:text-purple-400 font-bold">
              {inHandPct}% of CTC
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic border-t border-purple-100 dark:border-slate-800 pt-2">
            In Words:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {numberToWordsINR(breakdown.netInHandMonthly)}
            </span>
          </p>
        </div>

        {/* Visual CTC Stacked Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            <span>CTC Distribution</span>
            <span>100% (₹{breakdown.annualCTC.toLocaleString('en-IN')})</span>
          </div>
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${inHandPct}%` }}
              title={`In-Hand: ${inHandPct}%`}
              className="bg-[#5722AF] h-full transition-all duration-500"
            />
            <div
              style={{ width: `${taxPct}%` }}
              title={`Income Tax: ${taxPct}%`}
              className="bg-red-500 h-full transition-all duration-500"
            />
            <div
              style={{ width: `${pfPct}%` }}
              title={`PF Contributions: ${pfPct}%`}
              className="bg-emerald-500 h-full transition-all duration-500"
            />
            <div
              style={{ width: `${otherPct}%` }}
              title={`Gratuity & Other: ${otherPct}%`}
              className="bg-blue-500 h-full transition-all duration-500"
            />
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5722AF]" />
              <span>In-Hand ({inHandPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Tax ({taxPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PF ({pfPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Retirals ({otherPct}%)</span>
            </div>
          </div>
        </div>

        {/* Quick Metrics Breakdown */}
        <div className="space-y-2 text-xs sm:text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Gross Salary:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrencyINR(breakdown.grossSalaryMonthly)} / mo
            </span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Monthly Income Tax (TDS):</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              -{formatCurrencyINR(breakdown.incomeTaxMonthly)} / mo
            </span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Employee PF Deduction:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              -{formatCurrencyINR(breakdown.employeePFMonthly)} / mo
            </span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Professional Tax:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              -{formatCurrencyINR(breakdown.professionalTaxMonthly)} / mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
