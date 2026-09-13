'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Compass, RotateCw } from 'lucide-react';

interface AngleVisualizerProps {
  angle: number;
  onChangeAngle: (angle: number) => void;
}

const DIRECTION_PRESETS = [
  { label: 'To Right', deg: 90 },
  { label: 'To Bottom Right', deg: 135 },
  { label: 'To Bottom', deg: 180 },
  { label: 'To Bottom Left', deg: 225 },
  { label: 'To Left', deg: 270 },
  { label: 'To Top Left', deg: 315 },
  { label: 'To Top', deg: 0 },
  { label: 'To Top Right', deg: 45 },
];

export function AngleVisualizer({ angle, onChangeAngle }: AngleVisualizerProps) {
  const dialRef = useRef<HTMLDivElement>(null);
  const [isDraggingDial, setIsDraggingDial] = useState(false);

  const calculateAngleFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;

    // In CSS gradient standard: 0deg is to top, 90deg is to right
    let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90;
    if (deg < 0) deg += 360;
    if (deg >= 360) deg -= 360;
    onChangeAngle(deg);
  }, [onChangeAngle]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDraggingDial(true);
    calculateAngleFromPointer(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDraggingDial(true);
    calculateAngleFromPointer(e.touches[0].clientX, e.touches[0].clientY);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingDial) {
        calculateAngleFromPointer(e.clientX, e.clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingDial) {
        calculateAngleFromPointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onEnd = () => setIsDraggingDial(false);

    if (isDraggingDial) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onEnd);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onEnd);
      };
    }
  }, [isDraggingDial, calculateAngleFromPointer]);

  // Pointer indicator position on circle (radius 36px)
  // CSS 0deg is Top (x=0, y=-radius), 90deg is Right (x=radius, y=0)
  const rad = ((angle - 90) * Math.PI) / 180;
  const radius = 32;
  const pointerX = 40 + Math.cos(rad) * radius;
  const pointerY = 40 + Math.sin(rad) * radius;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Gradient Direction</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onChangeAngle(Math.max(0, Math.min(360, val)));
            }}
            className="w-14 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-center font-mono text-xs outline-none"
          />
          <span className="font-mono text-zinc-500">deg</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Interactive Dial */}
        <div
          ref={dialRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative w-20 h-20 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-crosshair shadow-inner shrink-0 select-none"
          title="Drag to rotate gradient angle"
        >
          {/* Dial Center */}
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />

          {/* Indicator needle line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="40"
              y1="40"
              x2={pointerX}
              y2={pointerY}
              stroke="#5722AF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Handle node */}
          <div
            className="absolute w-4 h-4 rounded-full bg-[#5722AF] text-white shadow-md border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${pointerX}px`, top: `${pointerY}px` }}
          />
        </div>

        {/* Direction Presets Grid */}
        <div className="flex-1 grid grid-cols-4 gap-1.5">
          {DIRECTION_PRESETS.map((preset) => {
            const isActive = angle === preset.deg;
            return (
              <button
                key={preset.deg}
                type="button"
                onClick={() => onChangeAngle(preset.deg)}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                  isActive
                    ? 'bg-[#5722AF] text-white border-[#5722AF] shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title={preset.label}
              >
                {preset.deg}°
              </button>
            );
          })}
        </div>
      </div>

      {/* Range Slider */}
      <input
        type="range"
        min="0"
        max="360"
        value={angle}
        onChange={(e) => onChangeAngle(parseInt(e.target.value, 10))}
        className="w-full accent-[#5722AF] cursor-pointer mt-1"
      />
    </div>
  );
}
