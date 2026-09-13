'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Check,
} from 'lucide-react';
import { DEFAULT_RESPONSIVE_ISSUES, DEFAULT_ACCESSIBILITY_CHECKS } from '@/lib/responsive/devices';

interface ResponsiveChecksProps {
  selectedIssues: string[];
  onToggleIssue: (id: string) => void;
  accessibilityChecks: string[];
  onToggleAccessibility: (id: string) => void;
}

export const ResponsiveChecks: React.FC<ResponsiveChecksProps> = ({
  selectedIssues,
  onToggleIssue,
  accessibilityChecks,
  onToggleAccessibility,
}) => {
  return (
    <div className="space-y-6">
      {/* Overflow & Layout Detection Notice */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              Automated DOM &amp; Overflow Inspection
            </h4>
            <p className="text-xs text-zinc-500">
              Cross-origin security restrictions note
            </p>
          </div>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Cross-Origin Security Policy Notice</span>
          </div>
          <p className="leading-relaxed">
            Standard web browsers strictly disallow inspecting the inner DOM dimensions of third-party websites embedded via iframe.
            If your target site is cross-origin, automatic DOM overflow calculation is restricted. Use the manual checklist below to log any observed clipping, horizontal scrollbars, or broken layout elements.
          </p>
        </div>
      </div>

      {/* Manual Responsive Issues Checklist */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Responsive Layout Issues Checklist</span>
          </h4>
          <span className="text-xs font-semibold text-zinc-500">
            {selectedIssues.length} Flagged
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEFAULT_RESPONSIVE_ISSUES.map((issue) => {
            const isChecked = selectedIssues.includes(issue.id);
            return (
              <label
                key={issue.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleIssue(issue.id)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs leading-relaxed font-medium">
                  {issue.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Accessibility & Readability Checklist */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Mobile Accessibility Checks</span>
          </h4>
          <span className="text-xs font-semibold text-zinc-500">
            {accessibilityChecks.length} / {DEFAULT_ACCESSIBILITY_CHECKS.length} Passed
          </span>
        </div>

        <div className="space-y-2.5">
          {DEFAULT_ACCESSIBILITY_CHECKS.map((check) => {
            const isChecked = accessibilityChecks.includes(check.id);
            return (
              <label
                key={check.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleAccessibility(check.id)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <p className="text-xs font-bold leading-tight">{check.label}</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{check.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
