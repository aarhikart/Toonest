'use client';

import React from 'react';
import { Calendar, Clock, CalendarClock, Globe } from 'lucide-react';

export type MainTabType = 'date' | 'time' | 'datetime' | 'timezone';

interface DateTimeTabsProps {
  activeTab: MainTabType;
  onChange: (tab: MainTabType) => void;
}

export const DateTimeTabs: React.FC<DateTimeTabsProps> = ({
  activeTab,
  onChange,
}) => {
  const tabs: { id: MainTabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'date',
      label: 'Date Difference',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'time',
      label: 'Time Difference',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'datetime',
      label: 'Date & Time',
      icon: <CalendarClock className="w-4 h-4" />,
    },
    {
      id: 'timezone',
      label: 'Time Zones',
      icon: <Globe className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto shadow-xs">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span
              className={
                isActive
                  ? 'text-[#5722AF] dark:text-[#9B6BE8]'
                  : 'text-slate-400 dark:text-slate-500'
              }
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
