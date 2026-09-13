'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  RotateCw,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckSquare,
  Square,
  GripVertical,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { JpgImageItem } from '@/lib/jpgToPdfTypes';
import { formatFileSize } from '@/lib/jpgToPdfEngine';
import { JpgDropZone } from './JpgDropZone';

interface JpgImageListProps {
  items: JpgImageItem[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRotate: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
  onPreview: (item: JpgImageItem) => void;
  onAddFiles: (files: File[]) => void;
}

export function JpgImageList({
  items,
  onReorder,
  onRotate,
  onRemove,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onRemoveSelected,
  onClearAll,
  onPreview,
  onAddFiles,
}: JpgImageListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const selectedCount = items.filter((i) => i.selected).length;
  const isAllSelected = items.length > 0 && selectedCount === items.length;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header with Title & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
            Images Queue ({items.length} {items.length === 1 ? 'image' : 'images'})
          </h3>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
            • {items.length} PDF pages
          </span>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-2">
          <JpgDropZone onAddFiles={onAddFiles} compact={true} />

          <button
            type="button"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="text-xs font-semibold px-2.5 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onRemoveSelected}
              className="text-xs font-semibold px-2.5 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
            >
              Remove Selected ({selectedCount})
            </button>
          )}

          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold px-2.5 py-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Reorder Hint */}
      <div className="text-[11px] text-zinc-400 flex items-center justify-between px-1">
        <span>Drag cards to reorder or use the arrow controls. Page order in PDF matches sequence.</span>
        <span className="font-mono text-zinc-500">1 to {items.length}</span>
      </div>

      {/* Image Cards List */}
      <div className="space-y-2">
        {items.map((item, index) => {
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDragging
                  ? 'opacity-40 border-dashed border-[#5722AF] bg-purple-50/20'
                  : isOver
                  ? 'border-[#5722AF] ring-2 ring-[#5722AF]/20 scale-[1.01] bg-[#5722AF]/5'
                  : item.selected
                  ? 'border-[#5722AF]/40 bg-purple-50/20 dark:bg-purple-950/10'
                  : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              {/* Left Section: Drag Handle, Checkbox, Thumbnail, Details */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Drag Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-200"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleSelect(item.id)}
                  className="text-zinc-400 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] cursor-pointer"
                >
                  {item.selected ? (
                    <CheckSquare className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Page Number Badge */}
                <div className="w-6 h-6 rounded-lg bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-[#9B6BE8] font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </div>

                {/* Thumbnail with Click-to-Preview */}
                <div
                  onClick={() => onPreview(item)}
                  className="relative w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 overflow-hidden shrink-0 cursor-pointer group/thumb shadow-2xs"
                >
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>

                {/* Metadata details */}
                <div className="min-w-0 space-y-0.5">
                  <div
                    onClick={() => onPreview(item)}
                    className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate cursor-pointer hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
                  >
                    {item.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-2">
                    <span className="font-mono">
                      {item.rotation === 90 || item.rotation === 270
                        ? `${item.height} × ${item.width}`
                        : `${item.width} × ${item.height}`}{' '}
                      px
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(item.size)}</span>
                    <span>•</span>
                    <span className="uppercase text-zinc-400 font-semibold">JPG</span>
                    {item.rotation > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#5722AF] dark:text-[#9B6BE8] font-semibold">
                          Rotated {item.rotation}°
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section: Action Controls */}
              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                {/* Rotate 90 deg */}
                <button
                  type="button"
                  onClick={() => onRotate(item.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Move Up */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onReorder(index, index - 1)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Move page earlier"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => onReorder(index, index + 1)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Move page later"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Preview */}
                <button
                  type="button"
                  onClick={() => onPreview(item)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Preview original image"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Remove from PDF"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
