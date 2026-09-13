'use client';

import React, { useRef, useEffect } from 'react';
import {
  Percent,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Tag,
  Receipt,
  Coffee,
  Scale,
  SlidersHorizontal,
  CircleDollarSign,
} from 'lucide-react';
import { CalculatorTab } from '@/lib/percentage/types';

interface CalculatorTabsProps {
  activeTab: CalculatorTab;
  onSelectTab: (tab: CalculatorTab) => void;
}

interface TabItem {
  id: CalculatorTab;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabItem[] = [
  {
    id: 'percentage',
    label: 'Percentage',
    icon: <Percent className="w-3.5 h-3.5" />,
  },
  {
    id: 'increase',
    label: 'Increase',
    icon: <TrendingUp className="w-3.5 h-3.5" />,
  },
  {
    id: 'decrease',
    label: 'Decrease',
    icon: <TrendingDown className="w-3.5 h-3.5" />,
  },
  {
    id: 'change',
    label: 'Change',
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
  },
  {
    id: 'discount',
    label: 'Discount',
    icon: <Tag className="w-3.5 h-3.5" />,
  },
  {
    id: 'tax',
    label: 'Tax',
    icon: <Receipt className="w-3.5 h-3.5" />,
  },
  {
    id: 'tip',
    label: 'Tip',
    icon: <Coffee className="w-3.5 h-3.5" />,
  },
  {
    id: 'profit_loss',
    label: 'Profit & Loss',
    icon: <CircleDollarSign className="w-3.5 h-3.5" />,
  },
  {
    id: 'difference',
    label: 'Difference',
    icon: <Scale className="w-3.5 h-3.5" />,
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
  },
];

export const CalculatorTabs: React.FC<CalculatorTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view on mobile
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const tab = activeTabRef.current;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.clientWidth;
      const containerWidth = container.clientWidth;

      container.scrollTo({
        left: tabLeft - containerWidth / 2 + tabWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeTab]);

  return (
    <div className="w-full bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
      <div
        ref={containerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5"
        role="tablist"
        aria-label="Percentage Calculator Modes"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : undefined}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-purple-700 text-white shadow-sm shadow-purple-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
