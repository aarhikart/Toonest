import { Chess } from 'chess.js';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/mongodb/client';
import { ChessGameModel, IChessGameDocument } from './models';
import {
  ChessColor,
  PlayerColorPreference,
  TimeControl,
  ChessGameDoc,
  ChessMoveRecord,
  PlayerInfo,
} from './types';

// Global Event Emitter for SSE real-time broadcasting
type GameListener = (event: { type: string; data: any }) => void;
const gameListeners = new Map<string, Set<GameListener>>();

export function subscribeToGameEvents(gameId: string, listener: GameListener): () => void {
  if (!gameListeners.has(gameId)) {
    gameListeners.set(gameId, new Set());
  }
  gameListeners.get(gameId)!.add(listener);

  return () => {
    const set = gameListeners.get(gameId);
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        gameListeners.delete(gameId);
      }
    }
  };
}

export function broadcastGameEvent(gameId: string, type: string, data: any) {
  const listeners = gameListeners.get(gameId);
  if (listeners) {
    listeners.forEach((fn) => {
      try {
        fn({ type, data });
      } catch (e) {
        console.error('[ChessSSE] Error dispatching event:', e);
      }
    });
  }
}

function generateGameId(): string {
  return 'g_' + crypto.randomBytes(4).toString('hex');
}

function generatePlayerToken(): string {
  return 'ptk_' + crypto.randomBytes(16).toString('hex');
}

/**
 * Creates a new multiplayer friend game
 */
export async function createMultiplayerGame({
  creatorColor,
  timeControl,
  creatorName = 'Player 1',
}: {
  creatorColor: PlayerColorPreference;
  timeControl: TimeControl;
  creatorName?: string;
}): Promise<{ gameId: string; playerToken: string; assignedColor: ChessColor }> {
  await connectToDatabase();

  const gameId = generateGameId();
  const playerToken = generatePlayerToken();

  let assignedColor: ChessColor;
  if (creatorColor === 'random') {
    assignedColor = Math.random() < 0.5 ? 'white' : 'black';
  } else {
    assignedColor = creatorColor;
  }

  const timeMs = timeControl > 0 ? timeControl * 1000 : 0;

  const whitePlayer: PlayerInfo =
    assignedColor === 'white'
      ? { id: playerToken, name: creatorName || 'White', connected: true, lastSeen: Date.now() }
      : { id: '', name: 'Waiting for friend...', connected: false, lastSeen: 0 };

  const blackPlayer: PlayerInfo =
    assignedColor === 'black'
      ? { id: playerToken, name: creatorName || 'Black', connected: true, lastSeen: Date.now() }
      : { id: '', name: 'Waiting for friend...', connected: false, lastSeen: 0 };

  const game = await ChessGameModel.create({
    gameId,
    whitePlayer,
    blackPlayer,
    creatorColor,
    status: 'waiting',
    currentTurn: 'w',
    initialPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    currentPosition: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    moveHistory: [],
    selectedTimeControl: timeControl,
    whiteTimeRemaining: timeMs,
    blackTimeRemaining: timeMs,
    lastMoveTimestamp: Date.now(),
    winner: null,
    resultReason: '',
    drawOfferFrom: null,
  });

  return {
    gameId,
    playerToken,
    assignedColor,
  };
}

/**
 * Fetches game state and handles joining or clock expiration
 */
export async function getOrJoinGame(
  gameId: string,
  playerToken?: string,
  joinName?: string
): Promise<{
  game: ChessGameDoc;
  playerColor: ChessColor | 'spectator';
  newToken?: string;
} | null> {
  await connectToDatabase();

  let doc = await ChessGameModel.findOne({ gameId });
  if (!doc) return null;

  let playerColor: ChessColor | 'spectator' = 'spectator';
  let newToken: string | undefined = undefined;

  // Check if player owns one of the seats
  if (playerToken) {
    if (doc.whitePlayer.id === playerToken) {
      playerColor = 'white';
      doc.whitePlayer.connected = true;
      doc.whitePlayer.lastSeen = Date.now();
    } else if (doc.blackPlayer.id === playerToken) {
      playerColor = 'black';
      doc.blackPlayer.connected = true;
      doc.blackPlayer.lastSeen = Date.now();
    }
  }

  // If slot is available and user is not seated, join!
  if (playerColor === 'spectator' && doc.status === 'waiting') {
    const freshToken = generatePlayerToken();
    newToken = freshToken;

    if (!doc.whitePlayer.id) {
      doc.whitePlayer = {
        id: freshToken,
        name: joinName || 'Player 2 (White)',
        connected: true,
        lastSeen: Date.now(),
      };
      playerColor = 'white';
    } else if (!doc.blackPlayer.id) {
      doc.blackPlayer = {
        id: freshToken,
        name: joinName || 'Player 2 (Black)',
        connected: true,
        lastSeen: Date.now(),
      };
      playerColor = 'black';
    }

    // Both players joined -> Game becomes active!
    if (doc.whitePlayer.id && doc.blackPlayer.id) {
      doc.status = 'active';
      doc.lastMoveTimestamp = Date.now();
    }

    await doc.save();
    broadcastGameEvent(gameId, 'player_joined', {
      game: doc.toObject(),
    });
  }

  // Handle active game clock and timeouts
  if (doc.status === 'active' && doc.selectedTimeControl > 0) {
    const now = Date.now();
    const elapsed = Math.max(0, now - doc.lastMoveTimestamp);

    if (doc.currentTurn === 'w') {
      const remaining = Math.max(0, doc.whiteTimeRemaining - elapsed);
      if (remaining <= 0) {
        doc.status = 'timeout';
        doc.whiteTimeRemaining = 0;
        doc.winner = 'black';
        doc.resultReason = 'White ran out of time';
        await doc.save();
        broadcastGameEvent(gameId, 'game_over', { game: doc.toObject() });
      }
    } else {
      const remaining = Math.max(0, doc.blackTimeRemaining - elapsed);
      if (remaining <= 0) {
        doc.status = 'timeout';
        doc.blackTimeRemaining = 0;
        doc.winner = 'white';
        doc.resultReason = 'Black ran out of time';
        await doc.save();
        broadcastGameEvent(gameId, 'game_over', { game: doc.toObject() });
      }
    }
  }

  return {
    game: doc.toObject() as ChessGameDoc,
    playerColor,
    newToken,
  };
}

/**
 * Validates and executes an authoritative move on the server
 */
export async function makeServerMove({
  gameId,
  playerToken,
  from,
  to,
  promotion,
}: {
  gameId: string;
  playerToken: string;
  from: string;
  to: string;
  promotion?: string;
}): Promise<{ success: boolean; game?: ChessGameDoc; error?: string }> {
  await connectToDatabase();

  const doc = await ChessGameModel.findOne({ gameId });
  if (!doc) {
    return { success: false, error: 'Game not found.' };
  }

  if (doc.status !== 'active' && doc.status !== 'waiting') {
    return { success: false, error: 'Game is not active.' };
  }

  // Verify player identity
  let playerColor: ChessColor | null = null;
  if (doc.whitePlayer.id === playerToken) playerColor = 'white';
  else if (doc.blackPlayer.id === playerToken) playerColor = 'black';

  if (!playerColor) {
    return { success: false, error: 'You are not a player in this game.' };
  }

  // Verify turn
  const expectedTurn = doc.currentTurn === 'w' ? 'white' : 'black';
  if (playerColor !== expectedTurn) {
    return { success: false, error: 'It is not your turn.' };
  }

  // Calculate authoritative clock deduction
  const now = Date.now();
  if (doc.selectedTimeControl > 0) {
    const elapsed = Math.max(0, now - doc.lastMoveTimestamp);
    if (playerColor === 'white') {
      doc.whiteTimeRemaining = Math.max(0, doc.whiteTimeRemaining - elapsed);
      if (doc.whiteTimeRemaining <= 0) {
        doc.status = 'timeout';
        doc.winner = 'black';
        doc.resultReason = 'White ran out of time';
        await doc.save();
        broadcastGameEvent(gameId, 'game_over', { game: doc.toObject() });
        return { success: false, error: 'Time expired.' };
      }
    } else {
      doc.blackTimeRemaining = Math.max(0, doc.blackTimeRemaining - elapsed);
      if (doc.blackTimeRemaining <= 0) {
        doc.status = 'timeout';
        doc.winner = 'white';
        doc.resultReason = 'Black ran out of time';
        await doc.save();
        broadcastGameEvent(gameId, 'game_over', { game: doc.toObject() });
        return { success: false, error: 'Time expired.' };
      }
    }
  }

  // Validate move with chess.js
  const chess = new Chess(doc.currentPosition);
  let moveResult: any = null;

  try {
    moveResult = chess.move({
      from,
      to,
      promotion: promotion || 'q',
    });
  } catch (err: any) {
    return { success: false, error: err?.message || 'Illegal chess move.' };
  }

  if (!moveResult) {
    return { success: false, error: 'Illegal chess move.' };
  }

  // Record move
  const moveRecord: ChessMoveRecord = {
    from: moveResult.from,
    to: moveResult.to,
    promotion: moveResult.promotion || undefined,
    san: moveResult.san,
    piece: moveResult.piece,
    color: moveResult.color,
    captured: moveResult.captured || undefined,
    fen: chess.fen(),
    timestamp: now,
  };

  doc.moveHistory.push(moveRecord);
  doc.currentPosition = chess.fen();
  doc.currentTurn = chess.turn();
  doc.lastMoveTimestamp = now;
  doc.drawOfferFrom = null; // Any move cancels an open draw offer
  if (doc.status === 'waiting') {
    doc.status = 'active';
  }

  // Check Game End Conditions
  if (chess.isCheckmate()) {
    doc.status = 'checkmate';
    doc.winner = playerColor;
    doc.resultReason = `${playerColor === 'white' ? 'White' : 'Black'} won by checkmate`;
  } else if (chess.isStalemate()) {
    doc.status = 'stalemate';
    doc.winner = 'draw';
    doc.resultReason = 'Draw by stalemate';
  } else if (chess.isThreefoldRepetition()) {
    doc.status = 'draw';
    doc.winner = 'draw';
    doc.resultReason = 'Draw by threefold repetition';
  } else if (chess.isInsufficientMaterial()) {
    doc.status = 'draw';
    doc.winner = 'draw';
    doc.resultReason = 'Draw by insufficient material';
  } else if (chess.isDraw()) {
    doc.status = 'draw';
    doc.winner = 'draw';
    doc.resultReason = 'Draw (50-move rule)';
  }

  await doc.save();

  const updatedGame = doc.toObject() as ChessGameDoc;
  broadcastGameEvent(gameId, 'move_made', {
    move: moveRecord,
    game: updatedGame,
  });

  if (doc.status !== 'active') {
    broadcastGameEvent(gameId, 'game_over', { game: updatedGame });
  }

  return {
    success: true,
    game: updatedGame,
  };
}

/**
 * Handles Resignation
 */
export async function resignGame({
  gameId,
  playerToken,
}: {
  gameId: string;
  playerToken: string;
}): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const doc = await ChessGameModel.findOne({ gameId });
  if (!doc) return { success: false, error: 'Game not found.' };
  if (doc.status !== 'active') return { success: false, error: 'Game is not active.' };

  let resignColor: ChessColor | null = null;
  if (doc.whitePlayer.id === playerToken) resignColor = 'white';
  else if (doc.blackPlayer.id === playerToken) resignColor = 'black';

  if (!resignColor) return { success: false, error: 'Unauthorized.' };

  doc.status = 'resigned';
  doc.winner = resignColor === 'white' ? 'black' : 'white';
  doc.resultReason = `${resignColor === 'white' ? 'White' : 'Black'} resigned`;

  await doc.save();
  broadcastGameEvent(gameId, 'game_over', { game: doc.toObject() });

  return { success: true };
}

/**
 * Handles Draw Offers
 */
export async function handleDraw({
  gameId,
  playerToken,
  action,
}: {
  gameId: string;
  playerToken: string;
  action: 'offer' | 'accept' | 'decline';
}): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();

  const doc = await ChessGameModel.findOne({ gameId });
  if (!doc) return { success: false, error: 'Game not found.' };
  if (doc.status !== 'active') return { success: false, error: 'Game is not active.' };

  let playerColor: ChessColor | null = null;
  if (doc.whitePlayer.id === playerToken) playerColor = 'white';
  else if (doc.blackPlayer.id === playerToken) playerColor = 'black';

  if (!playerColor) return { success: false, error: 'Unauthorized.' };

  if (action === 'offer') {
    doc.drawOfferFrom = playerColor;
    await doc.save();
    broadcastGameEvent(gameId, 'draw_offered', { from: playerColor });
    return { success: true };
  }

  if (action === 'decline') {
    doc.drawOfferFrom = null;
    await doc.save();
    broadcastGameEvent(gameId, 'draw_declined', { from: playerColor });
    return { success: true };
  }

  if (action === 'accept') {
    if (!doc.drawOfferFrom || doc.drawOfferFrom === playerColor) {
      return { success: false, error: 'No open draw offer to accept.' };
    }

    doc.status = 'draw';
    doc.winner = 'draw';
    doc.resultReason = 'Draw by mutual agreement';
    doc.drawOfferFrom = null;

    await doc.save();
    broadcastGameEvent(gameId, 'game_over', { game: doc.toObject() });
    return { success: true };
  }

  return { success: false, error: 'Invalid action.' };
}
