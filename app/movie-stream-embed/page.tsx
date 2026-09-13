'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Film,
  Play,
  Server,
  Search,
  LayoutGrid,
  Table,
  Plus,
  Sparkles,
  ShieldCheck,
  Code2,
  Tv,
  HelpCircle,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { HelpModal } from '@/components/HelpModal';
import { MovieItem, DEFAULT_MOVIES, STREAM_SERVERS, StreamServer } from '@/lib/movie/movieTypes';
import { MovieStreamPlayer } from '@/components/movie-player/MovieStreamPlayer';
import { MovieGrid } from '@/components/movie-player/MovieGrid';
import { MovieTableView } from '@/components/movie-player/MovieTableView';
import { HtmlIngestionModal } from '@/components/movie-player/HtmlIngestionModal';
import { EmbedCodeModal } from '@/components/movie-player/EmbedCodeModal';

export default function MovieStreamEmbedPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState<boolean>(false);
  const [embedModalMovie, setEmbedModalMovie] = useState<MovieItem | null>(null);

  // Movie list state - initialized with user's default movies & TV shows
  const [movies, setMovies] = useState<MovieItem[]>(DEFAULT_MOVIES);
  // Active playing movie - default to first TV show (Paradise Hotel 51025) or movie
  const [activeMovie, setActiveMovie] = useState<MovieItem | null>(DEFAULT_MOVIES[0]);

  // View state: 'grid' | 'table'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'All' | 'MOVIE' | 'TV'>('All');

  const playerRef = useRef<HTMLDivElement>(null);

  // Counts
  const movieCount = useMemo(
    () => movies.filter((m) => m.type === 'FILM' || m.type === 'MOVIE').length,
    [movies]
  );
  const tvCount = useMemo(
    () => movies.filter((m) => m.type === 'TV' || m.type === 'SERIES').length,
    [movies]
  );

  // Extract all unique genres
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return ['All', ...Array.from(set)];
  }, [movies]);

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const isTv = m.type === 'TV' || m.type === 'SERIES';
      const matchesType =
        selectedType === 'All' ||
        (selectedType === 'TV' ? isTv : !isTv);

      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.includes(searchQuery) ||
        m.year.includes(searchQuery);

      const matchesGenre =
        selectedGenre === 'All' || m.genres.includes(selectedGenre);

      return matchesType && matchesSearch && matchesGenre;
    });
  }, [movies, searchQuery, selectedGenre, selectedType]);

  const handleSelectMovie = (movie: MovieItem) => {
    setActiveMovie(movie);
    // Smooth scroll to player if not fully in view
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleImportMovies = (newMovies: MovieItem[]) => {
    setMovies(newMovies);
    if (newMovies.length > 0) {
      setActiveMovie(newMovies[0]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Movie Stream & Embed Hub"
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="movie-stream-embed"
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-400 dark:text-zinc-500">Social &amp; Video Tools</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-zinc-900 dark:text-white">Movie &amp; TV Stream Embed Hub</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-[#111624] dark:via-[#161a29] dark:to-[#0f1320] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#5722AF]/10 dark:bg-[#5722AF]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] border border-[#5722AF]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Redirects • Movies &amp; Multi-Season TV Shows Supported</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                Movie &amp; TV Series Stream Embed Hub
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Stream movies and TV series directly on your webpage with interactive season &amp; episode selectors.
                Select server fallbacks (Vidsu, Vidme, VidLink, AutoEmbed), block popup ads via Ad-Shield Sandbox, or switch to Native ToolNest Player.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsHtmlModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#5722AF]/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Import HTML Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Cinema Video Player */}
        <section ref={playerRef} aria-label="In-Page Video Player" className="scroll-mt-6">
          {activeMovie && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <Play className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] fill-current" />
                  <span>Now Streaming: {activeMovie.title}</span>
                  {(activeMovie.type === 'TV' || activeMovie.type === 'SERIES') && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/30">
                      TV SERIES
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-zinc-400">
                  Use the episode drawer on the right to switch seasons &amp; episodes
                </span>
              </div>

              <MovieStreamPlayer
                movie={activeMovie}
                onClose={() => setActiveMovie(null)}
              />
            </div>
          )}
        </section>

        {/* Search, Filter, and View Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-white dark:bg-[#111624] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          {/* Media Type Tabs: All | Movies | TV Series */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900/90 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedType('All')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedType === 'All'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All ({movies.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('MOVIE')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedType === 'MOVIE'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies ({movieCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('TV')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedType === 'TV'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Series ({tvCount})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, year, or TMDB ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Genre Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#5722AF] cursor-pointer"
              >
                {availableGenres.map((g) => (
                  <option key={g} value={g}>
                    {g === 'All' ? 'All Genres' : g}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Grid Poster View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table View (HTML Format)"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'
                }`}
              >
                <Table className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Movie & TV Catalog */}
        <section aria-label="Media Catalog">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {selectedType === 'TV'
                ? 'TV Series Catalog'
                : selectedType === 'MOVIE'
                ? 'Movie Catalog'
                : 'All Media'}{' '}
              ({filteredMovies.length})
            </h3>
            <span className="text-xs text-zinc-400">
              Click &quot;Watch In-Page&quot; to play directly with zero redirects
            </span>
          </div>

          {viewMode === 'grid' ? (
            <MovieGrid
              movies={filteredMovies}
              selectedMovie={activeMovie}
              onSelectMovie={handleSelectMovie}
              onOpenEmbed={(m) => setEmbedModalMovie(m)}
            />
          ) : (
            <MovieTableView
              movies={filteredMovies}
              selectedMovie={activeMovie}
              onSelectMovie={handleSelectMovie}
              onOpenEmbed={(m) => setEmbedModalMovie(m)}
            />
          )}
        </section>

        {/* Technical FAQ & Explanations */}
        <section aria-label="Technical Guide" className="rounded-3xl p-6 md:p-8 bg-white dark:bg-[#111624] border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                How Movie &amp; TV Episode Streaming Works
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Understanding Blob URLs, TMDB TV Series resolvers, and multi-season architecture
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Why Blob URLs Can&apos;t Be Linked Directly
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                When you inspect Nightflix and see <code className="font-mono text-[11px] text-[#5722AF] dark:text-[#9B6BE8]">src=&quot;blob:https://vidcore.io/...&quot;</code>, that URL is an in-memory pointer generated within the player&apos;s origin. It expires immediately outside that session.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                How TV Series Seasons &amp; Episodes Work
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                TV series like Paradise Hotel use TMDB ID <code className="font-mono text-[11px]">51025</code> with Season and Episode parameters (e.g., <code className="font-mono text-[11px]">/tv/51025/1/1</code>). Our drawer dynamically selects any episode without refreshing the page.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Multi-Server Fallback Protection
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                If a server is under high load or buffering in your region, click between <strong>Vidsu</strong>, <strong>Vidme</strong>, <strong>VidLink</strong>, or <strong>AutoEmbed</strong> to switch servers instantly without losing your episode position.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 space-y-2">
              <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                How Ad-Shield &amp; Native Player Stop Ads
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Third-party embeds attempt popup redirects via <code className="font-mono text-[11px]">window.open</code>. Our <strong>Ad-Shield Sandbox</strong> physically drops all popup attempts. Switch to <strong>Native ToolNest Player</strong> for our 100% clean video player with zero ads.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* HTML Import Modal */}
      <HtmlIngestionModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        onImport={handleImportMovies}
      />

      {/* Embed Code Modal */}
      {embedModalMovie && (
        <EmbedCodeModal
          isOpen={Boolean(embedModalMovie)}
          onClose={() => setEmbedModalMovie(null)}
          movie={embedModalMovie}
          server={STREAM_SERVERS[0]}
        />
      )}

      <Footer />
    </div>
  );
}
