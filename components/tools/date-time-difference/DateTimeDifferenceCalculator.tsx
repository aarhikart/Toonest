'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DateInput,
  TimeInput,
  CountingMode,
  WeekendRule,
  TimeFormat,
  MidnightMode,
  PrecisionMode,
  DateTimeHistoryItem,
} from '@/lib/date-time/types';
import {
  getTodayDateInput,
  calculateFullDateDiff,
  compareDates,
  isValidDate,
} from '@/lib/date-time/dateCalculations';
import { calculateTimeDifference } from '@/lib/date-time/timeCalculations';
import {
  formatISODate,
  parseISODate,
  formatDateLong,
  formatTime,
  parseISOTime,
} from '@/lib/date-time/formatting';

import { DateTimeTabs, MainTabType } from './DateTimeTabs';
import { DateDifferenceForm } from './DateDifference/DateDifferenceForm';
import { DateDifferenceResult } from './DateDifference/DateDifferenceResult';
import { BusinessDaysSettings } from './DateDifference/BusinessDaysSettings';
import { DateAddSubtract } from './DateDifference/DateAddSubtract';

import { TimeDifferenceForm } from './TimeDifference/TimeDifferenceForm';
import { TimeDifferenceResult } from './TimeDifference/TimeDifferenceResult';
import { TimeAddSubtract } from './TimeDifference/TimeAddSubtract';

import { DateTimeForm } from './DateTimeDifference/DateTimeForm';
import { TimezoneDifferenceCard } from './TimezoneDifference/TimezoneDifferenceCard';

import { DateTimeAdvancedSettings } from './DateTimeAdvancedSettings';
import { DateTimeHistory } from './DateTimeHistory';
import { DateTimeExamples } from './DateTimeExamples';

import { History, RotateCcw, Check } from 'lucide-react';

const HISTORY_KEY = 'toolnest_datetime_history';
const HOLIDAYS_KEY = 'toolnest_custom_holidays';

export const DateTimeDifferenceCalculator: React.FC = () => {
  const searchParams = useSearchParams();

  // Active Tab
  const [activeTab, setActiveTab] = useState<MainTabType>('date');

  // Date Calculator State
  const today = useMemo(() => getTodayDateInput(), []);
  const [startDate, setStartDate] = useState<DateInput>({
    year: today.year,
    month: today.month,
    day: 15,
  });
  const [endDate, setEndDate] = useState<DateInput>({
    year: today.year,
    month: today.month === 12 ? 1 : today.month + 1,
    day: 12,
  });
  const [countingMode, setCountingMode] = useState<CountingMode>('exclusive');
  const [weekendRule, setWeekendRule] = useState<WeekendRule>('sat_sun');
  const [holidays, setHolidays] = useState<string[]>([]);

  // Time Calculator State
  const [startTime, setStartTime] = useState<TimeInput>({
    hours: 10,
    minutes: 30,
    seconds: 0,
    ampm: 'AM',
  });
  const [endTime, setEndTime] = useState<TimeInput>({
    hours: 2,
    minutes: 15,
    seconds: 0,
    ampm: 'PM',
  });
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('12h');
  const [midnightMode, setMidnightMode] = useState<MidnightMode>('auto');

  // Display Settings
  const [precision, setPrecision] = useState<PrecisionMode>('auto');

  // History & Toast State
  const [history, setHistory] = useState<DateTimeHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load URL Search Params
  useEffect(() => {
    const typeParam = searchParams.get('type') as MainTabType | null;
    if (typeParam && ['date', 'time', 'datetime', 'timezone'].includes(typeParam)) {
      setActiveTab(typeParam);
    }

    // Date params
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (typeParam === 'date' || !typeParam) {
      if (startParam) {
        const p1 = parseISODate(startParam);
        if (p1 && isValidDate(p1.year, p1.month, p1.day)) setStartDate(p1);
      }
      if (endParam) {
        const p2 = parseISODate(endParam);
        if (p2 && isValidDate(p2.year, p2.month, p2.day)) setEndDate(p2);
      }
      const modeParam = searchParams.get('mode');
      if (modeParam === 'inclusive' || modeParam === 'exclusive') {
        setCountingMode(modeParam);
      }
    } else if (typeParam === 'time') {
      if (startParam) {
        const t1 = parseISOTime(startParam);
        if (t1) setStartTime(t1);
      }
      if (endParam) {
        const t2 = parseISOTime(endParam);
        if (t2) setEndTime(t2);
      }
    }
  }, [searchParams]);

  // Load History & Holidays from localStorage
  useEffect(() => {
    try {
      const storedHist = localStorage.getItem(HISTORY_KEY);
      if (storedHist) {
        const parsed = JSON.parse(storedHist);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
      const storedHolidays = localStorage.getItem(HOLIDAYS_KEY);
      if (storedHolidays) {
        const parsedH = JSON.parse(storedHolidays);
        if (Array.isArray(parsedH)) setHolidays(parsedH);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save history item
  const saveHistory = useCallback((item: DateTimeHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((i) => i.startFormatted !== item.startFormatted || i.endFormatted !== item.endFormatted)].slice(0, 25);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Holiday management
  const handleAddHoliday = (isoDate: string) => {
    const updated = [...holidays, isoDate];
    setHolidays(updated);
    try {
      localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleRemoveHoliday = (isoDate: string) => {
    const updated = holidays.filter((h) => h !== isoDate);
    setHolidays(updated);
    try {
      localStorage.setItem(HOLIDAYS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleClearHolidays = () => {
    setHolidays([]);
    try {
      localStorage.removeItem(HOLIDAYS_KEY);
    } catch {
      // Ignore
    }
  };

  // Date calculations
  const isDateReversed = compareDates(startDate, endDate) > 0;
  const dateResult = useMemo(() => {
    return calculateFullDateDiff(
      startDate,
      endDate,
      countingMode === 'inclusive',
      weekendRule,
      holidays
    );
  }, [startDate, endDate, countingMode, weekendRule, holidays]);

  // Time calculations
  const timeResult = useMemo(() => {
    return calculateTimeDifference(startTime, endTime, midnightMode, timeFormat);
  }, [startTime, endTime, midnightMode, timeFormat]);

  // Debounced auto-record to history
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'date' && dateResult) {
        saveHistory({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          type: 'date',
          title: 'Date Difference',
          startFormatted: formatDateLong(startDate),
          endFormatted: formatDateLong(endDate),
          resultFormatted: `${dateResult.calendarDiff.years}y ${dateResult.calendarDiff.months}m ${dateResult.calendarDiff.days}d (${dateResult.totalUnits.days} days)`,
        });
      } else if (activeTab === 'time' && timeResult) {
        saveHistory({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          type: 'time',
          title: 'Time Difference',
          startFormatted: formatTime(startTime, timeFormat),
          endFormatted: formatTime(endTime, timeFormat),
          resultFormatted: `${timeResult.hours}h ${timeResult.minutes}m ${timeResult.seconds}s`,
        });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeTab, dateResult, timeResult, startDate, endDate, startTime, endTime, timeFormat, saveHistory]);

  // Share calculation handler
  const handleShare = async () => {
    let url = `${window.location.origin}/date-time-difference-calculator?type=${activeTab}`;
    if (activeTab === 'date') {
      url += `&start=${formatISODate(startDate)}&end=${formatISODate(endDate)}&mode=${countingMode}`;
    } else if (activeTab === 'time') {
      url += `&start=${String(startTime.hours).padStart(2, '0')}:${String(startTime.minutes).padStart(2, '0')}&end=${String(endTime.hours).padStart(2, '0')}:${String(endTime.minutes).padStart(2, '0')}`;
    }

    try {
      await navigator.clipboard.writeText(url);
      setToastMessage('Calculation link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      setToastMessage('Link copied: ' + url);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Swap dates / times
  const handleSwapDates = () => {
    const temp = { ...startDate };
    setStartDate(endDate);
    setEndDate(temp);
  };

  const handleSwapTimes = () => {
    const temp = { ...startTime };
    setStartTime(endTime);
    setEndTime(temp);
  };

  // Reset to default
  const handleReset = () => {
    setStartDate({ year: today.year, month: today.month, day: 15 });
    setEndDate({ year: today.year, month: today.month === 12 ? 1 : today.month + 1, day: 12 });
    setCountingMode('exclusive');
    setStartTime({ hours: 10, minutes: 30, seconds: 0, ampm: 'AM' });
    setEndTime({ hours: 2, minutes: 15, seconds: 0, ampm: 'PM' });
  };

  // Example handlers
  const handleSelectDateExample = (start: DateInput, end: DateInput) => {
    setStartDate(start);
    setEndDate(end);
    setActiveTab('date');
  };

  const handleSelectTimeExample = (start: TimeInput, end: TimeInput, midnight: boolean) => {
    setStartTime(start);
    setEndTime(end);
    setMidnightMode(midnight ? 'next_day' : 'same_day');
    setActiveTab('time');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-purple-900 text-white shadow-2xl animate-in slide-in-from-bottom-3 duration-200 text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls: Tabs + Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <DateTimeTabs activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* History Button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
            title="Open calculation history"
          >
            <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900/60 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                {history.length}
              </span>
            )}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Reset calculator to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: DATE DIFFERENCE */}
      {activeTab === 'date' && (
        <div className="space-y-8">
          <DateDifferenceForm
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            countingMode={countingMode}
            onCountingModeChange={setCountingMode}
            onSwapDates={handleSwapDates}
            isReversed={isDateReversed}
          />

          <DateDifferenceResult
            result={dateResult}
            onShare={handleShare}
            onReset={handleReset}
          />

          {/* Business Days and Holiday Settings */}
          <BusinessDaysSettings
            weekendRule={weekendRule}
            onWeekendRuleChange={setWeekendRule}
            holidays={holidays}
            onAddHoliday={handleAddHoliday}
            onRemoveHoliday={handleRemoveHoliday}
            onClearHolidays={handleClearHolidays}
          />

          {/* Add / Subtract from Date */}
          <DateAddSubtract />
        </div>
      )}

      {/* TAB 2: TIME DIFFERENCE */}
      {activeTab === 'time' && (
        <div className="space-y-8">
          <TimeDifferenceForm
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={setStartTime}
            onEndTimeChange={setEndTime}
            timeFormat={timeFormat}
            onTimeFormatChange={setTimeFormat}
            midnightMode={midnightMode}
            onMidnightModeChange={setMidnightMode}
            onSwapTimes={handleSwapTimes}
          />

          <TimeDifferenceResult
            result={timeResult}
            startTime={startTime}
            endTime={endTime}
            timeFormat={timeFormat}
            precision={precision}
            onShare={handleShare}
          />

          {/* Add / Subtract Time */}
          <TimeAddSubtract timeFormat={timeFormat} />
        </div>
      )}

      {/* TAB 3: DATE & TIME COMBINED */}
      {activeTab === 'datetime' && (
        <div className="space-y-8">
          <DateTimeForm />
        </div>
      )}

      {/* TAB 4: TIME ZONE DIFFERENCE */}
      {activeTab === 'timezone' && (
        <div className="space-y-8">
          <TimezoneDifferenceCard />
        </div>
      )}

      {/* Collapsible Advanced Settings */}
      <DateTimeAdvancedSettings
        precision={precision}
        onPrecisionChange={setPrecision}
        timeFormat={timeFormat}
        onTimeFormatChange={setTimeFormat}
        weekendRule={weekendRule}
        onWeekendRuleChange={setWeekendRule}
      />

      {/* Interactive Examples */}
      <DateTimeExamples
        onSelectDateExample={handleSelectDateExample}
        onSelectTimeExample={handleSelectTimeExample}
      />

      {/* Local History Drawer */}
      <DateTimeHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onReuse={(item) => {
          if (item.type === 'date') setActiveTab('date');
          else if (item.type === 'time') setActiveTab('time');
        }}
        onDelete={(id) => {
          const updated = history.filter((i) => i.id !== id);
          setHistory(updated);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        }}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem(HISTORY_KEY);
        }}
      />
    </div>
  );
};
