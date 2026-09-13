'use client';

import React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { ShadowLayer } from '@/lib/boxShadow/shadowTypes';
import { formatSingleShadow } from '@/lib/boxShadow/shadowEngine';

interface ShadowLayerListProps {
  layers: ShadowLayer[];
  selectedLayerId: string;
  onSelectLayer: (id: string) => void;
  onAddLayer: () => void;
  onDuplicateLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onToggleLayerEnabled: (id: string) => void;
  onMoveLayer: (fromIndex: number, toIndex: number) => void;
}

export function ShadowLayerList({
  layers,
  selectedLayerId,
  onSelectLayer,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onToggleLayerEnabled,
  onMoveLayer,
}: ShadowLayerListProps) {
  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Shadow Layers ({layers.length}/10)</span>
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Combine multiple layers for realistic optical depth
          </p>
        </div>

        {layers.length < 10 && (
          <button
            type="button"
            onClick={onAddLayer}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] hover:bg-[#5722AF]/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Layer</span>
          </button>
        )}
      </div>

      {/* Layer List Cards */}
      <div className="space-y-2">
        {layers.map((layer, index) => {
          const isSelected = layer.id === selectedLayerId;
          const singleShadow = formatSingleShadow(layer);

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#5722AF] bg-[#5722AF]/5 dark:bg-[#5722AF]/10 shadow-xs'
                  : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 hover:border-zinc-300'
              } ${!layer.enabled ? 'opacity-50' : ''}`}
            >
              {/* Left: Swatch + Label */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Visual Swatch */}
                <div
                  className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shrink-0"
                  style={{
                    boxShadow: layer.enabled ? singleShadow : 'none',
                  }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      Layer {index + 1}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        layer.inset
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                      }`}
                    >
                      {layer.inset ? 'Inset' : 'Outer'}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-zinc-500 truncate">
                    {layer.offsetX}px {layer.offsetY}px {layer.blur}px {layer.spread}px • {layer.opacity}%
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div
                className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Move Up */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => onMoveLayer(index, index - 1)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    title="Move Layer Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Move Down */}
                {index < layers.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onMoveLayer(index, index + 1)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    title="Move Layer Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Enable / Disable Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleLayerEnabled(layer.id)}
                  className={`p-1 rounded transition-colors ${
                    layer.enabled
                      ? 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      : 'text-zinc-300 dark:text-zinc-600'
                  }`}
                  title={layer.enabled ? 'Disable Layer' : 'Enable Layer'}
                >
                  {layer.enabled ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Duplicate */}
                {layers.length < 10 && (
                  <button
                    type="button"
                    onClick={() => onDuplicateLayer(layer.id)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    title="Duplicate Layer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Delete */}
                {layers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteLayer(layer.id)}
                    className="p-1 rounded text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
