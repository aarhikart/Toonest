'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SpinSelectorProps {
  spinX: number; // -1 to 1
  spinY: number; // -1 to 1
  onChange: (spinX: number, spinY: number) => void;
  disabled?: boolean;
}

export function SpinSelector({ spinX, spinY, onChange, disabled }: SpinSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const radius = 32; // Half of 64px circle

  const updateSpinFromPointer = (e: MouseEvent | TouchEvent) => {
    if (!containerRef.current || disabled) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);

    const dist = Math.hypot(dx, dy);
    const maxR = radius - 6;

    let sx = dx / maxR;
    let sy = dy / maxR;

    if (dist > maxR) {
      sx = (dx / dist);
      sy = (dy / dist);
    }

    onChange(Math.max(-1, Math.min(1, sx)), Math.max(-1, Math.min(1, sy)));
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) updateSpinFromPointer(e);
    };
    const handleUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  const dotX = radius + spinX * (radius - 8);
  const dotY = radius + spinY * (radius - 8);

  return (
    <div className="relative select-none flex items-center justify-center">
      {/* 3D Cue Ball */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          if (disabled) return;
          setIsDragging(true);
          updateSpinFromPointer(e.nativeEvent);
        }}
        onTouchStart={(e) => {
          if (disabled) return;
          setIsDragging(true);
          updateSpinFromPointer(e.nativeEvent);
        }}
        className="relative w-16 h-16 rounded-full cursor-pointer shadow-lg transition-transform active:scale-95"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #e2e8f0 55%, #94a3b8 100%)',
          boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.4), 0 4px 10px rgba(0,0,0,0.6)',
        }}
        title="Cue Ball English / Spin Control"
      >
        {/* Subtle grid lines on cue ball */}
        <div className="absolute inset-0 rounded-full border border-slate-300/40 pointer-events-none" />
        <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-slate-300/30 pointer-events-none -translate-y-1/2" />
        <div className="absolute left-1/2 top-2 bottom-2 w-[1px] bg-slate-300/30 pointer-events-none -translate-x-1/2" />

        {/* Red Spin Indicator Dot (circle o from user screenshot) */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full border border-red-600 bg-red-500/20 shadow pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: `${dotX}px`,
            top: `${dotY}px`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-sm" />
        </div>
      </div>

      {/* 'R' Reset Button in purple rounded square (exact match to screenshot) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(0, 0);
        }}
        disabled={disabled}
        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-[#6d28d9] hover:bg-[#7c3aed] text-white text-[10px] font-extrabold flex items-center justify-center shadow-md border border-purple-400/40 transition-all active:scale-90"
        title="Reset Spin to Center"
      >
        R
      </button>
    </div>
  );
}
