'use client';

import React from 'react';
import { X, Download, ExternalLink, Play, User, Film } from 'lucide-react';
import { InstagramBulkItem } from '@/lib/instagram/bulkHtmlParser';

interface VideoPreviewModalProps {
  item: InstagramBulkItem | null;
  onClose: () => void;
  onDownloadItem: (item: InstagramBulkItem) => void;
}

export function VideoPreviewModal({ item, onClose, onDownloadItem }: VideoPreviewModalProps) {
  if (!item) return null;

  // Stream URL through proxy to bypass any CORS restrictions in the video player
  const videoSrc = item.downloadUrl
    ? `/api/instagram/download?url=${encodeURIComponent(item.downloadUrl)}&filename=${encodeURIComponent(
        item.filename
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              {item.indexLabel}
            </span>
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[280px]">
              {item.cleanHeadline || item.filename}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black flex items-center justify-center min-h-[300px] max-h-[500px]">
          {videoSrc ? (
            <video
              src={videoSrc}
              controls
              autoPlay
              playsInline
              className="max-h-[500px] w-auto max-w-full rounded-b-none"
            />
          ) : (
            <div className="text-center p-8 text-zinc-400">
              <Film className="w-12 h-12 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm">Video stream not yet resolved.</p>
              <p className="text-xs text-zinc-500 mt-1">Start download or click Download MP4 to resolve stream.</p>
            </div>
          )}
        </div>

        {/* Modal Footer & Details */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3">
            {item.rawTitle || item.headline}
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on Instagram
            </a>

            <button
              type="button"
              onClick={() => onDownloadItem(item)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Download MP4
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
