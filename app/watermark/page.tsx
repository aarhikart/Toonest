'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WatermarkConfig,
  WatermarkItem,
  DEFAULT_WATERMARK_CONFIG,
} from '@/lib/watermarkTypes';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { UploadZone } from '@/components/UploadZone';
import { ToastContainer } from '@/components/Toast';
import { ToastInfo } from '@/lib/types';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { Footer } from '@/components/Footer';

// Watermark specific components
import { WatermarkHero } from '@/components/watermark/WatermarkHero';
import { SingleWatermarkView } from '@/components/watermark/SingleWatermarkView';
import { BulkWatermarkView } from '@/components/watermark/BulkWatermarkView';
import { WatermarkFAQ } from '@/components/watermark/WatermarkFAQ';
import { WatermarkSEO } from '@/components/watermark/WatermarkSEO';
import { Image as ImageIcon, Images, Stamp, Plus, Trash2 } from 'lucide-react';

export default function WatermarkPage() {
  const [items, setItems] = useState<WatermarkItem[]>([]);
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const itemsRef = useRef<WatermarkItem[]>([]);
  itemsRef.current = items;

  // Helper to show toasts
  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cleanup object URLs when items change or unmount
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.watermarkedUrl) URL.revokeObjectURL(item.watermarkedUrl);
      });
      if (config.logoUrl) URL.revokeObjectURL(config.logoUrl);
    };
  }, [config.logoUrl]);

  // Handle uploaded files
  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const validFiles = files.filter((file) => file.type.startsWith('image/'));
      if (validFiles.length === 0) {
        addToast('Please upload valid image files (JPG, PNG, WebP, etc.)', 'error');
        return;
      }

      const newItems: WatermarkItem[] = await Promise.all(
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
            id: `wm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

  // Update specific item in queue
  const handleUpdateItem = useCallback((id: string, updates: Partial<WatermarkItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
  }, []);

  // Remove single item
  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
        if (target.watermarkedUrl) URL.revokeObjectURL(target.watermarkedUrl);
      }
      const next = prev.filter((i) => i.id !== id);
      if (next.length <= 1) setMode('single');
      return next;
    });
  }, []);

  // Clear all items
  const handleClearAll = useCallback(() => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.watermarkedUrl) URL.revokeObjectURL(item.watermarkedUrl);
    });
    setItems([]);
    setMode('single');
    addToast('Cleared all images', 'info');
  }, [items, addToast]);

  const handleConfigChange = useCallback((updated: Partial<WatermarkConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleResetConfig = useCallback(() => {
    setConfig(DEFAULT_WATERMARK_CONFIG);
    addToast('Reset watermark settings to defaults', 'info');
  }, [addToast]);

  const handleApplyPreset = useCallback(
    (presetConfig: Partial<WatermarkConfig>) => {
      setConfig((prev) => ({ ...prev, ...presetConfig }));
      addToast('Applied watermark preset', 'success');
    },
    [addToast]
  );

  const handlePositionChange = useCallback((xPercent: number, yPercent: number) => {
    setConfig((prev) => ({
      ...prev,
      position: 'custom',
      customXPercent: xPercent,
      customYPercent: yPercent,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0c10] text-zinc-900 dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#5722AF] selection:text-white">
      {/* Universal Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolName="Image Watermark Tool"
      />

      {/* Universal Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="watermark"
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Hero Section */}
        <WatermarkHero />

        {/* Upload Zone (always visible when 0 images, or can be toggled) */}
        {items.length === 0 ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <UploadZone onFilesSelected={handleFilesSelected} />
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              Supports JPG, PNG, WebP, AVIF, BMP, GIF • Paste images with Ctrl+V • No server upload
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mode Switcher Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                    Watermark Studio
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
                    {items.length} photo{items.length > 1 ? 's' : ''} loaded
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Drag and drop watermark on canvas, adjust opacity, tilt, and format.
                </p>
              </div>

              {/* Mode Segmented Control */}
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

            {/* Render Selected View */}
            {mode === 'single' ? (
              <SingleWatermarkView
                item={items[0]}
                config={config}
                onConfigChange={handleConfigChange}
                onResetConfig={handleResetConfig}
                onApplyPreset={handleApplyPreset}
                onPositionChange={handlePositionChange}
                onClear={handleClearAll}
                onAddMore={handleFilesSelected}
              />
            ) : (
              <BulkWatermarkView
                items={items}
                config={config}
                onConfigChange={handleConfigChange}
                onResetConfig={handleResetConfig}
                onApplyPreset={handleApplyPreset}
                onPositionChange={handlePositionChange}
                onClearAll={handleClearAll}
                onRemoveItem={handleRemoveItem}
                onAddMore={handleFilesSelected}
                onUpdateItem={handleUpdateItem}
              />
            )}
          </div>
        )}

        {/* Privacy & How It Works Sections */}
        <PrivacySection />

        {/* FAQ Section */}
        <WatermarkFAQ />

        {/* Informative SEO Section */}
        <WatermarkSEO />
      </main>

      {/* Universal Footer */}
      <Footer />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
