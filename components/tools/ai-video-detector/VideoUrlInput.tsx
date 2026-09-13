'use client';

import React, { useState } from 'react';
import { Link as LinkIcon, Clipboard, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { validateVideoUrl } from '@/lib/ai-video/validator';

interface VideoUrlInputProps {
  onUrlSubmit: (url: string) => void;
  isLoading: boolean;
}

export function VideoUrlInput({ onUrlSubmit, isLoading }: VideoUrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url.trim()) {
      setError('Please enter a video URL.');
      return;
    }

    const validation = validateVideoUrl(url.trim());
    if (!validation.isValid) {
      setError(validation.error || 'Invalid video URL.');
      return;
    }

    onUrlSubmit(validation.sanitizedUrl || url.trim());
  };

  return (
    <div className="w-full bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label
          htmlFor="video-url-input"
          className="block text-xs font-bold text-zinc-700 dark:text-zinc-300"
        >
          Public Video URL (Direct .mp4, .webm, or .mov):
        </label>

        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none">
            <LinkIcon className="w-4 h-4" />
          </div>

          <input
            id="video-url-input"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste a direct video URL (e.g. https://example.com/video.mp4)"
            disabled={isLoading}
            className="w-full pl-10 pr-24 py-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#5722AF] focus:border-transparent transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />

          <button
            type="button"
            onClick={handlePaste}
            disabled={isLoading}
            className="absolute right-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Paste</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#491B93] hover:to-[#6A3ABF] text-white font-bold text-sm shadow-md shadow-[#5722AF]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Analyze Video URL</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Advisory Callout */}
      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-2 leading-relaxed">
        <Info className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
        <span>
          <strong>URL Notice:</strong> Provide direct video URLs ending in .mp4, .webm, or .mov. Walled platforms (YouTube, TikTok, Instagram pages) require private session scraping and cannot be fetched directly via URL; please download and upload the video file instead.
        </span>
      </div>
    </div>
  );
}
