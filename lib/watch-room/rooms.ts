import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { connectToDatabase } from '@/lib/mongodb/client';
import { WatchRoomModel, WatchSignalModel } from './models';
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

const globalForWatchRooms = global as unknown as {
  watchRoomsStore?: Map<string, WatchRoom>;
  watchCleanupInterval?: NodeJS.Timeout;
};

const memoryRooms = globalForWatchRooms.watchRoomsStore || new Map<string, WatchRoom>();
globalForWatchRooms.watchRoomsStore = memoryRooms;

async function getMongo(): Promise<boolean> {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      return true;
    }
  } catch (e) {
    console.warn('[WatchRoomManager] MongoDB Atlas connection warning:', e);
  }
  return false;
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
  static async createRoom(options: {
    roomId?: string;
    hostName: string;
    hostPeerId: string;
    platform?: StreamingPlatform;
    title?: string;
    durationHours?: number;
  }): Promise<SerializedWatchRoom> {
    const now = Date.now();
    const durationHours = options.durationHours || 12;
    const expiresAt = now + durationHours * 60 * 60 * 1000;

    let roomId = options.roomId ? this.cleanRoomId(options.roomId) : this.generateRoomId();
    if (!roomId) roomId = this.generateRoomId();

    const hostName = options.hostName.trim() || 'Host';
    const hostPeerId = options.hostPeerId;
    const hostPeer: WatchPeer = {
      id: hostPeerId,
      displayName: hostName,
      isHost: true,
      joinedAt: now,
      lastSeen: now,
      connected: true,
    };

    const hasMongo = await getMongo();
    if (hasMongo) {
      let roomDoc = await WatchRoomModel.findOne({ roomId });
      if (roomDoc && roomDoc.status === 'active') {
        roomDoc.hostPeerId = hostPeerId;
        roomDoc.hostName = hostName;
        if (options.platform) roomDoc.platform = options.platform;
        if (options.title) roomDoc.title = options.title.trim();
        const existingIdx = roomDoc.peers.findIndex((p) => p.id === hostPeerId);
        if (existingIdx >= 0) {
          roomDoc.peers[existingIdx].displayName = hostName;
          roomDoc.peers[existingIdx].isHost = true;
          roomDoc.peers[existingIdx].connected = true;
          roomDoc.peers[existingIdx].lastSeen = now;
        } else {
          roomDoc.peers.push(hostPeer);
        }
        await roomDoc.save();
        return this.serializeRoom(roomDoc);
      }

      roomDoc = await WatchRoomModel.create({
        roomId,
        title: options.title?.trim() || `${hostName}'s Cinema Room`,
        platform: options.platform || 'other',
        createdAt: now,
        expiresAt,
        hostPeerId,
        hostName,
        isScreenSharing: false,
        status: 'active',
        peers: [hostPeer],
        lastSignalId: 0,
      });

      return this.serializeRoom(roomDoc);
    }

    // Memory / Local Disk Fallback
    const existing = this.getMemoryRoom(roomId);
    if (existing && existing.status === 'active') {
      existing.hostPeerId = hostPeerId;
      existing.hostName = hostName;
      if (options.platform) existing.platform = options.platform;
      if (options.title) existing.title = options.title.trim();
      existing.peers.set(hostPeerId, hostPeer);
      saveRoomToDisk(existing);
      return this.serializeRoom(existing);
    }

    const peersMap = new Map<string, WatchPeer>();
    peersMap.set(hostPeerId, hostPeer);

    const room: WatchRoom = {
      roomId,
      title: options.title?.trim() || `${hostName}'s Cinema Room`,
      platform: options.platform || 'other',
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

    memoryRooms.set(roomId, room);
    saveRoomToDisk(room);
    return this.serializeRoom(room);
  }

  /**
   * Retrieves a room by ID from MongoDB or memory
   */
  static async getRoom(roomId: string): Promise<SerializedWatchRoom | null> {
    if (!roomId) return null;
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId) return null;

    const hasMongo = await getMongo();
    if (hasMongo) {
      const roomDoc = await WatchRoomModel.findOne({ roomId: cleanId });
      if (!roomDoc) return null;
      if (Date.now() >= roomDoc.expiresAt) {
        roomDoc.status = 'closed';
        await roomDoc.save();
      }
      return this.serializeRoom(roomDoc);
    }

    const memRoom = this.getMemoryRoom(cleanId);
    return memRoom ? this.serializeRoom(memRoom) : null;
  }

  /**
   * Internal memory reader
   */
  private static getMemoryRoom(cleanId: string): WatchRoom | null {
    let room = memoryRooms.get(cleanId);
    if (!room) {
      room = loadRoomFromDisk(cleanId) || undefined;
      if (room) {
        memoryRooms.set(cleanId, room);
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
  static async getOrCreateRoom(
    roomId: string,
    defaults?: {
      platform?: StreamingPlatform;
      title?: string;
      hostName?: string;
      hostPeerId?: string;
    }
  ): Promise<SerializedWatchRoom | null> {
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId || !this.isValidRoomId(cleanId)) return null;

    const hasMongo = await getMongo();
    if (hasMongo) {
      let doc = await WatchRoomModel.findOne({ roomId: cleanId });
      if (doc && doc.status !== 'closed') {
        let modified = false;
        if (defaults?.platform && doc.platform === 'other') {
          doc.platform = defaults.platform;
          modified = true;
        }
        if (defaults?.title && (!doc.title || doc.title.startsWith('Watch Room '))) {
          doc.title = defaults.title.trim();
          modified = true;
        }
        if (defaults?.hostName && (!doc.hostName || doc.hostName === 'Host')) {
          doc.hostName = defaults.hostName.trim();
          modified = true;
        }
        if (defaults?.hostPeerId && !doc.hostPeerId) {
          doc.hostPeerId = defaults.hostPeerId;
          modified = true;
        }
        if (modified) await doc.save();
        return this.serializeRoom(doc);
      }

      // Provision new room in Mongo
      const now = Date.now();
      const expiresAt = now + 12 * 60 * 60 * 1000;
      const hostPeerId = defaults?.hostPeerId || '';
      const hostName = defaults?.hostName?.trim() || 'Host';

      const initialPeers = hostPeerId
        ? [
            {
              id: hostPeerId,
              displayName: hostName,
              isHost: true,
              joinedAt: now,
              lastSeen: now,
              connected: true,
            },
          ]
        : [];

      doc = await WatchRoomModel.create({
        roomId: cleanId,
        title: defaults?.title?.trim() || `${hostName}'s Cinema Room`,
        platform: defaults?.platform || 'other',
        createdAt: now,
        expiresAt,
        hostPeerId,
        hostName,
        isScreenSharing: false,
        status: 'active',
        peers: initialPeers,
        lastSignalId: 0,
      });

      return this.serializeRoom(doc);
    }

    // Memory / Local Disk Fallback
    let room = this.getMemoryRoom(cleanId);
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
      return this.serializeRoom(room);
    }

    const now = Date.now();
    const expiresAt = now + 12 * 60 * 60 * 1000;
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

    memoryRooms.set(cleanId, newRoom);
    saveRoomToDisk(newRoom);
    return this.serializeRoom(newRoom);
  }

  /**
   * Joins a user to a room
   */
  static async joinRoom(
    roomId: string,
    peerId: string,
    displayName: string,
    isHost = false
  ): Promise<{ success: boolean; room?: SerializedWatchRoom; error?: string }> {
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId || !this.isValidRoomId(cleanId)) {
      return { success: false, error: 'Invalid room code format.' };
    }

    const hasMongo = await getMongo();
    if (hasMongo) {
      let roomDoc = await WatchRoomModel.findOne({ roomId: cleanId });
      if (!roomDoc) {
        await this.getOrCreateRoom(cleanId, {
          hostName: isHost ? displayName : undefined,
          hostPeerId: isHost ? peerId : undefined,
        });
        roomDoc = await WatchRoomModel.findOne({ roomId: cleanId });
      }

      if (!roomDoc) {
        return { success: false, error: 'Room not found. Please verify the room link or code.' };
      }

      if (roomDoc.status === 'closed') {
        return { success: false, error: 'This Watch Room has been closed or expired.' };
      }

      const now = Date.now();
      const cleanName = displayName.trim() || (isHost ? 'Host' : 'Friend');
      const shouldBeHost = Boolean(isHost || (roomDoc.hostPeerId && roomDoc.hostPeerId === peerId));

      if (isHost) {
        roomDoc.hostPeerId = peerId;
        roomDoc.hostName = cleanName;
      }

      const existingIdx = roomDoc.peers.findIndex((p) => p.id === peerId);
      const peerObj = {
        id: peerId,
        displayName: cleanName,
        isHost: shouldBeHost,
        joinedAt: existingIdx >= 0 ? roomDoc.peers[existingIdx].joinedAt : now,
        lastSeen: now,
        connected: true,
      };

      if (existingIdx >= 0) {
        roomDoc.peers[existingIdx] = peerObj;
      } else {
        roomDoc.peers.push(peerObj);
        await this.postSignal(cleanId, {
          fromPeerId: peerId,
          toPeerId: 'all',
          type: 'peer:join',
          payload: { peer: peerObj },
        });
      }

      await roomDoc.save();

      return {
        success: true,
        room: this.serializeRoom(roomDoc),
      };
    }

    // Memory / Local Disk Fallback
    await this.getOrCreateRoom(cleanId, {
      hostName: isHost ? displayName : undefined,
      hostPeerId: isHost ? peerId : undefined,
    });

    const actualMemRoom = this.getMemoryRoom(cleanId);
    if (!actualMemRoom) {
      return { success: false, error: 'Room not found. Please verify the room link.' };
    }

    if (actualMemRoom.status === 'closed') {
      return { success: false, error: 'This Watch Room has been closed or expired.' };
    }

    const now = Date.now();
    const cleanName = displayName.trim() || (isHost ? 'Host' : 'Friend');
    const shouldBeHost = Boolean(isHost || (actualMemRoom.hostPeerId && actualMemRoom.hostPeerId === peerId));

    if (isHost) {
      actualMemRoom.hostPeerId = peerId;
      actualMemRoom.hostName = cleanName;
    }

    if (actualMemRoom.peers.has(peerId)) {
      const existing = actualMemRoom.peers.get(peerId)!;
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
      actualMemRoom.peers.set(peerId, newPeer);

      await this.postSignal(cleanId, {
        fromPeerId: peerId,
        toPeerId: 'all',
        type: 'peer:join',
        payload: {
          peer: newPeer,
        },
      });
    }

    saveRoomToDisk(actualMemRoom);

    return {
      success: true,
      room: this.serializeRoom(actualMemRoom),
    };
  }

  /**
   * Disconnects a peer from a room
   */
  static async leaveRoom(roomId: string, peerId: string): Promise<boolean> {
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId) return false;

    const hasMongo = await getMongo();
    if (hasMongo) {
      const roomDoc = await WatchRoomModel.findOne({ roomId: cleanId });
      if (!roomDoc) return false;

      const peer = roomDoc.peers.find((p) => p.id === peerId);
      if (peer) {
        peer.connected = false;
        roomDoc.peers = roomDoc.peers.filter((p) => p.id !== peerId);

        await this.postSignal(cleanId, {
          fromPeerId: peerId,
          toPeerId: 'all',
          type: 'peer:leave',
          payload: { peerId, displayName: peer.displayName, isHost: peer.isHost },
        });

        if (peer.isHost) {
          roomDoc.status = 'closed';
          roomDoc.isScreenSharing = false;
          await this.postSignal(cleanId, {
            fromPeerId: peerId,
            toPeerId: 'all',
            type: 'screenshare:stopped',
            payload: { reason: 'Host left the cinema room' },
          });
        }

        await roomDoc.save();
      }
      return true;
    }

    const room = this.getMemoryRoom(cleanId);
    if (!room) return false;

    const peer = room.peers.get(peerId);
    if (peer) {
      peer.connected = false;
      room.peers.delete(peerId);

      await this.postSignal(cleanId, {
        fromPeerId: peerId,
        toPeerId: 'all',
        type: 'peer:leave',
        payload: { peerId, displayName: peer.displayName, isHost: peer.isHost },
      });

      if (peer.isHost) {
        room.status = 'closed';
        await this.postSignal(cleanId, {
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
  static async setScreenSharing(roomId: string, hostPeerId: string, isSharing: boolean): Promise<boolean> {
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId) return false;

    const hasMongo = await getMongo();
    if (hasMongo) {
      let roomDoc = await WatchRoomModel.findOne({ roomId: cleanId });
      if (!roomDoc) {
        await this.getOrCreateRoom(cleanId, { hostPeerId });
        roomDoc = await WatchRoomModel.findOne({ roomId: cleanId });
      }
      if (!roomDoc) return false;

      if (!roomDoc.hostPeerId) roomDoc.hostPeerId = hostPeerId;
      roomDoc.isScreenSharing = isSharing;
      await roomDoc.save();

      await this.postSignal(cleanId, {
        fromPeerId: hostPeerId,
        toPeerId: 'all',
        type: isSharing ? 'screenshare:started' : 'screenshare:stopped',
        payload: { isScreenSharing: isSharing },
      });
      return true;
    }

    const room = this.getMemoryRoom(cleanId);
    if (!room) return false;

    if (!room.hostPeerId) {
      room.hostPeerId = hostPeerId;
    }

    room.isScreenSharing = isSharing;
    await this.postSignal(cleanId, {
      fromPeerId: hostPeerId,
      toPeerId: 'all',
      type: isSharing ? 'screenshare:started' : 'screenshare:stopped',
      payload: { isScreenSharing: isSharing },
    });

    saveRoomToDisk(room);
    return true;
  }

  /**
   * Pushes a signal into the room queue with monotonic signal ID
   */
  static async postSignal(
    roomId: string,
    signal: {
      fromPeerId: string;
      toPeerId?: string;
      type: WatchSignalMessage['type'];
      payload?: any;
    }
  ): Promise<WatchSignalMessage | null> {
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId) return null;

    const hasMongo = await getMongo();
    if (hasMongo) {
      const updateQuery: any = { $inc: { lastSignalId: 1 } };
      if (signal.type === 'screenshare:started') {
        updateQuery.$set = { isScreenSharing: true };
      } else if (signal.type === 'screenshare:stopped') {
        updateQuery.$set = { isScreenSharing: false };
      }

      let updatedRoom = await WatchRoomModel.findOneAndUpdate(
        { roomId: cleanId },
        updateQuery,
        { new: true }
      );

      if (!updatedRoom) {
        await this.getOrCreateRoom(cleanId);
        updatedRoom = await WatchRoomModel.findOneAndUpdate(
          { roomId: cleanId },
          updateQuery,
          { new: true }
        );
      }

      if (!updatedRoom || updatedRoom.status === 'closed') return null;

      const signalId = updatedRoom.lastSignalId;
      const createdSignal = await WatchSignalModel.create({
        roomId: cleanId,
        signalId,
        fromPeerId: signal.fromPeerId,
        toPeerId: signal.toPeerId || 'all',
        type: signal.type,
        payload: signal.payload,
        createdAt: new Date(),
      });

      WatchRoomModel.updateOne(
        { roomId: cleanId, 'peers.id': signal.fromPeerId },
        { $set: { 'peers.$.lastSeen': Date.now(), 'peers.$.connected': true } }
      ).catch(() => {});

      return {
        id: createdSignal.signalId,
        fromPeerId: createdSignal.fromPeerId,
        toPeerId: createdSignal.toPeerId,
        type: createdSignal.type as any,
        payload: createdSignal.payload,
        timestamp: createdSignal.createdAt.getTime(),
      };
    }

    // Memory / Local Disk Fallback
    const room = this.getMemoryRoom(cleanId);
    if (!room || room.status === 'closed') return null;

    if (signal.type === 'screenshare:started') {
      room.isScreenSharing = true;
    } else if (signal.type === 'screenshare:stopped') {
      room.isScreenSharing = false;
    }

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
  static async getSignals(
    roomId: string,
    peerId: string,
    afterId = 0
  ): Promise<{
    signals: WatchSignalMessage[];
    room: SerializedWatchRoom;
  } | null> {
    const cleanId = this.cleanRoomId(roomId);
    if (!cleanId) return null;

    const hasMongo = await getMongo();
    if (hasMongo) {
      let roomDoc = await WatchRoomModel.findOne({ roomId: cleanId }).lean();
      if (!roomDoc) {
        await this.getOrCreateRoom(cleanId);
        roomDoc = await WatchRoomModel.findOne({ roomId: cleanId }).lean();
      }
      if (!roomDoc) return null;

      const signalsDocs = await WatchSignalModel.find({
        roomId: cleanId,
        signalId: { $gt: afterId },
        $or: [{ toPeerId: 'all' }, { toPeerId: peerId }],
        fromPeerId: { $ne: peerId },
      })
        .sort({ signalId: 1 })
        .limit(100)
        .lean();

      WatchRoomModel.updateOne(
        { roomId: cleanId, 'peers.id': peerId },
        { $set: { 'peers.$.lastSeen': Date.now(), 'peers.$.connected': true } }
      ).catch(() => {});

      return {
        signals: signalsDocs.map((s) => ({
          id: s.signalId,
          fromPeerId: s.fromPeerId,
          toPeerId: s.toPeerId,
          type: s.type as any,
          payload: s.payload,
          timestamp: new Date(s.createdAt).getTime(),
        })),
        room: this.serializeRoom(roomDoc),
      };
    }

    // Memory / Local Disk Fallback
    const room = this.getMemoryRoom(cleanId);
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
   * Converts Map-based room or Mongoose doc to JSON-serializable structure
   */
  static serializeRoom(room: any): SerializedWatchRoom {
    if (!room) {
      return {
        roomId: '',
        title: 'Cinema Room',
        platform: 'other',
        createdAt: Date.now(),
        expiresAt: Date.now() + 12 * 3600 * 1000,
        hostPeerId: '',
        hostName: 'Host',
        isScreenSharing: false,
        status: 'active',
        peers: [],
        peerCount: 0,
      };
    }

    let peersList: WatchPeer[] = [];
    if (room.peers instanceof Map) {
      peersList = Array.from(room.peers.values());
    } else if (Array.isArray(room.peers)) {
      peersList = room.peers.map((p: any) => ({
        id: p.id,
        displayName: p.displayName,
        isHost: Boolean(p.isHost),
        joinedAt: typeof p.joinedAt === 'number' ? p.joinedAt : Number(p.joinedAt) || Date.now(),
        lastSeen: typeof p.lastSeen === 'number' ? p.lastSeen : Number(p.lastSeen) || Date.now(),
        connected: Boolean(p.connected),
      }));
    }

    return {
      roomId: room.roomId,
      title: room.title || 'Cinema Room',
      platform: room.platform || 'other',
      createdAt:
        typeof room.createdAt === 'number'
          ? room.createdAt
          : room.createdAt
          ? new Date(room.createdAt).getTime()
          : Date.now(),
      expiresAt:
        typeof room.expiresAt === 'number'
          ? room.expiresAt
          : room.expiresAt
          ? new Date(room.expiresAt).getTime()
          : Date.now() + 12 * 3600 * 1000,
      hostPeerId: room.hostPeerId || '',
      hostName: room.hostName || 'Host',
      isScreenSharing: Boolean(room.isScreenSharing),
      status: room.status || 'active',
      peers: peersList,
      peerCount: peersList.length,
    };
  }
}
