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
 * High-availability STUN and TURN server configuration for NAT / Firewall traversal.
 * Includes Metered OpenRelay TURN servers for guaranteed cross-network and mobile carrier traversal.
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
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelay',
      credential: 'openrelay',
    },
  ];
}
