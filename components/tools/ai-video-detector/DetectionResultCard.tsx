'use client';

import React, { useRef, useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Download,
  RotateCcw,
  History,
  Key,
  Info,
  ExternalLink,
} from 'lucide-react';
import { VideoAnalysisResult } from '@/lib/ai-video/types';
import { ConfidenceScore } from './ConfidenceScore';
import { EvidenceTimeline } from './EvidenceTimeline';
import { EvidenceList } from './EvidenceList';
import { VideoMetadataTable } from './VideoMetadataTable';
import { AnalysisLimitations } from './AnalysisLimitations';
import { ReportExportModal } from './ReportExportModal';

interface DetectionResultCardProps {
  result: VideoAnalysisResult;
  videoSrc?: string;
  onReset: () => void;
  onOpenHistory: () => void;
}

export const DetectionResultCard: React.FC<DetectionResultCardProps> = ({
  result,
  videoSrc,
  onReset,
  onOpenHistory,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Handle seeking from timeline
  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCopySummary = async () => {
    const verdictText =
      result.verdict === 'likely_ai'
        ? 'Likely AI-Generated'
        : result.verdict === 'likely_real'
        ? 'Likely Authentic'
        : result.verdict === 'possibly_manipulated'
        ? 'Potentially Manipulated'
        : 'Inconclusive';

    const text = [
      `ToolNest AI Video Detection Summary`,
      `Verdict: ${verdictText}`,
      `Confidence: ${result.confidence}%`,
      `Engine: ${result.engineName || 'Local Engine'}`,
      `Source: ${result.video.filename || 'Web Media'} (${result.video.width}x${result.video.height})`,
      `Analysis Date: ${new Date(result.analyzedAt).toLocaleDateString()}`,
      `Disclaimer: Probabilistic assessment. Not definitive forensic proof.`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getVerdictStyle = () => {
    switch (result.verdict) {
      case 'likely_ai':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />,
          title: 'Likely AI-Generated Video',
          bg: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50',
          badge: 'bg-rose-600 text-white',
          desc: 'Synthetic spatial and temporal artifacts suggest this video was created or altered using generative AI video models.',
        };
      case 'likely_real':
        return {
          icon: <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
          title: 'Likely Authentic Video',
          bg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50',
          badge: 'bg-emerald-600 text-white',
          desc: 'Container metadata, temporal coherence, and compression characteristics are consistent with genuine optical camera recordings.',
        };
      case 'possibly_manipulated':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />,
          title: 'Potentially Manipulated / Edited',
          bg: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50',
          badge: 'bg-amber-600 text-white',
          desc: 'Portions of this video exhibit irregular blending, audio-visual misalignment, or inconsistent frame compression typical of post-production alterations.',
        };
      case 'inconclusive':
      default:
        return {
          icon: <HelpCircle className="w-8 h-8 text-slate-600 dark:text-slate-400" />,
          title: 'Analysis Inconclusive',
          bg: 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700',
          badge: 'bg-slate-700 text-white',
          desc: result.isEngineConfigured
            ? 'Heavy compression, low resolution, or conflicting signals prevent a high-confidence determination for this media.'
            : 'Container metadata extracted successfully. Connect an external AI detection neural provider to enable advanced frame-by-frame deepfake scoring.',
        };
    }
  };

  const verdictConfig = getVerdictStyle();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Top Banner: Unconfigured Engine Notice if applicable */}
      {!result.isEngineConfigured && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-purple-200 dark:border-purple-800/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shrink-0 mt-0.5">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Transparent Engine Mode (Zero Fake Scores)
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                    Real Analysis
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  ToolNest never outputs random or fake detection percentages. Local container,
                  resolution, codec, and timing inspection is fully active. To enable external
                  deep neural frame classification, configure your detector API credentials.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigGuide(!showConfigGuide)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-slate-700/60 transition-colors whitespace-nowrap self-start sm:self-center"
            >
              {showConfigGuide ? 'Hide API Setup' : 'How to Connect API'}
            </button>
          </div>

          {showConfigGuide && (
            <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-800/40 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                To link a commercial or research deepfake detection API (e.g., Sensity, Reality Defender, Hive, or custom model):
              </p>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] space-y-1">
                <div>AI_VIDEO_DETECTOR_API_URL=https://your-detection-api.example.com/v1/detect</div>
                <div>AI_VIDEO_DETECTOR_API_KEY=your_secret_api_key_here</div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Add these in your root <code className="px-1.5 py-0.5 rounded bg-purple-100/60 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-mono">.env.local</code> file and restart the Next.js server. The backend provider automatically passes uploaded media to your pipeline.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Verdict Summary Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${verdictConfig.bg} shadow-sm`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/50 dark:border-slate-800 shrink-0">
              {verdictConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {verdictConfig.title}
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${verdictConfig.badge}`}
                >
                  {result.confidence}% Confidence
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {result.engineName || 'Standard Engine'}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
                {verdictConfig.desc}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
              title="Copy analysis summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-700 hover:bg-purple-800 text-white transition-all shadow-sm shadow-purple-500/20"
              title="Download full report"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Main Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols on LG): Video Player + Evidence Timeline + Specs */}
        <div className="lg:col-span-5 space-y-5">
          {/* Synchronized Video Player */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                Synchronized Media Inspector
              </span>
              <span className="text-slate-400 font-normal">Click timeline to seek</span>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              {videoSrc ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-xs text-center p-4">
                  Video preview unavailable
                </div>
              )}
            </div>

            {/* Interactive Timeline */}
            <EvidenceTimeline
              signals={result.signals}
              duration={result.video.duration || 10}
              onSeek={handleSeek}
            />
          </div>

          {/* Video Metadata Table */}
          <VideoMetadataTable metadata={result.video} />
        </div>

        {/* Right Column (7 Cols on LG): Confidence Breakdown + Evidence Signals List + Limitations */}
        <div className="lg:col-span-7 space-y-5">
          {/* Confidence Score Visualizer */}
          <ConfidenceScore
            score={result.confidence}
            verdict={result.verdict}
          />

          {/* Filterable Evidence List */}
          <EvidenceList
            signals={result.signals}
            onSelectTimestamp={handleSeek}
          />

          {/* Scientific Limitations & Responsible Use */}
          <AnalysisLimitations />
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            Analyze Another Video
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Full Report (.txt / .json)
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:underline self-start sm:self-center"
        >
          <History className="w-4 h-4" />
          View Analysis History
        </button>
      </div>

      {/* Report Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        result={result}
      />
    </div>
  );
};
