'use client';

import React, { useState } from 'react';
import { Columns, X, ArrowLeftRight } from 'lucide-react';
import {
  BorderRadiusConfig,
  ShapePreset,
} from '@/lib/borderRadius/borderRadiusTypes';
import { SHAPE_PRESETS } from '@/lib/borderRadius/borderRadiusPresets';
import {
  generateBorderRadiusCss,
  formatCornerValues,
} from '@/lib/borderRadius/borderRadiusEngine';

interface RadiusComparisonViewProps {
  currentConfig: BorderRadiusConfig;
  onClose: () => void;
  onApplyPreset: (preset: ShapePreset) => void;
}

export function RadiusComparisonView({
  currentConfig,
  onClose,
  onApplyPreset,
}: RadiusComparisonViewProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    SHAPE_PRESETS[1].id
  );

  const compPreset =
    SHAPE_PRESETS.find((p) => p.id === selectedPresetId) || SHAPE_PRESETS[1];

  const currentCss = generateBorderRadiusCss(currentConfig);

  const hStr = formatCornerValues(compPreset.horizontal, compPreset.unit, true);
  const vStr = compPreset.vertical
    ? formatCornerValues(compPreset.vertical, compPreset.unit, true)
    : null;
  const compCss = vStr ? `${hStr} / ${vStr}` : hStr;

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Shape Comparison Studio
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Compare your live radius configuration side-by-side with curated presets
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-zinc-500">Compare With:</span>
        <select
          value={selectedPresetId}
          onChange={(e) => setSelectedPresetId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#12121A] text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#5722AF]"
        >
          {SHAPE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Current Active Shape */}
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-white">
              Your Current Shape
            </span>
            <span className="text-[11px] font-mono text-[#5722AF] dark:text-[#9B6BE8] font-semibold truncate max-w-[180px]">
              {currentCss}
            </span>
          </div>

          <div className="h-44 rounded-lg bg-white dark:bg-[#12121A] border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center p-4">
            <div
              style={{
                borderRadius: currentCss,
                backgroundColor: currentConfig.preview.elementBg,
              }}
              className="w-36 h-24 shadow-md transition-all flex items-center justify-center text-white text-[10px] font-mono font-semibold"
            >
              Current
            </div>
          </div>
        </div>

        {/* Right: Selected Preset Shape */}
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
              {compPreset.name}
            </span>
            <span className="text-[11px] font-mono text-zinc-500 font-semibold truncate max-w-[180px]">
              {compCss}
            </span>
          </div>

          <div className="h-44 rounded-lg bg-white dark:bg-[#12121A] border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center p-4">
            <div
              style={{
                borderRadius: compCss,
                backgroundColor: '#7B45D1',
              }}
              className="w-36 h-24 shadow-md transition-all flex items-center justify-center text-white text-[10px] font-mono font-semibold"
            >
              Preset
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => onApplyPreset(compPreset)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5722AF] text-white text-xs font-semibold hover:bg-[#491B93] transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Apply This Preset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
