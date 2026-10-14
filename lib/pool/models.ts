import mongoose, { Schema, Model, Document } from 'mongoose';
import { PoolGameDoc, PlayerInfo, BallState, ShotParams } from './types';

export interface IPoolGameDocument extends Document, Omit<PoolGameDoc, 'gameId'> {
  gameId: string;
  expiresAt?: Date;
}

const PlayerInfoSchema = new Schema<PlayerInfo>(
  {
    id: { type: String, default: '' },
    name: { type: String, default: 'Player' },
    avatar: { type: String, default: 'fiddler' },
    group: { type: String, enum: ['solids', 'stripes', 'unassigned'], default: 'unassigned' },
    connected: { type: Boolean, default: true },
    lastSeen: { type: Number, default: Date.now },
  },
  { _id: false }
);

const BallStateSchema = new Schema<BallState>(
  {
    id: { type: Number, required: true },
    number: { type: Number, required: true },
    type: { type: String, enum: ['cue', 'solid', 'stripe', '8ball'], required: true },
    color: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    vx: { type: Number, default: 0 },
    vy: { type: Number, default: 0 },
    isPocketed: { type: Boolean, default: false },
    pocketedOrder: { type: Number, default: -1 },
  },
  { _id: false }
);

const ShotParamsSchema = new Schema<ShotParams>(
  {
    angle: { type: Number, required: true },
    power: { type: Number, required: true },
    spinX: { type: Number, default: 0 },
    spinY: { type: Number, default: 0 },
    cueX: { type: Number },
    cueY: { type: Number },
    timestamp: { type: Number, default: Date.now },
  },
  { _id: false }
);

const PoolGameSchema = new Schema<IPoolGameDocument>(
  {
    gameId: { type: String, required: true, unique: true, index: true },
    player1: { type: PlayerInfoSchema, required: true },
    player2: { type: PlayerInfoSchema, required: true },
    currentTurn: { type: String, enum: ['player1', 'player2'], default: 'player1' },
    status: {
      type: String,
      enum: ['waiting', 'active', 'finished'],
      default: 'waiting',
      index: true,
    },
    winner: { type: String, enum: ['player1', 'player2', null], default: null },
    winnerReason: { type: String, default: '' },
    balls: { type: [BallStateSchema], default: [] },
    pocketedOrder: { type: [Number], default: [] },
    selectedTimeControl: { type: Number, default: 30 },
    turnTimerRemaining: { type: Number, default: 30 },
    lastShotTimestamp: { type: Number, default: Date.now },
    lastShot: { type: ShotParamsSchema, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

export const PoolGameModel: Model<IPoolGameDocument> =
  mongoose.models.PoolGame || mongoose.model<IPoolGameDocument>('PoolGame', PoolGameSchema);
