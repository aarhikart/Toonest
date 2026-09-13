'use client';

import React, { useState } from 'react';

interface GSTRateSelectorProps {
  selectedRate: number;
  onRateChange: (rate: number) => void;
}

export const GSTRateSelector: React.FC<GSTRateSelectorProps> = ({
  selectedRate,
  onRateChange,
}) => {
  const standardRates = [
    { rate: 0, label: '0%', desc: 'Exempt / Essentials' },
    { rate: 5, label: '5%', desc: 'Necessities / Groceries' },
    { rate: 12, label: '12%', desc: 'Processed / Standard' },
    { rate: 18, label: '18%', desc: 'Services & Electronics' },
    { rate: 28, label: '28%', desc: 'Luxury & Demerit' },
  ];

  const isCustom = !standardRates.some((r) => r.rate === selectedRate);
  const [customValue, setCustomValue] = useState(isCustom ? selectedRate.toString() : '');

  const handleCustomChange = (val: string) => {
    setCustomValue(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      onRateChange(parsed);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Select GST Rate Slab
        </label>
        <span className="text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8]">
          Active: {selectedRate}%
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {standardRates.map((item) => {
          const isActive = selectedRate === item.rate && !isCustom;
          return (
            <button
              key={item.rate}
              type="button"
              onClick={() => {
                onRateChange(item.rate);
                setCustomValue('');
              }}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all text-center ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300 shadow-sm ring-1 ring-[#5722AF]'
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <span className="text-base sm:text-lg font-bold">{item.label}</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate max-w-full">
                {item.desc}
              </span>
            </button>
          );
        })}

        {/* Custom Rate Button/Input */}
        <div
          className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
            isCustom
              ? 'bg-purple-50 dark:bg-purple-950/40 border-[#5722AF] text-[#5722AF] dark:text-purple-300 shadow-sm ring-1 ring-[#5722AF]'
              : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center gap-1 w-full">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Custom"
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="w-full text-center text-sm font-bold bg-transparent border-b border-dashed border-neutral-300 dark:border-neutral-600 focus:outline-none focus:border-[#5722AF] py-0.5 text-neutral-900 dark:text-white"
            />
            <span className="text-xs font-semibold">%</span>
          </div>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
            e.g. 3% (Gold)
          </span>
        </div>
      </div>
    </div>
  );
};
