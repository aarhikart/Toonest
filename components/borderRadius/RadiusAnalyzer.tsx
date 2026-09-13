'use client';

import React from 'react';
import { Activity, Gauge, Eye, ShieldCheck, Compass } from 'lucide-react';
import { BorderRadiusConfig } from '@/lib/borderRadius/borderRadiusTypes';

interface RadiusAnalyzerProps {
  config: BorderRadiusConfig;
}

export function RadiusAnalyzer({ config }: RadiusAnalyzerProps) {
  const { isLinked, isElliptical, unit, horizontal, vertical } = config;
  const { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl } = horizontal;

  // Symmetry analysis
  const isAllEqual = tl === tr && tr === br && br === bl;
  const isDiagonalEqual = tl === br && tr === bl;

  let symmetry = 'Asymmetric';
  if (isAllEqual) symmetry = '4-Way Symmetrical';
  else if (isDiagonalEqual) symmetry = 'Diagonal Symmetry';

  // Shape profile
  let shapeProfile = 'Rounded Rectangle';
  if (unit === 'px' && tl >= 9999) shapeProfile = 'Full Pill / Capsule';
  else if (unit === '%' && tl >= 50 && isAllEqual) shapeProfile = 'Perfect Circle';
  else if (isElliptical) shapeProfile = 'Organic Elliptical Blob';
  else if (tl === 0 && tr === 0 && br === 0 && bl === 0) shapeProfile = 'Sharp Corners';
  else if (tl <= 8 && isAllEqual) shapeProfile = 'Subtle UI Element';
  else if (tl <= 24 && isAllEqual) shapeProfile = 'Standard Card';
  else if (tl > 24 && isAllEqual) shapeProfile = 'Soft Container';

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Geometry Analysis</span>
        </h4>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] font-bold">
          {shapeProfile}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <span className="text-zinc-400 block text-[10px]">Symmetry</span>
          <span className="font-bold text-zinc-900 dark:text-white truncate block mt-0.5">
            {symmetry}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <span className="text-zinc-400 block text-[10px]">Editing Mode</span>
          <span className="font-bold text-zinc-900 dark:text-white truncate block mt-0.5">
            {isLinked ? 'Linked (Uniform)' : 'Independent (4-Corner)'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <span className="text-zinc-400 block text-[10px]">Elliptical Axis</span>
          <span className="font-bold text-zinc-900 dark:text-white truncate block mt-0.5">
            {isElliptical ? 'Dual Axis (H / V)' : 'Single Circular Axis'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <span className="text-zinc-400 block text-[10px]">Active Unit</span>
          <span className="font-mono font-bold text-zinc-900 dark:text-white truncate block mt-0.5">
            {unit} (Scale: {config.preview.width}×{config.preview.height})
          </span>
        </div>
      </div>

      {isElliptical && (
        <div className="p-2.5 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#5722AF] shrink-0" />
            <span>Dual Axis: Horizontal &amp; Vertical radii evaluated independently for each quadrant.</span>
          </div>
          <span className="font-mono text-[#5722AF] font-bold">8 Values</span>
        </div>
      )}
    </div>
  );
}
