'use client';

import React from 'react';
import { PhotoCaptureSettings } from '@/lib/metadataTypes';
import {
  Camera,
  Gauge,
  CircleDot,
  Sun,
  Zap,
  ZapOff,
  Compass,
  Maximize,
  Sparkles,
} from 'lucide-react';

interface PhotoSettingsCardProps {
  settings: PhotoCaptureSettings;
}

export function PhotoSettingsCard({ settings }: PhotoSettingsCardProps) {
  const hasSettings = Object.values(settings).some(Boolean);
  if (!hasSettings) return null;

  return (
    <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Photo Capture Settings</span>
        </h3>
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Exposure &amp; Optics
        </span>
      </div>

      {/* Grid of Photography Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Shutter Speed */}
        {settings.shutterSpeed && (
          <div className="p-3 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Shutter Speed
            </span>
            <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 font-mono mt-0.5">
              {settings.shutterSpeed}
            </p>
          </div>
        )}

        {/* Aperture */}
        {settings.aperture && (
          <div className="p-3 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Aperture
            </span>
            <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 font-mono mt-0.5">
              {settings.aperture}
            </p>
          </div>
        )}

        {/* ISO */}
        {settings.iso && (
          <div className="p-3 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              ISO Sensitivity
            </span>
            <p className="text-sm font-extrabold text-[#5722AF] dark:text-[#9B6BE8] font-mono mt-0.5">
              {settings.iso}
            </p>
          </div>
        )}

        {/* Focal Length */}
        {settings.focalLength && (
          <div className="p-3 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Focal Length
            </span>
            <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 font-mono mt-0.5">
              {settings.focalLength}
            </p>
            {settings.focalLength35mm && (
              <span className="text-[10px] text-zinc-400 block">
                35mm: {settings.focalLength35mm}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Secondary Capture Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        {settings.exposureCompensation && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">Exp. Bias:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
              {settings.exposureCompensation}
            </span>
          </div>
        )}

        {settings.whiteBalance && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">White Balance:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {settings.whiteBalance}
            </span>
          </div>
        )}

        {settings.flash && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">Flash:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
              {settings.flash}
            </span>
          </div>
        )}

        {settings.exposureProgram && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">Program:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
              {settings.exposureProgram}
            </span>
          </div>
        )}

        {settings.meteringMode && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">Metering:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
              {settings.meteringMode}
            </span>
          </div>
        )}

        {settings.digitalZoom && (
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/60 dark:border-zinc-800">
            <span className="text-zinc-500">Digital Zoom:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {settings.digitalZoom}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
