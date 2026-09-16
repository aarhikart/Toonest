'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Home,
  Lock,
  Unlock,
  Search,
  ExternalLink,
  Maximize2,
  Minimize2,
  Monitor,
  Laptop,
  Tablet,
  Smartphone,
  Shield,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  X,
  Clock,
  CheckCircle2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { normalizeUrl, isValidUrl } from '@/lib/website-tester/validator';

const PRESET_SITES = [
  { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Main_Page' },
  { name: 'Example Domain', url: 'https://example.com' },
  { name: 'W3Schools', url: 'https://www.w3schools.com' },
  { name: 'OpenStreetMap', url: 'https://www.openstreetmap.org' },
  { name: 'Internet Archive', url: 'https://archive.org' }
];

export function WebsiteViewer() {
  const [currentUrl, setCurrentUrl] = useState<string>('https://example.com');
  const [inputUrl, setInputUrl] = useState<string>('https://example.com');
  const [history, setHistory] = useState<string[]>(['https://example.com']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [embedBlocked, setEmbedBlocked] = useState<boolean>(false);
  const [embedBlockReason, setEmbedBlockReason] = useState<string>('');
  const [securityInfo, setSecurityInfo] = useState<{ isHttps: boolean; host: string }>({
    isHttps: true,
    host: 'example.com'
  });

  const [viewport, setViewport] = useState<'desktop' | 'laptop' | 'tablet' | 'mobile'>('desktop');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent URLs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('toolnest_viewer_recent');
      if (stored) {
        setRecentUrls(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const saveToRecent = (urlToSave: string) => {
    try {
      setRecentUrls(prev => {
        const filtered = prev.filter(u => u !== urlToSave);
        const updated = [urlToSave, ...filtered].slice(0, 10);
        localStorage.setItem('toolnest_viewer_recent', JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore localStorage write errors
    }
  };

  // Check header embeddability via backend assisted API
  const verifyEmbeddability = async (targetUrl: string) => {
    try {
      const res = await fetch('/api/website-tester/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      const data = await res.json();

      if (data && data.http) {
        if (data.http.canEmbed === false) {
          setEmbedBlocked(true);
          setEmbedBlockReason(
            data.http.embedBlockReason ||
            `Embedding restricted by security headers (${data.http.xFrameOptions ? `X-Frame-Options: ${data.http.xFrameOptions}` : 'CSP frame-ancestors'})`
          );
        } else {
          setEmbedBlocked(false);
          setEmbedBlockReason('');
        }
      }
    } catch {
      // If API query fails, allow direct iframe attempt
      setEmbedBlocked(false);
    }
  };

  const navigateTo = (targetUrl: string, addToHistory = true) => {
    const normalized = normalizeUrl(targetUrl);
    if (!isValidUrl(normalized)) {
      setValidationError('Please enter a valid website URL (e.g., https://example.com)');
      return;
    }

    setValidationError('');
    setIsLoading(true);
    setLoadProgress(30);
    setIframeError(false);
    setEmbedBlocked(false);
    setEmbedBlockReason('');
    setCurrentUrl(normalized);
    setInputUrl(normalized);

    try {
      const parsed = new URL(normalized);
      setSecurityInfo({
        isHttps: parsed.protocol === 'https:',
        host: parsed.hostname
      });
    } catch {
      // fallback
    }

    if (addToHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(normalized);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    saveToRecent(normalized);

    // Verify embedding restrictions asynchronously
    verifyEmbeddability(normalized);

    // Simulate progress animation
    const progressTimer = setTimeout(() => {
      setLoadProgress(70);
    }, 300);

    return () => clearTimeout(progressTimer);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    navigateTo(inputUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      navigateTo(history[newIndex], false);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      navigateTo(history[newIndex], false);
    }
  };

  const handleReload = () => {
    if (!currentUrl) return;
    setIsLoading(true);
    setLoadProgress(40);
    setIframeError(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  const handleOpenDirectly = () => {
    if (!currentUrl) return;
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getViewportClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[390px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'laptop':
        return 'max-w-[1024px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="space-y-4">
      {/* Browser Window Chrome */}
      <div
        ref={containerRef}
        className={`bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200/90 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'min-h-[720px]'
        }`}
      >
        {/* Top Window Titlebar */}
        <div className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            {/* macOS-style Window Buttons */}
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50" />
            </div>

            {/* Active Tab Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-800 rounded-t-lg border border-b-0 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-[11px] shadow-xs max-w-[220px] truncate">
              {securityInfo.isHttps ? (
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Unlock className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <span className="truncate">{securityInfo.host || 'New Tab'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="hidden md:inline font-mono">
              Zoom: {zoomLevel}%
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline capitalize">
              Viewport: {viewport}
            </span>
          </div>
        </div>

        {/* Browser Navigation Toolbar */}
        <div className="p-2 sm:px-4 sm:py-2 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
          {/* Back / Forward / Refresh Navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleBack}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReload}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              title="Reload page"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#5722AF]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('https://example.com')}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* Omnibox / URL Address Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="flex-1 min-w-[240px] relative flex items-center"
          >
            <div className="w-full flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus-within:border-[#5722AF] dark:focus-within:border-[#9B6BE8] focus-within:ring-2 focus-within:ring-[#5722AF]/20 rounded-xl transition shadow-xs">
              {securityInfo.isHttps ? (
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}

              <input
                type="text"
                value={inputUrl}
                onChange={e => {
                  setInputUrl(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Enter website URL (e.g., https://example.com)..."
                className="w-full bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
              />

              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                className="px-2.5 py-0.5 text-[11px] font-bold bg-[#5722AF] hover:bg-[#461891] text-white rounded-lg transition"
              >
                Go
              </button>
            </div>
          </form>

          {/* Viewport Toggles */}
          <div className="hidden md:flex items-center p-0.5 bg-zinc-200/70 dark:bg-zinc-900 rounded-xl border border-zinc-300/80 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition ${
                viewport === 'desktop'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Desktop (100% Full Width)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('laptop')}
              className={`p-1.5 rounded-lg transition ${
                viewport === 'laptop'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Laptop (1024px)"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition ${
                viewport === 'tablet'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition ${
                viewport === 'mobile'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Mobile (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1 p-0.5 bg-zinc-200/70 dark:bg-zinc-900 rounded-xl border border-zinc-300/80 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="px-1.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              title="Reset Zoom"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Actions: Open Tab & Fullscreen */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenDirectly}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              title="Open website in new browser tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Top Loading Progress Bar */}
        {isLoading && (
          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] transition-all duration-300 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        )}

        {/* Validation Error Message if any */}
        {validationError && (
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Iframe Viewport Area */}
        <div className="relative flex-1 bg-zinc-100 dark:bg-zinc-950 p-2 sm:p-4 flex items-center justify-center overflow-auto min-h-[560px]">
          {embedBlocked || iframeError ? (
            /* Security Restriction / Embed Block Error Screen */
            <div className="max-w-lg p-6 sm:p-8 mx-auto text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                <Shield className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Website Embedding Restricted
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  This website sends HTTP security headers (<code className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">X-Frame-Options</code> or <code className="font-mono text-[11px] bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">frame-ancestors</code>) instructing browsers not to embed it inside another web application.
                </p>
              </div>

              {embedBlockReason && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-left text-[11px] font-mono text-zinc-700 dark:text-zinc-300 break-all">
                  <strong>Detected Policy:</strong> {embedBlockReason}
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenDirectly}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:opacity-90 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Directly in New Tab</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmbedBlocked(false);
                    setIframeError(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition"
                >
                  Try Again Anyway
                </button>
              </div>

              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Clickjacking protection is an international web security standard that prevents sensitive sites (banking, social media, accounts) from being framed without permission.
              </p>
            </div>
          ) : (
            /* Live Interactive Website Iframe */
            <div
              className={`w-full h-full min-h-[560px] mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden relative transition-all duration-300 ${getViewportClass()}`}
              style={{
                transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                transformOrigin: 'top center'
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-zinc-900/70 z-10 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    <div className="w-5 h-5 border-2 border-[#5722AF] border-t-transparent rounded-full animate-spin" />
                    <span>Loading website...</span>
                  </div>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={currentUrl}
                title={`Live website viewer of ${currentUrl}`}
                className="w-full h-full min-h-[560px] border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-presentation"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => {
                  setIsLoading(false);
                  setLoadProgress(100);
                }}
                onError={() => {
                  setIsLoading(false);
                  setIframeError(true);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Preset Sites & Recent History Chips */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Sample Testing Sites (Embedding-Friendly):</span>
          </span>
          {recentUrls.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              className="text-zinc-500 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] flex items-center gap-1 text-[11px]"
            >
              <Clock className="w-3 h-3" />
              <span>{recentUrls.length} Recent URLs</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_SITES.map((site) => (
            <button
              key={site.name}
              type="button"
              onClick={() => navigateTo(site.url)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-[#5722AF]/10 dark:hover:bg-[#5722AF]/20 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] border border-zinc-200/80 dark:border-zinc-700 transition flex items-center gap-1.5"
            >
              <span>{site.name}</span>
            </button>
          ))}
        </div>

        {/* Recent URLs Dropdown */}
        {showHistoryDropdown && recentUrls.length > 0 && (
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400">Recently Navigated:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {recentUrls.map((rUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    navigateTo(rUrl);
                    setShowHistoryDropdown(false);
                  }}
                  className="text-left px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate"
                  title={rUrl}
                >
                  {rUrl}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
