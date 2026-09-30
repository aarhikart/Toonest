'use client';

import React, { useState, useMemo } from 'react';
import { ExtractedVideo } from '@/lib/batch-video/htmlParser';
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Video,
  Play,
  X,
  FileVideo,
  Download,
} from 'lucide-react';

interface VideoListTableProps {
  videos: ExtractedVideo[];
  batchSize: number;
  activeBatchIndex: number;
}

export function VideoListTable({
  videos,
  batchSize,
  activeBatchIndex,
}: VideoListTableProps) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'batch' | 'all'>('batch');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [previewVideo, setPreviewVideo] = useState<ExtractedVideo | null>(null);

  // Compute batch ranges
  const activeBatchStart = (activeBatchIndex - 1) * batchSize;
  const activeBatchEnd = activeBatchStart + batchSize;

  const filteredVideos = useMemo(() => {
    let list = videos;
    if (filterMode === 'batch') {
      list = videos.slice(activeBatchStart, activeBatchEnd);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.filename.toLowerCase().includes(q) ||
          (v.title && v.title.toLowerCase().includes(q)) ||
          v.url.toLowerCase().includes(q)
      );
    }
    return list;
  }, [videos, filterMode, activeBatchStart, activeBatchEnd, search]);

  const copyUrl = (id: number, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search & Scope Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filenames or video URLs..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="inline-flex rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setFilterMode('batch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'batch'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Current Batch #{activeBatchIndex}
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              All Videos ({videos.length})
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Filename</th>
                <th className="py-3 px-4">Video Source URL</th>
                <th className="py-3 px-4 w-24 text-center">Batch</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredVideos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No videos found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVideos.map((item) => {
                  const itemBatchNumber = Math.floor((item.originalIndex - 1) / batchSize) + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="py-2.5 px-4 font-mono text-zinc-400 text-center">
                        {item.originalIndex}
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-start gap-2">
                          <FileVideo className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8] shrink-0 mt-0.5" />
                          <div className="flex flex-col min-w-0 max-w-[220px] sm:max-w-xs">
                            <span
                              className="font-medium text-zinc-900 dark:text-zinc-100 truncate"
                              title={item.filename}
                            >
                              {item.filename}
                            </span>
                            {item.originalFilename && item.originalFilename !== item.filename && (
                              <span
                                className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate"
                                title={`Original Pin File: ${item.originalFilename}`}
                              >
                                Pin: {item.originalFilename}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-zinc-500 dark:text-zinc-400 truncate max-w-[180px] sm:max-w-sm"
                            title={item.url}
                          >
                            {item.url}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyUrl(item.id, item.url)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                            title="Copy Direct URL"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          #{itemBatchNumber}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewVideo(item)}
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-[#5722AF] hover:text-white text-zinc-600 dark:text-zinc-300 transition-colors"
                            title="Preview Video Player"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                            title="Open URL in New Tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>
            Showing {filteredVideos.length} of {videos.length} videos
          </span>
          <span>
            {filterMode === 'batch'
              ? `Filtered to Batch #${activeBatchIndex}`
              : 'Viewing Complete Library'}
          </span>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 truncate pr-2">
                <Video className="w-4 h-4 text-[#5722AF] shrink-0" />
                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {previewVideo.title || previewVideo.filename}
                </span>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                className="max-h-[60vh] w-auto rounded-lg"
              >
                Your browser does not support HTML5 video preview.
              </video>
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[280px]">
                {previewVideo.url}
              </span>
              <a
                href={`/api/download-batch/proxy?url=${encodeURIComponent(previewVideo.url)}&filename=${encodeURIComponent(previewVideo.filename)}`}
                download={previewVideo.filename}
                className="px-3 py-1.5 rounded-lg bg-[#5722AF] text-white hover:bg-[#682BC9] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Video</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
