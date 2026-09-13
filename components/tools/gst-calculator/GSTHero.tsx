'use client';

import React from 'react';
import { GSTMode, GSTType } from '@/lib/gst/types';
import { Calculator, PlusCircle, MinusCircle, MapPin } from 'lucide-react';

interface GSTHeroProps {
  mode: GSTMode;
  onModeChange: (mode: GSTMode) => void;
  type: GSTType;
  onTypeChange: (type: GSTType) => void;
  onSelectPresetAmount?: (amount: number) => void;
}

export const GSTHero: React.FC<GSTHeroProps> = ({
  mode,
  onModeChange,
  type,
  onTypeChange,
  onSelectPresetAmount,
}) => {
  const presetAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  return (
    <div className="w-full text-center mb-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-3">
        <Calculator className="w-3.5 h-3.5" />
        <span>India GST Slabs (0%, 5%, 12%, 18%, 28%)</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-3">
        GST <span className="text-[#5722AF] dark:text-[#9B6BE8]">Calculator</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-6">
        Accurately add or remove Goods & Services Tax in seconds. Calculate intra-state CGST & SGST, inter-state IGST, trade discounts, and multi-product invoices.
      </p>

      {/* Toggle Controls Container */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => onModeChange('add')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'add'
                ? 'bg-[#5722AF] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Add GST (Exclusive)
          </button>
          <button
            type="button"
            onClick={() => onModeChange('remove')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              mode === 'remove'
                ? 'bg-[#5722AF] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <MinusCircle className="w-4 h-4" />
            Remove GST (Reverse)
          </button>
        </div>

        {/* GST Type Selector */}
        <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => onTypeChange('cgst_sgst')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              type === 'cgst_sgst'
                ? 'bg-white dark:bg-neutral-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Intra-State (CGST + SGST)
          </button>
          <button
            type="button"
            onClick={() => onTypeChange('igst')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              type === 'igst'
                ? 'bg-white dark:bg-neutral-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Inter-State (IGST)
          </button>
        </div>
      </div>

      {/* Quick Amount Presets */}
      {onSelectPresetAmount && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-medium mr-1">Quick Presets:</span>
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => onSelectPresetAmount(amt)}
              className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-colors border border-neutral-200/60 dark:border-neutral-700/60"
            >
              ₹{amt.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
