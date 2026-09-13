'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Monitor,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  Tag,
  Code2,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ExtractedWebData, ExtractionResponse } from '@/lib/web-extractor/types';
import { InPageBrowserFrame } from './InPageBrowserFrame';
import { ExtractedTextTab } from './ExtractedTextTab';
import { ExtractedMediaTab } from './ExtractedMediaTab';
import { ExtractedLinksTab } from './ExtractedLinksTab';
import { ExtractedTablesTab } from './ExtractedTablesTab';
import { ExtractedSeoTab } from './ExtractedSeoTab';
import { ExtractedSourceTab } from './ExtractedSourceTab';

const PRESET_SITES = [
  { name: 'Hacker News', url: 'https://news.ycombinator.com' },
  { name: 'Wikipedia AI', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
  { name: 'Nightflix Movie', url: 'https://nightflix.vg/movie/969681' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Example Domain', url: 'https://example.com' },
];

export const WebExtractorView: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>('https://news.ycombinator.com');
  const [activeTab, setActiveTab] = useState<
    'browser' | 'text' | 'media' | 'links' | 'tables' | 'seo' | 'source'
  >('browser');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractedWebData | null>(null);

  const handleExtract = async (targetUrlToExtract?: string) => {
    const urlToUse = (targetUrlToExtract || inputUrl).trim();
    if (!urlToUse) return;

    setIsExtracting(true);
    setError(null);

    try {
      const res = await fetch('/api/web-extractor/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToUse }),
      });

      const json: ExtractionResponse = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setInputUrl(json.data.targetUrl);
      } else {
        setError(json.error || 'Failed to extract website data.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error occurred while fetching website.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Initial load with default preset on component mount
  useEffect(() => {
    handleExtract('https://news.ycombinator.com');
  }, []);

  return (
    <div className="space-y-8">
      {/* Top URL Ingestion Card */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#5722AF]/10 dark:bg-[#5722AF]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] border border-[#5722AF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Any Website In-Page • Extract All Data</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Paste Any Website URL To Open In Your Page
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Render websites live inside your page bypassing iframe/X-Frame-Options blocks, and extract text, images, links, tables, and SEO meta tags with one click.
          </p>

          {/* URL Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExtract();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl mx-auto pt-2"
          >
            <div className="relative flex-1">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste website URL (e.g. https://example.com)..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
              />
            </div>

            <button
              type="submit"
              disabled={isExtracting || !inputUrl.trim()}
              className="px-6 py-3 rounded-2xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#5722AF]/25 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading Site...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Extract &amp; Open</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
            <span className="text-xs text-zinc-400 mr-1">Quick Presets:</span>
            {PRESET_SITES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setInputUrl(preset.url);
                  handleExtract(preset.url);
                }}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Section */}
      {data && (
        <div className="space-y-6">
          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('browser')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'browser'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span>In-Page Live View</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'text'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Extracted Text ({data.textContent.wordCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'media'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Media Gallery ({data.images.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'links'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Links ({data.links.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tables')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tables'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Tables ({data.tables.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'seo'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>SEO &amp; Meta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('source')}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'source'
                  ? 'bg-[#5722AF] text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>HTML Source</span>
            </button>
          </div>

          {/* Active Tab Body */}
          <div>
            {activeTab === 'browser' && (
              <InPageBrowserFrame data={data} onRefresh={() => handleExtract(data.targetUrl)} />
            )}
            {activeTab === 'text' && <ExtractedTextTab data={data} />}
            {activeTab === 'media' && <ExtractedMediaTab data={data} />}
            {activeTab === 'links' && <ExtractedLinksTab data={data} />}
            {activeTab === 'tables' && <ExtractedTablesTab data={data} />}
            {activeTab === 'seo' && <ExtractedSeoTab data={data} />}
            {activeTab === 'source' && <ExtractedSourceTab data={data} />}
          </div>
        </div>
      )}
    </div>
  );
};
