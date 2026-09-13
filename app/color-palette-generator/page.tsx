'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { ColorPaletteHero } from '@/components/colorPalette/ColorPaletteHero';
import { PaletteToolbar } from '@/components/colorPalette/PaletteToolbar';
import { MainPaletteGrid } from '@/components/colorPalette/MainPaletteGrid';
import { ColorShadesModal } from '@/components/colorPalette/ColorShadesModal';
import { PaletteUIPreview } from '@/components/colorPalette/PaletteUIPreview';
import { GradientGeneratorView } from '@/components/colorPalette/GradientGeneratorView';
import { PaletteExportModal } from '@/components/colorPalette/PaletteExportModal';
import { SavedPalettesDrawer } from '@/components/colorPalette/SavedPalettesDrawer';
import { ColorPaletteSEO } from '@/components/colorPalette/ColorPaletteSEO';
import { ColorPaletteFAQ } from '@/components/colorPalette/ColorPaletteFAQ';
import {
  ColorItem,
  HarmonyMode,
  SavedPalette,
} from '@/lib/colorTypes';
import {
  createDefaultPalette,
  createColorItem,
  regeneratePalette,
  generateRandomHex,
  parseColorsFromUrlQuery,
} from '@/lib/colorEngine';

const LOCAL_STORAGE_SAVED_KEY = 'toolnest_saved_palettes';

export default function ColorPaletteGeneratorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [palette, setPalette] = useState<ColorItem[]>(createDefaultPalette);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('random');
  const [showUIPreview, setShowUIPreview] = useState(false);
  const [showGradientView, setShowGradientView] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [activeShadesColor, setActiveShadesColor] = useState<ColorItem | null>(null);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Load saved palettes and query params on mount
  useEffect(() => {
    // 1. Load saved palettes from localStorage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SAVED_KEY);
      if (stored) {
        setSavedPalettes(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved palettes:', e);
    }

    // 2. Check for colors query parameter in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const colorsParam = params.get('colors');
      if (colorsParam) {
        const hexList = parseColorsFromUrlQuery(colorsParam);
        if (hexList && hexList.length >= 2) {
          setPalette(hexList.map((hex) => createColorItem(hex)));
        }
      }
    }
  }, []);

  // Save palettes to localStorage when updated
  const persistSavedPalettes = (updated: SavedPalette[]) => {
    setSavedPalettes(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist saved palettes:', e);
    }
  };

  // Generate / Regenerate unlocked colors
  const handleGenerate = useCallback(() => {
    setPalette((prev) => regeneratePalette(prev, harmonyMode));
  }, [harmonyMode]);

  // Spacebar keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.code === 'Space' && !isInput && !isExportModalOpen && !activeShadesColor) {
        e.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, isExportModalOpen, activeShadesColor]);

  // Lock / Unlock toggle
  const handleToggleLock = (id: string) => {
    setPalette((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isLocked: !c.isLocked } : c))
    );
  };

  // Update specific color hex
  const handleUpdateColor = (id: string, newHex: string) => {
    setPalette((prev) =>
      prev.map((c) => (c.id === id ? createColorItem(newHex, c.id, c.isLocked) : c))
    );
  };

  // Remove color from palette
  const handleRemoveColor = (id: string) => {
    if (palette.length <= 2) return;
    setPalette((prev) => prev.filter((c) => c.id !== id));
  };

  // Add a new color
  const handleAddColor = () => {
    if (palette.length >= 8) return;
    const newColor = createColorItem(generateRandomHex());
    setPalette((prev) => [...prev, newColor]);
  };

  // Reorder colors
  const handleMoveColor = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= palette.length) return;
    setPalette((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // Change color count directly
  const handleChangeColorCount = (count: number) => {
    if (count < 2 || count > 8) return;
    if (count === palette.length) return;

    if (count < palette.length) {
      setPalette((prev) => prev.slice(0, count));
    } else {
      const needed = count - palette.length;
      const additions = Array.from({ length: needed }).map(() =>
        createColorItem(generateRandomHex())
      );
      setPalette((prev) => [...prev, ...additions]);
    }
  };

  // Reset to default ToolNest palette
  const handleResetToDefault = () => {
    setPalette(createDefaultPalette());
    setHarmonyMode('random');
  };

  // Check if current palette is already saved
  const currentHexKey = palette.map((c) => c.hex.toLowerCase()).join('-');
  const isCurrentSaved = savedPalettes.some(
    (p) => p.colors.map((c) => c.toLowerCase()).join('-') === currentHexKey
  );

  // Save current palette to favorites
  const handleSavePalette = () => {
    if (isCurrentSaved) {
      setSaveFeedback('Palette already saved in Library!');
      setTimeout(() => setSaveFeedback(null), 2000);
      return;
    }

    const newSaved: SavedPalette = {
      id: Math.random().toString(36).substring(2, 9),
      name: `${palette[0]?.name || 'Custom'} Palette`,
      colors: palette.map((c) => c.hex),
      createdAt: Date.now(),
    };

    persistSavedPalettes([newSaved, ...savedPalettes]);
    setSaveFeedback('Saved to Library!');
    setTimeout(() => setSaveFeedback(null), 2000);
  };

  // Load palette from saved list or presets
  const handleLoadPalette = (hexes: string[]) => {
    setPalette(hexes.map((hex) => createColorItem(hex)));
  };

  // Delete saved palette
  const handleDeleteSavedPalette = (id: string) => {
    persistSavedPalettes(savedPalettes.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Navigation Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onOpenHelp={() => {}}
        activeToolName="Color Palette Generator"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Compact Hero Section */}
        <ColorPaletteHero />

        {/* Floating Toast Feedback for Saved */}
        {saveFeedback && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#5722AF] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl animate-fade-in">
            {saveFeedback}
          </div>
        )}

        {/* Toolbar with Generation, Harmonies, Count, and Tools */}
        <PaletteToolbar
          onGenerate={handleGenerate}
          harmonyMode={harmonyMode}
          onChangeHarmonyMode={setHarmonyMode}
          colorCount={palette.length}
          onChangeColorCount={handleChangeColorCount}
          onAddColor={handleAddColor}
          canAddColor={palette.length < 8}
          onResetToDefault={handleResetToDefault}
          showUIPreview={showUIPreview}
          onToggleUIPreview={() => setShowUIPreview(!showUIPreview)}
          showGradientView={showGradientView}
          onToggleGradientView={() => setShowGradientView(!showGradientView)}
          onOpenExport={() => setIsExportModalOpen(true)}
          onSavePalette={handleSavePalette}
          isSaved={isCurrentSaved}
          onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
          savedCount={savedPalettes.length}
        />

        {/* Interactive Main Palette Cards Display */}
        <MainPaletteGrid
          palette={palette}
          onToggleLock={handleToggleLock}
          onUpdateColor={handleUpdateColor}
          onRemoveColor={handleRemoveColor}
          onMoveColor={handleMoveColor}
          onOpenShades={(color) => setActiveShadesColor(color)}
          canRemove={palette.length > 2}
        />

        {/* Optional Interactive Website UI Preview */}
        {showUIPreview && (
          <div className="mt-6">
            <PaletteUIPreview
              palette={palette}
              onClose={() => setShowUIPreview(false)}
            />
          </div>
        )}

        {/* Optional CSS Gradient Generator */}
        {showGradientView && (
          <div className="mt-6">
            <GradientGeneratorView
              palette={palette}
              onClose={() => setShowGradientView(false)}
            />
          </div>
        )}

        {/* Comprehensive SEO Content & Color Theory Guidelines */}
        <ColorPaletteSEO />

        {/* Frequently Asked Questions Accordion */}
        <ColorPaletteFAQ />
      </main>

      {/* Shades & Tints Modal */}
      {activeShadesColor && (
        <ColorShadesModal
          color={activeShadesColor}
          onClose={() => setActiveShadesColor(null)}
          onSelectColor={(newHex) => {
            if (activeShadesColor) {
              handleUpdateColor(activeShadesColor.id, newHex);
            }
          }}
        />
      )}

      {/* Export Options Modal */}
      {isExportModalOpen && (
        <PaletteExportModal
          palette={palette}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Saved Palettes Library Drawer */}
      <SavedPalettesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedPalettes={savedPalettes}
        onLoadPalette={handleLoadPalette}
        onDeletePalette={handleDeleteSavedPalette}
      />

      {/* ToolNest Suite Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="color-palette-generator"
      />

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}
