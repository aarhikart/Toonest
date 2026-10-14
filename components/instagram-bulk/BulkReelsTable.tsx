'use client';

import React, { useState, useMemo } from 'react';
import {
  Play,
  Download,
  ExternalLink,
  Edit2,
  Check,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Film,
  User,
  HardDrive,
} from 'lucide-react';
import { InstagramBulkItem } from '@/lib/instagram/bulkHtmlParser';

interface BulkReelsTableProps {
  items: InstagramBulkItem[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onUpdateFilename: (id: string, newFilename: string) => void;
  onPreviewItem: (item: InstagramBulkItem) => void;
  onDownloadSingle: (item: InstagramBulkItem) => void;
  isDownloading: boolean;
}

export function BulkReelsTable({
  items,
  onToggleSelect,
  onSelectAll,
  onUpdateFilename,
  onPreviewItem,
  onDownloadSingle,
  isDownloading,
}: BulkReelsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.filename.toLowerCase().includes(q) ||
        item.headline.toLowerCase().includes(q) ||
        item.rawTitle.toLowerCase().includes(q) ||
        item.creator?.toLowerCase().includes(q) ||
        item.indexLabel.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const someSelected = items.some((i) => i.selected);

  const startEditFilename = (item: InstagramBulkItem) => {
    setEditingId(item.id);
    setEditingValue(item.filename);
  };

  const saveEditFilename = (id: string) => {
    if (editingValue.trim()) {
      let finalName = editingValue.trim();
      if (!finalName.toLowerCase().endsWith('.mp4')) {
        finalName += '.mp4';
      }
      onUpdateFilename(id, finalName);
    }
    setEditingId(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
      {/* Search & Bulk Selection Toolbar */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectAll(!allSelected)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-sky-500" />
            ) : someSelected ? (
              <Square className="w-4 h-4 text-sky-500 fill-sky-500/30" />
            ) : (
              <Square className="w-4 h-4 text-zinc-400" />
            )}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing {filteredItems.length} of {items.length} items
          </span>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search captions or #index..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-sky-600 focus:ring-sky-500"
                />
              </th>
              <th className="py-3 px-3 w-16">Index</th>
              <th className="py-3 px-3">Caption / Headline</th>
              <th className="py-3 px-3 min-w-[220px]">Target MP4 Filename</th>
              <th className="py-3 px-3 w-32">Status</th>
              <th className="py-3 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                  item.selected ? 'bg-sky-50/20 dark:bg-sky-950/10' : ''
                }`}
              >
                {/* Select Checkbox */}
                <td className="py-3 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => onToggleSelect(item.id)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-sky-600 focus:ring-sky-500"
                  />
                </td>

                {/* Index Badge */}
                <td className="py-3 px-3">
                  <span className="font-bold font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {item.indexLabel}
                  </span>
                </td>

                {/* Caption / Headline */}
                <td className="py-3 px-3 max-w-xs">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {item.headline || item.cleanHeadline || 'No Caption'}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                    {item.creator ? (
                      <span className="text-sky-600 dark:text-sky-400">@{item.creator}</span>
                    ) : null}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500"
                    >
                      <span>reel/{item.shortcode}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </td>

                {/* Editable Filename */}
                <td className="py-3 px-3">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditFilename(item.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        className="px-2 py-1 rounded-md text-xs font-mono bg-white dark:bg-zinc-950 border border-sky-500 text-zinc-900 dark:text-zinc-100 w-full focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => saveEditFilename(item.id)}
                        className="p-1 rounded bg-sky-600 text-white hover:bg-sky-500"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditFilename(item)}
                      className="group flex items-center gap-1.5 cursor-pointer font-mono text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400"
                      title="Click to customize filename"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-zinc-400 group-hover:text-sky-500 flex-shrink-0" />
                      <span className="truncate">{item.filename}</span>
                      <Edit2 className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  )}
                </td>

                {/* Status Badge */}
                <td className="py-3 px-3">
                  {item.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                      <CheckCircle2 className="w-3 h-3" />
                      Downloaded {formatFileSize(item.sizeBytes)}
                    </span>
                  )}
                  {item.status === 'downloading' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/80">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Downloading...
                    </span>
                  )}
                  {item.status === 'resolving' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Resolving...
                    </span>
                  )}
                  {item.status === 'ready' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/80">
                      <Film className="w-3 h-3" />
                      Stream Ready
                    </span>
                  )}
                  {item.status === 'failed' && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/80"
                      title={item.error || 'Failed to download'}
                    >
                      <AlertCircle className="w-3 h-3" />
                      Failed
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      <Clock className="w-3 h-3" />
                      Queued
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Preview video */}
                    <button
                      type="button"
                      onClick={() => onPreviewItem(item)}
                      title="Preview Reel"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    {/* Download individual MP4 */}
                    <button
                      type="button"
                      onClick={() => onDownloadSingle(item)}
                      disabled={isDownloading}
                      title="Download MP4"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
