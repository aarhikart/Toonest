'use client';

import React, { useState } from 'react';
import { X, Check, Undo2, Sliders, Crop } from 'lucide-react';
import { SocialMediaConfig, SocialMediaItem, CropSettings } from '@/lib/socialMediaTypes';
import { SmartCropEditor } from './SmartCropEditor';

interface SocialResizerPerItemModalProps {
  isOpen: boolean;
  item: SocialMediaItem | null;
  baseConfig: SocialMediaConfig;
  onClose: () => void;
  onSaveCustomCrop: (itemId: string, customCrop: Partial<CropSettings> | null) => void;
}

export function SocialResizerPerItemModal({
  isOpen,
  item,
  baseConfig,
  onClose,
  onSaveCustomCrop,
}: SocialResizerPerItemModalProps) {
  if (!isOpen || !item) return null;

  // Local state for this item's custom crop
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [localCrop, setLocalCrop] = useState<CropSettings>({
    ...baseConfig.cropSettings,
    ...(item.customCropSettings || {}),
  });

  const handleCropChange = (updated: Partial<CropSettings>) => {
    setLocalCrop((prev) => ({ ...prev, ...updated }));
  };

  const handleResetToBulkDefaults = () => {
    setLocalCrop({ ...baseConfig.cropSettings });
  };

  const handleApply = () => {
    onSaveCustomCrop(item.id, localCrop);
    onClose();
  };

  const handleClearOverride = () => {
    onSaveCustomCrop(item.id, null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#11141e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[860px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/80 dark:bg-[#0d1017]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 border border-[#5722AF]/30 flex items-center justify-center text-[#5722AF] dark:text-[#9B6BE8] shrink-0">
              <Crop className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                Adjust Crop: {item.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Override cropping and position specifically for this individual image.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Editor */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-100/50 dark:bg-zinc-950/40 flex flex-col">
          <SmartCropEditor
            item={item}
            config={baseConfig}
            customCrop={localCrop}
            onCropChange={handleCropChange}
            onResetCrop={handleResetToBulkDefaults}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-[#0d1017] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClearOverride}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Reset to Global Bulk Settings</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5722AF] hover:bg-[#471a93] text-white shadow-md shadow-[#5722AF]/25 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Custom Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
