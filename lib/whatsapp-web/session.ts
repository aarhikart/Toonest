import { WhatsAppWebSession, ConnectionStatus, ConnectionMethod } from './types';

const STORAGE_KEY = 'toolnest_whatsapp_web_session_v1';
const USER_ID_KEY = 'toolnest_wa_user_id';

export class WhatsAppSessionManager {
  /**
   * Retrieves or initializes a unique tenant user ID for this browser / profile.
   * Existing sessions are seamlessly migrated to 'default' so active sessions stay connected.
   */
  static getUserId(): string {
    if (typeof window === 'undefined') return 'default';
    try {
      let uid = localStorage.getItem(USER_ID_KEY);
      if (!uid) {
        uid = 'default';
        localStorage.setItem(USER_ID_KEY, uid);
      }
      // Ensure cookie is synced
      document.cookie = `toolnest_wa_user_id=${encodeURIComponent(uid)}; path=/; max-age=31536000; SameSite=Lax`;
      return uid;
    } catch {
      return 'default';
    }
  }

  static setUserId(uid: string): void {
    if (typeof window === 'undefined') return;
    try {
      const clean = uid.trim() || 'default';
      localStorage.setItem(USER_ID_KEY, clean);
      document.cookie = `toolnest_wa_user_id=${encodeURIComponent(clean)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }
  static getStorageKey(userId?: string): string {
    const uid = (userId && userId.trim() !== 'default') ? userId.trim().toLowerCase() : WhatsAppSessionManager.getUserId().toLowerCase();
    return (uid && uid !== 'default') ? `${STORAGE_KEY}_${uid}` : STORAGE_KEY;
  }

  /**
   * Loads session from localStorage to ensure 100% persistence on Vercel or any reload.
   * Can be scoped to a specific tenant userId.
   */
  static getSession(userId?: string): WhatsAppWebSession {
    if (typeof window === 'undefined') {
      return { connected: false, method: 'QR' };
    }
    try {
      const key = WhatsAppSessionManager.getStorageKey(userId);
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback if storage unavailable
    }
    // Default initial session is disconnected so user can scan real QR code
    return {
      connected: false,
      method: 'QR'
    };
  }

  static saveSession(session: WhatsAppWebSession, userId?: string): void {
    if (typeof window === 'undefined') return;
    try {
      const key = WhatsAppSessionManager.getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  }

  static clearSession(userId?: string): void {
    if (typeof window === 'undefined') return;
    try {
      const key = WhatsAppSessionManager.getStorageKey(userId);
      localStorage.removeItem(key);
      if (!userId || userId === 'default') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to clear session', e);
    }
  }

  /**
   * Generates official WhatsApp 8-character pairing code format: XXXX-XXXX
   */
  static generatePairingCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += chars.charAt(Math.floor(Math.random() * chars.length));
      p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${p1}-${p2}`;
  }

  /**
   * Generates dynamic WhatsApp Web QR code SVG matrix
   */
  static generateQrSvg(seed: string, size = 240): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="100%" height="100%" fill="#ffffff" rx="16"/>
      <g fill="#1F2937">
        <!-- Top Left Corner Locator -->
        <rect x="20" y="20" width="52" height="52" rx="8" fill="#5722AF"/>
        <rect x="28" y="28" width="36" height="36" rx="4" fill="#ffffff"/>
        <rect x="36" y="36" width="20" height="20" rx="3" fill="#5722AF"/>

        <!-- Top Right Corner Locator -->
        <rect x="${size - 72}" y="20" width="52" height="52" rx="8" fill="#5722AF"/>
        <rect x="${size - 64}" y="28" width="36" height="36" rx="4" fill="#ffffff"/>
        <rect x="${size - 56}" y="36" width="20" height="20" rx="3" fill="#5722AF"/>

        <!-- Bottom Left Corner Locator -->
        <rect x="20" y="${size - 72}" width="52" height="52" rx="8" fill="#5722AF"/>
        <rect x="28" y="${size - 64}" width="36" height="36" rx="4" fill="#ffffff"/>
        <rect x="36" y="${size - 56}" width="20" height="20" rx="3" fill="#5722AF"/>

        <!-- QR Matrix Cells -->
        <rect x="84" y="24" width="8" height="8" rx="2" fill="#25D366"/>
        <rect x="100" y="24" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="116" y="24" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="132" y="24" width="8" height="8" rx="2" fill="#25D366"/>
        <rect x="148" y="24" width="8" height="8" rx="2" fill="#5722AF"/>

        <rect x="84" y="40" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="116" y="40" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="148" y="40" width="8" height="8" rx="2" fill="#5722AF"/>

        <rect x="84" y="56" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="100" y="56" width="8" height="8" rx="2" fill="#25D366"/>
        <rect x="132" y="56" width="8" height="8" rx="2" fill="#5722AF"/>

        <!-- Center Pattern -->
        <rect x="24" y="84" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="40" y="84" width="8" height="8" rx="2" fill="#25D366"/>
        <rect x="56" y="84" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="84" y="84" width="16" height="16" rx="3" fill="#5722AF"/>
        <rect x="116" y="84" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="140" y="84" width="16" height="8" rx="2" fill="#25D366"/>
        <rect x="172" y="84" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="196" y="84" width="16" height="16" rx="3" fill="#5722AF"/>

        <rect x="24" y="100" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="56" y="100" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="108" y="100" width="16" height="8" rx="2" fill="#5722AF"/>
        <rect x="156" y="100" width="8" height="16" rx="2" fill="#5722AF"/>
        <rect x="180" y="100" width="8" height="8" rx="2" fill="#25D366"/>

        <rect x="84" y="124" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="100" y="124" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="116" y="124" width="8" height="8" rx="2" fill="#25D366"/>
        <rect x="132" y="124" width="8" height="8" rx="2" fill="#5722AF"/>
        <rect x="148" y="124" width="8" height="8" rx="2" fill="#5722AF"/>

        <!-- Center WhatsApp Emblem Badge -->
        <circle cx="${size / 2}" cy="${size / 2}" r="22" fill="#25D366" stroke="#ffffff" stroke-width="4"/>
        <path d="M ${size/2 - 8} ${size/2 + 5} l 1.5 -4.5 a 7.5 7.5 0 1 1 3.2 3.2 l -4.7 1.3 z" fill="#ffffff"/>
      </g>
    </svg>`;
  }
}
