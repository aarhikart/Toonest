'use client';

import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, UserCheck, Eye, Layers } from 'lucide-react';
import { FaceAnalysisMetrics } from '@/lib/camera/face-demo';

interface FaceDemoOverlayProps {
  metrics: FaceAnalysisMetrics | null;
  isActive: boolean;
}

export const FaceDemoOverlay: React.FC<FaceDemoOverlayProps> = ({ metrics, isActive }) => {
  if (!isActive) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header with Clear Disclaimer */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Face Analysis Demo
            </h4>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Client-Side Demonstration Only
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-[10px] font-bold">
          DEMO ONLY
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5">Status</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Face Detected
          </span>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5">Confidence</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {metrics?.confidence || 94}%
          </span>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5">Face Position</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {metrics?.position || 'Center'}
          </span>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5">Expression</span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {metrics?.expression || 'Neutral'}
          </span>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5 flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#5722AF]" /> Eyes
          </span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {metrics?.eyes || 'Detected (Open)'}
          </span>
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#5722AF]" /> Landmarks
          </span>
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            {metrics?.landmarks || 68} Points
          </span>
        </div>

        <div className="col-span-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5">Privacy Guard</span>
            <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              No Identity Recognition
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
            Compliant
          </span>
        </div>
      </div>

      {/* Same Face Comparison Demo Section */}
      <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#5722AF]" />
            Face Match Demo
          </span>
          <span className="text-[10px] font-bold text-[#5722AF] dark:text-purple-300 bg-white dark:bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
            DEMO ONLY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 items-center text-xs">
          <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-purple-100 dark:border-zinc-700 text-center">
            <span className="text-[10px] text-zinc-400 block mb-1">Reference</span>
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-lg">
              👤
            </div>
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mt-1 block">
              Demo Profile
            </span>
          </div>

          <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-purple-100 dark:border-zinc-700 text-center">
            <span className="text-[10px] text-zinc-400 block mb-1">Live Camera</span>
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-lg">
              📸
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {metrics?.similarityScore || 92}% Similarity
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-white/80 dark:bg-zinc-900/80 rounded-xl border border-purple-200/60 dark:border-purple-900 text-center">
          <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">
            Demo Result: Likely Same Face
          </span>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Demo Result — not a real biometric identity verification. Never used for authentication.
          </p>
        </div>
      </div>
    </div>
  );
};
