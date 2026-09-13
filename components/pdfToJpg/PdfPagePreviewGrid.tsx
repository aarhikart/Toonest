'use client';

import React, { useState } from 'react';
import {
  Layers,
  CheckSquare,
  Square,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertCircle,
  RotateCw,
  Sliders,
  Check,
} from 'lucide-react';
import { PdfFileItem, PageRangeMode } from '@/lib/pdfToJpgTypes';
import { parsePageRange } from '@/lib/pdfToJpgEngine';

interface PdfPagePreviewGridProps {
  activePdf: PdfFileItem | null;
  rangeMode: PageRangeMode;
  customRangeText: string;
  onChangeRangeMode: (mode: PageRangeMode) => void;
  onChangeCustomRangeText: (text: string) => void;
  onTogglePageSelected: (pageNumber: number) => void;
  onSelectAllPages: () => void;
  onDeselectAllPages: () => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
}

export function PdfPagePreviewGrid({
  activePdf,
  rangeMode,
  customRangeText,
  onChangeRangeMode,
  onChangeCustomRangeText,
  onTogglePageSelected,
  onSelectAllPages,
  onDeselectAllPages,
  onMovePage,
}: PdfPagePreviewGridProps) {
  const [rangeError, setRangeError] = useState<string | null>(null);

  if (!activePdf) return null;

  const totalPages = activePdf.pageCount;
  const selectedCount = activePdf.pages.filter((p) => p.selected).length;

  const handleCustomRangeBlur = () => {
    if (!customRangeText.trim()) {
      setRangeError(null);
      return;
    }
    const result = parsePageRange(customRangeText, totalPages);
    if (!result.valid) {
      setRangeError(result.error || 'Invalid page range syntax');
    } else {
      setRangeError(null);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with PDF name and page count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>{activePdf.name}</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {totalPages} {totalPages === 1 ? 'page' : 'pages'} total • {selectedCount} selected for export
          </p>
        </div>

        {/* Quick Selection Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onSelectAllPages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Select All</span>
          </button>
          <button
            type="button"
            onClick={onDeselectAllPages}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-zinc-400" />
            <span>Deselect All</span>
          </button>
        </div>
      </div>

      {/* Page Range Selection System (Section 8) */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Export Scope
          </span>

          <div className="flex items-center gap-1 p-1 bg-zinc-200/70 dark:bg-zinc-800 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => onChangeRangeMode('all')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                rangeMode === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              All Pages ({totalPages})
            </button>
            <button
              type="button"
              onClick={() => onChangeRangeMode('selected')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                rangeMode === 'selected'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Selected Pages ({selectedCount})
            </button>
            <button
              type="button"
              onClick={() => onChangeRangeMode('custom')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                rangeMode === 'custom'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-[#9B6BE8] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>

        {/* Custom Range Input Field */}
        {rangeMode === 'custom' && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. 1-3, 5, 8-12"
                value={customRangeText}
                onChange={(e) => {
                  onChangeCustomRangeText(e.target.value);
                  setRangeError(null);
                }}
                onBlur={handleCustomRangeBlur}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg outline-none focus:border-[#5722AF] font-mono text-zinc-900 dark:text-white"
              />
            </div>
            {rangeError ? (
              <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{rangeError}</span>
              </p>
            ) : (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Specify pages or comma-separated ranges (e.g. 1-3, 5, 8-10) up to page {totalPages}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pages Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
        {activePdf.pages.map((page, idx) => {
          const isSelected = rangeMode === 'all' || page.selected;

          return (
            <div
              key={page.pageNumber}
              className={`group relative flex flex-col rounded-xl border p-2 bg-white dark:bg-zinc-900 transition-all ${
                isSelected
                  ? 'border-[#5722AF] ring-2 ring-[#5722AF]/20 shadow-xs'
                  : 'border-zinc-200/80 dark:border-zinc-800 opacity-60 hover:opacity-100'
              }`}
            >
              {/* Header inside page card: Checkbox + Page number */}
              <div className="flex items-center justify-between gap-1 pb-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => onTogglePageSelected(page.pageNumber)}
                  className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
                >
                  {page.selected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span className="text-[11px]">Page {page.pageNumber}</span>
                </button>

                {/* Orientation Tag */}
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">
                  {page.orientation[0]}
                </span>
              </div>

              {/* Rendered Thumbnail Container */}
              <div
                onClick={() => onTogglePageSelected(page.pageNumber)}
                className="w-full aspect-3/4 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center overflow-hidden cursor-pointer shadow-2xs"
              >
                {page.thumbnailUrl ? (
                  <img
                    src={page.thumbnailUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] text-zinc-400">Loading...</span>
                )}
              </div>

              {/* Reordering actions (Section 27) */}
              <div className="pt-1.5 flex items-center justify-between text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Order #{idx + 1}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onMovePage(idx, idx - 1)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    title="Move page earlier"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === activePdf.pages.length - 1}
                    onClick={() => onMovePage(idx, idx + 1)}
                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                    title="Move page later"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
