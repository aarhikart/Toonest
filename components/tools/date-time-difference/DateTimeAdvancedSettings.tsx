'use client';

import React, { useState } from 'react';
import { PrecisionMode, WeekendRule, TimeFormat } from '@/lib/date-time/types';
import { Settings2, ChevronDown } from 'lucide-react';

interface DateTimeAdvancedSettingsProps {
  precision: PrecisionMode;
  onPrecisionChange: (precision: PrecisionMode) => void;
  timeFormat: TimeFormat;
  onTimeFormatChange: (format: TimeFormat) => void;
  weekendRule: WeekendRule;
  onWeekendRuleChange: (rule: WeekendRule) => void;
}

export const DateTimeAdvancedSettings: React.FC<DateTimeAdvancedSettingsProps> = ({
  precision,
  onPrecisionChange,
  timeFormat,
  onTimeFormatChange,
  weekendRule,
  onWeekendRuleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8]">
            <Settings2 className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              Advanced Settings & Display Preferences
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Decimal precision, 12h/24h format, and weekend definitions
            </span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-6">
          {/* Precision Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Decimal Value Precision
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['auto', '0', '1', '2', '3', '4'] as PrecisionMode[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPrecisionChange(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    precision === p
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  {p === 'auto' ? 'Auto Precision' : `${p} Decimal${p === '1' ? '' : 's'}`}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Applies to total hours and total minutes displays without affecting internal exact calculations.
            </p>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Default Time System
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onTimeFormatChange('12h')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  timeFormat === '12h'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                12-Hour Clock (AM / PM)
              </button>
              <button
                type="button"
                onClick={() => onTimeFormatChange('24h')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  timeFormat === '24h'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                24-Hour Military / Standard
              </button>
            </div>
          </div>

          {/* Weekend Rule */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Business Week Definition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'sat_sun', label: 'Saturday / Sunday' },
                { id: 'fri_sat', label: 'Friday / Saturday' },
                { id: 'sun_only', label: 'Sunday Only' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onWeekendRuleChange(item.id as WeekendRule)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    weekendRule === item.id
                      ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
