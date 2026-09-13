'use client';

import React, { useState } from 'react';
import { ImageFileItem } from '@/lib/types';
import { FileRow } from './FileRow';
import { Layers, FolderOpen } from 'lucide-react';

interface FileListProps {
  items: ImageFileItem[];
  filteredItems: ImageFileItem[];
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onPreview: (item: ImageFileItem) => void;
}

export function FileList({
  items,
  filteredItems,
  onToggleSelect,
  onRemove,
  onReorder,
  onPreview,
}: FileListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or standard ghost image
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }
    onReorder(dragIndex, dropIndex);
    setDragIndex(null);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < items.length - 1) {
      onReorder(index, index + 1);
    }
  };

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-12 text-center">
        <FolderOpen className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          No matching images found
        </h4>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Try clearing your search query or upload new images.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#131722] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs overflow-hidden">
      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#181d2a] text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-3 w-16">Preview</th>
              <th className="py-3 px-3">Original Name</th>
              <th className="py-3 px-3">New Name</th>
              <th className="py-3 px-3 w-28">Size / Dim</th>
              <th className="py-3 px-3 w-24">Status</th>
              <th className="py-3 px-3 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {filteredItems.map((item, idx) => {
              // Find index in master items array for correct reorder positioning
              const masterIndex = items.findIndex((orig) => orig.id === item.id);
              return (
                <FileRow
                  key={item.id}
                  item={item}
                  index={masterIndex !== -1 ? masterIndex : idx}
                  totalItems={items.length}
                  onToggleSelect={onToggleSelect}
                  onRemove={onRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onPreview={onPreview}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  isDragging={dragIndex === (masterIndex !== -1 ? masterIndex : idx)}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden p-3 space-y-2.5">
        {filteredItems.map((item, idx) => {
          const masterIndex = items.findIndex((orig) => orig.id === item.id);
          return (
            <FileRow
              key={item.id}
              item={item}
              index={masterIndex !== -1 ? masterIndex : idx}
              totalItems={items.length}
              onToggleSelect={onToggleSelect}
              onRemove={onRemove}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onPreview={onPreview}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={false}
            />
          );
        })}
      </div>
    </div>
  );
}
