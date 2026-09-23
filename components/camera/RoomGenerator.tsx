'use client';

import React, { useState } from 'react';
import { Camera, Sparkles, Shield, Clock, Key, ArrowRight, Loader2 } from 'lucide-react';

interface RoomGeneratorProps {
  onRoomGenerated: (roomData: {
    roomId: string;
    pin: string | null;
    createdAt: number;
    expiresAt: number;
    durationMinutes: number;
  }) => void;
}

export const RoomGenerator: React.FC<RoomGeneratorProps> = ({ onRoomGenerated }) => {
  const [duration, setDuration] = useState<number>(10);
  const [requirePin, setRequirePin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/camera/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expirationMinutes: duration,
          requirePin
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate camera connection.');
      }

      onRoomGenerated({
        roomId: data.roomId,
        pin: data.pin,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        durationMinutes: data.durationMinutes
      });
    } catch (err: any) {
      setError(err.message || 'Network error creating session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-white to-purple-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-purple-950/20 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-xl max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/50 text-[#5722AF] dark:text-purple-300 ring-8 ring-purple-50 dark:ring-purple-950/30">
          <Camera className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
          Camera Connect Demo
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          Generate a temporary, consent-based WebRTC camera and microphone connection to view your phone's live camera on your laptop.
        </p>
      </div>

      {/* Options Panel */}
      <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-4">
        {/* Expiration Duration */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#5722AF]" />
            Session Expiration:
          </span>
          <div className="flex items-center gap-1">
            {[5, 10, 15, 30].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setDuration(m)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                  duration === m
                    ? 'bg-[#5722AF] text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {/* Security PIN Toggle */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-200/80 dark:border-zinc-700/60">
          <div>
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#5722AF]" />
              Require 6-Digit Room PIN
            </span>
            <p className="text-[11px] text-zinc-400">Extra layer of protection for phone connection</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={requirePin}
              onChange={e => setRequirePin(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5722AF]"></div>
          </label>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
          {error}
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#5722AF] to-purple-600 hover:from-[#491c96] hover:to-purple-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-lg shadow-purple-500/25 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating Secure Room...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Generate Camera URL</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Privacy Guarantee */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Strictly consent-based • Peer-to-peer WebRTC • Zero cloud video storage</span>
      </div>
    </div>
  );
};
