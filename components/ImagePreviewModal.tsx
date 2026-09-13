'use client';

import React, { useEffect } from 'react';
import { ImageFileItem } from '@/lib/types';
import { formatBytes } from '@/lib/renameEngine';
import { X, ExternalLink, Download, FileImage, ShieldCheck } from 'lucide-react';
import { downloadSingleFile } from '@/lib/zipUtils';

interface ImagePreviewModalProps {
  item: ImageFileItem | null;
  onClose: () => void;
}

export function ImagePreviewModal({ item, onClose }: ImagePreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${item.originalName}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-sm">
              Image Preview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Image Display */}
          <div className="w-full max-h-72 sm:max-h-80 bg-zinc-100 dark:bg-[#0c0e14] rounded-xl overflow-hidden flex items-center justify-center border border-zinc-200/80 dark:border-zinc-800 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.originalName}
              className="max-h-64 sm:max-h-72 max-w-full object-contain rounded-lg"
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-zinc-50 dark:bg-[#1a202e] p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
            <div>
              <div className="text-zinc-400 font-medium">Dimensions</div>
              <div className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5">
                {item.dimensions?.width && item.dimensions?.height
                  ? `${item.dimensions.width} × ${item.dimensions.height} px`
                  : 'Detecting...'}
              </div>
            </div>
            <div>
              <div className="text-zinc-400 font-medium">File Size</div>
              <div className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5">
                {formatBytes(item.size)}
              </div>
            </div>
            <div>
              <div className="text-zinc-400 font-medium">File Type</div>
              <div className="text-zinc-800 dark:text-zinc-200 font-semibold mt-0.5 uppercase">
                {item.extension || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="text-zinc-400 font-medium">Status</div>
              <div className="mt-0.5">
                {item.status === 'duplicate' ? (
                  <span className="text-rose-600 font-semibold">Duplicate</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ready</span>
                )}
              </div>
            </div>
          </div>

          {/* Filename Transformation Comparison */}
          <div className="space-y-2 text-xs border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-xl bg-white dark:bg-[#131722]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-zinc-400 font-medium">Original Filename:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300 truncate font-medium">
                {item.originalName}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-400 font-medium">New Target Name:</span>
              <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8] font-bold truncate">
                {item.newName}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-[#181d2a] border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => downloadSingleFile(item)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5722AF] dark:text-[#9B6BE8] hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download this file individually</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 bg-zinc-100 dark:bg-zinc-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
