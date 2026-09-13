'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sliders,
  Compass,
  Pipette,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ShadowLayer } from '@/lib/boxShadow/shadowTypes';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  isValidHex,
  normalizeHex,
} from '@/lib/colorEngine';
import {
  applyDirectionToLayer,
  applySoftnessToLayer,
} from '@/lib/boxShadow/shadowEngine';

interface ShadowLayerControlsProps {
  layer: ShadowLayer;
  layerIndex: number;
  onUpdateLayer: (updates: Partial<ShadowLayer>) => void;
}

const QUICK_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'Dark Gray', value: '#1E293B' },
  { label: 'Slate', value: '#64748B' },
  { label: 'Brand Purple', value: '#5722AF' },
  { label: 'White', value: '#FFFFFF' },
];

export function ShadowLayerControls({
  layer,
  layerIndex,
  onUpdateLayer,
}: ShadowLayerControlsProps) {
  // Local state for direct typing
  const [hexInput, setHexInput] = useState(layer.color);
  const [rgbR, setRgbR] = useState(hexToRgb(layer.color).r.toString());
  const [rgbG, setRgbG] = useState(hexToRgb(layer.color).g.toString());
  const [rgbB, setRgbB] = useState(hexToRgb(layer.color).b.toString());

  // Macro controls state
  const [angle, setAngle] = useState(135);
  const [distance, setDistance] = useState(
    Math.round(Math.sqrt(layer.offsetX ** 2 + layer.offsetY ** 2)) || 10
  );
  const [softness, setSoftness] = useState(50);

  const dialRef = useRef<HTMLDivElement>(null);
  const [isDraggingDial, setIsDraggingDial] = useState(false);

  // Sync inputs when layer color changes
  useEffect(() => {
    setHexInput(layer.color);
    const rgb = hexToRgb(layer.color);
    setRgbR(rgb.r.toString());
    setRgbG(rgb.g.toString());
    setRgbB(rgb.b.toString());
  }, [layer.color]);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (isValidHex(val)) {
      const norm = normalizeHex(val);
      onUpdateLayer({ color: norm });
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
      onUpdateLayer({ color: hex });
    }
  };

  // Direction dial dragging
  const updateAngleFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!dialRef.current) return;
      const rect = dialRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;

      let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90;
      if (deg < 0) deg += 360;
      if (deg >= 360) deg -= 360;

      setAngle(deg);
      const updated = applyDirectionToLayer(layer, distance, deg);
      onUpdateLayer({ offsetX: updated.offsetX, offsetY: updated.offsetY });
    },
    [layer, distance, onUpdateLayer]
  );

  const handleDialMouseDown = (e: React.MouseEvent) => {
    setIsDraggingDial(true);
    updateAngleFromPointer(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDraggingDial) updateAngleFromPointer(e.clientX, e.clientY);
    };
    const onUp = () => setIsDraggingDial(false);

    if (isDraggingDial) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }
  }, [isDraggingDial, updateAngleFromPointer]);

  // Distance slider change
  const handleDistanceChange = (newDist: number) => {
    setDistance(newDist);
    const updated = applyDirectionToLayer(layer, newDist, angle);
    onUpdateLayer({ offsetX: updated.offsetX, offsetY: updated.offsetY });
  };

  // Softness slider change
  const handleSoftnessChange = (newSoft: number) => {
    setSoftness(newSoft);
    const updated = applySoftnessToLayer(layer, newSoft);
    onUpdateLayer({
      blur: updated.blur,
      spread: updated.spread,
      opacity: updated.opacity,
    });
  };

  // Pointer position on dial circle
  const rad = ((angle - 90) * Math.PI) / 180;
  const radius = 24;
  const dialX = 32 + Math.cos(rad) * radius;
  const dialY = 32 + Math.sin(rad) * radius;

  return (
    <div className="w-full bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs transition-colors space-y-5">
      {/* Header: Layer Title & Inset Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>Layer {layerIndex + 1} Controls</span>
          </h3>
          <p className="text-[11px] text-zinc-500">
            Precision control over offsets, blur, spread, and opacity
          </p>
        </div>

        {/* Inset Shadow Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Inset Shadow:
          </span>
          <button
            type="button"
            onClick={() => onUpdateLayer({ inset: !layer.inset })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              layer.inset ? 'bg-[#5722AF]' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                layer.inset ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Core Dimensions: X Offset, Y Offset, Blur, Spread */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* X Offset */}
        <div>
          <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            <span>X Offset (Horizontal)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="-100"
                max="100"
                value={layer.offsetX}
                onChange={(e) =>
                  onUpdateLayer({ offsetX: parseInt(e.target.value, 10) || 0 })
                }
                className="w-14 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-center font-mono text-xs outline-none"
              />
              <span className="font-mono text-zinc-400">px</span>
            </div>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={layer.offsetX}
            onChange={(e) =>
              onUpdateLayer({ offsetX: parseInt(e.target.value, 10) })
            }
            className="w-full accent-[#5722AF] cursor-pointer"
          />
        </div>

        {/* Y Offset */}
        <div>
          <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            <span>Y Offset (Vertical)</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="-100"
                max="100"
                value={layer.offsetY}
                onChange={(e) =>
                  onUpdateLayer({ offsetY: parseInt(e.target.value, 10) || 0 })
                }
                className="w-14 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-center font-mono text-xs outline-none"
              />
              <span className="font-mono text-zinc-400">px</span>
            </div>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={layer.offsetY}
            onChange={(e) =>
              onUpdateLayer({ offsetY: parseInt(e.target.value, 10) })
            }
            className="w-full accent-[#5722AF] cursor-pointer"
          />
        </div>

        {/* Blur Radius */}
        <div>
          <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            <span>Blur Radius</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="200"
                value={layer.blur}
                onChange={(e) =>
                  onUpdateLayer({ blur: Math.max(0, parseInt(e.target.value, 10) || 0) })
                }
                className="w-14 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-center font-mono text-xs outline-none"
              />
              <span className="font-mono text-zinc-400">px</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={layer.blur}
            onChange={(e) =>
              onUpdateLayer({ blur: parseInt(e.target.value, 10) })
            }
            className="w-full accent-[#5722AF] cursor-pointer"
          />
        </div>

        {/* Spread Radius */}
        <div>
          <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            <span>Spread Radius</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="-100"
                max="100"
                value={layer.spread}
                onChange={(e) =>
                  onUpdateLayer({ spread: parseInt(e.target.value, 10) || 0 })
                }
                className="w-14 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-center font-mono text-xs outline-none"
              />
              <span className="font-mono text-zinc-400">px</span>
            </div>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={layer.spread}
            onChange={(e) =>
              onUpdateLayer({ spread: parseInt(e.target.value, 10) })
            }
            className="w-full accent-[#5722AF] cursor-pointer"
          />
        </div>
      </div>

      {/* Opacity & Color Picker */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 text-xs">
        {/* Opacity Slider */}
        <div>
          <div className="flex items-center justify-between font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            <span>Shadow Opacity</span>
            <span className="font-mono text-[#5722AF] dark:text-[#9B6BE8]">{layer.opacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={layer.opacity}
            onChange={(e) =>
              onUpdateLayer({ opacity: parseInt(e.target.value, 10) })
            }
            className="w-full accent-[#5722AF] cursor-pointer"
          />
        </div>

        {/* Color Controls: Native picker, Quick presets, HEX & RGB inputs */}
        <div>
          <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
            Shadow Color
          </label>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {/* Native Color Picker Trigger */}
            <div className="relative group/picker shrink-0">
              <input
                type="color"
                value={layer.color}
                onChange={(e) => handleHexChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div
                className="w-8 h-8 rounded-lg border border-black/20 dark:border-white/20 shadow-xs flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: layer.color }}
              >
                <Pipette className="w-3.5 h-3.5 text-white mix-blend-difference" />
              </div>
            </div>

            {/* Quick Color Presets */}
            {QUICK_COLORS.map((qc) => (
              <button
                key={qc.label}
                type="button"
                onClick={() => handleHexChange(qc.value)}
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                  layer.color.toLowerCase() === qc.value.toLowerCase()
                    ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/20 dark:text-[#9B6BE8] font-bold'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: qc.value }}
                />
                <span>{qc.label}</span>
              </button>
            ))}
          </div>

          {/* HEX & RGB Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 font-sans block mb-0.5">HEX</span>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                maxLength={7}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 uppercase outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-sans block mb-0.5">R</span>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbR}
                onChange={(e) => handleRgbChange(e.target.value, rgbG, rgbB)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-1 text-center outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-sans block mb-0.5">G</span>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbG}
                onChange={(e) => handleRgbChange(rgbR, e.target.value, rgbB)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-1 text-center outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-sans block mb-0.5">B</span>
              <input
                type="number"
                min="0"
                max="255"
                value={rgbB}
                onChange={(e) => handleRgbChange(rgbR, rgbG, e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-1 text-center outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Direction & Softness Macro Controls */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3 text-xs">
        <div className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#5722AF] dark:text-[#9B6BE8]" />
          <span>Light Direction & Distance Macro</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Circular Direction Dial */}
          <div
            ref={dialRef}
            onMouseDown={handleDialMouseDown}
            className="relative w-16 h-16 rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-crosshair shrink-0 select-none shadow-inner"
            title="Drag dial to direct shadow angle"
          >
            <div className="w-2 h-2 rounded-full bg-zinc-400" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1="32"
                y1="32"
                x2={dialX}
                y2={dialY}
                stroke="#5722AF"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div
              className="absolute w-3.5 h-3.5 rounded-full bg-[#5722AF] border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-xs"
              style={{ left: `${dialX}px`, top: `${dialY}px` }}
            />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-center justify-between font-semibold text-zinc-600 dark:text-zinc-400 mb-1 text-[11px]">
                <span>Distance</span>
                <span className="font-mono">{distance}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={distance}
                onChange={(e) => handleDistanceChange(parseInt(e.target.value, 10))}
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between font-semibold text-zinc-600 dark:text-zinc-400 mb-1 text-[11px]">
                <span>Softness Index</span>
                <span className="font-mono">{softness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={softness}
                onChange={(e) => handleSoftnessChange(parseInt(e.target.value, 10))}
                className="w-full accent-[#5722AF] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
