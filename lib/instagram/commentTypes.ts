export interface AntiBanSettings {
  minDelaySec: number;
  maxDelaySec: number;
  enableBatchBreak: boolean;
  batchSize: number; // e.g. 4 comments
  batchBreakSec: number; // e.g. 60 seconds
  enableZeroWidthJitter: boolean; // Injects invisible unicode characters to change hash
  enableEmojiRotation: boolean; // Appends rotating random emojis
  tagsPerComment: number; // 1 or 2 users tagged per comment
  tagPosition: 'start' | 'end'; // @username at start or end
  emulateHumanTyping: boolean; // Jitter typing delay
}

export interface CommentUser {
  id: string;
  raw: string;
  username: string;
}

export interface CommentConfig {
  usernames: string[];
  messages: string[];
  antiBan: AntiBanSettings;
}

export interface CommentPreset {
  id: string;
  name: string;
  description: string;
  messages: string[];
}
