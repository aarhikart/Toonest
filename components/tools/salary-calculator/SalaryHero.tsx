'use client';

import React from 'react';
import { TaxRegime } from '@/lib/salary/types';
import { Wallet, Sparkles, Building2, Landmark } from 'lucide-react';

interface SalaryHeroProps {
  regime: TaxRegime;
  onRegimeChange: (regime: TaxRegime) => void;
  onSelectCTCPreset?: (ctc: number) => void;
}

export const SalaryHero: React.FC<SalaryHeroProps> = ({
  regime,
  onRegimeChange,
  onSelectCTCPreset,
}) => {
  const ctcPresets = [
    { label: '₹6 LPA', value: 600000 },
    { label: '₹10 LPA', value: 1000000 },
    { label: '₹15 LPA', value: 1500000 },
    { label: '₹25 LPA', value: 2500000 },
    { label: '₹50 LPA', value: 5000000 },
  ];

  return (
    <div className="w-full text-center mb-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-3">
        <Wallet className="w-3.5 h-3.5" />
        <span>India FY 2026-27 (₹75k Standard Deduction)</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-3">
        Salary <span className="text-[#5722AF] dark:text-[#9B6BE8]">Calculator</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-6">
        Convert your annual CTC into real monthly in-hand take-home salary. Calculate EPF, Gratuity, Professional Tax, and compare New vs. Old Tax Regimes.
      </p>

      {/* Tax Regime Selector Pill */}
      <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 mb-5">
        <button
          type="button"
          onClick={() => onRegimeChange('new')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            regime === 'new'
              ? 'bg-[#5722AF] text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Tax Regime (Default)</span>
          <span className="text-[10px] bg-purple-900/60 text-purple-200 px-1.5 py-0.5 rounded">
            ₹75k Std Ded
          </span>
        </button>
        <button
          type="button"
          onClick={() => onRegimeChange('old')}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            regime === 'old'
              ? 'bg-[#5722AF] text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Old Tax Regime</span>
          <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded">
            80C / HRA
          </span>
        </button>
      </div>

      {/* Quick CTC Presets */}
      {onSelectCTCPreset && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="font-medium mr-1">Quick CTC Presets:</span>
          {ctcPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onSelectCTCPreset(preset.value)}
              className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-colors border border-neutral-200/60 dark:border-neutral-700/60"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
