'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Split } from 'lucide-react';

interface ComparisonSliderProps {
  originalUrl: string;
  compressedUrl: string;
  originalLabel?: string;
  compressedLabel?: string;
}

export function ComparisonSlider({
  originalUrl,
  compressedUrl,
  originalLabel = 'Original',
  compressedLabel = 'Compressed',
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | '100' | '200'>('fit');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percent);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) handleMove(e.touches[0].clientX);
    };
    const onMouseUpGlobal = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUpGlobal);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onMouseUpGlobal);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUpGlobal);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUpGlobal);
    };
  }, [isDragging, handleMove]);

  // Zoom styles
  const zoomStyle =
    zoomLevel === '100'
      ? 'w-auto max-w-none h-auto'
      : zoomLevel === '200'
      ? 'w-[200%] max-w-none h-auto'
      : 'w-full h-full object-contain';

  return (
    <div className="space-y-3">
      {/* Zoom and Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
          <Split className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Interactive Quality Comparison (Drag Slider)</span>
        </div>

        {/* Zoom Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#1a202e] p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
          <button
            type="button"
            onClick={() => setZoomLevel('fit')}
            className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
              zoomLevel === 'fit'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel('100')}
            className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
              zoomLevel === '100'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel('200')}
            className={`px-2.5 py-0.5 rounded-lg font-medium transition-all ${
              zoomLevel === '200'
                ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            200%
          </button>
        </div>
      </div>

      {/* Comparison Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        className="relative w-full h-80 sm:h-96 rounded-2xl bg-zinc-100 dark:bg-[#0c0e14] border border-zinc-200 dark:border-zinc-800 overflow-hidden select-none cursor-ew-resize flex items-center justify-center"
      >
        {/* Compressed Layer (Full Background) */}
        <div className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={compressedUrl}
            alt={compressedLabel}
            className={`${zoomStyle} pointer-events-none rounded-xl`}
          />
        </div>

        {/* Original Layer (Clipped at sliderPosition%) */}
        <div
          className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt={originalLabel}
            className={`${zoomStyle} pointer-events-none rounded-xl`}
          />
        </div>

        {/* Draggable Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-20 flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1a202e] border-2 border-[#5722AF] shadow-md flex items-center justify-center text-xs font-bold text-[#5722AF] -ml-0.5">
            ⇄
          </div>
        </div>

        {/* Badges on top */}
        <div className="absolute top-3 left-3 z-30 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-xs text-white shadow-xs">
            {originalLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-30 pointer-events-none">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#5722AF]/80 backdrop-blur-xs text-white shadow-xs">
            {compressedLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
        <span>&larr; Drag left for Compressed</span>
        <span>Drag right for Original &rarr;</span>
      </div>
    </div>
  );
}
