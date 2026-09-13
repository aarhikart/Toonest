'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { ColorStop } from '@/lib/gradient/gradientTypes';
import { evaluateGradientContrast } from '@/lib/gradient/gradientEngine';

interface ContrastAccessibilityCheckerProps {
  stops: ColorStop[];
}

export function ContrastAccessibilityChecker({
  stops,
}: ContrastAccessibilityCheckerProps) {
  const samples = evaluateGradientContrast(stops);

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            WCAG 2.1 Accessibility & Multi-Point Contrast
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Evaluating readability contrast across 5 representative sample points of the gradient
          </p>
        </div>
      </div>

      {/* Sample Points Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {samples.map((sample) => (
          <div
            key={sample.position}
            className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3 space-y-2.5"
          >
            {/* Swatch & Position */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Point {sample.position}%
              </span>
              <div
                className="w-5 h-5 rounded-md border border-black/10 dark:border-white/10 shadow-xs"
                style={{ backgroundColor: sample.colorHex }}
              />
            </div>

            <div className="text-[11px] font-mono text-zinc-500 truncate">
              {sample.colorHex}
            </div>

            {/* Contrast vs White */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">vs White:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {sample.contrastWhite}:1
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                    sample.passesAAWhite
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                  }`}
                >
                  {sample.passesAAWhite ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                  AA {sample.passesAAWhite ? 'Pass' : 'Fail'}
                </span>

                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                    sample.passesAAAWhite
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  AAA {sample.passesAAAWhite ? 'Pass' : 'Fail'}
                </span>
              </div>
            </div>

            {/* Contrast vs Dark / Black */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">vs Black:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {sample.contrastBlack}:1
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                    sample.passesAABlack
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
                  }`}
                >
                  {sample.passesAABlack ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                  AA {sample.passesAABlack ? 'Pass' : 'Fail'}
                </span>

                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                    sample.passesAAABlack
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  AAA {sample.passesAAABlack ? 'Pass' : 'Fail'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
