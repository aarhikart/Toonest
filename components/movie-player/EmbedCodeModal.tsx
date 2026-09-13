'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Code2, Globe, ShieldCheck, Tv } from 'lucide-react';
import { MovieItem, StreamServer } from '@/lib/movie/movieTypes';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieItem | null;
  server: StreamServer;
  season?: number;
  episode?: number;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({
  isOpen,
  onClose,
  movie,
  server,
  season = 1,
  episode = 1,
}) => {
  const [copied, setCopied] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16-9' | '21-9' | 'fixed'>('16-9');
  const [autoPlay, setAutoPlay] = useState(true);
  const [adShield, setAdShield] = useState(true);
  const [targetSeason, setTargetSeason] = useState(season);
  const [targetEpisode, setTargetEpisode] = useState(episode);

  useEffect(() => {
    setTargetSeason(season);
    setTargetEpisode(episode);
  }, [season, episode, movie?.id]);

  if (!isOpen || !movie) return null;

  const isTv = movie.type === 'TV' || movie.type === 'SERIES';
  const totalSeasons = movie.totalSeasons || movie.seasons?.length || 1;

  const rawStreamUrl = isTv && server.buildTvUrl
    ? server.buildTvUrl(movie.id, targetSeason, targetEpisode)
    : server.buildMovieUrl(movie.id);

  const streamUrl = autoPlay ? rawStreamUrl : rawStreamUrl.replace('autoPlay=true', 'autoPlay=false').replace('autoplay=true', 'autoplay=false');
  const sandboxAttr = adShield ? '\n    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"' : '';

  const mediaLabel = isTv
    ? `${movie.title} S${targetSeason}E${targetEpisode}`
    : `${movie.title} (${movie.year})`;

  let embedCode = '';
  if (aspectRatio === '16-9') {
    embedCode = `<!-- Responsive 16:9 ${isTv ? 'TV' : 'Movie'} Embed for ${mediaLabel} -->
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; background: #000;">
  <iframe
    src="${streamUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"${sandboxAttr}
    allowfullscreen
    loading="lazy"
    title="${mediaLabel} Stream"
  ></iframe>
</div>`;
  } else if (aspectRatio === '21-9') {
    embedCode = `<!-- Cinema 21:9 Ultra-Wide Embed for ${mediaLabel} -->
<div style="position: relative; padding-bottom: 42.85%; height: 0; overflow: hidden; max-width: 100%; border-radius: 12px; background: #000;">
  <iframe
    src="${streamUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"${sandboxAttr}
    allowfullscreen
    loading="lazy"
    title="${mediaLabel} Cinema Stream"
  ></iframe>
</div>`;
  } else {
    embedCode = `<iframe
  src="${streamUrl}"
  width="100%"
  height="540"
  style="border: 0; border-radius: 12px; background: #000;"
  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"${sandboxAttr}
  allowfullscreen
  loading="lazy"
  title="${mediaLabel}"
></iframe>`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111624] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              {isTv ? <Tv className="w-5 h-5" /> : <Code2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-tight">
                Embed Player Code
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {movie.title} {isTv ? `• Season ${targetSeason}, Ep ${targetEpisode}` : `(${movie.year})`} • {server.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TV Season & Episode Selector if TV */}
          {isTv && (
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Season:</span>
                <input
                  type="number"
                  min="1"
                  max={Math.max(totalSeasons, 10)}
                  value={targetSeason}
                  onChange={(e) => setTargetSeason(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#5722AF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Episode:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetEpisode}
                  onChange={(e) => setTargetEpisode(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#5722AF]"
                />
              </div>

              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 ml-auto">
                Direct embed code generates for <strong>S{targetSeason}:E{targetEpisode}</strong>
              </span>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                Aspect Ratio
              </label>
              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16-9')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    aspectRatio === '16-9'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  16:9 HD
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('21-9')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    aspectRatio === '21-9'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  21:9 Cinema
                </button>
                <button
                  type="button"
                  onClick={() => setAspectRatio('fixed')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                    aspectRatio === 'fixed'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Fixed 540px
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Playback &amp; Ad-Shield Options
              </label>
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    className="rounded text-[#5722AF] focus:ring-[#5722AF]"
                  />
                  <span>Auto-play stream upon load</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adShield}
                    onChange={(e) => setAdShield(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>🛡️ Ad-Shield (Blocks popups &amp; redirects)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Code Box */}
          <div className="relative">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1 px-1">
              <span>HTML / Iframe Snippet</span>
              <span className="text-[10px]">Zero dependencies • Paste anywhere</span>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed select-all">
              {embedCode}
            </pre>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              This iframe streams directly from <strong>{server.name}</strong> without redirecting to external sites.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5722AF] hover:bg-[#481c91] text-white flex items-center gap-1.5 shadow-md shadow-[#5722AF]/20 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Embed Code'}
          </button>
        </div>
      </div>
    </div>
  );
};
