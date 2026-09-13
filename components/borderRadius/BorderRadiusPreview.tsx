'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  User,
  Grid,
  Download,
  ImageIcon,
} from 'lucide-react';
import {
  BorderRadiusConfig,
  CornerRadius,
} from '@/lib/borderRadius/borderRadiusTypes';
import { generateBorderRadiusCss } from '@/lib/borderRadius/borderRadiusEngine';
import { VisualCornerHandles } from './VisualCornerHandles';

interface BorderRadiusPreviewProps {
  config: BorderRadiusConfig;
  onUpdateConfig: (updates: Partial<BorderRadiusConfig>) => void;
  onUpdateCorner: (
    corner: keyof CornerRadius,
    value: number,
    axis?: 'horizontal' | 'vertical'
  ) => void;
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

export function BorderRadiusPreview({
  config,
  onUpdateConfig,
  onUpdateCorner,
  onRandomize,
  onReset,
  onOpenExport,
}: BorderRadiusPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const radiusCss = generateBorderRadiusCss(config);

  const handleCopyCss = () => {
    navigator.clipboard.writeText(`border-radius: ${radiusCss};`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const toggleGuides = () => {
    onUpdateConfig({
      preview: {
        ...config.preview,
        showGuides: !config.preview.showGuides,
      },
    });
  };

  const setPreviewBg = (bg: string) => {
    onUpdateConfig({
      preview: {
        ...config.preview,
        previewBg: bg,
      },
    });
  };

  // Object inner content
  const renderObjectContent = () => {
    switch (config.preview.object) {
      case 'button':
        return (
          <div className="flex items-center justify-center gap-2 h-full text-white font-bold text-xs select-none pointer-events-none px-4">
            <span>Primary Action</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        );

      case 'card':
        return (
          <div className="flex flex-col justify-between h-full p-4 select-none pointer-events-none text-white">
            <div className="space-y-1">
              <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs font-bold leading-tight">Card Component</div>
              <div className="text-[10px] text-white/75 leading-tight line-clamp-2">
                Real-time border radius preview
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/20">
              <span className="font-mono">{radiusCss}</span>
              <span className="font-semibold underline">Details</span>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="flex items-center justify-between h-full px-4 text-white text-xs select-none pointer-events-none font-mono">
            <span>Type here...</span>
            <span className="w-2 h-3.5 bg-white animate-pulse" />
          </div>
        );

      case 'image':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white/90 gap-1.5 select-none pointer-events-none">
            <ImageIcon className="w-6 h-6" />
            <span className="text-[11px] font-semibold">Image Container</span>
          </div>
        );

      case 'circle':
      case 'rectangle':
      case 'custom':
      default:
        return (
          <div className="flex items-center justify-center h-full select-none pointer-events-none text-white text-center p-2">
            <span className="font-mono text-xs font-semibold drop-shadow-xs truncate max-w-full">
              {radiusCss}
            </span>
          </div>
        );
    }
  };

  const previewStyle: React.CSSProperties = {
    width: `${config.preview.width}px`,
    height: `${config.preview.height}px`,
    backgroundColor: config.preview.elementBg,
    borderRadius: radiusCss,
    border: config.preview.border.enabled
      ? `${config.preview.border.width}px ${config.preview.border.style} ${config.preview.border.color}`
      : undefined,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-4">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Live Preview
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[#5722AF] dark:text-[#9B6BE8] font-semibold max-w-[200px] truncate">
              {radiusCss}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Show Guides Toggle */}
            <button
              type="button"
              onClick={toggleGuides}
              title={config.preview.showGuides ? 'Hide guides' : 'Show guides'}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
                config.preview.showGuides
                  ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            {/* Copy CSS */}
            <button
              type="button"
              onClick={handleCopyCss}
              title="Copy CSS to clipboard"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#5722AF] hover:bg-[#491B93] text-white text-xs font-semibold shadow-xs transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy CSS</span>
                </>
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Expand preview"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div
          style={{ backgroundColor: config.preview.previewBg }}
          className="relative w-full min-h-[320px] sm:min-h-[360px] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-center p-6 sm:p-10 overflow-hidden select-none transition-colors"
        >
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Guide Overlay Lines */}
          {config.preview.showGuides && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
              <div className="w-full h-px border-t border-dashed border-[#5722AF]/35" />
              <div className="h-full w-px border-l border-dashed border-[#5722AF]/35 absolute" />
            </div>
          )}

          {/* Target Element Container with Drag Handles */}
          <div className="relative z-15" style={{ width: `${config.preview.width}px`, height: `${config.preview.height}px` }}>
            {/* Visual Corner Drag Handles */}
            <VisualCornerHandles
              config={config}
              elementWidth={config.preview.width}
              elementHeight={config.preview.height}
              onUpdateCorner={onUpdateCorner}
            />

            {/* Actual Rounded Element */}
            <div style={previewStyle} className="relative overflow-hidden transition-all duration-75">
              {renderObjectContent()}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Canvas Background Quick Switcher & Dimension Indicator */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 dark:text-zinc-500 font-medium">Canvas:</span>
            {PREVIEW_BG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPreviewBg(opt.value)}
                title={opt.label}
                className={`w-5 h-5 rounded-full border transition-all ${
                  config.preview.previewBg === opt.value
                    ? 'border-[#5722AF] ring-2 ring-[#5722AF]/30 scale-110'
                    : 'border-zinc-300 dark:border-zinc-600 hover:scale-105'
                }`}
                style={{ backgroundColor: opt.value }}
              />
            ))}
          </div>

          <div className="text-zinc-400 dark:text-zinc-500 font-mono text-[11px]">
            {config.preview.width} × {config.preview.height} px
          </div>
        </div>
      </div>

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            style={{ backgroundColor: config.preview.previewBg }}
            className="relative w-full max-w-5xl h-[85vh] rounded-2xl border border-zinc-700 shadow-2xl flex items-center justify-center p-12 overflow-hidden"
          >
            {/* Top Toolbar */}
            <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20">
              <div className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/10">
                border-radius: {radiusCss};
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCss}
                  className="px-3 py-1.5 rounded-lg bg-[#5722AF] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 hover:bg-[#491B93]"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 border border-white/10 transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Element Container in Fullscreen */}
            <div className="relative z-10" style={{ width: `${config.preview.width * 1.3}px`, height: `${config.preview.height * 1.3}px` }}>
              <VisualCornerHandles
                config={config}
                elementWidth={config.preview.width * 1.3}
                elementHeight={config.preview.height * 1.3}
                onUpdateCorner={onUpdateCorner}
              />
              <div
                style={{
                  ...previewStyle,
                  width: `${config.preview.width * 1.3}px`,
                  height: `${config.preview.height * 1.3}px`,
                }}
                className="relative overflow-hidden"
              >
                {renderObjectContent()}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
