'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileArchive,
  RefreshCw,
  Eye,
  Sparkles,
  HardDrive,
  Clock,
  Layers,
} from 'lucide-react';
import { ConvertedJpgItem } from '@/lib/pdfToJpgTypes';
import { formatFileSize, downloadBlob, sanitizeFilename } from '@/lib/pdfToJpgEngine';
import { PdfImagePreviewModal } from './PdfImagePreviewModal';

interface PdfConversionResultsViewProps {
  convertedItems: ConvertedJpgItem[];
  totalPdfsProcessed: number;
  elapsedSeconds: number;
  onDownloadAllAsZip: (customZipName: string) => void;
  onReset: () => void;
}

export function PdfConversionResultsView({
  convertedItems,
  totalPdfsProcessed,
  elapsedSeconds,
  onDownloadAllAsZip,
  onReset,
}: PdfConversionResultsViewProps) {
  const [zipNameInput, setZipNameInput] = useState('converted-images.zip');
  const [previewItem, setPreviewItem] = useState<ConvertedJpgItem | null>(null);

  const totalBytes = convertedItems.reduce((acc, item) => acc + item.size, 0);
  const formatLabel =
    convertedItems[0]?.format?.toUpperCase() ||
    (convertedItems[0]?.filename.toLowerCase().endsWith('.png') ? 'PNG' : 'JPG');

  const handleDownloadZipClick = () => {
    let finalName = sanitizeFilename(zipNameInput.trim());
    if (!finalName.toLowerCase().endsWith('.zip')) {
      finalName = `${finalName}.zip`;
    }
    onDownloadAllAsZip(finalName);
  };

  const handleDownloadSingle = (item: ConvertedJpgItem) => {
    downloadBlob(item.blob, item.filename);
  };

  return (
    <div className="space-y-6">
      {/* 1. Success Summary Card (Section 22) */}
      <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
            Conversion Complete
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {totalPdfsProcessed} {totalPdfsProcessed === 1 ? 'PDF' : 'PDFs'} processed •{' '}
            {convertedItems.length} {formatLabel}{' '}
            {convertedItems.length === 1 ? 'image' : 'images'} created in {elapsedSeconds}s
          </p>
        </div>

        {/* Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">PDFs</div>
            <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
              {totalPdfsProcessed}
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">
              {formatLabel} Images
            </div>
            <div className="text-lg font-bold text-[#5722AF] dark:text-[#9B6BE8] font-mono">
              {convertedItems.length}
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">Total Size</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatFileSize(totalBytes)}
            </div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">Time</div>
            <div className="text-lg font-bold text-zinc-700 dark:text-zinc-300 font-mono">
              {elapsedSeconds}s
            </div>
          </div>
        </div>

        {/* ZIP Download Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={zipNameInput}
              onChange={(e) => setZipNameInput(e.target.value)}
              placeholder="converted-images.zip"
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none font-mono text-zinc-900 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadZipClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#5722AF]/25 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download All as ZIP ({formatFileSize(totalBytes)})</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Convert More PDFs</span>
          </button>
        </div>
      </div>

      {/* 2. Converted Image Grid (Section 23) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Generated {formatLabel} Images</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
              {convertedItems.length}
            </span>
          </h3>
          <span className="text-xs text-zinc-400">
            Click any image to preview in full resolution
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {convertedItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-3 shadow-xs hover:border-[#5722AF]/40 transition-all flex flex-col space-y-2.5"
            >
              {/* Image Preview Canvas */}
              <div
                onClick={() => setPreviewItem(item)}
                className="w-full aspect-3/4 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center overflow-hidden cursor-pointer shadow-2xs relative"
              >
                <img
                  src={item.url}
                  alt={item.filename}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-6 h-6 drop-shadow-md" />
                </div>
              </div>

              {/* Image Details */}
              <div className="space-y-1">
                <div
                  onClick={() => setPreviewItem(item)}
                  className="font-bold text-xs text-zinc-900 dark:text-white truncate font-mono cursor-pointer hover:text-[#5722AF]"
                  title={item.filename}
                >
                  {item.filename}
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>{item.width} × {item.height} px</span>
                  <span>{formatFileSize(item.size)}</span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Converted</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    title="Preview full image"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(item)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-[#5722AF] hover:text-white text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    title="Download this JPG"
                  >
                    <Download className="w-3 h-3" />
                    <span>JPG</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      <PdfImagePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}
