import fs from 'fs';
import path from 'path';

export interface GalleryItem {
  id: string;
  title: string;
  savedAt: string;
}

export interface GalleryInfo {
  name: string;
  count: number;
  updatedAt: string;
}

const GALLERIES_DIR = path.join(process.cwd(), 'data', 'galleries');

/**
 * Ensure galleries storage directory exists
 */
export function ensureGalleryDir(): string {
  if (!fs.existsSync(GALLERIES_DIR)) {
    fs.mkdirSync(GALLERIES_DIR, { recursive: true });
  }
  return GALLERIES_DIR;
}

/**
 * Sanitize gallery name to safe filename: e.g. "Food & Drink" -> "food-drink"
 */
export function sanitizeGalleryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getGalleryFilePath(name: string): string {
  ensureGalleryDir();
  const safeName = sanitizeGalleryName(name);
  if (!safeName) throw new Error('Invalid gallery name.');
  return path.join(GALLERIES_DIR, `${safeName}.json`);
}

/**
 * List all existing galleries and their item counts
 */
export function listGalleries(): GalleryInfo[] {
  ensureGalleryDir();
  try {
    const files = fs.readdirSync(GALLERIES_DIR);
    const galleries: GalleryInfo[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(GALLERIES_DIR, file);
        const name = path.basename(file, '.json');
        try {
          const stats = fs.statSync(filePath);
          const raw = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(raw);
          const count = Array.isArray(data) ? data.length : 0;
          galleries.push({
            name,
            count,
            updatedAt: stats.mtime.toISOString(),
          });
        } catch {
          galleries.push({
            name,
            count: 0,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    return galleries.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err: any) {
    console.error('[GalleryStore] Error listing galleries:', err.message);
    return [];
  }
}

/**
 * Create a new gallery JSON file if it doesn't already exist
 */
export function createGallery(name: string): { success: boolean; name: string; isNew: boolean } {
  const safeName = sanitizeGalleryName(name);
  if (!safeName) {
    throw new Error('Gallery name cannot be empty.');
  }

  const filePath = getGalleryFilePath(safeName);
  if (fs.existsSync(filePath)) {
    return { success: true, name: safeName, isNew: false };
  }

  fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
  return { success: true, name: safeName, isNew: true };
}

/**
 * Read all items from a gallery JSON file
 */
export function getGalleryItems(name: string): GalleryItem[] {
  const filePath = getGalleryFilePath(name);
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: any) {
    console.error(`[GalleryStore] Error reading gallery ${name}:`, err.message);
    return [];
  }
}

/**
 * Append new items to a gallery JSON file, skipping duplicates by ID
 */
export function saveGalleryItems(
  name: string,
  newItems: Array<{ id: string; title: string }>
): { addedCount: number; totalCount: number; addedItems: GalleryItem[] } {
  const filePath = getGalleryFilePath(name);
  const existingItems = getGalleryItems(name);
  const existingIds = new Set(existingItems.map((item) => String(item.id).trim()));

  const addedItems: GalleryItem[] = [];
  const now = new Date().toISOString();

  for (const item of newItems) {
    const cleanId = String(item.id || '').trim();
    if (!cleanId) continue;

    if (!existingIds.has(cleanId)) {
      existingIds.add(cleanId);
      const cleanItem: GalleryItem = {
        id: cleanId,
        title: (item.title || '').trim(),
        savedAt: now,
      };
      existingItems.push(cleanItem);
      addedItems.push(cleanItem);
    }
  }

  // Atomic write
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(existingItems, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);

  return {
    addedCount: addedItems.length,
    totalCount: existingItems.length,
    addedItems,
  };
}

/**
 * Delete a specific item from a gallery by ID
 */
export function deleteGalleryItem(name: string, id: string): { success: boolean; totalCount: number } {
  const filePath = getGalleryFilePath(name);
  const items = getGalleryItems(name);
  const filtered = items.filter((item) => String(item.id).trim() !== String(id).trim());

  if (filtered.length !== items.length) {
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
  }

  return {
    success: true,
    totalCount: filtered.length,
  };
}

/**
 * Delete an entire gallery JSON file
 */
export function deleteGallery(name: string): boolean {
  try {
    const filePath = getGalleryFilePath(name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (err: any) {
    console.error(`[GalleryStore] Error deleting gallery ${name}:`, err.message);
    return false;
  }
}
