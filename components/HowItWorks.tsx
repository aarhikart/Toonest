'use client';

import React from 'react';
import { Upload, Sliders, Download } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: '1. Upload',
      description: 'Select or drag your images into the tool.',
      icon: <Upload className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
    {
      step: '02',
      title: '2. Customize',
      description: 'Choose your naming pattern and preview the results.',
      icon: <Sliders className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
    {
      step: '03',
      title: '3. Download',
      description: 'Rename your images and download them individually or as a ZIP.',
      icon: <Download className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider mb-2">
            Simple 3-Step Process
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            How It Works
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Batch rename hundreds of image files with zero learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map(({ step, title, description, icon }) => (
            <div
              key={step}
              className="bg-white dark:bg-[#131722] p-6 sm:p-7 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs relative group hover:border-[#5722AF]/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 flex items-center justify-center">
                  {icon}
                </div>
                <span className="text-2xl font-extrabold text-zinc-200 dark:text-zinc-800 font-mono group-hover:text-[#5722AF]/30 transition-colors">
                  {step}
                </span>
              </div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                {title}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
