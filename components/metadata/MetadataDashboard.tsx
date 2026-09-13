'use client';

import React, { useState, useMemo } from 'react';
import {
  ImageMetadataItem,
  MetadataField,
} from '@/lib/metadataTypes';
import {
  exportMetadataAsJson,
  exportMetadataAsTxt,
  formatClipboardSummary,
} from '@/lib/metadataEngine';
import { formatBytes } from '@/lib/renameEngine';
import { MetadataOverviewCards } from './MetadataOverviewCards';
import { PhotoSettingsCard } from './PhotoSettingsCard';
import {
  Search,
  Copy,
  Check,
  Download,
  FileText,
  FileCode,
  ShieldAlert,
  MapPin,
  Camera,
  Layers,
  Clock,
  Palette,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Sliders,
} from 'lucide-react';

interface MetadataDashboardProps {
  item: ImageMetadataItem;
  onShowToast: (msg: string) => void;
}

export function MetadataDashboard({ item, onShowToast }: MetadataDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawSearchQuery, setRawSearchQuery] = useState('');

  // Handle copying a single value
  const handleCopyValue = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`Copied ${key} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle copying full summary
  const handleCopySummary = () => {
    const summary = formatClipboardSummary(item);
    navigator.clipboard.writeText(summary);
    onShowToast('Copied metadata summary to clipboard');
  };

  // Filter fields based on search
  const filterFields = (fields: MetadataField[]) => {
    if (!searchQuery.trim()) return fields;
    const q = searchQuery.toLowerCase();
    return fields.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        String(f.value).toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q)
    );
  };

  const filteredFile = useMemo(() => filterFields(item.fileInfo), [item.fileInfo, searchQuery]);
  const filteredImage = useMemo(() => filterFields(item.imageInfo), [item.imageInfo, searchQuery]);
  const filteredExif = useMemo(() => filterFields(item.exifData), [item.exifData, searchQuery]);
  const filteredCamera = useMemo(() => filterFields(item.camera), [item.camera, searchQuery]);
  const filteredLens = useMemo(() => filterFields(item.lens), [item.lens, searchQuery]);
  const filteredDate = useMemo(() => filterFields(item.dateTime), [item.dateTime, searchQuery]);
  const filteredSoftware = useMemo(() => filterFields(item.software), [item.software, searchQuery]);
  const filteredColor = useMemo(() => filterFields(item.colorInfo), [item.colorInfo, searchQuery]);
  const filteredAdvanced = useMemo(() => filterFields(item.advanced), [item.advanced, searchQuery]);

  // Clean raw tags representation (excluding huge binary buffers)
  const cleanRawTags = useMemo(() => {
    const output: Record<string, any> = {};
    if (!item.rawTags) return output;
    for (const [k, v] of Object.entries(item.rawTags)) {
      if (v && typeof v === 'object') {
        output[k] = v.description !== undefined ? v.description : v.value;
      } else {
        output[k] = v;
      }
    }
    return output;
  }, [item.rawTags]);

  const rawJsonString = useMemo(() => {
    return JSON.stringify(cleanRawTags, null, 2);
  }, [cleanRawTags]);

  return (
    <div className="space-y-6">
      {/* 1. Header Card with File Summary & Export Actions */}
      <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white truncate max-w-md">
                {item.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]">
                {item.format}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {item.width} × {item.height} px &bull; {item.aspectRatio} &bull; {formatBytes(item.size)} &bull;{' '}
              {item.pixelCount}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Summary</span>
            </button>

            <button
              type="button"
              onClick={() => exportMetadataAsJson(item)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#5722AF]/10 hover:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>

            <button
              type="button"
              onClick={() => exportMetadataAsTxt(item)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download TXT</span>
            </button>
          </div>
        </div>

        {/* Overview Counts */}
        <div className="pt-5">
          <MetadataOverviewCards
            totalFields={item.counts.totalFields}
            exifFields={item.counts.exifFields}
            hasGps={item.counts.hasGps}
            hasCamera={item.counts.hasCamera}
          />
        </div>
      </div>

      {/* 2. Privacy Notices Banner if sensitive fields detected */}
      {item.privacyNotices.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/90 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Privacy Notice: Sensitive Metadata Detected</span>
          </div>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            This image contains sensitive technical attributes:{' '}
            <strong className="font-semibold">{item.privacyNotices.join(', ')}</strong>. Consider
            scrubbing metadata before posting or distributing this file publicly.
          </p>
        </div>
      )}

      {/* 3. Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search metadata fields (e.g. ISO, Model, Shutter, GPS, Focal Length)..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sticky Column: Image Thumbnail & GPS Card */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Image Preview Card */}
          <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="w-full h-56 sm:h-64 rounded-2xl bg-zinc-100 dark:bg-[#0c0e14] overflow-hidden flex items-center justify-center border border-zinc-200/80 dark:border-zinc-800 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={item.name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-xs"
              />
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center space-y-0.5">
              <div className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.name}</div>
              <div>
                {item.width} × {item.height} px &bull; {formatBytes(item.size)}
              </div>
            </div>
          </div>

          {/* GPS Location Card if available */}
          {item.gps.hasGps && (
            <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>GPS Location</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Coordinates
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/70 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Latitude</span>
                  <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {item.gps.latitude} ({item.gps.latDms})
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#181d2a] border border-zinc-200/70 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Longitude</span>
                  <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {item.gps.longitude} ({item.gps.lngDms})
                  </div>
                </div>

                {item.gps.altitude && (
                  <div className="flex items-center justify-between px-2 text-zinc-500">
                    <span>Altitude:</span>
                    <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                      {item.gps.altitude}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyValue('Coordinates', `${item.gps.latitude}, ${item.gps.longitude}`)
                  }
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'Coordinates' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy Coordinates</span>
                </button>

                {item.gps.mapUrl && (
                  <a
                    href={item.gps.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#5722AF]/10 hover:bg-[#5722AF]/20 text-[#5722AF] dark:text-[#9B6BE8] transition-colors"
                    title="Open on OpenStreetMap"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Column: Metadata Tables */}
        <div className="lg:col-span-8 space-y-6">
          {/* Photography Settings Card */}
          <PhotoSettingsCard settings={item.captureSettings} />

          {/* Camera & Lens Information */}
          {(filteredCamera.length > 0 || filteredLens.length > 0) && (
            <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>Camera &amp; Lens</span>
                </h3>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {[...filteredCamera, ...filteredLens].map((f) => (
                  <div
                    key={f.key}
                    className="py-2.5 flex items-center justify-between gap-4 group hover:bg-zinc-50/50 dark:hover:bg-[#181d2a]/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-500 dark:text-zinc-400">
                        {f.label}
                      </span>
                      {f.isSensitive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          Sensitive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white text-right">
                        {String(f.value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyValue(f.label, String(f.value))}
                        className="p-1 rounded-md text-zinc-400 hover:text-[#5722AF] transition-colors cursor-pointer"
                        title="Copy value"
                      >
                        {copiedKey === f.label ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date & Time Information */}
          {filteredDate.length > 0 && (
            <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>Date &amp; Time</span>
                </h3>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {filteredDate.map((f) => (
                  <div
                    key={f.key}
                    className="py-2.5 flex items-center justify-between gap-4 group hover:bg-zinc-50/50 dark:hover:bg-[#181d2a]/50 px-2 rounded-xl transition-colors"
                  >
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">
                      {f.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white font-mono">
                        {String(f.value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyValue(f.label, String(f.value))}
                        className="p-1 rounded-md text-zinc-400 hover:text-[#5722AF] transition-colors cursor-pointer"
                        title="Copy value"
                      >
                        {copiedKey === f.label ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image & File Properties */}
          {(filteredImage.length > 0 || filteredFile.length > 0) && (
            <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>File &amp; Image Technical Specifications</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {[...filteredImage, ...filteredFile].map((f) => (
                  <div
                    key={f.key}
                    className="py-2 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/60"
                  >
                    <span className="text-zinc-500 dark:text-zinc-400">{f.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[150px]">
                        {String(f.value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyValue(f.label, String(f.value))}
                        className="p-1 text-zinc-400 hover:text-[#5722AF] cursor-pointer"
                      >
                        {copiedKey === f.label ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed EXIF Metadata */}
          {filteredExif.length > 0 && (
            <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>EXIF Metadata Tags</span>
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {filteredExif.length} tags
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {filteredExif.map((f) => (
                  <div
                    key={f.key}
                    className="py-2.5 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-[#181d2a]/50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">
                        {f.label}
                      </span>
                      {f.isSensitive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          Notice
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
                        {String(f.value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyValue(f.label, String(f.value))}
                        className="p-1 text-zinc-400 hover:text-[#5722AF] cursor-pointer"
                      >
                        {copiedKey === f.label ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Software & Color Profiles if present */}
          {(filteredSoftware.length > 0 || filteredColor.length > 0 || filteredAdvanced.length > 0) && (
            <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                  <span>Software, Color Profiles &amp; Extra Tags</span>
                </h3>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
                {[...filteredSoftware, ...filteredColor, ...filteredAdvanced].map((f) => (
                  <div
                    key={f.key}
                    className="py-2.5 flex items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-[#181d2a]/50 px-2 rounded-xl transition-colors"
                  >
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">{f.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-right">
                        {String(f.value)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyValue(f.label, String(f.value))}
                        className="p-1 text-zinc-400 hover:text-[#5722AF] cursor-pointer"
                      >
                        {copiedKey === f.label ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Collapsible Raw Metadata Viewer */}
          <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
                <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white">
                  View Raw Metadata (JSON Tree)
                </span>
              </div>
              {showRawJson ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {showRawJson && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-400">
                    Inspecting raw key-value mapping from file header
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(rawJsonString);
                      onShowToast('Raw JSON copied to clipboard');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5722AF] text-white hover:bg-[#7B45D1] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-zinc-900 text-zinc-200 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed select-all">
                  {rawJsonString}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
