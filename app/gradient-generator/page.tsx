'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { GradientHero } from '@/components/gradient/GradientHero';
import { GradientPreview } from '@/components/gradient/GradientPreview';
import { ColorStopEditor } from '@/components/gradient/ColorStopEditor';
import { GradientControls } from '@/components/gradient/GradientControls';
import { RandomHarmonyBar } from '@/components/gradient/RandomHarmonyBar';
import { GradientPresetsGallery } from '@/components/gradient/GradientPresetsGallery';
import { SavedGradientsDrawer } from '@/components/gradient/SavedGradientsDrawer';
import { CSSCodeExportView } from '@/components/gradient/CSSCodeExportView';
import { UIPreviewTemplates } from '@/components/gradient/UIPreviewTemplates';
import { GradientComparisonView } from '@/components/gradient/GradientComparisonView';
import { ImageExportModal } from '@/components/gradient/ImageExportModal';
import { ContrastAccessibilityChecker } from '@/components/gradient/ContrastAccessibilityChecker';
import { GradientSEO } from '@/components/gradient/GradientSEO';
import { GradientFAQ } from '@/components/gradient/GradientFAQ';

import {
  GradientConfig,
  ColorStop,
  SavedGradient,
  RandomMood,
  HarmonyType,
} from '@/lib/gradient/gradientTypes';
import {
  DEFAULT_GRADIENT_CONFIG,
  GRADIENT_PRESETS,
} from '@/lib/gradient/gradientPresets';
import {
  generateRandomGradient,
  generateHarmonyGradient,
  generateGradientName,
  serializeGradientToUrl,
  deserializeGradientFromUrl,
} from '@/lib/gradient/gradientEngine';
import {
  Bookmark,
  Share2,
  Download,
  Layout,
  Columns,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';

const STORAGE_SAVED_KEY = 'toolnest_saved_gradients';
const STORAGE_HISTORY_KEY = 'toolnest_gradient_history';

export default function GradientGeneratorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [config, setConfig] = useState<GradientConfig>(DEFAULT_GRADIENT_CONFIG);
  const [selectedStopId, setSelectedStopId] = useState<string>(
    DEFAULT_GRADIENT_CONFIG.stops[0].id
  );

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<GradientConfig[]>([]);
  const [redoStack, setRedoStack] = useState<GradientConfig[]>([]);

  // Modals and Drawers
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isImageExportOpen, setIsImageExportOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showUIPreviews, setShowUIPreviews] = useState(false);
  const [showContrast, setShowContrast] = useState(false);

  // Storage State
  const [savedGradients, setSavedGradients] = useState<SavedGradient[]>([]);
  const [historyGradients, setHistoryGradients] = useState<SavedGradient[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2000);
  };

  // Load saved gradients and URL parameter on mount
  useEffect(() => {
    // 1. Load saved favorites
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_KEY);
      if (stored) setSavedGradients(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load saved gradients:', err);
    }

    // 2. Load recent history
    try {
      const storedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (storedHistory) setHistoryGradients(JSON.parse(storedHistory));
    } catch (err) {
      console.error('Failed to load history:', err);
    }

    // 3. URL Parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const gradParam = params.get('gradient');
      if (gradParam) {
        const parsed = deserializeGradientFromUrl(gradParam);
        if (parsed) {
          setConfig(parsed);
          setSelectedStopId(parsed.stops[0]?.id || 'stop-0');
        }
      }
    }
  }, []);

  // Persist saved gradients helper
  const persistSavedGradients = (list: SavedGradient[]) => {
    setSavedGradients(list);
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist saved gradients:', e);
    }
  };

  // Persist history helper (max 30)
  const addHistoryItem = useCallback((newConfig: GradientConfig) => {
    setHistoryGradients((prev) => {
      const newItem: SavedGradient = {
        id: Math.random().toString(36).substring(2, 9),
        name: newConfig.name,
        config: newConfig,
        createdAt: Date.now(),
      };
      // Avoid duplicate consecutive entries
      if (
        prev[0] &&
        JSON.stringify(prev[0].config.stops) === JSON.stringify(newConfig.stops)
      ) {
        return prev;
      }
      const updated = [newItem, ...prev.slice(0, 29)];
      try {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save history:', e);
      }
      return updated;
    });
  }, []);

  // Update Config with Undo / Redo tracking
  const updateConfig = useCallback(
    (updates: Partial<GradientConfig>, trackUndo = true) => {
      if (trackUndo) {
        setUndoStack((prev) => [...prev, config]);
        setRedoStack([]);
      }
      setConfig((prev) => {
        const next = { ...prev, ...updates };
        return next;
      });
    },
    [config]
  );

  // Undo / Redo Actions
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [config, ...prev]);
    setConfig(previous);
  }, [undoStack, config]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setUndoStack((prev) => [...prev, config]);
    setConfig(next);
  }, [redoStack, config]);

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) return;

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

  // Color Stop Handlers
  const handleUpdateStop = (id: string, updates: Partial<ColorStop>) => {
    updateConfig({
      stops: config.stops.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    });
  };

  const handleAddStop = (position?: number, color?: string) => {
    if (config.stops.length >= 10) return;
    const newId = `stop-${Date.now()}`;
    const newPos =
      position !== undefined
        ? position
        : Math.round(
            (config.stops[0].position +
              config.stops[config.stops.length - 1].position) /
              2
          );
    const newColor = color || '#7B45D1';

    const newStop: ColorStop = {
      id: newId,
      color: newColor,
      position: newPos,
      alpha: 1,
    };

    const newStops = [...config.stops, newStop].sort(
      (a, b) => a.position - b.position
    );

    updateConfig({ stops: newStops });
    setSelectedStopId(newId);
  };

  const handleRemoveStop = (id: string) => {
    if (config.stops.length <= 2) return;
    const nextStops = config.stops.filter((s) => s.id !== id);
    updateConfig({ stops: nextStops });
    if (selectedStopId === id) {
      setSelectedStopId(nextStops[0].id);
    }
  };

  // Randomize Gradient
  const handleRandomize = (mood: RandomMood = 'balanced') => {
    const randomGrad = generateRandomGradient(mood);
    updateConfig(randomGrad);
    setSelectedStopId(randomGrad.stops[0].id);
    addHistoryItem(randomGrad);
    showToast(`Generated ${mood} gradient`);
  };

  // Color Harmony
  const handleHarmony = (baseHex: string, harmony: HarmonyType) => {
    const harmGrad = generateHarmonyGradient(baseHex, harmony, config.angle);
    updateConfig(harmGrad);
    setSelectedStopId(harmGrad.stops[0].id);
    addHistoryItem(harmGrad);
    showToast(`Applied ${harmony} scheme`);
  };

  // Reset to Default
  const handleReset = () => {
    updateConfig(DEFAULT_GRADIENT_CONFIG);
    setSelectedStopId(DEFAULT_GRADIENT_CONFIG.stops[0].id);
    showToast('Reset to default gradient');
  };

  // Select Preset
  const handleSelectPreset = (presetConfig: GradientConfig) => {
    updateConfig(presetConfig);
    setSelectedStopId(presetConfig.stops[0].id);
    addHistoryItem(presetConfig);
    showToast(`Loaded "${presetConfig.name}"`);
  };

  // Save Gradient to Favorites
  const handleSaveToFavorites = () => {
    const newSaved: SavedGradient = {
      id: Math.random().toString(36).substring(2, 9),
      name: config.name || generateGradientName(config.stops),
      config,
      createdAt: Date.now(),
    };
    persistSavedGradients([newSaved, ...savedGradients]);
    showToast('Saved to Favorites!');
  };

  // Share Gradient Link
  const handleShareLink = () => {
    const query = serializeGradientToUrl(config);
    const url = `${window.location.origin}/gradient-generator?gradient=${query}`;
    navigator.clipboard.writeText(url);
    showToast('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {}}
        activeToolName="Gradient Generator"
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Compact Hero Section */}
        <GradientHero />

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#5722AF] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-fade-in flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Toolbar Bar: Save, Library, UI Previews, Contrast, Compare, Share */}
        <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-4 shadow-xs flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Save to Favorites */}
            <button
              type="button"
              onClick={handleSaveToFavorites}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#5722AF] text-white hover:bg-[#481c91] transition-all shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Gradient</span>
            </button>

            {/* Open Saved Drawer */}
            <button
              type="button"
              onClick={() => setIsSavedDrawerOpen(true)}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <span>Library</span>
              {savedGradients.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#5722AF] text-white text-[10px] font-bold">
                  {savedGradients.length}
                </span>
              )}
            </button>

            {/* Share Link */}
            <button
              type="button"
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              title="Copy shareable URL"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Image Export Trigger */}
            <button
              type="button"
              onClick={() => setIsImageExportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </button>
          </div>

          {/* Right Tool Toggles: UI Previews, Contrast, Compare */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowUIPreviews(!showUIPreviews)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showUIPreviews
                  ? 'bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border-[#5722AF]/30 font-bold'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>UI Previews</span>
            </button>

            <button
              type="button"
              onClick={() => setShowContrast(!showContrast)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showContrast
                  ? 'bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border-[#5722AF]/30 font-bold'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Contrast</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showComparison
                  ? 'bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] border-[#5722AF]/30 font-bold'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Responsive Layout: Left Preview, Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Large Preview & Quick Info */}
          <div className="lg:col-span-7 space-y-6">
            <GradientPreview
              config={config}
              onUpdateName={(name) => updateConfig({ name })}
              onRandomize={() => handleRandomize('balanced')}
              onReset={handleReset}
              onOpenExport={() => setIsImageExportOpen(true)}
            />

            {/* Optional Side-by-Side Comparison */}
            {showComparison && (
              <GradientComparisonView
                currentConfig={config}
                onClose={() => setShowComparison(false)}
                onApplyComparison={(newConfig) => updateConfig(newConfig)}
              />
            )}
          </div>

          {/* Right Column: Color Stop Editor, Angle/Gradient Controls, Random/Harmony */}
          <div className="lg:col-span-5 space-y-6">
            {/* Color Stop Editor */}
            <ColorStopEditor
              config={config}
              selectedStopId={selectedStopId}
              onSelectStop={setSelectedStopId}
              onUpdateStop={handleUpdateStop}
              onAddStop={handleAddStop}
              onRemoveStop={handleRemoveStop}
            />

            {/* Gradient Style & Linear/Radial/Conic Controls */}
            <GradientControls
              config={config}
              onUpdateConfig={updateConfig}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />

            {/* Random & Harmony Generator */}
            <RandomHarmonyBar
              onGenerateRandom={handleRandomize}
              onGenerateHarmony={handleHarmony}
              currentBaseColor={config.stops[0]?.color}
            />
          </div>
        </div>

        {/* CSS Code Generator & Exporters */}
        <CSSCodeExportView config={config} />

        {/* Realistic UI Component Previews (Toggled or inline) */}
        {showUIPreviews && <UIPreviewTemplates config={config} />}

        {/* WCAG Contrast Accessibility Section (Toggled or inline) */}
        {showContrast && (
          <ContrastAccessibilityChecker stops={config.stops} />
        )}

        {/* Preset Gallery */}
        <GradientPresetsGallery onSelectPreset={handleSelectPreset} />

        {/* Educational SEO Guide */}
        <GradientSEO />

        {/* Frequently Asked Questions */}
        <GradientFAQ />
      </main>

      {/* Saved Gradients Drawer */}
      <SavedGradientsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedGradients={savedGradients}
        historyGradients={historyGradients}
        onLoadGradient={(c) => {
          updateConfig(c);
          setSelectedStopId(c.stops[0].id);
          showToast(`Loaded "${c.name}"`);
        }}
        onDeleteSaved={(id) =>
          persistSavedGradients(savedGradients.filter((s) => s.id !== id))
        }
        onDeleteHistory={(id) => {
          const updated = historyGradients.filter((s) => s.id !== id);
          setHistoryGradients(updated);
          localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
        }}
        onClearHistory={() => {
          setHistoryGradients([]);
          localStorage.removeItem(STORAGE_HISTORY_KEY);
          showToast('History cleared');
        }}
        onRenameSaved={(id, newName) => {
          persistSavedGradients(
            savedGradients.map((s) => (s.id === id ? { ...s, name: newName } : s))
          );
        }}
        onDuplicateSaved={(item) => {
          const dup: SavedGradient = {
            id: Math.random().toString(36).substring(2, 9),
            name: `${item.name} (Copy)`,
            config: item.config,
            createdAt: Date.now(),
          };
          persistSavedGradients([dup, ...savedGradients]);
          showToast('Duplicated gradient');
        }}
      />

      {/* Image Export Modal */}
      {isImageExportOpen && (
        <ImageExportModal
          config={config}
          onClose={() => setIsImageExportOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="gradient-generator"
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
