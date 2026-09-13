'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { BoxShadowHero } from '@/components/boxShadow/BoxShadowHero';
import { BoxShadowPreview } from '@/components/boxShadow/BoxShadowPreview';
import { ShadowLayerList } from '@/components/boxShadow/ShadowLayerList';
import { ShadowLayerControls } from '@/components/boxShadow/ShadowLayerControls';
import { PreviewControls } from '@/components/boxShadow/PreviewControls';
import { ShadowPresetsGallery } from '@/components/boxShadow/ShadowPresetsGallery';
import { ShadowCodeExportView } from '@/components/boxShadow/ShadowCodeExportView';
import { ShadowAnalyzer } from '@/components/boxShadow/ShadowAnalyzer';
import { ShadowComparisonView } from '@/components/boxShadow/ShadowComparisonView';
import { SavedShadowsDrawer } from '@/components/boxShadow/SavedShadowsDrawer';
import { ImageExportModal } from '@/components/boxShadow/ImageExportModal';
import { BoxShadowSEO } from '@/components/boxShadow/BoxShadowSEO';
import { BoxShadowFAQ } from '@/components/boxShadow/BoxShadowFAQ';

import {
  ShadowConfig,
  ShadowLayer,
  SavedShadow,
  PreviewSettings,
} from '@/lib/boxShadow/shadowTypes';
import {
  DEFAULT_SHADOW_CONFIG,
} from '@/lib/boxShadow/shadowPresets';
import {
  generateRandomShadow,
  generateStyleShadow,
  serializeShadowToUrl,
  deserializeShadowFromUrl,
  generateBoxShadowCss,
} from '@/lib/boxShadow/shadowEngine';

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
  Layers,
} from 'lucide-react';

const STORAGE_SAVED_KEY = 'toolnest_saved_shadows';
const STORAGE_HISTORY_KEY = 'toolnest_shadow_history';

export default function BoxShadowGeneratorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [config, setConfig] = useState<ShadowConfig>(DEFAULT_SHADOW_CONFIG);
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    DEFAULT_SHADOW_CONFIG.layers[0].id
  );

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<ShadowConfig[]>([]);
  const [redoStack, setRedoStack] = useState<ShadowConfig[]>([]);

  // Modals & Drawers
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isImageExportOpen, setIsImageExportOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Storage
  const [savedShadows, setSavedShadows] = useState<SavedShadow[]>([]);
  const [historyShadows, setHistoryShadows] = useState<SavedShadow[]>([]);
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
      if (stored) setSavedShadows(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load saved shadows:', err);
    }

    // Load history
    try {
      const storedHist = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (storedHist) setHistoryShadows(JSON.parse(storedHist));
    } catch (err) {
      console.error('Failed to load shadow history:', err);
    }

    // Check URL parameters for shared shadow
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const param = searchParams.get('shadow');
      if (param) {
        const parsed = deserializeShadowFromUrl(param);
        if (parsed) {
          setConfig(parsed);
          setSelectedLayerId(parsed.layers[0]?.id || 'layer-0');
          showToast('Loaded shared shadow from link!');
        }
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedShadows));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }, [savedShadows]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(historyShadows));
    } catch (err) {
      console.error('Failed to save history to localStorage:', err);
    }
  }, [historyShadows]);

  // Helper to append to history
  const pushToHistory = useCallback((cfg: ShadowConfig) => {
    const item: SavedShadow = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cfg.name || 'Custom Shadow',
      createdAt: Date.now(),
      config: JSON.parse(JSON.stringify(cfg)),
    };

    setHistoryShadows((prev) => {
      const filtered = prev.filter(
        (h) => generateBoxShadowCss(h.config.layers) !== generateBoxShadowCss(cfg.layers)
      );
      return [item, ...filtered].slice(0, 30);
    });
  }, []);

  // Helper to commit state with Undo tracking
  const updateConfigWithHistory = useCallback(
    (newConfig: ShadowConfig | ((prev: ShadowConfig) => ShadowConfig)) => {
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
    if (!previous.layers.some((l) => l.id === selectedLayerId)) {
      setSelectedLayerId(previous.layers[0]?.id || 'layer-0');
    }
  }, [undoStack, config, selectedLayerId]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, config]);
    setConfig(next);
    if (!next.layers.some((l) => l.id === selectedLayerId)) {
      setSelectedLayerId(next.layers[0]?.id || 'layer-0');
    }
  }, [redoStack, config, selectedLayerId]);

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

  // --- Layer Management ---

  const handleUpdateLayer = (updates: Partial<ShadowLayer>) => {
    updateConfigWithHistory((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === selectedLayerId ? { ...l, ...updates } : l
      ),
    }));
  };

  const handleAddLayer = () => {
    if (config.layers.length >= 10) {
      showToast('Maximum 10 layers reached');
      return;
    }

    const newId = `layer-${Date.now().toString(36)}`;
    const newLayer: ShadowLayer = {
      id: newId,
      inset: false,
      offsetX: 0,
      offsetY: 8,
      blur: 20,
      spread: 0,
      color: '#000000',
      opacity: 15,
      enabled: true,
    };

    updateConfigWithHistory((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setSelectedLayerId(newId);
    showToast('New shadow layer added');
  };

  const handleDuplicateLayer = (id: string) => {
    if (config.layers.length >= 10) {
      showToast('Maximum 10 layers reached');
      return;
    }

    const target = config.layers.find((l) => l.id === id);
    if (!target) return;

    const dupId = `layer-${Date.now().toString(36)}`;
    const duplicated: ShadowLayer = {
      ...target,
      id: dupId,
      offsetY: target.offsetY + 4,
      blur: target.blur + 8,
    };

    updateConfigWithHistory((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      const nextLayers = [...prev.layers];
      nextLayers.splice(idx + 1, 0, duplicated);
      return { ...prev, layers: nextLayers };
    });
    setSelectedLayerId(dupId);
    showToast('Layer duplicated');
  };

  const handleDeleteLayer = (id: string) => {
    if (config.layers.length <= 1) {
      showToast('At least one layer is required');
      return;
    }

    updateConfigWithHistory((prev) => {
      const remaining = prev.layers.filter((l) => l.id !== id);
      if (selectedLayerId === id) {
        setSelectedLayerId(remaining[0].id);
      }
      return { ...prev, layers: remaining };
    });
    showToast('Layer deleted');
  };

  const handleToggleLayerEnabled = (id: string) => {
    updateConfigWithHistory((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === id ? { ...l, enabled: !l.enabled } : l
      ),
    }));
  };

  const handleMoveLayer = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= config.layers.length) return;
    updateConfigWithHistory((prev) => {
      const newLayers = [...prev.layers];
      const [moved] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, moved);
      return { ...prev, layers: newLayers };
    });
  };

  // --- Preview Options ---
  const handleUpdatePreview = (updates: Partial<PreviewSettings>) => {
    setConfig((prev) => ({
      ...prev,
      preview: { ...prev.preview, ...updates },
    }));
  };

  // --- Randomize & Reset ---
  const handleRandomize = () => {
    const randomLayers = generateRandomShadow();
    const newConfig: ShadowConfig = {
      ...config,
      name: 'Random Shadow',
      layers: randomLayers,
    };
    updateConfigWithHistory(newConfig);
    setSelectedLayerId(randomLayers[0].id);
    pushToHistory(newConfig);
    showToast('Generated random shadow!');
  };

  const handleReset = () => {
    updateConfigWithHistory(DEFAULT_SHADOW_CONFIG);
    setSelectedLayerId(DEFAULT_SHADOW_CONFIG.layers[0].id);
    showToast('Reset to default shadow');
  };

  // --- Quick Styles ---
  const handleApplyStylePreset = (
    style: 'subtle' | 'soft' | 'balanced' | 'strong' | 'dramatic'
  ) => {
    const styledLayers = generateStyleShadow(style);
    const newConfig: ShadowConfig = {
      ...config,
      name: `${style.charAt(0).toUpperCase() + style.slice(1)} Shadow`,
      layers: styledLayers,
    };
    updateConfigWithHistory(newConfig);
    setSelectedLayerId(styledLayers[0].id);
    pushToHistory(newConfig);
    showToast(`Applied ${style} style`);
  };

  // --- Presets Gallery Load ---
  const handleSelectPreset = (layers: ShadowLayer[], name: string) => {
    const newConfig: ShadowConfig = {
      ...config,
      name,
      layers,
    };
    updateConfigWithHistory(newConfig);
    setSelectedLayerId(layers[0]?.id || 'layer-0');
    pushToHistory(newConfig);
    showToast(`Loaded "${name}" preset`);
  };

  // --- Save / Favorites ---
  const handleSaveToFavorites = () => {
    const newSaved: SavedShadow = {
      id: `fav-${Date.now()}`,
      name: config.name || 'My Custom Shadow',
      createdAt: Date.now(),
      config: JSON.parse(JSON.stringify(config)),
    };
    setSavedShadows((prev) => [newSaved, ...prev]);
    showToast('Saved to your favorites!');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedShadows((prev) => prev.filter((s) => s.id !== id));
    showToast('Removed from favorites');
  };

  const handleRenameSaved = (id: string, newName: string) => {
    setSavedShadows((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  const handleDuplicateSaved = (item: SavedShadow) => {
    const dup: SavedShadow = {
      ...item,
      id: `fav-${Date.now()}`,
      name: `${item.name} (Copy)`,
      createdAt: Date.now(),
    };
    setSavedShadows((prev) => [dup, ...prev]);
    showToast('Shadow duplicated in favorites');
  };

  // --- History Management ---
  const handleDeleteHistory = (id: string) => {
    setHistoryShadows((prev) => prev.filter((h) => h.id !== id));
  };

  const handleClearHistory = () => {
    setHistoryShadows([]);
    showToast('History cleared');
  };

  // --- URL Sharing ---
  const handleShareUrl = () => {
    const encoded = serializeShadowToUrl(config);
    const url = `${window.location.origin}${window.location.pathname}?shadow=${encoded}`;
    navigator.clipboard.writeText(url);
    setIsCopiedShare(true);
    showToast('Shareable link copied to clipboard!');
    setTimeout(() => setIsCopiedShare(false), 2000);
  };

  // Currently selected layer
  const currentLayerIndex = config.layers.findIndex((l) => l.id === selectedLayerId);
  const selectedLayer =
    config.layers[currentLayerIndex] || config.layers[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B0C10] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Platform Navigation */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {}}
        activeToolName="Box Shadow Generator"
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="box-shadow-generator"
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
        {/* Hero Header */}
        <BoxShadowHero />

        {/* Global Toolbar */}
        <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-4 shadow-xs flex items-center justify-between flex-wrap gap-2.5">
          {/* Left Actions: Undo/Redo & Reset */}
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

          {/* Right Actions: Comparison, Save, Share, Export */}
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
              <span>Saved ({savedShadows.length})</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Overlay (Conditional) */}
        {showComparison && (
          <ShadowComparisonView
            currentLayers={config.layers}
            preview={config.preview}
            onClose={() => setShowComparison(false)}
            onApplyPreset={handleSelectPreset}
          />
        )}

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Canvas Preview & Preview Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Live Interactive Canvas */}
            <BoxShadowPreview
              config={config}
              onUpdatePreview={handleUpdatePreview}
              onRandomize={handleRandomize}
              onReset={handleReset}
              onOpenExport={() => setIsImageExportOpen(true)}
            />

            {/* Preview Element Controls (Object type, dimensions, radius, bg) */}
            <PreviewControls
              preview={config.preview}
              onUpdatePreview={handleUpdatePreview}
            />

            {/* Shadow Technical Analyzer */}
            <ShadowAnalyzer layers={config.layers} />
          </div>

          {/* Right Column: Multi-Layer Manager & Precision Sliders (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Layer Stack Manager */}
            <ShadowLayerList
              layers={config.layers}
              selectedLayerId={selectedLayerId}
              onSelectLayer={setSelectedLayerId}
              onAddLayer={handleAddLayer}
              onDuplicateLayer={handleDuplicateLayer}
              onDeleteLayer={handleDeleteLayer}
              onToggleLayerEnabled={handleToggleLayerEnabled}
              onMoveLayer={handleMoveLayer}
            />

            {/* Precision Active Layer Controls */}
            {selectedLayer && (
              <ShadowLayerControls
                key={selectedLayer.id}
                layer={selectedLayer}
                layerIndex={currentLayerIndex}
                onUpdateLayer={handleUpdateLayer}
              />
            )}

            {/* Multi-Format Code Export Panel */}
            <ShadowCodeExportView
              layers={config.layers}
              shadowName={config.name}
            />
          </div>
        </div>

        {/* Curated Presets Library */}
        <ShadowPresetsGallery
          onSelectPreset={handleSelectPreset}
          onApplyStylePreset={handleApplyStylePreset}
        />

        {/* Educational SEO Guide Section */}
        <BoxShadowSEO />

        {/* FAQ Section */}
        <BoxShadowFAQ />
      </main>

      {/* Footer */}
      <Footer />

      {/* Image Export Modal */}
      <ImageExportModal
        isOpen={isImageExportOpen}
        onClose={() => setIsImageExportOpen(false)}
        config={config}
      />

      {/* Saved Shadows & History Drawer */}
      <SavedShadowsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedShadows={savedShadows}
        historyShadows={historyShadows}
        onLoadShadow={(loadedConfig) => {
          updateConfigWithHistory(loadedConfig);
          setSelectedLayerId(loadedConfig.layers[0]?.id || 'layer-0');
          showToast(`Loaded "${loadedConfig.name}"`);
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
