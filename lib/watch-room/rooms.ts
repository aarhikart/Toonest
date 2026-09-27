import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  WatchRoom,
  WatchPeer,
  WatchSignalMessage,
  StreamingPlatform,
  SerializedWatchRoom,
} from './types';

const STORAGE_DIR = path.join(os.tmpdir(), 'toolnest-watch-rooms');

function ensureStorageDir() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch (e) {}
}

function saveRoomToDisk(room: WatchRoom) {
  try {
    ensureStorageDir();
    const filePath = path.join(STORAGE_DIR, `${room.roomId}.json`);
    const serialized = WatchRoomManager.serializeRoom(room);
    const data = {
      ...serialized,
      signals: room.signals.slice(-100),
      lastSignalId: room.lastSignalId,
    };
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  } catch (e) {}
}

function loadRoomFromDisk(roomId: string): WatchRoom | null {
  try {
    ensureStorageDir();
    const filePath = path.join(STORAGE_DIR, `${roomId}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    if (Date.now() >= data.expiresAt) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
      return null;
    }

    const peersMap = new Map<string, WatchPeer>();
    if (Array.isArray(data.peers)) {
      for (const p of data.peers) {
        peersMap.set(p.id, p);
      }
    }

    const room: WatchRoom = {
      roomId: data.roomId,
      title: data.title,
      platform: data.platform || 'other',
      createdAt: data.createdAt || Date.now(),
      expiresAt: data.expiresAt || Date.now() + 12 * 60 * 60 * 1000,
      hostPeerId: data.hostPeerId || '',
      hostName: data.hostName || 'Host',
      isScreenSharing: !!data.isScreenSharing,
      status: data.status || 'active',
      peers: peersMap,
      signals: Array.isArray(data.signals) ? data.signals : [],
      lastSignalId: typeof data.lastSignalId === 'number' ? data.lastSignalId : (data.signals?.length || 0),
    };
    return room;
  } catch (e) {
    return null;
  }
}

function deleteRoomFromDisk(roomId: string) {
  try {
    const filePath = path.join(STORAGE_DIR, `${roomId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {}
}

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
        if (now - room.expiresAt > 10 * 60 * 1000) {
          rooms.delete(id);
          deleteRoomFromDisk(id);
        }
      } else {
        for (const [peerId, peer] of room.peers.entries()) {
          if (!peer.isHost && now - peer.lastSeen > 45000) {
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
  static cleanRoomId(rawId: string): string {
    if (!rawId) return '';
    return rawId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  }

  static isValidRoomId(rawId: string): boolean {
    const clean = this.cleanRoomId(rawId);
    return clean.length >= 3 && clean.length <= 24;
  }

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
   * Creates or registers a new Watch Together Room
   */
  static createRoom(options: {
    roomId?: string;
    hostName: string;
    hostPeerId: string;
    platform?: StreamingPlatform;
    title?: string;
    durationHours?: number;
  }): WatchRoom {
    const now = Date.now();
    const durationHours = options.durationHours || 12;
    const expiresAt = now + durationHours * 60 * 60 * 1000;

    let roomId = options.roomId ? this.cleanRoomId(options.roomId) : this.generateRoomId();
    if (!roomId) roomId = this.generateRoomId();

    const existing = this.getRoom(roomId);
    if (existing && existing.status === 'active') {
      existing.hostPeerId = options.hostPeerId;
      existing.hostName = options.hostName.trim() || 'Host';
      if (options.platform) existing.platform = options.platform;
      if (options.title) existing.title = options.title.trim();
      existing.peers.set(options.hostPeerId, {
        id: options.hostPeerId,
        displayName: existing.hostName,
        isHost: true,
        joinedAt: now,
        lastSeen: now,
        connected: true,
      });
      saveRoomToDisk(existing);
      return existing;
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
    saveRoomToDisk(room);
    return room;
  }

  /**
   * Retrieves a room by ID from memory or persistent disk cache
   */
  static getRoom(roomId: string): WatchRoom | null {
    if (!roomId) return null;
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId) return null;

    let room = rooms.get(cleanId);
    if (!room) {
      room = loadRoomFromDisk(cleanId) || undefined;
      if (room) {
        rooms.set(cleanId, room);
      }
    }

    if (!room) return null;

    if (Date.now() >= room.expiresAt) {
      room.status = 'closed';
      saveRoomToDisk(room);
    }

    return room;
  }

  /**
   * Gets an existing room or automatically provisions a new room for a valid room code.
   * Ensures room links never fail with 404 in serverless / multi-instance environments.
   */
  static getOrCreateRoom(
    roomId: string,
    defaults?: {
      platform?: StreamingPlatform;
      title?: string;
      hostName?: string;
      hostPeerId?: string;
    }
  ): WatchRoom | null {
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId || !this.isValidRoomId(cleanId)) return null;

    let room = this.getRoom(cleanId);
    if (room && room.status !== 'closed') {
      if (defaults?.platform && room.platform === 'other') {
        room.platform = defaults.platform;
      }
      if (defaults?.title && (!room.title || room.title.startsWith('Watch Room '))) {
        room.title = defaults.title.trim();
      }
      if (defaults?.hostName && (!room.hostName || room.hostName === 'Host')) {
        room.hostName = defaults.hostName.trim();
      }
      saveRoomToDisk(room);
      return room;
    }

    // Auto-provision room
    const now = Date.now();
    const expiresAt = now + 12 * 60 * 60 * 1000; // 12 hours active window
    const hostPeerId = defaults?.hostPeerId || '';
    const hostName = defaults?.hostName?.trim() || 'Host';

    const peersMap = new Map<string, WatchPeer>();
    if (hostPeerId) {
      peersMap.set(hostPeerId, {
        id: hostPeerId,
        displayName: hostName,
        isHost: true,
        joinedAt: now,
        lastSeen: now,
        connected: true,
      });
    }

    const newRoom: WatchRoom = {
      roomId: cleanId,
      title: defaults?.title?.trim() || `${hostName}'s Cinema Room`,
      platform: defaults?.platform || 'other',
      createdAt: now,
      expiresAt,
      hostPeerId,
      hostName,
      isScreenSharing: false,
      status: 'active',
      peers: peersMap,
      signals: [],
      lastSignalId: 0,
    };

    rooms.set(cleanId, newRoom);
    saveRoomToDisk(newRoom);
    return newRoom;
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
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId || !this.isValidRoomId(cleanId)) {
      return { success: false, error: 'Invalid room code format.' };
    }

    const room = this.getOrCreateRoom(cleanId, {
      hostName: isHost ? displayName : undefined,
      hostPeerId: isHost ? peerId : undefined,
    });

    if (!room) {
      return { success: false, error: 'Room not found. Please verify the room link or code.' };
    }

    if (room.status === 'closed') {
      return { success: false, error: 'This Watch Room has been closed or expired.' };
    }

    const now = Date.now();
    const cleanName = displayName.trim() || (isHost ? 'Host' : 'Friend');

    // Only assign as host if explicitly isHost: true or already matches hostPeerId
    const shouldBeHost = Boolean(isHost || (room.hostPeerId && room.hostPeerId === peerId));
    if (isHost) {
      room.hostPeerId = peerId;
      room.hostName = cleanName;
    }

    if (room.peers.has(peerId)) {
      const existing = room.peers.get(peerId)!;
      existing.displayName = cleanName;
      existing.lastSeen = now;
      existing.connected = true;
      existing.isHost = shouldBeHost;
    } else {
      const newPeer: WatchPeer = {
        id: peerId,
        displayName: cleanName,
        isHost: shouldBeHost,
        joinedAt: now,
        lastSeen: now,
        connected: true,
      };
      room.peers.set(peerId, newPeer);

      this.postSignal(cleanId, {
        fromPeerId: peerId,
        toPeerId: 'all',
        type: 'peer:join',
        payload: {
          peer: newPeer,
        },
      });
    }

    saveRoomToDisk(room);

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

      if (peer.isHost) {
        room.status = 'closed';
        this.postSignal(roomId, {
          fromPeerId: peerId,
          toPeerId: 'all',
          type: 'screenshare:stopped',
          payload: { reason: 'Host left the cinema room' },
        });
      }

      saveRoomToDisk(room);
    }

    return true;
  }

  /**
   * Updates host screen-sharing state
   */
  static setScreenSharing(roomId: string, hostPeerId: string, isSharing: boolean): boolean {
    const room = this.getOrCreateRoom(roomId);
    if (!room) return false;

    if (!room.hostPeerId) {
      room.hostPeerId = hostPeerId;
    }

    room.isScreenSharing = isSharing;
    this.postSignal(roomId, {
      fromPeerId: hostPeerId,
      toPeerId: 'all',
      type: isSharing ? 'screenshare:started' : 'screenshare:stopped',
      payload: { isScreenSharing: isSharing },
    });

    saveRoomToDisk(room);
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
    const room = this.getOrCreateRoom(roomId);
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

    if (room.signals.length > 100) {
      room.signals = room.signals.slice(-100);
    }

    const sender = room.peers.get(signal.fromPeerId);
    if (sender) {
      sender.lastSeen = Date.now();
      sender.connected = true;
    }

    saveRoomToDisk(room);
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
