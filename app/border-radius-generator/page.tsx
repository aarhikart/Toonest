'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { BorderRadiusHero } from '@/components/borderRadius/BorderRadiusHero';
import { BorderRadiusPreview } from '@/components/borderRadius/BorderRadiusPreview';
import { CornerControls } from '@/components/borderRadius/CornerControls';
import { PreviewControls } from '@/components/borderRadius/PreviewControls';
import { RadiusPresetsGallery } from '@/components/borderRadius/RadiusPresetsGallery';
import { RealUIPreviews } from '@/components/borderRadius/RealUIPreviews';
import { RadiusCodeExportView } from '@/components/borderRadius/RadiusCodeExportView';
import { RadiusAnalyzer } from '@/components/borderRadius/RadiusAnalyzer';
import { RadiusComparisonView } from '@/components/borderRadius/RadiusComparisonView';
import { SavedRadiusDrawer } from '@/components/borderRadius/SavedRadiusDrawer';
import { RadiusImageExportModal } from '@/components/borderRadius/RadiusImageExportModal';
import { BorderRadiusSEO } from '@/components/borderRadius/BorderRadiusSEO';
import { BorderRadiusFAQ } from '@/components/borderRadius/BorderRadiusFAQ';

import {
  BorderRadiusConfig,
  CornerRadius,
  SavedRadiusPreset,
  ShapePreset,
} from '@/lib/borderRadius/borderRadiusTypes';
import { DEFAULT_RADIUS_CONFIG } from '@/lib/borderRadius/borderRadiusPresets';
import {
  generateRandomRadius,
  serializeRadiusToUrl,
  deserializeRadiusFromUrl,
  generateBorderRadiusCss,
} from '@/lib/borderRadius/borderRadiusEngine';

import {
  Bookmark,
  Share2,
  Download,
  Columns,
  Undo2,
  Redo2,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';

const STORAGE_SAVED_KEY = 'toolnest_saved_radius';
const STORAGE_HISTORY_KEY = 'toolnest_radius_history';

export default function BorderRadiusGeneratorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [config, setConfig] = useState<BorderRadiusConfig>(DEFAULT_RADIUS_CONFIG);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<BorderRadiusConfig[]>([]);
  const [redoStack, setRedoStack] = useState<BorderRadiusConfig[]>([]);

  // Drawers & Modals
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isImageExportOpen, setIsImageExportOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Storage
  const [savedPresets, setSavedPresets] = useState<SavedRadiusPreset[]>([]);
  const [historyPresets, setHistoryPresets] = useState<SavedRadiusPreset[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopiedShare, setIsCopiedShare] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  // 1. Initial Mount: Load localStorage and URL params
  useEffect(() => {
    // Load favorites
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_KEY);
      if (stored) setSavedPresets(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load saved presets:', err);
    }

    // Load history
    try {
      const storedHist = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (storedHist) setHistoryPresets(JSON.parse(storedHist));
    } catch (err) {
      console.error('Failed to load radius history:', err);
    }

    // Check URL parameters for shared radius
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const param = searchParams.get('radius');
      if (param) {
        const parsed = deserializeRadiusFromUrl(param);
        if (parsed) {
          setConfig(parsed);
          showToast('Loaded shared border radius!');
        }
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedPresets));
    } catch (err) {
      console.error('Failed to save presets to localStorage:', err);
    }
  }, [savedPresets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(historyPresets));
    } catch (err) {
      console.error('Failed to save history to localStorage:', err);
    }
  }, [historyPresets]);

  // Helper to append to history
  const pushToHistory = useCallback((cfg: BorderRadiusConfig) => {
    const item: SavedRadiusPreset = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cfg.name || 'Custom Shape',
      createdAt: Date.now(),
      config: JSON.parse(JSON.stringify(cfg)),
    };

    setHistoryPresets((prev) => {
      const currentCss = generateBorderRadiusCss(cfg);
      const filtered = prev.filter(
        (h) => generateBorderRadiusCss(h.config) !== currentCss
      );
      return [item, ...filtered].slice(0, 35);
    });
  }, []);

  // Helper to commit state with Undo tracking
  const updateConfigWithHistory = useCallback(
    (newConfig: BorderRadiusConfig | ((prev: BorderRadiusConfig) => BorderRadiusConfig)) => {
      setConfig((current) => {
        const next = typeof newConfig === 'function' ? newConfig(current) : newConfig;
        setUndoStack((prev) => [...prev.slice(-25), current]);
        setRedoStack([]);
        return next;
      });
    },
    []
  );

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, config]);
    setConfig(previous);
  }, [undoStack, config]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, config]);
    setConfig(next);
  }, [redoStack, config]);

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

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

  // --- Corner Value Updates ---
  const handleUpdateCorner = (
    corner: keyof CornerRadius,
    value: number,
    axis?: 'horizontal' | 'vertical'
  ) => {
    const clampedVal = Math.max(0, value);

    updateConfigWithHistory((prev) => {
      if (prev.isLinked) {
        // Linked mode: update all corners
        if (!prev.isElliptical || !axis) {
          return {
            ...prev,
            horizontal: {
              topLeft: clampedVal,
              topRight: clampedVal,
              bottomRight: clampedVal,
              bottomLeft: clampedVal,
            },
            vertical: {
              topLeft: clampedVal,
              topRight: clampedVal,
              bottomRight: clampedVal,
              bottomLeft: clampedVal,
            },
          };
        }
        if (axis === 'horizontal') {
          return {
            ...prev,
            horizontal: {
              topLeft: clampedVal,
              topRight: clampedVal,
              bottomRight: clampedVal,
              bottomLeft: clampedVal,
            },
          };
        }
        return {
          ...prev,
          vertical: {
            topLeft: clampedVal,
            topRight: clampedVal,
            bottomRight: clampedVal,
            bottomLeft: clampedVal,
          },
        };
      }

      // Independent corner mode
      if (!prev.isElliptical || !axis) {
        return {
          ...prev,
          horizontal: { ...prev.horizontal, [corner]: clampedVal },
          vertical: { ...prev.vertical, [corner]: clampedVal },
        };
      }
      if (axis === 'horizontal') {
        return {
          ...prev,
          horizontal: { ...prev.horizontal, [corner]: clampedVal },
        };
      }
      return {
        ...prev,
        vertical: { ...prev.vertical, [corner]: clampedVal },
      };
    });
  };

  // Quick Radius Pills
  const handleApplyQuickRadius = (val: number) => {
    updateConfigWithHistory((prev) => ({
      ...prev,
      horizontal: {
        topLeft: val,
        topRight: val,
        bottomRight: val,
        bottomLeft: val,
      },
      vertical: {
        topLeft: val,
        topRight: val,
        bottomRight: val,
        bottomLeft: val,
      },
    }));
  };

  // Preview & Config updates
  const handleUpdateConfig = (updates: Partial<BorderRadiusConfig>) => {
    updateConfigWithHistory((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Randomize
  const handleRandomize = () => {
    const newConfig = generateRandomRadius('balanced', config);
    updateConfigWithHistory(newConfig);
    pushToHistory(newConfig);
    showToast('Generated random radius!');
  };

  // Reset
  const handleReset = () => {
    updateConfigWithHistory(DEFAULT_RADIUS_CONFIG);
    showToast('Reset to default');
  };

  // Presets
  const handleSelectPreset = (preset: ShapePreset) => {
    updateConfigWithHistory((prev) => {
      const next: BorderRadiusConfig = {
        ...prev,
        name: preset.name,
        unit: preset.unit,
        isElliptical: !!preset.isElliptical,
        isLinked: false,
        horizontal: { ...preset.horizontal },
        vertical: preset.vertical
          ? { ...preset.vertical }
          : { ...preset.horizontal },
      };
      pushToHistory(next);
      return next;
    });
    showToast(`Loaded "${preset.name}"`);
  };

  // Quick Styles
  const handleApplyStyle = (style: string) => {
    let mode: 'minimal' | 'balanced' | 'organic' | 'playful' | 'extreme' = 'balanced';
    if (style === 'sharp') {
      handleApplyQuickRadius(0);
      showToast('Applied Sharp style');
      return;
    }
    if (style === 'pill') {
      updateConfigWithHistory((prev) => ({
        ...prev,
        unit: 'px',
        isElliptical: false,
        horizontal: { topLeft: 9999, topRight: 9999, bottomRight: 9999, bottomLeft: 9999 },
        vertical: { topLeft: 9999, topRight: 9999, bottomRight: 9999, bottomLeft: 9999 },
      }));
      showToast('Applied Pill style');
      return;
    }
    if (style === 'subtle') mode = 'minimal';
    else if (style === 'organic' || style === 'blob') mode = 'organic';
    else if (style === 'very rounded') mode = 'playful';

    const newCfg = generateRandomRadius(mode, config);
    updateConfigWithHistory(newCfg);
    pushToHistory(newCfg);
    showToast(`Applied ${style} style`);
  };

  // Save to Favorites
  const handleSaveToFavorites = () => {
    const newSaved: SavedRadiusPreset = {
      id: `fav-${Date.now()}`,
      name: config.name || 'My Custom Radius',
      createdAt: Date.now(),
      config: JSON.parse(JSON.stringify(config)),
    };
    setSavedPresets((prev) => [newSaved, ...prev]);
    showToast('Saved to your favorites!');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedPresets((prev) => prev.filter((s) => s.id !== id));
    showToast('Removed from favorites');
  };

  const handleRenameSaved = (id: string, newName: string) => {
    setSavedPresets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  const handleDuplicateSaved = (item: SavedRadiusPreset) => {
    const dup: SavedRadiusPreset = {
      ...item,
      id: `fav-${Date.now()}`,
      name: `${item.name} (Copy)`,
      createdAt: Date.now(),
    };
    setSavedPresets((prev) => [dup, ...prev]);
    showToast('Preset duplicated');
  };

  // History Management
  const handleDeleteHistory = (id: string) => {
    setHistoryPresets((prev) => prev.filter((h) => h.id !== id));
  };

  const handleClearHistory = () => {
    setHistoryPresets([]);
    showToast('History cleared');
  };

  // Share via URL
  const handleShareUrl = () => {
    const encoded = serializeRadiusToUrl(config);
    const url = `${window.location.origin}${window.location.pathname}?radius=${encoded}`;
    navigator.clipboard.writeText(url);
    setIsCopiedShare(true);
    showToast('Shareable link copied to clipboard!');
    setTimeout(() => setIsCopiedShare(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B0C10] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Platform Navigation */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {}}
        activeToolName="Border Radius Generator"
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="border-radius-generator"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-900/90 dark:bg-white/95 text-white dark:text-gray-900 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Compact Hero */}
        <BorderRadiusHero />

        {/* Global Toolbar */}
        <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-4 shadow-xs flex items-center justify-between flex-wrap gap-2.5">
          {/* Left Actions: Undo / Redo & Reset */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={undoStack.length === 0}
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset to default"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-[#5722AF]/40 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Randomize</span>
            </button>
          </div>

          {/* Right Actions: Compare, Save, Share, Export */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                showComparison
                  ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compare</span>
            </button>

            <button
              type="button"
              onClick={handleShareUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
            >
              {isCopiedShare ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isCopiedShare ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImageExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Image</span>
            </button>

            <button
              type="button"
              onClick={handleSaveToFavorites}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Save</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#491B93] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedPresets.length})</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Overlay (Conditional) */}
        {showComparison && (
          <RadiusComparisonView
            currentConfig={config}
            onClose={() => setShowComparison(false)}
            onApplyPreset={handleSelectPreset}
          />
        )}

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Canvas Preview & Element Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Live Interactive Preview */}
            <BorderRadiusPreview
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onUpdateCorner={handleUpdateCorner}
              onRandomize={handleRandomize}
              onReset={handleReset}
              onOpenExport={() => setIsImageExportOpen(true)}
            />

            {/* Element Shape & Border Controls */}
            <PreviewControls
              preview={config.preview}
              onUpdatePreview={(updates) =>
                updateConfigWithHistory((prev) => ({
                  ...prev,
                  preview: { ...prev.preview, ...updates },
                }))
              }
            />

            {/* Analytical Geometry Breakdown */}
            <RadiusAnalyzer config={config} />
          </div>

          {/* Right Column: Precision Sliders & Code Generator (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Corner Radius Controls */}
            <CornerControls
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onUpdateCorner={handleUpdateCorner}
              onApplyQuickRadius={handleApplyQuickRadius}
            />

            {/* Multi-Format Code Generator */}
            <RadiusCodeExportView config={config} />
          </div>
        </div>

        {/* Curated Presets Library */}
        <RadiusPresetsGallery
          onSelectPreset={handleSelectPreset}
          onApplyStyle={handleApplyStyle}
        />

        {/* Real UI Component Showcase */}
        <RealUIPreviews config={config} />

        {/* Educational SEO Guide */}
        <BorderRadiusSEO />

        {/* FAQ Section */}
        <BorderRadiusFAQ />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Image Export Modal */}
      <RadiusImageExportModal
        isOpen={isImageExportOpen}
        onClose={() => setIsImageExportOpen(false)}
        config={config}
      />

      {/* Saved Library & History Drawer */}
      <SavedRadiusDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedPresets={savedPresets}
        historyPresets={historyPresets}
        onLoadPreset={(loaded) => {
          updateConfigWithHistory(loaded);
          showToast(`Loaded "${loaded.name}"`);
        }}
        onDeleteSaved={handleDeleteSaved}
        onDeleteHistory={handleDeleteHistory}
        onClearHistory={handleClearHistory}
        onRenameSaved={handleRenameSaved}
        onDuplicateSaved={handleDuplicateSaved}
      />
    </div>
  );
}
