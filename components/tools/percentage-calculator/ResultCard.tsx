'use client';

import React, { useState } from 'react';
import { Copy, Check, RotateCcw, AlertCircle, BookOpen, Share2 } from 'lucide-react';
import { CalculationResult } from '@/lib/percentage/types';

interface ResultCardProps {
  result: CalculationResult | null;
  onReset: () => void;
  onShare?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onReset,
  onShare,
}) => {
  const [copiedType, setCopiedType] = useState<'result' | 'formula' | null>(null);

  if (!result) {
    return (
      <div className="h-full min-h-[260px] flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Enter values to calculate
        </p>
        <p className="text-xs text-slate-400 max-w-xs">
          Your calculation results, formulas, and step-by-step breakdown will appear here instantly.
        </p>
      </div>
    );
  }

  if (result.isError) {
    return (
      <div className="h-full min-h-[260px] flex flex-col items-center justify-center p-8 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
            Calculation Notice
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs">
            {result.errorMessage || result.summaryText}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100/50 transition-colors"
        >
          Reset Values
        </button>
      </div>
    );
  }

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(result.primaryValue);
      setCopiedType('result');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyFormula = async () => {
    try {
      await navigator.clipboard.writeText(
        `${result.summaryText}\nFormula: ${result.formula}\nCalculation: ${result.formulaExample}`
      );
      setCopiedType('formula');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Header & Label */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            {result.primaryLabel}
          </span>
          <div className="flex items-center gap-1.5">
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                title="Share calculation link"
                aria-label="Share calculation link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset inputs"
              aria-label="Reset inputs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Large Value */}
        <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 flex flex-col justify-center">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Calculated Result
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-900 dark:text-purple-100 tracking-tight mt-0.5 break-words">
            {result.primaryValue}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            {result.summaryText}
          </p>
        </div>

        {/* Supporting Secondary Values */}
        {result.secondaryValues && result.secondaryValues.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {result.secondaryValues.map((sec, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {sec.label}
                  </span>
                  {sec.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        sec.colorClass
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sec.badge}
                    </span>
                  )}
                </div>
                <div className={`font-bold ${sec.colorClass || 'text-slate-800 dark:text-slate-200'}`}>
                  {sec.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formula Card Section */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
          <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Formula Applied</span>
          </div>
          <div className="font-mono text-[11px] text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            {result.formula}
          </div>
          <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 px-1 pt-0.5">
            {result.formulaExample}
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyResult}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-sm shadow-purple-600/20 active:scale-[0.99] cursor-pointer"
        >
          {copiedType === 'result' ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied Result!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Result</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleCopyFormula}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        >
          {copiedType === 'formula' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Equation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
