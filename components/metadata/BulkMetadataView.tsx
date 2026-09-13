'use client';

import React, { useState } from 'react';
import { ImageMetadataItem } from '@/lib/metadataTypes';
import { formatBytes } from '@/lib/renameEngine';
import { exportBulkMetadataAsCsv, exportMetadataAsJson } from '@/lib/metadataEngine';
import {
  Trash2,
  CheckSquare,
  Square,
  ArrowUpDown,
  Eye,
  FileSpreadsheet,
  Download,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';

interface BulkMetadataViewProps {
  items: ImageMetadataItem[];
  onSelectItem: (item: ImageMetadataItem) => void;
  onRemoveItem: (id: string) => void;
  onRemoveSelected: () => void;
  onClearAll: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onSort: (type: 'name' | 'size' | 'width' | 'height' | 'format' | 'status') => void;
  onShowToast: (msg: string) => void;
}

export function BulkMetadataView({
  items,
  onSelectItem,
  onRemoveItem,
  onRemoveSelected,
  onClearAll,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  onShowToast,
}: BulkMetadataViewProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const selectedCount = items.filter((it) => it.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  return (
    <div className="bg-white dark:bg-[#131722] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 space-y-6 shadow-xs">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Select All */}
          <button
            type="button"
            onClick={onToggleSelectAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 dark:bg-[#1a202e] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {allSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-[#5722AF]" />
            ) : (
              <Square className="w-3.5 h-3.5 text-zinc-400" />
            )}
            <span>
              Select All ({selectedCount}/{items.length})
            </span>
          </button>

          {/* Remove Selected */}
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onRemoveSelected}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove ({selectedCount})</span>
            </button>
          )}

          {/* Clear All with confirmation */}
          {showClearConfirm ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs">
              <span className="text-rose-700 dark:text-rose-300 font-semibold">Clear all?</span>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold cursor-pointer hover:bg-rose-700"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 rounded-md text-zinc-600 hover:bg-zinc-200 dark:text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-xl text-xs text-zinc-500 hover:text-rose-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Sort & Bulk Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-zinc-50 dark:bg-[#1a202e] px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              onChange={(e) => onSort(e.target.value as any)}
              className="text-xs bg-transparent border-none focus:outline-none cursor-pointer text-zinc-700 dark:text-zinc-300 py-0.5"
            >
              <option value="name" className="dark:bg-[#131722]">Sort by Name</option>
              <option value="size" className="dark:bg-[#131722]">Sort by Size</option>
              <option value="width" className="dark:bg-[#131722]">Sort by Width</option>
              <option value="height" className="dark:bg-[#131722]">Sort by Height</option>
              <option value="format" className="dark:bg-[#131722]">Sort by Format</option>
              <option value="status" className="dark:bg-[#131722]">Sort by Metadata</option>
            </select>
          </div>

          {/* Download CSV Report */}
          <button
            type="button"
            onClick={() => {
              exportBulkMetadataAsCsv(items);
              onShowToast('Exported bulk metadata CSV report');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#5722AF] hover:bg-[#7B45D1] transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Desktop Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#181d2a] text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3 w-16">Image</th>
              <th className="py-3 px-3">Filename &amp; Format</th>
              <th className="py-3 px-3 w-28">Dimensions</th>
              <th className="py-3 px-3 w-24">Size</th>
              <th className="py-3 px-3 w-36">Camera Model</th>
              <th className="py-3 px-3 w-32">Capture Date</th>
              <th className="py-3 px-3 w-32">Settings</th>
              <th className="py-3 px-3 w-20 text-center">GPS</th>
              <th className="py-3 px-3 w-28 text-center">Metadata Status</th>
              <th className="py-3 px-3 w-24 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {items.map((item) => {
              const cameraModel = item.camera.find((c) => c.key === 'Model')?.value || '—';
              const captureDate = item.dateTime.find((d) => d.key === 'CaptureDate')?.value || '—';
              const cs = item.captureSettings;
              const settingsText = [cs.focalLength, cs.aperture, cs.shutterSpeed, cs.iso]
                .filter(Boolean)
                .join(' • ') || '—';

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-zinc-50/60 dark:hover:bg-[#181d2a]/60 transition-colors ${
                    item.selected ? 'bg-[#5722AF]/5 dark:bg-[#5722AF]/10' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(item.id)}
                      className="text-zinc-400 hover:text-[#5722AF] cursor-pointer"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-4 h-4 text-[#5722AF]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Thumbnail */}
                  <td className="py-3 px-3">
                    <div
                      onClick={() => onSelectItem(item)}
                      className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 relative group cursor-pointer shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </td>

                  {/* Filename & Format */}
                  <td className="py-3 px-3 font-medium max-w-[180px]">
                    <div
                      onClick={() => onSelectItem(item)}
                      className="truncate text-zinc-900 dark:text-zinc-100 font-semibold cursor-pointer hover:text-[#5722AF]"
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono uppercase">
                        {item.format}
                      </span>
                    </div>
                  </td>

                  {/* Dimensions */}
                  <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {item.width} × {item.height}
                  </td>

                  {/* Size */}
                  <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    {formatBytes(item.size)}
                  </td>

                  {/* Camera */}
                  <td className="py-3 px-3 truncate max-w-[140px] text-zinc-700 dark:text-zinc-300" title={String(cameraModel)}>
                    {cameraModel}
                  </td>

                  {/* Date Taken */}
                  <td className="py-3 px-3 font-mono text-[11px] text-zinc-500 truncate max-w-[120px]" title={String(captureDate)}>
                    {captureDate}
                  </td>

                  {/* Settings */}
                  <td className="py-3 px-3 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 truncate max-w-[130px]" title={settingsText}>
                    {settingsText}
                  </td>

                  {/* GPS */}
                  <td className="py-3 px-3 text-center">
                    {item.gps.hasGps ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                        <MapPin className="w-3 h-3" />
                        <span>GPS</span>
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center">
                    {item.status === 'success' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Available</span>
                      </span>
                    )}
                    {item.status === 'limited' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                        <span>Limited</span>
                      </span>
                    )}
                    {item.status === 'none' && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                        No EXIF
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        <AlertCircle className="w-3 h-3" />
                        <span>Error</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectItem(item)}
                        className="p-1.5 rounded-lg text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/10 transition-colors cursor-pointer"
                        title="Inspect metadata"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => exportMetadataAsJson(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        title="Download JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {items.map((item) => {
          const cameraModel = item.camera.find((c) => c.key === 'Model')?.value || '—';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                item.selected
                  ? 'bg-[#5722AF]/5 border-[#5722AF]/40 dark:bg-[#5722AF]/10 dark:border-[#5722AF]/50'
                  : 'bg-zinc-50/50 dark:bg-[#161b26] border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleSelect(item.id)}
                    className="text-zinc-400 hover:text-[#5722AF] cursor-pointer"
                  >
                    {item.selected ? (
                      <CheckSquare className="w-5 h-5 text-[#5722AF]" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div
                    onClick={() => onSelectItem(item)}
                    className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative cursor-pointer shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="overflow-hidden">
                    <p
                      onClick={() => onSelectItem(item)}
                      className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[150px] cursor-pointer"
                    >
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-zinc-400">
                        {formatBytes(item.size)}
                      </span>
                      <span className="px-1 py-0.2 rounded text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-mono uppercase">
                        {item.format}
                      </span>
                      {item.gps.hasGps && (
                        <span className="text-[9px] font-bold text-amber-600">GPS</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className="p-1.5 rounded-lg text-[#5722AF] hover:bg-[#5722AF]/10"
                    title="View metadata"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Specs row */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#11151f] border border-zinc-200/60 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Resolution</span>
                  <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    {item.width} × {item.height}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Camera</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[120px] block">
                    {cameraModel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
