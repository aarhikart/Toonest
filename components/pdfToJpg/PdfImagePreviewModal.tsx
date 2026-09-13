'use client';

import React, { useState } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HardDrive,
  Tag,
  Eye,
} from 'lucide-react';
import { ConvertedJpgItem } from '@/lib/pdfToJpgTypes';
import { formatFileSize, downloadBlob } from '@/lib/pdfToJpgEngine';

interface PdfImagePreviewModalProps {
  item: ConvertedJpgItem | null;
  onClose: () => void;
}

export function PdfImagePreviewModal({ item, onClose }: PdfImagePreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!item) return null;

  const handleDownload = () => {
    downloadBlob(item.blob, item.filename);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.5, prev - 0.25));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Converted JPG Preview"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white font-mono truncate">
              {item.filename}
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              {item.width} × {item.height} px • {formatFileSize(item.size)} • Quality {item.quality}%
            </p>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs font-mono rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Canvas Container */}
        <div className="flex-1 p-4 bg-zinc-100 dark:bg-zinc-950/60 overflow-auto flex items-center justify-center min-h-[250px] max-h-[550px]">
          <div
            className="transition-transform duration-150 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={item.url}
              alt={item.filename}
              className="max-h-[500px] w-auto object-contain rounded-lg shadow-md border border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
          <span className="text-xs text-zinc-400">
            Source PDF: <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{item.pdfName}</strong> (Page {item.pageNumber})
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#5722AF] hover:bg-[#491c94] text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JPG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
