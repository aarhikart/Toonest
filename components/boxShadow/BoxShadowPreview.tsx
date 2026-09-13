'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  Sparkles,
  RotateCcw,
  User,
  ArrowRight,
  ImageIcon,
} from 'lucide-react';
import { ShadowConfig, PreviewObject } from '@/lib/boxShadow/shadowTypes';
import { generateBoxShadowCss } from '@/lib/boxShadow/shadowEngine';

interface BoxShadowPreviewProps {
  config: ShadowConfig;
  onUpdatePreview: (updates: Partial<ShadowConfig['preview']>) => void;
  onRandomize: () => void;
  onReset: () => void;
  onOpenExport: () => void;
}

const PREVIEW_BG_OPTIONS = [
  { label: 'Light Gray', value: '#F5F5F7' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Dark Slate', value: '#0F172A' },
  { label: 'Black', value: '#050505' },
  { label: 'Purple Mist', value: '#F4F0FC' },
];

export function BoxShadowPreview({
  config,
  onUpdatePreview,
  onRandomize,
  onReset,
  onOpenExport,
}: BoxShadowPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const shadowCss = generateBoxShadowCss(config.layers);

  const handleCopyCss = () => {
    navigator.clipboard.writeText(`box-shadow: ${shadowCss};`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  // Render object content depending on preview.object
  const renderObjectContent = () => {
    switch (config.preview.object) {
      case 'button':
        return (
          <div className="flex items-center justify-center gap-1.5 h-full font-bold text-xs pointer-events-none select-none px-4 text-zinc-900 dark:text-zinc-100">
            <span>Click Me</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        );

      case 'card':
        return (
          <div className="flex flex-col justify-between p-4 h-full pointer-events-none select-none text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#5722AF]/20 text-[#5722AF] flex items-center justify-center text-xs font-black">
                P
              </div>
              <span className="text-xs font-bold">Premium Card</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-snug">
              Interactive shadow depth applied to surface.
            </p>
            <div className="flex items-center justify-between text-[10px] font-semibold text-[#5722AF]">
              <span>Learn More</span>
              <span>→</span>
            </div>
          </div>
        );

      case 'circle':
        return (
          <div className="flex items-center justify-center h-full text-zinc-400 pointer-events-none">
            <User className="w-8 h-8" />
          </div>
        );

      case 'image':
        return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 pointer-events-none gap-1">
            <ImageIcon className="w-7 h-7" />
            <span className="text-[10px] font-medium">Image Placeholder</span>
          </div>
        );

      case 'input':
        return (
          <div className="flex items-center px-3 h-full text-xs font-medium text-zinc-400 pointer-events-none select-none">
            Enter your email...
          </div>
        );

      case 'custom':
      default:
        return (
          <div className="flex items-center justify-center h-full text-xs font-mono font-semibold text-zinc-400 pointer-events-none">
            {config.preview.width} × {config.preview.height}
          </div>
        );
    }
  };

  return (
    <>
      <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#12151c] transition-all">
        {/* Top Floating Overlay Toolbar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
          {/* Quick Background Swatches */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-md">
            {PREVIEW_BG_OPTIONS.map((bg) => (
              <button
                key={bg.value}
                type="button"
                onClick={() => onUpdatePreview({ previewBg: bg.value })}
                className={`w-5 h-5 rounded-full border border-white/40 transition-transform ${
                  config.preview.previewBg === bg.value
                    ? 'scale-110 ring-2 ring-white'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: bg.value }}
                title={`Canvas Background: ${bg.label}`}
              />
            ))}
          </div>

          {/* Action Toolbar */}
          <div className="pointer-events-auto flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-md">
            {/* Randomize button */}
            <button
              type="button"
              onClick={onRandomize}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Generate Random Shadow"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>

            {/* Reset button */}
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Reset to default"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Copy CSS */}
            <button
              type="button"
              onClick={handleCopyCss}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-1"
              title="Copy CSS box-shadow"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download Image Export */}
            <button
              type="button"
              onClick={onOpenExport}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Download shadow as PNG or JPG image"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Fullscreen Preview */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Preview Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Preview Stage / Canvas */}
        <div
          className="w-full h-80 sm:h-96 md:h-[440px] flex items-center justify-center p-8 transition-colors overflow-hidden select-none"
          style={{ backgroundColor: config.preview.previewBg }}
        >
          {/* Target Element with Box Shadow applied */}
          <div
            className="transition-all duration-150 relative max-w-full max-h-full"
            style={{
              width: `${config.preview.width}px`,
              height: `${config.preview.height}px`,
              borderRadius:
                config.preview.object === 'circle'
                  ? '50%'
                  : `${config.preview.borderRadius}px`,
              backgroundColor: config.preview.elementBg,
              boxShadow: shadowCss,
              border:
                config.preview.borderWidth > 0
                  ? `${config.preview.borderWidth}px solid ${config.preview.borderColor}`
                  : 'none',
            }}
          >
            {renderObjectContent()}
          </div>
        </div>

        {/* Bottom Bar: Live CSS Code Snippet */}
        <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/70 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex-1 font-mono text-xs text-zinc-700 dark:text-zinc-300 truncate bg-white dark:bg-[#12151c] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">box-shadow: </span>
            <span>{shadowCss};</span>
          </div>

          <button
            type="button"
            onClick={handleCopyCss}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#5722AF] text-white hover:bg-[#481c91] transition-all shadow-xs shrink-0"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Overlay Mode */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
          style={{ backgroundColor: config.preview.previewBg }}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xl hover:bg-black/80 transition-all"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen (Esc)</span>
          </button>

          <div
            style={{
              width: `${config.preview.width * 1.2}px`,
              height: `${config.preview.height * 1.2}px`,
              borderRadius:
                config.preview.object === 'circle'
                  ? '50%'
                  : `${config.preview.borderRadius * 1.2}px`,
              backgroundColor: config.preview.elementBg,
              boxShadow: shadowCss,
            }}
          >
            {renderObjectContent()}
          </div>
        </div>
      )}
    </>
  );
}
