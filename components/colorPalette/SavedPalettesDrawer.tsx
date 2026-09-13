'use client';

import React, { useState } from 'react';
import {
  X,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  Palette,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { SavedPalette } from '@/lib/colorTypes';

interface SavedPalettesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPalettes: SavedPalette[];
  onLoadPalette: (colors: string[]) => void;
  onDeletePalette: (id: string) => void;
}

const CURATED_PRESETS: Array<{ name: string; colors: string[] }> = [
  {
    name: 'ToolNest Purple Gradient',
    colors: ['#5722AF', '#7B45D1', '#9B6BE8', '#C9B5F2', '#F4F0FC'],
  },
  {
    name: 'Nordic Forest & Moss',
    colors: ['#064E3B', '#047857', '#10B981', '#6EE7B7', '#ECFDF5'],
  },
  {
    name: 'Golden Sunset Horizon',
    colors: ['#450A0A', '#991B1B', '#EA580C', '#F59E0B', '#FEF3C7'],
  },
  {
    name: 'Cyberpunk Neon Nights',
    colors: ['#0F172A', '#06B6D4', '#3B82F6', '#D946EF', '#F43F5E'],
  },
  {
    name: 'Minimal Clean Slate',
    colors: ['#09090B', '#27272A', '#71717A', '#E4E4E7', '#FAFAFA'],
  },
  {
    name: 'Deep Oceanic Abyss',
    colors: ['#030712', '#082F49', '#0369A1', '#38BDF8', '#E0F2FE'],
  },
];

export function SavedPalettesDrawer({
  isOpen,
  onClose,
  savedPalettes,
  onLoadPalette,
  onDeletePalette,
}: SavedPalettesDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyPalette = (colors: string[], id: string) => {
    navigator.clipboard.writeText(colors.join(', '));
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#12151c] w-full max-w-md h-full flex flex-col shadow-2xl border-l border-zinc-200 dark:border-zinc-800 transition-colors">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Saved & Curated Palettes
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {savedPalettes.length} saved favorites
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">
          {/* User Saved Palettes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-3">
              Your Saved Palettes ({savedPalettes.length})
            </h4>

            {savedPalettes.length === 0 ? (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
                <Bookmark className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  No saved palettes yet
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Click the "Save" button in the toolbar to bookmark your favorite palettes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPalettes.map((item) => {
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="group p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-[#5722AF]/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleCopyPalette(item.colors, item.id)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                            title="Copy HEX codes"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePalette(item.id)}
                            className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            title="Delete saved palette"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Swatch Strip */}
                      <div
                        onClick={() => {
                          onLoadPalette(item.colors);
                          onClose();
                        }}
                        className="h-12 rounded-lg overflow-hidden flex cursor-pointer shadow-xs border border-zinc-300 dark:border-zinc-700 hover:ring-2 hover:ring-[#5722AF] transition-all"
                        title="Click to load palette"
                      >
                        {item.colors.map((hex, i) => (
                          <div
                            key={i}
                            className="flex-1 h-full"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Curated Presets */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Curated Designer Palettes
              </h4>
            </div>

            <div className="space-y-3">
              {CURATED_PRESETS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onLoadPalette(item.colors);
                    onClose();
                  }}
                  className="group p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-[#5722AF]/40 cursor-pointer transition-all"
                  title="Click to load into generator"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-[#5722AF] dark:text-[#9B6BE8] font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Load <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="h-10 rounded-lg overflow-hidden flex shadow-xs border border-zinc-300 dark:border-zinc-700">
                    {item.colors.map((hex, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
