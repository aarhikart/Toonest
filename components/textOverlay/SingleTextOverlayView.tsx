'use client';

import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Plus,
  Layers,
  Sparkles,
  FileImage,
  Loader2,
  Check,
} from 'lucide-react';
import { TextLayer, TextOverlayConfig, TextOverlayItem } from '@/lib/textOverlayTypes';
import { processSingleTextOverlayItem } from '@/lib/textOverlayEngine';
import { formatBytes } from '@/lib/renameEngine';
import { TextOverlayCanvas } from './TextOverlayCanvas';
import { TextLayerList } from './TextLayerList';
import { TextLayerControls } from './TextLayerControls';

interface SingleTextOverlayViewProps {
  item: TextOverlayItem;
  config: TextOverlayConfig;
  onLayerChange: (layerId: string, updated: Partial<TextLayer>) => void;
  onConfigChange: (updated: Partial<TextOverlayConfig>) => void;
  onAddLayer: () => void;
  onDuplicateLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down') => void;
  onSelectLayer: (id: string) => void;
  onResetLayer: () => void;
  onApplyTemplate: (style: Partial<TextLayer>) => void;
  onClear: () => void;
  onAddMore: (files: File[]) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function SingleTextOverlayView({
  item,
  config,
  onLayerChange,
  onConfigChange,
  onAddLayer,
  onDuplicateLayer,
  onToggleVisibility,
  onDeleteLayer,
  onMoveLayer,
  onSelectLayer,
  onResetLayer,
  onApplyTemplate,
  onClear,
  onAddMore,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: SingleTextOverlayViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeLayer = config.layers.find((l) => l.id === config.activeLayerId) || config.layers[0] || null;

  const handleDownload = async () => {
    setIsProcessing(true);
    setDownloadSuccess(false);

    try {
      const processed = await processSingleTextOverlayItem(item, config, 1);
      if (processed.processedUrl && processed.processedBlob) {
        const link = document.createElement('a');
        link.href = processed.processedUrl;
        link.download = processed.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Details & Quick Action Bar */}
      <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/30 flex items-center justify-center text-[#5722AF] dark:text-[#9B6BE8] shrink-0">
            <FileImage className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
              {item.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              <span>{formatBytes(item.originalSize)}</span>
              <span>•</span>
              <span>{item.originalWidth} × {item.originalHeight} px</span>
              <span>•</span>
              <span className="uppercase">{item.file.type.replace('image/', '') || 'IMAGE'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <label
            htmlFor="single-overlay-add-more-input"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More</span>
          </label>
          <input
            id="single-overlay-add-more-input"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onAddMore(Array.from(e.target.files));
              }
            }}
            className="hidden"
          />

          <button
            type="button"
            onClick={onClear}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Remove</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#5722AF] hover:bg-[#471a93] active:scale-[0.98] text-white shadow-md shadow-[#5722AF]/25 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting Image...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Canvas Preview (7 cols) */}
        <div className="lg:col-span-7 h-[580px] sm:h-[660px]">
          <TextOverlayCanvas
            item={item}
            config={config}
            activeLayer={activeLayer}
            onLayerPositionChange={(layerId, xP, yP) =>
              onLayerChange(layerId, {
                position: 'custom',
                customXPercent: xP,
                customYPercent: yP,
              })
            }
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={onUndo}
            onRedo={onRedo}
          />
        </div>

        {/* Right Column: Layer List + Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <TextLayerList
            layers={config.layers}
            activeLayerId={config.activeLayerId}
            onSelectLayer={onSelectLayer}
            onAddLayer={onAddLayer}
            onDuplicateLayer={onDuplicateLayer}
            onToggleVisibility={onToggleVisibility}
            onDeleteLayer={onDeleteLayer}
            onMoveLayer={onMoveLayer}
          />

          <div className="h-[430px]">
            <TextLayerControls
              layer={activeLayer}
              config={config}
              onLayerChange={(updated) => {
                if (activeLayer) onLayerChange(activeLayer.id, updated);
              }}
              onConfigChange={onConfigChange}
              onApplyTemplate={onApplyTemplate}
              onResetLayer={onResetLayer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
