import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { CuttingProgress } from './types';

const BASE_TEMP_DIR = path.join(os.tmpdir(), 'toolnest-video-cutter');

try {
  if (!fs.existsSync(BASE_TEMP_DIR)) {
    fs.mkdirSync(BASE_TEMP_DIR, { recursive: true });
  }
} catch (e) {
  console.error('[VideoCutterStorage] Failed to initialize base dir:', e);
}

export interface VideoCutterSessionPaths {
  sessionId: string;
  sessionDir: string;
  originalPath: string;
  clipsDir: string;
  zipPath: string;
  infoPath: string;
  endingPath: string;
  endingNormPath: string;
  logoPath: string;
}

// In-memory progress tracking
const progressMap = new Map<string, CuttingProgress>();

export function getCuttingProgress(sessionId: string): CuttingProgress | null {
  return progressMap.get(sessionId) || null;
}

export function setCuttingProgress(sessionId: string, progress: Partial<CuttingProgress>): void {
  const current = progressMap.get(sessionId) || {
    sessionId,
    stage: 'idle',
    percent: 0,
    message: '',
    updatedAt: Date.now(),
  };

  const updated: CuttingProgress = {
    ...current,
    ...progress,
    sessionId,
    updatedAt: Date.now(),
  };

  progressMap.set(sessionId, updated);
}

export function clearCuttingProgress(sessionId: string): void {
  progressMap.delete(sessionId);
}

export function createCutterSession(originalName: string): VideoCutterSessionPaths {
  // Periodically clean up old sessions older than 2 hours
  cleanOldSessions();

  const sessionId = crypto.randomUUID();
  const sessionDir = path.join(BASE_TEMP_DIR, sessionId);
  const clipsDir = path.join(sessionDir, 'clips');

  fs.mkdirSync(sessionDir, { recursive: true });
  fs.mkdirSync(clipsDir, { recursive: true });

  const ext = (path.extname(originalName) || '').toLowerCase() === '.mkv' ? '.mkv' : '.mp4';
  const originalPath = path.join(sessionDir, `original${ext}`);
  const zipPath = path.join(sessionDir, 'all_clips.zip');
  const infoPath = path.join(sessionDir, 'info.json');
  const endingPath = path.join(sessionDir, 'ending_original.mp4');
  const endingNormPath = path.join(sessionDir, 'ending_normalized.mp4');
  const logoPath = path.join(sessionDir, 'logo.png');

  fs.writeFileSync(
    infoPath,
    JSON.stringify({
      sessionId,
      originalFilename: originalName,
      ext,
      createdAt: Date.now(),
    })
  );

  return {
    sessionId,
    sessionDir,
    originalPath,
    clipsDir,
    zipPath,
    infoPath,
    endingPath,
    endingNormPath,
    logoPath,
  };
}

export function getCutterSessionPaths(sessionId: string): VideoCutterSessionPaths | null {
  const sanitizedId = (sessionId || '').replace(/[^a-zA-Z0-9-]/g, '');
  if (!sanitizedId) return null;

  const sessionDir = path.join(BASE_TEMP_DIR, sanitizedId);
  if (!fs.existsSync(sessionDir)) return null;

  let originalPath = path.join(sessionDir, 'original.mp4');
  if (fs.existsSync(path.join(sessionDir, 'original.mkv'))) {
    originalPath = path.join(sessionDir, 'original.mkv');
  }

  let endingPath = path.join(sessionDir, 'ending_original.mp4');
  if (fs.existsSync(path.join(sessionDir, 'ending_original.mkv'))) {
    endingPath = path.join(sessionDir, 'ending_original.mkv');
  }
  const endingNormPath = path.join(sessionDir, 'ending_normalized.mp4');

  let logoPath = path.join(sessionDir, 'logo.png');
  const possibleLogos = ['logo.png', 'logo.jpg', 'logo.jpeg', 'logo.webp', 'logo.svg'];
  for (const name of possibleLogos) {
    const candidate = path.join(sessionDir, name);
    if (fs.existsSync(candidate)) {
      logoPath = candidate;
      break;
    }
  }

  return {
    sessionId: sanitizedId,
    sessionDir,
    originalPath,
    clipsDir: path.join(sessionDir, 'clips'),
    zipPath: path.join(sessionDir, 'all_clips.zip'),
    infoPath: path.join(sessionDir, 'info.json'),
    endingPath,
    endingNormPath,
    logoPath,
  };
}

export function cleanOldSessions(maxAgeMs: number = 2 * 60 * 60 * 1000): void {
  try {
    if (!fs.existsSync(BASE_TEMP_DIR)) return;
    const entries = fs.readdirSync(BASE_TEMP_DIR);
    const now = Date.now();

    for (const entry of entries) {
      const fullPath = path.join(BASE_TEMP_DIR, entry);
      try {
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          progressMap.delete(entry);
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error('[VideoCutterStorage] Error cleaning old sessions:', err);
  }
}
