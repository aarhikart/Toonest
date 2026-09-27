import mongoose, { Schema, Model, Document } from 'mongoose';
import { StreamingPlatform } from './types';

export interface IWatchPeerDoc {
  id: string;
  displayName: string;
  isHost: boolean;
  joinedAt: number;
  lastSeen: number;
  connected: boolean;
}

export interface IWatchRoomDoc extends Document {
  roomId: string;
  title: string;
  platform: StreamingPlatform;
  createdAt: number;
  expiresAt: number;
  hostPeerId: string;
  hostName: string;
  isScreenSharing: boolean;
  status: 'active' | 'closed';
  peers: IWatchPeerDoc[];
  lastSignalId: number;
  updatedAt: Date;
}

export interface IWatchSignalDoc extends Document {
  roomId: string;
  signalId: number;
  fromPeerId: string;
  toPeerId: string;
  type: string;
  payload: any;
  createdAt: Date;
}

const WatchPeerSchema = new Schema<IWatchPeerDoc>(
  {
    id: { type: String, required: true },
    displayName: { type: String, required: true },
    isHost: { type: Boolean, default: false },
    joinedAt: { type: Number, default: Date.now },
    lastSeen: { type: Number, default: Date.now },
    connected: { type: Boolean, default: true },
  },
  { _id: false }
);

const WatchRoomSchema = new Schema<IWatchRoomDoc>(
  {
    roomId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: 'Cinema Room' },
    platform: { type: String, default: 'other' },
    createdAt: { type: Number, default: Date.now },
    expiresAt: { type: Number, default: () => Date.now() + 24 * 60 * 60 * 1000 },
    hostPeerId: { type: String, default: '' },
    hostName: { type: String, default: 'Host' },
    isScreenSharing: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
    peers: [WatchPeerSchema],
    lastSignalId: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const WatchSignalSchema = new Schema<IWatchSignalDoc>(
  {
    roomId: { type: String, required: true, index: true },
    signalId: { type: Number, required: true, index: true },
    fromPeerId: { type: String, required: true },
    toPeerId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, expires: 1800 }, // Auto delete signals after 30 mins
  }
);

// Compound index for fast signal retrieval
WatchSignalSchema.index({ roomId: 1, signalId: 1, toPeerId: 1 });

export const WatchRoomModel: Model<IWatchRoomDoc> =
  (mongoose.models && mongoose.models.WatchRoom) ||
  mongoose.model<IWatchRoomDoc>('WatchRoom', WatchRoomSchema);

export const WatchSignalModel: Model<IWatchSignalDoc> =
  (mongoose.models && mongoose.models.WatchSignal) ||
  mongoose.model<IWatchSignalDoc>('WatchSignal', WatchSignalSchema);
