'use client';

import React, { useState } from 'react';
import { BREAKPOINTS } from '@/lib/responsive/devices';
import { Ruler, RefreshCw, Smartphone, Monitor } from 'lucide-react';

interface BreakpointTesterProps {
  url: string;
  currentWidth: number;
  onSelectWidth: (w: number) => void;
}

export const BreakpointTester: React.FC<BreakpointTesterProps> = ({
  url,
  currentWidth,
  onSelectWidth,
}) => {
  const [sliderWidth, setSliderWidth] = useState(currentWidth);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderWidth(val);
    onSelectWidth(val);
  };

  return (
    <div className="space-y-4">
      {/* Breakpoint Controls Header */}
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
              Responsive Breakpoint Ruler
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Active Width:</span>
            <span className="font-mono text-sm font-black text-[#5722AF] dark:text-[#9B6BE8] bg-[#5722AF]/10 px-2 py-0.5 rounded-lg">
              {currentWidth} px
            </span>
          </div>
        </div>

        {/* Drag Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-400">320px</span>
          <input
            type="range"
            min={320}
            max={1920}
            step={5}
            value={sliderWidth}
            onChange={handleSliderChange}
            className="flex-1 accent-[#5722AF] cursor-pointer"
          />
          <span className="text-[11px] font-mono text-zinc-400">1920px</span>
        </div>

        {/* Clickable Ruler Points */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 pb-1">
          {BREAKPOINTS.map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => {
                setSliderWidth(bp);
                onSelectWidth(bp);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all whitespace-nowrap cursor-pointer ${
                currentWidth === bp
                  ? 'bg-[#5722AF] text-white font-bold shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {bp}
            </button>
          ))}
        </div>
      </div>

      {/* Live Resizable Breakpoint Preview */}
      <div className="p-4 bg-zinc-100 dark:bg-zinc-950 rounded-2xl flex flex-col items-center overflow-auto border border-zinc-200 dark:border-zinc-800">
        <div
          className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden shadow-lg transition-all"
          style={{ width: `${currentWidth}px`, height: '650px', maxWidth: '100%' }}
        >
          <iframe
            src={url}
            className="w-full h-full border-0 bg-white"
            title="Breakpoint Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
};
