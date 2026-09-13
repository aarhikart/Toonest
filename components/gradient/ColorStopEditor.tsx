'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Pipette,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ColorStop, GradientConfig } from '@/lib/gradient/gradientTypes';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  isValidHex,
  normalizeHex,
} from '@/lib/colorEngine';
import { hexToRgba, sampleColorAtPosition } from '@/lib/gradient/gradientEngine';

interface ColorStopEditorProps {
  config: GradientConfig;
  selectedStopId: string;
  onSelectStop: (id: string) => void;
  onUpdateStop: (id: string, updates: Partial<ColorStop>) => void;
  onAddStop: (position?: number, color?: string) => void;
  onRemoveStop: (id: string) => void;
}

export function ColorStopEditor({
  config,
  selectedStopId,
  onSelectStop,
  onUpdateStop,
  onAddStop,
  onRemoveStop,
}: ColorStopEditorProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // Selected stop reference
  const selectedStop =
    config.stops.find((s) => s.id === selectedStopId) || config.stops[0];

  // Local text inputs for manual typing
  const [hexInput, setHexInput] = useState(selectedStop.color);
  const [rgbR, setRgbR] = useState(hexToRgb(selectedStop.color).r.toString());
  const [rgbG, setRgbG] = useState(hexToRgb(selectedStop.color).g.toString());
  const [rgbB, setRgbB] = useState(hexToRgb(selectedStop.color).b.toString());

  // Keep text inputs synchronized when selectedStop changes
  useEffect(() => {
    setHexInput(selectedStop.color);
    const rgb = hexToRgb(selectedStop.color);
    setRgbR(rgb.r.toString());
    setRgbG(rgb.g.toString());
    setRgbB(rgb.b.toString());
  }, [selectedStop.id, selectedStop.color]);

  // Track click to add a stop at that percentage
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));

    if (config.stops.length < 10) {
      // Pick the interpolated color at that point!
      const sampled = sampleColorAtPosition(config.stops, percent);
      const hex = rgbToHex(sampled.r, sampled.g, sampled.b);
      onAddStop(percent, hex);
    }
  };

  // Dragging logic for handles
  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(id);
    onSelectStop(id);
  };

  const handleTouchStart = (id: string, e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(id);
    onSelectStop(id);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const percent = Math.max(
        0,
        Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100))
      );
      onUpdateStop(isDragging, { position: percent });
    },
    [isDragging, onUpdateStop]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clientX = e.touches[0].clientX;
      const percent = Math.max(
        0,
        Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100))
      );
      onUpdateStop(isDragging, { position: percent });
    },
    [isDragging, onUpdateStop]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  // Color change handlers
  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (isValidHex(val)) {
      const norm = normalizeHex(val);
      onUpdateStop(selectedStop.id, { color: norm });
      const rgb = hexToRgb(norm);
      setRgbR(rgb.r.toString());
      setRgbG(rgb.g.toString());
      setRgbB(rgb.b.toString());
    }
  };

  const handleRgbChange = (r: string, g: string, b: string) => {
    setRgbR(r);
    setRgbG(g);
    setRgbB(b);
    const rNum = parseInt(r, 10);
    const gNum = parseInt(g, 10);
    const bNum = parseInt(b, 10);
    if (!isNaN(rNum) && !isNaN(gNum) && !isNaN(bNum)) {
      const hex = rgbToHex(rNum, gNum, bNum);
      setHexInput(hex);
      onUpdateStop(selectedStop.id, { color: hex });
    }
  };

  // Render gradient background for track
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  const trackLinearGradient = `linear-gradient(to right, ${sortedStops
    .map((s) => `${hexToRgba(s.color, s.alpha)} ${s.position}%`)
    .join(', ')})`;

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Color Stops ({config.stops.length}/10)
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Drag pins to position. Click anywhere on the track to add a stop.
          </p>
        </div>

        {config.stops.length < 10 && (
          <button
            type="button"
            onClick={() => onAddStop()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] hover:bg-[#5722AF]/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stop</span>
          </button>
        )}
      </div>

      {/* Interactive Visual Gradient Track */}
      <div className="relative pt-6 pb-6 select-none">
        {/* Track Bar */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative w-full h-7 rounded-xl shadow-inner cursor-pointer border border-zinc-300/80 dark:border-zinc-700/80"
          style={{ background: trackLinearGradient }}
          title="Click to add stop here"
        >
          {/* Subtle percentage markings */}
          <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none opacity-25 text-[10px] font-mono text-white mix-blend-difference">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Draggable Stop Pins / Handles */}
        <div className="relative w-full pointer-events-none">
          {config.stops.map((stop) => {
            const isSelected = stop.id === selectedStop.id;
            return (
              <div
                key={stop.id}
                onMouseDown={(e) => handleMouseDown(stop.id, e)}
                onTouchStart={(e) => handleTouchStart(stop.id, e)}
                style={{ left: `${stop.position}%` }}
                className={`pointer-events-auto absolute -top-8 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform ${
                  isSelected ? 'z-30 scale-110' : 'z-20 hover:scale-105'
                }`}
              >
                {/* Pin Head */}
                <div
                  className={`w-6 h-6 rounded-full border-2 shadow-md flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-zinc-900 dark:border-white ring-2 ring-[#5722AF]'
                      : 'border-white dark:border-zinc-800'
                  }`}
                  style={{ backgroundColor: stop.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                </div>

                {/* Percentage label */}
                <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 bg-white/90 dark:bg-zinc-800/90 px-1 rounded shadow-xs mt-0.5 border border-zinc-200 dark:border-zinc-700">
                  {Math.round(stop.position)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stop Details Editor */}
      <div className="mt-2 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Active Stop Preview + Native Color Picker */}
          <div className="flex items-center gap-2.5">
            <div className="relative group/picker">
              <input
                type="color"
                value={selectedStop.color}
                onChange={(e) => handleHexChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                title="Click to pick color"
              />
              <div
                className="w-10 h-10 rounded-xl border-2 border-white dark:border-zinc-700 shadow-sm flex items-center justify-center cursor-pointer group-hover/picker:scale-105 transition-transform"
                style={{ backgroundColor: selectedStop.color }}
              >
                <Pipette className="w-4 h-4 text-white mix-blend-difference" />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">
                Active Stop ({Math.round(selectedStop.position)}%)
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                {selectedStop.color} • {Math.round(selectedStop.alpha * 100)}% opacity
              </div>
            </div>
          </div>

          {/* Stop Actions: Move Left, Move Right, Delete */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                onUpdateStop(selectedStop.id, {
                  position: Math.max(0, selectedStop.position - 5),
                })
              }
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Nudge left (-5%)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateStop(selectedStop.id, {
                  position: Math.min(100, selectedStop.position + 5),
                })
              }
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Nudge right (+5%)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {config.stops.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveStop(selectedStop.id)}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Delete this stop"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Inputs: HEX, RGB, Opacity, Position */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* HEX Input */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              HEX Color
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              maxLength={7}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-zinc-800 dark:text-zinc-200 uppercase outline-none focus:ring-1 focus:ring-[#5722AF]"
            />
          </div>

          {/* RGB Inputs */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              RGB (R, G, B)
            </label>
            <div className="flex items-center gap-1 font-mono">
              <input
                type="number"
                min="0"
                max="255"
                value={rgbR}
                onChange={(e) => handleRgbChange(e.target.value, rgbG, rgbB)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-1.5 py-1.5 text-center text-xs outline-none"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={rgbG}
                onChange={(e) => handleRgbChange(rgbR, e.target.value, rgbB)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-1.5 py-1.5 text-center text-xs outline-none"
              />
              <input
                type="number"
                min="0"
                max="255"
                value={rgbB}
                onChange={(e) => handleRgbChange(rgbR, rgbG, e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-1.5 py-1.5 text-center text-xs outline-none"
              />
            </div>
          </div>

          {/* Opacity / Alpha Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              <span>Opacity</span>
              <span className="font-mono">{Math.round(selectedStop.alpha * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(selectedStop.alpha * 100)}
              onChange={(e) =>
                onUpdateStop(selectedStop.id, {
                  alpha: parseInt(e.target.value, 10) / 100,
                })
              }
              className="w-full accent-[#5722AF] cursor-pointer"
            />
          </div>

          {/* Position Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
              <span>Position</span>
              <span className="font-mono">{Math.round(selectedStop.position)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(selectedStop.position)}
              onChange={(e) =>
                onUpdateStop(selectedStop.id, {
                  position: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-[#5722AF] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
