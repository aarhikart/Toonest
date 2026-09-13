'use client';

import React from 'react';
import {
  Undo2,
  Redo2,
  Sliders,
  Maximize,
  CircleDot,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import {
  GradientConfig,
  GradientType,
  RadialShape,
  RadialSize,
  SmoothMode,
} from '@/lib/gradient/gradientTypes';
import { AngleVisualizer } from './AngleVisualizer';

interface GradientControlsProps {
  config: GradientConfig;
  onUpdateConfig: (updates: Partial<GradientConfig>) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function GradientControls({
  config,
  onUpdateConfig,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: GradientControlsProps) {
  const types: { id: GradientType; label: string }[] = [
    { id: 'linear', label: 'Linear' },
    { id: 'radial', label: 'Radial' },
    { id: 'conic', label: 'Conic' },
    { id: 'repeating-linear', label: 'Rep. Linear' },
    { id: 'repeating-radial', label: 'Rep. Radial' },
    { id: 'repeating-conic', label: 'Rep. Conic' },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-5">
      {/* Top Bar: Gradient Type Tabs + Undo/Redo */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <label className="text-xs font-bold text-zinc-900 dark:text-white block mb-1">
            Gradient Style
          </label>
          <div className="flex items-center gap-1 flex-wrap bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdateConfig({ type: t.id })}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  config.type === t.id
                    ? 'bg-[#5722AF] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Undo / Redo Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors border border-zinc-200/80 dark:border-zinc-700/80"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors border border-zinc-200/80 dark:border-zinc-700/80"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conditional Sub-Controls based on Gradient Type */}
      {(config.type === 'linear' || config.type === 'repeating-linear') && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
          <AngleVisualizer
            angle={config.angle}
            onChangeAngle={(newAngle) => onUpdateConfig({ angle: newAngle })}
          />

          {config.type === 'repeating-linear' && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Pattern Cycle Length</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.repeatingLength || 25}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={config.repeatingLength || 25}
                onChange={(e) =>
                  onUpdateConfig({ repeatingLength: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {(config.type === 'radial' || config.type === 'repeating-radial') && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-xs">
          {/* Shape and Size Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Radial Shape
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['circle', 'ellipse'] as RadialShape[]).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() =>
                      onUpdateConfig({
                        radial: { ...config.radial, shape },
                      })
                    }
                    className={`py-1.5 px-2 rounded-lg font-semibold border capitalize transition-all ${
                      config.radial.shape === shape
                        ? 'bg-[#5722AF] text-white border-[#5722AF]'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Radial Extent Size
              </label>
              <select
                value={config.radial.size}
                onChange={(e) =>
                  onUpdateConfig({
                    radial: { ...config.radial, size: e.target.value as RadialSize },
                  })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1.5 px-2 text-xs font-semibold outline-none"
              >
                <option value="farthest-corner">Farthest Corner (Default)</option>
                <option value="closest-side">Closest Side</option>
                <option value="closest-corner">Closest Corner</option>
                <option value="farthest-side">Farthest Side</option>
              </select>
            </div>
          </div>

          {/* Radial Center Position Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Center X Position</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.radial.x}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.radial.x}
                onChange={(e) =>
                  onUpdateConfig({
                    radial: { ...config.radial, x: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Center Y Position</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.radial.y}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.radial.y}
                onChange={(e) =>
                  onUpdateConfig({
                    radial: { ...config.radial, y: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>
          </div>

          {config.type === 'repeating-radial' && (
            <div>
              <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Radial Repetition Cycle</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.repeatingLength || 25}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={config.repeatingLength || 25}
                onChange={(e) =>
                  onUpdateConfig({ repeatingLength: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {(config.type === 'conic' || config.type === 'repeating-conic') && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              <span>Starting Angle</span>
              <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                {config.conic.angle}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={config.conic.angle}
              onChange={(e) =>
                onUpdateConfig({
                  conic: { ...config.conic, angle: parseInt(e.target.value, 10) },
                })
              }
              className="w-full accent-[#5722AF] cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Center X</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.conic.x}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.conic.x}
                onChange={(e) =>
                  onUpdateConfig({
                    conic: { ...config.conic, x: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Center Y</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.conic.y}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.conic.y}
                onChange={(e) =>
                  onUpdateConfig({
                    conic: { ...config.conic, y: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>
          </div>

          {config.type === 'repeating-conic' && (
            <div>
              <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Conic Sweep Cycle</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {config.repeatingLength || 45}°
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={config.repeatingLength || 45}
                onChange={(e) =>
                  onUpdateConfig({ repeatingLength: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Smooth Gradient Interpolation Selector */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Gradient Smoothing
        </label>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {(['standard', 'smooth', 'extra-smooth'] as SmoothMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onUpdateConfig({ smoothMode: mode })}
              className={`py-1.5 px-2 rounded-xl font-semibold capitalize border transition-all ${
                config.smoothMode === mode
                  ? 'bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border-[#5722AF]/30 font-bold'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
