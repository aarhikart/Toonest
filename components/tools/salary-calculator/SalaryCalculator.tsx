'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { TaxRegime, SalaryInputs, SalaryBreakdownResult, SalaryHistoryItem } from '@/lib/salary/types';
import { calculateSalaryBreakdown } from '@/lib/salary/calculations';
import { SalaryHero } from './SalaryHero';
import { SalaryResultCard } from './SalaryResultCard';
import { SalaryBreakdownTable } from './SalaryBreakdownTable';
import { TaxRegimeComparison } from './TaxRegimeComparison';
import { SalaryHikeCalculator } from './SalaryHikeCalculator';
import { SalaryHistory } from './SalaryHistory';
import { SalaryHowItWorks } from './SalaryHowItWorks';
import { SalaryFAQ } from './SalaryFAQ';
import {
  IndianRupee,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Settings2,
  Table,
  Scale,
  TrendingUp,
  Percent,
} from 'lucide-react';

const SALARY_STORAGE_KEY = 'toolnest_salary_history_v1';

export const SalaryCalculator: React.FC = () => {
  const searchParams = useSearchParams();

  // Active Tool Section Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'breakdown' | 'regimes' | 'hike'>('calculator');

  // Core Inputs
  const [annualCTC, setAnnualCTC] = useState<number>(1200000); // 12 LPA default
  const [regime, setRegime] = useState<TaxRegime>('new');
  const [basicPercent, setBasicPercent] = useState<number>(50); // 50% of CTC
  const [hraPercent, setHraPercent] = useState<number>(50); // 50% of Basic
  const [epfOption, setEpfOption] = useState<'full' | 'capped' | 'none'>('capped');
  const [includeGratuity, setIncludeGratuity] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Old Regime Deductions
  const [rentPaidAnnual, setRentPaidAnnual] = useState<number>(240000);
  const [isMetro, setIsMetro] = useState<boolean>(true);
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80D, setDeduction80D] = useState<number>(25000);
  const [homeLoanInterest24b, setHomeLoanInterest24b] = useState<number>(0);

  // History & Toast
  const [history, setHistory] = useState<SalaryHistoryItem[]>([]);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Initialize from URL search params
  useEffect(() => {
    if (!searchParams) return;
    const urlCTC = searchParams.get('ctc');
    const urlRegime = searchParams.get('regime') as TaxRegime | null;
    const urlBasic = searchParams.get('basic');
    const urlHra = searchParams.get('hra');
    const urlTab = searchParams.get('tab');

    if (urlCTC && !isNaN(parseFloat(urlCTC))) setAnnualCTC(parseFloat(urlCTC));
    if (urlRegime === 'new' || urlRegime === 'old') setRegime(urlRegime);
    if (urlBasic && !isNaN(parseFloat(urlBasic))) setBasicPercent(parseFloat(urlBasic));
    if (urlHra && !isNaN(parseFloat(urlHra))) setHraPercent(parseFloat(urlHra));
    if (urlTab && ['calculator', 'breakdown', 'regimes', 'hike'].includes(urlTab)) {
      setActiveTab(urlTab as any);
    }
  }, [searchParams]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SALARY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const salaryInputs: SalaryInputs = {
    annualCTC,
    basicPercent,
    hraPercent,
    epfOption,
    includeGratuity,
    professionalTaxAnnual: 2400,
    regime,
    rentPaidAnnual,
    isMetro,
    deduction80C,
    deduction80D,
    homeLoanInterest24b,
  };

  const breakdown: SalaryBreakdownResult = calculateSalaryBreakdown(salaryInputs);

  // Debounced History Saver
  const saveToHistory = useCallback((res: SalaryBreakdownResult, reg: TaxRegime) => {
    try {
      const newItem: SalaryHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        annualCTC: res.annualCTC,
        regime: reg,
        monthlyInHand: res.netInHandMonthly,
        monthlyGross: res.grossSalaryMonthly,
        monthlyTax: res.incomeTaxMonthly,
      };

      setHistory((prev) => {
        const filtered = prev.filter(
          (p) => Math.abs(p.annualCTC - res.annualCTC) > 100 || p.regime !== reg
        );
        const updated = [newItem, ...filtered].slice(0, 10);
        localStorage.setItem(SALARY_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (annualCTC <= 0) return;
    const timeout = setTimeout(() => {
      saveToHistory(breakdown, regime);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [annualCTC, regime, basicPercent, hraPercent, epfOption, breakdown, saveToHistory]);

  const handleShareURL = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('ctc', annualCTC.toString());
    url.searchParams.set('regime', regime);
    url.searchParams.set('basic', basicPercent.toString());
    url.searchParams.set('hra', hraPercent.toString());
    url.searchParams.set('tab', activeTab);
    navigator.clipboard.writeText(url.toString());
    setShareToast('Shareable salary calculation link copied to clipboard!');
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleRestoreHistory = (item: SalaryHistoryItem) => {
    setAnnualCTC(item.annualCTC);
    setRegime(item.regime);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(SALARY_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleReset = () => {
    setAnnualCTC(1200000);
    setRegime('new');
    setBasicPercent(50);
    setHraPercent(50);
    setEpfOption('capped');
    setIncludeGratuity(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <span>✓</span>
          <span>{shareToast}</span>
        </div>
      )}

      {/* Hero Header */}
      <SalaryHero
        regime={regime}
        onRegimeChange={setRegime}
        onSelectCTCPreset={(ctc) => setAnnualCTC(ctc)}
      />

      {/* Sub-Feature Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 justify-center overflow-x-auto pb-1">
        <div className="inline-flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'calculator'
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            In-Hand Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('breakdown')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'breakdown'
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Itemized Breakdown
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('regimes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'regimes'
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            New vs. Old Regimes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hike')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'hike'
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Salary Hike Planner
          </button>
        </div>
      </div>

      {/* Tab 1: Primary Salary Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs & Sliders Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
              {/* Annual CTC Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Annual CTC (Cost to Company)
                  </label>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-slate-500 hover:text-[#5722AF] flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    min="100000"
                    max="100000000"
                    step="50000"
                    value={annualCTC || ''}
                    onChange={(e) => setAnnualCTC(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                  />
                </div>
                <input
                  type="range"
                  min="300000"
                  max="6000000"
                  step="50000"
                  value={annualCTC}
                  onChange={(e) => setAnnualCTC(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹3 LPA</span>
                  <span>₹15 LPA</span>
                  <span>₹35 LPA</span>
                  <span>₹60 LPA</span>
                </div>
              </div>

              {/* Basic & HRA Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Basic Salary % */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Basic Salary (% of CTC)
                    </label>
                    <span className="text-xs font-bold text-[#5722AF] dark:text-purple-400">
                      {basicPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="70"
                    step="5"
                    value={basicPercent}
                    onChange={(e) => setBasicPercent(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>30%</span>
                    <span>50% (Standard)</span>
                    <span>70%</span>
                  </div>
                </div>

                {/* HRA % */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      HRA (% of Basic)
                    </label>
                    <span className="text-xs font-bold text-[#5722AF] dark:text-purple-400">
                      {hraPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="50"
                    step="5"
                    value={hraPercent}
                    onChange={(e) => setHraPercent(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>20%</span>
                    <span>40% (Non-Metro)</span>
                    <span>50% (Metro)</span>
                  </div>
                </div>
              </div>

              {/* Retiral / PF Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Provident Fund (EPF) Contribution
                  </label>
                  <select
                    value={epfOption}
                    onChange={(e) => setEpfOption(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                  >
                    <option value="capped">Statutory Capped (₹1,800/mo - Maximum In-Hand)</option>
                    <option value="full">Full 12% of Basic Salary</option>
                    <option value="none">No EPF Contribution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Include Gratuity in CTC
                  </label>
                  <div className="flex items-center gap-3 py-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={includeGratuity}
                        onChange={(e) => setIncludeGratuity(e.target.checked)}
                        className="rounded border-slate-300 text-[#5722AF] focus:ring-[#5722AF] w-4 h-4"
                      />
                      <span>Yes (Statutory 15/26/12 ~4.81% of Basic)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Old Regime Detailed Deductions (Show if Old Regime selected) */}
              {regime === 'old' && (
                <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                      Old Regime Deductions & Exemptions
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-xs text-[#5722AF] dark:text-purple-400 font-semibold flex items-center gap-1"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                      {showAdvanced ? 'Hide' : 'Configure'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Annual Rent Paid (₹)
                      </label>
                      <input
                        type="number"
                        value={rentPaidAnnual}
                        onChange={(e) => setRentPaidAnnual(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Section 80C (PPF, ELSS, LIC)
                      </label>
                      <input
                        type="number"
                        max="150000"
                        value={deduction80C}
                        onChange={(e) => setDeduction80C(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent History */}
            <SalaryHistory
              history={history}
              onSelect={handleRestoreHistory}
              onClear={handleClearHistory}
            />
          </div>

          {/* Result Card Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <SalaryResultCard breakdown={breakdown} onShareURL={handleShareURL} />
          </div>
        </div>
      )}

      {/* Tab 2: Itemized Breakdown Table */}
      {activeTab === 'breakdown' && <SalaryBreakdownTable breakdown={breakdown} />}

      {/* Tab 3: New vs Old Tax Regime Comparison */}
      {activeTab === 'regimes' && (
        <TaxRegimeComparison
          newTax={regime === 'new' ? breakdown.taxResult : breakdown.comparisonTaxResult}
          oldTax={regime === 'old' ? breakdown.taxResult : breakdown.comparisonTaxResult}
          grossSalaryMonthly={breakdown.grossSalaryMonthly}
          pfMonthly={breakdown.employeePFMonthly}
          ptMonthly={breakdown.professionalTaxMonthly}
        />
      )}

      {/* Tab 4: Salary Hike Planner */}
      {activeTab === 'hike' && <SalaryHikeCalculator />}

      {/* Educational Guide */}
      <SalaryHowItWorks />

      {/* FAQ Section */}
      <SalaryFAQ />

      {/* Professional Legal Disclaimer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Income Tax & Compensation Disclaimer:</strong> This Salary Calculator is designed for computational estimation and personal financial planning purposes only. Calculations reflect prevailing Indian income tax slabs for FY 2026-27 (AY 2027-28), statutory EPF guidelines, and the Payment of Gratuity Act. Actual payroll figures, flexible benefit plans (FBP), allowances, perquisites, and tax deductions (TDS) are subject to your employer’s specific HR/payroll policies and official declarations under Section 192 of the Income Tax Act. Please consult a qualified Chartered Accountant (CA) or tax professional for statutory compliance.
        </div>
      </div>
    </div>
  );
};
