'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Crop,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Split,
  Move,
  Eye,
  Shield,
  Palette,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react';
import {
  CropSettings,
  SocialMediaConfig,
  SocialMediaItem,
  ResizeMode,
  CropPosition,
  BackgroundMode,
} from '@/lib/socialMediaTypes';
import {
  loadImage,
  renderSocialMediaCanvas,
  getTargetDimensions,
} from '@/lib/socialMediaEngine';
import { getPresetById } from '@/lib/socialMediaPresets';
import { ComparisonSlider } from '@/components/compressor/ComparisonSlider';

interface SmartCropEditorProps {
  item: SocialMediaItem;
  config: SocialMediaConfig;
  customCrop?: Partial<CropSettings>;
  onCropChange: (updated: Partial<CropSettings>) => void;
  onResetCrop: () => void;
}

export function SmartCropEditor({
  item,
  config,
  customCrop,
  onCropChange,
  onResetCrop,
}: SmartCropEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<'fit' | '50' | '100' | '200'>('fit');
  const [showSplitView, setShowSplitView] = useState(false);
  const [renderedPreviewUrl, setRenderedPreviewUrl] = useState<string>('');

  const cropSettings: CropSettings = {
    ...config.cropSettings,
    ...(customCrop || {}),
  };

  const preset = getPresetById(config.presetId);
  const { width: targetW, height: targetH } = getTargetDimensions(config);

  // Load image
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

  // Render canvas
  useEffect(() => {
    if (!canvasRef.current || !baseImg) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderSocialMediaCanvas(ctx, baseImg, config, customCrop, true);

    if (showSplitView) {
      // Create temporary blob for split comparison
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
        renderSocialMediaCanvas(offCtx, baseImg, config, customCrop, false);
        offscreen.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setRenderedPreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
          }
        }, 'image/jpeg', 0.9);
      }
    }
  }, [baseImg, config, customCrop, showSplitView]);

  // Pointer drag to pan image inside crop frame
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (cropSettings.mode === 'stretch') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    // Calculate percentage shift relative to canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const shiftPercentX = (deltaX / rect.width) * 100;
    const shiftPercentY = (deltaY / rect.height) * 100;

    const nextPanX = Math.max(-100, Math.min(100, cropSettings.panX + shiftPercentX * 1.5));
    const nextPanY = Math.max(-100, Math.min(100, cropSettings.panY + shiftPercentY * 1.5));

    onCropChange({
      panX: Math.round(nextPanX),
      panY: Math.round(nextPanY),
      position: 'manual',
    });
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
        {/* Left: Target Preset Info Pill */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/25 text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] flex items-center gap-1.5">
            <span>{config.presetId === 'custom' ? 'Custom Size' : preset.name}</span>
            <span>•</span>
            <span className="font-mono">{targetW} × {targetH} px</span>
            <span>({config.presetId === 'custom' ? `${targetW}:${targetH}` : preset.aspectRatio})</span>
          </div>
        </div>

        {/* Right: Zoom & Split View Controls */}
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

          {/* Zoom Buttons */}
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel('fit')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                zoomLevel === 'fit' ? 'bg-[#5722AF] text-white' : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              Fit
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel('50')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                zoomLevel === '50' ? 'bg-[#5722AF] text-white' : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel('100')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                zoomLevel === '100' ? 'bg-[#5722AF] text-white' : 'text-zinc-600 dark:text-zinc-300'
              }`}
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel('200')}
              className={`px-2 py-0.5 text-xs font-medium rounded ${
                zoomLevel === '200' ? 'bg-[#5722AF] text-white' : 'text-zinc-600 dark:text-zinc-300'
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
        className="relative flex-1 min-h-[380px] sm:min-h-[440px] max-h-[620px] bg-zinc-950/5 dark:bg-zinc-950/50 flex items-center justify-center p-4 overflow-auto select-none"
      >
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
              compressedLabel="Resized / Cropped"
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
              className={`max-w-full max-h-[500px] object-contain rounded-lg shadow-xl ring-1 ring-black/10 dark:ring-white/10 ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab hover:ring-2 hover:ring-[#5722AF]'
              }`}
            />

            {cropSettings.mode !== 'stretch' && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/80 backdrop-blur-xs text-[11px] font-medium text-white pointer-events-none shadow-md flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <Move className="w-3 h-3 text-[#9B6BE8]" />
                <span>Click & drag photo to adjust crop frame</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Controls Drawer (Tabs: Mode, Crop & Pan, Background, Orientation) */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-[#11141e] space-y-3.5">
        {/* Row 1: Resize Mode + Safe Area Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Resize Mode Segmented Control */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onCropChange({ mode: 'crop' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cropSettings.mode === 'crop'
                  ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Crop to Fill
            </button>
            <button
              type="button"
              onClick={() => onCropChange({ mode: 'fit' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cropSettings.mode === 'fit'
                  ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Fit Inside
            </button>
            <button
              type="button"
              onClick={() => onCropChange({ mode: 'stretch' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cropSettings.mode === 'stretch'
                  ? 'bg-white dark:bg-[#5722AF] text-[#5722AF] dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              Stretch
            </button>
          </div>

          {/* Quick Safe Area & Smart Subject Toggles */}
          <div className="flex items-center gap-2">
            {preset.hasSafeArea && (
              <button
                type="button"
                onClick={() => onCropChange({ showSafeArea: !cropSettings.showSafeArea })}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  cropSettings.showSafeArea
                    ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Show Safe Areas</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onCropChange({ smartCrop: !cropSettings.smartCrop })}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                cropSettings.smartCrop
                  ? 'bg-[#5722AF]/10 border-[#5722AF]/30 text-[#5722AF] dark:text-[#9B6BE8]'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Subject Center</span>
            </button>

            <button
              type="button"
              onClick={() => onCropChange({ faceSafeCrop: !cropSettings.faceSafeCrop })}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                cropSettings.faceSafeCrop
                  ? 'bg-[#5722AF]/10 border-[#5722AF]/30 text-[#5722AF] dark:text-[#9B6BE8]'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
              }`}
              title="Avoid cropping faces when local detection is available"
            >
              <span>Face-Safe: {cropSettings.faceSafeCrop ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Crop Positions & Zoom slider (when in crop/fit mode) */}
        {cropSettings.mode !== 'stretch' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            {/* Positions */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                <span>Crop Position</span>
                {cropSettings.position === 'manual' && (
                  <span className="text-[11px] text-[#5722AF] dark:text-[#9B6BE8]">
                    Manual Pan: ({cropSettings.panX}%, {cropSettings.panY}%)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {(['top', 'center', 'bottom', 'left', 'right', 'manual'] as CropPosition[]).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() =>
                      onCropChange({
                        position: pos,
                        panX: pos === 'manual' ? cropSettings.panX : 0,
                        panY: pos === 'manual' ? cropSettings.panY : 0,
                      })
                    }
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      cropSettings.position === pos
                        ? 'bg-[#5722AF] text-white shadow-2xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                <span>Crop Zoom</span>
                <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                  {Math.round(cropSettings.zoom * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.05}
                value={cropSettings.zoom}
                onChange={(e) => onCropChange({ zoom: Number(e.target.value) })}
                className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Row 3: Fit Inside Background Options */}
        {cropSettings.mode === 'fit' && (
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Fit Inside Padding Background
              </label>

              <div className="flex items-center gap-1">
                {(['blur', 'white', 'black', 'custom', 'transparent'] as BackgroundMode[]).map(
                  (mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onCropChange({ backgroundMode: mode })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                        cropSettings.backgroundMode === mode
                          ? 'bg-[#5722AF] text-white shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                      }`}
                    >
                      {mode === 'blur' ? 'Blur Photo' : mode}
                    </button>
                  )
                )}
              </div>
            </div>

            {cropSettings.backgroundMode === 'blur' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Blur Radius</span>
                    <span className="font-mono text-[#5722AF]">{cropSettings.blurAmount}px</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={40}
                    value={cropSettings.blurAmount}
                    onChange={(e) => onCropChange({ blurAmount: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    <span>Brightness</span>
                    <span className="font-mono text-[#5722AF]">{cropSettings.blurBrightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={140}
                    value={cropSettings.blurBrightness}
                    onChange={(e) => onCropChange({ blurBrightness: Number(e.target.value) })}
                    className="w-full accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {cropSettings.backgroundMode === 'custom' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                  Custom Color:
                </span>
                <input
                  type="color"
                  value={cropSettings.backgroundColor}
                  onChange={(e) => onCropChange({ backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={cropSettings.backgroundColor}
                  onChange={(e) => onCropChange({ backgroundColor: e.target.value })}
                  className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-700 font-mono w-24"
                />
              </div>
            )}
          </div>
        )}

        {/* Row 4: Orientation & Rotation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onCropChange({ rotation: (cropSettings.rotation - 90 + 360) % 360 })}
              title="Rotate Left 90°"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onCropChange({ rotation: (cropSettings.rotation + 90) % 360 })}
              title="Rotate Right 90°"
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onCropChange({ flipH: !cropSettings.flipH })}
              title="Flip Horizontal"
              className={`p-1.5 rounded-lg border transition-colors ${
                cropSettings.flipH
                  ? 'bg-[#5722AF] text-white border-[#5722AF]'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onCropChange({ flipV: !cropSettings.flipV })}
              title="Flip Vertical"
              className={`p-1.5 rounded-lg border transition-colors ${
                cropSettings.flipV
                  ? 'bg-[#5722AF] text-white border-[#5722AF]'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <FlipVertical className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Fine Rotation:</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={cropSettings.fineRotation}
              onChange={(e) => onCropChange({ fineRotation: Number(e.target.value) })}
              className="w-24 accent-[#5722AF] h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded cursor-pointer"
            />
            <span className="text-xs font-mono text-[#5722AF] w-8">
              {cropSettings.fineRotation}°
            </span>
          </div>

          <button
            type="button"
            onClick={onResetCrop}
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:underline"
          >
            Reset Crop
          </button>
        </div>
      </div>
    </div>
  );
}
