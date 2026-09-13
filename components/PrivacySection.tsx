'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, Cpu } from 'lucide-react';

export function PrivacySection() {
  return (
    <section id="privacy-section" className="py-12 sm:py-16 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-[#131722] rounded-3xl border border-zinc-200 dark:border-zinc-800/80 p-8 sm:p-10 shadow-xs relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5722AF]/5 dark:bg-[#5722AF]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0 border border-[#5722AF]/20">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Server Uploads</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Private by design
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                Your images are processed locally in your browser whenever possible. Your files don&apos;t need to be uploaded to a server just to rename them.
              </p>
            </div>
          </div>

          {/* Key privacy points */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-zinc-600 dark:text-zinc-400">
                <strong>No Cloud Storage:</strong> Images never touch external servers or third-party databases.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
              <span className="text-zinc-600 dark:text-zinc-400">
                <strong>Client-Side Engine:</strong> Renaming and ZIP packaging execute on your local CPU.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-zinc-600 dark:text-zinc-400">
                <strong>Memory Cleanup:</strong> Temporary browser memory links are automatically released.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
