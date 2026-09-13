'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  CheckCircle2,
  FileImage,
  Loader2,
  Check,
  Play,
  Sliders,
  AlertCircle,
  Archive,
  RefreshCw,
  Eye,
  FileArchive,
} from 'lucide-react';
import { WatermarkConfig, WatermarkItem } from '@/lib/watermarkTypes';
import { watermarkSingleItem, loadImage } from '@/lib/watermarkEngine';
import { formatBytes } from '@/lib/renameEngine';
import { downloadWatermarkedAsZip } from '@/lib/zipUtils';
import { WatermarkInteractiveCanvas } from './WatermarkInteractiveCanvas';
import { WatermarkControls } from './WatermarkControls';
import { WatermarkPerItemModal } from './WatermarkPerItemModal';

interface BulkWatermarkViewProps {
  items: WatermarkItem[];
  config: WatermarkConfig;
  onConfigChange: (updated: Partial<WatermarkConfig>) => void;
  onResetConfig: () => void;
  onApplyPreset: (presetConfig: Partial<WatermarkConfig>) => void;
  onPositionChange: (xPercent: number, yPercent: number) => void;
  onClearAll: () => void;
  onRemoveItem: (id: string) => void;
  onAddMore: (files: File[]) => void;
  onUpdateItem: (id: string, updates: Partial<WatermarkItem>) => void;
}

export function BulkWatermarkView({
  items,
  config,
  onConfigChange,
  onResetConfig,
  onApplyPreset,
  onPositionChange,
  onClearAll,
  onRemoveItem,
  onAddMore,
  onUpdateItem,
}: BulkWatermarkViewProps) {
  // Selected item to display in the main interactive canvas
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  // Per-item override modal state
  const [modalItem, setModalItem] = useState<WatermarkItem | null>(null);

  const activeItem = items[activePreviewIndex] || items[0];
  const cancelRef = useRef(false);

  // Determine effective configuration for active preview item
  const activeEffectiveConfig: WatermarkConfig = {
    ...config,
    ...(activeItem?.customConfig || {}),
  };

  const handleActivePositionChange = (xPercent: number, yPercent: number) => {
    if (!activeItem) return;
    if (activeItem.hasCustomOverride) {
      onUpdateItem(activeItem.id, {
        customConfig: {
          ...activeItem.customConfig,
          position: 'custom',
          customXPercent: xPercent,
          customYPercent: yPercent,
        },
      });
    } else {
      onPositionChange(xPercent, yPercent);
    }
  };

  // Watermark All Images Pipeline
  const handleProcessAll = async () => {
    if (isProcessingAll || items.length === 0) return;
    setIsProcessingAll(true);
    setIsCancelling(false);
    cancelRef.current = false;
    setProcessedCount(0);

    let logoImg: HTMLImageElement | null = null;
    if (config.type === 'image' && config.logoUrl) {
      try {
        logoImg = await loadImage(config.logoUrl);
      } catch {
        logoImg = null;
      }
    }

    for (let i = 0; i < items.length; i++) {
      if (cancelRef.current) break;
      const currentItem = items[i];

      onUpdateItem(currentItem.id, { status: 'processing' });

      try {
        const processed = await watermarkSingleItem(currentItem, config, logoImg);
        onUpdateItem(currentItem.id, {
          ...processed,
          status: 'done',
        });
      } catch (err: unknown) {
        onUpdateItem(currentItem.id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to watermark',
        });
      }

      setProcessedCount(i + 1);
    }

    setIsProcessingAll(false);
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setIsCancelling(true);
  };

  // Download All as ZIP
  const handleDownloadAllZip = async () => {
    const completedItems = items.filter((item) => item.status === 'done' && item.watermarkedBlob);
    if (completedItems.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);

    try {
      await downloadWatermarkedAsZip(completedItems, 'watermarked-images.zip', (p) => {
        setZipProgress(p);
      });
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Download Single from bulk list
  const handleDownloadSingle = (item: WatermarkItem) => {
    if (!item.watermarkedUrl) return;
    const link = document.createElement('a');
    link.href = item.watermarkedUrl;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const doneItems = items.filter((item) => item.status === 'done');
  const allDone = doneItems.length === items.length && items.length > 0;
  const progressPercent =
    items.length > 0 ? Math.round((processedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/30 flex items-center justify-center text-[#5722AF] dark:text-[#9B6BE8] shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                Bulk Watermark Studio
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8]">
                {items.length} Images Queued
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Adjust watermark settings globally or customize any photo independently.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <label
            htmlFor="bulk-add-more-input"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </label>
          <input
            id="bulk-add-more-input"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddMore(Array.from(e.target.files));
              }
            }}
            className="hidden"
          />

          <button
            type="button"
            onClick={onClearAll}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>

          {!allDone ? (
            <button
              type="button"
              onClick={handleProcessAll}
              disabled={isProcessingAll}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#5722AF] hover:bg-[#471a93] active:scale-[0.98] text-white shadow-md shadow-[#5722AF]/25 transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {isProcessingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing ({processedCount}/{items.length})...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watermark All Images</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating ZIP ({zipProgress}%)...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (during batch processing) */}
      {isProcessingAll && (
        <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/20 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-700 dark:text-zinc-200">
              Processing: {processedCount} of {items.length} images completed
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                {progressPercent}%
              </span>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                {isCancelling ? 'Stopping...' : 'Cancel'}
              </button>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5722AF] to-[#9B6BE8] transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Studio Area: Preview + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Active Canvas Preview + Image Selector Carousel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="h-[520px] sm:h-[580px]">
            {activeItem && (
              <WatermarkInteractiveCanvas
                item={activeItem}
                config={activeEffectiveConfig}
                onPositionChange={handleActivePositionChange}
              />
            )}
          </div>

          {/* Quick Image Selection Carousel */}
          <div className="bg-white dark:bg-[#131620] rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div className="text-[11px] font-bold text-zinc-400 px-2 shrink-0 uppercase tracking-wider">
              Preview:
            </div>
            {items.map((item, idx) => {
              const isCurrent = idx === activePreviewIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    isCurrent
                      ? 'border-[#5722AF] ring-2 ring-[#5722AF]/30 scale-105'
                      : 'border-zinc-200 dark:border-zinc-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.hasCustomOverride && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
                  )}
                  {item.status === 'done' && (
                    <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-white flex items-center justify-center">
                      <Check className="w-1.5 h-1.5 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column (5 cols): Global Controls */}
        <div className="lg:col-span-5 h-[580px]">
          <WatermarkControls
            config={config}
            onChange={onConfigChange}
            onReset={onResetConfig}
            onApplyPreset={onApplyPreset}
          />
        </div>
      </div>

      {/* Batch Completion Summary Card */}
      {allDone && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#5722AF]/10 to-transparent border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                All {items.length} Images Watermarked Successfully!
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Download your files as an organized ZIP archive or inspect individually below.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadAllZip}
            disabled={isZipping}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#5722AF] hover:bg-[#471a93] text-white shadow-md shadow-[#5722AF]/25 transition-all flex items-center gap-2"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating ZIP ({zipProgress}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download watermarked-images.zip</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Bulk Queue Table / List */}
      <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-[#0f121a]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Image Queue ({items.length})
          </h3>
          <span className="text-xs text-zinc-400">
            Click &apos;Customize&apos; to set unique watermarks for specific photos
          </span>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[480px] overflow-y-auto">
          {items.map((item, idx) => {
            const isSelectedForPreview = idx === activePreviewIndex;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-4 transition-colors ${
                  isSelectedForPreview
                    ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/10'
                    : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div
                  className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                  onClick={() => setActivePreviewIndex(idx)}
                >
                  <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.name}
                      </span>
                      {item.hasCustomOverride && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span>{formatBytes(item.originalSize)}</span>
                      <span>•</span>
                      <span>{item.originalWidth} × {item.originalHeight} px</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="shrink-0 flex items-center gap-2">
                  {item.status === 'idle' && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                      Pending
                    </span>
                  )}
                  {item.status === 'processing' && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-[#5722AF]/10 text-[#5722AF] font-medium flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Processing
                    </span>
                  )}
                  {item.status === 'done' && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Error
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModalItem(item)}
                    title="Customize Watermark for this image"
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Customize</span>
                  </button>

                  {item.status === 'done' && item.watermarkedUrl && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      title="Download this watermarked image"
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/20 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    title="Remove image from queue"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Item Override Modal */}
      <WatermarkPerItemModal
        isOpen={modalItem !== null}
        item={modalItem}
        baseConfig={config}
        onClose={() => setModalItem(null)}
        onSaveCustomConfig={(itemId, customConfig) => {
          if (customConfig) {
            onUpdateItem(itemId, {
              customConfig,
              hasCustomOverride: true,
              status: 'idle', // needs re-render on download
            });
          } else {
            onUpdateItem(itemId, {
              customConfig: undefined,
              hasCustomOverride: false,
              status: 'idle',
            });
          }
        }}
      />
    </div>
  );
}
