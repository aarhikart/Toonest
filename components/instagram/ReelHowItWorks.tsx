'use client';

import React from 'react';
import { Copy, Link2, Download } from 'lucide-react';

const STEPS = [
  {
    step: '1',
    title: 'Copy Reel Link',
    desc: 'Open Instagram on your phone or computer, tap the share icon on the Reel, and copy its link.',
    icon: <Copy className="w-5 h-5 text-[#5722AF]" />,
  },
  {
    step: '2',
    title: 'Paste the Link',
    desc: 'Paste the copied URL into the box above and click the "Get Reel" button to load the media.',
    icon: <Link2 className="w-5 h-5 text-[#5722AF]" />,
  },
  {
    step: '3',
    title: 'Download MP4',
    desc: 'Review the video preview and click "Download Reel" to save the high-definition video with audio.',
    icon: <Download className="w-5 h-5 text-[#5722AF]" />,
  },
];

export function ReelHowItWorks() {
  return (
    <section className="w-full max-w-4xl mx-auto space-y-6 pt-4">
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
          How to Download an Instagram Reel
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Save public video reels in three quick and easy steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map(({ step, title, desc, icon }) => (
          <div
            key={step}
            className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#12151c] shadow-xs flex flex-col justify-between space-y-3 relative"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20">
                {icon}
              </div>
              <span className="text-2xl font-black text-zinc-200 dark:text-zinc-800">
                0{step}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                {title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
