'use client';

import React, { useState } from 'react';
import {
  Link as LinkIcon,
  X,
  Clipboard,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { isValidInstagramReelUrl } from '@/lib/instagram/validator';

interface ReelUrlInputCardProps {
  url: string;
  onChangeUrl: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function ReelUrlInputCard({
  url,
  onChangeUrl,
  onSubmit,
  isLoading,
  error,
}: ReelUrlInputCardProps) {
  const [pasteFeedback, setPasteFeedback] = useState(false);

  const isValid = url.trim().length > 0 && isValidInstagramReelUrl(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeUrl(text.trim());
        setPasteFeedback(true);
        setTimeout(() => setPasteFeedback(false), 1500);
      }
    } catch (err) {
      console.warn('Clipboard paste blocked or unsupported:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && url.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-7 shadow-xs transition-colors space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading && url.trim()) onSubmit();
        }}
        className="space-y-3"
      >
        {/* Input Wrapper */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none">
            <LinkIcon className="w-5 h-5" />
          </div>

          <input
            type="url"
            value={url}
            onChange={(e) => onChangeUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Paste Instagram Reel URL here"
            className="w-full pl-11 pr-24 py-3.5 sm:py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#181a24] text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-hidden focus:border-[#5722AF] focus:ring-2 focus:ring-[#5722AF]/20 transition-all"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Right Action Icons (Clear & Paste) */}
          <div className="absolute right-2.5 flex items-center gap-1.5">
            {url && (
              <button
                type="button"
                onClick={() => onChangeUrl('')}
                disabled={isLoading}
                title="Clear input"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all"
            >
              {pasteFeedback ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pasted</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Validation Indicator */}
        {url.trim().length > 0 && !error && (
          <div className="flex items-center gap-1.5 text-xs">
            {isValid ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid Instagram Reel link detected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Link should look like: https://www.instagram.com/reel/...
              </span>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Main Action Button */}
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#491B93] hover:to-[#6A3ABF] text-white font-bold text-sm sm:text-base shadow-md shadow-[#5722AF]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Fetching Reel...</span>
            </>
          ) : (
            <>
              <span>Get Reel</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Responsible Use Micro-Notice */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 text-center">
        <Shield className="w-3 h-3 text-zinc-400 shrink-0" />
        <span>Only download public reels that you own or are permitted to save.</span>
      </div>
    </div>
  );
}
