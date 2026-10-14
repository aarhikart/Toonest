export type BallType = 'cue' | 'solid' | 'stripe' | '8ball';

export type PlayerGroup = 'solids' | 'stripes' | 'unassigned';

export type PlayerRole = 'player1' | 'player2' | 'spectator';

export type GameMode = 'bot' | 'friend' | 'practice';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface BallState {
  id: number; // 0: cue, 1-7: solids, 8: eight-ball, 9-15: stripes
  number: number;
  type: BallType;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPocketed: boolean;
  pocketedOrder: number;
}

export interface ShotParams {
  angle: number; // In radians
  power: number; // 0 to 100
  spinX: number; // -1 to 1 (left/right english)
  spinY: number; // -1 to 1 (top/back spin)
  cueX?: number;
  cueY?: number;
  timestamp?: number;
}

export interface PlayerInfo {
  id: string; // Token
  name: string;
  avatar: string;
  group: PlayerGroup;
  connected: boolean;
  lastSeen: number;
}

export interface PoolGameDoc {
  gameId: string;
  player1: PlayerInfo;
  player2: PlayerInfo;
  currentTurn: 'player1' | 'player2';
  status: 'waiting' | 'active' | 'finished';
  winner: 'player1' | 'player2' | null;
  winnerReason: string;
  balls: BallState[];
  pocketedOrder: number[]; // Array of ball IDs in order pocketed
  selectedTimeControl: number; // Seconds per turn, e.g. 30
  turnTimerRemaining: number;
  lastShotTimestamp: number;
  lastShot: ShotParams | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
