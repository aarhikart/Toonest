'use client';

import React, { useState } from 'react';
import {
  ResizeFileItem,
  ResizeConfig,
  ResizeBatchStats,
} from '@/lib/resizerTypes';
import { formatBytes } from '@/lib/renameEngine';
import {
  Download,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  StopCircle,
  FileArchive,
  GripVertical,
  RotateCcw,
  Sparkles,
  Maximize2,
  X,
} from 'lucide-react';

interface BulkResizeViewProps {
  items: ResizeFileItem[];
  config: ResizeConfig;
  onResizeAll: () => Promise<void>;
  onCancelResize: () => void;
  onDownloadZip: (zipFilename: string) => Promise<void>;
  onDownloadSingle: (item: ResizeFileItem) => void;
  onDownloadSelected: (zipFilename: string) => Promise<void>;
  onRemoveItem: (id: string) => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onSort: (type: 'name' | 'size' | 'dimensions') => void;
  onPreviewItem: (item: ResizeFileItem) => void;
  isProcessing: boolean;
  progressPercent: number;
  completedCount: number;
  failedCount: number;
  stats: ResizeBatchStats;
}

export function BulkResizeView({
  items,
  config,
  onResizeAll,
  onCancelResize,
  onDownloadZip,
  onDownloadSingle,
  onDownloadSelected,
  onRemoveItem,
  onRemoveSelected,
  onClearAll,
  onToggleSelect,
  onToggleSelectAll,
  onReorder,
  onSort,
  onPreviewItem,
  isProcessing,
  progressPercent,
  completedCount,
  failedCount,
  stats,
}: BulkResizeViewProps) {
  const [zipFilename, setZipFilename] = useState('resized-images');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const selectedCount = items.filter((it) => it.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const isAllProcessed =
    items.length > 0 &&
    items.every((it) => it.status === 'completed' || it.status === 'error' || it.status === 'skipped');
  const anyCompleted = items.some((it) => it.status === 'completed');

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIdx) return;
    onReorder(dragIndex, dropIdx);
    setDragIndex(null);
  };

  return (
    <div className="bg-white dark:bg-[#131722] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 space-y-6 shadow-xs">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Select All */}
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {allSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-[#5722AF]" />
            ) : (
              <Square className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span>
              Select All ({selectedCount}/{items.length})
            </span>
          </button>

          {/* Remove Selected */}
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onRemoveSelected}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove ({selectedCount})</span>
            </button>
          )}

          {/* Clear All with confirmation */}
          {showClearConfirm ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs">
              <span className="text-rose-700 dark:text-rose-300 font-semibold">Clear all files?</span>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold cursor-pointer hover:bg-rose-700"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 rounded-md text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-rose-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-[#1a202e] px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              onChange={(e) => onSort(e.target.value as any)}
              className="text-xs bg-transparent border-none focus:outline-none cursor-pointer text-zinc-700 dark:text-zinc-300 py-0.5"
            >
              <option value="name" className="dark:bg-[#131722]">Sort by Name</option>
              <option value="size" className="dark:bg-[#131722]">Sort by File Size</option>
              <option value="dimensions" className="dark:bg-[#131722]">Sort by Dimensions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/20 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#5722AF] dark:text-[#9B6BE8] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                Resizing Images... ({completedCount} of {items.length} completed)
              </span>
            </span>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] transition-all duration-200 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>
              Completed: {completedCount} &bull; Remaining: {items.length - completedCount} &bull; Failed: {failedCount}
            </span>
            <button
              type="button"
              onClick={onCancelResize}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Cancel Resize</span>
            </button>
          </div>
        </div>
      )}

      {/* Post-Batch Summary Banner */}
      {isAllProcessed && stats.completedFiles > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                Resize Complete — {stats.completedFiles} of {items.length} Images Processed Successfully
              </span>
            </div>
            {failedCount > 0 && (
              <button
                type="button"
                onClick={onResizeAll}
                className="text-xs font-bold text-rose-600 flex items-center gap-1 cursor-pointer hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry {failedCount} failed</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Original Total Size</div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {formatBytes(stats.originalTotalBytes)}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Resized Total Size</div>
              <div className="font-bold text-[#5722AF] dark:text-[#9B6BE8] mt-0.5">
                {formatBytes(stats.outputTotalBytes)}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Size Change</div>
              <div
                className={`font-bold mt-0.5 ${
                  stats.spaceSavedBytes >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {stats.spaceSavedBytes >= 0
                  ? `-${formatBytes(stats.spaceSavedBytes)} (${stats.totalReductionPercent || 0}%)`
                  : `+${formatBytes(Math.abs(stats.spaceSavedBytes))}`}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Success Rate</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {Math.round((stats.completedFiles / items.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#181d2a] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3 w-16">Preview</th>
              <th className="py-3 px-3">Filename & Ratio</th>
              <th className="py-3 px-3 w-32">Original Dim</th>
              <th className="py-3 px-3 w-36">Target / Resized Dim</th>
              <th className="py-3 px-3 w-28">Original Size</th>
              <th className="py-3 px-3 w-28">Resized Size</th>
              <th className="py-3 px-3 w-28 text-center">Status</th>
              <th className="py-3 px-3 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {items.map((item, idx) => {
              const currentTargetW = item.actualWidth || item.targetWidth || config.width;
              const currentTargetH = item.actualHeight || item.targetHeight || config.height;
              const isUpscaled =
                currentTargetW > item.originalWidth || currentTargetH > item.originalHeight;

              return (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`hover:bg-zinc-50/60 dark:hover:bg-[#181d2a]/60 transition-colors ${
                    item.selected ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/10' : ''
                  }`}
                >
                  {/* Select Checkbox & Drag Handle */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500">
                        <GripVertical className="w-3.5 h-3.5" />
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleSelect(item.id)}
                        className="text-zinc-400 hover:text-[#5722AF] cursor-pointer"
                      >
                        {item.selected ? (
                          <CheckSquare className="w-4 h-4 text-[#5722AF]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Thumbnail */}
                  <td className="py-3 px-3">
                    <div
                      onClick={() => onPreviewItem(item)}
                      className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 relative group cursor-pointer shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.resizedUrl || item.previewUrl}
                        alt={item.originalName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </td>

                  {/* Filename & Ratio */}
                  <td className="py-3 px-3 font-medium max-w-[200px]">
                    <div className="truncate text-zinc-800 dark:text-zinc-200 font-semibold" title={item.originalName}>
                      {item.originalName}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono">
                        {item.originalRatio || '16:9'}
                      </span>
                      {isUpscaled && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          Upscaling
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Original Dimensions */}
                  <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400 font-mono">
                    {item.originalWidth} × {item.originalHeight}
                  </td>

                  {/* Target / Resized Dimensions */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                      {currentTargetW} × {currentTargetH}
                    </span>
                  </td>

                  {/* Original Size */}
                  <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">
                    {formatBytes(item.originalSize)}
                  </td>

                  {/* Resized Size */}
                  <td className="py-3 px-3">
                    {item.resizedSize ? (
                      <span className="font-bold text-[#5722AF] dark:text-[#9B6BE8]">
                        {formatBytes(item.resizedSize)}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic">
                        ~{formatBytes(item.estimatedSize || Math.round(item.originalSize * 0.7))}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    {item.status === 'idle' && (
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        Queued
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Resizing...
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Done
                      </span>
                    )}
                    {item.status === 'skipped' && (
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                        Preserved
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400"
                        title={item.errorMessage}
                      >
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.status === 'completed' && item.resizedUrl && (
                        <button
                          type="button"
                          onClick={() => onDownloadSingle(item)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                          title="Download Image"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((item) => {
          const currentTargetW = item.actualWidth || item.targetWidth || config.width;
          const currentTargetH = item.actualHeight || item.targetHeight || config.height;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                item.selected
                  ? 'bg-[#5722AF]/5 border-[#5722AF]/40 dark:bg-[#5722AF]/10 dark:border-[#5722AF]/50'
                  : 'bg-zinc-50/50 dark:bg-[#161b26] border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleSelect(item.id)}
                    className="text-zinc-400 hover:text-[#5722AF] cursor-pointer"
                  >
                    {item.selected ? (
                      <CheckSquare className="w-5 h-5 text-[#5722AF]" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div
                    onClick={() => onPreviewItem(item)}
                    className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative cursor-pointer shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.resizedUrl || item.previewUrl}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">
                      {item.originalName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-zinc-400">
                        {formatBytes(item.originalSize)}
                      </span>
                      <span className="px-1 py-0.2 rounded text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono">
                        {item.originalRatio || '16:9'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {item.status === 'completed' && item.resizedUrl && (
                    <button
                      type="button"
                      onClick={() => onDownloadSingle(item)}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dimensions comparison row */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#11151f] border border-zinc-200/60 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Original</span>
                  <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    {item.originalWidth} × {item.originalHeight}
                  </span>
                </div>
                <div className="text-zinc-400">&rarr;</div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Resized</span>
                  <span className="font-mono font-bold text-[#5722AF] dark:text-[#9B6BE8]">
                    {currentTargetW} × {currentTargetH}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Batch Action Bar */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Custom ZIP file name input */}
        <div className="flex items-center gap-2">
          <FileArchive className="w-4 h-4 text-zinc-400 shrink-0" />
          <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs">
            <input
              type="text"
              value={zipFilename}
              onChange={(e) => setZipFilename(e.target.value.trim().replace(/\.zip$/i, ''))}
              placeholder="resized-images"
              className="bg-transparent border-none focus:outline-none text-zinc-800 dark:text-zinc-200 w-36 sm:w-44"
            />
            <span className="text-zinc-400 font-mono">.zip</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Resize All button */}
          <button
            type="button"
            onClick={onResizeAll}
            disabled={isProcessing || items.length === 0}
            className="flex-1 sm:flex-none py-3 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] hover:opacity-95 shadow-md shadow-[#5722AF]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resizing Batch ({completedCount}/{items.length})...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {anyCompleted ? 'Re-Resize All Images' : `Resize All (${items.length} Images)`}
                </span>
              </>
            )}
          </button>

          {/* Download All as ZIP */}
          {anyCompleted && (
            <button
              type="button"
              onClick={() => onDownloadZip(zipFilename || 'resized-images')}
              className="flex-1 sm:flex-none py-3 px-6 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP ({items.filter((i) => i.status === 'completed').length})</span>
            </button>
          )}

          {/* Download Selected as ZIP */}
          {selectedCount > 0 && anyCompleted && (
            <button
              type="button"
              onClick={() => onDownloadSelected(zipFilename || 'resized-selected')}
              className="py-3 px-4 rounded-2xl font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Selected ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
