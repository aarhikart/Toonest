'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  ExternalLink,
  Square,
  ShieldAlert,
  Smartphone,
  Lock,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { DevicePreset, Orientation } from '@/lib/responsive/types';

interface PreviewFrameProps {
  url: string;
  preset: DevicePreset;
  width: number;
  height: number;
  orientation: Orientation;
  zoom: number;
  showDeviceFrame: boolean;
  showSafeArea: boolean;
  touchMode: boolean;
  dpr: number;
  onRefresh?: () => void;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({
  url,
  preset,
  width,
  height,
  orientation,
  zoom,
  showDeviceFrame,
  showSafeArea,
  touchMode,
  dpr,
}) => {
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
  const [hasLoadError, setHasLoadError] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIframeLoaded(false);
    setHasLoadError(false);
    setReloadKey(Date.now());
  }, [url]);

  const handleOpenExternal = () => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInWindow = () => {
    if (!url) return;
    const features = `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;
    window.open(url, 'ResponsiveTestWindow', features);
  };

  // Device frame styles
  const isMobile = preset.category === 'mobile';
  const isTablet = preset.category === 'tablet';

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 min-h-[500px] w-full overflow-auto bg-zinc-100/70 dark:bg-black/60 rounded-2xl">
      {/* Device Label Bar */}
      <div className="flex items-center gap-3 mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-bold text-zinc-900 dark:text-white">{preset.name}</span>
        <span>•</span>
        <span className="font-mono font-bold text-[#5722AF] dark:text-[#9B6BE8]">
          {width} × {height} px
        </span>
        <span>•</span>
        <span className="capitalize">{orientation}</span>
        <span>•</span>
        <span>Scale: {Math.round(zoom * 100)}%</span>
      </div>

      {/* Main Viewport Stage */}
      <div
        className="relative transition-transform duration-200 origin-top flex items-center justify-center"
        style={{
          transform: zoom !== 1 ? `scale(${zoom})` : undefined,
        }}
      >
        {/* Optional Realistic Device Frame Wrapper */}
        <div
          className={`relative transition-all ${
            showDeviceFrame
              ? isMobile
                ? 'p-3 bg-zinc-900 dark:bg-zinc-800 rounded-[44px] shadow-2xl border-4 border-zinc-800 dark:border-zinc-700'
                : isTablet
                ? 'p-4 bg-zinc-900 dark:bg-zinc-800 rounded-[36px] shadow-2xl border-4 border-zinc-800 dark:border-zinc-700'
                : 'p-3 bg-zinc-800 dark:bg-zinc-800 rounded-2xl shadow-2xl border-2 border-zinc-700'
              : 'shadow-xl rounded-xl border border-zinc-300 dark:border-zinc-700'
          }`}
        >
          {/* Mobile Speaker / Notch on Device Frame */}
          {showDeviceFrame && isMobile && (
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-30 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700 inline-block" />
            </div>
          )}

          {/* Viewport Canvas Container */}
          <div
            className="relative bg-white dark:bg-zinc-950 overflow-hidden"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              borderRadius: showDeviceFrame ? (isMobile ? '32px' : '20px') : '8px',
              cursor: touchMode ? 'grab' : 'default',
            }}
          >
            {/* Safe Area Overlays (Notch & Home Bar) */}
            {showSafeArea && isMobile && (
              <>
                {/* Top status/notch safe area overlay */}
                <div className="absolute top-0 left-0 right-0 h-11 bg-rose-500/20 border-b border-rose-500/40 z-20 pointer-events-none flex items-center justify-between px-6 text-[10px] font-mono text-rose-800 dark:text-rose-200 font-bold">
                  <span>9:41</span>
                  <span>Top Safe Area (44px)</span>
                  <span>100%</span>
                </div>

                {/* Bottom home indicator safe area overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-rose-500/20 border-t border-rose-500/40 z-20 pointer-events-none flex items-center justify-center">
                  <div className="w-32 h-1 bg-black/60 dark:bg-white/60 rounded-full" />
                </div>
              </>
            )}

            {/* Iframe Loading State */}
            {!iframeLoaded && !hasLoadError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-950/80 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#5722AF]/30 border-t-[#9B6BE8] animate-spin" />
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Loading {width}×{height} viewport...
                </p>
              </div>
            )}

            {/* Iframe */}
            {url ? (
              <iframe
                ref={iframeRef}
                key={`${url}-${width}-${height}-${reloadKey}`}
                src={url}
                onLoad={() => setIframeLoaded(true)}
                onError={() => setHasLoadError(true)}
                className="w-full h-full border-0 bg-white"
                title={`${preset.name} Preview`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                <p className="text-xs font-medium">Enter a website URL above to preview.</p>
              </div>
            )}

            {/* Professional Fallback Notice for Iframe Security Blocks */}
            {hasLoadError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-950 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    This website does not allow embedded previews.
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Many modern websites send <code className="font-mono text-[11px] text-[#5722AF]">X-Frame-Options: SAMEORIGIN</code> or CSP security headers that disallow embedding inside iframes.
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    You can still test the selected viewport dimensions using your browser&apos;s responsive tools or open the website directly.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenExternal}
                    className="px-4 py-2 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Website</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenInWindow}
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Open at Selected Size</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
