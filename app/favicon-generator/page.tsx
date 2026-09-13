'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FaviconConfig,
  FaviconSourceItem,
  GeneratedFaviconFile,
  DEFAULT_FAVICON_CONFIG,
} from '@/lib/faviconTypes';
import {
  loadImage,
  generateAllFaviconFiles,
} from '@/lib/faviconEngine';
import { formatBytes } from '@/lib/renameEngine';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { UploadZone } from '@/components/UploadZone';
import { ToastContainer } from '@/components/Toast';
import { ToastInfo } from '@/lib/types';
import { HelpModal } from '@/components/HelpModal';
import { PrivacySection } from '@/components/PrivacySection';
import { Footer } from '@/components/Footer';

// Favicon generator specific components
import { FaviconHero } from '@/components/favicon/FaviconHero';
import { FaviconLivePreviews } from '@/components/favicon/FaviconLivePreviews';
import { FaviconControls } from '@/components/favicon/FaviconControls';
import { GeneratedFilesList } from '@/components/favicon/GeneratedFilesList';
import { FaviconFAQ } from '@/components/favicon/FaviconFAQ';
import { FaviconSEO } from '@/components/favicon/FaviconSEO';

import {
  Globe,
  Sparkles,
  RefreshCw,
  Trash2,
  Download,
  Info,
  Layers,
  Moon,
  Sun,
  Loader2,
  FileImage,
  UploadCloud,
} from 'lucide-react';

export default function FaviconGeneratorPage() {
  const [sourceItem, setSourceItem] = useState<FaviconSourceItem | null>(null);
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [darkSourceItem, setDarkSourceItem] = useState<FaviconSourceItem | null>(null);

  const [config, setConfig] = useState<FaviconConfig>(DEFAULT_FAVICON_CONFIG);
  const [history, setHistory] = useState<FaviconConfig[]>([DEFAULT_FAVICON_CONFIG]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFaviconFile[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const sourceItemRef = useRef<FaviconSourceItem | null>(null);
  sourceItemRef.current = sourceItem;

  const darkSourceRef = useRef<FaviconSourceItem | null>(null);
  darkSourceRef.current = darkSourceItem;

  const generatedFilesRef = useRef<GeneratedFaviconFile[]>([]);
  generatedFilesRef.current = generatedFiles;

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
      if (sourceItemRef.current) {
        URL.revokeObjectURL(sourceItemRef.current.previewUrl);
      }
      if (darkSourceRef.current) {
        URL.revokeObjectURL(darkSourceRef.current.previewUrl);
      }
      generatedFilesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []);

  // Config change with undo/redo history tracking
  const updateConfig = useCallback((updates: Partial<FaviconConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...updates };
      // Push to history (up to 30 states)
      setHistory((h) => {
        const sliced = h.slice(0, historyIndex + 1);
        return [...sliced, next].slice(-30);
      });
      setHistoryIndex((idx) => Math.min(idx + 1, 29));
      return next;
    });
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setConfig(history[newIdx]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setConfig(history[newIdx]);
    }
  }, [historyIndex, history]);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_FAVICON_CONFIG);
    setHistory((h) => [...h, DEFAULT_FAVICON_CONFIG]);
    setHistoryIndex((idx) => idx + 1);
    addToast('Icon customization reset to defaults', 'info');
  }, [addToast]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Handle source file upload
  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    try {
      let svgContent: string | undefined;
      if (file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg')) {
        svgContent = await file.text();
      }

      const img = await loadImage(file);
      const previewUrl = URL.createObjectURL(file);

      // Clean previous source if any
      if (sourceItemRef.current) {
        URL.revokeObjectURL(sourceItemRef.current.previewUrl);
      }

      const newItem: FaviconSourceItem = {
        id: `source-${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        width: img.naturalWidth || img.width || 512,
        height: img.naturalHeight || img.height || 512,
        format: file.type.split('/')[1]?.toUpperCase() || 'IMAGE',
        previewUrl,
        svgContent,
      };

      setSourceItem(newItem);
      setBaseImg(img);
      setGeneratedFiles([]); // reset previous generated files

      // Auto-populate website name if not yet set
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      if (config.websiteName === 'My Website' && baseName.length > 1) {
        updateConfig({
          websiteName: baseName.charAt(0).toUpperCase() + baseName.slice(1),
          shortName: baseName.slice(0, 10),
        });
      }

      addToast(`Loaded ${file.name} successfully`, 'success');
    } catch (err) {
      console.error('Failed to load image:', err);
      addToast('Could not load image. Please select a valid PNG, JPG, WebP, or SVG file.', 'error');
    }
  };

  // Handle dark mode logo upload
  const handleDarkLogoSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    try {
      const img = await loadImage(file);
      const previewUrl = URL.createObjectURL(file);

      if (darkSourceRef.current) {
        URL.revokeObjectURL(darkSourceRef.current.previewUrl);
      }

      setDarkSourceItem({
        id: `dark-${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        width: img.naturalWidth || 512,
        height: img.naturalHeight || 512,
        format: file.type.split('/')[1]?.toUpperCase() || 'IMAGE',
        previewUrl,
        isDarkModeVariant: true,
      });

      addToast('Added dark mode logo variant', 'success');
    } catch {
      addToast('Failed to load dark mode logo', 'error');
    }
  };

  const handleRemoveSource = () => {
    if (sourceItem) {
      URL.revokeObjectURL(sourceItem.previewUrl);
    }
    setSourceItem(null);
    setBaseImg(null);
    setGeneratedFiles([]);
  };

  // Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData || !e.clipboardData.files || e.clipboardData.files.length === 0) return;
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        handleFilesSelected([file]);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Generate All Files Pipeline
  const handleGenerateFavicon = async () => {
    if (!sourceItem || !baseImg) return;

    setIsGenerating(true);
    setGenerateProgress(0);
    setProgressText('Preparing favicon rendering engine...');

    try {
      const files = await generateAllFaviconFiles(
        sourceItem,
        baseImg,
        config,
        (percent, text) => {
          setGenerateProgress(percent);
          setProgressText(text);
        }
      );

      // Clean old URLs
      generatedFilesRef.current.forEach((f) => URL.revokeObjectURL(f.url));
      setGeneratedFiles(files);
      addToast(`Generated ${files.length} favicon files successfully!`, 'success');

      // Scroll to completion section smoothly
      setTimeout(() => {
        const el = document.getElementById('generated-files-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Favicon generation error:', err);
      addToast('An error occurred during favicon generation.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolName="Favicon Generator"
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="favicon-generator"
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Tool Hero Header */}
        <FaviconHero />

        {/* Empty State / Uploader */}
        {!sourceItem ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1 mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                Create your favicon in seconds
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Upload a logo or image to get started. Supports PNG, JPG, WebP, and SVG.
              </p>
            </div>

            <UploadZone
              onFilesSelected={handleFilesSelected}
              title="Drag & drop your logo or image here"
              subtitle="or choose an image from your device"
              buttonText="Upload Image"
            />
          </div>
        ) : (
          /* Main Workspace when image is loaded */
          <div className="space-y-6">
            {/* Top Source Details Bar */}
            <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/30 flex items-center justify-center text-[#5722AF] dark:text-[#9B6BE8] shrink-0">
                  <FileImage className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
                    {sourceItem.name}
                  </h2>
                  <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span>{sourceItem.width} × {sourceItem.height} px</span>
                    <span>•</span>
                    <span className="uppercase font-semibold text-zinc-600 dark:text-zinc-300">{sourceItem.format}</span>
                    <span>•</span>
                    <span>{formatBytes(sourceItem.size)}</span>
                    <span>•</span>
                    <span>Ratio: {Math.round((sourceItem.width / sourceItem.height) * 100) / 100}:1</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <label
                  htmlFor="favicon-replace-input"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replace Logo</span>
                </label>
                <input
                  id="favicon-replace-input"
                  type="file"
                  accept="image/*,.svg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesSelected(Array.from(e.target.files));
                    }
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleRemoveSource}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateFavicon}
                  disabled={isGenerating}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#5722AF] hover:bg-[#471a93] active:scale-[0.98] text-white shadow-md shadow-[#5722AF]/25 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rendering Assets...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Favicon Package</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recommendation Pill */}
            <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <Info className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
              <span>
                <strong>Recommendation:</strong> For best results, use a square logo with a transparent background. You can adjust shape, padding, and background colors on the right.
              </span>
            </div>

            {/* Generation Progress Bar */}
            {isGenerating && (
              <div className="p-4 rounded-2xl bg-[#5722AF]/5 dark:bg-[#5722AF]/10 border border-[#5722AF]/20 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-700 dark:text-zinc-200">
                    Generating Favicon: {progressText}
                  </span>
                  <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                    {generateProgress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#5722AF] to-[#9B6BE8] transition-all duration-150"
                    style={{ width: `${generateProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Main 2-Column Editor Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (7 cols): Live Previews */}
              <div className="lg:col-span-7">
                <FaviconLivePreviews
                  sourceItem={sourceItem}
                  baseImg={baseImg}
                  config={config}
                />
              </div>

              {/* Right Column (5 cols): Customization Controls Drawer */}
              <div className="lg:col-span-5">
                <FaviconControls
                  config={config}
                  onChange={updateConfig}
                  onReset={handleReset}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                />
              </div>
            </div>

            {/* Generated Files & Download Section */}
            {generatedFiles.length > 0 && (
              <div id="generated-files-section" className="pt-4">
                <GeneratedFilesList
                  files={generatedFiles}
                  config={config}
                  onGenerateAgain={() => {
                    const el = document.getElementById('favicon-replace-input');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Privacy Note */}
        <PrivacySection />

        {/* FAQ Accordion */}
        <FaviconFAQ />

        {/* SEO Editorial Guide */}
        <FaviconSEO />
      </main>

      <Footer />
    </div>
  );
}
