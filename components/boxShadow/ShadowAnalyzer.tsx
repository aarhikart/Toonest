'use client';

import React from 'react';
import { Activity, Gauge, Eye, Zap, ShieldCheck } from 'lucide-react';
import { ShadowLayer } from '@/lib/boxShadow/shadowTypes';

interface ShadowAnalyzerProps {
  layers: ShadowLayer[];
}

export function ShadowAnalyzer({ layers }: ShadowAnalyzerProps) {
  const enabled = layers.filter((l) => l.enabled);
  const totalLayers = enabled.length;

  const hasInset = enabled.some((l) => l.inset);
  const hasOuter = enabled.some((l) => !l.inset);
  const shadowType =
    hasInset && hasOuter ? 'Composite (Mixed)' : hasInset ? 'Inset' : 'Outer';

  const maxBlur = Math.max(0, ...enabled.map((l) => l.blur));
  const maxSpread = Math.max(0, ...enabled.map((l) => l.spread));
  const avgOpacity =
    totalLayers > 0
      ? Math.round(enabled.reduce((sum, l) => sum + l.opacity, 0) / totalLayers)
      : 0;

  // Depth assessment
  const depth =
    maxBlur > 40 || totalLayers >= 3
      ? 'High Elevation'
      : maxBlur > 15
      ? 'Medium Surface'
      : 'Subtle Accent';

  // Rendering performance assessment
  const perfStatus =
    totalLayers <= 2 && maxBlur <= 40
      ? { label: 'Optimal (60 FPS)', color: 'text-emerald-500' }
      : totalLayers <= 4
      ? { label: 'Good (Standard)', color: 'text-blue-500' }
      : { label: 'Heavy Paint', color: 'text-amber-500' };

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <Activity className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
        <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
          Shadow Metrics & Analysis
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Metric 1: Layers */}
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 block mb-0.5">Active Layers</span>
          <div className="text-base font-bold text-zinc-900 dark:text-white">
            {totalLayers} {totalLayers === 1 ? 'Layer' : 'Layers'}
          </div>
          <span className="text-[10px] text-zinc-500">{shadowType}</span>
        </div>

        {/* Metric 2: Max Blur */}
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 block mb-0.5">Max Blur</span>
          <div className="text-base font-bold text-zinc-900 dark:text-white font-mono">
            {maxBlur}px
          </div>
          <span className="text-[10px] text-zinc-500">Spread: {maxSpread}px</span>
        </div>

        {/* Metric 3: Visual Elevation */}
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 block mb-0.5">Elevation Depth</span>
          <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">
            {depth}
          </div>
          <span className="text-[10px] text-zinc-500">Avg Opacity: {avgOpacity}%</span>
        </div>

        {/* Metric 4: Render Performance */}
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
          <span className="text-[10px] text-zinc-400 block mb-0.5">GPU Paint Cost</span>
          <div className={`text-sm font-bold truncate ${perfStatus.color}`}>
            {perfStatus.label}
          </div>
          <span className="text-[10px] text-zinc-500">Composite Layer</span>
        </div>
      </div>
    </div>
  );
}
