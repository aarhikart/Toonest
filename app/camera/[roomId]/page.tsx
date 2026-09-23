'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { PhonePermissionCard } from '@/components/camera/PhonePermissionCard';
import { PhoneCameraStreamer } from '@/components/camera/PhoneCameraStreamer';
import { PhotoCaptureModal } from '@/components/camera/PhotoCaptureModal';
import { getIceServers } from '@/lib/camera/webrtc';
import { Camera, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

export default function PhoneCameraPage() {
  const params = useParams();
  const roomId = typeof params?.roomId === 'string' ? params.roomId.toUpperCase().trim() : '';

  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [requiresPin, setRequiresPin] = useState(false);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isAudioAllowed, setIsAudioAllowed] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const lastSignalIdRef = useRef<number>(0);

  // 1. Fetch Room status and check existence / expiration
  useEffect(() => {
    if (!roomId) {
      setRoomError('Invalid room identifier.');
      setIsLoadingRoom(false);
      return;
    }

    const checkRoom = async () => {
      try {
        const res = await fetch(`/api/camera/rooms/${roomId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setRoomError(data.error || 'This camera session does not exist or has expired.');
          return;
        }

        if (data.status === 'expired') {
          setRoomError('This camera session has expired. Please generate a new URL on your laptop.');
          return;
        }

        setRequiresPin(Boolean(data.requiresPin));
      } catch (err: any) {
        setRoomError(err.message || 'Failed to verify session.');
      } finally {
        setIsLoadingRoom(false);
      }
    };

    checkRoom();
  }, [roomId]);

  // Clean termination of all media tracks & WebRTC connection
  const stopAllMedia = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
  };

  // 2. Lifecycle cleanup: Stop camera immediately on tab closure or navigation
  useEffect(() => {
    const handleUnload = () => {
      // Notify desktop that phone disconnected
      if (roomId) {
        navigator.sendBeacon(
          `/api/camera/rooms/${roomId}/signal`,
          JSON.stringify({
            from: 'phone',
            to: 'desktop',
            type: 'peer:disconnect',
            payload: { reason: 'Tab closed' }
          })
        );
      }
      stopAllMedia();
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      handleUnload();
    };
  }, [roomId, mediaStream]);

  // Request to join room (verifying PIN if required)
  const handleRequestJoin = async (pin?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/camera/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peerType: 'phone', pin })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to authenticate PIN.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error.' };
    }
  };

  // WebRTC Setup on Phone once camera and mic permissions are explicitly granted
  const setupWebRTC = (stream: MediaStream) => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: getIceServers(),
      iceCandidatePoolSize: 2
    });

    // Add local tracks (camera and microphone) to peer connection
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Send local ICE candidates to desktop
    pc.onicecandidate = event => {
      if (event.candidate) {
        fetch(`/api/camera/rooms/${roomId}/signal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'phone',
            to: 'desktop',
            type: 'webrtc:ice-candidate',
            payload: event.candidate.toJSON()
          })
        }).catch(() => {});
      }
    };

    pcRef.current = pc;

    // Start signaling message poll loop
    startSignalingLoop(pc, stream);
  };

  // Signaling message handling for phone
  const startSignalingLoop = (pc: RTCPeerConnection, currentStream: MediaStream) => {
    isPollingRef.current = true;
    lastSignalIdRef.current = 0;

    // First send peer:ready signal to desktop
    fetch(`/api/camera/rooms/${roomId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'phone',
        to: 'desktop',
        type: 'peer:ready',
        payload: {
          hasVideo: currentStream.getVideoTracks().length > 0,
          hasAudio: currentStream.getAudioTracks().length > 0
        }
      })
    }).catch(() => {});

    // Also send initial camera and mic state
    fetch(`/api/camera/rooms/${roomId}/signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'phone',
        to: 'desktop',
        type: 'camera:state',
        payload: {
          camera: currentStream.getVideoTracks().some(t => t.enabled),
          mic: currentStream.getAudioTracks().some(t => t.enabled)
        }
      })
    }).catch(() => {});

    const poll = async () => {
      while (isPollingRef.current) {
        try {
          const res = await fetch(
            `/api/camera/rooms/${roomId}/signal?for=phone&afterId=${lastSignalIdRef.current}&wait=true`
          );

          if (res.status === 404) {
            setIsDisconnected(true);
            stopAllMedia();
            break;
          }

          if (res.ok) {
            const data = await res.json();
            if (data.roomStatus === 'expired') {
              setIsDisconnected(true);
              stopAllMedia();
              break;
            }

            if (data.signals && data.signals.length > 0) {
              for (const sig of data.signals) {
                if (sig.id > lastSignalIdRef.current) {
                  lastSignalIdRef.current = sig.id;

                  if (sig.type === 'webrtc:offer') {
                    // Desktop sent SDP Offer: create SDP Answer
                    await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    await fetch(`/api/camera/rooms/${roomId}/signal`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        from: 'phone',
                        to: 'desktop',
                        type: 'webrtc:answer',
                        payload: { sdp: answer.sdp, type: answer.type }
                      })
                    });
                  } else if (sig.type === 'webrtc:ice-candidate') {
                    if (sig.payload) {
                      await pc.addIceCandidate(new RTCIceCandidate(sig.payload));
                    }
                  } else if (sig.type === 'peer:disconnect') {
                    setIsDisconnected(true);
                    stopAllMedia();
                    break;
                  }
                }
              }
            }
          }
        } catch {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    };

    poll();
  };

  const handlePermissionGranted = (stream: MediaStream, audioAllowed: boolean) => {
    setMediaStream(stream);
    setIsAudioAllowed(audioAllowed);
    setupWebRTC(stream);
  };

  const handleSwitchCameraStream = (newStream: MediaStream) => {
    setMediaStream(newStream);
    const pc = pcRef.current;
    if (pc) {
      // Replace video track in peer connection
      const newVideoTrack = newStream.getVideoTracks()[0];
      const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender && newVideoTrack) {
        sender.replaceTrack(newVideoTrack).catch(e => console.warn('Replace track error:', e));
      }
    }
  };

  const handleMediaStateChange = (state: { camera: boolean; mic: boolean }) => {
    if (roomId) {
      fetch(`/api/camera/rooms/${roomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'phone',
          to: 'desktop',
          type: 'camera:state',
          payload: state
        })
      }).catch(() => {});
    }
  };

  const handleDisconnect = () => {
    setIsDisconnected(true);
    if (roomId) {
      fetch(`/api/camera/rooms/${roomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'phone',
          to: 'desktop',
          type: 'peer:disconnect',
          payload: { reason: 'User clicked stop' }
        })
      }).catch(() => {});
    }
    stopAllMedia();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Top Mobile Brand */}
      <header className="flex items-center justify-between py-2 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#5722AF] text-white flex items-center justify-center font-black text-sm">
            TN
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-none">
              Camera Connect
            </h1>
            <span className="text-[10px] text-zinc-500 font-medium">Consent-Based WebRTC</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Encrypted P2P</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="my-auto py-6">
        {isLoadingRoom ? (
          <div className="p-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#5722AF] animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Connecting to secure session...</p>
          </div>
        ) : roomError ? (
          <div className="max-w-md mx-auto p-6 bg-zinc-900 rounded-3xl border border-zinc-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-300">Session Expired or Unavailable</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{roomError}</p>
            </div>
          </div>
        ) : isDisconnected ? (
          <div className="max-w-md mx-auto p-6 bg-zinc-900 rounded-3xl border border-zinc-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800 text-purple-300 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Camera Connection Closed</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                All camera and microphone tracks have been terminated. You can safely close this browser tab.
              </p>
            </div>
          </div>
        ) : !mediaStream ? (
          <PhonePermissionCard
            roomId={roomId}
            requiresPin={requiresPin}
            onPermissionGranted={handlePermissionGranted}
            onRequestJoin={handleRequestJoin}
          />
        ) : (
          <PhoneCameraStreamer
            roomId={roomId}
            stream={mediaStream}
            isInitialAudioAllowed={isAudioAllowed}
            onDisconnect={handleDisconnect}
            onSwitchCamera={handleSwitchCameraStream}
            onMediaStateChange={handleMediaStateChange}
            onCapturePhoto={dataUrl => setCapturedPhoto(dataUrl)}
          />
        )}
      </main>

      {/* Snapshot Preview Modal */}
      {capturedPhoto && (
        <PhotoCaptureModal
          dataUrl={capturedPhoto}
          onClose={() => setCapturedPhoto(null)}
          onRetake={() => setCapturedPhoto(null)}
        />
      )}

      {/* Footer Notice */}
      <footer className="py-3 text-center text-[10px] text-zinc-500 border-t border-zinc-800/80">
        ToolNest Camera Connect Demo • Live media is never recorded or stored.
      </footer>
    </div>
  );
}
