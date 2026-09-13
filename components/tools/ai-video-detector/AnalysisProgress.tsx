'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Activity } from 'lucide-react';

const ANALYSIS_STAGES = [
  'Preparing video payload...',
  'Extracting video information & headers...',
  'Sampling video frames across timeline...',
  'Analyzing temporal patterns & continuity...',
  'Evaluating visual artifacts & boundaries...',
  'Inspecting audio track & frequency spectrum...',
  'Combining multi-modal signals...',
  'Generating final probabilistic report...',
];

export function AnalysisProgress() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % ANALYSIS_STAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#12151e] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-lg text-center space-y-5 animate-in fade-in duration-200">
      {/* Animated Spinner Icon */}
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-[#5722AF]/20 dark:border-[#5722AF]/30 animate-pulse" />
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#5722AF] to-[#9B6BE8] flex items-center justify-center text-white shadow-md shadow-[#5722AF]/30">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Title & Staged Message */}
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
          Analyzing Video Signals...
        </h3>
        <p className="text-xs sm:text-sm text-[#5722AF] dark:text-[#9B6BE8] font-medium h-5 transition-all">
          {ANALYSIS_STAGES[stageIndex]}
        </p>
      </div>

      {/* Indeterminate Animated Progress Bar (No fake percentages) */}
      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#5722AF] via-[#7B45D1] to-[#9B6BE8] w-1/3 rounded-full animate-[indeterminate_1.8s_ease-in-out_infinite]" />
      </div>

      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
        Temporal and visual signal inspection is running. This may take up to a minute depending on video length.
      </p>
    </div>
  );
}
