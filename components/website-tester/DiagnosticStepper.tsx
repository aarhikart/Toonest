'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { DiagnosticStep } from '@/lib/website-tester/types';

interface DiagnosticStepperProps {
  steps: DiagnosticStep[];
  isLoading: boolean;
}

export function DiagnosticStepper({ steps, isLoading }: DiagnosticStepperProps) {
  const getStepIcon = (state: DiagnosticStep['state']) => {
    switch (state) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'skipped':
        return <Clock className="w-4 h-4 text-zinc-400" />;
      case 'pending':
      default:
        return <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />;
    }
  };

  const getStepBadge = (state: DiagnosticStep['state']) => {
    switch (state) {
      case 'running':
        return 'border-[#5722AF]/30 dark:border-[#9B6BE8]/30 bg-[#5722AF]/5 text-[#5722AF] dark:text-[#9B6BE8]';
      case 'success':
        return 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300';
      case 'warning':
        return 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300';
      case 'error':
        return 'border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300';
      default:
        return 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Diagnostic Sequence</span>
            {isLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5722AF] dark:text-[#9B6BE8] bg-[#5722AF]/10 px-2 py-0.5 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                Testing...
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-500">
            Automated layered inspection: URL validation → Network reachability → HTTP headers → Browser → Iframe policy → Upload controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {steps.map((step, index) => {
          const badgeClass = getStepBadge(step.state);

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${badgeClass}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-400">0{index + 1}</span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{step.label}</span>
                </div>
                <div className="shrink-0 pt-0.5">{getStepIcon(step.state)}</div>
              </div>

              <div className="pt-2 text-[11px] leading-tight">
                {step.message ? (
                  <span className="font-medium">{step.message}</span>
                ) : (
                  <span className="text-zinc-400">Waiting for test...</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
