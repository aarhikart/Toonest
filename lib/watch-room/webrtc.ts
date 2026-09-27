export interface WatchConnectionStats {
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  candidateType: 'direct' | 'relay' | 'unknown';
  rttMs?: number;
  fps?: number;
  resolution?: string;
  bytesReceived?: number;
  timestamp: number;
}

/**
 * Standard public STUN server configurations
 */
export function getWatchIceServers(): RTCIceServer[] {
  return [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
        'stun:stun.cloudflare.com:3478',
        'stun:global.stun.twilio.com:3478',
      ],
    },
  ];
}
