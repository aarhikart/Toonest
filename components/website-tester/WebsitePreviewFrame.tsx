'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Shield,
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  Maximize2
} from 'lucide-react';

interface WebsitePreviewFrameProps {
  url: string;
  canEmbed?: boolean;
  embedBlockReason?: string;
  onOpenDirectly: () => void;
}

export function WebsitePreviewFrame({
  url,
  canEmbed,
  embedBlockReason,
  onOpenDirectly
}: WebsitePreviewFrameProps) {
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIframeError(false);
    setIframeLoaded(false);
  }, [url]);

  const handleReloadIframe = () => {
    if (iframeRef.current && url) {
      setIframeLoaded(false);
      setIframeError(false);
      iframeRef.current.src = url;
    }
  };

  // Only block if explicitly detected as non-embeddable or if the iframe failed to load
  const isBlocked = canEmbed === false || iframeError;

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[390px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Frame Header Bar */}
      <div className="p-3 sm:px-4 sm:py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 truncate max-w-[180px] sm:max-w-xs font-medium">
            {url || 'about:blank'}
          </span>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Viewport switcher */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 border border-zinc-300/60 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded-md transition ${
                viewport === 'desktop'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded-md transition ${
                viewport === 'tablet'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded-md transition ${
                viewport === 'mobile'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {url && !isBlocked && (
            <button
              type="button"
              onClick={handleReloadIframe}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700 transition"
              title="Reload preview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {url && (
            <button
              type="button"
              onClick={onOpenDirectly}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600 text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 transition flex items-center gap-1.5 shadow-xs"
              title="Open website directly in a separate browser tab"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open Directly</span>
            </button>
          )}
        </div>
      </div>

      {/* Frame Body Content */}
      <div className="relative flex-1 min-h-[500px] sm:min-h-[620px] bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-2 sm:p-4 overflow-auto">
        {!url ? (
          <div className="text-center p-6 space-y-2 text-zinc-400">
            <Monitor className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-xs font-medium">No website URL entered</p>
            <p className="text-[11px] text-zinc-500">Enter a website URL above to preview it live inside this interface.</p>
          </div>
        ) : isBlocked ? (
          /* Informative Security Policy Block Placeholder */
          <div className="max-w-md p-6 mx-auto text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <Shield className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Embedded Preview Restricted
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                This website restricts iframe embedding using security headers (<code className="font-mono">X-Frame-Options</code> or <code className="font-mono">frame-ancestors</code>) to protect against clickjacking.
              </p>
            </div>

            {embedBlockReason && (
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 break-all text-left">
                <strong>Policy header:</strong> {embedBlockReason}
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenDirectly}
                className="w-full py-2.5 px-4 rounded-xl bg-[#5722AF] hover:bg-[#461891] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Website Directly in New Tab</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-400">
              You can still interact with the site directly in a new tab without embedding restrictions.
            </p>
          </div>
        ) : (
          /* Live Iframe inside responsive viewport wrapper */
          <div className={`w-full h-full min-h-[500px] sm:min-h-[600px] mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden relative transition-all duration-300 ${getViewportWidth()}`}>
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 z-10 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <div className="w-4 h-4 border-2 border-[#5722AF] border-t-transparent rounded-full animate-spin" />
                  <span>Loading website preview...</span>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={url}
              title={`Website preview of ${url}`}
              className="w-full h-full min-h-[500px] sm:min-h-[600px] border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setIframeLoaded(true)}
              onError={() => {
                setIframeError(true);
                setIframeLoaded(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
