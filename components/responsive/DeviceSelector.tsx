'use client';

import React, { useState } from 'react';
import { Smartphone, Tablet, Laptop, Monitor, CheckCircle, Star } from 'lucide-react';
import { DeviceCategory, DevicePreset, Orientation } from '@/lib/responsive/types';
import { DEVICE_PRESETS } from '@/lib/responsive/devices';

interface DeviceSelectorProps {
  selectedPreset: DevicePreset;
  orientation: Orientation;
  onSelectPreset: (preset: DevicePreset) => void;
  testedStatuses?: Record<string, string>;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedPreset,
  orientation,
  onSelectPreset,
  testedStatuses = {},
}) => {
  const [activeCategory, setActiveCategory] = useState<DeviceCategory | 'all'>('all');

  const filteredPresets = DEVICE_PRESETS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const getCategoryIcon = (cat: DeviceCategory) => {
    switch (cat) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5" />;
      case 'laptop':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'desktop':
        return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          All ({DEVICE_PRESETS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('mobile')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'mobile'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile (6)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('tablet')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'tablet'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Tablet className="w-3.5 h-3.5" />
          <span>Tablet (4)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('laptop')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'laptop'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Laptop (3)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('desktop')}
          className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeCategory === 'desktop'
              ? 'bg-[#5722AF] text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Desktop (4)</span>
        </button>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          const displayW = orientation === 'portrait' ? preset.width : preset.height;
          const displayH = orientation === 'portrait' ? preset.height : preset.width;
          const testStatus = testedStatuses[preset.id];

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/15 border-[#5722AF] ring-2 ring-[#5722AF]/30 shadow-xs'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {getCategoryIcon(preset.category)}
                  </span>
                  {testStatus === 'pass' && (
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Pass
                    </span>
                  )}
                  {testStatus === 'warning' && (
                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Warn
                    </span>
                  )}
                  {testStatus === 'fail' && (
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                      Fail
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate" title={preset.name}>
                  {preset.name}
                </h4>
                <p className="font-mono text-[11px] text-[#5722AF] dark:text-[#9B6BE8] font-semibold mt-0.5">
                  {displayW} × {displayH}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <span>{preset.aspectRatio}</span>
                <span>{preset.dpr}x DPR</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
