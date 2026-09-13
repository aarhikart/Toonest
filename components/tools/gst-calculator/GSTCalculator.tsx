'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GSTMode, GSTType, GSTCalculationResult, GSTHistoryItem } from '@/lib/gst/types';
import { calculateGST } from '@/lib/gst/calculations';
import { GSTHero } from './GSTHero';
import { GSTRateSelector } from './GSTRateSelector';
import { GSTResult } from './GSTResult';
import { DiscountGSTCalculator } from './DiscountGSTCalculator';
import { MultiItemGSTCalculator } from './MultiItemGSTCalculator';
import { GSTHistory } from './GSTHistory';
import { GSTExamples } from './GSTExamples';
import { GSTHowItWorks } from './GSTHowItWorks';
import { GSTFAQ } from './GSTFAQ';
import { IndianRupee, RotateCcw, ShieldAlert, Calculator, Tag, Layers } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'toolnest_gst_history_v1';

export const GSTCalculator: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<'standard' | 'discount' | 'invoice'>('standard');

  // Core Calculator State
  const [amount, setAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [mode, setMode] = useState<GSTMode>('add');
  const [type, setType] = useState<GSTType>('cgst_sgst');

  // History State
  const [history, setHistory] = useState<GSTHistoryItem[]>([]);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Initialize from URL search params if present
  useEffect(() => {
    if (!searchParams) return;
    const urlAmt = searchParams.get('amount');
    const urlRate = searchParams.get('rate');
    const urlMode = searchParams.get('mode') as GSTMode | null;
    const urlType = searchParams.get('type') as GSTType | null;
    const urlTab = searchParams.get('tab');

    if (urlAmt && !isNaN(parseFloat(urlAmt))) {
      setAmount(parseFloat(urlAmt));
    }
    if (urlRate && !isNaN(parseFloat(urlRate))) {
      setGstRate(parseFloat(urlRate));
    }
    if (urlMode === 'add' || urlMode === 'remove') {
      setMode(urlMode);
    }
    if (urlType === 'cgst_sgst' || urlType === 'igst') {
      setType(urlType);
    }
    if (urlTab === 'discount' || urlTab === 'invoice' || urlTab === 'standard') {
      setActiveTab(urlTab);
    }
  }, [searchParams]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore local storage parse errors
    }
  }, []);

  // Compute standard result
  const currentResult: GSTCalculationResult = calculateGST(amount, gstRate, mode, type);

  // Save to history debounce
  const saveToHistory = useCallback((res: GSTCalculationResult, inputAmount: number) => {
    try {
      const newItem: GSTHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mode: res.mode,
        amount: inputAmount,
        gstRate: res.gstRate,
        type: res.type,
        taxableAmount: res.taxableAmount,
        gstAmount: res.gstAmount,
        finalAmount: res.finalAmount,
      };

      setHistory((prev) => {
        const filtered = prev.filter((p) => Math.abs(p.amount - inputAmount) > 0.01 || p.gstRate !== res.gstRate || p.mode !== res.mode);
        const updated = [newItem, ...filtered].slice(0, 10);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Auto record history when inputs change (debounced)
  useEffect(() => {
    if (amount <= 0) return;
    const timeout = setTimeout(() => {
      saveToHistory(currentResult, amount);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [amount, gstRate, mode, type, currentResult, saveToHistory]);

  const handleShareURL = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('amount', amount.toString());
    url.searchParams.set('rate', gstRate.toString());
    url.searchParams.set('mode', mode);
    url.searchParams.set('type', type);
    url.searchParams.set('tab', activeTab);
    navigator.clipboard.writeText(url.toString());
    setShareToast('Shareable link copied to clipboard!');
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleApplyExample = (
    exAmount: number,
    exRate: number,
    exMode: GSTMode,
    exType: GSTType
  ) => {
    setActiveTab('standard');
    setAmount(exAmount);
    setGstRate(exRate);
    setMode(exMode);
    setType(exType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestoreHistory = (item: GSTHistoryItem) => {
    setActiveTab('standard');
    setAmount(item.amount);
    setGstRate(item.gstRate);
    setMode(item.mode);
    setType(item.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const handleReset = () => {
    setAmount(10000);
    setGstRate(18);
    setMode('add');
    setType('cgst_sgst');
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
      <GSTHero
        mode={mode}
        onModeChange={setMode}
        type={type}
        onTypeChange={setType}
        onSelectPresetAmount={(amt) => setAmount(amt)}
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700 justify-center">
        <div className="inline-flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('standard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'standard'
                ? 'bg-white dark:bg-neutral-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            GST Calculator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discount')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'discount'
                ? 'bg-white dark:bg-neutral-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            Discount + GST
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'invoice'
                ? 'bg-white dark:bg-neutral-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Multi-Item Invoice
          </button>
        </div>
      </div>

      {/* Tab 1: Standard GST Calculator */}
      {activeTab === 'standard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {mode === 'add' ? 'Base / Taxable Amount' : 'Total Amount (GST Inclusive)'}
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount (e.g. 10,000)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#5722AF] transition-all"
                  />
                </div>
              </div>

              {/* GST Rate Selector */}
              <GSTRateSelector
                selectedRate={gstRate}
                onRateChange={(r) => setGstRate(r)}
              />
            </div>

            {/* Practical Examples */}
            <GSTExamples onApplyExample={handleApplyExample} />
          </div>

          {/* Right Column: Result Card & Breakdown (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <GSTResult result={currentResult} onShareURL={handleShareURL} />
            <GSTHistory
              history={history}
              onSelect={handleRestoreHistory}
              onClear={handleClearHistory}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Discount + GST */}
      {activeTab === 'discount' && <DiscountGSTCalculator />}

      {/* Tab 3: Multi-Item Invoice */}
      {activeTab === 'invoice' && <MultiItemGSTCalculator />}

      {/* Educational & Explanatory Section */}
      <GSTHowItWorks />

      {/* FAQ Section */}
      <GSTFAQ />

      {/* Professional Legal Disclaimer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Statutory Compliance Disclaimer:</strong> This GST Calculator is provided for general informational, educational, and computational estimation purposes only. Tax slabs, exemptions, HSN/SAC classifications, and threshold notifications under the Central and State Goods and Services Tax Acts are subject to periodic changes by the GST Council of India. Please verify all invoice details with official GST portal guidelines and consult a qualified Chartered Accountant (CA) or certified tax professional for official tax filing and audit compliance.
        </div>
      </div>
    </div>
  );
};
