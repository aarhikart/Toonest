'use client';

import React from 'react';
import {
  Zap,
  BarChart,
  Clock,
  ShieldCheck,
  Smartphone,
  CheckCircle,
} from 'lucide-react';

export function WordCounterFeatures() {
  const features = [
    {
      title: 'Instant Counting',
      desc: 'Statistics update dynamically on every keystroke. Zero lag, no submit buttons, and instant recalculation.',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
    },
    {
      title: 'Detailed Text Metrics',
      desc: 'Track words, characters with/without spaces, sentences, paragraphs, lines, and average words per sentence.',
      icon: <BarChart className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8]" />,
    },
    {
      title: 'Reading & Speaking Pace',
      desc: 'Accurately estimate speech and reading durations based on configurable words-per-minute standards.',
      icon: <Clock className="w-5 h-5 text-blue-500" />,
    },
    {
      title: '100% Browser-Based Privacy',
      desc: 'All text analysis executes entirely in memory on your local machine. Nothing is ever saved or sent to a server.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
    },
    {
      title: 'Mobile & Tablet Ready',
      desc: 'Fully optimized for touchscreen devices, responsive stacked grids, and comfortable mobile typing.',
      icon: <Smartphone className="w-5 h-5 text-pink-500" />,
    },
    {
      title: 'Free & Unrestricted',
      desc: 'No registration, no accounts, and no character paywalls. Analyze unlimited text for free anytime.',
      icon: <CheckCircle className="w-5 h-5 text-indigo-500" />,
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
            Engineered for authors, copywriters, students, and digital creators
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
