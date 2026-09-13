'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalculatorTab,
  PrecisionMode,
  CurrencySymbol,
  TaxMode,
  CustomOperation,
  CalculationResult,
  CalculationHistoryItem,
} from '@/lib/percentage/types';
import {
  calculatePercentageOf,
  calculatePercentageFromValues,
  calculatePercentageIncrease,
  calculatePercentageDecrease,
  calculatePercentageChange,
  calculateDiscount,
  calculateTax,
  calculateTip,
  calculateProfitLoss,
  calculatePercentageDifference,
  calculateCustomOperation,
} from '@/lib/percentage/calculations';
import { CalculatorTabs } from './CalculatorTabs';
import { PrecisionSelector } from './PrecisionSelector';
import { ResultCard } from './ResultCard';
import { HistoryPanel } from './HistoryPanel';
import { PercentageReference } from './PercentageReference';
import {
  PercentageExamples,
  PercentageExampleItem,
} from './PercentageExamples';

// Tab Forms
import { PercentageTab } from './tabs/PercentageTab';
import { IncreaseTab } from './tabs/IncreaseTab';
import { DecreaseTab } from './tabs/DecreaseTab';
import { ChangeTab } from './tabs/ChangeTab';
import { DiscountTab } from './tabs/DiscountTab';
import { TaxTab } from './tabs/TaxTab';
import { TipTab } from './tabs/TipTab';
import { ProfitLossTab } from './tabs/ProfitLossTab';
import { DifferenceTab } from './tabs/DifferenceTab';
import { CustomTab } from './tabs/CustomTab';

import { History, Share2, Check } from 'lucide-react';

const HISTORY_KEY = 'toolnest_percentage_history';

export const PercentageCalculator: React.FC = () => {
  const searchParams = useSearchParams();

  // Active Tab & Precision
  const [activeTab, setActiveTab] = useState<CalculatorTab>('percentage');
  const [precision, setPrecision] = useState<PrecisionMode>('auto');

  // History State
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  // Tab 1: Percentage
  const [pctMode, setPctMode] = useState<'what_is_x_of_y' | 'x_is_what_percent_of_y'>('what_is_x_of_y');
  const [pctX, setPctX] = useState('20');
  const [pctY, setPctY] = useState('500');

  // Tab 2: Increase
  const [incOrig, setIncOrig] = useState('100');
  const [incNew, setIncNew] = useState('125');

  // Tab 3: Decrease
  const [decOrig, setDecOrig] = useState('500');
  const [decNew, setDecNew] = useState('400');

  // Tab 4: Change
  const [chgOrig, setChgOrig] = useState('100');
  const [chgNew, setChgNew] = useState('150');

  // Tab 5: Discount
  const [discPrice, setDiscPrice] = useState('2000');
  const [discPercent, setDiscPercent] = useState('20');
  const [discCurrency, setDiscCurrency] = useState<CurrencySymbol>('₹');

  // Tab 6: Tax
  const [taxMode, setTaxMode] = useState<TaxMode>('add_tax');
  const [taxPrice, setTaxPrice] = useState('1000');
  const [taxPercent, setTaxPercent] = useState('18');
  const [taxCurrency, setTaxCurrency] = useState<CurrencySymbol>('₹');

  // Tab 7: Tip
  const [tipBill, setTipBill] = useState('2500');
  const [tipPercent, setTipPercent] = useState('10');
  const [tipPeople, setTipPeople] = useState('1');
  const [tipCurrency, setTipCurrency] = useState<CurrencySymbol>('₹');

  // Tab 8: Profit & Loss
  const [plCost, setPlCost] = useState('100');
  const [plSell, setPlSell] = useState('125');
  const [plCurrency, setPlCurrency] = useState<CurrencySymbol>('₹');

  // Tab 9: Difference
  const [diffA, setDiffA] = useState('10');
  const [diffB, setDiffB] = useState('20');

  // Tab 10: Custom
  const [custBase, setCustBase] = useState('500');
  const [custPercent, setCustPercent] = useState('20');
  const [custOp, setCustOp] = useState<CustomOperation>('add_percent');

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Parse URL search parameters on mount
  useEffect(() => {
    if (!searchParams) return;
    const tabParam = searchParams.get('tab') as CalculatorTab | null;
    if (tabParam) setActiveTab(tabParam);

    if (tabParam === 'percentage') {
      const mode = searchParams.get('mode');
      if (mode === 'x_is_what_percent_of_y' || mode === 'what_is_x_of_y') setPctMode(mode);
      if (searchParams.get('x')) setPctX(searchParams.get('x')!);
      if (searchParams.get('y')) setPctY(searchParams.get('y')!);
    } else if (tabParam === 'increase') {
      if (searchParams.get('orig')) setIncOrig(searchParams.get('orig')!);
      if (searchParams.get('new')) setIncNew(searchParams.get('new')!);
    } else if (tabParam === 'decrease') {
      if (searchParams.get('orig')) setDecOrig(searchParams.get('orig')!);
      if (searchParams.get('new')) setDecNew(searchParams.get('new')!);
    } else if (tabParam === 'change') {
      if (searchParams.get('orig')) setChgOrig(searchParams.get('orig')!);
      if (searchParams.get('new')) setChgNew(searchParams.get('new')!);
    } else if (tabParam === 'discount') {
      if (searchParams.get('price')) setDiscPrice(searchParams.get('price')!);
      if (searchParams.get('discount')) setDiscPercent(searchParams.get('discount')!);
      if (searchParams.get('currency')) setDiscCurrency(searchParams.get('currency')!);
    } else if (tabParam === 'tax') {
      if (searchParams.get('price')) setTaxPrice(searchParams.get('price')!);
      if (searchParams.get('tax')) setTaxPercent(searchParams.get('tax')!);
      if (searchParams.get('mode')) setTaxMode(searchParams.get('mode') as TaxMode);
      if (searchParams.get('currency')) setTaxCurrency(searchParams.get('currency')!);
    } else if (tabParam === 'tip') {
      if (searchParams.get('bill')) setTipBill(searchParams.get('bill')!);
      if (searchParams.get('tip')) setTipPercent(searchParams.get('tip')!);
      if (searchParams.get('people')) setTipPeople(searchParams.get('people')!);
      if (searchParams.get('currency')) setTipCurrency(searchParams.get('currency')!);
    } else if (tabParam === 'profit_loss') {
      if (searchParams.get('cost')) setPlCost(searchParams.get('cost')!);
      if (searchParams.get('sell')) setPlSell(searchParams.get('sell')!);
      if (searchParams.get('currency')) setPlCurrency(searchParams.get('currency')!);
    } else if (tabParam === 'difference') {
      if (searchParams.get('a')) setDiffA(searchParams.get('a')!);
      if (searchParams.get('b')) setDiffB(searchParams.get('b')!);
    } else if (tabParam === 'custom') {
      if (searchParams.get('base')) setCustBase(searchParams.get('base')!);
      if (searchParams.get('percent')) setCustPercent(searchParams.get('percent')!);
      if (searchParams.get('op')) setCustOp(searchParams.get('op') as CustomOperation);
    }
  }, [searchParams]);

  // Execute Live Calculations based on active tab
  const currentResult: CalculationResult | null = useMemo(() => {
    switch (activeTab) {
      case 'percentage': {
        const x = parseFloat(pctX);
        const y = parseFloat(pctY);
        if (isNaN(x) || isNaN(y)) return null;
        return pctMode === 'what_is_x_of_y'
          ? calculatePercentageOf(x, y, precision)
          : calculatePercentageFromValues(x, y, precision);
      }
      case 'increase': {
        const o = parseFloat(incOrig);
        const n = parseFloat(incNew);
        if (isNaN(o) || isNaN(n)) return null;
        return calculatePercentageIncrease(o, n, precision);
      }
      case 'decrease': {
        const o = parseFloat(decOrig);
        const n = parseFloat(decNew);
        if (isNaN(o) || isNaN(n)) return null;
        return calculatePercentageDecrease(o, n, precision);
      }
      case 'change': {
        const o = parseFloat(chgOrig);
        const n = parseFloat(chgNew);
        if (isNaN(o) || isNaN(n)) return null;
        return calculatePercentageChange(o, n, precision);
      }
      case 'discount': {
        const p = parseFloat(discPrice);
        const d = parseFloat(discPercent);
        if (isNaN(p) || isNaN(d)) return null;
        return calculateDiscount(p, d, discCurrency, precision);
      }
      case 'tax': {
        const p = parseFloat(taxPrice);
        const t = parseFloat(taxPercent);
        if (isNaN(p) || isNaN(t)) return null;
        return calculateTax(p, t, taxMode, taxCurrency, precision);
      }
      case 'tip': {
        const b = parseFloat(tipBill);
        const t = parseFloat(tipPercent);
        const p = parseInt(tipPeople, 10) || 1;
        if (isNaN(b) || isNaN(t)) return null;
        return calculateTip(b, t, p, tipCurrency, precision);
      }
      case 'profit_loss': {
        const c = parseFloat(plCost);
        const s = parseFloat(plSell);
        if (isNaN(c) || isNaN(s)) return null;
        return calculateProfitLoss(c, s, plCurrency, precision);
      }
      case 'difference': {
        const a = parseFloat(diffA);
        const b = parseFloat(diffB);
        if (isNaN(a) || isNaN(b)) return null;
        return calculatePercentageDifference(a, b, precision);
      }
      case 'custom': {
        const base = parseFloat(custBase);
        const pct = parseFloat(custPercent);
        if (isNaN(base) || isNaN(pct)) return null;
        return calculateCustomOperation(base, pct, custOp, precision);
      }
      default:
        return null;
    }
  }, [
    activeTab,
    precision,
    pctMode,
    pctX,
    pctY,
    incOrig,
    incNew,
    decOrig,
    decNew,
    chgOrig,
    chgNew,
    discPrice,
    discPercent,
    discCurrency,
    taxMode,
    taxPrice,
    taxPercent,
    taxCurrency,
    tipBill,
    tipPercent,
    tipPeople,
    tipCurrency,
    plCost,
    plSell,
    plCurrency,
    diffA,
    diffB,
    custBase,
    custPercent,
    custOp,
  ]);

  // Save successful calculations to history
  const saveToHistory = useCallback(() => {
    if (!currentResult || currentResult.isError) return;

    let title = 'Calculation';
    let inputs: Record<string, any> = {};

    switch (activeTab) {
      case 'percentage':
        title = pctMode === 'what_is_x_of_y' ? `${pctX}% of ${pctY}` : `${pctX} as % of ${pctY}`;
        inputs = { mode: pctMode, valX: pctX, valY: pctY };
        break;
      case 'increase':
        title = `Increase from ${incOrig} to ${incNew}`;
        inputs = { original: incOrig, newValue: incNew };
        break;
      case 'decrease':
        title = `Decrease from ${decOrig} to ${decNew}`;
        inputs = { original: decOrig, newValue: decNew };
        break;
      case 'change':
        title = `Change: ${chgOrig} → ${chgNew}`;
        inputs = { original: chgOrig, newValue: chgNew };
        break;
      case 'discount':
        title = `${discPercent}% off ${discCurrency}${discPrice}`;
        inputs = { originalPrice: discPrice, discountPercent: discPercent, currency: discCurrency };
        break;
      case 'tax':
        title = `${taxPercent}% tax on ${taxCurrency}${taxPrice}`;
        inputs = { price: taxPrice, taxPercent: taxPercent, mode: taxMode, currency: taxCurrency };
        break;
      case 'tip':
        title = `${tipPercent}% tip on ${tipCurrency}${tipBill}`;
        inputs = { billAmount: tipBill, tipPercent: tipPercent, numPeople: tipPeople, currency: tipCurrency };
        break;
      case 'profit_loss':
        title = `CP: ${plCurrency}${plCost} | SP: ${plCurrency}${plSell}`;
        inputs = { costPrice: plCost, sellingPrice: plSell, currency: plCurrency };
        break;
      case 'difference':
        title = `Difference: ${diffA} & ${diffB}`;
        inputs = { valA: diffA, valB: diffB };
        break;
      case 'custom':
        title = `${custBase} & ${custPercent}% (${custOp})`;
        inputs = { baseValue: custBase, percentValue: custPercent, operation: custOp };
        break;
    }

    const newItem: CalculationHistoryItem = {
      id: `calc_${Date.now()}`,
      timestamp: Date.now(),
      tab: activeTab,
      title,
      result: currentResult.primaryValue,
      formula: currentResult.formulaExample,
      inputs,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.title !== title)].slice(0, 25);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, [
    currentResult,
    activeTab,
    pctMode,
    pctX,
    pctY,
    incOrig,
    incNew,
    decOrig,
    decNew,
    chgOrig,
    chgNew,
    discPrice,
    discPercent,
    discCurrency,
    taxPrice,
    taxPercent,
    taxMode,
    taxCurrency,
    tipBill,
    tipPercent,
    tipPeople,
    tipCurrency,
    plCost,
    plSell,
    plCurrency,
    diffA,
    diffB,
    custBase,
    custPercent,
    custOp,
  ]);

  // Automatically record to history with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToHistory();
    }, 1200);
    return () => clearTimeout(timer);
  }, [saveToHistory]);

  // Clear current active tab inputs
  const handleReset = () => {
    switch (activeTab) {
      case 'percentage':
        setPctX('');
        setPctY('');
        break;
      case 'increase':
        setIncOrig('');
        setIncNew('');
        break;
      case 'decrease':
        setDecOrig('');
        setDecNew('');
        break;
      case 'change':
        setChgOrig('');
        setChgNew('');
        break;
      case 'discount':
        setDiscPrice('');
        setDiscPercent('');
        break;
      case 'tax':
        setTaxPrice('');
        setTaxPercent('');
        break;
      case 'tip':
        setTipBill('');
        setTipPercent('');
        setTipPeople('1');
        break;
      case 'profit_loss':
        setPlCost('');
        setPlSell('');
        break;
      case 'difference':
        setDiffA('');
        setDiffB('');
        break;
      case 'custom':
        setCustBase('');
        setCustPercent('');
        break;
    }
  };

  // Generate shareable URL
  const handleShare = async () => {
    const params = new URLSearchParams();
    params.set('tab', activeTab);

    switch (activeTab) {
      case 'percentage':
        params.set('mode', pctMode);
        params.set('x', pctX);
        params.set('y', pctY);
        break;
      case 'increase':
        params.set('orig', incOrig);
        params.set('new', incNew);
        break;
      case 'decrease':
        params.set('orig', decOrig);
        params.set('new', decNew);
        break;
      case 'change':
        params.set('orig', chgOrig);
        params.set('new', chgNew);
        break;
      case 'discount':
        params.set('price', discPrice);
        params.set('discount', discPercent);
        params.set('currency', discCurrency);
        break;
      case 'tax':
        params.set('price', taxPrice);
        params.set('tax', taxPercent);
        params.set('mode', taxMode);
        params.set('currency', taxCurrency);
        break;
      case 'tip':
        params.set('bill', tipBill);
        params.set('tip', tipPercent);
        params.set('people', tipPeople);
        params.set('currency', tipCurrency);
        break;
      case 'profit_loss':
        params.set('cost', plCost);
        params.set('sell', plSell);
        params.set('currency', plCurrency);
        break;
      case 'difference':
        params.set('a', diffA);
        params.set('b', diffB);
        break;
      case 'custom':
        params.set('base', custBase);
        params.set('percent', custPercent);
        params.set('op', custOp);
        break;
    }

    const shareUrl = `${window.location.origin}/percentage-calculator?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSharedToast(true);
      setTimeout(() => setSharedToast(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Reuse calculation from history
  const handleReuseHistory = (item: CalculationHistoryItem) => {
    setActiveTab(item.tab);
    const inp = item.inputs;

    switch (item.tab) {
      case 'percentage':
        if (inp.mode) setPctMode(inp.mode);
        if (inp.valX) setPctX(inp.valX);
        if (inp.valY) setPctY(inp.valY);
        break;
      case 'increase':
        if (inp.original) setIncOrig(inp.original);
        if (inp.newValue) setIncNew(inp.newValue);
        break;
      case 'decrease':
        if (inp.original) setDecOrig(inp.original);
        if (inp.newValue) setDecNew(inp.newValue);
        break;
      case 'change':
        if (inp.original) setChgOrig(inp.original);
        if (inp.newValue) setChgNew(inp.newValue);
        break;
      case 'discount':
        if (inp.originalPrice) setDiscPrice(inp.originalPrice);
        if (inp.discountPercent) setDiscPercent(inp.discountPercent);
        if (inp.currency) setDiscCurrency(inp.currency);
        break;
      case 'tax':
        if (inp.price) setTaxPrice(inp.price);
        if (inp.taxPercent) setTaxPercent(inp.taxPercent);
        if (inp.mode) setTaxMode(inp.mode);
        if (inp.currency) setTaxCurrency(inp.currency);
        break;
      case 'tip':
        if (inp.billAmount) setTipBill(inp.billAmount);
        if (inp.tipPercent) setTipPercent(inp.tipPercent);
        if (inp.numPeople) setTipPeople(inp.numPeople);
        if (inp.currency) setTipCurrency(inp.currency);
        break;
      case 'profit_loss':
        if (inp.costPrice) setPlCost(inp.costPrice);
        if (inp.sellingPrice) setPlSell(inp.sellingPrice);
        if (inp.currency) setPlCurrency(inp.currency);
        break;
      case 'difference':
        if (inp.valA) setDiffA(inp.valA);
        if (inp.valB) setDiffB(inp.valB);
        break;
      case 'custom':
        if (inp.baseValue) setCustBase(inp.baseValue);
        if (inp.percentValue) setCustPercent(inp.percentValue);
        if (inp.operation) setCustOp(inp.operation);
        break;
    }
    setIsHistoryOpen(false);
  };

  // Populate from Example
  const handleSelectExample = (ex: PercentageExampleItem) => {
    setActiveTab(ex.tab);
    const inp = ex.inputs;

    switch (ex.tab) {
      case 'percentage':
        if (inp.mode) setPctMode(inp.mode);
        if (inp.valX) setPctX(inp.valX);
        if (inp.valY) setPctY(inp.valY);
        break;
      case 'increase':
        if (inp.original) setIncOrig(inp.original);
        if (inp.newValue) setIncNew(inp.newValue);
        break;
      case 'decrease':
        if (inp.original) setDecOrig(inp.original);
        if (inp.newValue) setDecNew(inp.newValue);
        break;
      case 'discount':
        if (inp.originalPrice) setDiscPrice(inp.originalPrice);
        if (inp.discountPercent) setDiscPercent(inp.discountPercent);
        if (inp.currency) setDiscCurrency(inp.currency);
        break;
      case 'tax':
        if (inp.price) setTaxPrice(inp.price);
        if (inp.taxPercent) setTaxPercent(inp.taxPercent);
        if (inp.mode) setTaxMode(inp.mode);
        if (inp.currency) setTaxCurrency(inp.currency);
        break;
      case 'tip':
        if (inp.billAmount) setTipBill(inp.billAmount);
        if (inp.tipPercent) setTipPercent(inp.tipPercent);
        if (inp.numPeople) setTipPeople(inp.numPeople);
        if (inp.currency) setTipCurrency(inp.currency);
        break;
    }

    // Scroll to top of calculator smoothly
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Top Toolbar: Precision & History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <PrecisionSelector precision={precision} onChange={setPrecision} />

        <div className="flex items-center gap-2 self-start sm:self-center">
          {sharedToast && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5" />
              URL Copied!
            </span>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
            title="Copy shareable link for this calculation"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>History</span>
            {history.length > 0 && (
              <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded-full font-bold">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Calculator Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-purple-950/5 p-6 sm:p-8 space-y-6">
        {/* Navigation Tabs */}
        <CalculatorTabs activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* 2-Column Responsive Layout: Inputs on Left (7 cols), Result on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {activeTab === 'percentage' && (
                <PercentageTab
                  mode={pctMode}
                  setMode={setPctMode}
                  valX={pctX}
                  setValX={setPctX}
                  valY={pctY}
                  setValY={setPctY}
                />
              )}
              {activeTab === 'increase' && (
                <IncreaseTab
                  original={incOrig}
                  setOriginal={setIncOrig}
                  newValue={incNew}
                  setNewValue={setIncNew}
                />
              )}
              {activeTab === 'decrease' && (
                <DecreaseTab
                  original={decOrig}
                  setOriginal={setDecOrig}
                  newValue={decNew}
                  setNewValue={setDecNew}
                />
              )}
              {activeTab === 'change' && (
                <ChangeTab
                  original={chgOrig}
                  setOriginal={setChgOrig}
                  newValue={chgNew}
                  setNewValue={setChgNew}
                />
              )}
              {activeTab === 'discount' && (
                <DiscountTab
                  originalPrice={discPrice}
                  setOriginalPrice={setDiscPrice}
                  discountPercent={discPercent}
                  setDiscountPercent={setDiscPercent}
                  currency={discCurrency}
                  setCurrency={setDiscCurrency}
                />
              )}
              {activeTab === 'tax' && (
                <TaxTab
                  mode={taxMode}
                  setMode={setTaxMode}
                  price={taxPrice}
                  setPrice={setTaxPrice}
                  taxPercent={taxPercent}
                  setTaxPercent={setTaxPercent}
                  currency={taxCurrency}
                  setCurrency={setTaxCurrency}
                />
              )}
              {activeTab === 'tip' && (
                <TipTab
                  billAmount={tipBill}
                  setBillAmount={setTipBill}
                  tipPercent={tipPercent}
                  setTipPercent={setTipPercent}
                  numPeople={tipPeople}
                  setNumPeople={setTipPeople}
                  currency={tipCurrency}
                  setCurrency={setTipCurrency}
                />
              )}
              {activeTab === 'profit_loss' && (
                <ProfitLossTab
                  costPrice={plCost}
                  setCostPrice={setPlCost}
                  sellingPrice={plSell}
                  setSellingPrice={setPlSell}
                  currency={plCurrency}
                  setCurrency={setPlCurrency}
                />
              )}
              {activeTab === 'difference' && (
                <DifferenceTab
                  valA={diffA}
                  setValA={setDiffA}
                  valB={diffB}
                  setValB={setDiffB}
                />
              )}
              {activeTab === 'custom' && (
                <CustomTab
                  baseValue={custBase}
                  setBaseValue={setCustBase}
                  percentValue={custPercent}
                  setPercentValue={setCustPercent}
                  operation={custOp}
                  setOperation={setCustOp}
                />
              )}
            </div>

            {/* Live Indicator */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live mathematical calculation active
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
              >
                Clear Inputs
              </button>
            </div>
          </div>

          {/* Right Result Column */}
          <div className="lg:col-span-5">
            <ResultCard
              result={currentResult}
              onReset={handleReset}
              onShare={handleShare}
            />
          </div>
        </div>
      </div>

      {/* Common Percentage Examples Grid */}
      <PercentageExamples onSelectExample={handleSelectExample} />

      {/* Quick Reference Table */}
      <PercentageReference />

      {/* Local History Drawer */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={history}
        onReuse={handleReuseHistory}
        onDelete={(id) => {
          setHistory((prev) => {
            const updated = prev.filter((i) => i.id !== id);
            try {
              localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }}
        onClear={() => {
          setHistory([]);
          try {
            localStorage.removeItem(HISTORY_KEY);
          } catch {}
        }}
      />
    </div>
  );
};
