'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DateInput,
  Feb29Rule,
  AgeCalculationResult,
  AgeHistoryItem,
} from '@/lib/age/types';
import {
  calculateFullAge,
} from '@/lib/age/calculations';
import {
  getTodayDateInput,
  isValidDate,
  compareDates,
  formatISODate,
  parseISODate,
  formatDateLong,
} from '@/lib/age/dates';

import { DateInputFields } from './DateInputFields';
import { AgeResultCard } from './AgeResultCard';
import { AgeStatisticsGrid } from './AgeStatisticsGrid';
import { BirthdayCard } from './BirthdayCard';
import { AgeDetailsCard } from './AgeDetailsCard';
import { AgeOnDateCard } from './AgeOnDateCard';
import { AgeDifferenceCard } from './AgeDifferenceCard';
import { MultiPersonCompare } from './MultiPersonCompare';
import { AgeCalculationHistory } from './AgeCalculationHistory';

import {
  Calendar,
  Users,
  Layers,
  History,
  RotateCcw,
  Settings2,
  Check,
  AlertCircle,
} from 'lucide-react';

const HISTORY_KEY = 'toolnest_age_history';

type CalculatorTab = 'single' | 'difference' | 'group';

export const AgeCalculator: React.FC = () => {
  const searchParams = useSearchParams();

  // Active Tab
  const [activeTab, setActiveTab] = useState<CalculatorTab>('single');

  // Calculation target mode: 'today' or 'custom'
  const [targetMode, setTargetMode] = useState<'today' | 'custom'>('today');

  // Dates state
  const today = useMemo(() => getTodayDateInput(), []);
  const [dob, setDob] = useState<DateInput>({ year: 1998, month: 8, day: 15 });
  const [customTarget, setCustomTarget] = useState<DateInput>(today);

  // Leap-year rule for Feb 29 birthdays: 'feb28' (default) or 'mar1'
  const [feb29Rule, setFeb29Rule] = useState<Feb29Rule>('feb28');
  const [showSettings, setShowSettings] = useState(false);

  // History & Toast State
  const [history, setHistory] = useState<AgeHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load URL query parameters on initial mount
  useEffect(() => {
    const dobParam = searchParams.get('dob');
    const dateParam = searchParams.get('date');

    if (dobParam) {
      const parsedDob = parseISODate(dobParam);
      if (parsedDob && isValidDate(parsedDob.year, parsedDob.month, parsedDob.day)) {
        setDob(parsedDob);
      }
    }

    if (dateParam) {
      const parsedTarget = parseISODate(dateParam);
      if (parsedTarget && isValidDate(parsedTarget.year, parsedTarget.month, parsedTarget.day)) {
        setCustomTarget(parsedTarget);
        setTargetMode('custom');
      }
    }
  }, [searchParams]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save history helper
  const saveHistory = useCallback((item: AgeHistoryItem) => {
    setHistory((prev) => {
      // Avoid duplicate top item
      if (prev.length > 0 && prev[0].dobFormatted === item.dobFormatted && prev[0].targetFormatted === item.targetFormatted) {
        return prev;
      }
      const updated = [item, ...prev.filter((i) => i.dobFormatted !== item.dobFormatted || i.targetFormatted !== item.targetFormatted)].slice(0, 25);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Delete item from history
  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore
    }
  };

  // Restore calculation from history
  const handleReuseHistory = (item: AgeHistoryItem) => {
    if (item.dob) {
      setDob(item.dob);
    }
    if (item.target) {
      setCustomTarget(item.target);
      setTargetMode('custom');
    } else {
      setTargetMode('today');
    }
    setActiveTab('single');
  };

  // Determine active target date
  const activeTargetDate = targetMode === 'today' ? today : customTarget;

  // Validation
  const isDobValid = isValidDate(dob.year, dob.month, dob.day);
  const isTargetValid = isValidDate(activeTargetDate.year, activeTargetDate.month, activeTargetDate.day);
  const isTargetAfterOrEqualDob = compareDates(activeTargetDate, dob) >= 0;
  const isCalculationValid = isDobValid && isTargetValid && isTargetAfterOrEqualDob;

  // Calculate full age result
  const calculationResult: AgeCalculationResult | null = useMemo(() => {
    if (!isCalculationValid) return null;
    return calculateFullAge(dob, activeTargetDate, feb29Rule, targetMode === 'custom');
  }, [dob, activeTargetDate, feb29Rule, targetMode, isCalculationValid]);

  // Record history when a valid calculation is displayed
  useEffect(() => {
    if (calculationResult) {
      const timer = setTimeout(() => {
        saveHistory({
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          dobFormatted: formatDateLong(calculationResult.birth),
          targetFormatted: formatDateLong(calculationResult.target),
          ageFormatted: `${calculationResult.exactAge.years} Years, ${calculationResult.exactAge.months} Months, ${calculationResult.exactAge.days} Days`,
          dob: calculationResult.birth,
          target: calculationResult.isCustomDate ? calculationResult.target : undefined,
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [calculationResult, saveHistory]);

  // Share URL handler
  const handleShare = async () => {
    let url = `${window.location.origin}/age-calculator?dob=${formatISODate(dob)}`;
    if (targetMode === 'custom') {
      url += `&date=${formatISODate(customTarget)}`;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToastMessage('Calculation link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 2500);
    } catch {
      // Fallback
      setToastMessage('Link copied: ' + url);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Reset to default
  const handleReset = () => {
    setDob({ year: 1998, month: 8, day: 15 });
    setCustomTarget(today);
    setTargetMode('today');
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

      {/* Top Navigation Bar: Tabs + Toolbar Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'single'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Calculate Age</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('difference')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'difference'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Age Difference</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('group')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'group'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Group Compare</span>
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Feb 29 Settings Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showSettings
                  ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-200'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Configure leap year birthday rules"
            >
              <Settings2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Feb 29 Rule</span>
            </button>

            {/* Settings Dropdown Popover */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    February 29 Birthday Rule
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">
                    Common Years
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Choose which date is recognized as the birthday celebration for people born on February 29 during non-leap years.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFeb29Rule('feb28');
                      setShowSettings(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      feb29Rule === 'feb28'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    February 28
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeb29Rule('mar1');
                      setShowSettings(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      feb29Rule === 'mar1'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                    }`}
                  >
                    March 1
                  </button>
                </div>
              </div>
            )}
          </div>

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
            title="Reset to default dates"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: MAIN CALCULATE AGE */}
      {activeTab === 'single' && (
        <div className="space-y-8">
          {/* Main Input Card */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Calculation Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Target Calculation Date
              </span>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTargetMode('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    targetMode === 'today'
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Today ({formatDateLong(today)})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('custom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    targetMode === 'custom'
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Custom Target Date
                </button>
              </div>
            </div>

            {/* Date Inputs Grid */}
            <div className={`grid grid-cols-1 ${targetMode === 'custom' ? 'lg:grid-cols-2' : ''} gap-6`}>
              {/* DOB */}
              <div className="space-y-2">
                <DateInputFields
                  label="Date of Birth"
                  date={dob}
                  onChange={setDob}
                  minYear={1900}
                  maxYear={today.year}
                />
              </div>

              {/* Custom Target Date */}
              {targetMode === 'custom' && (
                <div className="space-y-2">
                  <DateInputFields
                    label="Calculate Age As Of"
                    date={customTarget}
                    onChange={setCustomTarget}
                    minYear={dob.year}
                    maxYear={dob.year + 130}
                  />
                </div>
              )}
            </div>

            {/* Validation Notice */}
            {!isCalculationValid && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <span className="font-bold block">Invalid Date Configuration</span>
                  {!isDobValid && <span>Please enter a valid calendar date of birth. </span>}
                  {!isTargetValid && <span>Please enter a valid target calculation date. </span>}
                  {!isTargetAfterOrEqualDob && (
                    <span>
                      The target calculation date ({formatDateLong(activeTargetDate)}) cannot be earlier than your date of birth ({formatDateLong(dob)}).
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Calculations Results Section */}
          {calculationResult && (
            <>
              {/* Primary Exact Age Hero Result Card */}
              <AgeResultCard
                result={calculationResult}
                onShare={handleShare}
              />

              {/* Lifetime Statistics Grid (6 Cards) */}
              <AgeStatisticsGrid stats={calculationResult.totalStats} />

              {/* 2-Column Insights: Birthday Countdown + Astrological / Demographic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BirthdayCard birthday={calculationResult.birthday} />
                <AgeDetailsCard
                  birth={calculationResult.birth}
                  weekday={calculationResult.weekday}
                  zodiac={calculationResult.zodiac}
                  birthYearInfo={calculationResult.birthYearInfo}
                />
              </div>


              {/* Age on Milestone Date Section */}
              <AgeOnDateCard birthDate={dob} />
            </>
          )}
        </div>
      )}

      {/* TAB 2: AGE DIFFERENCE */}
      {activeTab === 'difference' && (
        <div>
          <AgeDifferenceCard />
        </div>
      )}

      {/* TAB 3: GROUP COMPARISON */}
      {activeTab === 'group' && (
        <div>
          <MultiPersonCompare />
        </div>
      )}

      {/* History Slide-Over Panel */}
      <AgeCalculationHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onReuse={handleReuseHistory}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
      />
    </div>
  );
};
