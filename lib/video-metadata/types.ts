export interface FileInfo {
  filename: string;
  fileSize: number; // in bytes
  formattedSize: string;
  formatName: string;
  durationSeconds: number;
  formattedDuration: string;
  bitrate: number;
  formattedBitrate: string;
  container: string;
}

export interface VideoStreamInfo {
  codec: string;
  profile: string;
  width: number;
  height: number;
  resolution: string;
  frameRate: string;
  pixelFormat: string;
  colorSpace: string;
  colorPrimaries: string;
  colorTransfer: string;
  colorRange: string;
  rotation?: string | number;
  bitrate?: string;
}

export interface AudioStreamInfo {
  codec: string;
  profile?: string;
  sampleRate: string;
  channels: number;
  channelLayout: string;
  bitrate?: string;
  language?: string;
}

export interface SubtitleStreamInfo {
  index: number;
  codec: string;
  language?: string;
  title?: string;
}

export interface RemovableTag {
  key: string;
  label: string;
  value: string;
  category: 'descriptive' | 'sensitive' | 'technical' | 'custom';
  isSensitive: boolean;
  sensitiveReason?: string;
}

export interface SensitiveHighlight {
  category: 'location' | 'device' | 'camera' | 'creation_time' | 'software' | 'author';
  label: string;
  value: string;
  key: string;
}

export interface ChapterInfo {
  id: number | string;
  start: number;
  end: number;
  title?: string;
}

export interface ParsedMetadata {
  fileInfo: FileInfo;
  videoStream: VideoStreamInfo | null;
  audioStream: AudioStreamInfo | null;
  subtitleStreams: SubtitleStreamInfo[];
  otherStreamsCount: number;
  chapters: ChapterInfo[];
  rawTags: Record<string, string>;
  removableTags: RemovableTag[];
  sensitiveHighlights: SensitiveHighlight[];
  rawFfprobeJson?: any;
}

export type CleaningMode = 'transparent_layer' | 'all' | 'selected' | 'reencode' | 'anti_fingerprint';

export interface SelectedCategories {
  creationDate: boolean;
  location: boolean;
  deviceInfo: boolean;
  cameraInfo: boolean;
  softwareEncoder: boolean;
  titleAuthor: boolean;
  copyright: boolean;
  commentDescription: boolean;
  chapters: boolean;
  customTags: boolean;
}

export interface ReencodeSettings {
  videoCodec: 'libx264' | 'libx265';
  qualityPreset: 'high' | 'balanced' | 'small';
  audioCodec: 'copy' | 'aac';
  audioBitrate: '128k' | '192k' | '256k';
}

export interface AntiFingerprintSettings {
  preset: 'standard' | 'aggressive' | 'light';
  audioSpeedShift: number; // e.g. 1.025 (+2.5%)
  audioFreqFilter: boolean;
  microZoomPercent: number; // e.g. 3 (3%)
  colorGrading: boolean;
  microNoise: boolean;
  horizontalFlip: boolean;
  targetFps: number; // e.g. 30
}

export interface TransparentLayerSettings {
  layerType: 'transparent_sheen' | 'film_grain' | 'transparent_frame' | 'custom_image';
  opacity: number; // e.g. 0.03
  layerColor: 'white' | 'black';
  hasCustomImage?: boolean;
}

export interface CleaningOptions {
  mode: CleaningMode;
  selectedCategories?: SelectedCategories;
  reencodeSettings?: ReencodeSettings;
  antiFingerprintSettings?: AntiFingerprintSettings;
  transparentLayerSettings?: TransparentLayerSettings;
  removeChapters?: boolean;
}

export interface ComparisonRow {
  key: string;
  label: string;
  originalValue: string;
  cleanedValue: string;
  status: 'removed' | 'preserved_technical' | 'retained_user_choice' | 'regenerated';
  isSensitive: boolean;
}

export interface VerificationResult {
  isValidPlayable: boolean;
  videoStreamDetected: boolean;
  audioStreamDetected: boolean;
  originalDurationSeconds: number;
  cleanedDurationSeconds: number;
  durationDiffSeconds: number;
  durationMatches: boolean;
  originalRemovableCount: number;
  cleanedRemovableCount: number;
  status: 'success' | 'partial' | 'failed';
  statusMessage: string;
  comparisonRows: ComparisonRow[];
  technicalInfoNotes: string[];
  isAntiFingerprint?: boolean;
  fingerprintModifications?: string[];
  isTransparentLayer?: boolean;
  layerDetails?: string;
}

export interface CleaningProgress {
  sessionId: string;
  status: 'idle' | 'preparing' | 'cleaning' | 'reencoding' | 'verifying' | 'completed' | 'failed';
  percent: number; // 0 - 100
  currentTimeSeconds: number;
  totalDurationSeconds: number;
  speed: string;
  fps: string;
  errorMessage?: string;
}

export interface CleaningSessionResult {
  sessionId: string;
  originalFilename: string;
  cleanedFilename: string;
  originalSize: number;
  cleanedSize: number;
  sizeDiffBytes: number;
  sizeSavingsPercent: number;
  verification: VerificationResult;
  cleanedMetadata: ParsedMetadata;
}
