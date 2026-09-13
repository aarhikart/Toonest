'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Tv,
  Film,
  Settings2,
  Sliders,
  Check,
  ExternalLink,
  Copy,
  Layers,
} from 'lucide-react';
import { MovieItem } from '@/lib/movie/movieTypes';

interface NativeVideoPlayerProps {
  movie: MovieItem | null;
  onClose?: () => void;
}

// Sample clean direct streams for immediate testing
const SAMPLE_DIRECT_STREAMS: { name: string; url: string; quality: string }[] = [
  {
    name: 'Action Demo (1080p HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    quality: '1080p 60fps',
  },
  {
    name: 'Sci-Fi Trailer (1080p HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    quality: '1080p',
  },
  {
    name: 'Animation Feature (720p HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    quality: '720p',
  },
  {
    name: 'Cinema Sintel (1080p HD)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    quality: '1080p Ultra',
  },
];

export const NativeVideoPlayer: React.FC<NativeVideoPlayerProps> = ({
  movie,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [customStreamUrl, setCustomStreamUrl] = useState<string>(SAMPLE_DIRECT_STREAMS[0].url);
  const [activeStreamSource, setActiveStreamSource] = useState<string>(SAMPLE_DIRECT_STREAMS[0].url);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedPercent, setBufferedPercent] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showSourceBar, setShowSourceBar] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  // Time Updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    if (videoRef.current.buffered.length > 0 && videoRef.current.duration > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedPercent((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Skip 10s
  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
  };

  // Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  // Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Auto-hide controls during playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  };

  const formatTime = (timeInSec: number): string => {
    if (isNaN(timeInSec)) return '00:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleApplyCustomStream = () => {
    if (!customStreamUrl.trim()) return;
    setActiveStreamSource(customStreamUrl.trim());
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div
      ref={playerContainerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full max-w-6xl mx-auto rounded-2xl md:rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl select-none group"
    >
      {/* Top Bar inside Player */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-sm md:text-base font-bold text-white leading-tight">
              {movie?.title || 'Native Ad-Free Cinema Player'}
            </h3>
            <p className="text-[11px] text-zinc-300">
              ToolNest Native HTML5 Engine • Zero Third-Party Ads • Zero Popups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSourceBar(!showSourceBar)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#9B6BE8]" />
            <span>Custom Stream URL</span>
          </button>
        </div>
      </div>

      {/* Custom Stream Source Drawer (Optional) */}
      {showSourceBar && (
        <div className="absolute top-16 left-4 right-4 z-40 p-4 rounded-2xl bg-zinc-900/95 border border-zinc-700 backdrop-blur-md shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Play Direct MP4 / HLS Stream (.mp4 / .m3u8)
            </span>
            <button
              onClick={() => setShowSourceBar(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customStreamUrl}
              onChange={(e) => setCustomStreamUrl(e.target.value)}
              placeholder="Paste direct .mp4 or .m3u8 stream URL..."
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
            <button
              type="button"
              onClick={handleApplyCustomStream}
              className="px-4 py-2 rounded-xl bg-[#5722AF] hover:bg-[#481c91] text-white text-xs font-bold transition-colors"
            >
              Load Stream
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400">
            <span className="text-[11px] font-semibold">Test Streams:</span>
            {SAMPLE_DIRECT_STREAMS.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => {
                  setCustomStreamUrl(s.url);
                  setActiveStreamSource(s.url);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                  activeStreamSource === s.url
                    ? 'bg-[#5722AF]/30 text-[#9B6BE8] border-[#5722AF]'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video Element */}
      <div
        className="relative w-full aspect-video bg-black flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={activeStreamSource}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          playsInline
        />

        {/* Center Play Button when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs">
            <div className="w-20 h-20 rounded-full bg-[#5722AF]/90 border border-[#9B6BE8] flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 p-3 md:p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar */}
        <div className="relative w-full flex items-center group/scrubber cursor-pointer">
          {/* Buffered Track */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-zinc-700"
            style={{ width: `${bufferedPercent}%` }}
          />

          {/* Active Scrubber Input */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#9B6BE8] focus:outline-none"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3 text-white text-xs pt-1">
          {/* Left: Play, Skip, Time, Volume */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={() => skipTime(-10)}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => skipTime(10)}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Time display */}
            <span className="font-mono text-xs text-zinc-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-[#9B6BE8]"
              />
            </div>
          </div>

          {/* Right: Speed, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-zinc-900 border border-zinc-700 rounded-xl p-1 shadow-2xl flex flex-col gap-1 min-w-[70px] z-50">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-1 rounded-lg text-xs font-mono text-left transition-colors ${
                        playbackSpeed === spd ? 'bg-[#5722AF] text-white font-bold' : 'text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
