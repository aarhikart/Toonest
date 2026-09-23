'use client';

import React from 'react';
import { X, Download, RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface PhotoCaptureModalProps {
  dataUrl: string | null;
  onClose: () => void;
  onRetake: () => void;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  dataUrl,
  onClose,
  onRetake
}) => {
  if (!dataUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `camera-connect-snapshot-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col space-y-4">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Photo Captured
            </h3>
            <p className="text-xs text-zinc-500">Live snapshot from mobile WebRTC video feed</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-black shadow-md max-h-[55vh]">
            <img
              src={dataUrl}
              alt="Captured Snapshot"
              className="max-h-[50vh] w-auto object-contain mx-auto"
            />
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Stored in browser memory only. Never uploaded to any server.</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full pt-2">
            <button
              type="button"
              onClick={onRetake}
              className="py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="py-2.5 px-4 rounded-xl bg-[#5722AF] hover:bg-[#491c96] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Locally (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
