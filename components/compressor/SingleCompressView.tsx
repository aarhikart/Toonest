'use client';

import React from 'react';
import { CompressFileItem, CompressionSettings } from '@/lib/compressorTypes';
import { formatBytes } from '@/lib/renameEngine';
import { ComparisonSlider } from './ComparisonSlider';
import {
  Download,
  Minimize2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface SingleCompressViewProps {
  item: CompressFileItem;
  settings: CompressionSettings;
  onCompress: () => Promise<void>;
  onDownload: () => void;
  onDownloadOriginal: () => void;
  isCompressing: boolean;
}

export function SingleCompressView({
  item,
  settings,
  onCompress,
  onDownload,
  onDownloadOriginal,
  isCompressing,
}: SingleCompressViewProps) {
  const isCompleted = item.status === 'completed' && item.compressedUrl;
  const isSkipped = item.wasSkipped || item.status === 'skipped';

  // Savings calculation
  const origSize = item.originalSize;
  const compSize = item.compressedSize || origSize;
  const diff = origSize - compSize;
  const reductionPct =
    origSize > 0 ? Math.round((diff / origSize) * 100) : 0;
  const isLarger = compSize > origSize;

  // Max width for graphic bar
  const origBarWidth = 100;
  const compBarWidth = Math.min(
    100,
    Math.max(5, Math.round((compSize / origSize) * 100))
  );

  return (
    <div className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 space-y-6 shadow-xs">
      {/* Interactive Quality Slider (if compressed) or Single Image Preview */}
      {isCompleted && item.compressedUrl ? (
        <ComparisonSlider
          originalUrl={item.previewUrl}
          compressedUrl={item.compressedUrl}
          originalLabel={`Original (${formatBytes(item.originalSize)})`}
          compressedLabel={`Compressed (${formatBytes(item.compressedSize || 0)})`}
        />
      ) : (
        /* Image Preview Box before compression */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider">
            <span>Original Image</span>
            <span className="font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {item.originalFormat.toUpperCase()}
            </span>
          </div>

          <div className="w-full h-72 sm:h-80 rounded-2xl bg-zinc-100/80 dark:bg-[#0c0e14] border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.originalName}
              className="max-h-full max-w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Metadata & File Size Graphic Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200/80 dark:border-zinc-800 space-y-4">
        {/* Info row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-sm text-zinc-900 dark:text-white truncate max-w-md">
              {item.originalName}
            </div>
            <div className="text-zinc-500 dark:text-zinc-400">
              {item.originalWidth} × {item.originalHeight} px • {item.originalFormat.toUpperCase()}
            </div>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  reductionPct > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {reductionPct > 0 ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Reduced by {reductionPct}%</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>No size reduction</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* File Size Graphic Comparison */}
        {isCompleted && (
          <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Original Size</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">
                  {formatBytes(origSize)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-400 dark:bg-zinc-500 rounded-full"
                  style={{ width: `${origBarWidth}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Compressed Size</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8] font-bold">
                  {formatBytes(compSize)}
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#5722AF] to-[#7B45D1] rounded-full transition-all duration-300"
                  style={{ width: `${compBarWidth}%` }}
                />
              </div>
            </div>

            {/* Savings Callout */}
            {diff > 0 && (
              <div className="pt-1 text-right text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                You saved {formatBytes(diff)} ({reductionPct}% reduction)
              </div>
            )}
          </div>
        )}

        {/* Skipped larger warning if triggered */}
        {isSkipped && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Skipped — the original file was already smaller than the compressed version.</span>
            </div>
            <button
              type="button"
              onClick={onDownloadOriginal}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#1a202e] border border-amber-300 text-amber-900 dark:text-amber-200"
            >
              Keep Original
            </button>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="text-xs text-zinc-500">
          Target format: <strong className="uppercase">{settings.outputFormat === 'original' ? item.originalFormat : settings.outputFormat}</strong> • Quality: <strong>{settings.quality}%</strong>
        </div>

        <div className="flex items-center gap-3">
          {/* Compress Button */}
          <button
            type="button"
            disabled={isCompressing}
            onClick={onCompress}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#4C1D9B] hover:to-[#6C3BC4] disabled:opacity-40 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isCompressing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compressing...</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>{isCompleted ? 'Re-Compress' : 'Compress Image'}</span>
              </>
            )}
          </button>

          {/* Download Button */}
          {isCompleted && (
            <button
              type="button"
              onClick={onDownload}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 animate-in fade-in"
            >
              <Download className="w-4 h-4" />
              <span>Download Compressed Image</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
