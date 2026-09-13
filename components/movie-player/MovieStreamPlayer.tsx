'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Server,
  Maximize2,
  Minimize2,
  Code2,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Star,
  Film,
  Calendar,
  Layers,
  X,
  RefreshCw,
  ExternalLink,
  Tv,
  CheckCircle2,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MovieItem, StreamServer, STREAM_SERVERS } from '@/lib/movie/movieTypes';
import { EmbedCodeModal } from './EmbedCodeModal';
import { NativeVideoPlayer } from './NativeVideoPlayer';
import { TvEpisodeDrawer } from './TvEpisodeDrawer';

interface MovieStreamPlayerProps {
  movie: MovieItem | null;
  onClose?: () => void;
}

export const MovieStreamPlayer: React.FC<MovieStreamPlayerProps> = ({
  movie,
  onClose,
}) => {
  // Dual player mode: 'ad-shield-stream' (sandboxed embed) or 'native-player' (our custom HTML5 player)
  const [playerMode, setPlayerMode] = useState<'ad-shield-stream' | 'native-player'>('ad-shield-stream');
  
  // Stream server state
  const [activeServer, setActiveServer] = useState<StreamServer>(STREAM_SERVERS[0]);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);
  const [playerKey, setPlayerKey] = useState<number>(Date.now());
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  
  // TV Series state: season & episode tracking
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [isEpisodeDrawerOpen, setIsEpisodeDrawerOpen] = useState<boolean>(true);

  // Ad-Shield sandbox state: Blocks window.open and top navigation popups
  const [adShieldEnabled, setAdShieldEnabled] = useState<boolean>(true);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // When movie changes, reset season/episode to 1
  useEffect(() => {
    setCurrentSeason(1);
    setCurrentEpisode(1);
    setIsIframeLoading(true);
    setPlayerKey(Date.now());
  }, [movie?.id]);

  // When season, episode, server or adShield toggles, reload stream
  useEffect(() => {
    setIsIframeLoading(true);
    setPlayerKey(Date.now());
  }, [currentSeason, currentEpisode, activeServer.id, adShieldEnabled]);

  if (!movie) return null;

  const isTv = movie.type === 'TV' || movie.type === 'SERIES';
  const totalSeasons = movie.totalSeasons || movie.seasons?.length || 1;

  const currentStreamUrl = isTv && activeServer.buildTvUrl
    ? activeServer.buildTvUrl(movie.id, currentSeason, currentEpisode)
    : activeServer.buildMovieUrl(movie.id);

  const handleRefreshPlayer = () => {
    setIsIframeLoading(true);
    setPlayerKey(Date.now());
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    } else if (currentSeason > 1) {
      setCurrentSeason(currentSeason - 1);
      setCurrentEpisode(1);
    }
  };

  const handleNextEpisode = () => {
    const currentSeasonData = movie.seasons?.find((s) => s.seasonNumber === currentSeason);
    const maxEpisodes = currentSeasonData?.episodeCount || currentSeasonData?.episodes?.length || 20;
    if (currentEpisode < maxEpisodes) {
      setCurrentEpisode(currentEpisode + 1);
    } else if (currentSeason < totalSeasons) {
      setCurrentSeason(currentSeason + 1);
      setCurrentEpisode(1);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className={`relative w-full transition-all duration-300 ${
        isTheaterMode ? 'max-w-full' : 'max-w-7xl mx-auto'
      }`}
    >
      {/* Glow aura */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#5722AF]/30 via-cyan-500/20 to-purple-600/30 rounded-3xl blur-xl opacity-70 pointer-events-none" />

      {/* Main Container: Flex row on large screens when TV episodes drawer is active */}
      <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
        {/* Main Player Box */}
        <div className="flex-1 min-w-0 w-full bg-zinc-950 border border-zinc-800/90 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
          {/* Top Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-b border-zinc-800">
            {/* Title & Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#5722AF]/20 border border-[#5722AF]/40 flex items-center justify-center text-[#9B6BE8] shrink-0">
                {isTv ? <Tv className="w-4 h-4" /> : <Film className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm md:text-base font-extrabold text-white truncate">
                    {movie.title}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#5722AF] text-white">
                    {movie.year}
                  </span>
                  {isTv && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                      <span>S{currentSeason} : E{currentEpisode}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  TMDB ID: <span className="font-mono text-zinc-300">{movie.id}</span> • {movie.genres.join(', ')}
                </p>
              </div>
            </div>

            {/* Middle: Prev/Next Episode Quick Buttons for TV */}
            {isTv && (
              <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={handlePrevEpisode}
                  disabled={currentSeason === 1 && currentEpisode === 1}
                  className="px-2 py-1 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <span className="px-1.5 text-xs font-mono font-bold text-[#9B6BE8]">
                  E{currentEpisode}
                </span>

                <button
                  type="button"
                  onClick={handleNextEpisode}
                  className="px-2 py-1 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-0.5 text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Next Episode"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsEpisodeDrawerOpen(!isEpisodeDrawerOpen)}
                  className={`ml-1 px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    isEpisodeDrawerOpen
                      ? 'bg-[#5722AF]/30 text-[#9B6BE8] border border-[#5722AF]/40'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Toggle Episodes Drawer"
                >
                  <Layers className="w-3 h-3" />
                  <span>Episodes</span>
                </button>
              </div>
            )}

            {/* Player Mode Switcher Tabs */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setPlayerMode('ad-shield-stream')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  playerMode === 'ad-shield-stream'
                    ? 'bg-[#5722AF] text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ad-Shield Stream</span>
              </button>
              <button
                type="button"
                onClick={() => setPlayerMode('native-player')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  playerMode === 'native-player'
                    ? 'bg-[#5722AF] text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>Native Player</span>
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {playerMode === 'ad-shield-stream' && (
                <button
                  onClick={handleRefreshPlayer}
                  title="Reload Stream"
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode (Wide)'}
                className={`p-2 rounded-xl transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                  isTheaterMode
                    ? 'bg-[#5722AF] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="hidden sm:inline text-xs font-semibold">
                  {isTheaterMode ? 'Compact' : 'Theater'}
                </span>
              </button>

              <button
                onClick={() => setIsEmbedModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700/60 transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-[#9B6BE8]" />
                <span className="hidden sm:inline">Get Embed Code</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Close Player"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Player Body: Ad-Shield Sandboxed Stream OR Native ToolNest Player */}
          {playerMode === 'ad-shield-stream' ? (
            <div>
              {/* Ad-Shield Protection Status Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 text-xs">
                <div className="flex items-center gap-2">
                  {adShieldEnabled ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Ad-Shield Active: Popups, new tabs &amp; redirects blocked</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Ad-Shield Disabled: Unrestricted iframe mode</span>
                    </span>
                  )}
                  {isTv && (
                    <span className="text-[11px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                      Streaming Season {currentSeason}, Episode {currentEpisode}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdShieldEnabled(!adShieldEnabled)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                      adShieldEnabled
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {adShieldEnabled ? '🛡️ Shield: ON' : '⚠️ Shield: OFF'}
                  </button>
                </div>
              </div>

              {/* Sandboxed Video Player Container */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                {isIframeLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-[#5722AF]/30 border-t-[#9B6BE8] animate-spin" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-white tracking-wider">
                        {isTv ? `LOADING S${currentSeason} : E${currentEpisode}` : 'CONNECTING STREAM'}
                      </p>
                      <p className="text-[11px] text-zinc-400">Loading from {activeServer.name}...</p>
                    </div>
                  </div>
                )}

                <iframe
                  key={`${movie.id}-S${currentSeason}-E${currentEpisode}-${activeServer.id}-${adShieldEnabled}-${playerKey}`}
                  src={currentStreamUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  onLoad={() => setIsIframeLoading(false)}
                  title={`${movie.title} ${isTv ? `S${currentSeason}E${currentEpisode}` : ''} Stream`}
                  // HTML5 Sandbox: Strictly omits allow-popups and allow-top-navigation to block all ad popups
                  sandbox={
                    adShieldEnabled
                      ? 'allow-scripts allow-same-origin allow-forms allow-presentation'
                      : undefined
                  }
                />
              </div>

              {/* Server Switcher Bar */}
              <div className="p-3 md:p-4 bg-zinc-900/95 border-t border-zinc-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-[#9B6BE8]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Select Stream Server:
                    </span>
                    <span className="text-[10px] text-zinc-400 hidden sm:inline">
                      (Vidsu, VidLink, Vidme support both Movies &amp; TV)
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In-Page Stream • Zero Redirects to Nightflix</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {STREAM_SERVERS.map((srv) => {
                    const isSelected = srv.id === activeServer.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => setActiveServer(srv)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-[#5722AF] text-white border-[#9B6BE8] shadow-md shadow-[#5722AF]/30'
                            : 'bg-zinc-800/80 text-zinc-300 hover:text-white border-zinc-700/60 hover:bg-zinc-700/60'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: srv.color }}
                        />
                        <span>{srv.name}</span>
                        <span className="text-[9px] opacity-75 font-normal">
                          {srv.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Native HTML5 Video Player Mode (Our Own Custom Player, 100% Ad-Free) */
            <div className="p-3 md:p-4 bg-zinc-950">
              <NativeVideoPlayer movie={movie} onClose={onClose} />
            </div>
          )}
        </div>

        {/* TV Episode Drawer: Side-by-side on desktop, or collapsible on mobile */}
        {isTv && isEpisodeDrawerOpen && (
          <TvEpisodeDrawer
            movie={movie}
            currentSeason={currentSeason}
            currentEpisode={currentEpisode}
            onSelectSeason={(season) => {
              setCurrentSeason(season);
              setCurrentEpisode(1);
            }}
            onSelectEpisode={(episode) => {
              setCurrentEpisode(episode);
            }}
          />
        )}
      </div>

      {/* Embed Code Modal */}
      <EmbedCodeModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        movie={movie}
        server={activeServer}
        season={currentSeason}
        episode={currentEpisode}
      />
    </div>
  );
};
