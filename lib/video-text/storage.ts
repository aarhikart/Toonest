import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const BASE_TEMP_DIR = path.join(os.tmpdir(), 'toolnest-video-text');

try {
  if (!fs.existsSync(BASE_TEMP_DIR)) {
    fs.mkdirSync(BASE_TEMP_DIR, { recursive: true });
  }
} catch (e) {
  console.error('[VideoTextStorage] Failed to initialize base dir:', e);
}

export interface VideoTextSessionPaths {
  sessionId: string;
  sessionDir: string;
  originalPath: string;
  processedPath: string;
  infoPath: string;
  framesDir: string;
}

export function createVideoTextSession(
  fileBuffer: Buffer,
  originalName: string
): VideoTextSessionPaths {
  const sessionId = crypto.randomUUID();
  const sessionDir = path.join(BASE_TEMP_DIR, sessionId);
  const framesDir = path.join(sessionDir, 'frames');

  fs.mkdirSync(framesDir, { recursive: true });

  const originalPath = path.join(sessionDir, 'original.mp4');
  const processedPath = path.join(sessionDir, 'processed.mp4');
  const infoPath = path.join(sessionDir, 'info.json');

  fs.writeFileSync(originalPath, fileBuffer);
  fs.writeFileSync(
    infoPath,
    JSON.stringify({
      sessionId,
      originalFilename: originalName,
      createdAt: Date.now(),
    })
  );

  return {
    sessionId,
    sessionDir,
    originalPath,
    processedPath,
    infoPath,
    framesDir,
  };
}

export function getVideoTextSessionPaths(sessionId: string): VideoTextSessionPaths | null {
  const sanitizedId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
  if (!sanitizedId || sanitizedId !== sessionId) return null;

  const sessionDir = path.join(BASE_TEMP_DIR, sanitizedId);
  if (!fs.existsSync(sessionDir)) return null;

  return {
    sessionId: sanitizedId,
    sessionDir,
    originalPath: path.join(sessionDir, 'original.mp4'),
    processedPath: path.join(sessionDir, 'processed.mp4'),
    infoPath: path.join(sessionDir, 'info.json'),
    framesDir: path.join(sessionDir, 'frames'),
  };
}

export function cleanupVideoTextSession(sessionId: string): boolean {
  const paths = getVideoTextSessionPaths(sessionId);
  if (!paths) return false;
  try {
    if (fs.existsSync(paths.sessionDir)) {
      fs.rmSync(paths.sessionDir, { recursive: true, force: true });
    }
    return true;
  } catch {
    return false;
  }
}
