'use client';

import React from 'react';
import { BALL_COLORS } from '@/lib/pool/constants';

interface PocketedTrayProps {
  pocketedIds: number[];
}

export function PocketedTray({ pocketedIds }: PocketedTrayProps) {
  // Filter out cue ball (id: 0) from tray
  const objectBalls = pocketedIds.filter((id) => id > 0);

  return (
    <div className="relative flex flex-col items-center select-none py-1">
      {/* Outer Curved Golden / Amber Double Rail Track (exact match to screenshot) */}
      <div className="relative w-8 min-h-[300px] h-full rounded-full border-2 border-amber-600/70 bg-[#0d0f17]/90 p-1 flex flex-col items-center justify-end gap-1.5 shadow-2xl">
        {/* Inner track golden rail line */}
        <div className="absolute inset-1 rounded-full border border-amber-500/30 pointer-events-none" />

        {/* Pocketed Balls (stacked from bottom up) */}
        {objectBalls.slice(-10).map((ballId) => {
          const isStripe = ballId >= 9 && ballId <= 15;
          const isEight = ballId === 8;
          const color = BALL_COLORS[ballId] || '#94a3b8';

          return (
            <div
              key={ballId}
              className="relative w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-md animate-in fade-in zoom-in-50 duration-200"
              style={{
                backgroundColor: isStripe ? '#f8fafc' : color,
                boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.8)',
              }}
              title={`Ball ${ballId}`}
            >
              {/* Stripe Band */}
              {isStripe && (
                <div
                  className="absolute inset-x-0 h-3 rounded-none pointer-events-none"
                  style={{
                    backgroundColor: color,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />
              )}

              {/* Number Circle Badge */}
              <div
                className={`relative z-10 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black ${
                  isEight ? 'bg-white text-black' : isStripe ? 'bg-white text-black' : 'bg-white text-black'
                }`}
              >
                {ballId}
              </div>
            </div>
          );
        })}

        {objectBalls.length === 0 && (
          <div className="text-[9px] text-amber-500/30 font-mono rotate-90 my-auto pointer-events-none whitespace-nowrap">
            EMPTY
          </div>
        )}
      </div>
    </div>
  );
}
