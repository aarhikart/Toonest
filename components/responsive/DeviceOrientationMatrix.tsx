'use client';

import React from 'react';
import { DevicePreset, DeviceMatrixTest, TestStatus } from '@/lib/responsive/types';
import { DEVICE_PRESETS } from '@/lib/responsive/devices';

interface DeviceOrientationMatrixProps {
  matrix: Record<string, DeviceMatrixTest>;
  onUpdateMatrix: (deviceId: string, orientation: 'portrait' | 'landscape', status: TestStatus) => void;
}

export const DeviceOrientationMatrix: React.FC<DeviceOrientationMatrixProps> = ({
  matrix,
  onUpdateMatrix,
}) => {
  const renderPill = (deviceId: string, ori: 'portrait' | 'landscape') => {
    const current = matrix[deviceId]?.[ori] || 'untested';
    return (
      <div className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px]">
        <button
          type="button"
          onClick={() => onUpdateMatrix(deviceId, ori, 'pass')}
          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
            current === 'pass' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-emerald-500'
          }`}
        >
          Pass
        </button>
        <button
          type="button"
          onClick={() => onUpdateMatrix(deviceId, ori, 'warning')}
          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
            current === 'warning' ? 'bg-amber-500 text-white' : 'text-zinc-500 hover:text-amber-500'
          }`}
        >
          Warn
        </button>
        <button
          type="button"
          onClick={() => onUpdateMatrix(deviceId, ori, 'fail')}
          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${
            current === 'fail' ? 'bg-rose-500 text-white' : 'text-zinc-500 hover:text-rose-500'
          }`}
        >
          Fail
        </button>
      </div>
    );
  };

  return (
    <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-4">
      <div>
        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
          Device &amp; Orientation QA Testing Matrix
        </h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Verify both portrait and landscape orientation behavior for each viewport
        </p>
      </div>

      <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
              <th className="py-2.5 px-3 font-bold uppercase text-[11px]">Device Viewport</th>
              <th className="py-2.5 px-3 font-bold uppercase text-[11px]">Base Dimensions</th>
              <th className="py-2.5 px-3 font-bold uppercase text-[11px]">Portrait Status</th>
              <th className="py-2.5 px-3 font-bold uppercase text-[11px]">Landscape Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {DEVICE_PRESETS.map((preset) => (
              <tr key={preset.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">
                  {preset.name}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#5722AF] dark:text-[#9B6BE8]">
                  {preset.width} × {preset.height}
                </td>
                <td className="py-2.5 px-3">
                  {renderPill(preset.id, 'portrait')}
                </td>
                <td className="py-2.5 px-3">
                  {renderPill(preset.id, 'landscape')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
