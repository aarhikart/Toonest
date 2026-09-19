import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  businessName: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  businessName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  role: { type: String, default: 'user', enum: ['admin', 'user'] },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  createdAt: { type: Date, default: Date.now }
});

export interface ICampaignLog {
  id?: string;
  timestamp: string;
  contactName?: string;
  phoneNumber: string;
  status: 'SENT' | 'FAILED';
  error?: string;
  message?: string;
}

export interface ICampaign extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  businessName: string;
  campaignName: string;
  template: string;
  totalContacts: number;
  successfulMessages: number;
  failedMessages: number;
  status: 'completed' | 'running' | 'stopped' | 'failed';
  createdAt: Date;
  logs: ICampaignLog[];
}

const CampaignSchema = new Schema<ICampaign>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  username: { type: String, required: true, index: true },
  businessName: { type: String, required: true },
  campaignName: { type: String, default: 'WhatsApp Campaign' },
  template: { type: String, default: '' },
  totalContacts: { type: Number, default: 0 },
  successfulMessages: { type: Number, default: 0 },
  failedMessages: { type: Number, default: 0 },
  status: { type: String, default: 'completed', enum: ['completed', 'running', 'stopped', 'failed'] },
  createdAt: { type: Date, default: Date.now },
  logs: [
    {
      id: String,
      timestamp: String,
      contactName: String,
      phoneNumber: String,
      status: String,
      error: String,
      message: String
    }
  ]
});

export interface ISystemSetting extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

export const User = models.User || model<IUser>('User', UserSchema);
export const Campaign = models.Campaign || model<ICampaign>('Campaign', CampaignSchema);
export const SystemSetting = models.SystemSetting || model<ISystemSetting>('SystemSetting', SystemSettingSchema);
