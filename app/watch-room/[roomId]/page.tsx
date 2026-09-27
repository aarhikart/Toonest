'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  Tv,
  Film,
  Users,
  Copy,
  Check,
  Share2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Square,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Info,
  LogOut,
  MonitorUp,
  User,
  Crown,
  Radio,
  ExternalLink,
} from 'lucide-react';
import {
  SerializedWatchRoom,
  StreamingPlatform,
  WatchPeer,
  WatchSignalMessage,
} from '@/lib/watch-room/types';
import { getWatchIceServers } from '@/lib/watch-room/webrtc';

export default function WatchRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIsHost = searchParams.get('isHost') === '1';

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Room & Peer State
  const [room, setRoom] = useState<SerializedWatchRoom | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  const [myPeerId, setMyPeerId] = useState<string>('');
  const [myDisplayName, setMyDisplayName] = useState<string>('');
  const [isHost, setIsHost] = useState(initialIsHost);
  const [isJoined, setIsJoined] = useState(false);
  const [joinModalName, setJoinModalName] = useState('');

  // Media & WebRTC State
  const [isSharing, setIsSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [webrtcStatus, setWebrtcStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'error'
  >('idle');
  const [shareError, setShareError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const theaterContainerRef = useRef<HTMLDivElement | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const participantPeerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const lastSignalIdRef = useRef<number>(0);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const candidateQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());

  // 1. Initial Room Fetch & Identity Setup
  useEffect(() => {
    let mounted = true;

    async function initRoom() {
      try {
        const querySearch = typeof window !== 'undefined' ? window.location.search : '';
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(querySearch) : new URLSearchParams();
        const queryHost = urlParams.get('host') || undefined;
        const queryPlatform = (urlParams.get('platform') as StreamingPlatform) || undefined;
        const queryTitle = urlParams.get('title') || undefined;
        const queryIsHost = urlParams.get('isHost') === '1' || initialIsHost;

        let res = await fetch(`/api/watch-room/${roomId}${querySearch}`);
        let data = await res.json().catch(() => ({}));

        // Self-healing fallback: If initial fetch failed, auto-create/restore room on demand
        if (!res.ok || !data.success || !data.room) {
          const savedHostName = typeof window !== 'undefined' ? localStorage.getItem(`watch_name_${roomId}`) : null;
          const hostNameToUse = queryHost || savedHostName || 'Host';
          const createRes = await fetch('/api/watch-room/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomId,
              hostName: hostNameToUse,
              platform: queryPlatform || 'netflix',
              title: queryTitle || undefined,
            }),
          });
          const createData = await createRes.json().catch(() => ({}));
          if (createRes.ok && createData.success && createData.room) {
            data = createData;
            res = createRes;
          }
        }

        if (!mounted) return;

        if (!data.success || !data.room) {
          setRoomError(data.error || 'This Watch Room does not exist or has expired.');
          setIsLoadingRoom(false);
          return;
        }

        const roomData: SerializedWatchRoom = data.room;
        setRoom(roomData);

        // Check local storage for existing credentials
        const savedPeerId = localStorage.getItem(`watch_peer_${roomId}`);
        const savedName = localStorage.getItem(`watch_name_${roomId}`);
        const savedIsHost = localStorage.getItem(`watch_host_${roomId}`) === '1';

        const isUserHost =
          queryIsHost ||
          savedIsHost ||
          (savedPeerId && roomData.hostPeerId === savedPeerId) ||
          !roomData.hostPeerId;

        setIsHost(isUserHost);

        if (isUserHost) {
          localStorage.setItem(`watch_host_${roomId}`, '1');
          const pId = savedPeerId || roomData.hostPeerId || `host_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const nameToUse = savedName || queryHost || roomData.hostName || 'Host';
          localStorage.setItem(`watch_peer_${roomId}`, pId);
          localStorage.setItem(`watch_name_${roomId}`, nameToUse);
          setMyPeerId(pId);
          setMyDisplayName(nameToUse);
          await joinRoomInternal(pId, nameToUse, true);
        } else if (savedPeerId) {
          setMyPeerId(savedPeerId);
          const nameToUse = savedName || 'Guest';
          setMyDisplayName(nameToUse);
          await joinRoomInternal(savedPeerId, nameToUse, false);
        } else {
          // Participant joining via direct link -> show Join Modal
          if (savedName) setJoinModalName(savedName);
        }

        setIsLoadingRoom(false);
      } catch (err: any) {
        if (!mounted) return;
        setRoomError('Network error connecting to watch room.');
        setIsLoadingRoom(false);
      }
    }

    initRoom();

    return () => {
      mounted = false;
      cleanupWebRTC();
    };
  }, [roomId, initialIsHost]);

  // Join Room API Call
  const joinRoomInternal = async (pId: string, name: string, hostFlag: boolean) => {
    try {
      const res = await fetch(`/api/watch-room/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peerId: pId,
          displayName: name,
          isHost: hostFlag,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsJoined(true);
        if (data.room) setRoom(data.room);
      }
    } catch (err) {
      console.error('Failed to join room API:', err);
    }
  };

  const handleJoinModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = joinModalName.trim() || 'Friend';
    const newPeerId = `peer_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    localStorage.setItem(`watch_peer_${roomId}`, newPeerId);
    localStorage.setItem(`watch_name_${roomId}`, name);

    setMyPeerId(newPeerId);
    setMyDisplayName(name);
    setIsHost(false);

    await joinRoomInternal(newPeerId, name, false);
  };

  // 2. Signaling Polling Loop
  useEffect(() => {
    if (!isJoined || !myPeerId) return;

    let active = true;

    const pollSignals = async () => {
      try {
        const res = await fetch(
          `/api/watch-room/${roomId}/signal?peerId=${myPeerId}&afterId=${lastSignalIdRef.current}`
        );
        const data = await res.json();

        if (!active || !res.ok || !data.success) return;

        if (data.room) {
          setRoom(data.room);
        }

        if (Array.isArray(data.signals) && data.signals.length > 0) {
          for (const signal of data.signals) {
            if (signal.id > lastSignalIdRef.current) {
              lastSignalIdRef.current = signal.id;
              await handleIncomingSignal(signal);
            }
          }
        }
      } catch (err) {
        // Polling network hiccup; silently retry on next tick
      }
    };

    pollSignals();
    pollingTimerRef.current = setInterval(pollSignals, 1000);

    return () => {
      active = false;
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [isJoined, myPeerId, roomId]);

  // 3. Handle WebRTC Signaling Messages
  const handleIncomingSignal = async (signal: WatchSignalMessage) => {
    const iceServers = getWatchIceServers();

    // CASE A: HOST handling incoming signals from participants
    if (isHost) {
      if (signal.type === 'peer:join') {
        const peer = signal.payload?.peer;
        if (peer && peer.id !== myPeerId) {
          // If host is already sharing screen, establish WebRTC connection to new participant
          if (localStreamRef.current) {
            await createHostPeerConnection(peer.id, localStreamRef.current);
          }
        }
      } else if (signal.type === 'webrtc:answer') {
        const pc = peerConnectionsRef.current.get(signal.fromPeerId);
        if (pc && signal.payload?.sdp) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.payload.sdp));
            // Drain any queued ICE candidates
            const queued = candidateQueuesRef.current.get(signal.fromPeerId) || [];
            for (const cand of queued) {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            }
            candidateQueuesRef.current.delete(signal.fromPeerId);
          } catch (e) {
            console.error('Host setRemoteDescription error:', e);
          }
        }
      } else if (signal.type === 'webrtc:ice-candidate') {
        const pc = peerConnectionsRef.current.get(signal.fromPeerId);
        if (pc && signal.payload?.candidate) {
          try {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.payload.candidate));
            } else {
              const q = candidateQueuesRef.current.get(signal.fromPeerId) || [];
              q.push(signal.payload.candidate);
              candidateQueuesRef.current.set(signal.fromPeerId, q);
            }
          } catch (e) {
            console.error('Host addIceCandidate error:', e);
          }
        }
      } else if (signal.type === 'peer:leave') {
        const pc = peerConnectionsRef.current.get(signal.fromPeerId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(signal.fromPeerId);
        }
      }
    }

    // CASE B: PARTICIPANT handling signals from Host
    else {
      if (signal.type === 'webrtc:offer') {
        if (signal.payload?.sdp) {
          await handleHostOffer(signal.fromPeerId, signal.payload.sdp);
        }
      } else if (signal.type === 'webrtc:ice-candidate') {
        const pc = participantPeerConnectionRef.current;
        if (pc && signal.payload?.candidate) {
          try {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.payload.candidate));
            } else {
              const q = candidateQueuesRef.current.get('host') || [];
              q.push(signal.payload.candidate);
              candidateQueuesRef.current.set('host', q);
            }
          } catch (e) {
            console.error('Participant addIceCandidate error:', e);
          }
        }
      } else if (signal.type === 'screenshare:stopped') {
        setWebrtcStatus('idle');
        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = null;
        }
      }
    }
  };

  // Host creates connection and sends Offer to a specific participant
  const createHostPeerConnection = async (targetPeerId: string, stream: MediaStream) => {
    // Close existing if any
    const existing = peerConnectionsRef.current.get(targetPeerId);
    if (existing) existing.close();

    const pc = new RTCPeerConnection({ iceServers: getWatchIceServers() });
    peerConnectionsRef.current.set(targetPeerId, pc);

    // Attach local screen stream tracks
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        postSignal({
          toPeerId: targetPeerId,
          type: 'webrtc:ice-candidate',
          payload: { candidate: event.candidate },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        pc.close();
        peerConnectionsRef.current.delete(targetPeerId);
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      postSignal({
        toPeerId: targetPeerId,
        type: 'webrtc:offer',
        payload: { sdp: pc.localDescription },
      });
    } catch (err) {
      console.error('Error creating offer for peer:', targetPeerId, err);
    }
  };

  // Participant receives Offer from Host and replies with Answer
  const handleHostOffer = async (hostId: string, offerSdp: RTCSessionDescriptionInit) => {
    setWebrtcStatus('connecting');

    if (participantPeerConnectionRef.current) {
      participantPeerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection({ iceServers: getWatchIceServers() });
    participantPeerConnectionRef.current = pc;

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.srcObject = event.streams[0];
          videoPlayerRef.current.play().catch((e) => console.log('Autoplay handled:', e));
        }
        setWebrtcStatus('connected');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        postSignal({
          toPeerId: hostId,
          type: 'webrtc:ice-candidate',
          payload: { candidate: event.candidate },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setWebrtcStatus('connected');
      } else if (pc.connectionState === 'failed') {
        setWebrtcStatus('error');
      }
    };

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));

      // Drain queued host ICE candidates
      const queued = candidateQueuesRef.current.get('host') || [];
      for (const cand of queued) {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      }
      candidateQueuesRef.current.delete('host');

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      postSignal({
        toPeerId: hostId,
        type: 'webrtc:answer',
        payload: { sdp: pc.localDescription },
      });
    } catch (err) {
      console.error('Participant handleHostOffer error:', err);
      setWebrtcStatus('error');
    }
  };

  // Helper to post signals to server
  const postSignal = async (signalData: {
    toPeerId?: string;
    type: WatchSignalMessage['type'];
    payload?: any;
  }) => {
    try {
      await fetch(`/api/watch-room/${roomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPeerId: myPeerId,
          ...signalData,
        }),
      });
    } catch (err) {
      console.error('postSignal error:', err);
    }
  };

  // 4. Host Screen Sharing Controller
  const handleStartScreenShare = async () => {
    setShareError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      setShareError(
        'Screen sharing is not supported by your browser. Please use Chrome, Edge, Firefox, or Safari on desktop.'
      );
      return;
    }

    try {
      // Prompt native display media picker
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 30, max: 60 },
        },
        audio: true, // Captures tab stereo audio if user checks "Also share tab audio"
      });

      localStreamRef.current = stream;
      setIsSharing(true);

      // Render local preview
      if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = stream;
        videoPlayerRef.current.muted = true; // Mute locally to prevent feedback echo for the host
        videoPlayerRef.current.play().catch((e) => console.log('Local play error:', e));
      }

      // Handle user clicking "Stop Sharing" on browser's native floating bar
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          handleStopScreenShare();
        };
      }

      // Notify server and all connected peers
      await fetch(`/api/watch-room/${roomId}/signal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPeerId: myPeerId,
          toPeerId: 'all',
          type: 'screenshare:started',
        }),
      });

      // Send offers to all currently connected peers in room
      if (room?.peers) {
        for (const peer of room.peers) {
          if (peer.id !== myPeerId && peer.connected) {
            await createHostPeerConnection(peer.id, stream);
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setShareError('Screen sharing permission was canceled or denied.');
      } else {
        setShareError(err.message || 'Failed to start screen share.');
      }
    }
  };

  const handleStopScreenShare = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setIsSharing(false);

    if (videoPlayerRef.current) {
      videoPlayerRef.current.srcObject = null;
    }

    // Close peer connections
    for (const [, pc] of peerConnectionsRef.current.entries()) {
      pc.close();
    }
    peerConnectionsRef.current.clear();

    // Signal server
    postSignal({
      toPeerId: 'all',
      type: 'screenshare:stopped',
    });
  };

  // 5. Cleanup on unmount
  const cleanupWebRTC = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    for (const [, pc] of peerConnectionsRef.current.entries()) {
      pc.close();
    }
    peerConnectionsRef.current.clear();

    if (participantPeerConnectionRef.current) {
      participantPeerConnectionRef.current.close();
      participantPeerConnectionRef.current = null;
    }

    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
    }
  };

  // Fullscreen controller
  const toggleFullscreen = () => {
    if (!theaterContainerRef.current) return;

    if (!document.fullscreenElement) {
      theaterContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Copy share link
  const handleCopyLink = () => {
    const params = new URLSearchParams();
    if (room?.platform) params.set('platform', room.platform);
    if (room?.title) params.set('title', room.title);
    if (room?.hostName) params.set('host', room.hostName);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const fullUrl = `${window.location.origin}/watch-room/${roomId}${qs}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Audio volume change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (videoPlayerRef.current && !isHost) {
      videoPlayerRef.current.volume = newVol;
      videoPlayerRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoPlayerRef.current || isHost) return;
    const next = !isMuted;
    setIsMuted(next);
    videoPlayerRef.current.muted = next;
  };

  // Leave room
  const handleLeaveRoom = async () => {
    cleanupWebRTC();
    if (myPeerId) {
      try {
        await fetch(`/api/watch-room/${roomId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId: myPeerId }),
        });
      } catch (e) {}
    }
    router.push('/watch-together');
  };

  const platformInfo: Record<
    StreamingPlatform,
    { name: string; icon: string; badge: string; glow: string }
  > = {
    netflix: {
      name: 'Netflix',
      icon: '🎬',
      badge: 'border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10',
      glow: 'shadow-red-900/20',
    },
    hotstar: {
      name: 'Disney+ Hotstar',
      icon: '🌟',
      badge: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10',
      glow: 'shadow-blue-900/20',
    },
    prime: {
      name: 'Prime Video',
      icon: '📦',
      badge: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10',
      glow: 'shadow-sky-900/20',
    },
    youtube: {
      name: 'YouTube',
      icon: '📺',
      badge: 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10',
      glow: 'shadow-rose-900/20',
    },
    other: {
      name: 'Browser Tab Stream',
      icon: '🌐',
      badge: 'border-purple-500/30 text-[#5722AF] dark:text-purple-300 bg-purple-500/10',
      glow: 'shadow-purple-900/20',
    },
  };

  const currentPlatform = room ? platformInfo[room.platform] || platformInfo.other : platformInfo.other;

  // Render: Loading Screen
  if (isLoadingRoom) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#5722AF] flex items-center justify-center animate-pulse">
          <Tv className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-semibold text-zinc-400">Loading Cinema Room...</p>
      </div>
    );
  }

  // Render: Error Screen
  if (roomError || !room) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col">
        <Header
          activeToolName="Watch Together"
          onOpenHelp={() => {}}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold">Watch Room Unavailable</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{roomError || 'Room not found.'}</p>
          <button
            type="button"
            onClick={() => router.push('/watch-together')}
            className="px-5 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#682BC9] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Create New Watch Room
          </button>
        </main>
      </div>
    );
  }

  // Render: Join Modal for Guests entering via link
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30 text-purple-300 bg-purple-950/40">
              <span>{currentPlatform.icon}</span>
              <span>{currentPlatform.name}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">{room.title}</h1>
            <p className="text-xs text-zinc-400">
              Host: <span className="font-semibold text-zinc-200">{room.hostName}</span> • Room <span className="font-mono text-[#9B6BE8] font-bold">{room.roomId}</span>
            </p>
          </div>

          <form onSubmit={handleJoinModalSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="guest-input-name"
                className="block text-xs font-bold text-zinc-300 uppercase tracking-wider"
              >
                Enter Your Display Name
              </label>
              <input
                id="guest-input-name"
                type="text"
                required
                autoFocus
                value={joinModalName}
                onChange={(e) => setJoinModalName(e.target.value)}
                placeholder="e.g. Rahul, Amit, Neha"
                className="w-full px-4 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#5722AF] text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#5722AF] hover:bg-[#682BC9] text-white font-bold text-sm shadow-lg shadow-[#5722AF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Join Cinema Session</span>
            </button>
          </form>

          <div className="text-[11px] text-zinc-500 text-center leading-relaxed">
            By joining, you will connect directly to the host's screen share stream via WebRTC. No account required.
          </div>
        </div>
      </div>
    );
  }

  // Active Peer Counts & Stream State
  const activePeerList = room.peers || [];
  const viewerCount = activePeerList.length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col select-none">
      {/* Top Cinema Bar */}
      <header className="h-16 px-4 sm:px-6 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLeaveRoom}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Leave Room"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">{currentPlatform.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs">
                  {room.title}
                </h1>
                <span
                  className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentPlatform.badge}`}
                >
                  {currentPlatform.name}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <span>Room:</span>
                <span className="font-mono text-purple-400 font-bold">{room.roomId}</span>
                <span>•</span>
                <span className="text-zinc-500">Host: {room.hostName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs">
            {isSharing || webrtcStatus === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-400 text-[11px]">LIVE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-semibold text-zinc-400 text-[11px]">STANDBY</span>
              </>
            )}
          </div>

          {/* Viewers Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-[11px]">{viewerCount}</span>
          </div>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#682BC9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Theater Body */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Cinema Video Area (16:9 Cinema Canvas) */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 justify-center items-center overflow-y-auto">
          <div
            ref={theaterContainerRef}
            className={`w-full transition-all duration-300 relative rounded-3xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex flex-col items-center justify-center ${
              isTheaterMode
                ? 'max-w-6xl aspect-video'
                : 'max-w-5xl aspect-video'
            }`}
          >
            {/* Active Video Player */}
            <video
              ref={videoPlayerRef}
              autoPlay
              playsInline
              className={`w-full h-full object-contain ${
                isSharing || webrtcStatus === 'connected' ? 'block' : 'hidden'
              }`}
            />

            {/* Standby UI: Host when not sharing */}
            {isHost && !isSharing && (
              <div className="p-6 sm:p-8 text-center space-y-5 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-[#5722AF]/20 border border-[#5722AF]/40 text-[#9B6BE8] flex items-center justify-center mx-auto shadow-inner">
                  <MonitorUp className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Start Your Cinema Stream</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Open your movie or video in a browser tab, then click the button below to share it with your friends.
                  </p>
                </div>

                {shareError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 text-left">
                    {shareError}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleStartScreenShare}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#5722AF] hover:bg-[#682BC9] text-white font-bold text-sm shadow-xl shadow-[#5722AF]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MonitorUp className="w-4 h-4" />
                    <span>Start Screen Share</span>
                  </button>

                  <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2 text-left">
                    <Info className="w-3.5 h-3.5 text-[#9B6BE8] shrink-0 mt-0.5" />
                    <span>
                      <strong>Sound Tip:</strong> In the browser share dialog, pick <strong>Chrome Tab</strong> and check <strong>&ldquo;Also share tab audio&rdquo;</strong> to broadcast stereo movie sound!
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Standby UI: Participant when host is not sharing */}
            {!isHost && webrtcStatus !== 'connected' && (
              <div className="p-6 sm:p-8 text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                  <Tv className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">Waiting for Screen Share</h3>
                  <p className="text-xs text-zinc-400">
                    Host <span className="font-semibold text-zinc-200">@{room.hostName}</span> has not started sharing their screen yet. Sit back with your popcorn!
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Connecting to room signaling...</span>
                </div>
              </div>
            )}

            {/* Bottom Floating Control Bar (Overlay) */}
            {(isSharing || webrtcStatus === 'connected') && (
              <div className="absolute bottom-3 left-4 right-4 py-2 px-4 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800/90 flex items-center justify-between text-xs text-zinc-300 shadow-xl transition-opacity">
                {/* Left: Stream Info */}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-white text-xs">{currentPlatform.name}</span>
                  <span className="text-zinc-500 text-[10px] hidden sm:inline">• P2P WebRTC</span>
                </div>

                {/* Center / Right: Volume & Display Controls */}
                <div className="flex items-center gap-3">
                  {!isHost && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-zinc-200" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-16 sm:w-20 accent-[#5722AF] h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}

                  {isHost && isSharing && (
                    <button
                      type="button"
                      onClick={handleStopScreenShare}
                      className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop Sharing</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsTheaterMode((prev) => !prev)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors hidden sm:block"
                    title={isTheaterMode ? 'Standard View' : 'Theater Mode'}
                  >
                    <Film className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Participants List & Controls */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800/80 bg-zinc-900/60 p-4 sm:p-5 flex flex-col justify-between shrink-0 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#9B6BE8]" />
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Participants ({viewerCount})
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">
                P2P Mesh
              </span>
            </div>

            {/* Peer List */}
            <div className="space-y-2 max-h-[280px] lg:max-h-[380px] overflow-y-auto pr-1">
              {activePeerList.map((peer: WatchPeer) => {
                const isMe = peer.id === myPeerId;
                return (
                  <div
                    key={peer.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      isMe
                        ? 'bg-[#5722AF]/15 border-[#5722AF]/40 text-white'
                        : 'bg-zinc-900/80 border-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-300 shrink-0">
                        {peer.isHost ? (
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 text-xs font-semibold truncate">
                          <span className="truncate">{peer.displayName}</span>
                          {isMe && <span className="text-[10px] text-[#9B6BE8] font-bold">(You)</span>}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {peer.isHost ? 'Room Host' : 'Watching'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Host Actions & Audio Tips */}
          <div className="space-y-3 pt-4 border-t border-zinc-800/80">
            {isHost && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={isSharing ? handleStopScreenShare : handleStartScreenShare}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSharing
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-[#5722AF] hover:bg-[#682BC9] text-white'
                  }`}
                >
                  {isSharing ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Screen Sharing</span>
                    </>
                  ) : (
                    <>
                      <MonitorUp className="w-3.5 h-3.5" />
                      <span>Start Screen Share</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Room Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Room Link</span>
                </>
              )}
            </button>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <div className="font-semibold text-zinc-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Zero Account Guest Access</span>
              </div>
              <p className="leading-relaxed">
                Friends can open this link on phones or laptops and watch together instantly.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
