'use client';

import React from 'react';
import { Play, Star, Code2, ExternalLink, Film } from 'lucide-react';
import { MovieItem } from '@/lib/movie/movieTypes';

interface MovieTableViewProps {
  movies: MovieItem[];
  selectedMovie: MovieItem | null;
  onSelectMovie: (movie: MovieItem) => void;
  onOpenEmbed: (movie: MovieItem) => void;
}

export const MovieTableView: React.FC<MovieTableViewProps> = ({
  movies,
  selectedMovie,
  onSelectMovie,
  onOpenEmbed,
}) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 text-xs">
        No movie rows available.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111624] shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold text-[11px]">
            <th className="py-3.5 px-4 w-16">Poster</th>
            <th className="py-3.5 px-4">Title</th>
            <th className="py-3.5 px-4">Year</th>
            <th className="py-3.5 px-4">Type</th>
            <th className="py-3.5 px-4">Rating</th>
            <th className="py-3.5 px-4">Genres</th>
            <th className="py-3.5 px-4 text-center">In-Page Stream</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {movies.map((movie) => {
            const isPlaying = selectedMovie?.id === movie.id;

            return (
              <tr
                key={movie.id}
                className={`transition-colors ${
                  isPlaying
                    ? 'bg-[#5722AF]/10 dark:bg-[#5722AF]/20'
                    : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
                }`}
              >
                {/* Poster */}
                <td className="py-2.5 px-4">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    width={48}
                    height={72}
                    className="w-12 h-16 object-cover rounded-md shadow-xs border border-zinc-200 dark:border-zinc-700/60 shrink-0"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/48x72/0d1117/1a2332?text=NA';
                    }}
                  />
                </td>

                {/* Title */}
                <td className="py-2.5 px-4">
                  <div className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm">
                    {movie.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    ID: {movie.id}
                  </div>
                </td>

                {/* Year */}
                <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-300 font-medium">
                  {movie.year}
                </td>

                {/* Type */}
                <td className="py-2.5 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                      movie.type === 'TV' || movie.type === 'SERIES'
                        ? 'bg-cyan-600'
                        : 'bg-[#5722AF]'
                    }`}
                  >
                    {movie.type}
                  </span>
                </td>

                {/* Rating */}
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-1 font-bold text-amber-500 dark:text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{movie.rating}</span>
                  </span>
                </td>

                {/* Genres */}
                <td className="py-2.5 px-4 text-zinc-600 dark:text-zinc-400">
                  {movie.genres.join(', ')}
                </td>

                {/* In-Page Stream Button */}
                <td className="py-2.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSelectMovie(movie)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                      isPlaying
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#5722AF] hover:bg-[#481c91] text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isPlaying ? 'Playing Now' : 'Watch In-Page'}</span>
                  </button>
                </td>

                {/* Actions (Embed & External) */}
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEmbed(movie)}
                      title="Get Embed Code"
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] hover:border-[#5722AF]/40 transition-colors cursor-pointer"
                    >
                      <Code2 className="w-4 h-4" />
                    </button>

                    {movie.detailUrl && (
                      <a
                        href={movie.detailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Details on Nightflix"
                        className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-cyan-500 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
