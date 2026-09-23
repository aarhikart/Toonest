'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { RoomGenerator } from '@/components/camera/RoomGenerator';
import { QRCodeCard } from '@/components/camera/QRCodeCard';
import { LiveViewer } from '@/components/camera/LiveViewer';
import { ConnectionDashboard } from '@/components/camera/ConnectionDashboard';
import { WebRTCStatsPanel } from '@/components/camera/WebRTCStatsPanel';
import { FaceDemoOverlay } from '@/components/camera/FaceDemoOverlay';
import { PhotoCaptureModal } from '@/components/camera/PhotoCaptureModal';
import { getIceServers, extractPeerStats, PeerConnectionStats } from '@/lib/camera/webrtc';
import { FaceAnalysisMetrics } from '@/lib/camera/face-demo';
import { Camera, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface ActiveRoom {
  roomId: string;
  pin: string | null;
  createdAt: number;
  expiresAt: number;
  durationMinutes: number;
}

export default function CameraConnectPage() {
  const [room, setRoom] = useState<ActiveRoom | null>(null);
  const [connectionState, setConnectionState] = useState<'waiting' | 'connected' | 'streaming' | 'disconnected' | 'expired'>('waiting');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isPhoneCameraActive, setIsPhoneCameraActive] = useState<boolean>(false);
  const [isPhoneMicActive, setIsPhoneMicActive] = useState<boolean>(false);
  const [webrtcStats, setWebrtcStats] = useState<PeerConnectionStats | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [faceMetrics, setFaceMetrics] = useState<FaceAnalysisMetrics | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const lastSignalIdRef = useRef<number>(0);

  // Initialize WebRTC Peer Connection for Desktop Viewer
  const initPeerConnection = (roomId: string) => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: getIceServers(),
      iceCandidatePoolSize: 2
    });

    // In desktop receiver mode, expect incoming video and audio tracks
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    pc.onicecandidate = event => {
      if (event.candidate) {
        fetch(`/api/camera/rooms/${roomId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'desktop',
            type: 'webrtc:ice-candidate',
            payload: event.candidate.toJSON()
          })
        }).catch(err => console.warn('Candidate post warning:', err));
      }
    };

    pc.ontrack = event => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setConnectionState('streaming');
        setIsPhoneCameraActive(true);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnectionState('disconnected');
        setIsPhoneCameraActive(false);
        setIsPhoneMicActive(false);
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // Create WebRTC SDP Offer when phone is ready
  const handlePhoneReady = async (roomId: string) => {
    setConnectionState('connected');
    const pc = pcRef.current || initPeerConnection(roomId);

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      await fetch(`/api/camera/rooms/${roomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'desktop',
          type: 'webrtc:offer',
          payload: { sdp: offer.sdp, type: offer.type }
        })
      });
    } catch (err) {
      console.error('[WebRTC Offer Error]:', err);
    }
  };

  // Handle incoming signaling messages from phone
  const processSignal = async (signal: any, roomId: string) => {
    const pc = pcRef.current;
    if (!pc) return;

    if (signal.type === 'peer:ready') {
      await handlePhoneReady(roomId);
    } else if (signal.type === 'webrtc:answer') {
      try {
        if (pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
        }
      } catch (e) {
        console.warn('Set remote answer error:', e);
      }
    } else if (signal.type === 'webrtc:ice-candidate') {
      try {
        if (signal.payload) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
        }
      } catch (e) {
        console.warn('Add ice candidate error:', e);
      }
    } else if (signal.type === 'camera:state') {
      if (typeof signal.payload?.camera === 'boolean') {
        setIsPhoneCameraActive(signal.payload.camera);
      }
      if (typeof signal.payload?.mic === 'boolean') {
        setIsPhoneMicActive(signal.payload.mic);
      }
    } else if (signal.type === 'peer:disconnect') {
      setConnectionState('disconnected');
      setIsPhoneCameraActive(false);
      setIsPhoneMicActive(false);
      setRemoteStream(null);
    }
  };

  // Polling loop for desktop signaling
  useEffect(() => {
    if (!room) return;

    const roomId = room.roomId;
    initPeerConnection(roomId);
    isPollingRef.current = true;
    lastSignalIdRef.current = 0;

    const pollSignals = async () => {
      while (isPollingRef.current) {
        try {
          const res = await fetch(
            `/api/camera/rooms/${roomId}/signal?for=desktop&afterId=${lastSignalIdRef.current}&wait=true`
          );

          if (res.status === 404) {
            setConnectionState('expired');
            break;
          }

          if (res.ok) {
            const data = await res.json();
            if (data.roomStatus === 'expired') {
              setConnectionState('expired');
              break;
            }

            if (data.signals && data.signals.length > 0) {
              for (const sig of data.signals) {
                if (sig.id > lastSignalIdRef.current) {
                  lastSignalIdRef.current = sig.id;
                  await processSignal(sig, roomId);
                }
              }
            }
          }
        } catch {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    };

    pollSignals();

    // WebRTC Stats extraction interval
    const statsInterval = setInterval(async () => {
      if (pcRef.current && connectionState === 'streaming') {
        const stats = await extractPeerStats(pcRef.current);
        setWebrtcStats(stats);
      }
    }, 2000);

    return () => {
      isPollingRef.current = false;
      clearInterval(statsInterval);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [room]);

  const handleRoomGenerated = (roomData: ActiveRoom) => {
    setRoom(roomData);
    setConnectionState('waiting');
    setRemoteStream(null);
    setIsPhoneCameraActive(false);
    setIsPhoneMicActive(false);
    setWebrtcStats(null);
  };

  const handleResetRoom = () => {
    if (room) {
      fetch(`/api/camera/rooms/${room.roomId}/expire`, { method: 'POST' }).catch(() => {});
    }
    setRoom(null);
    setConnectionState('waiting');
    setRemoteStream(null);
    setIsPhoneCameraActive(false);
    setIsPhoneMicActive(false);
    setWebrtcStats(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Camera Connect Demo"
        onOpenHelp={() => {}}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="camera-connect"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Title & Privacy Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5722AF]/10 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 text-xs font-bold ring-1 ring-[#5722AF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WebRTC Camera & Microphone Demo</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Camera Connect Demo
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Secure, consent-based peer-to-peer live streaming between your mobile phone and laptop.
            No SaaS, no third-party video storage, and strictly permission-driven.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Consent-Only • Direct WebRTC P2P • Auto-Expiring Session</span>
          </div>
        </div>

        {/* View Controller: Generator vs Active Session */}
        {!room ? (
          <div className="pt-4">
            <RoomGenerator onRoomGenerated={handleRoomGenerated} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: QR Code & Connection Details */}
              <div className="lg:col-span-5 space-y-6">
                <QRCodeCard
                  roomId={room.roomId}
                  pin={room.pin}
                  expiresAt={room.expiresAt}
                  onGenerateNew={handleResetRoom}
                  phoneConnected={connectionState === 'streaming' || connectionState === 'connected'}
                />

                <ConnectionDashboard
                  roomId={room.roomId}
                  createdAt={room.createdAt}
                  expiresAt={room.expiresAt}
                  connectionState={connectionState}
                  isPhoneCameraActive={isPhoneCameraActive}
                  isPhoneMicActive={isPhoneMicActive}
                  webrtcStats={webrtcStats}
                />
              </div>

              {/* Right Column: Live WebRTC Video Viewer & Analysis */}
              <div className="lg:col-span-7 space-y-6">
                <LiveViewer
                  stream={remoteStream}
                  connectionState={connectionState}
                  onTakePhoto={dataUrl => setCapturedPhoto(dataUrl)}
                  isPhoneCameraActive={isPhoneCameraActive}
                  isPhoneMicActive={isPhoneMicActive}
                  onRefreshRoom={handleResetRoom}
                />

                <WebRTCStatsPanel stats={webrtcStats} />

                <FaceDemoOverlay
                  metrics={faceMetrics}
                  isActive={connectionState === 'streaming'}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Snapshot Modal */}
      {capturedPhoto && (
        <PhotoCaptureModal
          dataUrl={capturedPhoto}
          onClose={() => setCapturedPhoto(null)}
          onRetake={() => setCapturedPhoto(null)}
        />
      )}

      <Footer />
    </div>
  );
}
