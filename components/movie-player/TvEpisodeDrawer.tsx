'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  Clock,
  Search,
  Tv,
  Check,
  Sparkles,
} from 'lucide-react';
import { MovieItem, TvEpisode, TvSeason, generateDefaultEpisodes } from '@/lib/movie/movieTypes';

interface TvEpisodeDrawerProps {
  movie: MovieItem;
  currentSeason: number;
  currentEpisode: number;
  onSelectSeason: (season: number) => void;
  onSelectEpisode: (episode: number) => void;
  className?: string;
}

export const TvEpisodeDrawer: React.FC<TvEpisodeDrawerProps> = ({
  movie,
  currentSeason,
  currentEpisode,
  onSelectSeason,
  onSelectEpisode,
  className = '',
}) => {
  const [isSeasonMenuOpen, setIsSeasonMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine available seasons
  const totalSeasons = movie.totalSeasons || movie.seasons?.length || 1;
  const availableSeasonNumbers = useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= Math.max(totalSeasons, 1); i++) {
      list.push(i);
    }
    return list;
  }, [totalSeasons]);

  // Find active season or generate default episodes
  const activeSeasonData = useMemo(() => {
    if (movie.seasons && movie.seasons.length > 0) {
      const found = movie.seasons.find((s) => s.seasonNumber === currentSeason);
      if (found) return found;
    }
    // Fallback generated episodes
    const fallbackCount = currentSeason === 1 && movie.totalEpisodes ? Math.min(movie.totalEpisodes, 50) : 12;
    return {
      seasonNumber: currentSeason,
      name: `Season ${currentSeason}`,
      episodeCount: fallbackCount,
      episodes: generateDefaultEpisodes(currentSeason, fallbackCount, movie.title, movie.poster),
    };
  }, [movie, currentSeason]);

  // Filter episodes by search
  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return activeSeasonData.episodes;
    const q = searchQuery.toLowerCase().trim();
    return activeSeasonData.episodes.filter(
      (ep) =>
        ep.title.toLowerCase().includes(q) ||
        ep.episodeNumber.toString() === q ||
        `e${ep.episodeNumber}`.includes(q)
    );
  }, [activeSeasonData.episodes, searchQuery]);

  const handlePrevSeason = () => {
    if (currentSeason > 1) {
      onSelectSeason(currentSeason - 1);
      onSelectEpisode(1);
    }
  };

  const handleNextSeason = () => {
    if (currentSeason < totalSeasons) {
      onSelectSeason(currentSeason + 1);
      onSelectEpisode(1);
    }
  };

  return (
    <div
      className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 rounded-2xl md:rounded-3xl border border-zinc-800 bg-zinc-950/95 overflow-hidden flex flex-col shadow-2xl shadow-black/70 select-none ${className}`}
    >
      {/* Top Header Card */}
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/90">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5722AF]/30 to-cyan-500/20 border border-[#5722AF]/40 flex items-center justify-center text-[#9B6BE8] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                  EPISODES
                </span>
                <span className="px-1.5 py-0.5 rounded-md font-mono font-bold bg-[#5722AF]/30 text-[#9B6BE8] border border-[#5722AF]/40 text-[10px]">
                  S{currentSeason} E{currentEpisode}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {activeSeasonData.episodes.length} Episodes • {movie.year}
              </p>
            </div>
          </div>

          {/* Previous / Next Season Navigation */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={currentSeason <= 1}
              onClick={handlePrevSeason}
              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
              title="Previous Season"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentSeason >= totalSeasons}
              onClick={handleNextSeason}
              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 flex items-center justify-center text-zinc-300 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
              title="Next Season"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Season Selector Button & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSeasonMenuOpen(!isSeasonMenuOpen)}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 hover:border-[#5722AF]/60 hover:bg-zinc-900 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={movie.poster}
                alt=""
                className="w-7 h-10 rounded-md object-cover shrink-0 border border-zinc-700/60 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/28x40/111624/ffffff?text=S';
                }}
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white group-hover:text-[#9B6BE8] transition-colors truncate">
                  Season {currentSeason}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {activeSeasonData.episodes.length} Episodes available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-zinc-400 group-hover:text-[#9B6BE8] transition-colors">
              <span className="text-[11px] font-medium hidden sm:inline text-zinc-500">
                Change
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isSeasonMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Season Menu Dropdown */}
          {isSeasonMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 p-2 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-1 duration-150 max-h-56 overflow-y-auto">
              {availableSeasonNumbers.map((sNum) => {
                const isSelected = sNum === currentSeason;
                return (
                  <button
                    key={sNum}
                    type="button"
                    onClick={() => {
                      onSelectSeason(sNum);
                      onSelectEpisode(1);
                      setIsSeasonMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#5722AF] text-white shadow-xs'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>Season {sNum}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-white/20 rounded-sm">
                          Active
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Episode Search Bar */}
        <div className="relative mt-2.5">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search episode by number (e.g. 12)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#5722AF] focus:ring-1 focus:ring-[#5722AF]"
          />
        </div>
      </div>

      {/* Scrollable Episode List */}
      <div className="p-3 max-h-[520px] xl:max-h-[600px] overflow-y-auto space-y-2.5 divide-y-0">
        {filteredEpisodes.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500">
            No episodes match &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredEpisodes.map((ep) => {
            const isPlaying = ep.episodeNumber === currentEpisode;

            return (
              <div
                key={ep.episodeNumber}
                onClick={() => onSelectEpisode(ep.episodeNumber)}
                className={`group relative rounded-xl p-2.5 flex gap-3 transition-all duration-200 cursor-pointer border select-none ${
                  isPlaying
                    ? 'bg-gradient-to-r from-[#5722AF]/30 via-purple-600/15 to-transparent border-[#9B6BE8]/60 shadow-lg shadow-[#5722AF]/20'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-[#5722AF]/40 hover:bg-zinc-900/80'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-24 sm:w-28 aspect-video rounded-lg overflow-hidden shrink-0 relative bg-zinc-900 border border-zinc-700/60 shadow-inner">
                  <img
                    src={ep.thumbnail || movie.poster}
                    alt={ep.title}
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      isPlaying ? 'scale-105 brightness-95' : 'group-hover:scale-105'
                    }`}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = movie.poster;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Top Episode Tag */}
                  <div className="absolute top-1.5 left-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold shadow-xs ${
                        isPlaying
                          ? 'bg-[#5722AF] text-white'
                          : 'bg-black/75 text-[#9B6BE8] border border-[#5722AF]/40'
                      }`}
                    >
                      E{ep.episodeNumber}
                    </span>
                  </div>

                  {/* Bottom Duration */}
                  {ep.duration && (
                    <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 px-1 py-0.5 rounded bg-black/80 text-[9px] text-zinc-300 font-mono">
                      <Clock className="w-2.5 h-2.5 text-zinc-400" />
                      <span>{ep.duration}</span>
                    </div>
                  )}

                  {/* Center Play Button */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                      isPlaying
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 bg-black/40'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                        isPlaying
                          ? 'bg-[#5722AF] text-white scale-100 shadow-[#5722AF]/50'
                          : 'bg-white/25 text-white backdrop-blur-xs group-hover:scale-110'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4
                      className={`text-xs font-bold leading-snug line-clamp-1 transition-colors ${
                        isPlaying
                          ? 'text-[#9B6BE8]'
                          : 'text-white group-hover:text-[#9B6BE8]'
                      }`}
                    >
                      {ep.title}
                    </h4>
                    {ep.airDate && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {ep.airDate}
                      </p>
                    )}
                    {ep.overview && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {ep.overview}
                      </p>
                    )}
                  </div>

                  {/* Now Playing Live Badge */}
                  {isPlaying && (
                    <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-[#5722AF]/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-400 tracking-wider">
                        NOW PLAYING
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
