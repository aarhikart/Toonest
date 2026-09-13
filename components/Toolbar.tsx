'use client';

import React from 'react';
import { SortField } from '@/lib/types';
import {
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  Search,
  XCircle,
  FileCheck,
} from 'lucide-react';

interface ToolbarProps {
  totalCount: number;
  selectedCount: number;
  onToggleSelectAll: () => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
  sortField: SortField;
  onSortChange: (sort: SortField) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Toolbar({
  totalCount,
  selectedCount,
  onToggleSelectAll,
  onRemoveSelected,
  onClearAll,
  sortField,
  onSortChange,
  searchQuery,
  onSearchChange,
}: ToolbarProps) {
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <div className="bg-white dark:bg-[#131722] p-3.5 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Left: Selection & Bulk removal */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Select All Checkbox */}
        <button
          type="button"
          onClick={onToggleSelectAll}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700/80 transition-colors"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          ) : someSelected ? (
            <div className="w-4 h-4 rounded bg-[#5722AF]/20 flex items-center justify-center text-[#5722AF] font-bold text-xs">
              -
            </div>
          ) : (
            <Square className="w-4 h-4 text-zinc-400" />
          )}
          <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
          <span className="text-zinc-400 dark:text-zinc-500 font-normal">
            ({selectedCount}/{totalCount})
          </span>
        </button>

        {/* Remove Selected */}
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onRemoveSelected}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors animate-in fade-in duration-150"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove ({selectedCount})</span>
          </button>
        )}

        {/* Clear All */}
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-[#1a202e] transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Right: Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter files..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:border-[#5722AF] dark:focus:border-[#9B6BE8] focus:bg-white dark:focus:bg-[#131722] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-[#1a202e] px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700/80">
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
          <select
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as SortField)}
            className="text-xs bg-transparent font-medium text-zinc-700 dark:text-zinc-300 border-none focus:outline-none cursor-pointer py-0.5"
            aria-label="Sort images by"
          >
            <option value="order" className="dark:bg-[#131722]">
              Original Order
            </option>
            <option value="name-asc" className="dark:bg-[#131722]">
              Name (A to Z)
            </option>
            <option value="name-desc" className="dark:bg-[#131722]">
              Name (Z to A)
            </option>
            <option value="size-asc" className="dark:bg-[#131722]">
              File Size (Smallest)
            </option>
            <option value="size-desc" className="dark:bg-[#131722]">
              File Size (Largest)
            </option>
            <option value="type" className="dark:bg-[#131722]">
              File Type / Ext
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}
