'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoanType, TenureType, EMICalculationResult, EMIHistoryItem } from '@/lib/emi/types';
import { calculateEMI, generateAmortizationSchedule } from '@/lib/emi/calculations';
import { EMIHero } from './EMIHero';
import { EMIResultCard } from './EMIResultCard';
import { AmortizationSchedule } from './AmortizationSchedule';
import { PrepaymentCalculator } from './PrepaymentCalculator';
import { LoanComparisonCard } from './LoanComparisonCard';
import { RateTenureComparison } from './RateTenureComparison';
import { EMIHistory } from './EMIHistory';
import { EMIHowItWorks } from './EMIHowItWorks';
import { EMIFAQ } from './EMIFAQ';
import { IndianRupee, RotateCcw, ShieldAlert, Sliders, Calendar, Percent, PiggyBank, Scale, Table, Grid } from 'lucide-react';

const EMI_STORAGE_KEY = 'toolnest_emi_history_v1';

export const EMICalculator: React.FC = () => {
  const searchParams = useSearchParams();

  // Active Tool Section Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'schedule' | 'prepayment' | 'comparison' | 'matrix'>('calculator');

  // Loan State
  const [loanType, setLoanType] = useState<LoanType>('home');
  const [principal, setPrincipal] = useState<number>(5000000); // 50 Lakhs default
  const [annualRate, setAnnualRate] = useState<number>(8.5); // 8.5% default
  const [tenureValue, setTenureValue] = useState<number>(20); // 20 years default
  const [tenureType, setTenureType] = useState<TenureType>('years');

  // History & Toast
  const [history, setHistory] = useState<EMIHistoryItem[]>([]);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Tenure in months
  const tenureMonths = tenureType === 'years' ? tenureValue * 12 : tenureValue;

  // Preset Handler
  const handleLoanTypeChange = (type: LoanType) => {
    setLoanType(type);
    if (type === 'home') {
      setPrincipal(5000000);
      setAnnualRate(8.5);
      setTenureValue(20);
      setTenureType('years');
    } else if (type === 'car') {
      setPrincipal(1000000);
      setAnnualRate(9.0);
      setTenureValue(5);
      setTenureType('years');
    } else if (type === 'personal') {
      setPrincipal(500000);
      setAnnualRate(12.5);
      setTenureValue(3);
      setTenureType('years');
    } else if (type === 'education') {
      setPrincipal(1500000);
      setAnnualRate(10.0);
      setTenureValue(7);
      setTenureType('years');
    }
  };

  // Sync from URL
  useEffect(() => {
    if (!searchParams) return;
    const urlAmt = searchParams.get('amount');
    const urlRate = searchParams.get('rate');
    const urlTenure = searchParams.get('tenure');
    const urlTenureType = searchParams.get('tenureType') as TenureType | null;
    const urlType = searchParams.get('type') as LoanType | null;
    const urlTab = searchParams.get('tab');

    if (urlAmt && !isNaN(parseFloat(urlAmt))) setPrincipal(parseFloat(urlAmt));
    if (urlRate && !isNaN(parseFloat(urlRate))) setAnnualRate(parseFloat(urlRate));
    if (urlTenure && !isNaN(parseFloat(urlTenure))) setTenureValue(parseFloat(urlTenure));
    if (urlTenureType === 'years' || urlTenureType === 'months') setTenureType(urlTenureType);
    if (urlType) setLoanType(urlType);
    if (urlTab && ['calculator', 'schedule', 'prepayment', 'comparison', 'matrix'].includes(urlTab)) {
      setActiveTab(urlTab as any);
    }
  }, [searchParams]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(EMI_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Compute results
  const emiResult: EMICalculationResult = calculateEMI(principal, annualRate, tenureMonths);
  const { monthly, yearly } = generateAmortizationSchedule(principal, annualRate, tenureMonths);

  // Debounced History Saver
  const saveToHistory = useCallback((res: EMICalculationResult, type: LoanType) => {
    try {
      const newItem: EMIHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        loanType: type,
        principal: res.principal,
        annualRate: res.annualRate,
        tenureMonths: res.tenureMonths,
        monthlyEMI: res.monthlyEMI,
        totalInterest: res.totalInterest,
        totalPayment: res.totalPayment,
      };

      setHistory((prev) => {
        const filtered = prev.filter(
          (p) =>
            Math.abs(p.principal - res.principal) > 100 ||
            p.annualRate !== res.annualRate ||
            p.tenureMonths !== res.tenureMonths
        );
        const updated = [newItem, ...filtered].slice(0, 10);
        localStorage.setItem(EMI_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (principal <= 0) return;
    const timeout = setTimeout(() => {
      saveToHistory(emiResult, loanType);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [principal, annualRate, tenureMonths, loanType, emiResult, saveToHistory]);

  const handleShareURL = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('amount', principal.toString());
    url.searchParams.set('rate', annualRate.toString());
    url.searchParams.set('tenure', tenureValue.toString());
    url.searchParams.set('tenureType', tenureType);
    url.searchParams.set('type', loanType);
    url.searchParams.set('tab', activeTab);
    navigator.clipboard.writeText(url.toString());
    setShareToast('Shareable EMI link copied to clipboard!');
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleRestoreHistory = (item: EMIHistoryItem) => {
    setLoanType(item.loanType);
    setPrincipal(item.principal);
    setAnnualRate(item.annualRate);
    setTenureType('months');
    setTenureValue(item.tenureMonths);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(EMI_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleReset = () => {
    handleLoanTypeChange('home');
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
      <EMIHero
        loanType={loanType}
        onLoanTypeChange={handleLoanTypeChange}
        tenureType={tenureType}
        onTenureTypeChange={setTenureType}
      />

      {/* Sub-Feature Tabs */}
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
            EMI Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'schedule'
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Amortization Table
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prepayment')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'prepayment'
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5" />
            Prepayment Planner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'comparison'
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Compare Loans
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Rates Matrix
          </button>
        </div>
      </div>

      {/* Tab 1: Primary EMI Calculator */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs & Sliders Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
              {/* Principal Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Loan Amount (Principal)
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
                    min="10000"
                    max="100000000"
                    step="10000"
                    value={principal || ''}
                    onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                  />
                </div>
                <input
                  type="range"
                  min="100000"
                  max="15000000"
                  step="50000"
                  value={principal}
                  onChange={(e) => setPrincipal(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹1 Lakh</span>
                  <span>₹50 Lakhs</span>
                  <span>₹1.5 Crore</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Annual Interest Rate (% p.a.)
                  </label>
                  <span className="text-xs font-bold text-[#5722AF] dark:text-purple-400">
                    {annualRate}%
                  </span>
                </div>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Percent className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.05"
                    value={annualRate || ''}
                    onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                  />
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="0.1"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>5%</span>
                  <span>10%</span>
                  <span>15%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Loan Tenure ({tenureType === 'years' ? 'Years' : 'Months'})
                  </label>
                  <span className="text-xs font-bold text-[#5722AF] dark:text-purple-400">
                    {tenureType === 'years'
                      ? `${tenureValue} Years (${tenureValue * 12} Mos)`
                      : `${tenureValue} Months`}
                  </span>
                </div>
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={tenureType === 'years' ? 35 : 420}
                    value={tenureValue || ''}
                    onChange={(e) => setTenureValue(parseFloat(e.target.value) || 1)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max={tenureType === 'years' ? 30 : 360}
                  step="1"
                  value={tenureValue}
                  onChange={(e) => setTenureValue(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 {tenureType === 'years' ? 'Yr' : 'Mo'}</span>
                  <span>{tenureType === 'years' ? '15 Yrs' : '180 Mos'}</span>
                  <span>{tenureType === 'years' ? '30 Yrs' : '360 Mos'}</span>
                </div>
              </div>
            </div>

            {/* Recent History */}
            <EMIHistory
              history={history}
              onSelect={handleRestoreHistory}
              onClear={handleClearHistory}
            />
          </div>

          {/* Result Card Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <EMIResultCard result={emiResult} onShareURL={handleShareURL} />
          </div>
        </div>
      )}

      {/* Tab 2: Amortization Schedule */}
      {activeTab === 'schedule' && (
        <AmortizationSchedule
          yearlySchedule={yearly}
          monthlySchedule={monthly}
          principal={principal}
        />
      )}

      {/* Tab 3: Prepayment Planner */}
      {activeTab === 'prepayment' && (
        <PrepaymentCalculator
          principal={principal}
          annualRate={annualRate}
          tenureMonths={tenureMonths}
        />
      )}

      {/* Tab 4: Compare Loans */}
      {activeTab === 'comparison' && <LoanComparisonCard />}

      {/* Tab 5: Interest vs. Tenure Matrix */}
      {activeTab === 'matrix' && (
        <RateTenureComparison
          principal={principal}
          currentRate={annualRate}
          currentTenureMonths={tenureMonths}
        />
      )}

      {/* Educational Guide */}
      <EMIHowItWorks />

      {/* FAQ Section */}
      <EMIFAQ />

      {/* Professional Legal Disclaimer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Financial & Regulatory Disclaimer:</strong> This EMI Calculator is provided for illustrative and estimation purposes only. Actual interest rates, processing fees, documentation charges, insurance premiums, and repayment schedules are subject to credit appraisal, verification, and policies of the respective bank or Non-Banking Financial Company (NBFC). Please confirm exact figures with your lending institution prior to signing loan agreements.
        </div>
      </div>
    </div>
  );
};
