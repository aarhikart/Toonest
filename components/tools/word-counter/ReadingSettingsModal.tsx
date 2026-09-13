'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, Check } from 'lucide-react';
import { ReadingSpeedSettings } from '@/lib/text/types';

interface ReadingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReadingSpeedSettings;
  onSave: (settings: ReadingSpeedSettings) => void;
}

export function ReadingSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: ReadingSettingsModalProps) {
  const [readingWpm, setReadingWpm] = useState(settings.readingWpm);
  const [speakingWpm, setSpeakingWpm] = useState(settings.speakingWpm);

  if (!isOpen) return null;

  const readingOptions = [
    { label: 'Slow (150 WPM)', value: 150 },
    { label: 'Average (200 WPM)', value: 200 },
    { label: 'Fast (250 WPM)', value: 250 },
  ];

  const speakingOptions = [
    { label: 'Slow (100 WPM)', value: 100 },
    { label: 'Average (130 WPM)', value: 130 },
    { label: 'Fast (160 WPM)', value: 160 },
  ];

  const handleApply = () => {
    onSave({ readingWpm, speakingWpm });
    onClose();
  };

  const handleReset = () => {
    setReadingWpm(200);
    setSpeakingWpm(130);
    onSave({ readingWpm: 200, speakingWpm: 130 });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h2
              id="settings-modal-title"
              className="text-sm font-bold text-zinc-900 dark:text-white"
            >
              Calculation Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Reading Speed */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex justify-between">
              <span>Reading Speed:</span>
              <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                {readingWpm} WPM
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {readingOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReadingWpm(opt.value)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    readingWpm === opt.value
                      ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {opt.value} WPM
                </button>
              ))}
            </div>
          </div>

          {/* Speaking Speed */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex justify-between">
              <span>Speaking Speed:</span>
              <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
                {speakingWpm} WPM
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {speakingOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpeakingWpm(opt.value)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    speakingWpm === opt.value
                      ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {opt.value} WPM
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
