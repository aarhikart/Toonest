'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, CheckCircle2, X } from 'lucide-react';
import { CallRecord } from '@/lib/call-history/types';
import { formatCallDate, formatPhoneNumberForDisplay } from '@/lib/call-history/normalizer';

interface DuplicatesBannerProps {
  duplicateCount: number;
  duplicates: CallRecord[];
  onRemoveDuplicates: () => void;
}

export function DuplicatesBanner({
  duplicateCount,
  duplicates,
  onRemoveDuplicates,
}: DuplicatesBannerProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);

  if (duplicateCount === 0) return null;

  return (
    <>
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>{duplicateCount} possible duplicate {duplicateCount === 1 ? 'record' : 'records'}</strong> detected
            (matching number, timestamp, call type, and duration).
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
          >
            Review Duplicates
          </button>
          <button
            type="button"
            onClick={onRemoveDuplicates}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Duplicates</span>
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Review {duplicateCount} Duplicate Records</span>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-2 text-xs">
              <p className="text-zinc-500 pb-2">
                These records share the identical caller number, timestamp, call direction, and duration.
              </p>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                {duplicates.map((d, i) => (
                  <div key={i} className="p-3 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {d.contactName || formatPhoneNumberForDisplay(d.phoneNumber)}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-400">
                        {formatCallDate(d.timestamp)} at {d.time} &bull; {d.type}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-zinc-700 dark:text-zinc-300">
                      {d.durationFormatted}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Keep Records
              </button>
              <button
                onClick={() => {
                  onRemoveDuplicates();
                  setShowReviewModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove All {duplicateCount} Duplicates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
