'use client';

import React, { useState } from 'react';
import { Layers, Copy, Check, X, RotateCw } from 'lucide-react';
import { ColorItem } from '@/lib/colorTypes';

interface GradientGeneratorViewProps {
  palette: ColorItem[];
  onClose: () => void;
}

export function GradientGeneratorView({
  palette,
  onClose,
}: GradientGeneratorViewProps) {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState<number>(135);
  const [selectedHexes, setSelectedHexes] = useState<string[]>(
    palette.slice(0, 3).map((c) => c.hex)
  );
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Toggle a color's inclusion
  const toggleColor = (hex: string) => {
    if (selectedHexes.includes(hex)) {
      if (selectedHexes.length > 2) {
        setSelectedHexes(selectedHexes.filter((h) => h !== hex));
      }
    } else {
      setSelectedHexes([...selectedHexes, hex]);
    }
  };

  // Construct CSS
  const gradientCssValue =
    gradientType === 'linear'
      ? `linear-gradient(${angle}deg, ${selectedHexes.join(', ')})`
      : `radial-gradient(circle, ${selectedHexes.join(', ')})`;

  const fullCssCode = `background: ${selectedHexes[0]};\nbackground: ${gradientCssValue};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCssCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-md p-4 sm:p-6 mb-6 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              CSS Gradient Generator
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create smooth linear or radial gradients from your palette colors
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          title="Close Gradient Generator"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Preview */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div
            className="w-full h-56 sm:h-64 rounded-2xl shadow-inner border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-all p-6"
            style={{ background: gradientCssValue }}
          >
            <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white text-center text-xs font-mono font-bold shadow-lg">
              {gradientCssValue}
            </div>
          </div>

          {/* Quick CSS Snippet & Copy */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded-xl text-xs font-mono text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 truncate">
              {fullCssCode}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#5722AF] text-white hover:bg-[#481c91] transition-colors shadow-xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy CSS'}</span>
            </button>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Gradient Type */}
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
              Gradient Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGradientType('linear')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  gradientType === 'linear'
                    ? 'bg-[#5722AF] text-white border-[#5722AF]'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Linear Gradient
              </button>
              <button
                type="button"
                onClick={() => setGradientType('radial')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  gradientType === 'radial'
                    ? 'bg-[#5722AF] text-white border-[#5722AF]'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                Radial Gradient
              </button>
            </div>
          </div>

          {/* Angle Slider (for Linear) */}
          {gradientType === 'linear' && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                <span>Direction Angle</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                className="w-full accent-[#5722AF] cursor-pointer"
              />

              {/* Angle Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {[0, 45, 90, 135, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setAngle(deg)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                      angle === deg
                        ? 'bg-[#5722AF]/10 text-[#5722AF] border-[#5722AF]/30 dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Stop Selectors */}
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
              Color Stops (Pick 2 or more)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {palette.map((color) => {
                const isSelected = selectedHexes.includes(color.hex);
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => toggleColor(color.hex)}
                    className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#5722AF] shadow-xs'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: color.hex,
                      color: color.isDark ? '#FFF' : '#000',
                      borderColor: isSelected ? '#5722AF' : 'transparent',
                    }}
                    title={isSelected ? 'Remove from gradient' : 'Add to gradient'}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{color.hex}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
