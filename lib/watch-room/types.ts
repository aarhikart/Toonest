export type StreamingPlatform = 'netflix' | 'hotstar' | 'prime' | 'youtube' | 'other';

export interface WatchPeer {
  id: string; // unique peerId
  displayName: string;
  isHost: boolean;
  joinedAt: number;
  lastSeen: number;
  connected: boolean;
}

export interface WatchSignalMessage {
  id: number;
  fromPeerId: string;
  toPeerId: string; // specific peerId, or 'all'
  type:
    | 'peer:join'
    | 'peer:leave'
    | 'peer:heartbeat'
    | 'webrtc:offer'
    | 'webrtc:answer'
    | 'webrtc:ice-candidate'
    | 'screenshare:started'
    | 'screenshare:stopped'
    | 'room:sync';
  payload?: any;
  timestamp: number;
}

export interface WatchRoom {
  roomId: string;
  title: string;
  platform: StreamingPlatform;
  createdAt: number;
  expiresAt: number;
  hostPeerId: string;
  hostName: string;
  isScreenSharing: boolean;
  status: 'active' | 'closed';
  peers: Map<string, WatchPeer>;
  signals: WatchSignalMessage[];
  lastSignalId: number;
}

export interface SerializedWatchRoom {
  roomId: string;
  title: string;
  platform: StreamingPlatform;
  createdAt: number;
  expiresAt: number;
  hostPeerId: string;
  hostName: string;
  isScreenSharing: boolean;
  status: 'active' | 'closed';
  peers: WatchPeer[];
  peerCount: number;
}
