import React from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { CallStatistics } from '@/lib/call-history/types';

interface StatisticsCardsProps {
  stats: CallStatistics;
}

export function StatisticsCards({ stats }: StatisticsCardsProps) {
  const cards = [
    {
      label: 'Total Calls',
      value: stats.totalCalls.toLocaleString(),
      subtext: `${stats.uniqueNumbersCount} unique numbers`,
      icon: Phone,
      color: 'text-[#5722AF] dark:text-[#B68BFF]',
      bg: 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20',
      border: 'border-zinc-200 dark:border-zinc-800',
    },
    {
      label: 'Incoming Calls',
      value: stats.incomingCalls.toLocaleString(),
      subtext: stats.totalCalls > 0 ? `${Math.round((stats.incomingCalls / stats.totalCalls) * 100)}% of total` : '0%',
      icon: PhoneIncoming,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      label: 'Outgoing Calls',
      value: stats.outgoingCalls.toLocaleString(),
      subtext: stats.totalCalls > 0 ? `${Math.round((stats.outgoingCalls / stats.totalCalls) * 100)}% of total` : '0%',
      icon: PhoneOutgoing,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      label: 'Missed Calls',
      value: stats.missedCalls.toLocaleString(),
      subtext: stats.totalCalls > 0 ? `${Math.round((stats.missedCalls / stats.totalCalls) * 100)}% missed` : '0%',
      icon: PhoneMissed,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/30',
    },
    {
      label: 'Total Duration',
      value: stats.totalDurationFormatted,
      subtext: `${stats.totalDurationSeconds.toLocaleString()} total secs`,
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-100 dark:border-purple-900/30',
    },
    {
      label: 'Average Call Duration',
      value: stats.averageDurationFormatted,
      subtext: 'Per connected call',
      icon: Timer,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-100 dark:border-indigo-900/30',
    },
    {
      label: 'Longest Call',
      value: stats.longestCallFormatted,
      subtext: stats.longestCallRecord?.contactName || stats.longestCallRecord?.phoneNumber || 'None',
      icon: Trophy,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      label: 'Unique Contacts',
      value: stats.uniqueContactsCount.toLocaleString(),
      subtext: `Across ${stats.uniqueNumbersCount} lines`,
      icon: Users,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-100 dark:border-teal-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border ${c.border} shadow-xs hover:shadow-sm transition-all`}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {c.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${c.bg} ${c.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {c.value}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-1">
              {c.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
