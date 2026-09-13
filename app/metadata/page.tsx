'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ImageMetadataItem } from '@/lib/metadataTypes';
import { parseImageMetadata } from '@/lib/metadataEngine';
import { formatBytes } from '@/lib/renameEngine';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { UploadZone } from '@/components/UploadZone';
import { ToastContainer } from '@/components/Toast';
import { ToastInfo } from '@/lib/types';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';

// Metadata specific components
import { MetadataHero } from '@/components/metadata/MetadataHero';
import { ModeSelector, ConverterMode } from '@/components/converter/ModeSelector';
import { MetadataDashboard } from '@/components/metadata/MetadataDashboard';
import { BulkMetadataView } from '@/components/metadata/BulkMetadataView';
import { MetadataFAQ } from '@/components/metadata/MetadataFAQ';
import { MetadataSEO } from '@/components/metadata/MetadataSEO';
import { Plus, Images, Loader2, Info } from 'lucide-react';

export default function MetadataPage() {
  const [mode, setMode] = useState<ConverterMode>('single');
  const [items, setItems] = useState<ImageMetadataItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Clipboard Paste listener
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
          message: `Loaded ${files.length} image${files.length > 1 ? 's' : ''} from clipboard.`,
        });
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [items]);

  // Handle uploaded/dropped files
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    setIsProcessing(true);
    const parsedItems: ImageMetadataItem[] = [];

    for (const file of newFiles) {
      try {
        const parsed = await parseImageMetadata(file);
        parsedItems.push(parsed);
      } catch (err: any) {
        showToast({
          type: 'error',
          title: 'Parsing Failed',
          message: `Could not read metadata for ${file.name}.`,
        });
      }
    }

    if (parsedItems.length > 0) {
      setItems((prev) => {
        const combined = [...prev, ...parsedItems];
        if (!activeItemId) {
          setActiveItemId(combined[0].id);
        }
        return combined;
      });

      if (mode === 'single' && (items.length > 0 || newFiles.length > 1)) {
        setMode('bulk');
      } else if (!activeItemId) {
        setActiveItemId(parsedItems[0].id);
      }

      showToast({
        type: 'success',
        title: 'Metadata Loaded',
        message: `Inspected ${parsedItems.length} image${parsedItems.length > 1 ? 's' : ''} successfully.`,
      });
    }

    setIsProcessing(false);
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const remaining = prev.filter((it) => it.id !== id);
      if (activeItemId === id) {
        setActiveItemId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  // Remove selected items
  const handleRemoveSelected = () => {
    const count = items.filter((it) => it.selected).length;
    if (count === 0) return;

    setItems((prev) => {
      prev.forEach((it) => {
        if (it.selected) {
          URL.revokeObjectURL(it.previewUrl);
        }
      });
      const remaining = prev.filter((it) => !it.selected);
      if (activeItemId && !remaining.some((it) => it.id === activeItemId)) {
        setActiveItemId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });

    showToast({
      type: 'info',
      title: 'Removed',
      message: `Removed ${count} selected files.`,
    });
  };

  // Clear all items
  const handleClearAll = () => {
    items.forEach((it) => {
      URL.revokeObjectURL(it.previewUrl);
    });
    setItems([]);
    setActiveItemId(null);
    showToast({
      type: 'info',
      title: 'Cleared',
      message: 'Inspection workspace cleared.',
    });
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = items.length > 0 && items.every((it) => it.selected);
    setItems((prev) => prev.map((it) => ({ ...it, selected: !allSelected })));
  };

  // Sort items
  const handleSort = (type: 'name' | 'size' | 'width' | 'height' | 'format' | 'status') => {
    const sorted = [...items].sort((a, b) => {
      if (type === 'name') {
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      }
      if (type === 'size') {
        return b.size - a.size;
      }
      if (type === 'width') {
        return b.width - a.width;
      }
      if (type === 'height') {
        return b.height - a.height;
      }
      if (type === 'format') {
        return a.format.localeCompare(b.format);
      }
      if (type === 'status') {
        return b.counts.totalFields - a.counts.totalFields;
      }
      return 0;
    });
    setItems(sorted);
  };

  // Active item for Single mode inspection
  const activeItem = items.find((it) => it.id === activeItemId) || items[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Header
        activeToolName="Image Metadata Viewer"
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="metadata"
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero */}
        <MetadataHero />

        {/* Mode Selector */}
        <div className="flex justify-center">
          <ModeSelector
            mode={mode}
            onChange={(m) => setMode(m)}
            fileCount={items.length}
          />
        </div>

        {/* Upload Zone */}
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
                  {items.length} Image{items.length > 1 ? 's' : ''} Inspected
                </div>
                <div className="text-xs text-zinc-400">
                  Total payload: {formatBytes(items.reduce((acc, it) => acc + it.size, 0))}
                </div>
              </div>
            </div>

            <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#131722] border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Plus className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Add More Images</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/tiff,image/heic,image/avif"
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

        {/* Loading Spinner */}
        {isProcessing && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-3 text-sm font-semibold text-zinc-600 dark:text-zinc-300 shadow-xs">
            <Loader2 className="w-5 h-5 text-[#5722AF] animate-spin" />
            <span>Reading embedded image metadata and EXIF headers...</span>
          </div>
        )}

        {/* Workspace Views */}
        {items.length > 0 && !isProcessing && (
          <div>
            {mode === 'single' && activeItem ? (
              <div className="space-y-4">
                {/* Horizontal thumbnail selector if multiple images in workspace */}
                {items.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {items.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => setActiveItemId(it.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all shrink-0 cursor-pointer ${
                          it.id === activeItem.id
                            ? 'bg-white dark:bg-[#121620] border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8] shadow-sm font-bold'
                            : 'bg-zinc-100/60 dark:bg-zinc-800/60 border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={it.previewUrl} alt={it.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs truncate max-w-[120px]">{it.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <MetadataDashboard
                  item={activeItem}
                  onShowToast={(msg) => showToast({ type: 'success', title: 'Action Complete', message: msg })}
                />
              </div>
            ) : (
              <BulkMetadataView
                items={items}
                onSelectItem={(item) => {
                  setActiveItemId(item.id);
                  setMode('single');
                }}
                onRemoveItem={handleRemoveItem}
                onRemoveSelected={handleRemoveSelected}
                onClearAll={handleClearAll}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onSort={handleSort}
                onShowToast={(msg) => showToast({ type: 'success', title: 'Export Ready', message: msg })}
              />
            )}
          </div>
        )}

        {/* Informational & SEO sections */}
        <HowItWorks />
        <PrivacySection />
        <MetadataFAQ />
        <MetadataSEO />
      </main>

      <Footer />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
