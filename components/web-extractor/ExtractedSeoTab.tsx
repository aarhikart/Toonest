'use client';

import React from 'react';
import {
  Search,
  Share2,
  Globe,
  Tag,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { ExtractedWebData } from '@/lib/web-extractor/types';

interface ExtractedSeoTabProps {
  data: ExtractedWebData;
}

export const ExtractedSeoTab: React.FC<ExtractedSeoTabProps> = ({ data }) => {
  const { metadata } = data;

  return (
    <div className="space-y-6">
      {/* SERP & Social Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google SERP Preview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <Search className="w-3.5 h-3.5 text-blue-500" />
            <span>Google Search Preview</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 font-sans">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              {metadata.favicon && (
                <img src={metadata.favicon} alt="" className="w-4 h-4 rounded-full" />
              )}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{data.domain}</span>
              <span className="text-zinc-400">› {new URL(data.targetUrl).pathname}</span>
            </div>
            <h4 className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
              {metadata.title || data.domain}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
              {metadata.description || 'No meta description found for this webpage.'}
            </p>
          </div>
        </div>

        {/* Social Card Preview (OpenGraph) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <Share2 className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Social Card / OpenGraph Preview</span>
          </div>

          <div className="rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            {metadata.ogImage ? (
              <div className="aspect-[1.91/1] w-full bg-zinc-800 overflow-hidden">
                <img
                  src={metadata.ogImage}
                  alt="OG Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[2/1] w-full bg-gradient-to-br from-[#5722AF]/20 to-cyan-500/20 flex items-center justify-center text-zinc-500 text-xs">
                No og:image specified
              </div>
            )}
            <div className="p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400">
                {data.domain}
              </span>
              <h5 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                {metadata.ogTitle || metadata.title || data.domain}
              </h5>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {metadata.ogDescription || metadata.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Tag Key-Value Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>SEO &amp; Meta Header Tags</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[11px]">
                <th className="py-2.5 px-3 font-bold uppercase w-48">Tag / Property</th>
                <th className="py-2.5 px-3 font-bold uppercase">Extracted Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">title</td>
                <td className="py-2 px-3 font-bold text-zinc-900 dark:text-white">{metadata.title || '—'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">meta[description]</td>
                <td className="py-2 px-3">{metadata.description || '—'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">canonical</td>
                <td className="py-2 px-3 font-mono text-blue-500 truncate">{metadata.canonical || '—'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">og:image</td>
                <td className="py-2 px-3 font-mono text-cyan-500 truncate">{metadata.ogImage || '—'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">keywords</td>
                <td className="py-2 px-3">{metadata.keywords.join(', ') || '—'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">author</td>
                <td className="py-2 px-3">{metadata.author || '—'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">twitter:card</td>
                <td className="py-2 px-3">{metadata.twitterCard || '—'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">theme-color</td>
                <td className="py-2 px-3">{metadata.themeColor || '—'}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono text-zinc-500">charset</td>
                <td className="py-2 px-3">{metadata.charset || '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
