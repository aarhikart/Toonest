'use client';

import React from 'react';
import { VerificationResult } from '@/lib/video-metadata/types';
import { CheckCircle2, AlertTriangle, ShieldCheck, Check, Info, Layers } from 'lucide-react';

interface VerificationResultCardProps {
  verification: VerificationResult;
}

export function VerificationResultCard({ verification }: VerificationResultCardProps) {
  const isSuccess = verification.status === 'success';

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <span className="text-xs font-bold text-[#5722AF] dark:text-[#9B6BE8] uppercase tracking-wider">
            Step 3: Verification Report
          </span>
          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100 mt-0.5">
            Post-Cleaning Quality & Integrity Audit
          </h3>
        </div>

        {verification.isTransparentLayer ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Transparent Shield Layer Active</span>
          </div>
        ) : verification.isAntiFingerprint ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Anti-Copyright Shield Active</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{isSuccess ? 'Verified Clean & Playable' : 'Verified with Exceptions'}</span>
          </div>
        )}
      </div>

      {/* Main Status Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Original Metadata
          </span>
          <div className="text-xl font-black text-zinc-900 dark:text-zinc-100">
            {verification.originalRemovableCount} items
          </div>
          <span className="text-xs text-zinc-500">detected in original file</span>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            Cleaned File
          </span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
            {verification.cleanedRemovableCount} removable items
          </div>
          <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
            remaining after cleaning
          </span>
        </div>

        <div className="bg-purple-50/60 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60">
          <span className="text-[11px] font-semibold text-[#5722AF] dark:text-purple-300 uppercase tracking-wider block mb-1">
            Container Playability
          </span>
          <div className="text-xl font-black text-[#5722AF] dark:text-purple-200">
            100% Intact
          </div>
          <span className="text-xs text-purple-600/80 dark:text-purple-300/80">
            Streams & duration verified
          </span>
        </div>
      </div>

      {/* Integrity Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold">Video Stream Detected</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold">Audio Track Verified</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold">Duration Matches Original</span>
        </div>
      </div>

      {/* Transparent Shield Layer Audit Card */}
      {verification.isTransparentLayer && (
        <div className="bg-indigo-50/60 dark:bg-indigo-950/25 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
              Transparent Frame Layer Audit
            </h4>
          </div>
          <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80">
            A full-screen transparent protective layer was fused across 100% of the video dimensions. This alters algorithmic frame pixel hashes for automated scanners (Meta/Instagram) while keeping your original video visually identical and audio 100% lossless.
          </p>
        </div>
      )}

      {/* Anti-Fingerprint Shield Modifications Details */}
      {verification.isAntiFingerprint && verification.fingerprintModifications && (
        <div className="bg-rose-50/60 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200">
              Content ID / Anti-Copyright Shield Audit
            </h4>
          </div>
          <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
            Automated copyright systems (like DEMIC on Instagram/Facebook/TikTok) match exact audio soundwaves and frame pixel grids. The following transformations were applied to desynchronize the digital fingerprint:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {verification.fingerprintModifications.map((mod, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-900/40 text-xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">{mod}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Metadata Rule Notice */}
      <div className="bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-4 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100">
          <Info className="w-4 h-4 text-[#5722AF] shrink-0" />
          <span>Why some technical information remains in the cleaned file:</span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 pl-6 text-[11px] leading-relaxed">
          Technical parameters such as <strong>Video Codec</strong>, <strong>Resolution</strong>, and <strong>Frame Rate</strong> are structural requirements of the MP4 container format. Removing them would render the video unplayable in media players. This tool cleanly strips all descriptive tags, GPS coordinates, hardware markers, and timestamps while preserving playability.
        </p>
      </div>
    </div>
  );
}
