'use client';

import React, { useRef, useState, useEffect } from 'react';

interface PowerBarProps {
  onShoot: (power: number) => void;
  disabled?: boolean;
}

export function PowerBar({ onShoot, disabled }: PowerBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [power, setPower] = useState(0); // 0 to 100
  const [isPulling, setIsPulling] = useState(false);

  const calculatePowerFromPointer = (clientY: number) => {
    if (!trackRef.current || disabled) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const clampedY = Math.max(0, Math.min(rect.height, offsetY));
    const p = Math.round((clampedY / rect.height) * 100);
    return p;
  };

  const handlePointerDown = (clientY: number) => {
    if (disabled) return;
    setIsPulling(true);
    const p = calculatePowerFromPointer(clientY);
    setPower(p);
  };

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isPulling) return;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const p = calculatePowerFromPointer(clientY);
      setPower(p);
    };

    const handlePointerUp = () => {
      if (isPulling) {
        setIsPulling(false);
        if (power > 3) {
          onShoot(power);
        }
        setPower(0);
      }
    };

    if (isPulling) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isPulling, power, disabled, onShoot]);

  // Max cue stick travel distance in px
  const stickOffset = (power / 100) * 110;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Power Value Tooltip when pulling */}
      <div
        className={`mb-1 text-[11px] font-mono font-bold transition-opacity ${
          power > 0 ? 'opacity-100 text-amber-400' : 'opacity-0'
        }`}
      >
        {power}%
      </div>

      {/* Vertical Track Housing */}
      <div
        ref={trackRef}
        onMouseDown={(e) => handlePointerDown(e.clientY)}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientY)}
        className={`relative w-8 h-48 rounded-lg bg-[#14161f] border border-slate-700/80 shadow-2xl flex flex-col items-center overflow-hidden cursor-ns-resize transition-all ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-slate-500'
        }`}
        title="Pull down cue stick to charge power, release to strike"
      >
        {/* Horizontal Notch Markers (exact match to screenshot) */}
        <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-slate-700/60 pointer-events-none" />
        <div className="absolute top-[40%] left-0 right-0 h-[1px] bg-slate-700/60 pointer-events-none" />
        <div className="absolute top-[60%] left-0 right-0 h-[1px] bg-slate-700/60 pointer-events-none" />
        <div className="absolute top-[80%] left-0 right-0 h-[1px] bg-slate-700/60 pointer-events-none" />

        {/* Glow fill meter behind stick */}
        <div
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-amber-500/20 via-orange-500/30 to-red-500/40 pointer-events-none transition-all duration-75"
          style={{ height: `${power}%` }}
        />

        {/* Cue Stick graphic (slides down as pulled) */}
        <div
          className="absolute w-3.5 h-[120%] top-2 rounded-t-sm transition-transform pointer-events-none shadow-md"
          style={{
            transform: `translateY(${stickOffset}px)`,
            background: 'linear-gradient(to right, #92400e 0%, #d97706 35%, #fef3c7 60%, #b45309 85%, #78350f 100%)',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.8)',
          }}
        >
          {/* Cue Tip & White Ferrule at Top */}
          <div className="w-full h-2 rounded-t-sm bg-slate-100 border-b border-slate-400" />
          <div className="w-full h-1 bg-[#1e40af] rounded-t-sm" />

          {/* Cue Butt / Grip texture at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#27272a] border-t border-amber-700/60" />
        </div>
      </div>
    </div>
  );
}
