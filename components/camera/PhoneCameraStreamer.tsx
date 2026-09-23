'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  RefreshCw,
  LogOut,
  Sparkles,
  Shield,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface PhoneCameraStreamerProps {
  roomId: string;
  stream: MediaStream;
  isInitialAudioAllowed: boolean;
  onDisconnect: () => void;
  onSwitchCamera: (newStream: MediaStream) => void;
  onMediaStateChange: (state: { camera: boolean; mic: boolean }) => void;
  onCapturePhoto: (dataUrl: string) => void;
}

export const PhoneCameraStreamer: React.FC<PhoneCameraStreamerProps> = ({
  roomId,
  stream,
  isInitialAudioAllowed,
  onDisconnect,
  onSwitchCamera,
  onMediaStateChange,
  onCapturePhoto
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(isInitialAudioAllowed);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  // Attach local stream to video preview immediately
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play().catch(e => console.warn('Preview play warning:', e));
    }
  }, [stream]);

  // Toggle Camera video track
  const toggleCamera = () => {
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextState = !isCameraOn;
      videoTracks.forEach(t => (t.enabled = nextState));
      setIsCameraOn(nextState);
      onMediaStateChange({ camera: nextState, mic: isMicOn });
    }
  };

  // Toggle Microphone audio track
  const toggleMic = () => {
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      const nextState = !isMicOn;
      audioTracks.forEach(t => (t.enabled = nextState));
      setIsMicOn(nextState);
      onMediaStateChange({ camera: isCameraOn, mic: nextState });
    }
  };

  // Switch between front (user) and rear (environment) camera
  const handleSwitchCamera = async () => {
    setIsSwitchingCamera(true);
    const nextMode = facingMode === 'user' ? 'environment' : 'user';

    try {
      // Stop old video track
      stream.getVideoTracks().forEach(t => t.stop());

      // Request new camera with opposite facingMode
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: nextMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: stream.getAudioTracks().length > 0
      });

      setFacingMode(nextMode);
      setIsCameraOn(true);
      onSwitchCamera(newStream);
    } catch (err) {
      // Fallback without exact constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: nextMode },
          audio: stream.getAudioTracks().length > 0
        });
        setFacingMode(nextMode);
        setIsCameraOn(true);
        onSwitchCamera(fallbackStream);
      } catch (fallbackErr) {
        console.warn('[PhoneCameraStreamer] Switch camera error:', fallbackErr);
      }
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  const handleTakePhoto = () => {
    if (!localVideoRef.current) return;
    const video = localVideoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    onCapturePhoto(dataUrl);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-4">
      {/* Top Mobile Status Header */}
      <div className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            Live Camera Streaming
          </span>
        </div>

        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300">
          Room: {roomId}
        </span>
      </div>

      {/* Main Video Viewport with Guide Area */}
      <div className="relative aspect-[3/4] sm:aspect-square w-full rounded-3xl overflow-hidden bg-black border-2 border-purple-500/40 shadow-2xl flex items-center justify-center">
        {/* Actual Live Video Preview */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Semi-transparent Face Guide Outline */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
          <div className="w-48 h-60 sm:w-56 sm:h-72 rounded-[40px] border-2 border-dashed border-white/60 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex flex-col items-center justify-between p-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
              Face Area
            </span>
            <span className="text-[9px] font-semibold text-white/70 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
              Position inside frame
            </span>
          </div>
        </div>

        {/* Live Status Indicators on Video */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[11px]">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isCameraOn ? 'CAM ON' : 'CAM OFF'}</span>
          </div>

          <div
            className={`px-2.5 py-1 rounded-full backdrop-blur-md font-bold border flex items-center gap-1.5 ${
              isMicOn
                ? 'bg-black/60 text-emerald-400 border-emerald-500/30'
                : 'bg-black/60 text-rose-400 border-rose-500/30'
            }`}
          >
            {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
            <span>{isMicOn ? 'MIC ON' : 'MIC MUTED'}</span>
          </div>
        </div>
      </div>

      {/* Control Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {/* Switch Front/Rear */}
        <button
          type="button"
          onClick={handleSwitchCamera}
          disabled={isSwitchingCamera}
          className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer active:scale-95 disabled:opacity-50"
          title="Switch between front and rear camera"
        >
          <RefreshCw className={`w-4 h-4 text-[#5722AF] ${isSwitchingCamera ? 'animate-spin' : ''}`} />
          <span className="text-[10px]">Flip</span>
        </button>

        {/* Toggle Video */}
        <button
          type="button"
          onClick={toggleCamera}
          className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
            isCameraOn
              ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-600'
          }`}
          title={isCameraOn ? 'Pause camera stream' : 'Resume camera stream'}
        >
          {isCameraOn ? <Video className="w-4 h-4 text-emerald-500" /> : <VideoOff className="w-4 h-4 text-rose-500" />}
          <span className="text-[10px]">{isCameraOn ? 'Cam' : 'Paused'}</span>
        </button>

        {/* Toggle Audio */}
        <button
          type="button"
          onClick={toggleMic}
          className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
            isMicOn
              ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-600'
          }`}
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isMicOn ? <Mic className="w-4 h-4 text-emerald-500" /> : <MicOff className="w-4 h-4 text-rose-500" />}
          <span className="text-[10px]">{isMicOn ? 'Mic' : 'Muted'}</span>
        </button>

        {/* Disconnect */}
        <button
          type="button"
          onClick={onDisconnect}
          className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95"
          title="Disconnect and close stream"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-[10px]">Stop</span>
        </button>
      </div>

      {/* Snapshot Button */}
      <button
        type="button"
        onClick={handleTakePhoto}
        className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-purple-500/20 active:scale-[0.99] cursor-pointer"
      >
        <Camera className="w-4 h-4" />
        <span>Capture Photo Snapshot</span>
      </button>

      {/* Verified Status Banner */}
      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 space-y-1 text-center">
        <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Active Peer Connection</span>
        </div>
        <p>Live stream is transmitted only while this tab is open. Closing this tab stops camera access immediately.</p>
      </div>
    </div>
  );
};
