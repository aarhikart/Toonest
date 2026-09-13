'use client';

import React, { useState, useMemo } from 'react';
import {
  Link as LinkIcon,
  ExternalLink,
  Copy,
  Check,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { ExtractedWebData, ExtractedLink } from '@/lib/web-extractor/types';

interface ExtractedLinksTabProps {
  data: ExtractedWebData;
}

export const ExtractedLinksTab: React.FC<ExtractedLinksTabProps> = ({ data }) => {
  const [filterType, setFilterType] = useState<'all' | 'internal' | 'external'>('all');
  const [search, setSearch] = useState('');
  const [copiedHref, setCopiedHref] = useState<string | null>(null);

  const links = data.links || [];

  const internalCount = useMemo(() => links.filter((l) => !l.isExternal).length, [links]);
  const externalCount = useMemo(() => links.filter((l) => l.isExternal).length, [links]);

  const filteredLinks = useMemo(() => {
    return links.filter((l) => {
      const matchesType =
        filterType === 'all' ||
        (filterType === 'internal' && !l.isExternal) ||
        (filterType === 'external' && l.isExternal);

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.href.toLowerCase().includes(q) ||
        l.text.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [links, filterType, search]);

  const handleCopy = (href: string) => {
    navigator.clipboard.writeText(href);
    setCopiedHref(href);
    setTimeout(() => setCopiedHref(null), 2000);
  };

  const handleExportCsv = () => {
    const csvRows = ['"Anchor Text","URL","Type","Target"'];
    filteredLinks.forEach((l) => {
      const text = l.text.replace(/"/g, '""');
      const href = l.href.replace(/"/g, '""');
      const type = l.isExternal ? 'External' : 'Internal';
      const target = l.target || '';
      csvRows.push(`"${text}","${href}","${type}","${target}"`);
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.domain}-links.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        {/* Type Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700/60">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All ({links.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('internal')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'internal'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Internal ({internalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('external')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterType === 'external'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            External ({externalCount})
          </button>
        </div>

        {/* Search & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links by URL or text..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#5722AF]"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Links Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400">
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Anchor Text</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Destination URL</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Scope</th>
              <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
            {filteredLinks.length > 0 ? (
              filteredLinks.map((link, idx) => {
                const isCopied = copiedHref === link.href;
                return (
                  <tr key={idx} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 max-w-xs font-semibold truncate text-zinc-900 dark:text-white" title={link.text}>
                      {link.text}
                    </td>
                    <td className="py-3 px-4 max-w-md font-mono text-[11px] truncate text-zinc-500 dark:text-zinc-400" title={link.href}>
                      {link.href}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          link.isExternal
                            ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20'
                            : 'bg-purple-500/15 text-[#5722AF] dark:text-[#9B6BE8] border border-purple-500/20'
                        }`}
                      >
                        {link.isExternal ? 'External' : 'Internal'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(link.href)}
                          title="Copy Link"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Link in New Tab"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-10 text-center text-zinc-500">
                  No links found matching your query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
