'use client';

import React from 'react';
import { Activity, Radio, Video, Mic, Shield, Wifi, Clock, Server } from 'lucide-react';
import { PeerConnectionStats } from '@/lib/camera/webrtc';

interface ConnectionDashboardProps {
  roomId: string;
  createdAt: number;
  expiresAt: number;
  connectionState: 'waiting' | 'connected' | 'streaming' | 'disconnected' | 'expired';
  isPhoneCameraActive: boolean;
  isPhoneMicActive: boolean;
  webrtcStats: PeerConnectionStats | null;
}

export const ConnectionDashboard: React.FC<ConnectionDashboardProps> = ({
  roomId,
  createdAt,
  expiresAt,
  connectionState,
  isPhoneCameraActive,
  isPhoneMicActive,
  webrtcStats
}) => {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCandidateLabel = () => {
    if (!webrtcStats) return 'Negotiating...';
    if (webrtcStats.candidateType === 'direct') return 'Direct P2P (STUN)';
    if (webrtcStats.candidateType === 'relay') return 'Relay (TURN)';
    return 'Direct / STUN';
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#5722AF]" />
          <span>Connection Details</span>
        </h4>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          Room: {roomId}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Created / Expires */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#5722AF]" /> Session Window
          </span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {formatTime(createdAt)} → {formatTime(expiresAt)}
          </span>
        </div>

        {/* Phone Device Status */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5 flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#5722AF]" /> Phone Device
          </span>
          <span
            className={`font-bold flex items-center gap-1.5 ${
              connectionState === 'streaming' || connectionState === 'connected'
                ? 'text-emerald-600 dark:text-emerald-400'
                : connectionState === 'disconnected'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-zinc-500'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connectionState === 'streaming'
                  ? 'bg-emerald-500'
                  : connectionState === 'connected'
                  ? 'bg-purple-500 animate-pulse'
                  : connectionState === 'disconnected'
                  ? 'bg-rose-500'
                  : 'bg-zinc-400'
              }`}
            />
            {connectionState === 'streaming'
              ? 'Connected'
              : connectionState === 'connected'
              ? 'Joining...'
              : connectionState === 'disconnected'
              ? 'Disconnected'
              : 'Waiting...'}
          </span>
        </div>

        {/* Camera Status */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5 flex items-center gap-1">
            <Video className="w-3 h-3 text-[#5722AF]" /> Camera Stream
          </span>
          <span
            className={`font-bold ${
              isPhoneCameraActive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-500'
            }`}
          >
            {isPhoneCameraActive ? '● Streaming' : '○ Standby'}
          </span>
        </div>

        {/* Microphone Status */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60">
          <span className="text-[10px] text-zinc-400 font-semibold block mb-0.5 flex items-center gap-1">
            <Mic className="w-3 h-3 text-[#5722AF]" /> Microphone
          </span>
          <span
            className={`font-bold ${
              isPhoneMicActive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-zinc-500'
            }`}
          >
            {isPhoneMicActive ? '● Transmitting' : '○ Muted'}
          </span>
        </div>
      </div>

      {/* Network & WebRTC Route */}
      <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs text-purple-900 dark:text-purple-200">
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-[#5722AF]" />
          <span>WebRTC Transport: <strong>{webrtcStats?.iceConnectionState || 'idle'}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-[#5722AF]" />
          <span>Route: <strong>{getCandidateLabel()}</strong></span>
        </div>
      </div>
    </div>
  );
};
