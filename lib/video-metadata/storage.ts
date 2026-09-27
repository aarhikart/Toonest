import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const BASE_TEMP_DIR = path.join(os.tmpdir(), 'toolnest-mp4-metadata');

// Ensure base temp directory exists
try {
  if (!fs.existsSync(BASE_TEMP_DIR)) {
    fs.mkdirSync(BASE_TEMP_DIR, { recursive: true });
  }
} catch (e) {
  console.error('[Storage] Failed to initialize base temp dir:', e);
}

export interface SessionPaths {
  sessionId: string;
  sessionDir: string;
  originalPath: string;
  workingPath: string;
  cleanedPath: string;
  metadataPath: string;
  originalFilename: string;
  customLayerPath: string;
}

/**
 * Validates MP4 / ISO Base Media container signature (ftyp atom).
 * An MP4 container starts with: [4 bytes size][4 bytes 'ftyp'][4 bytes major brand...]
 */
export function validateMp4Signature(buffer: Buffer): { valid: boolean; reason?: string; brand?: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false, reason: 'File is too small to be a valid video container.' };
  }

  // Check for 'ftyp' atom at byte offset 4-7
  const atomType = buffer.toString('latin1', 4, 8);
  if (atomType !== 'ftyp') {
    return {
      valid: false,
      reason: 'Missing MP4 ftyp container box. The file is not a valid MP4/ISO container.',
    };
  }

  const majorBrand = buffer.toString('latin1', 8, 12).trim();
  const knownBrands = ['isom', 'iso2', 'mp41', 'mp42', 'M4V', 'M4A', 'qt', 'avc1', 'dash', 'msnv', 'NDSC'];

  const matchesBrand = knownBrands.some((b) => majorBrand.toLowerCase().includes(b.toLowerCase()));
  if (!matchesBrand) {
    // Also scan compatible brands in next 16 bytes
    const nextBrands = buffer.toString('latin1', 12, Math.min(32, buffer.length));
    const matchesCompatible = knownBrands.some((b) => nextBrands.toLowerCase().includes(b.toLowerCase()));
    if (!matchesCompatible) {
      return {
        valid: false,
        reason: `Unsupported container brand: ${majorBrand}. Expected MP4 / ISO Base Media format.`,
        brand: majorBrand,
      };
    }
  }

  return { valid: true, brand: majorBrand };
}

/**
 * Creates an isolated temporary session directory and saves original + working copy.
 * The original file is saved as original.mp4 and marked read-only.
 * A working copy is saved as working.mp4 for FFmpeg processing.
 */
export async function createSessionFiles(
  fileBuffer: Buffer,
  originalName: string
): Promise<SessionPaths> {
  const sessionId = crypto.randomUUID();
  const sessionDir = path.join(BASE_TEMP_DIR, sessionId);
  fs.mkdirSync(sessionDir, { recursive: true });

  const originalPath = path.join(sessionDir, 'original.mp4');
  const workingPath = path.join(sessionDir, 'working.mp4');
  const cleanedPath = path.join(sessionDir, 'clean.mp4');
  const metadataPath = path.join(sessionDir, 'metadata.json');
  const customLayerPath = path.join(sessionDir, 'custom_layer.png');

  // Write original file
  fs.writeFileSync(originalPath, fileBuffer);
  // Copy to working.mp4 (all processing runs on working.mp4 or writes to clean.mp4)
  fs.copyFileSync(originalPath, workingPath);

  // Set original.mp4 as read-only to guarantee it is NEVER modified
  try {
    fs.chmodSync(originalPath, 0o444);
  } catch {
    // Ignore chmod errors on windows if not supported
  }

  // Save original filename mapping
  fs.writeFileSync(
    path.join(sessionDir, 'info.json'),
    JSON.stringify({ originalFilename: originalName, createdAt: Date.now() })
  );

  return {
    sessionId,
    sessionDir,
    originalPath,
    workingPath,
    cleanedPath,
    metadataPath,
    originalFilename: originalName,
    customLayerPath,
  };
}

/**
 * Retrieves session paths if the session exists and is valid.
 */
export function getSessionPaths(sessionId: string): SessionPaths | null {
  // Prevent path traversal
  const sanitizedId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
  if (!sanitizedId || sanitizedId !== sessionId) {
    return null;
  }

  const sessionDir = path.join(BASE_TEMP_DIR, sanitizedId);
  if (!fs.existsSync(sessionDir)) {
    return null;
  }

  const originalPath = path.join(sessionDir, 'original.mp4');
  const workingPath = path.join(sessionDir, 'working.mp4');
  const cleanedPath = path.join(sessionDir, 'clean.mp4');
  const metadataPath = path.join(sessionDir, 'metadata.json');

  let originalFilename = 'video.mp4';
  try {
    const infoPath = path.join(sessionDir, 'info.json');
    if (fs.existsSync(infoPath)) {
      const data = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
      if (data.originalFilename) originalFilename = data.originalFilename;
    }
  } catch (e) {
    // default
  }

  return {
    sessionId: sanitizedId,
    sessionDir,
    originalPath,
    workingPath,
    cleanedPath,
    metadataPath,
    originalFilename,
    customLayerPath: path.join(sessionDir, 'custom_layer.png'),
  };
}

/**
 * Clean up a session directory and all its contents safely.
 */
export function cleanupSession(sessionId: string): boolean {
  const sanitizedId = sessionId.replace(/[^a-zA-Z0-9-]/g, '');
  if (!sanitizedId) return false;

  const sessionDir = path.join(BASE_TEMP_DIR, sanitizedId);
  if (fs.existsSync(sessionDir)) {
    try {
      // Remove read-only on original file before deletion
      const originalPath = path.join(sessionDir, 'original.mp4');
      if (fs.existsSync(originalPath)) {
        try {
          fs.chmodSync(originalPath, 0o666);
        } catch {}
      }
      fs.rmSync(sessionDir, { recursive: true, force: true });
      return true;
    } catch (e) {
      console.warn(`[Storage] Failed to delete session ${sessionId}:`, e);
      return false;
    }
  }
  return false;
}

/**
 * Periodic cleanup of sessions older than 30 minutes.
 */
export function purgeOldSessions(maxAgeMinutes: number = 30): void {
  try {
    if (!fs.existsSync(BASE_TEMP_DIR)) return;
    const now = Date.now();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    const items = fs.readdirSync(BASE_TEMP_DIR);

    for (const item of items) {
      const itemDir = path.join(BASE_TEMP_DIR, item);
      try {
        const stats = fs.statSync(itemDir);
        if (stats.isDirectory() && now - stats.mtimeMs > maxAgeMs) {
          // Reset permissions if needed
          const orig = path.join(itemDir, 'original.mp4');
          if (fs.existsSync(orig)) {
            try {
              fs.chmodSync(orig, 0o666);
            } catch {}
          }
          fs.rmSync(itemDir, { recursive: true, force: true });
        }
      } catch {}
    }
  } catch (e) {
    console.error('[Storage] Error during old sessions purge:', e);
  }
}
