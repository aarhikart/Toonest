import mongoose, { Schema, Model, Document } from 'mongoose';
import { ChessGameDoc, PlayerInfo, ChessMoveRecord } from './types';

export interface IChessGameDocument extends Document, Omit<ChessGameDoc, 'gameId'> {
  gameId: string;
}

const PlayerInfoSchema = new Schema<PlayerInfo>(
  {
    id: { type: String, default: '' },
    name: { type: String, default: 'Anonymous' },
    connected: { type: Boolean, default: true },
    lastSeen: { type: Number, default: Date.now },
  },
  { _id: false }
);

const ChessMoveRecordSchema = new Schema<ChessMoveRecord>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    promotion: { type: String },
    san: { type: String, required: true },
    piece: { type: String, required: true },
    color: { type: String, enum: ['w', 'b'], required: true },
    captured: { type: String },
    fen: { type: String, required: true },
    timestamp: { type: Number, default: Date.now },
  },
  { _id: false }
);

const ChessGameSchema = new Schema<IChessGameDocument>(
  {
    gameId: { type: String, required: true, unique: true, index: true },
    whitePlayer: { type: PlayerInfoSchema, required: true },
    blackPlayer: { type: PlayerInfoSchema, required: true },
    creatorColor: { type: String, default: 'white' },
    status: {
      type: String,
      enum: ['waiting', 'active', 'checkmate', 'stalemate', 'draw', 'resigned', 'timeout', 'abandoned'],
      default: 'waiting',
      index: true,
    },
    currentTurn: { type: String, enum: ['w', 'b'], default: 'w' },
    initialPosition: { type: String, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    currentPosition: { type: String, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
    moveHistory: { type: [ChessMoveRecordSchema], default: [] },
    selectedTimeControl: { type: Number, default: 600 },
    whiteTimeRemaining: { type: Number, default: 600000 },
    blackTimeRemaining: { type: Number, default: 600000 },
    lastMoveTimestamp: { type: Number, default: Date.now },
    winner: { type: String, default: null },
    resultReason: { type: String, default: '' },
    drawOfferFrom: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), index: { expires: 0 } },
  },
  {
    timestamps: true,
  }
);

export const ChessGameModel: Model<IChessGameDocument> =
  mongoose.models.ChessGame || mongoose.model<IChessGameDocument>('ChessGame', ChessGameSchema);
