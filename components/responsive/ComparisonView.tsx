'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, RefreshCw, Smartphone } from 'lucide-react';
import { DevicePreset, Orientation } from '@/lib/responsive/types';
import { DEVICE_PRESETS } from '@/lib/responsive/devices';

interface ComparisonViewProps {
  url: string;
  orientation: Orientation;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  url,
  orientation,
}) => {
  const [deviceA, setDeviceA] = useState<DevicePreset>(DEVICE_PRESETS[1]); // Standard Android (412x915)
  const [deviceB, setDeviceB] = useState<DevicePreset>(DEVICE_PRESETS[4]); // Standard iPhone (390x844)
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());

  const handleSwap = () => {
    const temp = deviceA;
    setDeviceA(deviceB);
    setDeviceB(temp);
  };

  const handleRefreshBoth = () => {
    setRefreshKey(Date.now());
  };

  const getDims = (p: DevicePreset) => ({
    w: orientation === 'portrait' ? p.width : p.height,
    h: orientation === 'portrait' ? p.height : p.width,
  });

  const dimsA = getDims(deviceA);
  const dimsB = getDims(deviceB);

  return (
    <div className="space-y-4">
      {/* Comparison Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs shadow-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Device A Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-zinc-500">Device A:</span>
            <select
              value={deviceA.id}
              onChange={(e) => {
                const found = DEVICE_PRESETS.find((p) => p.id === e.target.value);
                if (found) setDeviceA(found);
              }}
              className="py-1.5 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              {DEVICE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.width}×{p.height})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSwap}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Swap Devices"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Device B Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-zinc-500">Device B:</span>
            <select
              value={deviceB.id}
              onChange={(e) => {
                const found = DEVICE_PRESETS.find((p) => p.id === e.target.value);
                if (found) setDeviceB(found);
              }}
              className="py-1.5 px-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              {DEVICE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.width}×{p.height})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefreshBoth}
          className="px-3 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Both</span>
        </button>
      </div>

      {/* Side by Side Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Device A View */}
        <div className="flex flex-col items-center p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            <span>{deviceA.name}</span>
            <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
              {dimsA.w} × {dimsA.h} px
            </span>
          </div>

          <div
            className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden shadow-md max-w-full"
            style={{ width: `${dimsA.w}px`, height: '600px' }}
          >
            <iframe
              key={`comp-a-${deviceA.id}-${refreshKey}`}
              src={url}
              className="w-full h-full border-0 bg-white"
              title="Comparison Device A"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>

        {/* Device B View */}
        <div className="flex flex-col items-center p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            <span>{deviceB.name}</span>
            <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">
              {dimsB.w} × {dimsB.h} px
            </span>
          </div>

          <div
            className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden shadow-md max-w-full"
            style={{ width: `${dimsB.w}px`, height: '600px' }}
          >
            <iframe
              key={`comp-b-${deviceB.id}-${refreshKey}`}
              src={url}
              className="w-full h-full border-0 bg-white"
              title="Comparison Device B"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
