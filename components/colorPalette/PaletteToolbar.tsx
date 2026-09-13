'use client';

import React from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Plus,
  Layout,
  Layers,
  Download,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { HarmonyMode } from '@/lib/colorTypes';

interface PaletteToolbarProps {
  onGenerate: () => void;
  harmonyMode: HarmonyMode;
  onChangeHarmonyMode: (mode: HarmonyMode) => void;
  colorCount: number;
  onChangeColorCount: (count: number) => void;
  onAddColor: () => void;
  canAddColor: boolean;
  onResetToDefault: () => void;
  showUIPreview: boolean;
  onToggleUIPreview: () => void;
  showGradientView: boolean;
  onToggleGradientView: () => void;
  onOpenExport: () => void;
  onSavePalette: () => void;
  isSaved: boolean;
  onOpenSavedDrawer: () => void;
  savedCount: number;
}

export function PaletteToolbar({
  onGenerate,
  harmonyMode,
  onChangeHarmonyMode,
  colorCount,
  onChangeColorCount,
  onAddColor,
  canAddColor,
  onResetToDefault,
  showUIPreview,
  onToggleUIPreview,
  showGradientView,
  onToggleGradientView,
  onOpenExport,
  onSavePalette,
  isSaved,
  onOpenSavedDrawer,
  savedCount,
}: PaletteToolbarProps) {
  const harmonyOptions: { value: HarmonyMode; label: string }[] = [
    { value: 'random', label: 'Random' },
    { value: 'complementary', label: 'Complementary' },
    { value: 'monochromatic', label: 'Monochromatic' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'tetradic', label: 'Tetradic' },
    { value: 'split-complementary', label: 'Split-Complementary' },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs p-3 sm:p-4 mb-4 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Generate Button & Spacebar indicator */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:opacity-95 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[#5722AF] focus:ring-offset-2 dark:focus:ring-offset-[#12151c]"
            title="Generate new colors for unlocked cards (Shortcut: Spacebar)"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Generate</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white rounded border border-white/30">
              Space
            </kbd>
          </button>

          {/* Harmony Mode Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl px-2.5 py-1 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 hidden md:inline">
              Harmony:
            </span>
            <select
              value={harmonyMode}
              onChange={(e) => onChangeHarmonyMode(e.target.value as HarmonyMode)}
              className="bg-transparent text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer py-1 pr-1"
            >
              {harmonyOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color Count Quick Select */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl p-1 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
            <span className="font-semibold text-zinc-500 dark:text-zinc-400 px-1.5 text-[11px] hidden sm:inline">
              Count:
            </span>
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChangeColorCount(n)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  colorCount === n
                    ? 'bg-[#5722AF] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {n}
              </button>
            ))}

            {canAddColor && (
              <button
                type="button"
                onClick={onAddColor}
                title="Add another color (up to 8)"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side Tools: Preview, Gradients, Save, Export, Library */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* UI Preview Toggle */}
          <button
            type="button"
            onClick={onToggleUIPreview}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showUIPreview
                ? 'bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border-[#5722AF]/40'
                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Toggle Realistic Website UI Preview"
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">UI Preview</span>
          </button>

          {/* Gradient Generator Toggle */}
          <button
            type="button"
            onClick={onToggleGradientView}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showGradientView
                ? 'bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border-[#5722AF]/40'
                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Generate CSS Gradients from Palette"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gradients</span>
          </button>

          {/* Save Palette */}
          <button
            type="button"
            onClick={onSavePalette}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isSaved
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            title="Save Palette to Local Favorites"
          >
            {isSaved ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Open Saved Palettes Drawer */}
          <button
            type="button"
            onClick={onOpenSavedDrawer}
            className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Browse saved favorite palettes"
          >
            <Palette className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span className="hidden sm:inline">Library</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#5722AF] text-white text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Export Modal */}
          <button
            type="button"
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-xs transition-all"
            title="Export Palette (CSS, Tailwind, JSON, PNG, URL)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={onResetToDefault}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Reset to default ToolNest palette"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
