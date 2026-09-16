'use client';

import React, { useState } from 'react';
import { Globe, ArrowRight, X, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { normalizeUrl, isValidUrl } from '@/lib/website-tester/validator';

interface UrlInputBarProps {
  url: string;
  onChangeUrl: (url: string) => void;
  onRunTest: (targetUrl: string) => void;
  isLoading: boolean;
  onClear: () => void;
}

export function UrlInputBar({
  url,
  onChangeUrl,
  onRunTest,
  isLoading,
  onClear
}: UrlInputBarProps) {
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Please enter a website URL to test.');
      return;
    }

    const normalized = normalizeUrl(url);
    if (!isValidUrl(normalized)) {
      setErrorMsg('Please enter a valid website URL (e.g. https://example.com).');
      return;
    }

    setErrorMsg('');
    onChangeUrl(normalized);
    onRunTest(normalized);
  };

  const handleQuickSelect = (sampleUrl: string) => {
    setErrorMsg('');
    onChangeUrl(sampleUrl);
    onRunTest(sampleUrl);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200/80 dark:border-zinc-800 shadow-sm focus-within:border-[#5722AF] dark:focus-within:border-[#7B45D1] transition-all">
          <div className="flex items-center gap-3 px-3 flex-1">
            <Globe className="w-5 h-5 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
            <input
              type="text"
              value={url}
              onChange={e => {
                onChangeUrl(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Enter website URL (e.g. https://example.com or your-domain.com)"
              className="w-full bg-transparent text-sm sm:text-base font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
              disabled={isLoading}
              autoComplete="off"
              spellCheck={false}
            />
            {url && !isLoading && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 shadow-md shadow-[#5722AF]/25 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Testing Access...</span>
                </>
              ) : (
                <>
                  <span>Test Website</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 px-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Quick Tests */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
        <span className="font-semibold text-zinc-600 dark:text-zinc-300">Quick Test:</span>
        <button
          type="button"
          onClick={() => handleQuickSelect('https://example.com')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
        >
          example.com (Standard)
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect('https://httpbin.org/get')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
        >
          httpbin.org (API / Permissive)
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect('https://github.com')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
        >
          github.com (X-Frame Deny)
        </button>
      </div>
    </div>
  );
}
