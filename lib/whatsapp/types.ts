export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'QUEUED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type CampaignType = 'BROADCAST' | 'SCHEDULED' | 'DRIP' | 'TRIGGERED';
export type MessageStatus = 'PENDING' | 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type MessageType = 'TEMPLATE' | 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'INTERACTIVE';
export type Direction = 'OUTBOUND' | 'INBOUND';
export type ConsentStatus = 'OPTED_IN' | 'OPTED_OUT' | 'UNCONFIRMED';
export type QualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export interface WhatsAppAccount {
  id: string;
  name: string;
  wabaId: string;
  appId: string;
  businessName: string;
  timezone: string;
  currency: string;
  qualityRating: QualityRating;
  messagingLimit: string;
  phoneNumbers: WhatsAppPhoneNumber[];
  createdAt: string;
}

export interface WhatsAppPhoneNumber {
  id: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: QualityRating;
  messagingLimit: string;
  codeVerificationStatus: string;
  isDefault: boolean;
}

export interface ContactTag {
  id: string;
  name: string;
  color: string;
}

export interface Contact {
  id: string;
  phoneNumber: string; // E.164 formatted, e.g. +12025550192
  countryCode: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  consentStatus: ConsentStatus;
  optInSource?: string;
  optInAt?: string;
  optOutAt?: string;
  tags: string[];
  metadata: Record<string, string>;
  lastMessageAt?: string;
  createdAt: string;
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface MessageTemplate {
  id: string;
  metaTemplateId?: string;
  name: string; // lowercase with underscores, e.g., summer_promo_2026
  category: TemplateCategory;
  language: string; // e.g., 'en_US', 'es_ES'
  status: TemplateStatus;
  rejectionReason?: string;
  headerType?: 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  headerText?: string;
  bodyText: string; // Contains {{1}}, {{2}} placeholders
  footerText?: string;
  buttons: TemplateButton[];
  variables: string[]; // ['1', '2']
  sampleValues: Record<string, string>;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  templateId: string;
  templateName: string;
  senderPhoneNumberId: string;
  targetTags: string[];
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  variableMapping: Record<string, string>; // e.g. { "1": "firstName", "2": "metadata.discount" }
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  contactId: string;
  contactName: string;
  phoneNumber: string;
  status: MessageStatus;
  waMessageId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  errorMessage?: string;
}

export interface WhatsAppMessage {
  id: string;
  waMessageId: string;
  direction: Direction;
  type: MessageType;
  from: string;
  to: string;
  contactId?: string;
  contactName?: string;
  campaignId?: string;
  templateId?: string;
  status: MessageStatus;
  content: string;
  timestamp: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface MessageEvent {
  id: string;
  messageId: string;
  status: MessageStatus;
  timestamp: string;
  metaTimestamp?: string;
  details?: string;
}

export interface WebhookLog {
  id: string;
  eventId: string;
  eventType: string;
  payload: any;
  receivedAt: string;
  processed: boolean;
}

export interface DashboardStats {
  totalSent: number;
  deliveryRate: number;
  readRate: number;
  activeCampaigns: number;
  optedInContacts: number;
  qualityRating: QualityRating;
  messagingLimit: string;
  recentMessages: WhatsAppMessage[];
}
