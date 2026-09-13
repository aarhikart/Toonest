'use client';

import React from 'react';
import { Zap, Layout, Smartphone, Shield, UserCheck } from 'lucide-react';

const FEATURES = [
  {
    title: 'Fast Processing',
    desc: 'Retrieve authorized public video files in seconds without waiting in long server queues.',
    icon: <Zap className="w-5 h-5 text-[#5722AF]" />,
  },
  {
    title: 'Clean Interface',
    desc: 'A simple paste-and-download workflow designed for speed with zero unnecessary steps.',
    icon: <Layout className="w-5 h-5 text-[#5722AF]" />,
  },
  {
    title: 'Mobile First',
    desc: 'Optimized touch controls, full-width inputs, and fast responses built for smartphones and tablets.',
    icon: <Smartphone className="w-5 h-5 text-[#5722AF]" />,
  },
  {
    title: 'Privacy Focused',
    desc: 'We never request Instagram passwords, track your identity, or store downloaded videos on our servers.',
    icon: <Shield className="w-5 h-5 text-[#5722AF]" />,
  },
  {
    title: 'No Account Required',
    desc: 'Completely free utility that works directly in your web browser without registration.',
    icon: <UserCheck className="w-5 h-5 text-[#5722AF]" />,
  },
];

export function ReelFeatures() {
  return (
    <section className="w-full max-w-4xl mx-auto space-y-6 pt-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
          Why Use ToolNest Reel Downloader?
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Built for simplicity, speed, and privacy
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ title, desc, icon }, idx) => (
          <div
            key={title}
            className={`p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#12151c] shadow-xs space-y-2.5 ${
              idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 flex items-center justify-center">
              {icon}
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
