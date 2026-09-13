export type DetectionVerdict =
  | 'likely_ai'
  | 'likely_real'
  | 'possibly_manipulated'
  | 'inconclusive';

export interface VideoSignal {
  type: 'visual' | 'temporal' | 'audio' | 'metadata';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp?: number; // In seconds, e.g. 4 for 00:04
  details?: string;
}

export interface VideoMetadata {
  duration?: number; // in seconds
  width?: number;
  height?: number;
  fps?: number;
  format?: string;
  sizeBytes?: number;
  hasAudio?: boolean;
  codec?: string;
  filename?: string;
  mimeType?: string;
}

export interface AnalysisScores {
  visual?: number;
  temporal?: number;
  audio?: number;
  metadata?: number;
}

export interface VideoAnalysisResult {
  success: boolean;
  verdict: DetectionVerdict;
  confidence: number;
  isEngineConfigured: boolean;
  scores?: AnalysisScores;
  video: VideoMetadata;
  signals: VideoSignal[];
  limitations: string[];
  disclaimer: string;
  error?: string;
  engineName?: string;
  analyzedAt: number;
}

export interface VideoAnalysisInput {
  type: 'file' | 'url';
  url?: string;
  fileBuffer?: Buffer;
  filename?: string;
  mimeType?: string;
  fileSize?: number;
  clientMetadata?: Partial<VideoMetadata>;
}

export interface VideoHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  verdict: DetectionVerdict;
  confidence: number;
  duration?: number;
  isUrl: boolean;
}
