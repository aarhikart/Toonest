'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  SocialMediaConfig,
  SocialMediaItem,
  SocialMediaPreset,
  CropSettings,
  DEFAULT_SOCIAL_MEDIA_CONFIG,
  DEFAULT_CROP_SETTINGS,
} from '@/lib/socialMediaTypes';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { UploadZone } from '@/components/UploadZone';
import { ToastContainer } from '@/components/Toast';
import { ToastInfo } from '@/lib/types';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { Footer } from '@/components/Footer';

// Social Resizer specific components
import { SocialResizerHero } from '@/components/socialResizer/SocialResizerHero';
import { SingleSocialResizerView } from '@/components/socialResizer/SingleSocialResizerView';
import { BulkSocialResizerView } from '@/components/socialResizer/BulkSocialResizerView';
import { SocialResizerFAQ } from '@/components/socialResizer/SocialResizerFAQ';
import { SocialResizerSEO } from '@/components/socialResizer/SocialResizerSEO';
import { Image as ImageIcon, Images, Share2 } from 'lucide-react';
import { getPresetById } from '@/lib/socialMediaPresets';

export default function SocialMediaImageResizerPage() {
  const [items, setItems] = useState<SocialMediaItem[]>([]);
  const [config, setConfig] = useState<SocialMediaConfig>(DEFAULT_SOCIAL_MEDIA_CONFIG);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const itemsRef = useRef<SocialMediaItem[]>([]);
  itemsRef.current = items;

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

  // File selection
  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const validFiles = files.filter((file) => file.type.startsWith('image/'));
      if (validFiles.length === 0) {
        addToast('Please upload valid image files (JPG, PNG, WebP, AVIF, etc.)', 'error');
        return;
      }

      const newItems: SocialMediaItem[] = await Promise.all(
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

  // Preset & Sizing actions
  const handleSelectPreset = useCallback(
    (preset: SocialMediaPreset) => {
      setConfig((prev) => ({
        ...prev,
        presetId: preset.id,
        customWidth: preset.width,
        customHeight: preset.height,
      }));
      addToast(`Selected ${preset.name} (${preset.width} × ${preset.height})`, 'success');
    },
    [addToast]
  );

  const handleCustomSizeChange = useCallback(
    (width: number, height: number, unit: 'px' | 'percent') => {
      setConfig((prev) => ({
        ...prev,
        presetId: 'custom',
        customWidth: width,
        customHeight: height,
        customUnit: unit,
      }));
    },
    []
  );

  const handleCropChange = useCallback((updated: Partial<CropSettings>) => {
    setConfig((prev) => ({
      ...prev,
      cropSettings: {
        ...prev.cropSettings,
        ...updated,
      },
    }));
  }, []);

  const handleResetCrop = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      cropSettings: DEFAULT_CROP_SETTINGS,
    }));
    addToast('Reset crop settings to defaults', 'info');
  }, [addToast]);

  const handleConfigChange = useCallback((updated: Partial<SocialMediaConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleApplySettingsToAll = useCallback(() => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        customCropSettings: undefined,
        hasCustomCrop: false,
        status: 'idle',
      }))
    );
    const preset = getPresetById(config.presetId);
    addToast(`Applied ${preset.name} settings across all images`, 'success');
  }, [config.presetId, addToast]);

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

  const handleUpdateItem = useCallback((id: string, updates: Partial<SocialMediaItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0c10] text-zinc-900 dark:text-white flex flex-col font-sans transition-colors duration-200 selection:bg-[#5722AF] selection:text-white">
      {/* Universal Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolName="Social Media Resizer"
      />

      {/* Universal Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="social-media-resizer"
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Hero Section */}
        <SocialResizerHero />

        {/* Upload Zone (shown when 0 images loaded) */}
        {items.length === 0 ? (
          <div className="max-w-3xl mx-auto space-y-4">
            <UploadZone onFilesSelected={handleFilesSelected} />
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              Supports JPG, PNG, WebP, AVIF • Paste images with Ctrl+V • No server upload
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Mode Switcher Segmented Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                    Social Media Resizer Studio
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8]">
                    {items.length} photo{items.length > 1 ? 's' : ''} loaded
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select social platform presets, adjust interactive crops, and export official dimensions.
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
              <SingleSocialResizerView
                item={items[0]}
                config={config}
                onConfigChange={handleConfigChange}
                onSelectPreset={handleSelectPreset}
                onCustomSizeChange={handleCustomSizeChange}
                onCropChange={handleCropChange}
                onResetCrop={handleResetCrop}
                onClear={handleClearAll}
                onAddMore={handleFilesSelected}
              />
            ) : (
              <BulkSocialResizerView
                items={items}
                config={config}
                onConfigChange={handleConfigChange}
                onSelectPreset={handleSelectPreset}
                onCustomSizeChange={handleCustomSizeChange}
                onCropChange={handleCropChange}
                onResetCrop={handleResetCrop}
                onClearAll={handleClearAll}
                onRemoveItem={handleRemoveItem}
                onAddMore={handleFilesSelected}
                onUpdateItem={handleUpdateItem}
                onApplySettingsToAll={handleApplySettingsToAll}
              />
            )}
          </div>
        )}

        {/* Privacy Section */}
        <PrivacySection />

        {/* FAQ Section */}
        <SocialResizerFAQ />

        {/* SEO Guide Section */}
        <SocialResizerSEO />
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
