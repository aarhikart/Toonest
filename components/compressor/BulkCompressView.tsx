'use client';

import React, { useState } from 'react';
import {
  CompressFileItem,
  CompressionSettings,
  CompressionBatchStats,
} from '@/lib/compressorTypes';
import { formatBytes } from '@/lib/renameEngine';
import {
  Minimize2,
  Download,
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  X,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  StopCircle,
  FileArchive,
  TrendingDown,
  GripVertical,
  RotateCcw,
} from 'lucide-react';

interface BulkCompressViewProps {
  items: CompressFileItem[];
  settings: CompressionSettings;
  onCompressAll: () => Promise<void>;
  onCancelCompress: () => void;
  onDownloadZip: (zipFilename: string) => Promise<void>;
  onDownloadSingle: (item: CompressFileItem) => void;
  onDownloadSelected: (zipFilename: string) => Promise<void>;
  onRemoveItem: (id: string) => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onSort: (type: 'name' | 'size' | 'format') => void;
  onPreviewItem: (item: CompressFileItem) => void;
  isCompressing: boolean;
  progressPercent: number;
  completedCount: number;
  failedCount: number;
  stats: CompressionBatchStats;
}

export function BulkCompressView({
  items,
  settings,
  onCompressAll,
  onCancelCompress,
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
  isCompressing,
  progressPercent,
  completedCount,
  failedCount,
  stats,
}: BulkCompressViewProps) {
  const [zipFilename, setZipFilename] = useState('compressed-images');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const selectedCount = items.filter((it) => it.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const isAllProcessed =
    items.length > 0 &&
    items.every((it) => it.status === 'completed' || it.status === 'skipped');

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
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
    <div className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 space-y-6 shadow-xs">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Select All */}
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-[#5722AF]" />
            ) : (
              <Square className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span>Select All ({selectedCount}/{items.length})</span>
          </button>

          {/* Remove Selected */}
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onRemoveSelected}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove ({selectedCount})</span>
            </button>
          )}

          {/* Clear All with confirmation */}
          {showClearConfirm ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs">
              <span className="text-rose-700 font-semibold">Clear all files?</span>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 rounded-md text-zinc-600 hover:bg-zinc-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-rose-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
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
              <option value="size" className="dark:bg-[#131722]">Sort by Size</option>
              <option value="format" className="dark:bg-[#131722]">Sort by Format</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      {isCompressing && (
        <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/20 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#5722AF] dark:text-[#9B6BE8] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                Compressing Images... ({completedCount} of {items.length} completed)
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

          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>
              Completed: {completedCount} • Remaining: {items.length - completedCount} • Failed: {failedCount}
            </span>
            <button
              type="button"
              onClick={onCancelCompress}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Cancel Compression</span>
            </button>
          </div>
        </div>
      )}

      {/* Post-Compression Summary Banner */}
      {isAllProcessed && stats.completedFiles > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                Compression Complete — {stats.completedFiles} Images Processed ({stats.skippedFiles} skipped to preserve size)
              </span>
            </div>
            {failedCount > 0 && (
              <button
                type="button"
                onClick={onCompressAll}
                className="text-xs font-bold text-rose-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry {failedCount} failed</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Original Size</div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {formatBytes(stats.originalTotalBytes)}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Compressed Size</div>
              <div className="font-bold text-[#5722AF] dark:text-[#9B6BE8] mt-0.5">
                {formatBytes(stats.compressedTotalBytes)}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Space Saved</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatBytes(stats.spaceSavedBytes)}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Total Reduction</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.totalReductionPercent}%
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
              <th className="py-3 px-3">Filename</th>
              <th className="py-3 px-3 w-20">Format</th>
              <th className="py-3 px-3 w-24">Original Size</th>
              <th className="py-3 px-3 w-28">Compressed Size</th>
              <th className="py-3 px-3 w-24">Status</th>
              <th className="py-3 px-3 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item, idx) => (
              <tr
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/70 dark:hover:bg-[#161b28] transition-colors ${
                  item.selected ? 'bg-[#5722AF]/5' : ''
                }`}
              >
                {/* Drag Handle & Checkbox */}
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <GripVertical className="w-3.5 h-3.5 text-zinc-400 cursor-grab active:cursor-grabbing" />
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => onToggleSelect(item.id)}
                      className="w-4 h-4 rounded text-[#5722AF]"
                    />
                  </div>
                </td>

                {/* Thumbnail Preview */}
                <td className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() => onPreviewItem(item)}
                    className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group relative"
                    title="Click to inspect"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>
                </td>

                {/* Filename & Dimensions */}
                <td className="py-3 px-3 max-w-[200px]">
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {item.targetName || item.originalName}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {item.originalWidth} × {item.originalHeight} px
                  </div>
                </td>

                {/* Format */}
                <td className="py-3 px-3 text-xs uppercase font-mono font-medium text-zinc-500">
                  {item.originalFormat}
                </td>

                {/* Original Size */}
                <td className="py-3 px-3 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {formatBytes(item.originalSize)}
                </td>

                {/* Compressed Size & Savings */}
                <td className="py-3 px-3">
                  {item.status === 'completed' ? (
                    <div>
                      <div className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8]">
                        {formatBytes(item.compressedSize || 0)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        -{item.reductionPercent}%
                      </div>
                    </div>
                  ) : item.status === 'skipped' ? (
                    <span className="text-[11px] text-amber-600 font-medium">
                      Skipped (original smaller)
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400">Estimated ~{Math.round(item.originalSize * 0.4 / 1024)} KB</span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-3 text-xs">
                  {item.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  ) : item.status === 'compressing' ? (
                    <span className="inline-flex items-center gap-1 text-[#5722AF]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Working
                    </span>
                  ) : item.status === 'skipped' ? (
                    <span className="text-amber-600">Preserved</span>
                  ) : item.status === 'error' ? (
                    <span className="text-rose-500 font-semibold">Error</span>
                  ) : (
                    <span className="text-zinc-400">Idle</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    {item.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => onDownloadSingle(item)}
                        className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-600"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards for Mobile */}
      <div className="md:hidden space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-xl border ${
              item.selected
                ? 'border-[#5722AF]/40 bg-[#5722AF]/5'
                : 'border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => onToggleSelect(item.id)}
                className="mt-1 w-4 h-4 rounded text-[#5722AF]"
              />
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.previewUrl}
                  alt={item.originalName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <div className="font-semibold truncate">{item.originalName}</div>
                <div className="text-zinc-400 mt-0.5">
                  Orig: {formatBytes(item.originalSize)} &rarr;{' '}
                  {item.status === 'completed' ? (
                    <strong className="text-[#5722AF]">
                      {formatBytes(item.compressedSize || 0)} (-{item.reductionPercent}%)
                    </strong>
                  ) : (
                    'Ready'
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span>
                    {item.status === 'completed' ? (
                      <span className="text-emerald-600 font-semibold">Done</span>
                    ) : (
                      <span className="text-zinc-400">Idle</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.status === 'completed' && (
                      <button
                        onClick={() => onDownloadSingle(item)}
                        className="text-emerald-600 font-bold"
                      >
                        Download
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-zinc-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions: Compress All & Download ZIP */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* ZIP Filename Input */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            ZIP Name:
          </label>
          <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-[#1a202e] border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 focus-within:border-[#5722AF]">
            <input
              type="text"
              value={zipFilename}
              onChange={(e) => setZipFilename(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none w-36 font-mono"
            />
            <span className="text-xs text-zinc-400 font-mono">.zip</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isCompressing || items.length === 0}
            onClick={onCompressAll}
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
                <span>Compress All ({items.length})</span>
              </>
            )}
          </button>

          {isAllProcessed && (
            <button
              type="button"
              onClick={() => onDownloadZip(zipFilename)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 animate-in fade-in"
            >
              <FileArchive className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
          )}

          {selectedCount > 0 && isAllProcessed && (
            <button
              type="button"
              onClick={() => onDownloadSelected(zipFilename)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 transition-colors"
            >
              Download Selected ({selectedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
