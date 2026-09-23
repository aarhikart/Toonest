import crypto from 'crypto';

export interface SignalMessage {
  id: number;
  from: 'desktop' | 'phone';
  to: 'desktop' | 'phone';
  type: 'peer:ready' | 'webrtc:offer' | 'webrtc:answer' | 'webrtc:ice-candidate' | 'peer:status' | 'peer:disconnect' | 'camera:state';
  payload?: any;
  timestamp: number;
}

export interface CameraRoom {
  roomId: string;
  pin: string | null;
  createdAt: number;
  expiresAt: number;
  durationMinutes: number;
  status: 'waiting' | 'connected' | 'streaming' | 'disconnected' | 'expired';
  desktopPeer: {
    id: string;
    joinedAt: number;
    lastSeen: number;
  } | null;
  phonePeer: {
    id: string;
    joinedAt: number;
    lastSeen: number;
    cameraActive: boolean;
    micActive: boolean;
  } | null;
  signals: SignalMessage[];
  lastSignalId: number;
}

// Global in-memory storage across API route invocations in Node environment
const globalForRooms = global as unknown as {
  cameraRoomsStore?: Map<string, CameraRoom>;
  cleanupInterval?: NodeJS.Timeout;
};

const rooms = globalForRooms.cameraRoomsStore || new Map<string, CameraRoom>();
globalForRooms.cameraRoomsStore = rooms;

// Periodic cleanup of expired rooms every 60 seconds
if (!globalForRooms.cleanupInterval) {
  globalForRooms.cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, room] of rooms.entries()) {
      if (room.expiresAt <= now) {
        room.status = 'expired';
        // Keep expired marker for 5 minutes then purge
        if (now - room.expiresAt > 5 * 60 * 1000) {
          rooms.delete(id);
        }
      }
    }
  }, 60000);
}

export class CameraRoomManager {
  /**
   * Generates a cryptographically secure random alphanumeric room ID (e.g. "A8K92P4X")
   */
  static generateSecureRoomId(length = 8): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars (0, 1, I, O)
    const bytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Generates an optional 6-digit numeric PIN
   */
  static generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create a new temporary camera connection room
   */
  static createRoom(options?: {
    expirationMinutes?: number;
    requirePin?: boolean;
    customPin?: string;
  }): CameraRoom {
    const durationMinutes = Math.min(60, Math.max(2, options?.expirationMinutes || 10));
    const now = Date.now();
    const expiresAt = now + durationMinutes * 60 * 1000;

    let roomId = this.generateSecureRoomId();
    while (rooms.has(roomId)) {
      roomId = this.generateSecureRoomId();
    }

    const pin = options?.requirePin
      ? options.customPin || this.generatePin()
      : null;

    const room: CameraRoom = {
      roomId,
      pin,
      createdAt: now,
      expiresAt,
      durationMinutes,
      status: 'waiting',
      desktopPeer: null,
      phonePeer: null,
      signals: [],
      lastSignalId: 0
    };

    rooms.set(roomId, room);
    return room;
  }

  /**
   * Retrieve a room by ID with expiration validation
   */
  static getRoom(roomId: string): CameraRoom | null {
    if (!roomId) return null;
    const cleanId = roomId.toUpperCase().trim();
    const room = rooms.get(cleanId);
    if (!room) return null;

    const now = Date.now();
    if (now >= room.expiresAt) {
      room.status = 'expired';
    }

    return room;
  }

  /**
   * Join a room as either desktop or phone
   */
  static joinRoom(
    roomId: string,
    peerType: 'desktop' | 'phone',
    providedPin?: string
  ): { success: boolean; room?: CameraRoom; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Room not found. Please generate a new URL.' };
    }

    if (room.status === 'expired') {
      return { success: false, error: 'This camera session has expired. Please generate a new URL.' };
    }

    // Validate PIN if room requires PIN
    if (room.pin && peerType === 'phone') {
      if (!providedPin || providedPin.trim() !== room.pin) {
        return { success: false, error: 'Invalid Room PIN. Please enter the correct 6-digit PIN.' };
      }
    }

    const now = Date.now();
    const peerId = `${peerType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (peerType === 'desktop') {
      room.desktopPeer = {
        id: peerId,
        joinedAt: now,
        lastSeen: now
      };
    } else {
      // Reject if phone is already actively streaming in this room
      if (room.phonePeer && now - room.phonePeer.lastSeen < 15000 && room.status === 'streaming') {
        return { success: false, error: 'This session already has an active phone connected.' };
      }

      room.phonePeer = {
        id: peerId,
        joinedAt: now,
        lastSeen: now,
        cameraActive: false,
        micActive: false
      };

      if (room.status === 'waiting') {
        room.status = 'connected';
      }

      // Notify desktop that phone has joined
      this.postSignal(roomId, {
        from: 'phone',
        to: 'desktop',
        type: 'peer:ready',
        payload: { peerId }
      });
    }

    return { success: true, room };
  }

  /**
   * Post a signaling message into the room's message queue
   */
  static postSignal(
    roomId: string,
    message: {
      from: 'desktop' | 'phone';
      to?: 'desktop' | 'phone';
      type: SignalMessage['type'];
      payload?: any;
    }
  ): SignalMessage | null {
    const room = this.getRoom(roomId);
    if (!room || room.status === 'expired') return null;

    const to = message.to || (message.from === 'desktop' ? 'phone' : 'desktop');
    const signalId = ++room.lastSignalId;

    const signal: SignalMessage = {
      id: signalId,
      from: message.from,
      to,
      type: message.type,
      payload: message.payload,
      timestamp: Date.now()
    };

    room.signals.push(signal);

    // Keep only last 80 signals to prevent memory bloat
    if (room.signals.length > 80) {
      room.signals = room.signals.slice(-80);
    }

    // Update room status based on signals
    if (message.type === 'camera:state') {
      if (room.phonePeer) {
        if (typeof message.payload?.camera === 'boolean') {
          room.phonePeer.cameraActive = message.payload.camera;
        }
        if (typeof message.payload?.mic === 'boolean') {
          room.phonePeer.micActive = message.payload.mic;
        }
      }
      if (message.payload?.camera) {
        room.status = 'streaming';
      }
    } else if (message.type === 'peer:disconnect') {
      if (message.from === 'phone') {
        room.phonePeer = null;
        room.status = 'disconnected';
      }
    }

    // Touch peer heartbeat
    const now = Date.now();
    if (message.from === 'desktop' && room.desktopPeer) {
      room.desktopPeer.lastSeen = now;
    } else if (message.from === 'phone' && room.phonePeer) {
      room.phonePeer.lastSeen = now;
    }

    return signal;
  }

  /**
   * Retrieve queued signals for a peer
   */
  static getSignals(
    roomId: string,
    forPeer: 'desktop' | 'phone',
    afterId = 0
  ): { signals: SignalMessage[]; roomStatus: CameraRoom['status']; expiresAt: number; timeRemainingMs: number } | null {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const now = Date.now();
    // Update peer heartbeat
    if (forPeer === 'desktop' && room.desktopPeer) {
      room.desktopPeer.lastSeen = now;
    } else if (forPeer === 'phone' && room.phonePeer) {
      room.phonePeer.lastSeen = now;
    }

    // Detect if phone peer heartbeat vanished (e.g. closed tab without clean disconnect)
    if (room.phonePeer && now - room.phonePeer.lastSeen > 12000 && room.status === 'streaming') {
      room.status = 'disconnected';
      room.phonePeer = null;
      this.postSignal(roomId, {
        from: 'phone',
        to: 'desktop',
        type: 'peer:disconnect',
        payload: { reason: 'Heartbeat timeout' }
      });
    }

    const filtered = room.signals.filter(s => s.to === forPeer && s.id > afterId);
    return {
      signals: filtered,
      roomStatus: room.status,
      expiresAt: room.expiresAt,
      timeRemainingMs: Math.max(0, room.expiresAt - now)
    };
  }

  /**
   * Explicitly expire/terminate a room
   */
  static expireRoom(roomId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;
    room.status = 'expired';
    room.expiresAt = Date.now();
    this.postSignal(roomId, {
      from: 'desktop',
      to: 'phone',
      type: 'peer:disconnect',
      payload: { reason: 'Room expired' }
    });
    return true;
  }
}
