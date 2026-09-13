'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ImageFileItem,
  RenameConfig,
  SortField,
  ToastInfo,
} from '@/lib/types';
import {
  parseFileName,
  recalculateAllNames,
  generateNewName,
  getImageDimensions,
  formatBytes,
} from '@/lib/renameEngine';
import { downloadSingleFile, downloadFilesAsZip } from '@/lib/zipUtils';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HeroSection } from '@/components/HeroSection';
import { UploadZone } from '@/components/UploadZone';
import { RenameSettings } from '@/components/RenameSettings';
import { Toolbar } from '@/components/Toolbar';
import { FileList } from '@/components/FileList';
import { DuplicateAlert } from '@/components/DuplicateAlert';
import { DownloadPanel } from '@/components/DownloadPanel';
import { ImagePreviewModal } from '@/components/ImagePreviewModal';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { HowItWorks } from '@/components/HowItWorks';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';
import { ToastContainer } from '@/components/Toast';
import { Plus, Sparkles, Images, FolderUp } from 'lucide-react';

const DEFAULT_RENAME_CONFIG: RenameConfig = {
  mode: 'standard',
  baseName: 'product-image',
  startNumber: 1,
  numberPadding: 3,
  separator: '-',
  pattern: '{name}-{number}',
  prefix: '',
  suffix: '',
  findText: '',
  replaceText: '',
  caseTransform: 'none',
  removeSpaces: false,
  removeSpecialChars: false,
  preserveExtension: true,
  customExtension: 'jpg',
  autoResolveDuplicates: false,
};

export default function Home() {
  const [items, setItems] = useState<ImageFileItem[]>([]);
  const [config, setConfig] = useState<RenameConfig>(DEFAULT_RENAME_CONFIG);
  const [sortField, setSortField] = useState<SortField>('order');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<ImageFileItem | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  // Common Sidebar defaults to closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Processing state for downloads
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Toast dispatch helper
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

  // Whenever rename config or items order changes, recalculate target filenames
  const recomputeNames = useCallback(
    (currentItems: ImageFileItem[], currentConfig: RenameConfig): ImageFileItem[] => {
      return recalculateAllNames(currentItems, currentConfig);
    },
    []
  );

  // Update config and immediately apply recalculations
  const handleConfigChange = (newConfig: RenameConfig) => {
    setConfig(newConfig);
    setItems((prev) => recomputeNames(prev, newConfig));
  };

  // Reset config to defaults
  const handleResetConfig = () => {
    setConfig(DEFAULT_RENAME_CONFIG);
    setItems((prev) => recomputeNames(prev, DEFAULT_RENAME_CONFIG));
    showToast({
      type: 'info',
      title: 'Settings Reset',
      message: 'Renaming configuration has been restored to default values.',
    });
  };

  // Handle incoming files from upload zone
  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    // Check duplicate file uploads
    const existingNames = new Set(items.map((it) => it.originalName.toLowerCase()));
    let duplicateUploadsCount = 0;

    const newItems: ImageFileItem[] = [];

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      if (existingNames.has(file.name.toLowerCase())) {
        duplicateUploadsCount++;
      }

      const { baseName, extension } = parseFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      const id = `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 6)}`;

      const item: ImageFileItem = {
        id,
        file,
        previewUrl,
        originalName: file.name,
        originalBaseName: baseName,
        extension,
        size: file.size,
        lastModified: file.lastModified,
        newName: file.name,
        status: 'ready',
        selected: false,
      };

      newItems.push(item);

      // Extract image dimensions asynchronously
      getImageDimensions(previewUrl).then((dims) => {
        setItems((current) =>
          current.map((it) => (it.id === id ? { ...it, dimensions: dims } : it))
        );
      });
    }

    const merged = [...items, ...newItems];
    const computed = recomputeNames(merged, config);
    setItems(computed);

    if (duplicateUploadsCount > 0) {
      showToast({
        type: 'warning',
        title: 'Notice',
        message: `${newFiles.length} images added. (${duplicateUploadsCount} had identical names to existing files).`,
      });
    } else {
      showToast({
        type: 'success',
        title: 'Images Added',
        message: `Successfully loaded ${newFiles.length} image file${newFiles.length > 1 ? 's' : ''}.`,
      });
    }
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    const allSelected = items.length > 0 && items.every((it) => it.selected);
    setItems((prev) => prev.map((it) => ({ ...it, selected: !allSelected })));
  };

  // Remove single item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const filtered = prev.filter((it) => it.id !== id);
      return recomputeNames(filtered, config);
    });
  };

  // Remove selected items
  const handleRemoveSelected = () => {
    const selectedCount = items.filter((it) => it.selected).length;
    if (selectedCount === 0) return;

    setItems((prev) => {
      prev.forEach((it) => {
        if (it.selected) {
          URL.revokeObjectURL(it.previewUrl);
        }
      });
      const remaining = prev.filter((it) => !it.selected);
      return recomputeNames(remaining, config);
    });

    showToast({
      type: 'info',
      title: 'Files Removed',
      message: `Removed ${selectedCount} selected image${selectedCount > 1 ? 's' : ''}.`,
    });
  };

  // Clear all items
  const handleClearAll = () => {
    if (items.length === 0) return;
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
    showToast({
      type: 'info',
      title: 'Workspace Cleared',
      message: 'All uploaded images have been removed from browser memory.',
    });
  };

  // Reorder items (drag-and-drop or move buttons)
  const handleReorder = (startIndex: number, endIndex: number) => {
    if (startIndex < 0 || endIndex < 0 || startIndex >= items.length || endIndex >= items.length) {
      return;
    }
    const updated = Array.from(items);
    const [moved] = updated.splice(startIndex, 1);
    updated.splice(endIndex, 0, moved);

    // Numbering follows visual order!
    const recalculated = recomputeNames(updated, config);
    setItems(recalculated);
  };

  // Sort items
  const handleSortChange = (sort: SortField) => {
    setSortField(sort);
    if (sort === 'order') {
      // Re-apply current items order
      setItems((prev) => recomputeNames(prev, config));
      return;
    }

    const sorted = [...items].sort((a, b) => {
      switch (sort) {
        case 'name-asc':
          return a.originalName.localeCompare(a.originalName, undefined, { numeric: true });
        case 'name-desc':
          return b.originalName.localeCompare(a.originalName, undefined, { numeric: true });
        case 'size-asc':
          return a.size - b.size;
        case 'size-desc':
          return b.size - a.size;
        case 'type':
          return a.extension.localeCompare(b.extension);
        default:
          return 0;
      }
    });

    const recalculated = recomputeNames(sorted, config);
    setItems(recalculated);
    showToast({
      type: 'info',
      title: 'Sorted',
      message: `Image list sorted by ${sort.replace('-', ' ')}. Numbers updated accordingly.`,
    });
  };

  // Auto-resolve duplicate conflicts
  const handleAutoResolve = () => {
    const updatedConfig: RenameConfig = {
      ...config,
      autoResolveDuplicates: true,
    };
    setConfig(updatedConfig);
    setItems((prev) => recomputeNames(prev, updatedConfig));
    showToast({
      type: 'success',
      title: 'Conflicts Resolved',
      message: 'Unique sequence suffixes added to resolve conflicting names.',
    });
  };

  // Handle Download & ZIP generation
  const handleDownload = async (customZipName: string) => {
    if (items.length === 0) return;

    // Direct single file download
    if (items.length === 1) {
      downloadSingleFile(items[0]);
      showToast({
        type: 'success',
        title: 'Downloaded',
        message: `Saved ${items[0].newName} successfully.`,
      });
      return;
    }

    // Multiple files: ZIP packaging
    try {
      setIsProcessing(true);
      setProgressPercent(0);
      setProgressMessage('Initializing ZIP packaging...');

      await downloadFilesAsZip(items, customZipName, (percent, message) => {
        setProgressPercent(percent);
        setProgressMessage(message);
      });

      showToast({
        type: 'success',
        title: 'Archive Created',
        message: `Downloaded ${items.length} images inside ${customZipName}.`,
      });
    } catch (err) {
      console.error('Download error:', err);
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not generate ZIP archive. Please check memory limits.',
      });
    } finally {
      setIsProcessing(false);
      setProgressPercent(0);
      setProgressMessage('');
    }
  };

  // Duplicate items count
  const duplicateCount = useMemo(() => {
    return items.filter((it) => it.status === 'duplicate').length;
  }, [items]);

  // Selected count
  const selectedCount = useMemo(() => {
    return items.filter((it) => it.selected).length;
  }, [items]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (it) =>
        it.originalName.toLowerCase().includes(q) ||
        it.newName.toLowerCase().includes(q) ||
        it.extension.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Live sample preview string based on config
  const samplePreview = useMemo(() => {
    const dummyItem: ImageFileItem = {
      id: 'dummy',
      file: new File([''], 'sample_photo.jpg', { type: 'image/jpeg' }),
      previewUrl: '',
      originalName: 'sample_photo.jpg',
      originalBaseName: 'sample_photo',
      extension: 'jpg',
      size: 1024 * 1024 * 2.4,
      lastModified: Date.now(),
      newName: '',
      status: 'ready',
      selected: false,
    };
    return generateNewName(dummyItem, 0, config);
  }, [config]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    };
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#5722AF]/20 selection:text-[#5722AF]">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Common Unified Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolName="Image Bulk Rename"
      />

      {/* Common Collapsible Sidebar (Default Closed) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="bulk-rename"
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Main Tool Container */}
        <section id="tool-section" className="space-y-6 pt-2">
          {/* If no images uploaded yet: Show Upload Area first, then settings */}
          {items.length === 0 ? (
            <div className="space-y-6">
              {/* Primary Drag & Drop Upload Zone */}
              <UploadZone onFilesSelected={handleFilesSelected} />

              {/* Pre-configuration settings card */}
              <RenameSettings
                config={config}
                onChange={handleConfigChange}
                onReset={handleResetConfig}
                samplePreview={samplePreview}
              />
            </div>
          ) : (
            /* Once images are uploaded: Full Tool Workspace */
            <div className="space-y-6">
              {/* Top Action Bar with Quick Upload More Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#131722] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold">
                    <Images className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>{items.length} Images Loaded</span>
                      <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">
                        ({formatBytes(items.reduce((acc, curr) => acc + curr.size, 0))})
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Drag files into the dropzone or click Add More to append files
                    </p>
                  </div>
                </div>

                {/* Add More Files trigger button */}
                <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300/80 dark:border-zinc-700 transition-colors">
                  <Plus className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>Add More Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/bmp,image/tiff,image/avif"
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

              {/* Rename Settings Panel */}
              <RenameSettings
                config={config}
                onChange={handleConfigChange}
                onReset={handleResetConfig}
                samplePreview={samplePreview}
              />

              {/* Duplicate Detection Alert if any exist */}
              <DuplicateAlert
                duplicateCount={duplicateCount}
                onAutoResolve={handleAutoResolve}
              />

              {/* Toolbar: Select all, remove selected, sort, search */}
              <Toolbar
                totalCount={items.length}
                selectedCount={selectedCount}
                onToggleSelectAll={handleToggleSelectAll}
                onRemoveSelected={handleRemoveSelected}
                onClearAll={handleClearAll}
                sortField={sortField}
                onSortChange={handleSortChange}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {/* File List Table / Cards */}
              <FileList
                items={items}
                filteredItems={filteredItems}
                onToggleSelect={handleToggleSelect}
                onRemove={handleRemoveItem}
                onReorder={handleReorder}
                onPreview={setPreviewItem}
              />

              {/* Download & Export Panel */}
              <DownloadPanel
                items={items}
                duplicateCount={duplicateCount}
                onDownload={handleDownload}
                isProcessing={isProcessing}
                progressPercent={progressPercent}
                progressMessage={progressMessage}
              />
            </div>
          )}
        </section>

        {/* Informational & SEO Trust Sections */}
        <HowItWorks />
        <PrivacySection />
        <FAQ />
      </main>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Help & Guide Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
