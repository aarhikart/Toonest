'use client';

import React from 'react';
import { Film, Download, ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react';

export const ReelDownloaderSEO: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-zinc-700 dark:text-zinc-300">
      <div className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#5722AF] dark:text-[#9B6BE8]">
            <Film className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            About Instagram Reel Downloader
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          ToolNest Instagram Reel Downloader is a lightweight, high-performance web utility built to help you save public Instagram Reels directly to your mobile or desktop device. With instant link parsing, HD video preservation, and crystal-clear audio extraction, you can archive your favorite creative videos without installing third-party apps.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-white">
              <Download className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Full HD MP4</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Download videos in original resolution with zero watermarks or quality loss.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Secure</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              No account login required. Safe and anonymous video downloads directly in your browser.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 dark:text-white">
              <Smartphone className="w-4 h-4 text-purple-500" />
              <span>Mobile Friendly</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Fully optimized for iOS Safari, Android Chrome, and all desktop browsers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
