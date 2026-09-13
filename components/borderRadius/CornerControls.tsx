'use client';

import React from 'react';
import {
  Link2,
  Unlink2,
  Sliders,
  Maximize,
  Sparkles,
} from 'lucide-react';
import {
  BorderRadiusConfig,
  CornerRadius,
  RadiusUnit,
} from '@/lib/borderRadius/borderRadiusTypes';
import { QUICK_RADIUS_VALUES } from '@/lib/borderRadius/borderRadiusPresets';

interface CornerControlsProps {
  config: BorderRadiusConfig;
  onUpdateConfig: (updates: Partial<BorderRadiusConfig>) => void;
  onUpdateCorner: (
    corner: keyof CornerRadius,
    value: number,
    axis?: 'horizontal' | 'vertical'
  ) => void;
  onApplyQuickRadius: (val: number) => void;
}

const UNITS: RadiusUnit[] = ['px', '%', 'rem', 'em'];

const CORNERS: Array<{
  key: keyof CornerRadius;
  label: string;
  short: string;
}> = [
  { key: 'topLeft', label: 'Top Left', short: 'TL' },
  { key: 'topRight', label: 'Top Right', short: 'TR' },
  { key: 'bottomRight', label: 'Bottom Right', short: 'BR' },
  { key: 'bottomLeft', label: 'Bottom Left', short: 'BL' },
];

export function CornerControls({
  config,
  onUpdateConfig,
  onUpdateCorner,
  onApplyQuickRadius,
}: CornerControlsProps) {
  const { isLinked, isElliptical, unit, horizontal, vertical } = config;

  // Max range and step by unit
  const getMaxVal = () => {
    switch (unit) {
      case '%':
        return 100;
      case 'rem':
      case 'em':
        return 20;
      case 'px':
      default:
        return 300;
    }
  };

  const getStep = () => {
    return unit === 'rem' || unit === 'em' ? 0.1 : 1;
  };

  const maxVal = getMaxVal();
  const stepVal = getStep();

  const handleUnitChange = (newUnit: RadiusUnit) => {
    if (newUnit === unit) return;

    // Smart unit conversion ratios
    let ratio = 1;
    if (unit === 'px' && (newUnit === 'rem' || newUnit === 'em')) ratio = 1 / 16;
    else if ((unit === 'rem' || unit === 'em') && newUnit === 'px') ratio = 16;
    else if (unit === 'px' && newUnit === '%') ratio = 100 / 260;
    else if (unit === '%' && newUnit === 'px') ratio = 260 / 100;

    const convert = (val: number) => {
      const converted = val * ratio;
      return newUnit === 'rem' || newUnit === 'em'
        ? Math.round(converted * 10) / 10
        : Math.min(newUnit === '%' ? 100 : 300, Math.max(0, Math.round(converted)));
    };

    onUpdateConfig({
      unit: newUnit,
      horizontal: {
        topLeft: convert(horizontal.topLeft),
        topRight: convert(horizontal.topRight),
        bottomRight: convert(horizontal.bottomRight),
        bottomLeft: convert(horizontal.bottomLeft),
      },
      vertical: {
        topLeft: convert(vertical.topLeft),
        topRight: convert(vertical.topRight),
        bottomRight: convert(vertical.bottomRight),
        bottomLeft: convert(vertical.bottomLeft),
      },
    });
  };

  const toggleLinked = () => {
    onUpdateConfig({ isLinked: !isLinked });
  };

  const toggleElliptical = () => {
    onUpdateConfig({ isElliptical: !isElliptical });
  };

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-xs transition-colors space-y-6">
      {/* Top Header & Toggles */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Corner Radius Controls</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isLinked ? 'Linked mode: updates all corners together' : 'Independent mode: customize each corner individually'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Link Corners Button */}
          <button
            type="button"
            onClick={toggleLinked}
            title={isLinked ? 'Unlink corners' : 'Link all corners together'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isLinked
                ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {isLinked ? (
              <>
                <Link2 className="w-3.5 h-3.5" />
                <span>Linked</span>
              </>
            ) : (
              <>
                <Unlink2 className="w-3.5 h-3.5" />
                <span>Unlinked</span>
              </>
            )}
          </button>

          {/* Elliptical Toggle */}
          <button
            type="button"
            onClick={toggleElliptical}
            title="Toggle elliptical horizontal/vertical radius"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isElliptical
                ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Elliptical: {isElliptical ? 'ON' : 'OFF'}</span>
          </button>

          {/* Unit Selector */}
          <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-700 p-0.5 bg-zinc-50 dark:bg-zinc-800/60">
            {UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => handleUnitChange(u)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  unit === u
                    ? 'bg-[#5722AF] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Radius Preset Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
            Quick Radius ({unit}):
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_RADIUS_VALUES.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onApplyQuickRadius(val)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:border-[#5722AF] hover:text-[#5722AF] dark:hover:border-[#9B6BE8] dark:hover:text-[#9B6BE8] hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-all"
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Corner Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CORNERS.map(({ key, label, short }) => {
          const hVal = horizontal[key];
          const vVal = vertical[key];

          return (
            <div
              key={key}
              className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3"
            >
              {/* Corner Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] text-[10px] font-mono font-bold flex items-center justify-center">
                    {short}
                  </span>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {label}
                  </span>
                </div>
                {!isElliptical && (
                  <span className="text-xs font-mono font-semibold text-[#5722AF] dark:text-[#9B6BE8]">
                    {hVal}{unit}
                  </span>
                )}
              </div>

              {/* Standard Radius (Horizontal / Both) */}
              <div className="space-y-1.5">
                {isElliptical && (
                  <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>Horizontal</span>
                    <span className="font-mono text-[#5722AF]">{hVal}{unit}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max={maxVal}
                    step={stepVal}
                    value={hVal}
                    onChange={(e) =>
                      onUpdateCorner(
                        key,
                        Number(e.target.value),
                        isElliptical ? 'horizontal' : undefined
                      )
                    }
                    className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#5722AF]"
                  />
                  <div className="w-16 shrink-0 relative">
                    <input
                      type="number"
                      min="0"
                      max={maxVal}
                      step={stepVal}
                      value={hVal}
                      onChange={(e) =>
                        onUpdateCorner(
                          key,
                          Math.max(0, Number(e.target.value) || 0),
                          isElliptical ? 'horizontal' : undefined
                        )
                      }
                      className="w-full px-2 py-1 pr-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#12121A] text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#5722AF]"
                    />
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono pointer-events-none">
                      {unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vertical Radius (Only when Elliptical is ON) */}
              {isElliptical && (
                <div className="space-y-1.5 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                  <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>Vertical</span>
                    <span className="font-mono text-[#7B45D1]">{vVal}{unit}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max={maxVal}
                      step={stepVal}
                      value={vVal}
                      onChange={(e) =>
                        onUpdateCorner(key, Number(e.target.value), 'vertical')
                      }
                      className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#7B45D1]"
                    />
                    <div className="w-16 shrink-0 relative">
                      <input
                        type="number"
                        min="0"
                        max={maxVal}
                        step={stepVal}
                        value={vVal}
                        onChange={(e) =>
                          onUpdateCorner(
                            key,
                            Math.max(0, Number(e.target.value) || 0),
                            'vertical'
                          )
                        }
                        className="w-full px-2 py-1 pr-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#12121A] text-xs font-mono text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#7B45D1]"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-mono pointer-events-none">
                        {unit}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
