'use client';

import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { JpgImageItem } from '@/lib/jpgToPdfTypes';
import { formatFileSize, downloadFileBlob } from '@/lib/jpgToPdfEngine';

interface JpgImagePreviewModalProps {
  item: JpgImageItem | null;
  pageNumber: number;
  onClose: () => void;
  onRotate?: (id: string) => void;
}

export function JpgImagePreviewModal({
  item,
  pageNumber,
  onClose,
  onRotate,
}: JpgImagePreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!item) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleDownloadOriginal = () => {
    downloadFileBlob(item.file, item.name);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#5722AF] text-white">
                Page {pageNumber}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white truncate">
                {item.name}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {item.rotation === 90 || item.rotation === 270
                ? `${item.height} × ${item.width}`
                : `${item.width} × ${item.height}`}{' '}
              px • {formatFileSize(item.size)} • JPG
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Zoom controls */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-xs font-mono font-semibold px-2 py-1 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Reset zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Rotate */}
            {onRotate && (
              <button
                type="button"
                onClick={() => onRotate(item.id)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}

            {/* Download Original */}
            <button
              type="button"
              onClick={handleDownloadOriginal}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Download original JPG"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950/80 min-h-[350px]">
          <div
            className="transition-transform duration-200 ease-out origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={item.previewUrl}
              alt={item.name}
              className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-lg transition-transform duration-300"
              style={{ transform: `rotate(${item.rotation}deg)` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
