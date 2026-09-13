import { TestSession } from './types';

const STORAGE_KEYS = {
  RECENT_URLS: 'toolnest_responsive_recent_urls',
  ACTIVE_SESSION: 'toolnest_responsive_active_session',
  TEST_HISTORY: 'toolnest_responsive_history',
};

export function getRecentUrls(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_URLS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentUrl(url: string): void {
  if (typeof window === 'undefined' || !url) return;
  try {
    const current = getRecentUrls();
    const updated = [url, ...current.filter((u) => u !== url)].slice(0, 25);
    localStorage.setItem(STORAGE_KEYS.RECENT_URLS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recent URL', e);
  }
}

export function clearRecentUrls(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.RECENT_URLS);
}

export function getTestHistory(): TestSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEST_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTestSessionToHistory(session: TestSession): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getTestHistory();
    const updated = [session, ...current.filter((s) => s.id !== session.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save session to history', e);
  }
}

export function deleteTestSessionFromHistory(sessionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getTestHistory();
    const updated = current.filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.TEST_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete session', e);
  }
}
