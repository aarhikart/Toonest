'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Camera,
  Maximize2,
  Sparkles,
  Smartphone,
  Radio,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { FaceDemoEngine, FaceAnalysisMetrics } from '@/lib/camera/face-demo';

interface LiveViewerProps {
  stream: MediaStream | null;
  connectionState: 'waiting' | 'connected' | 'streaming' | 'disconnected' | 'expired';
  onTakePhoto: (dataUrl: string) => void;
  isPhoneCameraActive: boolean;
  isPhoneMicActive: boolean;
  onRefreshRoom?: () => void;
}

export const LiveViewer: React.FC<LiveViewerProps> = ({
  stream,
  connectionState,
  onTakePhoto,
  isPhoneCameraActive,
  isPhoneMicActive,
  onRefreshRoom
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showFaceDemo, setShowFaceDemo] = useState(true);
  const [faceMetrics, setFaceMetrics] = useState<FaceAnalysisMetrics | null>(null);

  // Attach WebRTC stream to video element
  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.warn('[LiveViewer] Auto-play was prevented by browser policy:', err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Volume & Mute control
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // Face Detection animation loop
  useEffect(() => {
    if (!showFaceDemo || connectionState !== 'streaming') {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setFaceMetrics(null);
      return;
    }

    let animationFrameId: number;
    const render = () => {
      if (canvasRef.current && videoRef.current) {
        const metrics = FaceDemoEngine.drawOverlay(canvasRef.current, videoRef.current, {
          showLandmarks: true,
          boxColor: '#A855F7'
        });
        if (metrics) setFaceMetrics(metrics);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [showFaceDemo, connectionState]);

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = video.videoWidth;
    snapCanvas.height = video.videoHeight;
    const ctx = snapCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
    const dataUrl = snapCanvas.toDataURL('image/png');
    onTakePhoto(dataUrl);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-black rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative group"
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-xs">
        <div className="flex items-center gap-2">
          {connectionState === 'streaming' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold text-[11px] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE CAMERA</span>
            </div>
          ) : connectionState === 'connected' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-semibold text-[11px] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>PHONE READY</span>
            </div>
          ) : connectionState === 'disconnected' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-semibold text-[11px] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>PHONE DISCONNECTED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-400 font-semibold text-[11px] backdrop-blur-md">
              <Radio className="w-3 h-3 text-zinc-400 animate-pulse" />
              <span>WAITING FOR PHONE</span>
            </div>
          )}

          {connectionState === 'streaming' && (
            <span className="text-[11px] text-zinc-300 hidden sm:inline-flex items-center gap-1">
              • Mic: {isPhoneMicActive ? '● ON' : '○ MUTED'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Face Demo */}
          <button
            type="button"
            onClick={() => setShowFaceDemo(!showFaceDemo)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
              showFaceDemo
                ? 'bg-purple-600/80 text-white'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
            }`}
            title="Toggle Face Analysis Demo Overlay"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Face Demo</span>
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Screen with Canvas Overlay */}
      <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
        {connectionState === 'streaming' && stream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            {/* Face Detection Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none object-contain"
            />
          </>
        ) : (
          <div className="p-8 text-center max-w-md space-y-4 text-zinc-400">
            {connectionState === 'waiting' && (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#5722AF]">
                  <Smartphone className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-200">Waiting for Phone Connection...</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Scan the QR code with your phone or open the link to grant camera & microphone permission.
                  </p>
                </div>
              </div>
            )}

            {connectionState === 'connected' && (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-400">
                  <CheckCircle2 className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-200">Phone Detected!</h4>
                  <p className="text-xs text-purple-300/80 mt-1">
                    Waiting for user to click &ldquo;Allow Camera & Microphone&rdquo; on their phone screen...
                  </p>
                </div>
              </div>
            )}

            {connectionState === 'disconnected' && (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-rose-300">Phone Disconnected</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    The phone camera page was closed or the connection was lost.
                  </p>
                  {onRefreshRoom && (
                    <button
                      type="button"
                      onClick={onRefreshRoom}
                      className="mt-3 px-4 py-2 rounded-xl bg-[#5722AF] text-white font-bold text-xs hover:bg-[#491c96] transition flex items-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Generate New URL</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {connectionState === 'expired' && (
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-300">Session Expired</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    This camera session reached its time limit.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-3 sm:p-4 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between gap-3 text-xs text-zinc-300">
        {/* Audio controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={e => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (v > 0 && isMuted) setIsMuted(false);
            }}
            className="w-20 sm:w-28 accent-[#5722AF] h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
            title="Volume Slider"
          />
        </div>

        {/* Snapshot / Take Photo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCaptureSnapshot}
            disabled={connectionState !== 'streaming'}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
