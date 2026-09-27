'use client';

import React from 'react';
import { ComparisonRow } from '@/lib/video-metadata/types';
import { Check, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface BeforeAfterTableProps {
  rows: ComparisonRow[];
}

export function BeforeAfterTable({ rows }: BeforeAfterTableProps) {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Before / After Metadata Audit Matrix
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Side-by-side verification extracted via FFprobe before and after processing.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider font-bold bg-zinc-50/50 dark:bg-zinc-800/40">
              <th className="py-3 px-4">Metadata Field</th>
              <th className="py-3 px-4">Original File</th>
              <th className="py-3 px-4">Cleaned File</th>
              <th className="py-3 px-4 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
            {rows.map((row, idx) => {
              const isRemoved = row.status === 'removed';
              const isPreservedTechnical = row.status === 'preserved_technical';

              return (
                <tr
                  key={idx}
                  className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="py-3 px-4 font-sans font-semibold text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-1.5">
                      {row.isSensitive && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Privacy Sensitive Tag" />
                      )}
                      <span>{row.label}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 max-w-[200px] truncate" title={row.originalValue}>
                    {row.originalValue}
                  </td>

                  <td className="py-3 px-4">
                    {isRemoved ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>Not detected</span>
                      </span>
                    ) : (
                      <span className="text-zinc-900 dark:text-zinc-100 font-semibold max-w-[200px] truncate block" title={row.cleanedValue}>
                        {row.cleanedValue}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {isRemoved ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Removed
                      </span>
                    ) : isPreservedTechnical ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        Preserved (Playback)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        Preserved
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
