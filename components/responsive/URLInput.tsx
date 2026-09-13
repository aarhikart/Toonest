'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  RefreshCw,
  History,
  Trash2,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { normalizeURL, validateURL } from '@/lib/responsive/url';
import { getRecentUrls, saveRecentUrl, clearRecentUrls } from '@/lib/responsive/storage';

interface URLInputProps {
  url: string;
  onUrlChange: (newUrl: string) => void;
  onReload: () => void;
  isLoading?: boolean;
}

const SAMPLE_SITES = [
  { label: 'Example.com', url: 'https://example.com' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org' },
  { label: 'Hacker News', url: 'https://news.ycombinator.com' },
  { label: 'GitHub', url: 'https://github.com' },
];

export const URLInput: React.FC<URLInputProps> = ({
  url,
  onUrlChange,
  onReload,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState(url);
  const [error, setError] = useState<string | null>(null);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  useEffect(() => {
    setRecentUrls(getRecentUrls());
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const validation = validateURL(inputValue);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid website URL.');
      return;
    }

    const normalized = normalizeURL(inputValue);
    setInputValue(normalized);
    saveRecentUrl(normalized);
    setRecentUrls(getRecentUrls());
    setIsHistoryOpen(false);
    onUrlChange(normalized);
  };

  const handleSelectRecent = (selected: string) => {
    setInputValue(selected);
    setError(null);
    setIsHistoryOpen(false);
    onUrlChange(selected);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentUrls();
    setRecentUrls([]);
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Main URL Input field */}
        <div className="relative flex-1">
          <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="https://example.com"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] shadow-xs"
          />

          {/* Recent URLs dropdown trigger */}
          {recentUrls.length > 0 && (
            <button
              type="button"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              title="Recent website URLs"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* History dropdown menu */}
          {isHistoryOpen && recentUrls.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              <div className="p-2 bg-zinc-50 dark:bg-zinc-800/60 flex items-center justify-between text-[11px] font-semibold text-zinc-500">
                <span className="flex items-center gap-1">
                  <History className="w-3 h-3" /> Recent URLs
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-rose-500 hover:underline cursor-pointer"
                >
                  Clear History
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {recentUrls.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleSelectRecent(u)}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate transition-colors cursor-pointer"
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            Test Website
          </button>

          <button
            type="button"
            onClick={onReload}
            title="Reload Preview"
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#9B6BE8]' : ''}`} />
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick sample sites */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
        <span className="text-[11px] font-medium mr-1">Quick Samples:</span>
        {SAMPLE_SITES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => {
              setInputValue(sample.url);
              onUrlChange(sample.url);
            }}
            className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
