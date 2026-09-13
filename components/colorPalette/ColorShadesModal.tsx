'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Sliders, ArrowUpRight } from 'lucide-react';
import { ColorItem } from '@/lib/colorTypes';
import { generateShadesAndTints } from '@/lib/colorEngine';

interface ColorShadesModalProps {
  color: ColorItem | null;
  onClose: () => void;
  onSelectColor: (hex: string) => void;
}

export function ColorShadesModal({
  color,
  onClose,
  onSelectColor,
}: ColorShadesModalProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!color) return null;

  const { tints, shades } = generateShadesAndTints(color.hex);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => {
      setCopiedHex((prev) => (prev === hex ? null : prev));
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl shadow-xs border border-black/10 dark:border-white/10"
              style={{ backgroundColor: color.hex }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Shades & Tints
                </h3>
                <span className="text-xs font-mono font-bold text-[#5722AF] dark:text-[#9B6BE8] bg-[#5722AF]/10 dark:bg-[#5722AF]/20 px-2 py-0.5 rounded-md">
                  {color.hex}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {color.name} • 10 lighter tints and 10 darker shades
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

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Tints (Lighter) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Tints (Lightening towards White)
              </span>
              <span className="text-[11px] text-zinc-400">Click swatch to copy</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {tints.map((item) => {
                const isCopied = copiedHex === item.hex;
                return (
                  <div
                    key={item.hex}
                    className="group relative rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs transition-all hover:scale-[1.02]"
                  >
                    <button
                      type="button"
                      onClick={() => handleCopy(item.hex)}
                      className="w-full h-16 sm:h-20 flex flex-col justify-end p-2 transition-transform cursor-pointer"
                      style={{ backgroundColor: item.hex }}
                      title={`Copy ${item.hex}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            item.isDark ? 'text-white' : 'text-zinc-900'
                          }`}
                        >
                          {item.hex}
                        </span>
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy
                            className={`w-3 h-3 opacity-0 group-hover:opacity-100 ${
                              item.isDark ? 'text-white' : 'text-zinc-900'
                            }`}
                          />
                        )}
                      </div>
                    </button>

                    <div className="bg-zinc-50 dark:bg-zinc-800/80 p-1.5 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>+{item.step}%</span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectColor(item.hex);
                          onClose();
                        }}
                        className="text-[#5722AF] dark:text-[#9B6BE8] hover:underline font-semibold flex items-center gap-0.5"
                        title="Use this color in palette"
                      >
                        Use <ArrowUpRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shades (Darker) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Shades (Darkening towards Black)
              </span>
              <span className="text-[11px] text-zinc-400">Click swatch to copy</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {shades.map((item) => {
                const isCopied = copiedHex === item.hex;
                return (
                  <div
                    key={item.hex}
                    className="group relative rounded-xl overflow-hidden border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs transition-all hover:scale-[1.02]"
                  >
                    <button
                      type="button"
                      onClick={() => handleCopy(item.hex)}
                      className="w-full h-16 sm:h-20 flex flex-col justify-end p-2 transition-transform cursor-pointer"
                      style={{ backgroundColor: item.hex }}
                      title={`Copy ${item.hex}`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            item.isDark ? 'text-white' : 'text-zinc-900'
                          }`}
                        >
                          {item.hex}
                        </span>
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy
                            className={`w-3 h-3 opacity-0 group-hover:opacity-100 ${
                              item.isDark ? 'text-white' : 'text-zinc-900'
                            }`}
                          />
                        )}
                      </div>
                    </button>

                    <div className="bg-zinc-50 dark:bg-zinc-800/80 p-1.5 flex items-center justify-between text-[10px] text-zinc-500">
                      <span>-{item.step}%</span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectColor(item.hex);
                          onClose();
                        }}
                        className="text-[#5722AF] dark:text-[#9B6BE8] hover:underline font-semibold flex items-center gap-0.5"
                        title="Use this color in palette"
                      >
                        Use <ArrowUpRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
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
