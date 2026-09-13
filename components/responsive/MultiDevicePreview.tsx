'use client';

import React, { useState } from 'react';
import { Smartphone, Tablet, Laptop, Monitor, RefreshCw } from 'lucide-react';
import { DEVICE_PRESETS } from '@/lib/responsive/devices';

interface MultiDevicePreviewProps {
  url: string;
}

export const MultiDevicePreview: React.FC<MultiDevicePreviewProps> = ({ url }) => {
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // 4 standard viewports: Mobile, Tablet, Laptop, Desktop
  const devices = [
    { label: 'Mobile (iPhone 14)', w: 390, h: 844, scale: 0.65, icon: <Smartphone className="w-3.5 h-3.5" /> },
    { label: 'Tablet (iPad)', w: 768, h: 1024, scale: 0.5, icon: <Tablet className="w-3.5 h-3.5" /> },
    { label: 'Laptop (1366×768)', w: 1366, h: 768, scale: 0.4, icon: <Laptop className="w-3.5 h-3.5" /> },
    { label: 'Desktop (1920×1080)', w: 1920, h: 1080, scale: 0.32, icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs">
        <span className="font-bold text-zinc-700 dark:text-zinc-300">
          Simultaneous Multi-Viewport View (Auto-Scaled)
        </span>
        <button
          type="button"
          onClick={() => setRefreshKey(Date.now())}
          className="px-3 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((dev) => (
          <div
            key={dev.label}
            className="flex flex-col items-center p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              {dev.icon}
              <span>{dev.label}</span>
              <span className="text-zinc-400 font-mono text-[11px]">({dev.w}×{dev.h})</span>
            </div>

            <div
              className="relative overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-xs"
              style={{
                width: `${dev.w * dev.scale}px`,
                height: `${dev.h * dev.scale}px`,
              }}
            >
              <iframe
                key={`multi-${dev.w}-${refreshKey}`}
                src={url}
                style={{
                  width: `${dev.w}px`,
                  height: `${dev.h}px`,
                  transform: `scale(${dev.scale})`,
                  transformOrigin: 'top left',
                }}
                className="border-0 bg-white"
                title={dev.label}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
