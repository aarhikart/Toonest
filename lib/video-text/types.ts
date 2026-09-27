export interface VideoTextSession {
  sessionId: string;
  originalFilename: string;
  fileSize: number;
  duration: number;
  formattedDuration: string;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
}

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  confidence?: number;
  timeStart?: number;
  timeEnd?: number;
}

export type RemovalMethod = 'color_patch' | 'delogo' | 'blur';

export interface RemovalOptions {
  method: RemovalMethod;
  patchColor: string; // hex color e.g. '#000000'
  blurStrength: number; // e.g. 15
  boxes: BoundingBox[];
}

export interface ProcessResult {
  sessionId: string;
  processedFilename: string;
  originalSize: number;
  processedSize: number;
  duration: number;
  boxesCount: number;
  method: RemovalMethod;
  downloadUrl: string;
  previewUrl: string;
}
