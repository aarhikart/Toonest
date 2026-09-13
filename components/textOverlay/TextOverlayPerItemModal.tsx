'use client';

import React, { useState } from 'react';
import { X, Check, Undo2, Sliders, Layers } from 'lucide-react';
import { TextLayer, TextOverlayConfig, TextOverlayItem } from '@/lib/textOverlayTypes';
import { TextOverlayCanvas } from './TextOverlayCanvas';
import { TextLayerList } from './TextLayerList';
import { TextLayerControls } from './TextLayerControls';

interface TextOverlayPerItemModalProps {
  isOpen: boolean;
  item: TextOverlayItem | null;
  baseConfig: TextOverlayConfig;
  onClose: () => void;
  onSaveCustomConfig: (itemId: string, customLayers: TextLayer[] | null) => void;
}

export function TextOverlayPerItemModal({
  isOpen,
  item,
  baseConfig,
  onClose,
  onSaveCustomConfig,
}: TextOverlayPerItemModalProps) {
  if (!isOpen || !item) return null;

  // Local state for this item's custom layers
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [localLayers, setLocalLayers] = useState<TextLayer[]>(
    item.customLayers ? [...item.customLayers] : baseConfig.layers.map((l) => ({ ...l }))
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [activeLayerId, setActiveLayerId] = useState<string | null>(
    localLayers[0]?.id || null
  );

  const activeLayer = localLayers.find((l) => l.id === activeLayerId) || localLayers[0] || null;

  const handleLayerChange = (updated: Partial<TextLayer>) => {
    if (!activeLayer) return;
    setLocalLayers((prev) =>
      prev.map((l) => (l.id === activeLayer.id ? { ...l, ...updated } : l))
    );
  };

  const handleAddLayer = () => {
    const newId = `layer-${Date.now()}`;
    const newLayer: TextLayer = {
      ...localLayers[0],
      id: newId,
      name: `Text Layer ${localLayers.length + 1}`,
      text: 'New Text Layer',
      position: 'center',
      customXPercent: 50,
      customYPercent: 50,
      rotation: 0,
      isVisible: true,
    };
    setLocalLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newId);
  };

  const handleDuplicateLayer = (id: string) => {
    const source = localLayers.find((l) => l.id === id);
    if (!source) return;
    const newId = `layer-${Date.now()}`;
    const copy: TextLayer = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      customXPercent: Math.min(90, source.customXPercent + 4),
      customYPercent: Math.min(90, source.customYPercent + 4),
    };
    setLocalLayers((prev) => [...prev, copy]);
    setActiveLayerId(newId);
  };

  const handleToggleVisibility = (id: string) => {
    setLocalLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l))
    );
  };

  const handleDeleteLayer = (id: string) => {
    if (localLayers.length <= 1) return;
    setLocalLayers((prev) => {
      const next = prev.filter((l) => l.id !== id);
      if (activeLayerId === id) {
        setActiveLayerId(next[0]?.id || null);
      }
      return next;
    });
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    setLocalLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, removed);
      return copy;
    });
  };

  const handleApply = () => {
    onSaveCustomConfig(item.id, localLayers);
    onClose();
  };

  const handleResetToBulkDefaults = () => {
    onSaveCustomConfig(item.id, null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[92vh] max-h-[880px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/80 dark:bg-[#0d1017]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/30 flex items-center justify-center text-[#5722AF] dark:text-[#9B6BE8] shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                Customize Text Overlays: {item.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Override global layers specifically for this image.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Canvas on Left (7 cols) */}
          <div className="lg:col-span-7 h-full p-4 overflow-y-auto bg-zinc-100/50 dark:bg-zinc-950/40 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            <TextOverlayCanvas
              item={item}
              config={{
                ...baseConfig,
                layers: localLayers,
              }}
              activeLayer={activeLayer}
              onLayerPositionChange={(layerId, xP, yP) => {
                setLocalLayers((prev) =>
                  prev.map((l) =>
                    l.id === layerId
                      ? {
                          ...l,
                          position: 'custom',
                          customXPercent: xP,
                          customYPercent: yP,
                        }
                      : l
                  )
                );
              }}
            />
          </div>

          {/* Controls on Right (5 cols) */}
          <div className="lg:col-span-5 h-full overflow-y-auto p-4 flex flex-col space-y-4">
            <TextLayerList
              layers={localLayers}
              activeLayerId={activeLayerId}
              onSelectLayer={setActiveLayerId}
              onAddLayer={handleAddLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onToggleVisibility={handleToggleVisibility}
              onDeleteLayer={handleDeleteLayer}
              onMoveLayer={handleMoveLayer}
            />

            <div className="flex-1 min-h-[360px]">
              <TextLayerControls
                layer={activeLayer}
                config={baseConfig}
                onLayerChange={handleLayerChange}
                onConfigChange={() => {}}
                onApplyTemplate={(tmpl) => handleLayerChange(tmpl)}
                onResetLayer={() => handleLayerChange({ ...baseConfig.layers[0] })}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#0d1017] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToBulkDefaults}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Reset to Global Bulk Settings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5722AF] hover:bg-[#471a93] text-white shadow-md shadow-[#5722AF]/25 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Custom Override</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
