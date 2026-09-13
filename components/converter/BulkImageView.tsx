'use client';

import React, { useState } from 'react';
import {
  ConvertFileItem,
  ConversionSettings,
  ConversionStats,
  ImageFormat,
} from '@/lib/converterTypes';
import { formatBytes } from '@/lib/renameEngine';
import {
  RefreshCw,
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
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface BulkImageViewProps {
  items: ConvertFileItem[];
  settings: ConversionSettings;
  onConvertAll: () => Promise<void>;
  onCancelConvert: () => void;
  onDownloadZip: (zipName: string) => Promise<void>;
  onDownloadSingle: (item: ConvertFileItem) => void;
  onRemoveItem: (id: string) => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onSort: (type: 'name' | 'size' | 'format') => void;
  onOverrideItemFormat: (id: string, format: ImageFormat) => void;
  isConverting: boolean;
  progressPercent: number;
  completedCount: number;
  stats: ConversionStats;
}

export function BulkImageView({
  items,
  settings,
  onConvertAll,
  onCancelConvert,
  onDownloadZip,
  onDownloadSingle,
  onRemoveItem,
  onRemoveSelected,
  onClearAll,
  onToggleSelect,
  onToggleSelectAll,
  onReorder,
  onSort,
  onOverrideItemFormat,
  isConverting,
  progressPercent,
  completedCount,
  stats,
}: BulkImageViewProps) {
  const [zipFilename, setZipFilename] = useState('converted-images');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAdvancedPerFile, setShowAdvancedPerFile] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const selectedCount = items.filter((it) => it.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const isAllConverted =
    items.length > 0 && items.every((it) => it.status === 'completed');

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
      {/* Toolbar / Header */}
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

        {/* Sorting & Per-image settings toggle */}
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

          <button
            type="button"
            onClick={() => setShowAdvancedPerFile(!showAdvancedPerFile)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              showAdvancedPerFile
                ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF]'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {showAdvancedPerFile ? 'Per-File: ON' : 'Per-File Format'}
          </button>
        </div>
      </div>

      {/* Conversion Progress Panel */}
      {isConverting && (
        <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/20 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#5722AF] dark:text-[#9B6BE8] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Converting images in browser ({completedCount} of {items.length} completed)</span>
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
              Completed: {completedCount} • Remaining: {items.length - completedCount}
            </span>
            <button
              type="button"
              onClick={onCancelConvert}
              className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Cancel Conversion</span>
            </button>
          </div>
        </div>
      )}

      {/* Post-Conversion Summary Banner */}
      {isAllConverted && stats.completedFiles > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Conversion Complete — {stats.completedFiles} Images Processed Successfully</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Original Total</div>
              <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                {formatBytes(stats.originalTotalBytes)}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Output Total</div>
              <div className="font-bold text-[#5722AF] dark:text-[#9B6BE8] mt-0.5">
                {formatBytes(stats.convertedTotalBytes)}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Space Saved</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.spaceSavedBytes > 0
                  ? formatBytes(stats.spaceSavedBytes)
                  : '0 B'}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-[#131722]/80 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
              <div className="text-zinc-400 font-medium">Reduction</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.percentageSaved}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Table for Desktop */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#181d2a] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3 w-16">Preview</th>
              <th className="py-3 px-3">Original Name</th>
              <th className="py-3 px-3 w-20">Format</th>
              <th className="py-3 px-3 w-24">Size</th>
              <th className="py-3 px-3 w-28">Target Format</th>
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

                {/* Thumbnail */}
                <td className="py-3 px-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>

                {/* Original Name */}
                <td className="py-3 px-3 max-w-[200px]">
                  <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {item.originalName}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {item.originalWidth} × {item.originalHeight} px
                  </div>
                </td>

                {/* Original Format */}
                <td className="py-3 px-3 text-xs uppercase font-mono font-medium text-zinc-500">
                  {item.originalFormat}
                </td>

                {/* Size */}
                <td className="py-3 px-3 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {formatBytes(item.originalSize)}
                </td>

                {/* Target Format */}
                <td className="py-3 px-3">
                  {showAdvancedPerFile ? (
                    <select
                      value={item.targetFormat || settings.targetFormat}
                      onChange={(e) =>
                        onOverrideItemFormat(
                          item.id,
                          e.target.value as ImageFormat
                        )
                      }
                      className="px-2 py-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#1a202e] uppercase font-bold text-[#5722AF]"
                    >
                      <option value="webp">WebP</option>
                      <option value="jpg">JPG</option>
                      <option value="png">PNG</option>
                      <option value="avif">AVIF</option>
                    </select>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold font-mono uppercase bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]">
                      {settings.targetFormat}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-3 text-xs">
                  {item.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  ) : item.status === 'converting' ? (
                    <span className="inline-flex items-center gap-1 text-[#5722AF]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Converting
                    </span>
                  ) : item.status === 'error' ? (
                    <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Error
                    </span>
                  ) : (
                    <span className="text-zinc-400">Idle</span>
                  )}
                </td>

                {/* Action */}
                <td className="py-3 px-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    {item.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => onDownloadSingle(item)}
                        className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                        title="Download converted file"
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
        {items.map((item, idx) => (
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
                  {formatBytes(item.originalSize)} • {item.originalFormat.toUpperCase()} &rarr;{' '}
                  <strong className="text-[#5722AF] uppercase">{settings.targetFormat}</strong>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span>
                    {item.status === 'completed' ? (
                      <span className="text-emerald-600 font-semibold">Done</span>
                    ) : (
                      <span className="text-zinc-400">Ready</span>
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

      {/* Bottom Actions: Convert All & Download ZIP */}
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
              className="text-xs bg-transparent border-none focus:outline-none w-32 font-mono"
            />
            <span className="text-xs text-zinc-400 font-mono">.zip</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isConverting || items.length === 0}
            onClick={onConvertAll}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#4C1D9B] hover:to-[#6C3BC4] disabled:opacity-40 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isConverting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Converting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Convert All ({items.length})</span>
              </>
            )}
          </button>

          {isAllConverted && (
            <button
              type="button"
              onClick={() => onDownloadZip(zipFilename)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2 animate-in fade-in"
            >
              <FileArchive className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
