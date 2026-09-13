'use client';

import React from 'react';
import { DateInput, TimeInput } from '@/lib/date-time/types';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface DateTimeExamplesProps {
  onSelectDateExample: (start: DateInput, end: DateInput) => void;
  onSelectTimeExample: (start: TimeInput, end: TimeInput, midnight: boolean) => void;
}

export const DateTimeExamples: React.FC<DateTimeExamplesProps> = ({
  onSelectDateExample,
  onSelectTimeExample,
}) => {
  const dateExamples = [
    {
      title: 'Full Calendar Year',
      range: '1 Jan 2025 → 1 Jan 2026',
      result: '1 Year (365 days)',
      start: { year: 2025, month: 1, day: 1 },
      end: { year: 2026, month: 1, day: 1 },
    },
    {
      title: 'Two Weeks (Fortnight)',
      range: '1 Jan 2026 → 15 Jan 2026',
      result: '14 Days (2 weeks)',
      start: { year: 2026, month: 1, day: 1 },
      end: { year: 2026, month: 1, day: 15 },
    },
    {
      title: 'Leap Year Transition',
      range: '28 Feb 2024 → 1 Mar 2024',
      result: '2 Days (Includes Feb 29)',
      start: { year: 2024, month: 2, day: 28 },
      end: { year: 2024, month: 3, day: 1 },
    },
    {
      title: 'Multi-Year Career Milestone',
      range: '15 Aug 2020 → 29 Oct 2025',
      result: '5y, 2m, 14d (1,901 days)',
      start: { year: 2020, month: 8, day: 15 },
      end: { year: 2025, month: 10, day: 29 },
    },
  ];

  const timeExamples = [
    {
      title: 'Standard Work Shift',
      range: '9:00 AM → 5:00 PM',
      result: '8 Hours (480 mins)',
      start: { hours: 9, minutes: 0, seconds: 0, ampm: 'AM' as const },
      end: { hours: 5, minutes: 0, seconds: 0, ampm: 'PM' as const },
      midnight: false,
    },
    {
      title: 'Overnight Hospital / Security Shift',
      range: '10:00 PM → 2:00 AM (Next Day)',
      result: '4 Hours (crosses midnight)',
      start: { hours: 10, minutes: 0, seconds: 0, ampm: 'PM' as const },
      end: { hours: 2, minutes: 0, seconds: 0, ampm: 'AM' as const },
      midnight: true,
    },
    {
      title: 'Lunch & Quick Sync Meeting',
      range: '11:30 AM → 12:15 PM',
      result: '45 Minutes (2,700 secs)',
      start: { hours: 11, minutes: 30, seconds: 0, ampm: 'AM' as const },
      end: { hours: 12, minutes: 15, seconds: 0, ampm: 'PM' as const },
      midnight: false,
    },
    {
      title: 'Corporate Half-Day',
      range: '8:00 AM → 12:30 PM',
      result: '4 Hours 30 Minutes',
      start: { hours: 8, minutes: 0, seconds: 0, ampm: 'AM' as const },
      end: { hours: 12, minutes: 30, seconds: 0, ampm: 'PM' as const },
      midnight: false,
    },
  ];

  return (
    <section className="space-y-6 pt-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Interactive Examples & Common Scenarios
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Click any scenario to populate the calculator and explore the exact calculations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Examples */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Date Range Examples</span>
          </div>

          <div className="space-y-2">
            {dateExamples.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectDateExample(item.start, item.end)}
                className="w-full p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all text-left group shadow-xs cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.range}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-right">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    {item.result}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Examples */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Time Span Examples</span>
          </div>

          <div className="space-y-2">
            {timeExamples.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectTimeExample(item.start, item.end, item.midnight)}
                className="w-full p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all text-left group shadow-xs cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.range}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-right">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    {item.result}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
