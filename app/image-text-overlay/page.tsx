'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TextLayer,
  TextOverlayConfig,
  TextOverlayItem,
  DEFAULT_TEXT_OVERLAY_CONFIG,
  DEFAULT_TEXT_LAYER,
} from '@/lib/textOverlayTypes';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { UploadZone } from '@/components/UploadZone';
import { ToastContainer } from '@/components/Toast';
import { ToastInfo } from '@/lib/types';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { Footer } from '@/components/Footer';

// Text Overlay specific components
import { TextOverlayHero } from '@/components/textOverlay/TextOverlayHero';
import { SingleTextOverlayView } from '@/components/textOverlay/SingleTextOverlayView';
import { BulkTextOverlayView } from '@/components/textOverlay/BulkTextOverlayView';
import { TextOverlayFAQ } from '@/components/textOverlay/TextOverlayFAQ';
import { TextOverlaySEO } from '@/components/textOverlay/TextOverlaySEO';
import { Image as ImageIcon, Images, Type } from 'lucide-react';

export default function ImageTextOverlayPage() {
  const [items, setItems] = useState<TextOverlayItem[]>([]);
  const [config, setConfig] = useState<TextOverlayConfig>(DEFAULT_TEXT_OVERLAY_CONFIG);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Undo / Redo history state
  const [history, setHistory] = useState<TextOverlayConfig[]>([DEFAULT_TEXT_OVERLAY_CONFIG]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const itemsRef = useRef<TextOverlayItem[]>([]);
  itemsRef.current = items;

  // Helper to record history snapshot
  const recordHistory = useCallback(
    (newConfig: TextOverlayConfig) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const updated = [...sliced, newConfig];
        if (updated.length > 30) updated.shift();
        return updated;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [historyIndex]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevConfig = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setConfig(prevConfig);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextConfig = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setConfig(nextConfig);
    }
  }, [history, historyIndex]);

  // Toast Helpers
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
      });
    };
  }, []);

  // Upload handler
  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const validFiles = files.filter((file) => file.type.startsWith('image/'));
      if (validFiles.length === 0) {
        addToast('Please upload valid image files (JPG, PNG, WebP, AVIF, etc.)', 'error');
        return;
      }

      const newItems: TextOverlayItem[] = await Promise.all(
        validFiles.map(async (file) => {
          const previewUrl = URL.createObjectURL(file);
          const { width, height } = await new Promise<{ width: number; height: number }>(
            (resolve) => {
              const img = new Image();
              img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
              img.onerror = () => resolve({ width: 1200, height: 800 });
              img.src = previewUrl;
            }
          );

          return {
            id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            name: file.name,
            originalSize: file.size,
            originalWidth: width,
            originalHeight: height,
            previewUrl,
            status: 'idle',
          };
        })
      );

      setItems((prev) => {
        const next = [...prev, ...newItems];
        if (next.length > 1) {
          setMode('bulk');
        } else {
          setMode('single');
        }
        return next;
      });

      addToast(
        newItems.length === 1
          ? `Loaded ${newItems[0].name}`
          : `Added ${newItems.length} images to queue`,
        'success'
      );
    },
    [addToast]
  );

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        handleFilesSelected(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFilesSelected]);

  // Layer Operations
  const handleLayerChange = useCallback(
    (layerId: string, updated: Partial<TextLayer>) => {
      setConfig((prev) => {
        const nextLayers = prev.layers.map((l) => (l.id === layerId ? { ...l, ...updated } : l));
        const nextConfig = { ...prev, layers: nextLayers };
        recordHistory(nextConfig);
        return nextConfig;
      });
    },
    [recordHistory]
  );

  const handleConfigChange = useCallback((updated: Partial<TextOverlayConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleAddLayer = useCallback(() => {
    setConfig((prev) => {
      const newId = `layer-${Date.now()}`;
      const newLayer: TextLayer = {
        ...DEFAULT_TEXT_LAYER,
        id: newId,
        name: `Text Layer ${prev.layers.length + 1}`,
        text: 'New Headline Text',
        position: 'center',
        customXPercent: 50,
        customYPercent: Math.min(85, 30 + prev.layers.length * 12),
        rotation: 0,
        isVisible: true,
      };
      const nextConfig = {
        ...prev,
        layers: [...prev.layers, newLayer],
        activeLayerId: newId,
      };
      recordHistory(nextConfig);
      return nextConfig;
    });
    addToast('Added new text layer', 'success');
  }, [recordHistory, addToast]);

  const handleDuplicateLayer = useCallback(
    (id: string) => {
      setConfig((prev) => {
        const source = prev.layers.find((l) => l.id === id);
        if (!source) return prev;
        const newId = `layer-${Date.now()}`;
        const copy: TextLayer = {
          ...source,
          id: newId,
          name: `${source.name} (Copy)`,
          customXPercent: Math.min(90, source.customXPercent + 4),
          customYPercent: Math.min(90, source.customYPercent + 4),
        };
        const nextConfig = {
          ...prev,
          layers: [...prev.layers, copy],
          activeLayerId: newId,
        };
        recordHistory(nextConfig);
        return nextConfig;
      });
      addToast('Duplicated layer', 'info');
    },
    [recordHistory, addToast]
  );

  const handleToggleVisibility = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l)),
    }));
  }, []);

  const handleDeleteLayer = useCallback(
    (id: string) => {
      setConfig((prev) => {
        if (prev.layers.length <= 1) return prev;
        const nextLayers = prev.layers.filter((l) => l.id !== id);
        const nextActiveId = prev.activeLayerId === id ? nextLayers[0]?.id || null : prev.activeLayerId;
        const nextConfig = { ...prev, layers: nextLayers, activeLayerId: nextActiveId };
        recordHistory(nextConfig);
        return nextConfig;
      });
      addToast('Deleted layer', 'info');
    },
    [recordHistory, addToast]
  );

  const handleMoveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    setConfig((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= prev.layers.length) return prev;
      const copy = [...prev.layers];
      const [removed] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, removed);
      return { ...prev, layers: copy };
    });
  }, []);

  const handleSelectLayer = useCallback((id: string) => {
    setConfig((prev) => ({ ...prev, activeLayerId: id }));
  }, []);

  const handleResetLayer = useCallback(() => {
    setConfig((prev) => {
      if (!prev.activeLayerId) return prev;
      const nextLayers = prev.layers.map((l) =>
        l.id === prev.activeLayerId ? { ...DEFAULT_TEXT_LAYER, id: l.id, name: l.name } : l
      );
      const nextConfig = { ...prev, layers: nextLayers };
      recordHistory(nextConfig);
      return nextConfig;
    });
    addToast('Reset active layer styles', 'info');
  }, [recordHistory, addToast]);

  const handleApplyTemplate = useCallback(
    (style: Partial<TextLayer>) => {
      setConfig((prev) => {
        if (!prev.activeLayerId) return prev;
        const nextLayers = prev.layers.map((l) =>
          l.id === prev.activeLayerId ? { ...l, ...style } : l
        );
        const nextConfig = { ...prev, layers: nextLayers };
        recordHistory(nextConfig);
        return nextConfig;
      });
      addToast('Applied text style', 'success');
    },
    [recordHistory, addToast]
  );

  // Queue item actions
  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.processedUrl) URL.revokeObjectURL(target.processedUrl);
      }
      const next = prev.filter((i) => i.id !== id);
      if (next.length <= 1) setMode('single');
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
    });
    setItems([]);
    setMode('single');
    addToast('Cleared all images', 'info');
  }, [items, addToast]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<TextOverlayItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0c10] text-zinc-900 dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#5722AF] selection:text-white">
      {/* ToolNest Universal Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolName="Image Text Overlay"
      />

      {/* ToolNest Universal Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="image-text-overlay"
      />

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Hero Section */}
        <TextOverlayHero />

        {/* Upload Zone (shown when 0 images) */}
        {items.length === 0 ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <UploadZone onFilesSelected={handleFilesSelected} />
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              Supports JPG, PNG, WebP, AVIF • Paste images with Ctrl+V • Multiple layers & bulk ZIP export
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mode Switcher Segmented Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                    Text Overlay Studio
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
                    {items.length} photo{items.length > 1 ? 's' : ''} loaded
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Drag text directly on preview, add multiple typography layers, and export high-resolution graphics.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#161a26] p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'single'
                      ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Single Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('bulk')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'bulk'
                      ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Images className="w-3.5 h-3.5" />
                  <span>Bulk Studio ({items.length})</span>
                </button>
              </div>
            </div>

            {/* Workspace View */}
            {mode === 'single' ? (
              <SingleTextOverlayView
                item={items[0]}
                config={config}
                onLayerChange={handleLayerChange}
                onConfigChange={handleConfigChange}
                onAddLayer={handleAddLayer}
                onDuplicateLayer={handleDuplicateLayer}
                onToggleVisibility={handleToggleVisibility}
                onDeleteLayer={handleDeleteLayer}
                onMoveLayer={handleMoveLayer}
                onSelectLayer={handleSelectLayer}
                onResetLayer={handleResetLayer}
                onApplyTemplate={handleApplyTemplate}
                onClear={handleClearAll}
                onAddMore={handleFilesSelected}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            ) : (
              <BulkTextOverlayView
                items={items}
                config={config}
                onLayerChange={handleLayerChange}
                onConfigChange={handleConfigChange}
                onAddLayer={handleAddLayer}
                onDuplicateLayer={handleDuplicateLayer}
                onToggleVisibility={handleToggleVisibility}
                onDeleteLayer={handleDeleteLayer}
                onMoveLayer={handleMoveLayer}
                onSelectLayer={handleSelectLayer}
                onResetLayer={handleResetLayer}
                onApplyTemplate={handleApplyTemplate}
                onClearAll={handleClearAll}
                onRemoveItem={handleRemoveItem}
                onAddMore={handleFilesSelected}
                onUpdateItem={handleUpdateItem}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
            )}
          </div>
        )}

        {/* Privacy Section */}
        <PrivacySection />

        {/* FAQ Section */}
        <TextOverlayFAQ />

        {/* SEO Guide */}
        <TextOverlaySEO />
      </main>

      {/* Footer */}
      <Footer />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
