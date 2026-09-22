'use client';

import { MediaAttachment } from '@/components/whatsapp-web/WhatsAppMessageComposer';

const STORAGE_PREFIX = 'toolnest_wa_media_';
const IDB_DB_NAME = 'toolnest_local_media_db';
const IDB_STORE_NAME = 'media_attachments';
const IDB_VERSION = 1;

/**
 * Open or upgrade native IndexedDB
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this browser.'));
    }

    const request = window.indexedDB.open(IDB_DB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save attachment to IndexedDB
 */
async function saveToIndexedDB(key: string, attachment: MediaAttachment): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
    const store = tx.objectStore(IDB_STORE_NAME);
    const req = store.put(attachment, key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Load attachment from IndexedDB
 */
async function loadFromIndexedDB(key: string): Promise<MediaAttachment | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readonly');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => resolve((req.result as MediaAttachment) || null);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

/**
 * Remove attachment from IndexedDB
 */
async function removeFromIndexedDB(key: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch {}
}

export class LocalMediaStorage {
  private static getKey(username?: string): string {
    const clean = (username || 'guest').toLowerCase().trim();
    return `${STORAGE_PREFIX}${clean}`;
  }

  /**
   * Store attachment locally (localStorage with IndexedDB fallback for larger files)
   */
  static async saveAttachment(username: string | undefined, media: MediaAttachment): Promise<void> {
    if (typeof window === 'undefined') return;
    const key = this.getKey(username);

    // Try localStorage first
    try {
      localStorage.setItem(key, JSON.stringify(media));
      // Remove any old IDB copy since localStorage succeeded
      await removeFromIndexedDB(key);
      return;
    } catch (e: any) {
      // QuotaExceededError or item too large for localStorage: fallback to IndexedDB
      console.warn('[LocalMediaStorage] localStorage quota reached, saving to IndexedDB fallback:', e);
      try {
        localStorage.setItem(key, JSON.stringify({ isIndexedDB: true, name: media.name }));
        await saveToIndexedDB(key, media);
      } catch (idbErr) {
        console.error('[LocalMediaStorage] Failed to save media to IndexedDB:', idbErr);
      }
    }
  }

  /**
   * Load attachment from local storage
   */
  static async loadAttachment(username: string | undefined): Promise<MediaAttachment | null> {
    if (typeof window === 'undefined') return null;
    const key = this.getKey(username);

    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        // Also check guest key if user was not logged in when uploaded
        if (username && username !== 'guest') {
          const guestRaw = localStorage.getItem(this.getKey('guest'));
          if (guestRaw) {
            try {
              const parsed = JSON.parse(guestRaw);
              if (parsed && parsed.dataUrl) return parsed as MediaAttachment;
            } catch {}
          }
        }
        return null;
      }

      const parsed = JSON.parse(raw);
      if (parsed?.isIndexedDB) {
        return await loadFromIndexedDB(key);
      }

      if (parsed?.dataUrl) {
        return parsed as MediaAttachment;
      }
    } catch (e) {
      console.warn('[LocalMediaStorage] Error loading local media:', e);
    }

    return null;
  }

  /**
   * Remove attachment from local storage completely
   */
  static async removeAttachment(username: string | undefined): Promise<void> {
    if (typeof window === 'undefined') return;
    const key = this.getKey(username);

    try {
      localStorage.removeItem(key);
    } catch {}

    // Also remove guest key
    try {
      localStorage.removeItem(this.getKey('guest'));
    } catch {}

    await removeFromIndexedDB(key);
    await removeFromIndexedDB(this.getKey('guest'));
  }

  /**
   * Clear all stored attachments across all users (used during full session reset)
   */
  static async clearAllLocalMedia(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => {
        localStorage.removeItem(k);
        removeFromIndexedDB(k);
      });
    } catch {}
  }
}
