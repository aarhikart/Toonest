'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Move,
  RotateCcw,
  Undo2,
  Redo2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { TextLayer, TextOverlayConfig, TextOverlayItem } from '@/lib/textOverlayTypes';
import {
  loadImage,
  renderTextOverlaysOnCanvas,
  measureTextLayer,
  calculateLayerAnchor,
  computeTargetCanvasDimensions,
} from '@/lib/textOverlayEngine';
import { ComparisonSlider } from '@/components/compressor/ComparisonSlider';

interface TextOverlayCanvasProps {
  item: TextOverlayItem;
  config: TextOverlayConfig;
  activeLayer: TextLayer | null;
  onLayerPositionChange: (layerId: string, xPercent: number, yPercent: number) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function TextOverlayCanvas({
  item,
  config,
  activeLayer,
  onLayerPositionChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: TextOverlayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | '50' | '100' | '200'>('fit');
  const [showSplitView, setShowSplitView] = useState(false);
  const [renderedPreviewUrl, setRenderedPreviewUrl] = useState<string>('');

  // Active layer bounding box for visual selection handles
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  } | null>(null);

  // Load base image
  useEffect(() => {
    let active = true;
    loadImage(item.file)
      .then((img) => {
        if (active) setBaseImg(img);
      })
      .catch((err) => console.error('Failed to load image:', err));

    return () => {
      active = false;
    };
  }, [item.file]);

  // Render on canvas whenever layers, base image, or config changes
  useEffect(() => {
    if (!canvasRef.current || !baseImg) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const layersToRender = item.hasCustomOverride && item.customLayers ? item.customLayers : config.layers;

    renderTextOverlaysOnCanvas(ctx, baseImg, layersToRender, config, item.name);

    // Compute bounding box for active layer to display overlay handles
    if (activeLayer && activeLayer.isVisible && activeLayer.text) {
      const { canvasWidth, canvasHeight, scaleFactor } = computeTargetCanvasDimensions(
        baseImg.naturalWidth,
        baseImg.naturalHeight,
        config.socialPreset
      );

      const effectiveScale = config.scaleProportionally ? scaleFactor : 1;
      const { width: blockW, height: blockH } = measureTextLayer(
        ctx,
        activeLayer,
        activeLayer.text,
        effectiveScale
      );

      const anchor = calculateLayerAnchor(
        activeLayer.position,
        canvasWidth,
        canvasHeight,
        blockW,
        blockH,
        activeLayer.marginOffsetX * effectiveScale,
        activeLayer.marginOffsetY * effectiveScale,
        activeLayer.customXPercent,
        activeLayer.customYPercent
      );

      const padding = (activeLayer.boxPadding || 16) * effectiveScale;
      setSelectionBox({
        x: anchor.x,
        y: anchor.y,
        width: blockW + padding * 2,
        height: blockH + padding * 2,
        rotation: activeLayer.rotation,
      });
    } else {
      setSelectionBox(null);
    }

    // Split view blob generator
    if (showSplitView) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setRenderedPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      }, 'image/jpeg', 0.9);
    }
  }, [baseImg, config, item, activeLayer, showSplitView]);

  // Direct canvas drag positioning
  const updatePointerPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current || !activeLayer) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      const xPercent = Math.max(0, Math.min(100, (relX / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, (relY / rect.height) * 100));

      onLayerPositionChange(activeLayer.id, Math.round(xPercent), Math.round(yPercent));
    },
    [activeLayer, onLayerPositionChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeLayer) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePointerPosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      updatePointerPosition(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Keyboard shortcut listener for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (canRedo && onRedo) {
            e.preventDefault();
            onRedo();
          }
        } else {
          if (canUndo && onUndo) {
            e.preventDefault();
            onUndo();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (canRedo && onRedo) {
          e.preventDefault();
          onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Canvas Toolbar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-4 py-2.5 bg-zinc-50/70 dark:bg-[#0f121a] flex flex-wrap items-center justify-between gap-2">
        {/* Left: Info & Undo/Redo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
            <button
              type="button"
              disabled={!canUndo}
              onClick={onUndo}
              title="Undo (Ctrl+Z)"
              className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 disabled:opacity-30 rounded transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={!canRedo}
              onClick={onRedo}
              title="Redo (Ctrl+Shift+Z)"
              className="p-1 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 disabled:opacity-30 rounded transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>{item.originalWidth} × {item.originalHeight} px</span>
          </div>

          {activeLayer && (
            <span className="hidden md:inline-flex text-[11px] text-[#5722AF] dark:text-[#9B6BE8] font-medium items-center gap-1">
              <Move className="w-3 h-3" /> Drag active text
            </span>
          )}
        </div>

        {/* Right: Zoom & Split View */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSplitView(!showSplitView)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              showSplitView
                ? 'bg-[#5722AF] border-[#5722AF] text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-[#5722AF]'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Before / After</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel('fit')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                zoomLevel === 'fit'
                  ? 'bg-[#5722AF] text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel('50')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                zoomLevel === '50'
                  ? 'bg-[#5722AF] text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel('100')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                zoomLevel === '100'
                  ? 'bg-[#5722AF] text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel('200')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                zoomLevel === '200'
                  ? 'bg-[#5722AF] text-white'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              200%
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[380px] sm:min-h-[460px] max-h-[660px] bg-zinc-950/5 dark:bg-zinc-950/50 flex items-center justify-center p-4 overflow-auto select-none"
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#9ca3af 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {showSplitView && renderedPreviewUrl ? (
          <div className="w-full h-full max-w-2xl max-h-full">
            <ComparisonSlider
              originalUrl={item.previewUrl}
              compressedUrl={renderedPreviewUrl}
              originalLabel="Original Photo"
              compressedLabel="With Text Overlay"
            />
          </div>
        ) : (
          <div
            className={`relative transition-transform duration-150 flex items-center justify-center ${
              zoomLevel === '50'
                ? 'scale-50'
                : zoomLevel === '100'
                ? 'scale-100'
                : zoomLevel === '200'
                ? 'scale-200'
                : 'max-w-full max-h-full'
            }`}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`max-w-full max-h-[520px] object-contain rounded-lg shadow-xl ring-1 ring-black/10 dark:ring-white/10 ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab hover:ring-2 hover:ring-[#5722AF]'
              }`}
            />

            {/* Quick Helper Floating Pill */}
            {activeLayer && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-xs text-[11px] font-medium text-white pointer-events-none shadow-md flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <Move className="w-3 h-3 text-[#9B6BE8]" />
                <span>Click & drag on photo to position &quot;{activeLayer.name}&quot;</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
