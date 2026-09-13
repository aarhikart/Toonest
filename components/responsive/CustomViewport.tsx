'use client';

import React, { useState } from 'react';
import { Sliders, Check } from 'lucide-react';

interface CustomViewportProps {
  currentWidth: number;
  currentHeight: number;
  onApply: (width: number, height: number) => void;
}

export const CustomViewport: React.FC<CustomViewportProps> = ({
  currentWidth,
  currentHeight,
  onApply,
}) => {
  const [w, setW] = useState(currentWidth);
  const [h, setH] = useState(currentHeight);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const finalW = Math.max(200, Math.min(4000, Number(w) || 390));
    const finalH = Math.max(300, Math.min(4000, Number(h) || 844));
    setW(finalW);
    setH(finalH);
    onApply(finalW, finalH);
  };

  return (
    <form onSubmit={handleApply} className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <span className="text-zinc-400 font-medium">W:</span>
        <input
          type="number"
          min={200}
          max={4000}
          value={w}
          onChange={(e) => setW(Number(e.target.value))}
          className="w-16 bg-transparent font-mono text-zinc-800 dark:text-zinc-200 text-center focus:outline-none"
        />
        <span className="text-zinc-400">px</span>
      </div>

      <span className="text-zinc-400">×</span>

      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-2 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <span className="text-zinc-400 font-medium">H:</span>
        <input
          type="number"
          min={300}
          max={4000}
          value={h}
          onChange={(e) => setH(Number(e.target.value))}
          className="w-16 bg-transparent font-mono text-zinc-800 dark:text-zinc-200 text-center focus:outline-none"
        />
        <span className="text-zinc-400">px</span>
      </div>

      <button
        type="submit"
        className="px-3 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white font-bold transition-all shadow-xs cursor-pointer"
      >
        Apply
      </button>
    </form>
  );
};
