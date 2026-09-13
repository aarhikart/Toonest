'use client';

import React from 'react';
import { Calendar, Cpu, Sparkles } from 'lucide-react';

export function AgeHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Enter Date of Birth',
      desc: 'Type your day, month, and year directly or select via the interactive calendar picker. Choose "Today" or calculate your age on any custom date.',
      icon: <Calendar className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
    {
      step: '02',
      title: 'Accurate Calendar Math',
      desc: 'Our browser engine applies Gregorian calendar arithmetic with accurate month-day borrowing and leap-year rules to compute exact years, months, and days.',
      icon: <Cpu className="w-5 h-5 text-blue-500" />,
    },
    {
      step: '03',
      title: 'Explore Life Milestones',
      desc: 'Discover your birthday countdown, total elapsed days/hours/seconds, birth weekday, Western Zodiac sign, and compare ages across family or friends.',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    },
  ];

  return (
    <section className="py-12 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Exact chronological calculation in three straightforward steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center group hover:border-[#5722AF]/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#5722AF] dark:text-[#9B6BE8] mb-1">
                STEP {item.step}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
