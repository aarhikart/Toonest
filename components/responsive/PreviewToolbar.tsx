'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Shield,
  Layers,
  Square,
  Sparkles,
} from 'lucide-react';

interface PreviewToolbarProps {
  zoom: number; // 0.5, 0.75, 1, 1.25
  onZoomChange: (z: number) => void;
  onFitToScreen: () => void;
  showDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  showSafeArea: boolean;
  onToggleSafeArea: () => void;
  touchMode: boolean;
  onToggleTouchMode: () => void;
  dpr: number;
  onDprChange: (dpr: number) => void;
  onRefresh: () => void;
  onOpenExternal: () => void;
  onOpenInWindow: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  zoom,
  onZoomChange,
  onFitToScreen,
  showDeviceFrame,
  onToggleDeviceFrame,
  showSafeArea,
  onToggleSafeArea,
  touchMode,
  onToggleTouchMode,
  dpr,
  onDprChange,
  onRefresh,
  onOpenExternal,
  onOpenInWindow,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(0.5, zoom - 0.25))}
          title="Zoom out"
          className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="font-mono font-bold text-[11px] px-1 text-zinc-700 dark:text-zinc-300">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={() => onZoomChange(Math.min(1.5, zoom + 0.25))}
          title="Zoom in"
          className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onZoomChange(1)}
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
            zoom === 1 ? 'bg-[#5722AF] text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          100%
        </button>

        <button
          type="button"
          onClick={onFitToScreen}
          className="px-1.5 py-0.5 rounded text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
        >
          Fit
        </button>
      </div>

      {/* Visual Testing Aids */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Device Frame Toggle */}
        <button
          type="button"
          onClick={onToggleDeviceFrame}
          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            showDeviceFrame
              ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] border-[#5722AF]/30 font-bold'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
          }`}
          title="Toggle realistic device frame"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Frame: {showDeviceFrame ? 'ON' : 'OFF'}</span>
        </button>

        {/* Safe Area Toggle */}
        <button
          type="button"
          onClick={onToggleSafeArea}
          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            showSafeArea
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
          }`}
          title="Show mobile safe area overlays (notch & home indicator)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Safe Area: {showSafeArea ? 'ON' : 'OFF'}</span>
        </button>

        {/* Touch Mode */}
        <button
          type="button"
          onClick={onToggleTouchMode}
          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
            touchMode
              ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 font-bold'
              : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
          }`}
          title="Visual touch pointer simulator"
        >
          <span>Touch Mode: {touchMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Simulated DPR */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px]">
          <span className="text-zinc-400 font-medium">DPR:</span>
          {[1, 1.5, 2, 3].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onDprChange(val)}
              className={`px-1.5 py-0.5 rounded font-mono font-bold cursor-pointer ${
                dpr === val ? 'bg-[#5722AF] text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {val}x
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onRefresh}
          title="Reload preview"
          className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenInWindow}
          title="Open in Resized Window"
          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 text-[#9B6BE8]" />
          <span className="hidden sm:inline">Popup Size</span>
        </button>

        <button
          type="button"
          onClick={onOpenExternal}
          title="Open website in new tab"
          className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
