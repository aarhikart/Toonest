'use client';

import React, { useState } from 'react';
import { BoundingBox, RemovalMethod, RemovalOptions } from '@/lib/video-text/types';
import {
  Palette,
  Sparkles,
  EyeOff,
  Sliders,
  Check,
  RefreshCw,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface RemovalOptionsCardProps {
  boxes: BoundingBox[];
  onStartProcess: (options: RemovalOptions) => void;
  isProcessing: boolean;
}

export function RemovalOptionsCard({
  boxes,
  onStartProcess,
  isProcessing,
}: RemovalOptionsCardProps) {
  const [method, setMethod] = useState<RemovalMethod>('color_patch');
  const [patchColor, setPatchColor] = useState<string>('#000000');
  const [blurStrength, setBlurStrength] = useState<number>(20);

  const colorPresets = [
    { label: 'Black (Shorts / Waistband)', value: '#000000' },
    { label: 'Charcoal Dark', value: '#18181b' },
    { label: 'Slate Gray', value: '#334155' },
    { label: 'White / Light', value: '#ffffff' },
  ];

  const handleStart = () => {
    if (boxes.length === 0) {
      alert('Please select or detect at least one text region before processing.');
      return;
    }

    onStartProcess({
      method,
      patchColor,
      blurStrength,
      boxes,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Step 2: Choose Removal Method
          </span>
          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            Erase & Inpaint Settings
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Original Video Preserved</span>
        </div>
      </div>

      {/* 3 Removal Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Method 1: Matching Color Patch (Recommended for clothing/waistband) */}
        <div
          onClick={() => setMethod('color_patch')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
            method === 'color_patch'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/40 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div className="absolute top-3.5 right-3.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white tracking-wide uppercase">
              Recommended for Clothes
            </span>
          </div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
              <Palette className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              Matching Fabric Patch
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Fills the text box with a matching fabric color (e.g. solid black for black shorts). The text cleanly disappears into the waistband.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-950/60 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
            ✓ Flawless for solid shorts & shirts
          </div>
        </div>

        {/* Method 2: Smart Inpaint (delogo) */}
        <div
          onClick={() => setMethod('delogo')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
            method === 'delogo'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/40 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              Smart Inpaint (Delogo)
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Interpolates surrounding background pixels to erase the text. Ideal for textured surfaces or watermarks.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            Spatial pixel interpolation
          </div>
        </div>

        {/* Method 3: Gaussian Blur */}
        <div
          onClick={() => setMethod('blur')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
            method === 'blur'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/40 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
              <EyeOff className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              Gaussian Blur
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Blurs the text area so letters and logos become unreadable.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            Smooth region blur
          </div>
        </div>
      </div>

      {/* Method Specific Settings */}
      {method === 'color_patch' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Select Matching Fabric Color:
            </span>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={patchColor}
                onChange={(e) => setPatchColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 p-0.5 bg-white"
                title="Custom color picker"
              />
              <span className="text-xs font-mono text-zinc-500 uppercase">{patchColor}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setPatchColor(preset.value)}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  patchColor.toLowerCase() === preset.value.toLowerCase()
                    ? 'border-indigo-600 bg-white dark:bg-zinc-900 shadow-2xs font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/40 hover:border-zinc-300'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-600 shrink-0"
                  style={{ backgroundColor: preset.value }}
                />
                <span className="truncate">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {method === 'blur' && (
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-4 text-xs animate-in fade-in">
          <div className="space-y-0.5">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              Blur Radius: {blurStrength}px
            </span>
            <p className="text-[11px] text-zinc-500">Higher radius creates a stronger blur.</p>
          </div>

          <input
            type="range"
            min="10"
            max="40"
            step="2"
            value={blurStrength}
            onChange={(e) => setBlurStrength(parseInt(e.target.value))}
            className="w-48 accent-indigo-600 cursor-pointer"
          />
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          disabled={isProcessing || boxes.length === 0}
          onClick={handleStart}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl disabled:opacity-50 text-white font-black text-sm sm:text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Processing Video...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              <span>Remove Text from Full Video</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
