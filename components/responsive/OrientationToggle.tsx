'use client';

import React from 'react';
import { RotateCw, Smartphone } from 'lucide-react';
import { Orientation } from '@/lib/responsive/types';

interface OrientationToggleProps {
  orientation: Orientation;
  onToggle: () => void;
  onSetOrientation: (o: Orientation) => void;
}

export const OrientationToggle: React.FC<OrientationToggleProps> = ({
  orientation,
  onToggle,
  onSetOrientation,
}) => {
  return (
    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
      <button
        type="button"
        onClick={() => onSetOrientation('portrait')}
        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
          orientation === 'portrait'
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        Portrait
      </button>
      <button
        type="button"
        onClick={() => onSetOrientation('landscape')}
        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
          orientation === 'landscape'
            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
        }`}
      >
        Landscape
      </button>
      <button
        type="button"
        onClick={onToggle}
        title="Rotate 90 degrees"
        className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer ml-0.5"
      >
        <RotateCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
