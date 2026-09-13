'use client';

import React, { useState } from 'react';
import { WeekendRule } from '@/lib/date-time/types';
import { formatISODate, parseISODate, formatDateLong } from '@/lib/date-time/formatting';
import { getTodayDateInput } from '@/lib/date-time/dateCalculations';
import { Briefcase, CalendarPlus, Trash2, Plus, Calendar } from 'lucide-react';

interface BusinessDaysSettingsProps {
  weekendRule: WeekendRule;
  onWeekendRuleChange: (rule: WeekendRule) => void;
  holidays: string[];
  onAddHoliday: (isoDate: string) => void;
  onRemoveHoliday: (isoDate: string) => void;
  onClearHolidays: () => void;
}

export const BusinessDaysSettings: React.FC<BusinessDaysSettingsProps> = ({
  weekendRule,
  onWeekendRuleChange,
  holidays,
  onAddHoliday,
  onRemoveHoliday,
  onClearHolidays,
}) => {
  const [newHolidayInput, setNewHolidayInput] = useState(formatISODate(getTodayDateInput()));

  const handleAdd = () => {
    if (newHolidayInput && !holidays.includes(newHolidayInput)) {
      onAddHoliday(newHolidayInput);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xs">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8]">
          <Briefcase className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Business Days & Holiday Exclusion
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize standard weekend days and add specific public or company holidays
          </p>
        </div>
      </div>

      {/* Weekend Rule Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Weekend Definition
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: 'sat_sun', label: 'Saturday & Sunday', sub: 'Standard (Western)' },
            { id: 'fri_sat', label: 'Friday & Saturday', sub: 'Middle East' },
            { id: 'sun_only', label: 'Sunday Only', sub: '6-Day Workweek' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onWeekendRuleChange(item.id as WeekendRule)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                weekendRule === item.id
                  ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 ring-2 ring-purple-600/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:border-purple-300'
              }`}
            >
              <div className="text-xs font-bold">{item.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Holiday Input */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>Exclude Custom Holidays</span>
          <span className="text-[11px] font-normal text-slate-400">
            Saved locally on your device ({holidays.length})
          </span>
        </label>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="date"
              value={newHolidayInput}
              onChange={(e) => setNewHolidayInput(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        </div>

        {/* Holiday list */}
        {holidays.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span>Active Holiday Dates:</span>
              <button
                type="button"
                onClick={onClearHolidays}
                className="text-rose-600 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {holidays.map((h) => {
                const parsed = parseISODate(h);
                const label = parsed ? formatDateLong(parsed) : h;
                return (
                  <div
                    key={h}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200"
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveHoliday(h)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove holiday"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
