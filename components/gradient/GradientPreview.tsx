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
  Grid,
  Edit2,
} from 'lucide-react';
import { GradientConfig } from '@/lib/gradient/gradientTypes';
import { generateGradientCss } from '@/lib/gradient/gradientEngine';

interface GradientPreviewProps {
  config: GradientConfig;
  onUpdateName: (name: string) => void;
  onRandomize: () => void;
  onReset: () => void;
  onOpenExport: () => void;
}

export function GradientPreview({
  config,
  onUpdateName,
  onRandomize,
  onReset,
  onOpenExport,
}: GradientPreviewProps) {
  const [showCheckerboard, setShowCheckerboard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(config.name);

  const cssValue = generateGradientCss(config);

  const handleCopyCss = () => {
    navigator.clipboard.writeText(`background: ${cssValue};`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <>
      <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#12151c] transition-all">
        {/* Top Floating Overlay Bar: Name & Quick Actions */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
          {/* Gradient Name Pill */}
          <div className="pointer-events-auto bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
            {isEditingName ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                autoFocus
                className="bg-white/20 text-white px-1.5 py-0.5 rounded outline-none w-32 text-xs font-medium"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempName(config.name);
                  setIsEditingName(true);
                }}
                className="hover:underline flex items-center gap-1"
                title="Click to rename gradient"
              >
                <span>{config.name}</span>
                <Edit2 className="w-3 h-3 opacity-70" />
              </button>
            )}
          </div>

          {/* Quick Overlay Toolbar */}
          <div className="pointer-events-auto flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-md">
            {/* Checkerboard toggle */}
            <button
              type="button"
              onClick={() => setShowCheckerboard(!showCheckerboard)}
              className={`p-1.5 rounded-lg text-white transition-colors ${
                showCheckerboard ? 'bg-white/30 text-white' : 'hover:bg-white/20 text-white/80'
              }`}
              title="Toggle transparency checkerboard"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Randomize button */}
            <button
              type="button"
              onClick={onRandomize}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Generate Random Gradient"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>

            {/* Reset button */}
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Reset to default ToolNest Purple"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Copy CSS */}
            <button
              type="button"
              onClick={handleCopyCss}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors flex items-center gap-1"
              title="Copy CSS gradient"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Download Image Export */}
            <button
              type="button"
              onClick={onOpenExport}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              title="Download gradient as PNG or JPG"
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

        {/* Live Gradient Preview Box */}
        <div
          className={`w-full h-80 sm:h-96 md:h-[420px] transition-all relative ${
            showCheckerboard
              ? 'bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]'
              : ''
          }`}
        >
          <div
            className="w-full h-full transition-all duration-200"
            style={{ background: cssValue }}
          />
        </div>

        {/* Bottom Bar: Live CSS Snippet with Quick Copy */}
        <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-900/70 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex-1 font-mono text-xs text-zinc-700 dark:text-zinc-300 truncate bg-white dark:bg-[#12151c] px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-[#5722AF] dark:text-[#9B6BE8] font-bold">background: </span>
            <span>{cssValue};</span>
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

      {/* Fullscreen Overlay Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
          style={{ background: cssValue }}
        >
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xl hover:bg-black/80 transition-all"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen (Esc)</span>
          </button>
        </div>
      )}
    </>
  );
}
