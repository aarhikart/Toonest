'use client';

import React, { useState } from 'react';
import { Columns, X, ArrowLeftRight } from 'lucide-react';
import { GradientConfig } from '@/lib/gradient/gradientTypes';
import { GRADIENT_PRESETS } from '@/lib/gradient/gradientPresets';
import { generateGradientCss } from '@/lib/gradient/gradientEngine';

interface GradientComparisonViewProps {
  currentConfig: GradientConfig;
  onClose: () => void;
  onApplyComparison: (config: GradientConfig) => void;
}

export function GradientComparisonView({
  currentConfig,
  onClose,
  onApplyComparison,
}: GradientComparisonViewProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    GRADIENT_PRESETS[1].id
  );

  const compPreset =
    GRADIENT_PRESETS.find((p) => p.id === selectedPresetId) || GRADIENT_PRESETS[1];

  const currentCss = generateGradientCss(currentConfig);
  const compCss = generateGradientCss(compPreset.config);

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Gradient Comparison
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Compare your current gradient side-by-side with other presets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Selector for Comparison */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-zinc-600 dark:text-zinc-400">
          Compare Against:
        </span>
        <select
          value={selectedPresetId}
          onChange={(e) => setSelectedPresetId(e.target.value)}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-medium outline-none"
        >
          {GRADIENT_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      {/* Side-by-Side (Desktop) / Stacked (Mobile) Visual Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Current Gradient */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <span>Current: {currentConfig.name}</span>
            <span className="text-[10px] text-zinc-400 font-mono">Active</span>
          </div>
          <div
            className="w-full h-44 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700"
            style={{ background: currentCss }}
          />
        </div>

        {/* Comparison Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <span>Preset: {compPreset.name}</span>
            <button
              type="button"
              onClick={() => onApplyComparison(compPreset.config)}
              className="text-[11px] font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline"
            >
              Switch to This
            </button>
          </div>
          <div
            className="w-full h-44 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700"
            style={{ background: compCss }}
          />
        </div>
      </div>
    </div>
  );
}
