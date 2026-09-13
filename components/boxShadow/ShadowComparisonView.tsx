'use client';

import React, { useState } from 'react';
import { Columns, X, ArrowLeftRight } from 'lucide-react';
import { ShadowLayer, PreviewSettings } from '@/lib/boxShadow/shadowTypes';
import { SHADOW_PRESETS } from '@/lib/boxShadow/shadowPresets';
import { generateBoxShadowCss } from '@/lib/boxShadow/shadowEngine';

interface ShadowComparisonViewProps {
  currentLayers: ShadowLayer[];
  preview: PreviewSettings;
  onClose: () => void;
  onApplyPreset: (layers: ShadowLayer[], name: string) => void;
}

export function ShadowComparisonView({
  currentLayers,
  preview,
  onClose,
  onApplyPreset,
}: ShadowComparisonViewProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    SHADOW_PRESETS[1].id
  );

  const compPreset =
    SHADOW_PRESETS.find((p) => p.id === selectedPresetId) || SHADOW_PRESETS[1];

  const currentCss = generateBoxShadowCss(currentLayers);
  const compCss = generateBoxShadowCss(compPreset.layers);

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Shadow Comparison (Before vs After)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluate your custom shadow side-by-side with curated presets
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

      {/* Preset Selector */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-zinc-600 dark:text-zinc-400">
          Compare Against:
        </span>
        <select
          value={selectedPresetId}
          onChange={(e) => setSelectedPresetId(e.target.value)}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-medium outline-none"
        >
          {SHADOW_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      {/* Visual Comparison Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Current Shadow */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <span>Your Active Shadow</span>
            <span className="text-[10px] text-zinc-400">Custom</span>
          </div>

          <div
            className="w-full h-44 rounded-xl flex items-center justify-center p-6 border border-zinc-200 dark:border-zinc-700"
            style={{ backgroundColor: preview.previewBg }}
          >
            <div
              style={{
                width: `${preview.width * 0.75}px`,
                height: `${preview.height * 0.75}px`,
                borderRadius: `${preview.borderRadius * 0.75}px`,
                backgroundColor: preview.elementBg,
                boxShadow: currentCss,
              }}
            />
          </div>
        </div>

        {/* Selected Preset */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
            <span>Preset: {compPreset.name}</span>
            <button
              type="button"
              onClick={() => onApplyPreset(compPreset.layers, compPreset.name)}
              className="text-[11px] font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline"
            >
              Switch to This
            </button>
          </div>

          <div
            className="w-full h-44 rounded-xl flex items-center justify-center p-6 border border-zinc-200 dark:border-zinc-700"
            style={{ backgroundColor: preview.previewBg }}
          >
            <div
              style={{
                width: `${preview.width * 0.75}px`,
                height: `${preview.height * 0.75}px`,
                borderRadius: `${preview.borderRadius * 0.75}px`,
                backgroundColor: preview.elementBg,
                boxShadow: compCss,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
