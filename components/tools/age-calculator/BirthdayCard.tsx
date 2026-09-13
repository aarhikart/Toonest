'use client';

import React from 'react';
import { BirthdayInfo } from '@/lib/age/types';
import { formatDateLong } from '@/lib/age/dates';
import { Cake, Sparkles, Calendar, Clock } from 'lucide-react';

interface BirthdayCardProps {
  birthday: BirthdayInfo;
}

export const BirthdayCard: React.FC<BirthdayCardProps> = ({ birthday }) => {
  const {
    nextBirthday,
    nextAge,
    daysUntil,
    previousBirthday,
    isBirthdayToday,
    birthdayWeekday,
  } = birthday;

  if (isBirthdayToday) {
    return (
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-8 shadow-lg shadow-purple-600/20 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white/20">
            <Cake className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
              Special Day
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              🎉 Happy Birthday!
            </h3>
          </div>
        </div>
        <p className="text-sm sm:text-base text-purple-100 font-medium">
          You are officially turning <span className="font-bold underline text-amber-300">{nextAge - 1} today</span>!
          May this upcoming year be filled with happiness, health, and success.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Birthday Countdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tracking your upcoming celebration
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Turning {nextAge}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Next Birthday Box */}
        <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Next Birthday
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-purple-900 dark:text-purple-100">
            {formatDateLong(nextBirthday)}
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
            Falls on a {birthdayWeekday}
          </p>
        </div>

        {/* Days Remaining Box */}
        <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Time Remaining
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {daysUntil} {daysUntil === 1 ? 'Day' : 'Days'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Until you turn {nextAge} years old
          </p>
        </div>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <span>
          Previous Birthday was on{' '}
          <strong className="text-slate-700 dark:text-slate-300">
            {formatDateLong(previousBirthday)}
          </strong>
        </span>
      </div>
    </div>
  );
};
