'use client';

import React from 'react';
import {
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Type,
} from 'lucide-react';
import { TextLayer, DEFAULT_TEXT_LAYER } from '@/lib/textOverlayTypes';

interface TextLayerListProps {
  layers: TextLayer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDuplicateLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
}

export function TextLayerList({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onDuplicateLayer,
  onToggleVisibility,
  onDeleteLayer,
  onMoveLayer,
}: TextLayerListProps) {
  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-3.5 sm:p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Text Layers ({layers.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onAddLayer}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5722AF] hover:bg-[#471a93] text-white shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Text</span>
        </button>
      </div>

      {/* Layer items list (rendered top-to-bottom: higher index = top layer) */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
        {layers.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-400">
            No text layers added. Click &quot;+ Add Text&quot; to create one.
          </div>
        ) : (
          [...layers].reverse().map((layer, reversedIndex) => {
            const actualIndex = layers.length - 1 - reversedIndex;
            const isActive = layer.id === activeLayerId;
            const canMoveUp = actualIndex < layers.length - 1;
            const canMoveDown = actualIndex > 0;

            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`group flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/15 shadow-2xs text-zinc-900 dark:text-white'
                    : 'border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {/* Left: Visibility toggle & text preview */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer.id);
                    }}
                    title={layer.isVisible ? 'Hide layer' : 'Show layer'}
                    className={`p-1 rounded-lg transition-colors ${
                      layer.isVisible
                        ? 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
                        : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                  >
                    {layer.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">
                        {layer.name || `Text Layer ${actualIndex + 1}`}
                      </span>
                      {isActive && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#5722AF] text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-mono">
                      &quot;{layer.text || 'Empty'}&quot;
                    </p>
                  </div>
                </div>

                {/* Right: Layer actions (Move Up/Down, Duplicate, Delete) */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={!canMoveUp}
                    onClick={() => onMoveLayer(layer.id, 'up')}
                    title="Bring forward"
                    className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={!canMoveDown}
                    onClick={() => onMoveLayer(layer.id, 'down')}
                    title="Send backward"
                    className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateLayer(layer.id)}
                    title="Duplicate layer"
                    className="p-1 rounded text-zinc-400 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={layers.length <= 1}
                    onClick={() => onDeleteLayer(layer.id)}
                    title="Delete layer"
                    className="p-1 rounded text-zinc-400 hover:text-red-500 disabled:opacity-20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
