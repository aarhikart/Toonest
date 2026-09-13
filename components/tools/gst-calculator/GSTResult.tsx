'use client';

import React, { useState } from 'react';
import { GSTCalculationResult } from '@/lib/gst/types';
import { formatCurrency, numberToWordsINR } from '@/lib/gst/formatting';
import { Check, Copy, Share2, Printer, ArrowRight } from 'lucide-react';

interface GSTResultProps {
  result: GSTCalculationResult;
  onShareURL?: () => void;
}

export const GSTResult: React.FC<GSTResultProps> = ({ result, onShareURL }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isAdd = result.mode === 'add';

  const fullSummary = `GST Calculation Summary:
- Mode: ${isAdd ? 'Add GST (Exclusive)' : 'Remove GST (Reverse/Inclusive)'}
- GST Type: ${result.type === 'cgst_sgst' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
- Taxable Amount: ${formatCurrency(result.taxableAmount)}
- GST Rate: ${result.gstRate}%
- Total GST: ${formatCurrency(result.gstAmount)}
${
  result.type === 'cgst_sgst'
    ? `- CGST (${result.cgstRate}%): ${formatCurrency(result.cgstAmount || 0)}\n- SGST (${result.sgstRate}%): ${formatCurrency(result.sgstAmount || 0)}`
    : `- IGST (${result.igstRate}%): ${formatCurrency(result.igstAmount || 0)}`
}
- Final Total: ${formatCurrency(result.finalAmount)}
- In Words: ${numberToWordsINR(result.finalAmount)}
Calculated on ToolNest GST Calculator`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header with Badges */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                isAdd
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {isAdd ? 'Add GST' : 'Remove GST'}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {result.type === 'cgst_sgst' ? 'Intra-State' : 'Inter-State'}
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
                title="Share Calculation Link"
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

        {/* Primary Highlight Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 mb-5">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {isAdd ? 'Total Amount (GST Inclusive)' : 'Base Price (GST Exclusive)'}
          </div>
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#5722AF] dark:text-[#9B6BE8] tracking-tight">
              {formatCurrency(isAdd ? result.finalAmount : result.taxableAmount)}
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  (isAdd ? result.finalAmount : result.taxableAmount).toString(),
                  'primary'
                )
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#5722AF] bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              {copiedKey === 'primary' ? (
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
              {numberToWordsINR(isAdd ? result.finalAmount : result.taxableAmount)}
            </span>
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2.5 text-sm">
          {/* Taxable Amount */}
          <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-700/60">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              Taxable Amount (Net)
            </span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatCurrency(result.taxableAmount)}
            </span>
          </div>

          {/* GST Rate */}
          <div className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-700/60">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">
              GST Rate Applied
            </span>
            <span className="font-semibold text-neutral-900 dark:text-white">
              {result.gstRate}%
            </span>
          </div>

          {/* Tax Splits */}
          {result.type === 'cgst_sgst' ? (
            <>
              <div className="flex items-center justify-between py-1.5 pl-3 border-l-2 border-purple-400 dark:border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 rounded-r">
                <span className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm">
                  CGST ({result.cgstRate}%)
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {formatCurrency(result.cgstAmount || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 pl-3 border-l-2 border-purple-400 dark:border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 rounded-r">
                <span className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm">
                  SGST / UTGST ({result.sgstRate}%)
                </span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {formatCurrency(result.sgstAmount || 0)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-1.5 pl-3 border-l-2 border-purple-400 dark:border-purple-600 bg-purple-50/40 dark:bg-purple-950/20 rounded-r">
              <span className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm">
                IGST ({result.igstRate}%)
              </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {formatCurrency(result.igstAmount || 0)}
              </span>
            </div>
          )}

          {/* Total GST Amount */}
          <div className="flex items-center justify-between py-2 border-t border-neutral-200 dark:border-neutral-700 font-bold">
            <span className="text-neutral-800 dark:text-neutral-200">Total Tax (GST)</span>
            <span className="text-purple-700 dark:text-purple-300">
              {formatCurrency(result.gstAmount)}
            </span>
          </div>

          {/* Final Gross Amount */}
          <div className="flex items-center justify-between py-2 bg-slate-100 dark:bg-slate-800 px-3 rounded-lg font-bold text-slate-900 dark:text-white">
            <span>Total Value (Gross)</span>
            <span>{formatCurrency(result.finalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Quick Visual Formula helper */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
          <span>Applied Formula</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#5722AF]" />
        </div>
        {isAdd ? (
          <div>
            GST Amount = ₹{result.taxableAmount.toLocaleString('en-IN')} × {result.gstRate}% ={' '}
            <strong>₹{result.gstAmount.toLocaleString('en-IN')}</strong>
          </div>
        ) : (
          <div>
            Base Taxable = (₹{result.finalAmount.toLocaleString('en-IN')} × 100) ÷ (100 +{' '}
            {result.gstRate}) ={' '}
            <strong>₹{result.taxableAmount.toLocaleString('en-IN')}</strong>
          </div>
        )}
      </div>
    </div>
  );
};
