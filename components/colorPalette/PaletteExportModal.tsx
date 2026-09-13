'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  Code,
  FileJson,
  Image as ImageIcon,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { ColorItem, ExportTab } from '@/lib/colorTypes';
import {
  exportAsCssVariables,
  exportAsTailwind,
  exportAsJson,
  exportAsUrlQuery,
  exportToCanvasPng,
} from '@/lib/colorEngine';

interface PaletteExportModalProps {
  palette: ColorItem[];
  onClose: () => void;
}

export function PaletteExportModal({ palette, onClose }: PaletteExportModalProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>('css');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const cssCode = exportAsCssVariables(palette);
  const tailwindCode = exportAsTailwind(palette);
  const jsonCode = exportAsJson(palette);

  // Share URL
  const queryParam = exportAsUrlQuery(palette);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/color-palette-generator?colors=${queryParam}`
      : `https://toolnest.dev/color-palette-generator?colors=${queryParam}`;

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      const blob = await exportToCanvasPng(palette, 'ToolNest Palette');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolnest-palette-${queryParam.slice(0, 15)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsDownloading(false);
    }
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Export Palette
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose your preferred export format or copy code directly
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {[
            { id: 'css' as ExportTab, label: 'CSS Variables', icon: Code },
            { id: 'tailwind' as ExportTab, label: 'Tailwind CSS', icon: Palette },
            { id: 'json' as ExportTab, label: 'JSON Data', icon: FileJson },
            { id: 'image' as ExportTab, label: 'PNG Image', icon: ImageIcon },
            { id: 'share' as ExportTab, label: 'Share Link', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* CSS Variables Tab */}
          {activeTab === 'css' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Ready to paste into your stylesheet or global CSS:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(cssCode)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy CSS'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
                <code>{cssCode}</code>
              </pre>
            </div>
          )}

          {/* Tailwind CSS Tab */}
          {activeTab === 'tailwind' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Add to your <code className="text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">tailwind.config.js</code>:
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(tailwindCode)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Config'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
                <code>{tailwindCode}</code>
              </pre>
            </div>
          )}

          {/* JSON Tab */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Full color metadata (HEX, RGB, HSL, CMYK, Luminance, Contrast):
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(jsonCode)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] hover:underline"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 max-h-72">
                <code>{jsonCode}</code>
              </pre>
            </div>
          )}

          {/* PNG Image Tab */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Generate a clean high-resolution (1200×630) palette card with labeled swatches, HEX codes, and color names:
              </p>

              {/* Mini Preview Strip */}
              <div className="h-28 rounded-xl overflow-hidden shadow-md flex border border-zinc-200 dark:border-zinc-700">
                {palette.map((color) => (
                  <div
                    key={color.id}
                    className="flex-1 flex flex-col justify-end p-2 text-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        color.isDark ? 'text-white' : 'text-zinc-900'
                      }`}
                    >
                      {color.hex}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] text-white font-bold text-xs shadow-md shadow-[#5722AF]/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating...' : 'Download PNG Image'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Shareable Link Tab */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Share this exact palette with collaborators or clients. Anyone opening this link will see your exact colors:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyText(shareUrl)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#5722AF] text-white hover:bg-[#481c91] transition-colors shadow-xs shrink-0"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}
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
