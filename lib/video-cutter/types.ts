export interface EndingVideoMetadata {
  filename: string;
  fileSize: number;
  duration: number;
  formattedDuration: string;
  width: number;
  height: number;
  previewUrl?: string;
}

export interface LogoMetadata {
  filename: string;
  fileSize: number;
  width: number;
  height: number;
  previewUrl?: string;
}

export interface VideoCutterSession {
  sessionId: string;
  originalFilename: string;
  fileSize: number;
  duration: number; // in seconds
  formattedDuration: string; // HH:MM:SS
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  createdAt: number;
  endingVideo?: EndingVideoMetadata | null;
  logoImage?: LogoMetadata | null;
}

export interface ClipMetadata {
  index: number;
  filename: string;
  displayName: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  startTimeFormatted: string; // HH:MM:SS
  endTimeFormatted: string; // HH:MM:SS
  durationSeconds: number;
  durationFormatted: string;
  sizeBytes: number;
  downloadUrl: string;
  previewUrl: string;
}

export interface CuttingOptions {
  clipDurationSeconds: number; // e.g. 600 for 10 minutes
  overlayWatermark?: boolean;
  customNamePrefix?: string;
  includeLogo?: boolean;
}

export interface CuttingProgress {
  sessionId: string;
  stage: 'idle' | 'uploading' | 'analyzing' | 'cutting' | 'zipping' | 'completed' | 'error';
  percent: number; // 0 - 100
  currentClip?: number;
  totalClips?: number;
  message: string;
  error?: string;
  updatedAt: number;
}

export interface ProcessResult {
  sessionId: string;
  originalFilename: string;
  clipDurationSeconds: number;
  totalClips: number;
  clips: ClipMetadata[];
  zipFilename: string;
  zipSizeBytes: number;
  zipDownloadUrl: string;
  durationSeconds: number;
  formattedDuration: string;
  hasEndingVideo?: boolean;
  endingVideoDuration?: number;
  hasLogo?: boolean;
}

export function formatSecondsToTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '00:00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
