'use client';

import React from 'react';
import { PrecisionMode } from '@/lib/percentage/types';
import { Hash } from 'lucide-react';

interface PrecisionSelectorProps {
  precision: PrecisionMode;
  onChange: (precision: PrecisionMode) => void;
}

const OPTIONS: { label: string; value: PrecisionMode }[] = [
  { label: 'Auto', value: 'auto' },
  { label: '0 Decimals', value: 0 },
  { label: '1 Decimal', value: 1 },
  { label: '2 Decimals', value: 2 },
  { label: '3 Decimals', value: 3 },
  { label: '4 Decimals', value: 4 },
];

export const PrecisionSelector: React.FC<PrecisionSelectorProps> = ({
  precision,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="precision-select"
        className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"
      >
        <Hash className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        <span>Precision:</span>
      </label>
      <select
        id="precision-select"
        value={precision}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === 'auto' ? 'auto' : (Number(val) as PrecisionMode));
        }}
        className="text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
      >
        {OPTIONS.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
