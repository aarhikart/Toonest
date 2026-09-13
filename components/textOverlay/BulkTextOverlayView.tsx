'use client';

import React, { useState, useRef, useMemo } from 'react';
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
  ArrowUpDown,
} from 'lucide-react';
import { TextLayer, TextOverlayConfig, TextOverlayItem } from '@/lib/textOverlayTypes';
import { processSingleTextOverlayItem } from '@/lib/textOverlayEngine';
import { formatBytes } from '@/lib/renameEngine';
import { downloadOverlayImagesAsZip } from '@/lib/zipUtils';
import { TextOverlayCanvas } from './TextOverlayCanvas';
import { TextLayerList } from './TextLayerList';
import { TextLayerControls } from './TextLayerControls';
import { TextOverlayPerItemModal } from './TextOverlayPerItemModal';

interface BulkTextOverlayViewProps {
  items: TextOverlayItem[];
  config: TextOverlayConfig;
  onLayerChange: (layerId: string, updated: Partial<TextLayer>) => void;
  onConfigChange: (updated: Partial<TextOverlayConfig>) => void;
  onAddLayer: () => void;
  onDuplicateLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onSelectLayer: (id: string) => void;
  onResetLayer: () => void;
  onApplyTemplate: (style: Partial<TextLayer>) => void;
  onClearAll: () => void;
  onRemoveItem: (id: string) => void;
  onAddMore: (files: File[]) => void;
  onUpdateItem: (id: string, updates: Partial<TextOverlayItem>) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

type SortField = 'upload' | 'name' | 'size' | 'dimensions';

export function BulkTextOverlayView({
  items,
  config,
  onLayerChange,
  onConfigChange,
  onAddLayer,
  onDuplicateLayer,
  onToggleVisibility,
  onDeleteLayer,
  onMoveLayer,
  onSelectLayer,
  onResetLayer,
  onApplyTemplate,
  onClearAll,
  onRemoveItem,
  onAddMore,
  onUpdateItem,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: BulkTextOverlayViewProps) {
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [sortField, setSortField] = useState<SortField>('upload');
  const [sortAsc, setSortAsc] = useState(true);

  // Per-item modal override state
  const [modalItem, setModalItem] = useState<TextOverlayItem | null>(null);

  const activeItem = items[activePreviewIndex] || items[0];
  const activeLayer = config.layers.find((l) => l.id === config.activeLayerId) || config.layers[0] || null;
  const cancelRef = useRef(false);

  // Sorting
  const sortedItems = useMemo(() => {
    const list = [...items];
    if (sortField === 'name') {
      list.sort((a, b) =>
        sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
    } else if (sortField === 'size') {
      list.sort((a, b) =>
        sortAsc ? a.originalSize - b.originalSize : b.originalSize - a.originalSize
      );
    } else if (sortField === 'dimensions') {
      list.sort((a, b) => {
        const areaA = a.originalWidth * a.originalHeight;
        const areaB = b.originalWidth * b.originalHeight;
        return sortAsc ? areaA - areaB : areaB - areaA;
      });
    }
    return list;
  }, [items, sortField, sortAsc]);

  // Bulk Processing Pipeline
  const handleProcessAll = async () => {
    if (isProcessingAll || items.length === 0) return;
    setIsProcessingAll(true);
    setIsCancelling(false);
    cancelRef.current = false;
    setProcessedCount(0);

    for (let i = 0; i < items.length; i++) {
      if (cancelRef.current) break;
      const current = items[i];

      onUpdateItem(current.id, { status: 'processing' });

      try {
        const processed = await processSingleTextOverlayItem(current, config, i + 1);
        onUpdateItem(current.id, {
          ...processed,
          status: 'done',
        });
      } catch (err: unknown) {
        onUpdateItem(current.id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Processing failed',
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
    const readyItems = items.filter((item) => item.status === 'done' && item.processedBlob);
    if (readyItems.length === 0) return;

    setIsZipping(true);
    setZipProgress(0);

    try {
      await downloadOverlayImagesAsZip(readyItems, 'text-overlay-images.zip', (p) => {
        setZipProgress(p);
      });
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Download Single item
  const handleDownloadSingle = (item: TextOverlayItem) => {
    if (!item.processedUrl) return;
    const link = document.createElement('a');
    link.href = item.processedUrl;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const doneItems = items.filter((item) => item.status === 'done');
  const allDone = doneItems.length === items.length && items.length > 0;
  const progressPercent = items.length > 0 ? Math.round((processedCount / items.length) * 100) : 0;
  const totalOutputBytes = doneItems.reduce((acc, curr) => acc + (curr.processedSize || 0), 0);

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
                Bulk Text Overlay Studio
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8]">
                {items.length} Images Queued
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Supports dynamic tokens: <code className="text-[#5722AF] font-bold">{'{name}'}</code>, <code className="text-[#5722AF] font-bold">{'{number}'}</code>, <code className="text-[#5722AF] font-bold">{'{date}'}</code>.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <label
            htmlFor="bulk-overlay-add-more-input"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </label>
          <input
            id="bulk-overlay-add-more-input"
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
                  <span>Apply & Process All</span>
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

      {/* Main Studio Area: Canvas + Layer Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Active Canvas Preview + Image Selector Carousel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="h-[540px] sm:h-[600px]">
            {activeItem && (
              <TextOverlayCanvas
                item={activeItem}
                config={config}
                activeLayer={activeLayer}
                onLayerPositionChange={(layerId, xP, yP) =>
                  onLayerChange(layerId, {
                    position: 'custom',
                    customXPercent: xP,
                    customYPercent: yP,
                  })
                }
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={onUndo}
                onRedo={onRedo}
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

        {/* Right Column (5 cols): Global Layers & Controls */}
        <div className="lg:col-span-5 space-y-4">
          <TextLayerList
            layers={config.layers}
            activeLayerId={config.activeLayerId}
            onSelectLayer={onSelectLayer}
            onAddLayer={onAddLayer}
            onDuplicateLayer={onDuplicateLayer}
            onToggleVisibility={onToggleVisibility}
            onDeleteLayer={onDeleteLayer}
            onMoveLayer={onMoveLayer}
          />

          <div className="h-[400px]">
            <TextLayerControls
              layer={activeLayer}
              config={config}
              onLayerChange={(updated) => {
                if (activeLayer) onLayerChange(activeLayer.id, updated);
              }}
              onConfigChange={onConfigChange}
              onApplyTemplate={onApplyTemplate}
              onResetLayer={onResetLayer}
            />
          </div>
        </div>
      </div>

      {/* Completion Summary Card */}
      {allDone && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#5722AF]/10 to-transparent border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                All {items.length} Images Processed Successfully!
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Total Output Size: <span className="font-semibold">{formatBytes(totalOutputBytes)}</span>. Download as a single ZIP archive or inspect individually below.
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
                <span>Download text-overlay-images.zip</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Bulk Images Queue Table */}
      <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/60 dark:bg-[#0f121a]">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Image Queue ({items.length})
            </h3>
          </div>

          {/* Sorting Options */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="text-xs py-1 px-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
            >
              <option value="upload">Upload Order</option>
              <option value="name">Filename</option>
              <option value="size">File Size</option>
              <option value="dimensions">Dimensions</option>
            </select>
            <button
              type="button"
              onClick={() => setSortAsc(!sortAsc)}
              className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold"
            >
              {sortAsc ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[500px] overflow-y-auto">
          {sortedItems.map((item, idx) => {
            const isSelectedForPreview = items[activePreviewIndex]?.id === item.id;

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
                  onClick={() => {
                    const originalIdx = items.findIndex((i) => i.id === item.id);
                    if (originalIdx !== -1) setActivePreviewIndex(originalIdx);
                  }}
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
                          Custom Overrides
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
                    title="Customize Text Overlays for this image"
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:border-[#5722AF] text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Customize</span>
                  </button>

                  {item.status === 'done' && item.processedUrl && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      title="Download this image"
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

      {/* Per-Item Customization Modal */}
      <TextOverlayPerItemModal
        isOpen={modalItem !== null}
        item={modalItem}
        baseConfig={config}
        onClose={() => setModalItem(null)}
        onSaveCustomConfig={(itemId, customLayers) => {
          if (customLayers) {
            onUpdateItem(itemId, {
              customLayers,
              hasCustomOverride: true,
              status: 'idle',
            });
          } else {
            onUpdateItem(itemId, {
              customLayers: undefined,
              hasCustomOverride: false,
              status: 'idle',
            });
          }
        }}
      />
    </div>
  );
}
