import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb/client';
import { PoolGameModel } from './models';
import { PoolGameDoc, BallState, ShotParams, PlayerInfo, PlayerGroup, PlayerRole } from './types';

// Global Event Emitter for SSE real-time broadcasting
type PoolEventListener = (event: { type: string; data: any }) => void;
const poolGameListeners = new Map<string, Set<PoolEventListener>>();

// In-memory fallback cache if MongoDB is unreachable
const memoryGameStore = new Map<string, PoolGameDoc>();

export function subscribeToPoolEvents(gameId: string, listener: PoolEventListener): () => void {
  if (!poolGameListeners.has(gameId)) {
    poolGameListeners.set(gameId, new Set());
  }
  poolGameListeners.get(gameId)!.add(listener);

  return () => {
    const set = poolGameListeners.get(gameId);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        poolGameListeners.delete(gameId);
      }
    }
  };
}

export function broadcastPoolEvent(gameId: string, type: string, data: any) {
  const listeners = poolGameListeners.get(gameId);
  if (listeners) {
    listeners.forEach((fn) => {
      try {
        fn({ type, data });
      } catch (e) {
        console.error('[PoolSSE] Error dispatching event:', e);
      }
    });
  }
}

function generateGameId(): string {
  return 'p_' + crypto.randomBytes(4).toString('hex');
}

function generatePlayerToken(): string {
  return 'ptk_' + crypto.randomBytes(16).toString('hex');
}

import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  CUSHION,
  BALL_RADIUS,
  POCKET_LOCATIONS,
  BALL_COLORS,
  getInitialBallRack,
} from './constants';

export {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  CUSHION,
  BALL_RADIUS,
  POCKET_LOCATIONS,
  BALL_COLORS,
  getInitialBallRack,
};

/**
 * Create a new multiplayer 8-ball pool room
 */
export async function createMultiplayerPoolGame({
  creatorName = 'Interactive Fiddler',
  timeControl = 30,
}: {
  creatorName?: string;
  timeControl?: number;
}): Promise<{ gameId: string; playerToken: string }> {
  const gameId = generateGameId();
  const playerToken = generatePlayerToken();

  const initialBalls = getInitialBallRack();

  const gameDoc: PoolGameDoc = {
    gameId,
    player1: {
      id: playerToken,
      name: creatorName,
      avatar: 'fiddler',
      group: 'unassigned',
      connected: true,
      lastSeen: Date.now(),
    },
    player2: {
      id: '',
      name: 'Waiting for friend...',
      avatar: 'reindeer',
      group: 'unassigned',
      connected: false,
      lastSeen: 0,
    },
    currentTurn: 'player1',
    status: 'waiting',
    winner: null,
    winnerReason: '',
    balls: initialBalls,
    pocketedOrder: [],
    selectedTimeControl: timeControl,
    turnTimerRemaining: timeControl,
    lastShotTimestamp: Date.now(),
    lastShot: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryGameStore.set(gameId, gameDoc);

  try {
    await connectToDatabase();
    await PoolGameModel.create(gameDoc);
  } catch (err) {
    console.warn('[PoolGame] MongoDB write fallback to in-memory store:', (err as any)?.message);
  }

  return { gameId, playerToken };
}

/**
 * Fetch or Join a Pool Game Room
 */
export async function getOrJoinPoolGame(
  gameId: string,
  playerToken?: string,
  joinName: string = 'Vivid Reindeer'
): Promise<{ game: PoolGameDoc; playerRole: PlayerRole; newToken?: string } | null> {
  let doc: PoolGameDoc | null = memoryGameStore.get(gameId) || null;

  try {
    await connectToDatabase();
    const dbDoc = await PoolGameModel.findOne({ gameId });
    if (dbDoc) {
      doc = dbDoc.toObject() as PoolGameDoc;
      memoryGameStore.set(gameId, doc);
    }
  } catch (_) {}

  if (!doc) return null;

  let playerRole: PlayerRole = 'spectator';
  let newToken: string | undefined = undefined;

  // Check seat ownership
  if (playerToken) {
    if (doc.player1.id === playerToken) {
      playerRole = 'player1';
      doc.player1.connected = true;
      doc.player1.lastSeen = Date.now();
    } else if (doc.player2.id === playerToken) {
      playerRole = 'player2';
      doc.player2.connected = true;
      doc.player2.lastSeen = Date.now();
    }
  }

  // Seat opponent if player2 is open
  if (playerRole === 'spectator' && doc.status === 'waiting' && !doc.player2.id) {
    const freshToken = generatePlayerToken();
    newToken = freshToken;
    playerRole = 'player2';

    doc.player2 = {
      id: freshToken,
      name: joinName,
      avatar: 'reindeer',
      group: 'unassigned',
      connected: true,
      lastSeen: Date.now(),
    };
    doc.status = 'active';
    doc.lastShotTimestamp = Date.now();

    memoryGameStore.set(gameId, doc);

    try {
      await connectToDatabase();
      await PoolGameModel.updateOne(
        { gameId },
        { $set: { player2: doc.player2, status: 'active', lastShotTimestamp: Date.now() } }
      );
    } catch (_) {}

    broadcastPoolEvent(gameId, 'player_joined', { game: doc });
  }

  return { game: doc, playerRole, newToken };
}

/**
 * Record a shot taken by a player & broadcast physics parameters to opponent
 */
export async function recordPoolShot({
  gameId,
  playerToken,
  shot,
  resultingBalls,
  pocketedDelta,
  nextTurn,
  winner,
  winnerReason,
  player1Group,
  player2Group,
}: {
  gameId: string;
  playerToken: string;
  shot: ShotParams;
  resultingBalls?: BallState[];
  pocketedDelta?: number[];
  nextTurn?: 'player1' | 'player2';
  winner?: 'player1' | 'player2' | null;
  winnerReason?: string;
  player1Group?: PlayerGroup;
  player2Group?: PlayerGroup;
}): Promise<{ success: boolean; game?: PoolGameDoc; error?: string }> {
  let doc = memoryGameStore.get(gameId) || null;

  try {
    await connectToDatabase();
    const dbDoc = await PoolGameModel.findOne({ gameId });
    if (dbDoc) doc = dbDoc.toObject() as PoolGameDoc;
  } catch (_) {}

  if (!doc) return { success: false, error: 'Game not found.' };

  const isP1 = doc.player1.id === playerToken;
  const isP2 = doc.player2.id === playerToken;

  if (!isP1 && !isP2) {
    return { success: false, error: 'Unauthorized player token.' };
  }

  const role = isP1 ? 'player1' : 'player2';
  if (doc.status === 'active' && doc.currentTurn !== role) {
    return { success: false, error: 'Not your turn.' };
  }

  // Update game state
  doc.lastShot = shot;
  doc.lastShotTimestamp = Date.now();
  if (resultingBalls) doc.balls = resultingBalls;
  if (pocketedDelta && pocketedDelta.length > 0) {
    doc.pocketedOrder = [...(doc.pocketedOrder || []), ...pocketedDelta];
  }
  if (nextTurn) doc.currentTurn = nextTurn;
  if (winner) {
    doc.winner = winner;
    doc.winnerReason = winnerReason || 'Game Won!';
    doc.status = 'finished';
  }
  if (player1Group) doc.player1.group = player1Group;
  if (player2Group) doc.player2.group = player2Group;

  memoryGameStore.set(gameId, doc);

  try {
    await connectToDatabase();
    await PoolGameModel.updateOne(
      { gameId },
      {
        $set: {
          lastShot: doc.lastShot,
          lastShotTimestamp: doc.lastShotTimestamp,
          balls: doc.balls,
          pocketedOrder: doc.pocketedOrder,
          currentTurn: doc.currentTurn,
          winner: doc.winner,
          winnerReason: doc.winnerReason,
          status: doc.status,
          'player1.group': doc.player1.group,
          'player2.group': doc.player2.group,
        },
      }
    );
  } catch (_) {}

  // Broadcast real-time shot to opponent
  broadcastPoolEvent(gameId, 'shot_taken', {
    shot,
    shooter: role,
    resultingBalls: doc.balls,
    pocketedDelta,
    nextTurn: doc.currentTurn,
    winner: doc.winner,
    winnerReason: doc.winnerReason,
    player1Group: doc.player1.group,
    player2Group: doc.player2.group,
  });

  return { success: true, game: doc };
}
