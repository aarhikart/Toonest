'use client';

import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Sliders,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pipette,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { ColorItem } from '@/lib/colorTypes';

interface MainPaletteGridProps {
  palette: ColorItem[];
  onToggleLock: (id: string) => void;
  onUpdateColor: (id: string, newHex: string) => void;
  onRemoveColor: (id: string) => void;
  onMoveColor: (fromIndex: number, toIndex: number) => void;
  onOpenShades: (color: ColorItem) => void;
  canRemove: boolean;
}

export function MainPaletteGrid({
  palette,
  onToggleLock,
  onUpdateColor,
  onRemoveColor,
  onMoveColor,
  onOpenShades,
  canRemove,
}: MainPaletteGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1500);
  };

  const startEditing = (color: ColorItem) => {
    setEditingId(color.id);
    setEditingText(color.hex);
  };

  const finishEditing = (id: string) => {
    if (editingText && editingText.trim()) {
      onUpdateColor(id, editingText.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-full">
      {/* Responsive Grid Container: Desktop is horizontal columns, mobile stacks */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row w-full rounded-2xl overflow-hidden shadow-lg border border-zinc-200/80 dark:border-zinc-800 transition-all min-h-[440px] md:min-h-[500px]"
        style={{
          // Use CSS flex so cards expand equally on desktop
        }}
      >
        {palette.map((color, index) => {
          const isCopied = copiedId === color.id;
          const isEditing = editingId === color.id;
          const isFirst = index === 0;
          const isLast = index === palette.length - 1;

          // Theme text color based on luminance
          const textClass = color.isDark ? 'text-white' : 'text-zinc-900';
          const subtleTextClass = color.isDark ? 'text-white/70' : 'text-zinc-900/70';
          const borderClass = color.isDark ? 'border-white/20' : 'border-black/15';
          const btnHoverClass = color.isDark
            ? 'hover:bg-white/15 text-white'
            : 'hover:bg-black/10 text-zinc-900';
          const badgeBgClass = color.isDark ? 'bg-black/30' : 'bg-white/40';

          return (
            <div
              key={color.id}
              className={`relative flex flex-col justify-between p-4 sm:p-5 transition-colors group flex-1 min-w-[140px] min-h-[360px] sm:min-h-[420px] md:min-h-[500px] border-b sm:border-b-0 sm:border-r last:border-r-0 ${borderClass}`}
              style={{ backgroundColor: color.hex }}
            >
              {/* TOP ACTIONS: Move, Shades, Delete, Lock */}
              <div className="flex items-center justify-between gap-1 z-10">
                {/* Left group: Reorder & Remove */}
                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  {/* Reorder Left */}
                  {!isFirst && (
                    <button
                      type="button"
                      onClick={() => onMoveColor(index, index - 1)}
                      className={`p-1.5 rounded-lg transition-colors ${btnHoverClass}`}
                      title="Move color left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* Reorder Right */}
                  {!isLast && (
                    <button
                      type="button"
                      onClick={() => onMoveColor(index, index + 1)}
                      className={`p-1.5 rounded-lg transition-colors ${btnHoverClass}`}
                      title="Move color right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {/* Remove button if > 2 colors */}
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() => onRemoveColor(color.id)}
                      className={`p-1.5 rounded-lg transition-colors hover:bg-red-500/20 text-red-400 hover:text-red-500`}
                      title="Remove this color"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Right group: Shades & Lock */}
                <div className="flex items-center gap-1">
                  {/* Shades and Tints Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => onOpenShades(color)}
                    className={`p-1.5 rounded-lg transition-colors ${btnHoverClass}`}
                    title="View shades and tints"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  {/* Lock / Unlock Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleLock(color.id)}
                    className={`p-2 rounded-xl transition-all shadow-xs ${
                      color.isLocked
                        ? 'bg-zinc-900/90 text-white dark:bg-white dark:text-zinc-900 font-bold scale-105 ring-2 ring-white/50'
                        : `${btnHoverClass} ${badgeBgClass}`
                    }`}
                    title={
                      color.isLocked
                        ? 'Color is LOCKED (won’t change on Generate)'
                        : 'Color is UNLOCKED (will randomize on Generate)'
                    }
                  >
                    {color.isLocked ? (
                      <Lock className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                    ) : (
                      <Unlock className="w-4 h-4 opacity-75" />
                    )}
                  </button>
                </div>
              </div>

              {/* CENTER: Native Color Picker & Color Name */}
              <div className="flex flex-col items-center justify-center my-auto py-6 z-10">
                {/* Color picker circle */}
                <div className="relative group/picker mb-3">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => onUpdateColor(color.id, e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                    title="Click to pick color with native color picker"
                  />
                  <div
                    className={`w-12 h-12 rounded-full border-2 border-white/60 shadow-md flex items-center justify-center cursor-pointer transition-transform group-hover/picker:scale-110 ${badgeBgClass}`}
                  >
                    <Pipette className={`w-5 h-5 ${textClass}`} />
                  </div>
                </div>

                {/* HEX Display & Edit */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => finishEditing(color.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEditing(color.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    maxLength={7}
                    className={`w-28 text-center text-lg font-black tracking-wider uppercase bg-white/20 backdrop-blur-md rounded-lg py-1 px-2 border border-white/40 outline-none ${textClass}`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCopy(color.hex, color.id)}
                    onDoubleClick={() => startEditing(color)}
                    className={`group/hex flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${btnHoverClass} ${badgeBgClass}`}
                    title="Click to copy HEX. Double click to type custom HEX."
                  >
                    <span className={`text-xl sm:text-2xl font-black tracking-wider uppercase font-mono ${textClass}`}>
                      {color.hex}
                    </span>
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className={`w-3.5 h-3.5 opacity-60 group-hover/hex:opacity-100 ${textClass}`} />
                    )}
                  </button>
                )}

                {/* Copied Toast Indicator */}
                {isCopied && (
                  <span className="mt-1 text-[11px] font-bold text-emerald-400 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm animate-fade-in">
                    Copied!
                  </span>
                )}

                {/* Color Name */}
                <span className={`mt-2 text-xs font-semibold tracking-wide text-center px-2 truncate max-w-[150px] ${subtleTextClass}`}>
                  {color.name}
                </span>
              </div>

              {/* BOTTOM: Color formats & WCAG Accessibility */}
              <div className="flex flex-col gap-2 z-10">
                {/* Secondary values: RGB & HSL */}
                <div
                  className={`rounded-xl p-2.5 backdrop-blur-sm text-[11px] font-mono space-y-1 ${badgeBgClass} ${borderClass} border`}
                >
                  <div className="flex items-center justify-between">
                    <span className={subtleTextClass}>RGB</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
                          `${color.id}-rgb`
                        )
                      }
                      className={`font-semibold hover:underline ${textClass}`}
                    >
                      {copiedId === `${color.id}-rgb`
                        ? 'Copied!'
                        : `${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}`}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={subtleTextClass}>HSL</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
                          `${color.id}-hsl`
                        )
                      }
                      className={`font-semibold hover:underline ${textClass}`}
                    >
                      {copiedId === `${color.id}-hsl`
                        ? 'Copied!'
                        : `${color.hsl.h}°, ${color.hsl.s}%, ${color.hsl.l}%`}
                    </button>
                  </div>
                </div>

                {/* WCAG Contrast ratio indicator */}
                <div
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-medium backdrop-blur-sm ${badgeBgClass}`}
                >
                  <span className={subtleTextClass}>Contrast:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-0.5 ${
                        color.contrastWhite >= 4.5
                          ? 'text-emerald-400 font-bold'
                          : 'opacity-70'
                      }`}
                      title={`WCAG contrast vs White: ${color.contrastWhite}:1 (${color.contrastWhite >= 7 ? 'AAA' : color.contrastWhite >= 4.5 ? 'AA' : 'Fail'})`}
                    >
                      {color.contrastWhite >= 4.5 ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <ShieldAlert className="w-3 h-3" />
                      )}
                      W {color.contrastWhite}:1
                    </span>

                    <span
                      className={`flex items-center gap-0.5 ${
                        color.contrastBlack >= 4.5
                          ? 'text-emerald-400 font-bold'
                          : 'opacity-70'
                      }`}
                      title={`WCAG contrast vs Black: ${color.contrastBlack}:1 (${color.contrastBlack >= 7 ? 'AAA' : color.contrastBlack >= 4.5 ? 'AA' : 'Fail'})`}
                    >
                      B {color.contrastBlack}:1
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
