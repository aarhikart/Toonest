'use client';

import React, { useState, useRef } from 'react';
import {
  CleaningMode,
  CleaningOptions,
  SelectedCategories,
  ReencodeSettings,
  AntiFingerprintSettings,
  TransparentLayerSettings,
} from '@/lib/video-metadata/types';
import {
  Sparkles,
  Sliders,
  RefreshCw,
  ShieldCheck,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  Volume2,
  Maximize2,
  Palette,
  Layers,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface CleaningOptionsCardProps {
  onStartCleaning: (options: CleaningOptions) => void;
  isProcessing: boolean;
  sessionId?: string;
}

export function CleaningOptionsCard({
  onStartCleaning,
  isProcessing,
  sessionId,
}: CleaningOptionsCardProps) {
  const [mode, setMode] = useState<CleaningMode>('transparent_layer');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Transparent Layer State
  const [tlSettings, setTlSettings] = useState<TransparentLayerSettings>({
    layerType: 'transparent_sheen',
    opacity: 0.03, // 3%
    layerColor: 'white',
    hasCustomImage: false,
  });
  const [isUploadingCustomLayer, setIsUploadingCustomLayer] = useState(false);
  const [customLayerName, setCustomLayerName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Anti-Fingerprint State
  const [afSettings, setAfSettings] = useState<AntiFingerprintSettings>({
    preset: 'standard',
    audioSpeedShift: 1.025, // +2.5%
    audioFreqFilter: true,
    microZoomPercent: 3, // 3%
    colorGrading: true,
    microNoise: true,
    horizontalFlip: false,
    targetFps: 30,
  });

  // Selected Categories State
  const [selectedCats, setSelectedCats] = useState<SelectedCategories>({
    creationDate: true,
    location: true,
    deviceInfo: true,
    cameraInfo: true,
    softwareEncoder: true,
    titleAuthor: true,
    copyright: true,
    commentDescription: true,
    chapters: true,
    customTags: true,
  });

  // Re-encode State
  const [reencodeSettings, setReencodeSettings] = useState<ReencodeSettings>({
    videoCodec: 'libx264',
    qualityPreset: 'balanced',
    audioCodec: 'copy',
    audioBitrate: '192k',
  });

  const handleCategoryToggle = (key: keyof SelectedCategories) => {
    setSelectedCats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePresetSelect = (preset: 'standard' | 'aggressive' | 'light') => {
    if (preset === 'standard') {
      setAfSettings({
        preset: 'standard',
        audioSpeedShift: 1.025,
        audioFreqFilter: true,
        microZoomPercent: 3,
        colorGrading: true,
        microNoise: true,
        horizontalFlip: false,
        targetFps: 30,
      });
    } else if (preset === 'aggressive') {
      setAfSettings({
        preset: 'aggressive',
        audioSpeedShift: 1.035,
        audioFreqFilter: true,
        microZoomPercent: 4,
        colorGrading: true,
        microNoise: true,
        horizontalFlip: true,
        targetFps: 30,
      });
    } else {
      setAfSettings({
        preset: 'light',
        audioSpeedShift: 1.015,
        audioFreqFilter: false,
        microZoomPercent: 2,
        colorGrading: true,
        microNoise: false,
        horizontalFlip: false,
        targetFps: 30,
      });
    }
  };

  const handleCustomLayerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;
    setIsUploadingCustomLayer(true);
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('file', file);
      const res = await fetch('/api/video-metadata/upload-layer', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomLayerName(file.name);
        setTlSettings((prev) => ({
          ...prev,
          layerType: 'custom_image',
          hasCustomImage: true,
        }));
      } else {
        alert(data.error || 'Failed to upload custom frame layer.');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading layer file.');
    } finally {
      setIsUploadingCustomLayer(false);
    }
  };

  const handleStart = () => {
    onStartCleaning({
      mode,
      transparentLayerSettings: mode === 'transparent_layer' ? tlSettings : undefined,
      antiFingerprintSettings: mode === 'anti_fingerprint' ? afSettings : undefined,
      selectedCategories: mode === 'selected' ? selectedCats : undefined,
      reencodeSettings: mode === 'reencode' ? reencodeSettings : undefined,
      removeChapters: mode !== 'transparent_layer',
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
            Step 2: Choose Cleaning & Protection Mode
          </span>
          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            Transparent Frame Layer & Protection Settings
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Original Video Protected</span>
        </div>
      </div>

      {/* Mode Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Mode 1: Transparent Frame / Layer Shield (Hero Feature) */}
        <div
          onClick={() => setMode('transparent_layer')}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
            mode === 'transparent_layer'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/40 shadow-sm'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div className="absolute top-3.5 right-3.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white tracking-wide uppercase">
              Full Frame Layer
            </span>
          </div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              Transparent Layer Shield
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Adds a full width & height transparent layer/frame on top. Alters visual hash while keeping video & audio intact.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-indigo-100 dark:border-indigo-950/60 text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
            ✓ 100% Quality & Audio Untouched
          </div>
        </div>

        {/* Mode 2: Anti-Fingerprint Content ID Shield */}
        <div
          onClick={() => setMode('anti_fingerprint')}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
            mode === 'anti_fingerprint'
              ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 ring-2 ring-rose-500/30 shadow-sm'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div className="absolute top-3.5 right-3.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white tracking-wide uppercase">
              Acoustic & Zoom
            </span>
          </div>

          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              Anti-Copyright Shield
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Tempo shift (+2.5%), micro-zoom (3%), and color grading to break automated waveform and frame matchers.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-rose-100 dark:border-rose-950/60 text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
            ✓ Audio & Video Desync
          </div>
        </div>

        {/* Mode 3: Clean Metadata Only */}
        <div
          onClick={() => setMode('all')}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
            mode === 'all'
              ? 'border-[#5722AF] bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-[#5722AF]/30 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Clean Metadata Only
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Fast stream-copy. Strips GPS, camera, dates, and author tags with zero video re-encoding.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            Stream-copy (instant)
          </div>
        </div>

        {/* Mode 4: Custom Tag Selection */}
        <div
          onClick={() => setMode('selected')}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
            mode === 'selected'
              ? 'border-[#5722AF] bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-[#5722AF]/30 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
              <Sliders className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Custom Tag Selection
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Granular checkboxes to pick specific tags to keep or remove.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            Selective tag removal
          </div>
        </div>

        {/* Mode 5: Deep Clean & Re-Encode */}
        <div
          onClick={() => setMode('reencode')}
          className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
            mode === 'reencode'
              ? 'border-[#5722AF] bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-[#5722AF]/30 shadow-xs'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
          }`}
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Re-Encode Video
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Standard re-encode. Rebuilds fresh H.264 video streams.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            Re-encodes video stream
          </div>
        </div>
      </div>

      {/* MODE 1 CONFIGURATION: Transparent Frame & Overlay Shield */}
      {mode === 'transparent_layer' && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-5 sm:p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-5 animate-in fade-in">
          <div>
            <h4 className="text-sm font-black text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Full-Screen Transparent Layer Options</span>
            </h4>
            <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-1">
              Fuses an overlay layer covering the 100% full width and height of the video canvas. The video looks identical to human eyes, but modifies algorithmic pixel hashes.
            </p>
          </div>

          {/* Layer Style Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Style 1: Sheen */}
            <div
              onClick={() => setTlSettings({ ...tlSettings, layerType: 'transparent_sheen' })}
              className={`cursor-pointer p-3.5 rounded-xl border text-xs transition-all ${
                tlSettings.layerType === 'transparent_sheen'
                  ? 'bg-white dark:bg-zinc-900 border-indigo-600 ring-2 ring-indigo-500/30'
                  : 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300'
              }`}
            >
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Transparent Sheen</span>
                {tlSettings.layerType === 'transparent_sheen' && (
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Full-screen 3% micro-transparency layer. Invisible to human eyes.
              </p>
            </div>

            {/* Style 2: Frame Border */}
            <div
              onClick={() => setTlSettings({ ...tlSettings, layerType: 'transparent_frame' })}
              className={`cursor-pointer p-3.5 rounded-xl border text-xs transition-all ${
                tlSettings.layerType === 'transparent_frame'
                  ? 'bg-white dark:bg-zinc-900 border-indigo-600 ring-2 ring-indigo-500/30'
                  : 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300'
              }`}
            >
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Transparent Frame</span>
                {tlSettings.layerType === 'transparent_frame' && (
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Full-screen layer with subtle micro-border around the outer edges.
              </p>
            </div>

            {/* Style 3: Dynamic Film Grain */}
            <div
              onClick={() => setTlSettings({ ...tlSettings, layerType: 'film_grain' })}
              className={`cursor-pointer p-3.5 rounded-xl border text-xs transition-all ${
                tlSettings.layerType === 'film_grain'
                  ? 'bg-white dark:bg-zinc-900 border-indigo-600 ring-2 ring-indigo-500/30'
                  : 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300'
              }`}
            >
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Dynamic Film Grain</span>
                {tlSettings.layerType === 'film_grain' && (
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Dynamic microscopic texture layer across the entire video canvas.
              </p>
            </div>

            {/* Style 4: Upload Custom PNG Frame */}
            <div
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className={`cursor-pointer p-3.5 rounded-xl border text-xs transition-all ${
                tlSettings.layerType === 'custom_image'
                  ? 'bg-white dark:bg-zinc-900 border-indigo-600 ring-2 ring-indigo-500/30'
                  : 'bg-white/60 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-indigo-300'
              }`}
            >
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                <span>Upload PNG Layer</span>
                {tlSettings.layerType === 'custom_image' && (
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                {customLayerName ? customLayerName : 'Click to select PNG frame from PC'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleCustomLayerUpload}
              />
            </div>
          </div>

          {/* Opacity Control (for sheen & frame) */}
          {tlSettings.layerType !== 'custom_image' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-indigo-200/60 dark:border-indigo-900/40">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Layer Opacity: {(tlSettings.opacity * 100).toFixed(0)}%
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Lower is more invisible; 3% to 5% is optimal to alter frame hash signatures.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={Math.round(tlSettings.opacity * 100)}
                  onChange={(e) =>
                    setTlSettings({ ...tlSettings, opacity: Number(e.target.value) / 100 })
                  }
                  className="w-36 accent-indigo-600 cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTlSettings({ ...tlSettings, layerColor: 'white' })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      tlSettings.layerColor === 'white'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-2xs border border-indigo-300'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => setTlSettings({ ...tlSettings, layerColor: 'black' })}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      tlSettings.layerColor === 'black'
                        ? 'bg-zinc-900 text-white shadow-2xs border border-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          )}

          {isUploadingCustomLayer && (
            <div className="text-xs font-semibold text-indigo-600 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading custom layer...</span>
            </div>
          )}
        </div>
      )}

      {/* MODE 2 CONFIGURATION: Anti-Fingerprint Content ID Options */}
      {mode === 'anti_fingerprint' && (
        <div className="bg-rose-50/40 dark:bg-rose-950/20 p-5 sm:p-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-600" />
                <span>Anti-Fingerprint Preset Configuration</span>
              </h4>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
                Desynchronizes acoustic waveform harmonics & spatial visual keyframes.
              </p>
            </div>

            <div className="inline-flex rounded-xl p-1 bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900 shadow-2xs self-start sm:self-auto">
              {(['standard', 'aggressive', 'light'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    afSettings.preset === p
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {p === 'standard' ? 'Standard (DEMIC Fix)' : p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-200/80 dark:border-rose-900/40 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Audio Tempo Shift</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                +{((afSettings.audioSpeedShift - 1) * 100).toFixed(1)}% speed & frequency shift.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-200/80 dark:border-rose-900/40 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                <Maximize2 className="w-3.5 h-3.5 text-rose-500" />
                <span>3% Micro-Zoom & Crop</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Breaks frame edge-detection & pixel bounding hashes.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-200/80 dark:border-rose-900/40 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                <Palette className="w-3.5 h-3.5 text-rose-500" />
                <span>Micro Color Grade</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Subtle contrast and saturation grade shifts color buckets.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-200/80 dark:border-rose-900/40 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Invisible Pixel Grain</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Alters 100% of cryptographic pixel hashes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3/4 CONFIGURATION: Category Checkboxes */}
      {mode === 'selected' && (
        <div className="bg-zinc-50 dark:bg-zinc-800/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Select metadata categories to strip:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {Object.entries({
              creationDate: 'Creation Dates & Timestamps',
              location: 'GPS & Location Data',
              deviceInfo: 'Device Make & Model',
              cameraInfo: 'Camera Hardware & Lens',
              softwareEncoder: 'Software & Encoder Library',
              titleAuthor: 'Title, Author & Artist',
              copyright: 'Copyright Notice',
              commentDescription: 'Comments & Description',
              chapters: 'Chapters & Bookmarks',
              customTags: 'Custom Metadata Tags',
            }).map(([key, label]) => {
              const isChecked = selectedCats[key as keyof SelectedCategories];
              return (
                <label
                  key={key}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-zinc-300"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(key as keyof SelectedCategories)}
                    className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF]"
                  />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 5 CONFIGURATION: Re-Encode Settings */}
      {mode === 'reencode' && (
        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-4 text-xs animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Video Codec:
              </label>
              <select
                value={reencodeSettings.videoCodec}
                onChange={(e) =>
                  setReencodeSettings({
                    ...reencodeSettings,
                    videoCodec: e.target.value as any,
                  })
                }
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="libx264">H.264 / AVC (Most Compatible)</option>
                <option value="libx265">H.265 / HEVC (Higher Efficiency)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Quality Preset:
              </label>
              <select
                value={reencodeSettings.qualityPreset}
                onChange={(e) =>
                  setReencodeSettings({
                    ...reencodeSettings,
                    qualityPreset: e.target.value as any,
                  })
                }
                className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                <option value="high">High Quality (CRF 18)</option>
                <option value="balanced">Balanced Quality & Size (CRF 23)</option>
                <option value="small">Smaller File Size (CRF 28)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Expandable Settings */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <span>Advanced Cleaning Options</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs space-y-2 animate-in fade-in">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" defaultChecked disabled className="rounded text-[#5722AF]" />
              <span>Enable Bitexact Mode (prevents FFmpeg from appending its own encoder signature)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" defaultChecked disabled className="rounded text-[#5722AF]" />
              <span>Run post-processing FFprobe verification on output file</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" defaultChecked disabled className="rounded text-[#5722AF]" />
              <span>Faststart optimization for immediate web playback</span>
            </label>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-end pt-2">
        <button
          type="button"
          disabled={isProcessing}
          onClick={handleStart}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
            mode === 'transparent_layer'
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25 hover:shadow-lg'
              : mode === 'anti_fingerprint'
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25 hover:shadow-lg'
              : 'bg-[#5722AF] hover:bg-[#682BC9] shadow-[#5722AF]/25 hover:shadow-lg'
          }`}
        >
          {mode === 'transparent_layer' ? (
            <>
              <Layers className="w-4 h-4" />
              <span>Apply Transparent Layer & Download Video</span>
            </>
          ) : mode === 'anti_fingerprint' ? (
            <>
              <ShieldAlert className="w-4 h-4" />
              <span>Apply Anti-Copyright Shield & Clean MP4</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Remove Metadata & Create Clean MP4</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
