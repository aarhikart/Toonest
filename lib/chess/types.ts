export type ChessDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export type ChessColor = 'white' | 'black';

export type PlayerColorPreference = 'white' | 'black' | 'random';

export type TimeControl = 0 | 60 | 180 | 300 | 600 | 900 | 1800; // in seconds

export type GameStatus =
  | 'waiting'
  | 'active'
  | 'checkmate'
  | 'stalemate'
  | 'draw'
  | 'resigned'
  | 'timeout'
  | 'abandoned';

export type GameMode = 'bot' | 'friend';

export interface ChessMoveRecord {
  from: string;
  to: string;
  promotion?: string;
  san: string;
  piece: string;
  color: 'w' | 'b';
  captured?: string;
  fen: string;
  timestamp: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  connected: boolean;
  lastSeen: number;
}

export interface ChessGameDoc {
  gameId: string;
  whitePlayer: PlayerInfo;
  blackPlayer: PlayerInfo;
  creatorColor: PlayerColorPreference;
  status: GameStatus;
  currentTurn: 'w' | 'b';
  initialPosition: string;
  currentPosition: string;
  moveHistory: ChessMoveRecord[];
  selectedTimeControl: number; // in seconds, 0 = no timer
  whiteTimeRemaining: number; // in milliseconds
  blackTimeRemaining: number; // in milliseconds
  lastMoveTimestamp: number;
  winner: 'white' | 'black' | 'draw' | null;
  resultReason: string;
  drawOfferFrom: 'white' | 'black' | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface LegalMoveTarget {
  to: string;
  isCapture: boolean;
  promotion?: boolean;
}

export interface BotMoveResult {
  from: string;
  to: string;
  promotion?: string;
  evaluation?: number;
}
