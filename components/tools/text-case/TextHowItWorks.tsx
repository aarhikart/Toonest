'use client';

import React from 'react';
import { Edit3, CheckCircle2, Download, ArrowRight } from 'lucide-react';

export function TextHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Enter Your Text',
      desc: 'Type or paste any text directly into the input area. You can convert short phrases or large paragraphs.',
      icon: <Edit3 className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
    {
      step: '02',
      title: 'Choose Case Style',
      desc: 'Select UPPERCASE, lowercase, or Title Case. The converted text updates instantly in real time as you click.',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    },
    {
      step: '03',
      title: 'Copy or Download',
      desc: 'One-click copy your formatted result directly to your clipboard or download it as a ready-to-use .txt file.',
      icon: <Download className="w-5 h-5 text-blue-500" />,
    },
  ];

  return (
    <section className="py-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Convert any text in three simple, instant steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col items-center text-center group hover:border-[#5722AF]/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#5722AF] dark:text-[#9B6BE8] mb-1">
                STEP {item.step}
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
