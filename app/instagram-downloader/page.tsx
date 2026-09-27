'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import {
  Download,
  Clipboard,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Film,
  Image as ImageIcon,
  Copy,
  Check,
  ArrowRight,
  Info,
  X,
  Play,
  Clock,
  User,
  ChevronDown,
  Layers,
} from 'lucide-react';

export type SupportedPlatform = 'instagram' | 'pinterest' | 'youtube';

interface SocialMediaItem {
  id: string;
  platform: SupportedPlatform;
  type: 'video' | 'image';
  thumbnail: string;
  downloadUrl: string;
  sourceUrl: string;
  title?: string;
  creator?: string;
  duration?: string | number;
  filename: string;
  quality?: string;
}

type FetchState =
  | 'idle'
  | 'fetching'
  | 'found'
  | 'invalid_url'
  | 'unavailable'
  | 'error';

export default function SocialMediaDownloaderPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | SupportedPlatform>('all');
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [media, setMedia] = useState<SocialMediaItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Client-side quick platform detection
  const detectedPlatform = React.useMemo<SupportedPlatform | null>(() => {
    if (!url) return null;
    const lower = url.toLowerCase().trim();
    if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
    if (lower.includes('pinterest.com') || lower.includes('pin.it')) return 'pinterest';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    return null;
  }, [url]);

  // Handle Clipboard Paste
  const handlePaste = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setErrorMessage(null);
          setFetchState('idle');
        }
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  // Quick Sample Links
  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setErrorMessage(null);
    setFetchState('idle');
  };

  // Fetch Media Information from API
  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const targetUrl = url.trim();
    if (!targetUrl) {
      setFetchState('invalid_url');
      setErrorMessage('Please enter an Instagram, Pinterest, or YouTube video URL.');
      return;
    }

    setFetchState('fetching');
    setErrorMessage(null);
    setMedia(null);

    try {
      const res = await fetch('/api/social-media/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 404 || res.status === 403) {
          setFetchState('unavailable');
          setErrorMessage(
            data.error ||
              'This media content could not be retrieved. Please verify the URL is public and not private or restricted.'
          );
        } else if (res.status === 400) {
          setFetchState('invalid_url');
          setErrorMessage(data.error || 'Invalid video URL. Please check the link and try again.');
        } else if (res.status === 429) {
          setFetchState('error');
          setErrorMessage(data.error || 'Rate limit reached. Please wait a moment and try again.');
        } else {
          setFetchState('error');
          setErrorMessage(data.error || 'Failed to process media request. Please try again.');
        }
        return;
      }

      setMedia(data.media);
      setFetchState('found');
    } catch (err: any) {
      console.error('Fetch media error:', err);
      setFetchState('error');
      setErrorMessage('Network error occurred while connecting to the server.');
    }
  };

  // Trigger Attachment Download
  const handleDownload = () => {
    if (!media) return;

    setIsDownloading(true);
    const filename = media.filename || `${media.platform}_video.mp4`;

    let proxyDownloadUrl = '';
    if (media.platform === 'youtube') {
      if (media.downloadUrl?.startsWith('/api/social-media/download')) {
        proxyDownloadUrl = media.downloadUrl;
      } else {
        proxyDownloadUrl = `/api/social-media/download?platform=youtube&id=${encodeURIComponent(
          media.id || ''
        )}&filename=${encodeURIComponent(filename)}`;
      }
    } else {
      proxyDownloadUrl = `/api/social-media/download?url=${encodeURIComponent(
        media.downloadUrl
      )}&filename=${encodeURIComponent(filename)}&platform=${media.platform}`;
    }

    const link = document.createElement('a');
    link.href = proxyDownloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      setIsDownloading(false);
    }, 3000);
  };

  // Copy Direct Link to Clipboard
  const handleCopyLink = () => {
    if (!media) return;
    const directUrl =
      media.platform === 'youtube'
        ? `${window.location.origin}/api/social-media/download?platform=youtube&id=${encodeURIComponent(
            media.id || ''
          )}&filename=${encodeURIComponent(media.filename)}`
        : media.downloadUrl;

    navigator.clipboard.writeText(directUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Helper for preview URL
  const getPreviewUrl = () => {
    if (!media) return '';
    if (media.platform === 'youtube') {
      return `/api/social-media/download?platform=youtube&id=${encodeURIComponent(media.id || '')}&inline=1`;
    }
    return `/api/social-media/download?url=${encodeURIComponent(media.downloadUrl)}&inline=1&platform=${media.platform}`;
  };

  const platformMeta = {
    instagram: {
      name: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      badge: 'border-pink-300 dark:border-pink-800 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40',
      label: 'Reels & Posts',
    },
    pinterest: {
      name: 'Pinterest',
      color: 'bg-red-600 text-white',
      badge: 'border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
      label: 'Video Pins',
    },
    youtube: {
      name: 'YouTube',
      color: 'bg-red-600 text-white',
      badge: 'border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40',
      label: 'Videos & Shorts',
    },
  };

  const faqs = [
    {
      q: 'Which social media platforms can I download videos from?',
      a: 'ToolNest Social Media Video Downloader supports public videos and reels from Instagram (Reels, Posts), Pinterest (Video Pins, Idea Pins), and YouTube (Shorts, Standard HD Videos).',
    },
    {
      q: 'Can I download private Instagram posts or unlisted content?',
      a: 'No. ToolNest strictly retrieves media from publicly accessible posts without bypassing privacy settings, logins, or authentication. Only public content is supported.',
    },
    {
      q: 'What video quality and format will I get?',
      a: 'All videos are processed and exported in standard MP4 format with audio merged in 720p or 1080p Full HD resolution, ensuring compatibility across all phones, tablets, and desktop media players.',
    },
    {
      q: 'Are there any limits on downloads?',
      a: 'The service is completely free to use. Standard rate-limiting is in place to protect the infrastructure and ensure maximum speed for all users.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Social Video Downloader"
        onOpenHelp={() => {}}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="instagram-downloader"
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 text-xs font-bold ring-1 ring-[#5722AF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>All-in-One Social Video Downloader</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Social Media Video Downloader
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Download high-definition videos, reels, pins, and shorts from <span className="font-semibold text-zinc-900 dark:text-zinc-100">Instagram</span>, <span className="font-semibold text-zinc-900 dark:text-zinc-100">Pinterest</span>, and <span className="font-semibold text-zinc-900 dark:text-zinc-100">YouTube</span> in MP4 format.
          </p>

          {/* Quick Platform Selection Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-[#5722AF] text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              All Platforms
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('instagram')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('pinterest')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'pinterest'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <span className="font-serif font-black text-xs">P</span>
              <span>Pinterest</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('youtube')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'youtube'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>YouTube</span>
            </button>
          </div>
        </div>

        {/* Primary Input Card */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="video-url-input"
              className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
            >
              Paste Social Video Link
            </label>

            {/* Real-time platform auto-detector badge */}
            {detectedPlatform && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  detectedPlatform === 'instagram'
                    ? 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-800'
                    : detectedPlatform === 'pinterest'
                    ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>{detectedPlatform} Detected</span>
              </span>
            )}
          </div>

          <form onSubmit={handleFetch} className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                id="video-url-input"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (fetchState !== 'idle') setFetchState('idle');
                }}
                placeholder={
                  selectedFilter === 'instagram'
                    ? 'https://www.instagram.com/reel/XXXXXXXXXXX/'
                    : selectedFilter === 'pinterest'
                    ? 'https://in.pinterest.com/pin/795166877991930745/'
                    : selectedFilter === 'youtube'
                    ? 'https://www.youtube.com/watch?v=... or https://youtu.be/...'
                    : 'Paste Instagram Reel, Pinterest Pin, or YouTube Video link...'
                }
                className="w-full px-4 py-3.5 pr-28 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] text-sm transition-all"
                disabled={fetchState === 'fetching'}
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {url && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrl('');
                      setFetchState('idle');
                      setErrorMessage(null);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={fetchState === 'fetching'}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={fetchState === 'fetching'}
              className="px-6 py-3.5 rounded-2xl bg-[#5722AF] hover:bg-[#682BC9] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {fetchState === 'fetching' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Download Video</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sample quick test triggers */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
            <span className="font-semibold text-zinc-600 dark:text-zinc-300">Try sample:</span>
            <button
              type="button"
              onClick={() => handleSelectSample('https://www.instagram.com/reel/DKPtUL_S9Nh/')}
              className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
            >
              Instagram Reel
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample('https://in.pinterest.com/pin/795166877991930745/')}
              className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
            >
              Pinterest Video
            </button>
            <button
              type="button"
              onClick={() => handleSelectSample('https://www.youtube.com/watch?v=jNQXAC9IVRw')}
              className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
            >
              YouTube Video
            </button>
          </div>

          {/* Dynamic Status Feedback */}
          {fetchState === 'fetching' && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-[#5722AF] dark:text-purple-300">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
              <span>Fetching and analyzing media from public social sources...</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {fetchState === 'found' && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Media ready! Preview the video below and click Download MP4.</span>
            </div>
          )}
        </div>

        {/* Media Preview & Download Card */}
        {media && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    platformMeta[media.platform]?.badge || 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {platformMeta[media.platform]?.name || media.platform}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 border border-[#5722AF]/20">
                  {media.quality || 'HD MP4'}
                </span>
              </div>

              {media.creator && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {media.creator}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Responsive Video Player */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[360px] flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-inner">
                {media.type === 'video' ? (
                  <video
                    key={media.downloadUrl}
                    src={getPreviewUrl()}
                    poster={media.thumbnail}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={media.downloadUrl || media.thumbnail}
                    alt={media.title || 'Social Media Image'}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Media Details & Download Actions */}
              <div className="space-y-5">
                {media.title && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Title / Caption
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 line-clamp-3 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      {media.title}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {media.duration && (
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                      <div className="text-zinc-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Duration</span>
                      </div>
                      <div className="font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">
                        {media.duration}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                    <div className="text-zinc-400 font-medium flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      <span>Format</span>
                    </div>
                    <div className="font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">
                      MP4 (Video + Audio)
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Source Link
                  </span>
                  <a
                    href={media.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#5722AF] dark:text-purple-400 hover:underline truncate"
                  >
                    <span className="truncate">{media.sourceUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {/* Download Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 px-5 py-3.5 rounded-2xl bg-[#5722AF] hover:bg-[#682BC9] text-white font-bold text-sm shadow-md shadow-[#5722AF]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Downloading MP4...' : 'Download Video (MP4)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copy direct download link"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supported Platforms Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Film className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Instagram Downloader
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Save public Instagram Reels, standard video posts, and photos directly in crisp MP4 format.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <span className="font-serif font-black text-lg">P</span>
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Pinterest Downloader
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Extract high quality 720p/1080p video pins and idea pins with instant streaming proxy.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              YouTube Downloader
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Download YouTube Shorts and full videos with clean audio/video streams merged in MP4.
            </p>
          </div>
        </div>

        {/* How It Works (3 Steps) */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              How to Download Social Media Videos
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Save any public video in three simple, fast steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="w-8 h-8 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                1
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Copy the Link</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Open Instagram, Pinterest, or YouTube and copy the share link of the public video or reel.
              </p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="w-8 h-8 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                2
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Paste & Fetch</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Paste the URL into the input field above. Our detector will recognize the platform automatically.
              </p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="w-8 h-8 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/80 text-[#5722AF] dark:text-purple-300 font-bold flex items-center justify-center text-sm mx-auto md:mx-0">
                3
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Download MP4</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Preview your video in the browser player and click "Download Video (MP4)" to save it locally.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </h2>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 transition-transform ${
                        isOpen ? 'rotate-180 text-[#5722AF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-2.5">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 text-xs text-zinc-600 dark:text-zinc-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
            <Info className="w-4 h-4 text-[#5722AF]" />
            <span>Permitted & Public Media Retrieval Notice</span>
          </div>
          <p className="leading-relaxed">
            This tool retrieves public media available without authentication. It strictly does not bypass login walls, private account controls, CAPTCHA, or DRM protections. Please ensure you have appropriate rights or permissions before downloading or redistributing any content.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
