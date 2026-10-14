'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Scissors,
  Clock,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  Film,
  FileArchive,
  Hash,
  Upload,
  Video,
  Trash2,
  Loader2,
  AlertCircle,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { VideoCutterSession, formatSecondsToTime } from '@/lib/video-cutter/types';

interface ClipSettingsCardProps {
  session: VideoCutterSession;
  onStartCutting: (
    clipDurationSeconds: number,
    overlayWatermark: boolean,
    includeEndingVideo: boolean,
    includeLogo: boolean
  ) => void;
  isProcessing: boolean;
  onUploadEndingVideo: (file: File) => Promise<void>;
  onRemoveEndingVideo: () => Promise<void>;
  isUploadingEnding: boolean;
  endingError: string | null;
  onUploadLogo: (file: File) => Promise<void>;
  onRemoveLogo: () => Promise<void>;
  isUploadingLogo: boolean;
  logoError: string | null;
}

const PRESET_DURATIONS = [
  { label: '1 Min', seconds: 60, desc: 'Short reels / clips' },
  { label: '2 Mins', seconds: 120, desc: 'Quick previews' },
  { label: '5 Mins', seconds: 300, desc: 'Social clips' },
  { label: '10 Mins (Standard)', seconds: 600, desc: 'Recommended standard split' },
  { label: '15 Mins', seconds: 900, desc: 'Episode chunks' },
  { label: '20 Mins', seconds: 1200, desc: 'Show segments' },
  { label: '30 Mins', seconds: 1800, desc: 'Half-hour parts' },
  { label: '60 Mins', seconds: 3600, desc: '1-Hour segments' },
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function ClipSettingsCard({
  session,
  onStartCutting,
  isProcessing,
  onUploadEndingVideo,
  onRemoveEndingVideo,
  isUploadingEnding,
  endingError,
  onUploadLogo,
  onRemoveLogo,
  isUploadingLogo,
  logoError,
}: ClipSettingsCardProps) {
  // Default to 10 minutes (600 seconds) as specifically requested
  const [selectedSeconds, setSelectedSeconds] = useState<number>(600);
  const [customMinutes, setCustomMinutes] = useState<string>('10');
  const [customSeconds, setCustomSeconds] = useState<string>('0');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [overlayWatermark, setOverlayWatermark] = useState<boolean>(false);
  const [includeEndingVideo, setIncludeEndingVideo] = useState<boolean>(true);
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [showScheduleBreakdown, setShowScheduleBreakdown] = useState<boolean>(true);
  const [isDraggingEnding, setIsDraggingEnding] = useState<boolean>(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState<boolean>(false);

  const endingInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  // Compute active clip duration in seconds
  const activeClipSeconds = useMemo(() => {
    if (isCustomMode) {
      const m = parseInt(customMinutes, 10) || 0;
      const s = parseInt(customSeconds, 10) || 0;
      const total = m * 60 + s;
      return Math.max(1, total);
    }
    return selectedSeconds;
  }, [isCustomMode, customMinutes, customSeconds, selectedSeconds]);

  // Compute planned clip schedule
  const schedule = useMemo(() => {
    const totalVideoSecs = session.duration || 1;
    const segSecs = activeClipSeconds;
    const count = Math.ceil(totalVideoSecs / segSecs) || 1;

    const list: Array<{
      index: number;
      startSec: number;
      endSec: number;
      startFormatted: string;
      endFormatted: string;
      durationFormatted: string;
    }> = [];

    for (let i = 0; i < count; i++) {
      const start = i * segSecs;
      const end = Math.min((i + 1) * segSecs, totalVideoSecs);
      const dur = Math.max(1, end - start);

      list.push({
        index: i + 1,
        startSec: start,
        endSec: end,
        startFormatted: formatSecondsToTime(start),
        endFormatted: formatSecondsToTime(end),
        durationFormatted: formatSecondsToTime(dur),
      });
    }

    return {
      totalClips: count,
      clips: list,
    };
  }, [session.duration, activeClipSeconds]);

  const handleSelectPreset = (secs: number) => {
    setIsCustomMode(false);
    setSelectedSeconds(secs);
    setCustomMinutes(Math.floor(secs / 60).toString());
    setCustomSeconds((secs % 60).toString());
  };

  const handleCustomChange = (mins: string, secs: string) => {
    setIsCustomMode(true);
    setCustomMinutes(mins);
    setCustomSeconds(secs);
  };

  const handleEndingFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onUploadEndingVideo(files[0]);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleEndingDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingEnding(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadEndingVideo(e.dataTransfer.files[0]);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onUploadLogo(files[0]);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadLogo(e.dataTransfer.files[0]);
    }
  };

  const handleExecute = () => {
    if (activeClipSeconds < 1) {
      alert('Please enter a clip duration of at least 1 second.');
      return;
    }
    const hasActiveEnding = Boolean(includeEndingVideo && session.endingVideo);
    const hasActiveLogo = Boolean(includeLogo && session.logoImage);
    onStartCutting(activeClipSeconds, overlayWatermark, hasActiveEnding, hasActiveLogo);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white">
              Configure Clip Duration &amp; Naming
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Clips will be automatically named <strong className="text-zinc-800 dark:text-zinc-200 font-mono">video1, video2, video3</strong> with <strong className="text-zinc-800 dark:text-zinc-200">Part #1, Part #2</strong> in the top-left corner.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#5722AF] dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
          <Clock className="w-3.5 h-3.5" />
          <span>Total: {session.formattedDuration}</span>
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
          <span>Choose Target Clip Duration</span>
          <span className="text-[11px] text-[#5722AF] dark:text-[#9B6BE8] font-semibold lowercase">
            Default: 10 minutes
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_DURATIONS.map((preset) => {
            const isSelected = !isCustomMode && selectedSeconds === preset.seconds;
            return (
              <button
                key={preset.seconds}
                type="button"
                onClick={() => handleSelectPreset(preset.seconds)}
                disabled={isProcessing}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#5722AF] dark:border-[#9B6BE8] bg-purple-50/80 dark:bg-purple-950/40 shadow-xs ring-2 ring-[#5722AF]/20 dark:ring-[#9B6BE8]/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-black text-sm ${
                      isSelected
                        ? 'text-[#5722AF] dark:text-[#9B6BE8]'
                        : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {preset.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8] shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                  {preset.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Duration Inputs */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Or Enter Custom Duration:</span>
          </span>
          {isCustomMode && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Custom Active
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="999"
              value={customMinutes}
              onChange={(e) => handleCustomChange(e.target.value, customSeconds)}
              disabled={isProcessing}
              placeholder="10"
              className="w-20 px-3 py-1.5 text-center font-mono font-bold text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#5722AF] text-zinc-900 dark:text-white"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Minutes</span>
          </div>

          <span className="text-zinc-400 dark:text-zinc-500 font-bold">:</span>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="59"
              value={customSeconds}
              onChange={(e) => handleCustomChange(customMinutes, e.target.value)}
              disabled={isProcessing}
              placeholder="00"
              className="w-20 px-3 py-1.5 text-center font-mono font-bold text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#5722AF] text-zinc-900 dark:text-white"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Seconds</span>
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono sm:ml-auto">
            Clip Length: <strong className="text-zinc-900 dark:text-white font-bold">{formatSecondsToTime(activeClipSeconds)}</strong>
          </div>
        </div>
      </div>

      {/* Burn Part # Watermark Option Toggle */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Burn &quot;Part #1, Part #2&quot; directly into top-left of video frames</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Permanently writes the &quot;Part #X&quot; badge onto the actual video file stream
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={overlayWatermark}
            onChange={(e) => setOverlayWatermark(e.target.checked)}
            disabled={isProcessing}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-hidden rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-700 peer-checked:bg-[#5722AF]"></div>
        </label>
      </div>

      {/* LOGO BRANDING OVERLAY (Top-Right Corner) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white">
                  Logo Watermark (Top-Right Corner) — Optional
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
                  Top-Right on All Clips
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Upload your brand logo (PNG / JPG / WebP) to automatically scale and overlay onto the top-right corner of all generated clips.
              </p>
            </div>
          </div>

          {session.logoImage && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer">
                <span>Overlay on clips</span>
                <input
                  type="checkbox"
                  checked={includeLogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  disabled={isProcessing}
                  className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF] cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* Hidden File Input for Logo Image */}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
          onChange={handleLogoFileChange}
          disabled={isProcessing || isUploadingLogo}
          className="hidden"
        />

        {/* Logo Error Banner */}
        {logoError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{logoError}</span>
          </div>
        )}

        {/* Upload State / Dropzone / Preview */}
        {isUploadingLogo ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900/60 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-7 h-7 text-[#5722AF] dark:text-[#9B6BE8] animate-spin" />
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Uploading &amp; Analyzing Logo Image...
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Checking dimensions and optimizing transparency for video overlay.
              </p>
            </div>
          </div>
        ) : session.logoImage ? (
          /* Logo Preview Card with Mock Video Corner */
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Mock Video Canvas Box demonstrating Top-Right Corner Placement */}
              <div className="relative w-full sm:w-60 aspect-video bg-gradient-to-tr from-zinc-950 to-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 group shadow-inner flex items-center justify-center">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#9B6BE8_1px,transparent_1px)] [background-size:12px_12px]" />
                
                <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 select-none">
                  Video Canvas Preview
                </div>

                {/* Top-Right Corner Logo Simulation */}
                <div className="absolute top-2.5 right-2.5 z-10 p-1 rounded-lg bg-black/40 backdrop-blur-xs border border-white/10 shadow-lg max-w-[45%] max-h-[45%] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={session.logoImage.previewUrl || `/api/video-cutter/logo?sessionId=${session.sessionId}`}
                    alt="Logo Preview"
                    className="max-h-8 max-w-full object-contain"
                  />
                </div>

                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-zinc-400">
                  Top-Right Corner
                </div>
              </div>

              {/* Logo Metadata & Actions */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-mono text-[11px] font-black border border-purple-200/80 dark:border-purple-800/60">
                    Logo Watermark
                  </span>
                  <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white truncate" title={session.logoImage.filename}>
                    {session.logoImage.filename}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Dimensions</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{session.logoImage.width}x{session.logoImage.height}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Position</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">Top-Right</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Size</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{formatBytes(session.logoImage.fileSize)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>Replace Logo</span>
                  </button>

                  <button
                    type="button"
                    onClick={onRemoveLogo}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Upload Dropzone when no logo */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingLogo(true);
            }}
            onDragLeave={() => setIsDraggingLogo(false)}
            onDrop={handleLogoDrop}
            onClick={() => logoInputRef.current?.click()}
            className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
              isDraggingLogo
                ? 'border-[#5722AF] bg-purple-50/70 dark:bg-purple-950/30'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>Click or drop brand logo here</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  PNG / JPG / WebP
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Transparent PNG or icon image to place at the top-right corner of all clips. Scaled automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ENDING VIDEO OPTION (Appended to the end of every generated clip) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white">
                  Ending Video (Outro Clip) — Optional
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 border border-purple-200 dark:border-purple-800/80">
                  Appends to Every Clip
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Upload a short video (e.g. 4-second outro or logo) to automatically attach to the end of all cut clips.
              </p>
            </div>
          </div>

          {session.endingVideo && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer">
                <span>Include in clips</span>
                <input
                  type="checkbox"
                  checked={includeEndingVideo}
                  onChange={(e) => setIncludeEndingVideo(e.target.checked)}
                  disabled={isProcessing}
                  className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF] cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* Hidden File Input for Ending Video */}
        <input
          ref={endingInputRef}
          type="file"
          accept=".mp4,video/mp4,.mkv,video/x-matroska,video/mkv"
          onChange={handleEndingFileChange}
          disabled={isProcessing || isUploadingEnding}
          className="hidden"
        />

        {/* Ending Video Error Banner */}
        {endingError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{endingError}</span>
          </div>
        )}

        {/* Upload State / Dropzone / Preview */}
        {isUploadingEnding ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-900/60 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-7 h-7 text-[#5722AF] dark:text-[#9B6BE8] animate-spin" />
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Uploading &amp; Normalizing Ending Video...
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Harmonizing resolution, framerate, and audio to seamlessly match your main video.
              </p>
            </div>
          </div>
        ) : session.endingVideo ? (
          /* Ending Video Preview Card with Part # Badge (same UI as Part #1, Part #2) */
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Video Player Box with Part # in TOP-LEFT CORNER */}
              <div className="relative w-full sm:w-60 aspect-video bg-black rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 group shadow-inner">
                {/* Top-Left Corner Badge matching Part #1, Part #2, Part #3 styling */}
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-white font-black text-[11px] shadow-lg border border-white/20 flex items-center gap-1.5 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-[#9B6BE8] animate-pulse" />
                  <span>Part # Ending • Outro</span>
                </div>

                <video
                  src={session.endingVideo.previewUrl || `/api/video-cutter/clip/${session.sessionId}/${session.endingVideo.filename}`}
                  preload="metadata"
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Ending Video Metadata & Actions */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-mono text-[11px] font-black border border-purple-200/80 dark:border-purple-800/60">
                    Ending Video
                  </span>
                  <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white truncate" title={session.endingVideo.filename}>
                    {session.endingVideo.filename}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Duration</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{session.endingVideo.formattedDuration}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Resolution</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{session.endingVideo.width}x{session.endingVideo.height}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Size</span>
                    <strong className="text-zinc-900 dark:text-white font-bold">{formatBytes(session.endingVideo.fileSize)}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => endingInputRef.current?.click()}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-[#5722AF] dark:text-[#9B6BE8]" />
                    <span>Replace Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={onRemoveEndingVideo}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Upload Dropzone when no ending video */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingEnding(true);
            }}
            onDragLeave={() => setIsDraggingEnding(false)}
            onDrop={handleEndingDrop}
            onClick={() => endingInputRef.current?.click()}
            className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
              isDraggingEnding
                ? 'border-[#5722AF] bg-purple-50/70 dark:bg-purple-950/30'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-[#5722AF] dark:hover:border-[#9B6BE8] bg-white dark:bg-zinc-900'
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>Click or drop ending video here</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  MP4 / MKV
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Upload a 2–10 second outro/credits clip to append to the end of every cut segment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Slicing Summary & Timeline Preview */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-purple-50/40 to-transparent dark:from-purple-950/30 dark:via-zinc-900/50 dark:to-transparent border border-purple-200/80 dark:border-purple-800/60 space-y-4">
        {/* Dynamic Calculation Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs text-[#5722AF] dark:text-[#9B6BE8] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Automatic Slicing Calculation</span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              For your <strong className="text-zinc-950 dark:text-white font-black">{session.formattedDuration}</strong> video cut into{' '}
              <strong className="text-[#5722AF] dark:text-[#9B6BE8] font-black">
                {Math.round(activeClipSeconds / 60) >= 1 ? `${Math.round(activeClipSeconds / 60)} min` : `${activeClipSeconds}s`}
              </strong>{' '}
              segments:
              {includeEndingVideo && session.endingVideo && (
                <span className="block text-xs font-normal text-[#5722AF] dark:text-[#9B6BE8] mt-0.5">
                  &bull; Plus {session.endingVideo.formattedDuration} Ending Video appended to the end of each clip.
                </span>
              )}
              {includeLogo && session.logoImage && (
                <span className="block text-xs font-normal text-[#5722AF] dark:text-[#9B6BE8] mt-0.5">
                  &bull; Plus Logo Watermark overlaid on top-right corner of each clip.
                </span>
              )}
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800/80 shadow-xs flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">Output</div>
              <div className="text-lg font-black font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                {schedule.totalClips} Clips
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Planned Clip Schedule Accordion */}
        <div className="pt-2 border-t border-purple-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowScheduleBreakdown((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition cursor-pointer py-1"
          >
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
              <span>Preview Clip Names &amp; Time Ranges ({schedule.totalClips} clips)</span>
            </span>
            {showScheduleBreakdown ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {showScheduleBreakdown && (
            <div className="mt-3 max-h-56 overflow-y-auto pr-1 space-y-1.5 rounded-xl">
              {schedule.clips.map((clip) => {
                const fileExt = (session.originalFilename || '').toLowerCase().endsWith('.mkv') ? '.mkv' : '.mp4';
                return (
                  <div
                    key={clip.index}
                    className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-purple-100 dark:border-zinc-800 text-xs flex items-center justify-between font-mono shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 text-[10px] font-black border border-purple-200/80 dark:border-purple-800/60">
                        Part #{clip.index}
                      </span>
                      <span className="font-bold text-zinc-900 dark:text-white">
                        video{clip.index}{fileExt}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <span className="text-zinc-800 dark:text-zinc-200 font-bold">
                        {clip.startFormatted} &rarr; {clip.endFormatted}
                      </span>
                      {includeEndingVideo && session.endingVideo && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 text-[10px] font-semibold border border-purple-200/60 dark:border-purple-800/60">
                          +{session.endingVideo.formattedDuration} Outro
                        </span>
                      )}
                      <span className="hidden sm:inline px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] border border-zinc-200/60 dark:border-zinc-800">
                        {clip.durationFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Execution CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleExecute}
          disabled={isProcessing}
          className="w-full py-4 px-6 rounded-2xl bg-[#5722AF] hover:bg-[#471a93] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#5722AF]/25 transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Scissors className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>
            Cut Video into {schedule.totalClips} Clips {includeLogo && session.logoImage ? '+ Logo ' : ''}{includeEndingVideo && session.endingVideo ? '+ Ending Video ' : ''}&amp; Generate ZIP
          </span>
          <FileArchive className="w-4 h-4 ml-1 opacity-80" />
        </button>

        <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
          Outputs: <strong className="font-mono text-zinc-700 dark:text-zinc-300">video1, video2...</strong> inside one convenient ZIP archive.
        </p>
      </div>
    </div>
  );
}
