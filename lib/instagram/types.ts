// ---------------------------------------------------------------------------
// Instagram Reel Downloader Types
// ---------------------------------------------------------------------------

export interface ReelFormat {
  quality: string;
  url: string;
  type: 'video' | 'audio';
  hasAudio?: boolean;
  size?: string;
}

export interface ReelMetadata {
  id: string;
  url: string;
  thumbnail: string;
  creator?: string;
  caption?: string;
  duration?: number;
  formats: ReelFormat[];
  isRestricted?: boolean;
  restrictionReason?: string;
}

export interface ReelApiResponse {
  success: boolean;
  reel?: ReelMetadata;
  error?: string;
  code?: string;
}

export interface SavedReelItem {
  id: string;
  url: string;
  shortcode?: string;
  thumbnail?: string;
  caption?: string;
  creator?: string;
  downloadedAt: number | string;
}

// ---------------------------------------------------------------------------
// Instagram DM Manual Messaging Assistant Types
// ---------------------------------------------------------------------------

export type UserStatus = 'pending' | 'sent' | 'skipped' | 'invalid' | 'failed';

export interface InstagramUser {
  id: string;
  username: string;
  originalInput?: string;
  profileUrl: string;
  directMessageUrl?: string;
  status: UserStatus;
  sentAt?: string;
  notes?: string;
  errorReason?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
  createdAt: string;
}

export type OpenTargetMode = 'new_tab' | 'current_tab';
export type DestinationType = 'direct_chat' | 'profile';

export interface Campaign {
  id: string;
  name: string;
  users: InstagramUser[];
  activeMessage: string;
  templates: MessageTemplate[];
  currentIndex: number;
  openMode: OpenTargetMode;
  destinationMode?: DestinationType;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  total: number;
  sent: number;
  pending: number;
  skipped: number;
  invalid: number;
  percentage: number;
}

export interface ParseResult {
  users: InstagramUser[];
  duplicatesCount: number;
  invalidCount: number;
}
