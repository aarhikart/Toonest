'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ImageFormat,
  ConversionSettings,
  ConvertFileItem,
  ConversionStats,
} from '@/lib/converterTypes';
import {
  parseFileName,
  formatBytes,
  getImageDimensions,
} from '@/lib/renameEngine';
import {
  convertSingleImage,
  generateConvertedFilename,
  deduplicateFilenames,
  loadImage,
  detectTransparency,
} from '@/lib/conversionEngine';
import { downloadFilesAsZip } from '@/lib/zipUtils';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { UploadZone } from '@/components/UploadZone';
import { ToastContainer } from '@/components/Toast';
import { ToastInfo } from '@/lib/types';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

// Converter specific components
import { ConverterHero } from '@/components/converter/ConverterHero';
import { ModeSelector, ConverterMode } from '@/components/converter/ModeSelector';
import { FormatSelector } from '@/components/converter/FormatSelector';
import { FormatSpecificSettings } from '@/components/converter/FormatSpecificSettings';
import { TransformSettings } from '@/components/converter/TransformSettings';
import { NamingSettings } from '@/components/converter/NamingSettings';
import { SingleImageView } from '@/components/converter/SingleImageView';
import { BulkImageView } from '@/components/converter/BulkImageView';
import { ConverterFAQ } from '@/components/converter/ConverterFAQ';
import { ConverterSEO } from '@/components/converter/ConverterSEO';
import { Plus, Images, RefreshCw } from 'lucide-react';

const DEFAULT_CONVERSION_SETTINGS: ConversionSettings = {
  targetFormat: 'webp',
  quality: 85,
  preset: 'balanced',
  jpegProgressive: true,
  pngCompression: 'optimal',
  webpLossless: false,
  removeMetadata: true,
  backgroundColor: '#FFFFFF',
  resize: {
    enabled: false,
    maintainAspectRatio: true,
    method: 'fit',
  },
  crop: {
    enabled: false,
    preset: 'free',
  },
  transform: {
    rotate: 0,
    flipH: false,
    flipV: false,
  },
  naming: {
    mode: 'original',
    prefix: '',
    suffix: '',
    customName: '',
    startNumber: 1,
    numberPadding: 3,
  },
};

export default function ConverterPage() {
  const [mode, setMode] = useState<ConverterMode>('single');
  const [items, setItems] = useState<ConvertFileItem[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>(
    DEFAULT_CONVERSION_SETTINGS
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Conversion state
  const [isConverting, setIsConverting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [cancelRequested, setCancelRequested] = useState(false);

  // Toast helper
  const showToast = useCallback((toast: Omit<ToastInfo, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastInfo = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Clipboard Paste listener for pasting images directly
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.files.length; i++) {
        const file = e.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        handleFilesSelected(files);
        showToast({
          type: 'success',
          title: 'Pasted from Clipboard',
          message: `Loaded ${files.length} image from clipboard.`,
        });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [items]);

  // Handle uploaded or dropped files
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const newItems: ConvertFileItem[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const { baseName, extension } = parseFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      const id = `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`;

      const item: ConvertFileItem = {
        id,
        file,
        previewUrl,
        originalName: file.name,
        originalBaseName: baseName,
        originalExtension: extension,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        originalFormat: extension || file.type.replace('image/', ''),
        hasTransparency: false,
        targetFormat: settings.targetFormat,
        targetName: `${baseName}.${settings.targetFormat}`,
        status: 'idle',
        selected: false,
      };

      newItems.push(item);

      // Async dimension and transparency detection
      getImageDimensions(previewUrl).then(async (dims) => {
        let hasAlpha = false;
        try {
          const img = await loadImage(previewUrl);
          hasAlpha = detectTransparency(img);
        } catch (e) {}

        setItems((current) =>
          current.map((it) =>
            it.id === id
              ? {
                  ...it,
                  originalWidth: dims.width,
                  originalHeight: dims.height,
                  hasTransparency: hasAlpha,
                }
              : it
          )
        );
      });
    }

    // If single mode and we had no files, keep single. If multiple files dropped, switch to bulk
    if (mode === 'single' && (items.length > 0 || newFiles.length > 1)) {
      setMode('bulk');
    }

    setItems((prev) => [...prev, ...newItems]);
    showToast({
      type: 'success',
      title: 'Images Ready',
      message: `Added ${newFiles.length} image${newFiles.length > 1 ? 's' : ''} to converter.`,
    });
  };

  // Switch format
  const handleFormatChange = (fmt: ImageFormat) => {
    let newQuality = settings.quality;
    let newPreset = settings.preset;

    if (fmt === 'jpg' && settings.quality > 90) newQuality = 90;
    if (fmt === 'webp' && settings.preset === 'balanced') newQuality = 85;
    if (fmt === 'avif' && settings.preset === 'balanced') newQuality = 80;

    const updated = {
      ...settings,
      targetFormat: fmt,
      quality: newQuality,
      preset: newPreset,
    };
    setSettings(updated);

    // Update targetName on items
    setItems((prev) =>
      prev.map((it, idx) => ({
        ...it,
        targetFormat: fmt,
        targetName: generateConvertedFilename(it, idx, updated),
      }))
    );
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
      }
      return prev.filter((it) => it.id !== id);
    });
  };

  // Remove selected
  const handleRemoveSelected = () => {
    const count = items.filter((it) => it.selected).length;
    if (count === 0) return;

    setItems((prev) => {
      prev.forEach((it) => {
        if (it.selected) {
          URL.revokeObjectURL(it.previewUrl);
          if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl);
        }
      });
      return prev.filter((it) => !it.selected);
    });

    showToast({
      type: 'info',
      title: 'Removed',
      message: `Removed ${count} selected images.`,
    });
  };

  // Clear all
  const handleClearAll = () => {
    items.forEach((it) => {
      URL.revokeObjectURL(it.previewUrl);
      if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl);
    });
    setItems([]);
    showToast({
      type: 'info',
      title: 'Cleared',
      message: 'All images cleared from memory.',
    });
  };

  // Reorder items
  const handleReorder = (startIndex: number, endIndex: number) => {
    const updated = Array.from(items);
    const [moved] = updated.splice(startIndex, 1);
    updated.splice(endIndex, 0, moved);
    setItems(updated);
  };

  // Sort items
  const handleSort = (type: 'name' | 'size' | 'format') => {
    const sorted = [...items].sort((a, b) => {
      if (type === 'name') {
        return a.originalName.localeCompare(b.originalName, undefined, {
          numeric: true,
        });
      }
      if (type === 'size') {
        return b.originalSize - a.originalSize;
      }
      if (type === 'format') {
        return a.originalFormat.localeCompare(b.originalFormat);
      }
      return 0;
    });
    setItems(sorted);
  };

  // Per-file target format override
  const handleOverrideItemFormat = (id: string, format: ImageFormat) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              targetFormat: format,
              targetName: `${it.originalBaseName}.${format}`,
            }
          : it
      )
    );
  };

  // Single Image Conversion
  const handleConvertSingle = async () => {
    if (items.length === 0) return;
    const target = items[0];

    try {
      setIsConverting(true);
      const res = await convertSingleImage(target, settings);
      const targetName = generateConvertedFilename(target, 0, settings);

      setItems((prev) =>
        prev.map((it) =>
          it.id === target.id
            ? {
                ...it,
                status: 'completed',
                convertedBlob: res.blob,
                convertedUrl: res.url,
                convertedSize: res.size,
                convertedWidth: res.width,
                convertedHeight: res.height,
                targetName,
              }
            : it
        )
      );

      showToast({
        type: 'success',
        title: 'Converted Successfully',
        message: `Converted ${target.originalName} to ${settings.targetFormat.toUpperCase()}.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Conversion Failed',
        message: err?.message || 'Unable to convert this image in browser.',
      });
    } finally {
      setIsConverting(false);
    }
  };

  // Download Single Image
  const handleDownloadSingle = (item: ConvertFileItem) => {
    if (!item.convertedUrl) return;
    const link = document.createElement('a');
    link.href = item.convertedUrl;
    link.download = item.targetName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Conversion Pipeline
  const handleConvertAll = async () => {
    if (items.length === 0) return;
    setIsConverting(true);
    setCancelRequested(false);
    setProgressPercent(0);
    setCompletedCount(0);

    const updated = [...items];
    const rawNames = updated.map((it, idx) =>
      generateConvertedFilename(it, idx, {
        ...settings,
        targetFormat: it.targetFormat || settings.targetFormat,
      })
    );
    const uniqueNames = deduplicateFilenames(rawNames);

    for (let i = 0; i < updated.length; i++) {
      if (cancelRequested) {
        showToast({
          type: 'warning',
          title: 'Cancelled',
          message: 'Conversion stopped by user.',
        });
        break;
      }

      const it = updated[i];
      it.status = 'converting';
      setItems([...updated]);

      try {
        const itemSettings: ConversionSettings = {
          ...settings,
          targetFormat: it.targetFormat || settings.targetFormat,
        };
        const res = await convertSingleImage(it, itemSettings);

        it.status = 'completed';
        it.convertedBlob = res.blob;
        it.convertedUrl = res.url;
        it.convertedSize = res.size;
        it.convertedWidth = res.width;
        it.convertedHeight = res.height;
        it.targetName = uniqueNames[i];
      } catch (err: any) {
        it.status = 'error';
        it.errorMessage = err?.message || 'Failed';
      }

      const done = i + 1;
      setCompletedCount(done);
      setProgressPercent(Math.round((done / updated.length) * 100));
      setItems([...updated]);
    }

    setIsConverting(false);
    showToast({
      type: 'success',
      title: 'Batch Complete',
      message: 'All images in queue processed.',
    });
  };

  // Download All as ZIP
  const handleDownloadZip = async (zipFilename: string) => {
    const converted = items.filter(
      (it) => it.status === 'completed' && it.convertedBlob
    );
    if (converted.length === 0) return;

    // Convert file items to format expected by zipUtils
    const zipPayload = converted.map((it) => ({
      id: it.id,
      file: new File([it.convertedBlob!], it.targetName, {
        type: it.convertedBlob!.type,
      }),
      previewUrl: it.convertedUrl!,
      originalName: it.originalName,
      originalBaseName: it.originalBaseName,
      extension: it.targetFormat,
      size: it.convertedSize || 0,
      lastModified: Date.now(),
      newName: it.targetName,
      status: 'ready' as const,
      selected: false,
    }));

    try {
      await downloadFilesAsZip(zipPayload, `${zipFilename}.zip`);
      showToast({
        type: 'success',
        title: 'ZIP Downloaded',
        message: `Saved ${converted.length} converted images in archive.`,
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'ZIP Error',
        message: 'Failed to create ZIP package.',
      });
    }
  };

  // Statistics
  const stats: ConversionStats = useMemo(() => {
    const completed = items.filter((it) => it.status === 'completed');
    const origTotal = completed.reduce((acc, it) => acc + it.originalSize, 0);
    const convTotal = completed.reduce(
      (acc, it) => acc + (it.convertedSize || 0),
      0
    );
    const saved = origTotal - convTotal;
    const pct =
      origTotal > 0 ? Math.round(Math.max(0, (saved / origTotal) * 100)) : 0;

    return {
      totalFiles: items.length,
      completedFiles: completed.length,
      originalTotalBytes: origTotal,
      convertedTotalBytes: convTotal,
      spaceSavedBytes: Math.max(0, saved),
      percentageSaved: pct,
    };
  }, [items]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      items.forEach((it) => {
        URL.revokeObjectURL(it.previewUrl);
        if (it.convertedUrl) URL.revokeObjectURL(it.convertedUrl);
      });
    };
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#5722AF]/20 selection:text-[#5722AF]">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolName="Image Format Converter"
      />

      {/* Sidebar (Default Closed) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="converter"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <ConverterHero />

        {/* Central Tool Interface */}
        <section id="tool-section" className="space-y-6 pt-2">
          <div className="bg-white dark:bg-[#131722] rounded-3xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-8 shadow-sm space-y-6">
            {/* Mode Selector */}
            <ModeSelector
              mode={mode}
              onChange={(m) => setMode(m)}
              fileCount={items.length}
            />

            {/* Upload Zone (or Add More bar when files exist) */}
            {items.length === 0 ? (
              <UploadZone onFilesSelected={handleFilesSelected} />
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
                    <Images className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">
                      {items.length} Image{items.length > 1 ? 's' : ''} Loaded
                    </div>
                    <div className="text-xs text-zinc-400">
                      Total: {formatBytes(items.reduce((acc, it) => acc + it.originalSize, 0))}
                    </div>
                  </div>
                </div>

                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#131722] border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <Plus className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>Add More Files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFilesSelected(Array.from(e.target.files));
                        e.target.value = '';
                      }
                    }}
                    className="sr-only"
                  />
                </label>
              </div>
            )}

            {/* Format Selector Cards */}
            <FormatSelector
              selectedFormat={settings.targetFormat}
              onChange={handleFormatChange}
            />

            {/* Format-Specific Settings */}
            <FormatSpecificSettings
              settings={settings}
              onChange={setSettings}
              hasTransparency={items.some((it) => it.hasTransparency)}
            />

            {/* Transforms: Resize, Crop, Rotate, Flip */}
            <TransformSettings
              settings={settings}
              onChange={setSettings}
              originalWidth={items[0]?.originalWidth || 1920}
              originalHeight={items[0]?.originalHeight || 1080}
            />

            {/* Naming Settings */}
            <NamingSettings
              settings={settings}
              onChange={setSettings}
              sampleName={items[0]?.originalBaseName || 'photo'}
            />

            {/* Single Image Mode View */}
            {mode === 'single' && items.length > 0 && (
              <SingleImageView
                item={items[0]}
                settings={settings}
                onConvert={handleConvertSingle}
                onDownload={() => handleDownloadSingle(items[0])}
                isConverting={isConverting}
              />
            )}

            {/* Bulk Mode View */}
            {mode === 'bulk' && items.length > 0 && (
              <BulkImageView
                items={items}
                settings={settings}
                onConvertAll={handleConvertAll}
                onCancelConvert={() => setCancelRequested(true)}
                onDownloadZip={handleDownloadZip}
                onDownloadSingle={handleDownloadSingle}
                onRemoveItem={handleRemoveItem}
                onRemoveSelected={handleRemoveSelected}
                onClearAll={handleClearAll}
                onToggleSelect={(id) =>
                  setItems((prev) =>
                    prev.map((it) =>
                      it.id === id ? { ...it, selected: !it.selected } : it
                    )
                  )
                }
                onToggleSelectAll={() => {
                  const all = items.every((it) => it.selected);
                  setItems((prev) =>
                    prev.map((it) => ({ ...it, selected: !all }))
                  );
                }}
                onReorder={handleReorder}
                onSort={handleSort}
                onOverrideItemFormat={handleOverrideItemFormat}
                isConverting={isConverting}
                progressPercent={progressPercent}
                completedCount={completedCount}
                stats={stats}
              />
            )}
          </div>
        </section>

        {/* Informational & Trust Sections */}
        <HowItWorks />
        <PrivacySection />
        <ConverterFAQ />
        <ConverterSEO />
      </main>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
