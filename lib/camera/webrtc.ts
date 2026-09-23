/**
 * WebRTC Configuration, ICE Servers, and Statistics Extractor
 */

export interface PeerConnectionStats {
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  candidateType: 'direct' | 'relay' | 'unknown';
  resolution?: string;
  fps?: number;
  packetsLost?: number;
  rttMs?: number;
  bytesReceived?: number;
  audioCodec?: string;
  videoCodec?: string;
  timestamp: number;
}

/**
 * Get standard STUN & TURN server configurations
 */
export function getIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [];

  // 1. Primary STUN Server (from ENV or Google default)
  const envStun = process.env.NEXT_PUBLIC_STUN_SERVER;
  if (envStun) {
    servers.push({ urls: envStun.split(',').map(s => s.trim()) });
  } else {
    servers.push({
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302'
      ]
    });
  }

  // 2. TURN Server (if configured via environment variables)
  const turnUrl = process.env.TURN_SERVER_URL;
  const turnUser = process.env.TURN_USERNAME;
  const turnPass = process.env.TURN_PASSWORD;

  if (turnUrl) {
    const turnEntry: RTCIceServer = {
      urls: turnUrl.split(',').map(s => s.trim())
    };
    if (turnUser && turnPass) {
      turnEntry.username = turnUser;
      turnEntry.credential = turnPass;
    }
    servers.push(turnEntry);
  }

  return servers;
}

/**
 * Extract authentic network and stream statistics from RTCPeerConnection
 */
export async function extractPeerStats(pc: RTCPeerConnection): Promise<PeerConnectionStats> {
  const result: PeerConnectionStats = {
    connectionState: pc.connectionState,
    iceConnectionState: pc.iceConnectionState,
    candidateType: 'unknown',
    timestamp: Date.now()
  };

  try {
    const stats = await pc.getStats();
    stats.forEach(report => {
      // Inbound video track stats
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        if (report.framesPerSecond !== undefined) {
          result.fps = Math.round(report.framesPerSecond);
        }
        if (report.frameWidth && report.frameHeight) {
          result.resolution = `${report.frameWidth}x${report.frameHeight}`;
        }
        if (report.packetsLost !== undefined) {
          result.packetsLost = report.packetsLost;
        }
        if (report.bytesReceived !== undefined) {
          result.bytesReceived = report.bytesReceived;
        }
      }

      // Candidate pair for RTT and connection type (Direct / Relay)
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        if (report.currentRoundTripTime !== undefined) {
          result.rttMs = Math.round(report.currentRoundTripTime * 1000);
        }

        // Look up remote or local candidate to check if Relay (TURN)
        const remoteCandidate = stats.get(report.remoteCandidateId);
        const localCandidate = stats.get(report.localCandidateId);
        if (
          remoteCandidate?.candidateType === 'relay' ||
          localCandidate?.candidateType === 'relay'
        ) {
          result.candidateType = 'relay';
        } else if (
          remoteCandidate?.candidateType === 'host' ||
          remoteCandidate?.candidateType === 'srflx'
        ) {
          result.candidateType = 'direct';
        }
      }

      // Codec information
      if (report.type === 'codec') {
        if (report.mimeType?.includes('audio')) {
          result.audioCodec = report.mimeType.split('/')[1];
        } else if (report.mimeType?.includes('video')) {
          result.videoCodec = report.mimeType.split('/')[1];
        }
      }
    });
  } catch (err) {
    console.warn('[WebRTC Stats Error]:', err);
  }

  return result;
}
