'use client';

import React from 'react';
import { Layers, Camera, MapPin, Sliders } from 'lucide-react';

interface MetadataOverviewCardsProps {
  totalFields: number;
  exifFields: number;
  hasGps: boolean;
  hasCamera: boolean;
}

export function MetadataOverviewCards({
  totalFields,
  exifFields,
  hasGps,
  hasCamera,
}: MetadataOverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Total Fields */}
      <div className="p-3.5 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8] flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Metadata Fields
          </span>
          <p className="text-base font-extrabold text-zinc-800 dark:text-zinc-100 mt-0.5">
            {totalFields}
          </p>
        </div>
      </div>

      {/* EXIF Fields */}
      <div className="p-3.5 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            EXIF Tags
          </span>
          <p className="text-base font-extrabold text-zinc-800 dark:text-zinc-100 mt-0.5">
            {exifFields}
          </p>
        </div>
      </div>

      {/* GPS Location */}
      <div className="p-3.5 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            hasGps
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-400'
          }`}
        >
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            GPS Location
          </span>
          <p
            className={`text-sm font-bold mt-0.5 ${
              hasGps
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {hasGps ? 'Available' : 'None'}
          </p>
        </div>
      </div>

      {/* Camera */}
      <div className="p-3.5 bg-zinc-50 dark:bg-[#161b26] rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            hasCamera
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-400'
          }`}
        >
          <Camera className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Camera Info
          </span>
          <p
            className={`text-sm font-bold mt-0.5 ${
              hasCamera
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {hasCamera ? 'Available' : 'None'}
          </p>
        </div>
      </div>
    </div>
  );
}
