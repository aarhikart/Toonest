'use client';

import React, { useEffect, useRef } from 'react';
import { ChessMoveRecord } from '@/lib/chess/types';
import { ScrollText } from 'lucide-react';

interface MoveHistoryProps {
  moves: ChessMoveRecord[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group moves into pairs (White, Black)
  const pairedMoves: Array<{ moveNum: number; white: ChessMoveRecord; black?: ChessMoveRecord }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairedMoves.push({
      moveNum: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);

  return (
    <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-2">
        <ScrollText className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Move History ({moves.length})
        </h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-56 sm:max-h-72 space-y-1 font-mono text-xs pr-1">
        {pairedMoves.length === 0 ? (
          <div className="text-center text-zinc-400 dark:text-zinc-500 py-6 text-xs italic">
            No moves yet. Make your opening move!
          </div>
        ) : (
          pairedMoves.map((pair) => (
            <div
              key={pair.moveNum}
              className="grid grid-cols-12 py-1 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <span className="col-span-2 text-zinc-400 dark:text-zinc-500 font-semibold">{pair.moveNum}.</span>
              <span className="col-span-5 font-bold text-zinc-800 dark:text-zinc-100">{pair.white.san}</span>
              <span className="col-span-5 font-bold text-zinc-600 dark:text-zinc-300">
                {pair.black ? pair.black.san : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
