'use client';

import React from 'react';
import { Calendar, Cpu, Sparkles } from 'lucide-react';

export function DateTimeHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Enter Dates or Times',
      desc: 'Specify your starting and ending points using our intuitive DD/MM/YYYY calendar pickers or 12h/24h clock inputs with quick presets.',
      icon: <Calendar className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
    {
      step: '02',
      title: 'Real Chronological Math',
      desc: 'Our engine applies Gregorian calendar arithmetic, month-day borrowing, leap-year days, and midnight rollover without rough decimal division.',
      icon: <Cpu className="w-5 h-5 text-blue-500" />,
    },
    {
      step: '03',
      title: 'Inspect Exact Breakdown',
      desc: 'Discover exact calendar years, months, and days alongside working business days, weekend counts, total hours, minutes, and shareable links.',
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
            Exact chronological and elapsed time calculation in three effortless steps
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
