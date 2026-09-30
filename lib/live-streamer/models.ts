import mongoose, { Schema, Model, Document } from 'mongoose';

export type StreamStatus = 'READY' | 'STARTING' | 'LIVE' | 'STOPPING' | 'STOPPED' | 'ERROR';
export type StreamTarget = 'facebook' | 'instagram' | 'both';

export interface IDestinationConfig {
  platform: 'facebook' | 'instagram';
  rtmpUrl: string;
  streamKey: string;
  liveVideoId?: string;
}

export interface IStreamLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface IStreamHealth {
  status: 'healthy' | 'warning' | 'error' | 'idle';
  fps: number;
  bitrate: string;
  duration: string;
  speed: string;
  droppedFrames: number;
}

export interface ILiveStreamSessionDoc extends Document {
  streamId: string;
  youtubeUrl: string;
  sourceTitle?: string;
  target: StreamTarget;
  destinations: IDestinationConfig[];
  scheduledStartTime?: Date | null;
  status: StreamStatus;
  health: IStreamHealth;
  startedAt?: Date | null;
  stoppedAt?: Date | null;
  errorMessage?: string;
  logs: IStreamLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IConnectedSocialAccountDoc extends Document {
  platform: 'facebook' | 'instagram';
  accountId?: string;
  accountName: string;
  avatarUrl?: string;
  rtmpUrl: string;
  streamKey: string;
  accessToken?: string;
  isConnected: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationConfigSchema = new Schema<IDestinationConfig>(
  {
    platform: { type: String, enum: ['facebook', 'instagram'], required: true },
    rtmpUrl: { type: String, required: true },
    streamKey: { type: String, required: true },
    liveVideoId: { type: String },
  },
  { _id: false }
);

const StreamLogSchema = new Schema<IStreamLog>(
  {
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
    message: { type: String, required: true },
  },
  { _id: false }
);

const StreamHealthSchema = new Schema<IStreamHealth>(
  {
    status: { type: String, enum: ['healthy', 'warning', 'error', 'idle'], default: 'idle' },
    fps: { type: Number, default: 0 },
    bitrate: { type: String, default: '0kbits/s' },
    duration: { type: String, default: '00:00:00' },
    speed: { type: String, default: '0x' },
    droppedFrames: { type: Number, default: 0 },
  },
  { _id: false }
);

const LiveStreamSessionSchema = new Schema<ILiveStreamSessionDoc>(
  {
    streamId: { type: String, required: true, unique: true, index: true },
    youtubeUrl: { type: String, required: true },
    sourceTitle: { type: String, default: 'YouTube Live Source' },
    target: { type: String, enum: ['facebook', 'instagram', 'both'], required: true },
    destinations: [DestinationConfigSchema],
    scheduledStartTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ['READY', 'STARTING', 'LIVE', 'STOPPING', 'STOPPED', 'ERROR'],
      default: 'READY',
      index: true,
    },
    health: { type: StreamHealthSchema, default: () => ({}) },
    startedAt: { type: Date, default: null },
    stoppedAt: { type: Date, default: null },
    errorMessage: { type: String, default: '' },
    logs: [StreamLogSchema],
  },
  { timestamps: true }
);

const ConnectedSocialAccountSchema = new Schema<IConnectedSocialAccountDoc>(
  {
    platform: { type: String, enum: ['facebook', 'instagram'], required: true, unique: true, index: true },
    accountId: { type: String, default: '' },
    accountName: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    rtmpUrl: { type: String, default: '' },
    streamKey: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    isConnected: { type: Boolean, default: false },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const LiveStreamSessionModel: Model<ILiveStreamSessionDoc> =
  (mongoose.models && (mongoose.models.LiveStreamSession as Model<ILiveStreamSessionDoc>)) ||
  mongoose.model<ILiveStreamSessionDoc>('LiveStreamSession', LiveStreamSessionSchema);

export const ConnectedSocialAccountModel: Model<IConnectedSocialAccountDoc> =
  (mongoose.models && (mongoose.models.ConnectedSocialAccount as Model<IConnectedSocialAccountDoc>)) ||
  mongoose.model<IConnectedSocialAccountDoc>('ConnectedSocialAccount', ConnectedSocialAccountSchema);
