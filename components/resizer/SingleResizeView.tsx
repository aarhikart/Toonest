'use client';

import React, { useState } from 'react';
import {
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  CheckCircle2,
  Sparkles,
  Split,
  Eye,
  Info,
} from 'lucide-react';
import { ResizeFileItem, ResizeConfig } from '@/lib/resizerTypes';
import { formatBytes } from '@/lib/renameEngine';
import { ComparisonSlider } from '@/components/compressor/ComparisonSlider';

interface SingleResizeViewProps {
  item: ResizeFileItem;
  config: ResizeConfig;
  onResize: () => void;
  onDownload: () => void;
  onRemove: () => void;
  onUpdateConfig: <K extends keyof ResizeConfig>(key: K, value: ResizeConfig[K]) => void;
  isProcessing: boolean;
}

export function SingleResizeView({
  item,
  config,
  onResize,
  onDownload,
  onRemove,
  onUpdateConfig,
  isProcessing,
}: SingleResizeViewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'compare'>('preview');

  const hasOutput = item.status === 'completed' && Boolean(item.resizedUrl);

  // Calculate resolution & size diffs
  const currentTargetW = item.actualWidth || item.targetWidth || config.width;
  const currentTargetH = item.actualHeight || item.targetHeight || config.height;

  const originalPixels = (item.originalWidth || 1) * (item.originalHeight || 1);
  const targetPixels = currentTargetW * currentTargetH;
  const pixelChangePct = Math.round(((targetPixels - originalPixels) / originalPixels) * 100);

  const outputSize = item.resizedSize;
  const sizeDiffPct = outputSize
    ? Math.round(((outputSize - item.originalSize) / item.originalSize) * 100)
    : null;

  const handleRotate = (deg: number) => {
    const nextRotation = (config.rotate + deg + 360) % 360;
    onUpdateConfig('rotate', nextRotation);
  };

  const handleFlipHorizontal = () => {
    onUpdateConfig('flipH', !config.flipH);
  };

  const handleFlipVertical = () => {
    onUpdateConfig('flipV', !config.flipV);
  };

  return (
    <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white truncate max-w-[280px] sm:max-w-md">
              {item.originalName}
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {item.originalRatio || '16:9'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Original: {item.originalWidth} × {item.originalHeight} px &bull; {formatBytes(item.originalSize)}
          </p>
        </div>

        {/* View Switcher & Quick Actions */}
        <div className="flex items-center gap-2">
          {hasOutput && (
            <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'compare'
                    ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                <span>Compare</span>
              </button>
            </div>
          )}

          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            title="Remove Image"
            className="p-2 rounded-xl text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Target Resolution
          </span>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-1">
            {currentTargetW} × {currentTargetH} px
          </p>
          <span
            className={`text-[10px] font-semibold ${
              pixelChangePct > 0
                ? 'text-amber-600 dark:text-amber-400'
                : pixelChangePct < 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-400'
            }`}
          >
            {pixelChangePct > 0 ? `+${pixelChangePct}% pixels` : `${pixelChangePct}% pixels`}
          </span>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Target Format
          </span>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-1 uppercase">
            {config.outputFormat === 'original'
              ? item.originalFormat
              : config.outputFormat}
          </p>
          <span className="text-[10px] text-zinc-400 font-medium">
            {config.outputFormat === 'png' ? 'Lossless' : `Quality: ${config.quality}%`}
          </span>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Orientation / Angle
          </span>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-1">
            {config.rotate}° {config.flipH ? '• Flip H' : ''} {config.flipV ? '• Flip V' : ''}
          </p>
          <span className="text-[10px] text-zinc-400 font-medium capitalize">
            {config.orientation}
          </span>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            {hasOutput ? 'Output File Size' : 'Estimated Size'}
          </span>
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-1">
            {hasOutput && item.resizedSize
              ? formatBytes(item.resizedSize)
              : `~${formatBytes(item.estimatedSize || Math.round(item.originalSize * 0.7))}`}
          </p>
          {sizeDiffPct !== null ? (
            <span
              className={`text-[10px] font-semibold ${
                sizeDiffPct < 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {sizeDiffPct < 0 ? `${sizeDiffPct}% smaller` : `+${sizeDiffPct}% larger`}
            </span>
          ) : (
            <span className="text-[10px] text-zinc-400">Calculated on resize</span>
          )}
        </div>
      </div>

      {/* Main Preview / Comparison Area */}
      <div className="relative">
        {viewMode === 'compare' && hasOutput && item.resizedUrl ? (
          <div className="p-4 bg-zinc-50 dark:bg-[#0c0e14] rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <ComparisonSlider
              originalUrl={item.previewUrl}
              compressedUrl={item.resizedUrl}
              originalLabel={`Original (${item.originalWidth}×${item.originalHeight})`}
              compressedLabel={`Resized (${item.actualWidth || currentTargetW}×${item.actualHeight || currentTargetH})`}
            />
          </div>
        ) : (
          <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-zinc-100 dark:bg-[#0c0e14] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-4 overflow-hidden group">
            {/* Visual background grid */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#5722AF 1px, transparent 1px), radial-gradient(#5722AF 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            />

            {/* Main Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hasOutput && item.resizedUrl ? item.resizedUrl : item.previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-xl shadow-md transition-transform duration-300"
              style={{
                transform: `rotate(${config.rotate}deg) scaleX(${config.flipH ? -1 : 1}) scaleY(${
                  config.flipV ? -1 : 1
                })`,
              }}
            />

            {/* Watermark/Status Badge on image */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-xs text-white shadow-xs">
                {hasOutput
                  ? `Resized: ${item.actualWidth || currentTargetW} × ${item.actualHeight || currentTargetH} px`
                  : `Preview: ${item.originalWidth} × ${item.originalHeight} px`}
              </span>
              {hasOutput && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600/80 backdrop-blur-xs text-white shadow-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready to Download
                </span>
              )}
            </div>

            {/* Floating Rotation & Flip Controls */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-[#1a202e]/90 backdrop-blur-md p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-md">
              <button
                type="button"
                onClick={() => handleRotate(-90)}
                title="Rotate 90° Counter-Clockwise"
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleRotate(90)}
                title="Rotate 90° Clockwise"
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 my-auto" />
              <button
                type="button"
                onClick={handleFlipHorizontal}
                title="Flip Horizontally"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  config.flipH
                    ? 'bg-[#5722AF] text-white'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleFlipVertical}
                title="Flip Vertically"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  config.flipV
                    ? 'bg-[#5722AF] text-white'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upscale Note if applicable */}
      {targetPixels > originalPixels && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Upscaling note:</span> Target resolution is larger than original image.
            ToolNest uses high-quality bicubic canvas interpolation, but upscaling cannot invent new camera details.
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onResize}
          disabled={isProcessing}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 shadow-md shadow-[#5722AF]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Resizing Image...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{hasOutput ? 'Re-Apply Resize Settings' : 'Resize Image Now'}</span>
            </>
          )}
        </button>

        {hasOutput && (
          <button
            type="button"
            onClick={onDownload}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download ({formatBytes(item.resizedSize || 0)})</span>
          </button>
        )}
      </div>
    </div>
  );
}
