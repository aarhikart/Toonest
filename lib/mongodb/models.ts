import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  businessName: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  subscriptionType: 'trial' | 'paid' | 'none';
  planType?: '1_month' | '3_months' | '6_months' | null;
  trialStartDate?: Date;
  trialEndDate?: Date;
  planStartDate?: Date;
  planEndDate?: Date;
  trialReminderSent?: boolean;
  paidReminderSent?: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String },
  businessName: { type: String, default: 'ToolNest Business', trim: true },
  phoneNumber: { type: String, default: '', trim: true },
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  subscriptionType: { type: String, default: 'none', enum: ['trial', 'paid', 'none'] },
  planType: { type: String, default: null },
  trialStartDate: { type: Date },
  trialEndDate: { type: Date },
  planStartDate: { type: Date },
  planEndDate: { type: Date },
  trialReminderSent: { type: Boolean, default: false },
  paidReminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

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

export interface ITrialRequest extends Document {
  businessName: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedUsername?: string;
  assignedPassword?: string;
  createdAt: Date;
  approvedAt?: Date;
}

const TrialRequestSchema = new Schema<ITrialRequest>({
  businessName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  assignedUsername: { type: String },
  assignedPassword: { type: String },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
});

export interface IRenewalRequest extends Document {
  userId?: mongoose.Types.ObjectId;
  username: string;
  businessName: string;
  phoneNumber: string;
  planType: '1_month' | '3_months' | '6_months';
  amount: number;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  approvedAt?: Date;
}

const RenewalRequestSchema = new Schema<IRenewalRequest>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true, trim: true },
  businessName: { type: String, default: '', trim: true },
  phoneNumber: { type: String, default: '', trim: true },
  planType: { type: String, required: true, enum: ['1_month', '3_months', '6_months'] },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true, trim: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date }
});

export const User = models.User || model<IUser>('User', UserSchema);
export const Campaign = models.Campaign || model<ICampaign>('Campaign', CampaignSchema);
export const SystemSetting = models.SystemSetting || model<ISystemSetting>('SystemSetting', SystemSettingSchema);
export const TrialRequest = models.TrialRequest || model<ITrialRequest>('TrialRequest', TrialRequestSchema);
export const RenewalRequest = models.RenewalRequest || model<IRenewalRequest>('RenewalRequest', RenewalRequestSchema);
