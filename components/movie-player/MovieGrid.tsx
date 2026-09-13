'use client';

import React from 'react';
import { Play, Star, Film, Code2, ExternalLink } from 'lucide-react';
import { MovieItem } from '@/lib/movie/movieTypes';

interface MovieGridProps {
  movies: MovieItem[];
  selectedMovie: MovieItem | null;
  onSelectMovie: (movie: MovieItem) => void;
  onOpenEmbed: (movie: MovieItem) => void;
}

export const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  selectedMovie,
  onSelectMovie,
  onOpenEmbed,
}) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <Film className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-60" />
        <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No movies found</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Try adjusting your search query or import a movie table.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {movies.map((movie) => {
        const isPlaying = selectedMovie?.id === movie.id;

        return (
          <div
            key={movie.id}
            className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#121622] border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 ${
              isPlaying
                ? 'border-[#5722AF] ring-2 ring-[#5722AF]/40 shadow-lg shadow-[#5722AF]/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {/* Poster container */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/300x450/0d1117/1a2332?text=No+Poster';
                }}
              />

              {/* Hover overlay with quick play */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                <button
                  type="button"
                  onClick={() => onSelectMovie(movie)}
                  className="w-full py-2 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#5722AF]/30 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlaying ? 'Now Playing' : 'Watch In-Page'}</span>
                </button>

                <div className="flex gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEmbed(movie);
                    }}
                    title="Get Embed Code"
                    className="flex-1 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-[11px] font-semibold flex items-center justify-center gap-1 backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Embed</span>
                  </button>

                  {movie.detailUrl && (
                    <a
                      href={movie.detailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="External Nightflix Page"
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Badges on top */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white shadow-xs ${
                    movie.type === 'TV' || movie.type === 'SERIES'
                      ? 'bg-cyan-600'
                      : 'bg-[#5722AF]'
                  }`}
                >
                  {movie.type === 'TV' || movie.type === 'SERIES' ? 'TV' : movie.type}
                </span>
                {movie.totalEpisodes && (
                  <span className="text-[9px] font-bold px-1 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-cyan-200 border border-white/10">
                    {movie.totalEpisodes} Eps
                  </span>
                )}
              </div>

              <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs border border-white/10 text-amber-400 text-[10px] font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                <span>{movie.rating}</span>
              </div>
            </div>

            {/* Movie Info */}
            <div className="p-3 flex flex-col flex-1 justify-between">
              <div>
                <h4
                  onClick={() => onSelectMovie(movie)}
                  className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate cursor-pointer hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
                  title={movie.title}
                >
                  {movie.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  <span>{movie.year}</span>
                  <span>•</span>
                  <span className="truncate">{movie.genres[0] || 'Film'}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
