'use client';

import React from 'react';
import { Handshake } from 'lucide-react';

interface DrawOfferModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function DrawOfferModal({ isOpen, onAccept, onDecline }: DrawOfferModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center mx-auto">
          <Handshake className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Draw Offered</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Your opponent has offered a draw. Do you accept?</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            Accept Draw
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
