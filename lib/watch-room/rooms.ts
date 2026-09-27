import crypto from 'crypto';
import {
  WatchRoom,
  WatchPeer,
  WatchSignalMessage,
  StreamingPlatform,
  SerializedWatchRoom,
} from './types';

const globalForWatchRooms = global as unknown as {
  watchRoomsStore?: Map<string, WatchRoom>;
  watchCleanupInterval?: NodeJS.Timeout;
};

const rooms = globalForWatchRooms.watchRoomsStore || new Map<string, WatchRoom>();
globalForWatchRooms.watchRoomsStore = rooms;

// Periodic cleanup of expired rooms every 2 minutes
if (!globalForWatchRooms.watchCleanupInterval) {
  globalForWatchRooms.watchCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [id, room] of rooms.entries()) {
      if (room.expiresAt <= now || room.status === 'closed') {
        // Keep closed rooms for 10 minutes then delete
        if (now - room.expiresAt > 10 * 60 * 1000) {
          rooms.delete(id);
        }
      } else {
        // Check for inactive peers (heartbeat older than 25 seconds)
        for (const [peerId, peer] of room.peers.entries()) {
          if (!peer.isHost && now - peer.lastSeen > 25000) {
            peer.connected = false;
            room.peers.delete(peerId);
            WatchRoomManager.postSignal(id, {
              fromPeerId: peerId,
              toPeerId: 'all',
              type: 'peer:leave',
              payload: { peerId, displayName: peer.displayName },
            });
          }
        }
      }
    }
  }, 120000);
}

export class WatchRoomManager {
  /**
   * Generates a 6-character memorable room code (e.g. ABC123, CIN789)
   */
  static generateRoomId(length = 6): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Creates a new Watch Together Room
   */
  static createRoom(options: {
    hostName: string;
    hostPeerId: string;
    platform?: StreamingPlatform;
    title?: string;
    durationHours?: number;
  }): WatchRoom {
    const now = Date.now();
    const durationHours = options.durationHours || 6; // default 6 hours
    const expiresAt = now + durationHours * 60 * 60 * 1000;

    let roomId = this.generateRoomId();
    while (rooms.has(roomId)) {
      roomId = this.generateRoomId();
    }

    const hostPeer: WatchPeer = {
      id: options.hostPeerId,
      displayName: options.hostName.trim() || 'Host',
      isHost: true,
      joinedAt: now,
      lastSeen: now,
      connected: true,
    };

    const peersMap = new Map<string, WatchPeer>();
    peersMap.set(options.hostPeerId, hostPeer);

    const room: WatchRoom = {
      roomId,
      title: options.title?.trim() || `${hostPeer.displayName}'s Cinema Room`,
      platform: options.platform || 'other',
      createdAt: now,
      expiresAt,
      hostPeerId: options.hostPeerId,
      hostName: hostPeer.displayName,
      isScreenSharing: false,
      status: 'active',
      peers: peersMap,
      signals: [],
      lastSignalId: 0,
    };

    rooms.set(roomId, room);
    return room;
  }

  /**
   * Retrieves a room by ID
   */
  static getRoom(roomId: string): WatchRoom | null {
    if (!roomId) return null;
    const cleanId = roomId.toUpperCase().trim();
    const room = rooms.get(cleanId);
    if (!room) return null;

    if (Date.now() >= room.expiresAt) {
      room.status = 'closed';
    }

    return room;
  }

  /**
   * Joins a user to a room
   */
  static joinRoom(
    roomId: string,
    peerId: string,
    displayName: string,
    isHost = false
  ): { success: boolean; room?: SerializedWatchRoom; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Room not found. Please verify the room link or code.' };
    }

    if (room.status === 'closed') {
      return { success: false, error: 'This Watch Room has been closed or expired.' };
    }

    const now = Date.now();
    const cleanName = displayName.trim() || (isHost ? 'Host' : 'Friend');

    // If already existing peer, update lastSeen
    if (room.peers.has(peerId)) {
      const existing = room.peers.get(peerId)!;
      existing.displayName = cleanName;
      existing.lastSeen = now;
      existing.connected = true;
    } else {
      // Register new peer
      const newPeer: WatchPeer = {
        id: peerId,
        displayName: cleanName,
        isHost: isHost || peerId === room.hostPeerId,
        joinedAt: now,
        lastSeen: now,
        connected: true,
      };
      room.peers.set(peerId, newPeer);

      // Notify others in room that a new peer has joined
      this.postSignal(roomId, {
        fromPeerId: peerId,
        toPeerId: 'all',
        type: 'peer:join',
        payload: {
          peer: newPeer,
        },
      });
    }

    return {
      success: true,
      room: this.serializeRoom(room),
    };
  }

  /**
   * Disconnects a peer from a room
   */
  static leaveRoom(roomId: string, peerId: string): boolean {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const peer = room.peers.get(peerId);
    if (peer) {
      peer.connected = false;
      room.peers.delete(peerId);

      this.postSignal(roomId, {
        fromPeerId: peerId,
        toPeerId: 'all',
        type: 'peer:leave',
        payload: { peerId, displayName: peer.displayName, isHost: peer.isHost },
      });

      // If host leaves, mark room as closed
      if (peer.isHost) {
        room.status = 'closed';
        this.postSignal(roomId, {
          fromPeerId: peerId,
          toPeerId: 'all',
          type: 'screenshare:stopped',
          payload: { reason: 'Host left the cinema room' },
        });
      }
    }

    return true;
  }

  /**
   * Updates host screen-sharing state
   */
  static setScreenSharing(roomId: string, hostPeerId: string, isSharing: boolean): boolean {
    const room = this.getRoom(roomId);
    if (!room || room.hostPeerId !== hostPeerId) return false;

    room.isScreenSharing = isSharing;
    this.postSignal(roomId, {
      fromPeerId: hostPeerId,
      toPeerId: 'all',
      type: isSharing ? 'screenshare:started' : 'screenshare:stopped',
      payload: { isScreenSharing: isSharing },
    });

    return true;
  }

  /**
   * Pushes a signal into the room queue
   */
  static postSignal(
    roomId: string,
    signal: {
      fromPeerId: string;
      toPeerId?: string;
      type: WatchSignalMessage['type'];
      payload?: any;
    }
  ): WatchSignalMessage | null {
    const room = this.getRoom(roomId);
    if (!room || room.status === 'closed') return null;

    const toPeerId = signal.toPeerId || 'all';
    const signalId = ++room.lastSignalId;

    const newSignal: WatchSignalMessage = {
      id: signalId,
      fromPeerId: signal.fromPeerId,
      toPeerId,
      type: signal.type,
      payload: signal.payload,
      timestamp: Date.now(),
    };

    room.signals.push(newSignal);

    // Keep signal buffer trimmed (last 100)
    if (room.signals.length > 100) {
      room.signals = room.signals.slice(-100);
    }

    // Touch sender's heartbeat
    const sender = room.peers.get(signal.fromPeerId);
    if (sender) {
      sender.lastSeen = Date.now();
      sender.connected = true;
    }

    return newSignal;
  }

  /**
   * Polls queued signals for a specific peer
   */
  static getSignals(
    roomId: string,
    peerId: string,
    afterId = 0
  ): {
    signals: WatchSignalMessage[];
    room: SerializedWatchRoom;
  } | null {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const peer = room.peers.get(peerId);
    if (peer) {
      peer.lastSeen = Date.now();
      peer.connected = true;
    }

    // Signals directed to this peer or broadcast to all
    const matching = room.signals.filter(
      (s) => s.id > afterId && (s.toPeerId === peerId || s.toPeerId === 'all') && s.fromPeerId !== peerId
    );

    return {
      signals: matching,
      room: this.serializeRoom(room),
    };
  }

  /**
   * Converts Map-based room to JSON-serializable structure
   */
  static serializeRoom(room: WatchRoom): SerializedWatchRoom {
    const peersList = Array.from(room.peers.values());
    return {
      roomId: room.roomId,
      title: room.title,
      platform: room.platform,
      createdAt: room.createdAt,
      expiresAt: room.expiresAt,
      hostPeerId: room.hostPeerId,
      hostName: room.hostName,
      isScreenSharing: room.isScreenSharing,
      status: room.status,
      peers: peersList,
      peerCount: peersList.length,
    };
  }
}
