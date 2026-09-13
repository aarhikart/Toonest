'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Lock,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Wrench,
} from 'lucide-react';
import { ExtractedWebData, ViewportMode, BrowserDisplayMode, ConsoleLogItem } from '@/lib/web-extractor/types';
import { InPageDevToolsConsole } from './InPageDevToolsConsole';

interface InPageBrowserFrameProps {
  data: ExtractedWebData;
  onRefresh?: () => void;
}

export const InPageBrowserFrame: React.FC<InPageBrowserFrameProps> = ({
  data,
  onRefresh,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [displayMode, setDisplayMode] = useState<BrowserDisplayMode>('proxy');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoadingFrame, setIsLoadingFrame] = useState<boolean>(true);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [frameKey, setFrameKey] = useState<number>(Date.now());

  // DevTools & Console state
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [enableEruda, setEnableEruda] = useState<boolean>(false);
  const [logs, setLogs] = useState<ConsoleLogItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsLoadingFrame(true);
    setFrameKey(Date.now());
    // Clear logs on new URL load
    setLogs([]);
  }, [data.targetUrl, displayMode, enableEruda]);

  // Listen to postMessage logs from the proxied frame
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'TOOLNEST_CONSOLE_MSG') {
        const newLog: ConsoleLogItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          level: event.data.level || 'log',
          messages: event.data.messages || [],
          timestamp: event.data.timestamp || new Date().toLocaleTimeString(),
        };
        setLogs((prev) => [...prev.slice(-200), newLog]);
      } else if (event.data.type === 'TOOLNEST_EVAL_RESULT') {
        const newLog: ConsoleLogItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          level: event.data.status === 'success' ? 'eval-out' : 'eval-error',
          messages: [event.data.result || 'undefined'],
          timestamp: new Date().toLocaleTimeString(),
        };
        setLogs((prev) => [...prev.slice(-200), newLog]);
      } else if (event.data.type === 'TOOLNEST_FRAME_READY') {
        const readyLog: ConsoleLogItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          level: 'info',
          messages: [`Connected to ${event.data.title || event.data.url}`],
          timestamp: new Date().toLocaleTimeString(),
        };
        setLogs((prev) => [...prev.slice(-200), readyLog]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSendCommand = (code: string) => {
    // Log eval input
    const inLog: ConsoleLogItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      level: 'eval-in',
      messages: [code],
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [...prev, inLog]);

    // Send code to iframe for execution
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'TOOLNEST_EVAL_COMMAND',
          id: Date.now().toString(),
          code,
        },
        '*'
      );
    }
  };

  const proxyUrl = `/api/web-extractor/proxy?url=${encodeURIComponent(data.targetUrl)}${
    enableEruda ? '&devtools=true' : ''
  }`;
  const frameSrc = displayMode === 'proxy' ? proxyUrl : data.targetUrl;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(data.targetUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleReload = () => {
    setIsLoadingFrame(true);
    setFrameKey(Date.now());
    if (onRefresh) onRefresh();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Viewport width styles
  const getViewportWidth = (): string => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      case 'laptop':
        return 'w-[1024px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  const errorCount = logs.filter((l) => l.level === 'error' || l.level === 'eval-error').length;

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Browser Chrome Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {/* Left: Window Dots & Device Selectors */}
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {/* Viewport controls */}
          <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-300/60 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('laptop')}
              title="Laptop View (1024px)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewport === 'laptop'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Interactive Address Bar */}
        <div className="flex-1 min-w-[240px] max-w-xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs text-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate select-all flex-1">
              {data.targetUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyUrl}
              title="Copy URL"
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right: Console Toggle, Mode Switcher & Tools */}
        <div className="flex items-center gap-2">
          {/* Console Toggle Button */}
          <button
            type="button"
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isConsoleOpen
                ? 'bg-[#5722AF] text-white border-[#9B6BE8] shadow-md shadow-[#5722AF]/30'
                : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
            }`}
            title="Open In-Page JavaScript Console & DevTools"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Console</span>
            {logs.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                errorCount > 0 ? 'bg-rose-500 text-white' : 'bg-zinc-900 text-emerald-300'
              }`}>
                {logs.length}
              </span>
            )}
          </button>

          {/* Mode Tabs */}
          <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 p-1 rounded-xl text-xs border border-zinc-300/60 dark:border-zinc-700/60">
            <button
              type="button"
              onClick={() => setDisplayMode('proxy')}
              title="In-Page Proxy: Bypasses X-Frame-Options blocks & connects Console"
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                displayMode === 'proxy'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              In-Page Proxy
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('direct')}
              title="Direct Embed: Native iframe"
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                displayMode === 'direct'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Direct Embed
            </button>
          </div>

          <button
            type="button"
            onClick={handleReload}
            title="Reload Frame"
            className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFrame ? 'animate-spin text-[#9B6BE8]' : ''}`} />
          </button>

          <a
            href={data.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in New Tab"
            className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Frame Sub-bar: Status, DevTools info, and Zoom */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Status: {data.statusCode} {data.statusText}</span>
          </span>
          <span>•</span>
          <span>Response: <strong className="text-zinc-700 dark:text-zinc-300">{data.loadTimeMs}ms</strong></span>
          <span>•</span>
          <span>Size: <strong className="text-zinc-700 dark:text-zinc-300">{(data.pageSizeBytes / 1024).toFixed(1)} KB</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {displayMode === 'proxy' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 font-medium flex items-center gap-1">
              <Terminal className="w-3 h-3 text-purple-400" />
              <span>Console Bridge Active</span>
            </span>
          )}
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              -
            </button>
            <span className="font-mono text-[10px]">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Frame Viewport Stage */}
      <div className={`relative w-full ${isConsoleOpen ? 'h-[50vh]' : 'min-h-[640px] h-[75vh]'} bg-zinc-100 dark:bg-black/90 flex items-center justify-center overflow-auto p-2 sm:p-4 transition-all`}>
        {isLoadingFrame && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 dark:bg-black/70 backdrop-blur-xs gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#5722AF]/30 border-t-[#9B6BE8] animate-spin" />
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Loading Website Inside Frame...
            </p>
          </div>
        )}

        <div
          className={`h-full transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 ${getViewportWidth()}`}
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          <iframe
            ref={iframeRef}
            key={`${frameSrc}-${frameKey}`}
            src={frameSrc}
            onLoad={() => setIsLoadingFrame(false)}
            className="w-full h-full border-0 bg-white"
            title={`${data.metadata.title || data.domain} In-Page View`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>
      </div>

      {/* Docked DevTools Console */}
      <InPageDevToolsConsole
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        logs={logs}
        onClear={() => setLogs([])}
        onSendCommand={handleSendCommand}
        enableEruda={enableEruda}
        onToggleEruda={(enabled) => {
          setEnableEruda(enabled);
          setIsLoadingFrame(true);
          setFrameKey(Date.now());
        }}
      />
    </div>
  );
};
