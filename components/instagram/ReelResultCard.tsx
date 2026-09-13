'use client';

import React, { useState } from 'react';
import {
  Download,
  Check,
  Play,
  Film,
  User,
  Volume2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Image as ImageIcon,
  Smartphone,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { ReelMetadata, ReelFormat } from '@/lib/instagram/types';

interface ReelResultCardProps {
  reel: ReelMetadata;
  onReset: () => void;
  onDownloadStarted?: (reel: ReelMetadata) => void;
}

export function ReelResultCard({
  reel,
  onReset,
  onDownloadStarted,
}: ReelResultCardProps) {
  const [selectedFormatIndex, setSelectedFormatIndex] = useState(0);
  const [downloadState, setDownloadState] = useState<
    'idle' | 'preparing' | 'downloading' | 'completed'
  >('idle');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showMobileGuide, setShowMobileGuide] = useState(false);
  const [showAdminGuide, setShowAdminGuide] = useState(false);
  const [isDownloadingCover, setIsDownloadingCover] = useState(false);

  const hasDirectVideo = reel.formats && reel.formats.length > 0;
  const selectedFormat: ReelFormat | undefined = hasDirectVideo
    ? reel.formats[selectedFormatIndex] || reel.formats[0]
    : undefined;

  const filename = `instagram-reel-${reel.id || 'video'}.mp4`;

  const handleDownloadVideo = async () => {
    if (!selectedFormat?.url || downloadState === 'downloading') return;

    try {
      setDownloadState('preparing');
      if (onDownloadStarted) {
        onDownloadStarted(reel);
      }

      const proxyUrl = `/api/instagram/download?url=${encodeURIComponent(
        selectedFormat.url
      )}&filename=${encodeURIComponent(filename)}`;

      setDownloadState('downloading');

      const link = document.createElement('a');
      link.href = proxyUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setDownloadState('completed');
        setTimeout(() => setDownloadState('idle'), 3000);
      }, 1200);
    } catch (err) {
      console.error('Download trigger failed:', err);
      setDownloadState('idle');
      alert('Could not start download. Please try again.');
    }
  };

  const handleDownloadCover = () => {
    if (!reel.thumbnail || isDownloadingCover) return;
    setIsDownloadingCover(true);

    try {
      if (onDownloadStarted) {
        onDownloadStarted(reel);
      }
      const coverFilename = `instagram-reel-${reel.id || 'cover'}-thumbnail.jpg`;
      const proxyUrl = `/api/instagram/download?url=${encodeURIComponent(
        reel.thumbnail
      )}&filename=${encodeURIComponent(coverFilename)}`;

      const link = document.createElement('a');
      link.href = proxyUrl;
      link.download = coverFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setIsDownloadingCover(false), 1500);
    } catch {
      setIsDownloadingCover(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#12151c] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-7 shadow-lg transition-colors space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header with Creator and Reset button */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5722AF] to-[#9B6BE8] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            {reel.creator ? reel.creator.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                {reel.creator ? `@${reel.creator}` : 'Instagram Creator'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <a
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-zinc-400 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] flex items-center gap-1 font-medium transition-colors"
            >
              <span>View original Reel</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>New Search</span>
        </button>
      </div>

      {/* Media Preview Box */}
      <div className="relative w-full max-w-sm mx-auto aspect-9/14 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-md">
        {showVideoPlayer && selectedFormat?.url ? (
          <video
            src={selectedFormat.url}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="relative w-full h-full group">
            {reel.thumbnail ? (
              <img
                src={reel.thumbnail}
                alt={reel.caption || 'Reel Preview'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500 gap-2">
                <Film className="w-10 h-10" />
                <span className="text-xs">Reel Media Preview</span>
              </div>
            )}

            {/* Play Overlay Button (only if direct video available) */}
            {selectedFormat?.url && (
              <button
                type="button"
                onClick={() => setShowVideoPlayer(true)}
                title="Preview video"
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-[#5722AF]/90 text-white flex items-center justify-center backdrop-blur-xs transition-transform transform group-hover:scale-110 shadow-lg cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              </button>
            )}

            {/* Media info tag */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <span className="flex items-center gap-1 font-medium">
                {hasDirectVideo ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    Video + Audio
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5 text-purple-300" />
                    HD Cover Poster
                  </>
                )}
              </span>
              <span className="font-mono font-semibold">
                {hasDirectVideo ? 'MP4' : 'JPG'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Caption snippet if available */}
      {reel.caption && (
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-24 overflow-y-auto">
          {reel.caption}
        </div>
      )}

      {/* If Video Stream is Restricted by Instagram */}
      {!hasDirectVideo && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Direct Video Stream Restricted by Instagram</span>
          </div>
          <p className="leading-relaxed">
            Meta protects this video stream with account authentication or the creator turned off direct public downloads. We retrieved the post details and high-resolution cover image below.
          </p>
        </div>
      )}

      {/* Quality Options (if multiple qualities exist and video available) */}
      {hasDirectVideo && reel.formats.length > 1 && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            Select Download Quality:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {reel.formats.map((fmt: ReelFormat, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedFormatIndex(idx)}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  selectedFormatIndex === idx
                    ? 'border-[#5722AF] bg-[#5722AF]/10 text-[#5722AF] dark:text-[#9B6BE8]'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
                }`}
              >
                {fmt.quality || `Quality ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="space-y-3 pt-1">
        {hasDirectVideo ? (
          <button
            type="button"
            onClick={handleDownloadVideo}
            disabled={downloadState === 'downloading' || downloadState === 'preparing'}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#491B93] hover:to-[#6A3ABF] text-white font-bold text-base shadow-lg shadow-[#5722AF]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          >
            {downloadState === 'preparing' ? (
              <span>Preparing Download...</span>
            ) : downloadState === 'downloading' ? (
              <span>Downloading Reel...</span>
            ) : downloadState === 'completed' ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>Download Complete!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Download Reel (MP4)</span>
              </>
            )}
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDownloadCover}
              disabled={isDownloadingCover || !reel.thumbnail}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#5722AF] to-[#7B45D1] hover:from-[#491B93] hover:to-[#6A3ABF] text-white font-bold text-sm shadow-md shadow-[#5722AF]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isDownloadingCover ? (
                <span>Downloading Cover...</span>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  <span>Download Cover (HD JPG)</span>
                </>
              )}
            </button>

            <a
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl border border-[#5722AF] text-[#5722AF] dark:text-[#9B6BE8] hover:bg-[#5722AF]/10 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open on Instagram</span>
            </a>
          </div>
        )}

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500">
          {hasDirectVideo
            ? 'Saved directly to your device downloads folder as a high-quality MP4 file.'
            : 'Download the high-resolution cover or follow the phone gallery guide below.'}
        </p>
      </div>

      {/* Helpful Mobile Guide Dropdown */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <button
          type="button"
          onClick={() => setShowMobileGuide(!showMobileGuide)}
          className="w-full flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#5722AF] dark:hover:text-[#9B6BE8] transition-colors py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-[#5722AF] dark:text-[#9B6BE8]" />
            <span>How to save this Reel to your phone gallery directly (No tools needed)</span>
          </span>
          {showMobileGuide ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showMobileGuide && (
          <div className="mt-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/70 text-xs space-y-2.5 text-zinc-600 dark:text-zinc-300 animate-in fade-in duration-200">
            <p className="font-semibold text-zinc-900 dark:text-white">
              Instant Phone Trick (Works on iOS & Android):
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <li>
                Click <strong>Open on Instagram</strong> above or open this Reel in the Instagram app.
              </li>
              <li>
                Tap the <strong>Share</strong> (airplane) icon on the right side of the Reel.
              </li>
              <li>
                Tap <strong>&quot;Add to story&quot;</strong> (don&apos;t worry, you don&apos;t need to publish it).
              </li>
              <li>
                Pinch with two fingers to zoom and fill your screen.
              </li>
              <li>
                Tap the <strong>••• (Three Dots)</strong> at the top-right corner and select <strong>&quot;Save&quot;</strong>.
              </li>
              <li>
                The video with audio is now saved directly in your phone photos/gallery!
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Admin / Developer API Configuration Dropdown */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdminGuide(!showAdminGuide)}
          className="w-full flex items-center justify-between text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Website Owner / Developer: Enable 100% Automated MP4 Video Streams</span>
          </span>
          {showAdminGuide ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showAdminGuide && (
          <div className="mt-2 p-3.5 rounded-xl bg-zinc-900 text-zinc-200 text-[11px] space-y-2 font-mono border border-zinc-800">
            <p className="text-zinc-400 font-sans text-xs">
              Instagram blocks unauthenticated server scrapers. To enable direct 1080p MP4 downloads on ToolNest, create a <code className="text-purple-300">.env.local</code> file in your project root with your RapidAPI key or custom endpoint:
            </p>
            <pre className="p-2.5 rounded-lg bg-black/60 text-emerald-400 overflow-x-auto text-[11px]">
{`# Option A: Free RapidAPI Instagram Downloader key
RAPIDAPI_KEY=your_rapidapi_key_here

# Option B: Or custom proxy/provider endpoint
INSTAGRAM_DOWNLOADER_API_URL=https://your-api.com/reel
INSTAGRAM_DOWNLOADER_API_KEY=your_secret_key`}
            </pre>
            <p className="text-zinc-400 font-sans text-[11px]">
              Restart the Next.js dev server after editing <code className="text-purple-300">.env.local</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

