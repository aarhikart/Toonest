'use client';

import React from 'react';
import { ImageFileItem } from '@/lib/types';
import { formatBytes } from '@/lib/renameEngine';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  X,
  Eye,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

interface FileRowProps {
  item: ImageFileItem;
  index: number;
  totalItems: number;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onPreview: (item: ImageFileItem) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
}

export function FileRow({
  item,
  index,
  totalItems,
  onToggleSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  onPreview,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: FileRowProps) {
  const isDup = item.status === 'duplicate';

  return (
    <>
      {/* Desktop & Tablet Table Row */}
      <tr
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={(e) => onDragOver(e, index)}
        onDrop={(e) => onDrop(e, index)}
        className={`hidden md:table-row border-b border-zinc-100 dark:border-zinc-800/80 transition-colors ${
          isDragging ? 'opacity-30 bg-zinc-100 dark:bg-zinc-800' : ''
        } ${
          item.selected
            ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/10'
            : 'hover:bg-zinc-50/70 dark:hover:bg-[#161b28]'
        }`}
      >
        {/* Checkbox & Order Index */}
        <td className="py-3 px-3 w-12 text-center">
          <div className="flex items-center justify-center gap-2">
            <span
              className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </span>
            <input
              type="checkbox"
              checked={item.selected}
              onChange={() => onToggleSelect(item.id)}
              className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF] cursor-pointer"
              aria-label={`Select ${item.originalName}`}
            />
          </div>
        </td>

        {/* Thumbnail Preview */}
        <td className="py-3 px-3 w-16">
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="group relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center shrink-0 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            title="Click to zoom preview"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.originalName}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Eye className="w-4 h-4 text-white" />
            </div>
          </button>
        </td>

        {/* Original Name */}
        <td className="py-3 px-3 max-w-[200px]">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate" title={item.originalName}>
            {item.originalName}
          </div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            Original file
          </div>
        </td>

        {/* New Name */}
        <td className="py-3 px-3 max-w-[240px]">
          <div
            className={`text-xs font-mono font-semibold truncate ${
              isDup
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-[#5722AF] dark:text-[#9B6BE8]'
            }`}
            title={item.newName}
          >
            {item.newName}
          </div>
          {isDup && (
            <div className="text-[10px] text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-3 h-3" />
              <span>Duplicate name</span>
            </div>
          )}
        </td>

        {/* File Size & Dimensions */}
        <td className="py-3 px-3 w-28 whitespace-nowrap">
          <div className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
            {formatBytes(item.size)}
          </div>
          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            {item.dimensions?.width && item.dimensions?.height
              ? `${item.dimensions.width} × ${item.dimensions.height}`
              : item.extension.toUpperCase()}
          </div>
        </td>

        {/* Status */}
        <td className="py-3 px-3 w-24 whitespace-nowrap">
          {isDup ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-3 h-3" />
              Duplicate
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-3 h-3" />
              Ready
            </span>
          )}
        </td>

        {/* Actions: Reorder & Remove */}
        <td className="py-3 px-3 w-28 whitespace-nowrap text-right">
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors"
              title="Move up"
              aria-label="Move file up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={index === totalItems - 1}
              onClick={() => onMoveDown(index)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors"
              title="Move down"
              aria-label="Move file down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="p-1 ml-1 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Remove file"
              aria-label={`Remove ${item.originalName}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      {/* Mobile Card Layout */}
      <div
        className={`md:hidden p-3.5 rounded-xl border transition-all ${
          item.selected
            ? 'border-[#5722AF]/40 bg-[#5722AF]/5 dark:bg-[#5722AF]/10'
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#131722]'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Mobile Checkbox */}
          <input
            type="checkbox"
            checked={item.selected}
            onChange={() => onToggleSelect(item.id)}
            className="mt-1 w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
            aria-label={`Select ${item.originalName}`}
          />

          {/* Thumbnail */}
          <button
            type="button"
            onClick={() => onPreview(item)}
            className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0 relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.previewUrl}
              alt={item.originalName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div
                className={`text-xs font-mono font-semibold truncate ${
                  isDup ? 'text-rose-600' : 'text-[#5722AF] dark:text-[#9B6BE8]'
                }`}
              >
                {item.newName}
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="text-zinc-400 hover:text-rose-600 p-1"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              Orig: {item.originalName}
            </div>

            <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              <span>{formatBytes(item.size)}</span>
              {item.dimensions?.width && (
                <span>
                  {item.dimensions.width}×{item.dimensions.height}
                </span>
              )}
              {isDup ? (
                <span className="text-rose-500 font-semibold">Duplicate</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">Ready</span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Reorder Buttons */}
        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          <span className="text-zinc-400">Position #{index + 1}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-30"
            >
              Move Up
            </button>
            <button
              type="button"
              disabled={index === totalItems - 1}
              onClick={() => onMoveDown(index)}
              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 disabled:opacity-30"
            >
              Move Down
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
