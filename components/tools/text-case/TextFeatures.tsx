'use client';

import React from 'react';
import {
  Zap,
  Layers,
  ShieldCheck,
  Copy,
  Smartphone,
  SlidersHorizontal,
} from 'lucide-react';

export function TextFeatures() {
  const features = [
    {
      title: 'Instant Live Conversion',
      desc: 'No waiting or clicking extra "Submit" buttons. Your text formats immediately as you type or change cases.',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
    },
    {
      title: 'Multiple Case Styles',
      desc: 'Switch seamlessly between UPPERCASE, lowercase, and Title Case with smart punctuation and apostrophe handling.',
      icon: <Layers className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
    {
      title: '100% Browser-Based & Private',
      desc: 'Your text never leaves your device. All calculations are executed locally in memory without server storage.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: 'One-Click Copy & Download',
      desc: 'Instantly copy formatted text to your clipboard or download it as an offline UTF-8 encoded .txt document.',
      icon: <Copy className="w-5 h-5 text-blue-500" />,
    },
    {
      title: 'Advanced Title Case Rules',
      desc: 'Choose between Standard Title Case (with article rules), Every Word, or Sentence-Like capitalization.',
      icon: <SlidersHorizontal className="w-5 h-5 text-purple-500" />,
    },
    {
      title: 'Responsive & Mobile Friendly',
      desc: 'Optimized touch controls, responsive stacked layout on smartphones, and two-column view on desktop monitors.',
      icon: <Smartphone className="w-5 h-5 text-pink-500" />,
    },
  ];

  return (
    <section className="py-12 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Key Features
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Built for writers, students, designers, and developers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-[#12151e] border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-[#5722AF]/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
