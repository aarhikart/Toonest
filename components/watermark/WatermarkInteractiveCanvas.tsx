'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Split,
  Move,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
} from 'lucide-react';
import { WatermarkConfig, WatermarkItem } from '@/lib/watermarkTypes';
import { loadImage, renderWatermarkOnCanvas } from '@/lib/watermarkEngine';
import { ComparisonSlider } from '@/components/compressor/ComparisonSlider';

interface WatermarkInteractiveCanvasProps {
  item: WatermarkItem;
  config: WatermarkConfig;
  onPositionChange: (xPercent: number, yPercent: number) => void;
}

export function WatermarkInteractiveCanvas({
  item,
  config,
  onPositionChange,
}: WatermarkInteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | '100' | '200'>('fit');
  const [showSplitView, setShowSplitView] = useState(false);
  const [watermarkedPreviewUrl, setWatermarkedPreviewUrl] = useState<string>('');

  // Load base image when item changes
  useEffect(() => {
    let active = true;
    loadImage(item.file)
      .then((img) => {
        if (active) setBaseImg(img);
      })
      .catch((err) => console.error('Failed to load image for canvas preview:', err));

    return () => {
      active = false;
    };
  }, [item.file]);

  // Load logo image when logoUrl changes
  useEffect(() => {
    let active = true;
    if (config.type === 'image' && config.logoUrl) {
      loadImage(config.logoUrl)
        .then((img) => {
          if (active) setLogoImg(img);
        })
        .catch(() => {
          if (active) setLogoImg(null);
        });
    } else {
      setLogoImg(null);
    }
    return () => {
      active = false;
    };
  }, [config.type, config.logoUrl]);

  // Render on canvas whenever base image, logo image, or config changes
  useEffect(() => {
    if (!canvasRef.current || !baseImg) return;

    const canvas = canvasRef.current;
    canvas.width = baseImg.naturalWidth;
    canvas.height = baseImg.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderWatermarkOnCanvas(ctx, baseImg, logoImg, config);

    // If split view is enabled or requested, produce a temporary preview URL
    if (showSplitView) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setWatermarkedPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      }, 'image/jpeg', 0.9);
    }
  }, [baseImg, logoImg, config, showSplitView]);

  // Handle direct canvas drag to position watermark
  const updatePointerPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current || config.isTiled) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      const xPercent = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));

      onPositionChange(Math.round(xPercent), Math.round(yPercent));
    },
    [config.isTiled, onPositionChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (config.isTiled) return;
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

  return (
    <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Top Toolbar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-4 py-2.5 bg-zinc-50/70 dark:bg-[#0f121a] flex flex-wrap items-center justify-between gap-2">
        {/* Left: Info & status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span>{item.originalWidth} × {item.originalHeight} px</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {config.isTiled ? (
              <span className="flex items-center gap-1 text-[#5722AF] dark:text-[#9B6BE8] font-medium">
                <Layers className="w-3 h-3" /> Tiled Mode Active
              </span>
            ) : config.position === 'custom' ? (
              <span className="flex items-center gap-1 text-[#5722AF] dark:text-[#9B6BE8] font-medium">
                <Move className="w-3 h-3" /> Drag Position: {config.customXPercent}%, {config.customYPercent}%
              </span>
            ) : (
              <span className="capitalize">{config.position.replace('-', ' ')}</span>
            )}
          </div>
        </div>

        {/* Right: Zoom & Split View Controls */}
        <div className="flex items-center gap-1.5">
          {/* Split Before/After Toggle */}
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

          {/* Zoom Buttons */}
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

      {/* Main Preview Container */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[380px] sm:min-h-[460px] max-h-[640px] bg-zinc-950/5 dark:bg-zinc-950/50 flex items-center justify-center p-4 overflow-auto select-none"
      >
        {/* Transparency checkerboard background */}
        <div
          className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#9ca3af 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {showSplitView && watermarkedPreviewUrl ? (
          <div className="w-full h-full max-w-2xl max-h-full">
            <ComparisonSlider
              originalUrl={item.previewUrl}
              compressedUrl={watermarkedPreviewUrl}
              originalLabel="Original Photo"
              compressedLabel="With Watermark"
            />
          </div>
        ) : (
          <div
            className={`relative transition-transform duration-150 flex items-center justify-center ${
              zoomLevel === '100'
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
                config.isTiled
                  ? 'cursor-default'
                  : isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab hover:ring-2 hover:ring-[#5722AF]'
              }`}
            />

            {!config.isTiled && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-[11px] font-medium text-white pointer-events-none shadow-md flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <Move className="w-3 h-3 text-[#9B6BE8]" />
                <span>Click & drag on photo to position watermark</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
