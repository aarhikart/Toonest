import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export interface WhatsAppUser {
  id: string | null;
  name: string | null;
  phoneNumber: string | null;
}

export interface WhatsAppServiceStatus {
  state: 'DISCONNECTED' | 'CONNECTING' | 'WAITING_FOR_PAIRING' | 'QR_READY' | 'CONNECTED' | 'RECONNECTING';
  isConnected: boolean;
  qrCodeDataUrl: string | null;
  pairingCode: string | null;
  user: WhatsAppUser | null;
  lastConnectedAt: string | null;
  sessionDir: string;
  userId?: string;
}

export interface MediaInput {
  buffer?: Buffer;
  base64?: string;
  mimetype: string;
  fileName?: string;
  isImage?: boolean;
}

export interface SendOptions {
  sendTextSeparately?: boolean;
}

/**
 * Intelligent phone number normalizer matching /whatsapp-mess
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return '91' + cleaned.slice(1);
  }
  if (cleaned.length === 10) {
    return '91' + cleaned;
  }
  return cleaned;
}

export class WhatsAppSessionEngine {
  public readonly userId: string;
  private client: Client | null = null;
  private sessionDir: string;
  private state: 'DISCONNECTED' | 'CONNECTING' | 'WAITING_FOR_PAIRING' | 'QR_READY' | 'CONNECTED' | 'RECONNECTING' = 'DISCONNECTED';
  private qrCodeDataUrl: string | null = null;
  private pairingCode: string | null = null;
  private user: WhatsAppUser | null = null;
  private lastConnectedAt: string | null = null;
  private isConnecting: boolean = false;
  private isExplicitLogout: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pairingCodeWaiter: {
    resolve: (code: string) => void;
    reject: (err: Error) => void;
    timeout: NodeJS.Timeout;
  } | null = null;

  constructor(sessionDir: string = './sessions', userId: string = 'default') {
    this.sessionDir = sessionDir;
    this.userId = (userId || 'default').trim();
    try {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    } catch (_) {}
  }

  public getAuthPath(): string {
    // Backwards compatible: 'default' uses existing './sessions/wwebjs_auth'
    if (this.userId === 'default') {
      return path.resolve(this.sessionDir, 'wwebjs_auth');
    }
    return path.resolve(this.sessionDir, `wwebjs_auth_${this.userId}`);
  }

  private getPuppeteerOptions() {
    const baseArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ];

    const options: any = {
      headless: true,
      args: baseArgs
    };

    try {
      const puppeteer = require('puppeteer');
      const defaultPath = puppeteer.executablePath();
      if (defaultPath && fs.existsSync(defaultPath)) {
        options.executablePath = defaultPath;
      }
    } catch (_) {}

    return options;
  }

  public async initialize(pairPhoneNumber?: string): Promise<void> {
    if (this.isConnecting) {
      console.log(`[WhatsApp Worker (${this.userId})] WhatsApp Web client is already initializing...`);
      return;
    }

    if (this.client && this.state === 'CONNECTED') {
      console.log(`[WhatsApp Worker (${this.userId})] WhatsApp Web client is already connected.`);
      return;
    }

    this.isConnecting = true;
    this.isExplicitLogout = false;
    this.state = 'CONNECTING';

    try {
      const authPath = this.getAuthPath();
      fs.mkdirSync(authPath, { recursive: true });

      if (this.client) {
        try {
          await this.client.destroy();
        } catch (_) {}
        this.client = null;
      }

      console.log(`[WhatsApp Worker (${this.userId})] Launching WhatsApp Web browser engine (Chromium)...`);

      const client = new Client({
        authStrategy: new LocalAuth({
          dataPath: authPath
        }),
        ...(pairPhoneNumber
          ? {
              pairWithPhoneNumber: {
                phoneNumber: pairPhoneNumber,
                showNotification: true,
                intervalMs: 180000
              }
            }
          : {}),
        puppeteer: this.getPuppeteerOptions()
      });

      this.client = client;

      // Event: QR Code
      client.on('qr', async (qr) => {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr);
          this.qrCodeDataUrl = qrDataUrl;
          this.pairingCode = null;
          this.state = 'QR_READY';
          console.log('[WhatsApp Worker] Real scannable WhatsApp Web QR code generated.');
        } catch (err: any) {
          console.error('[WhatsApp Worker] Failed to render QR code image:', err.message);
        }
      });

      // Event: Pairing Code
      client.on('code', (code) => {
        this.pairingCode = String(code);
        this.state = 'WAITING_FOR_PAIRING';
        console.log(`[WhatsApp Worker] Pairing code generated: ${code}`);

        if (this.pairingCodeWaiter) {
          clearTimeout(this.pairingCodeWaiter.timeout);
          this.pairingCodeWaiter.resolve(String(code));
          this.pairingCodeWaiter = null;
        }
      });

      // Event: Authenticated
      client.on('authenticated', () => {
        this.state = 'CONNECTED';
        this.qrCodeDataUrl = null;
        this.pairingCode = null;
        console.log('[WhatsApp Worker] WhatsApp Web authenticated successfully.');
      });

      // Event: Ready
      client.on('ready', () => {
        this.state = 'CONNECTED';
        this.lastConnectedAt = new Date().toISOString();
        this.qrCodeDataUrl = null;
        this.pairingCode = null;

        const info = (client as any).info;
        const wid = info?.wid?._serialized || '';
        const phoneDigits = wid ? wid.split('@')[0].split(':')[0] : null;

        this.user = {
          id: wid || null,
          name: info?.pushname || 'WhatsApp Account',
          phoneNumber: phoneDigits ? `+${phoneDigits}` : null
        };

        console.log(`[WhatsApp Worker] Ready! Connected as ${this.user.name} (${this.user.phoneNumber})`);
      });

      // Event: State Change
      client.on('change_state', (state) => {
        console.log(`[WhatsApp Worker] State changed: ${state}`);
        if (state === 'CONNECTED') {
          this.state = 'CONNECTED';
          this.qrCodeDataUrl = null;
          this.pairingCode = null;
        }
      });

      // Event: Auth Failure
      client.on('auth_failure', (msg) => {
        console.warn('[WhatsApp Worker] Auth failure:', msg);
        if (this.pairingCodeWaiter) {
          clearTimeout(this.pairingCodeWaiter.timeout);
          this.pairingCodeWaiter.reject(new Error(`Authentication failed: ${msg}`));
          this.pairingCodeWaiter = null;
        }
        this.state = 'DISCONNECTED';
        this.qrCodeDataUrl = null;
        this.pairingCode = null;
      });

      // Event: Disconnected
      client.on('disconnected', async (reason) => {
        console.log('[WhatsApp Worker] Client disconnected:', reason);
        this.state = 'DISCONNECTED';
        this.user = null;
        this.qrCodeDataUrl = null;
        this.pairingCode = null;

        if (!this.isExplicitLogout) {
          console.log('[WhatsApp Worker] Session disconnected, scheduling auto-reconnect...');
          this.scheduleReconnect(3000);
        }
      });

      await client.initialize();
    } catch (err: any) {
      console.error('[WhatsApp Worker] Failed to initialize WhatsApp Web client:', err.message || err);
      this.state = 'DISCONNECTED';
      if (this.pairingCodeWaiter) {
        clearTimeout(this.pairingCodeWaiter.timeout);
        this.pairingCodeWaiter.reject(new Error(err.message || 'Failed to initialize client'));
        this.pairingCodeWaiter = null;
      }
      this.scheduleReconnect(5000);
    } finally {
      this.isConnecting = false;
    }
  }

  public async requestPairingCode(phoneNumber: string): Promise<string> {
    const digits = normalizePhoneNumber(phoneNumber);
    if (!digits || digits.length < 10 || digits.length > 15) {
      throw new Error(`Invalid phone number (+${digits}). Must be 10 to 15 digits including country code.`);
    }

    if (this.state === 'CONNECTED') {
      const currentDigits = this.user?.phoneNumber?.replace(/\D/g, '');
      if (currentDigits && (currentDigits === digits || currentDigits.endsWith(digits) || digits.endsWith(currentDigits))) {
        throw new Error(`WhatsApp is already connected as +${digits}. No need to pair again!`);
      }
      console.log(`[WhatsApp Worker] Switching WhatsApp account to +${digits}. Logging out existing session...`);
      await this.logout(true);
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Try direct pairing code on active QR page if available
    if (this.client && this.state === 'QR_READY' && (this.client as any).pupPage) {
      try {
        console.log(`[WhatsApp Worker] Requesting pairing code directly from active page for +${digits}...`);
        this.state = 'WAITING_FOR_PAIRING';
        const code = await (this.client as any).requestPairingCode(digits);
        if (code) {
          this.pairingCode = String(code);
          return String(code);
        }
      } catch (err: any) {
        console.warn(`[WhatsApp Worker] Direct requestPairingCode failed: ${err.message}. Restarting with pairWithPhoneNumber...`);
      }
    }

    if (this.pairingCodeWaiter) {
      clearTimeout(this.pairingCodeWaiter.timeout);
      this.pairingCodeWaiter = null;
    }

    const codePromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pairingCodeWaiter) {
          this.pairingCodeWaiter = null;
          reject(new Error('Pairing code generation timed out. Please try again.'));
        }
      }, 60000);
      this.pairingCodeWaiter = { resolve, reject, timeout };
    });

    await this.initialize(digits);
    return codePromise;
  }

  public async logout(clearCredentials: boolean = true): Promise<void> {
    this.isExplicitLogout = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.pairingCodeWaiter) {
      clearTimeout(this.pairingCodeWaiter.timeout);
      this.pairingCodeWaiter.reject(new Error('Logout requested.'));
      this.pairingCodeWaiter = null;
    }

    this.state = 'DISCONNECTED';
    this.user = null;
    this.qrCodeDataUrl = null;
    this.pairingCode = null;

    if (this.client) {
      try {
        await this.client.logout();
      } catch (_) {}
      try {
        await this.client.destroy();
      } catch (_) {}
      this.client = null;
    }

    if (clearCredentials) {
      const authPath = this.getAuthPath();
      try {
        if (fs.existsSync(authPath)) {
          fs.rmSync(authPath, { recursive: true, force: true });
          console.log(`[WhatsApp Worker (${this.userId})] Cleared session files from`, authPath);
        }
      } catch (err: any) {
        console.warn(`[WhatsApp Worker (${this.userId})] Failed to clear session files:`, err.message);
      }
    }

    this.isExplicitLogout = false;
    setTimeout(() => {
      this.initialize().catch(() => {});
    }, 1000);
  }

  /**
   * Send WhatsApp message with exact /whatsapp-mess parity
   */
  public async sendMessage(
    to: string,
    text: string,
    media?: MediaInput,
    options?: SendOptions
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    if (!this.client) {
      return { success: false, error: 'WhatsApp client is not initialized.' };
    }

    if (this.state !== 'CONNECTED') {
      try {
        const state = await Promise.race([
          this.client.getState(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
        ]);
        if (state === 'CONNECTED') {
          this.state = 'CONNECTED';
        } else {
          return { success: false, error: 'WhatsApp Web is not connected. Please scan QR or enter pairing code.' };
        }
      } catch {
        return { success: false, error: 'WhatsApp Web is not connected. Please scan QR or enter pairing code.' };
      }
    }

    const digits = normalizePhoneNumber(to);
    if (!digits || digits.length < 10 || digits.length > 15) {
      return { success: false, error: `Invalid phone number format: ${to}` };
    }

    const cleanText = (text || '').trim();
    if (!cleanText && !media) {
      return { success: false, error: 'Message text or media is required.' };
    }

    // Recipient number ID lookup matching /whatsapp-mess session-service.ts
    const fallbackChatId = `${digits}@c.us`;
    let chatId = fallbackChatId;

    try {
      const numberId = await Promise.race([
        (this.client as any).getNumberId(digits),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000))
      ]);

      if (numberId?._serialized) {
        chatId = numberId._serialized;
      } else {
        console.log(`[WhatsApp Worker] Number lookup returned empty for ${digits}. Trying direct chat ID ${fallbackChatId}.`);
      }
    } catch (error: any) {
      console.warn(`[WhatsApp Worker] Number lookup failed for ${digits}: ${error.message || error}. Trying direct chat ID.`);
    }

    // Prepare media if provided
    let messageMedia: MessageMedia | null = null;
    if (media) {
      let base64Data = '';
      if (media.buffer) {
        base64Data = media.buffer.toString('base64');
      } else if (media.base64) {
        base64Data = media.base64.split(',')[1] || media.base64;
      }

      if (base64Data) {
        messageMedia = new MessageMedia(
          media.mimetype,
          base64Data,
          media.fileName || 'attachment'
        );
      }
    }

    let lastError: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (messageMedia) {
          try {
            if (options?.sendTextSeparately && cleanText) {
              const mediaSent = await this.client.sendMessage(chatId, messageMedia);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              const textSent = await this.client.sendMessage(chatId, cleanText);
              const msgId = (textSent as any)?.id?._serialized || (textSent as any)?.id?.id || (mediaSent as any)?.id?._serialized || `msg_${Date.now()}`;
              return { success: true, messageId: msgId };
            } else {
              // Unified delivery: media with caption as single message (matching /whatsapp-mess)
              const sent = await this.client.sendMessage(chatId, messageMedia, {
                caption: cleanText || undefined
              });
              const msgId = (sent as any)?.id?._serialized || (sent as any)?.id?.id || `msg_${Date.now()}`;
              return { success: true, messageId: msgId };
            }
          } catch (mediaErr: any) {
            console.warn(`[WhatsApp Worker] Media dispatch failed for ${digits} (${mediaErr.message}). Falling back to text delivery to guarantee 100% campaign completion...`);
            if (cleanText) {
              const sentFallback = await this.client.sendMessage(chatId, cleanText);
              const msgId = (sentFallback as any)?.id?._serialized || (sentFallback as any)?.id?.id || `msg_${Date.now()}`;
              return { success: true, messageId: msgId };
            }
            throw mediaErr;
          }
        }

        // Plain text message
        const sent = await this.client.sendMessage(chatId, cleanText);
        const msgId = (sent as any)?.id?._serialized || (sent as any)?.id?.id || `msg_${Date.now()}`;
        return { success: true, messageId: msgId };
      } catch (error: any) {
        lastError = error;
        console.warn(`[WhatsApp Worker] Send attempt ${attempt} failed for ${digits}:`, error.message || error);
        if (attempt < 2) {
          // Switch to direct fallbackChatId on retry if lookup ID failed
          if (chatId !== fallbackChatId) {
            chatId = fallbackChatId;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || `Failed to send message to ${digits}.`
    };
  }

  public getStatus(): WhatsAppServiceStatus {
    return {
      state: this.state,
      isConnected: this.state === 'CONNECTED',
      qrCodeDataUrl: this.qrCodeDataUrl,
      pairingCode: this.pairingCode,
      user: this.user,
      lastConnectedAt: this.lastConnectedAt,
      sessionDir: this.sessionDir,
      userId: this.userId
    };
  }

  public async destroy(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pairingCodeWaiter) {
      clearTimeout(this.pairingCodeWaiter.timeout);
      this.pairingCodeWaiter.reject(new Error('Session destroyed.'));
      this.pairingCodeWaiter = null;
    }
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (_) {}
      this.client = null;
    }
    this.state = 'DISCONNECTED';
  }

  private scheduleReconnect(delayMs: number): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.state !== 'CONNECTED' && !this.isExplicitLogout) {
        console.log(`[WhatsApp Worker (${this.userId})] Attempting reconnection...`);
        this.initialize().catch((err: any) => {
          console.error(`[WhatsApp Worker (${this.userId})] Reconnect error:`, err.message);
        });
      }
    }, delayMs);
  }

  public getClient(): Client | null {
    return this.client;
  }
}

/**
 * Multi-Session Manager: Coordinates isolated WhatsApp sessions keyed by userId.
 * Each user gets their own sandboxed Chromium context & session directory.
 */
export class MultiSessionManager {
  private sessions = new Map<string, WhatsAppSessionEngine>();
  private sessionDir: string;

  constructor(sessionDir: string = './sessions') {
    this.sessionDir = sessionDir;
    try {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    } catch (_) {}
  }

  public getSession(userId: string = 'default', autoCreate = true): WhatsAppSessionEngine | null {
    const cleanId = (userId || 'default').trim();
    let engine = this.sessions.get(cleanId);
    if (!engine && autoCreate) {
      engine = new WhatsAppSessionEngine(this.sessionDir, cleanId);
      this.sessions.set(cleanId, engine);
      engine.initialize().catch((err: any) => {
        console.error(`[MultiSessionManager] Auto-initialization error for user ${cleanId}:`, err.message);
      });
    }
    return engine || null;
  }

  public async removeSession(userId: string, clearCredentials: boolean = false): Promise<void> {
    const cleanId = (userId || 'default').trim();
    const engine = this.sessions.get(cleanId);
    if (engine) {
      await engine.logout(clearCredentials);
      await engine.destroy();
      this.sessions.delete(cleanId);
    }
  }

  public listSessions(): Array<{ userId: string; status: WhatsAppServiceStatus }> {
    const results: Array<{ userId: string; status: WhatsAppServiceStatus }> = [];
    for (const [uid, engine] of this.sessions.entries()) {
      results.push({
        userId: uid,
        status: engine.getStatus()
      });
    }
    return results;
  }

  public getActiveConnectedSession(): WhatsAppSessionEngine | null {
    // 1. Check if default is connected
    const defaultEngine = this.sessions.get('default');
    if (defaultEngine && defaultEngine.getStatus().isConnected && defaultEngine.getClient()) {
      return defaultEngine;
    }
    // 2. Return any active connected session
    for (const engine of this.sessions.values()) {
      if (engine.getStatus().isConnected && engine.getClient()) {
        return engine;
      }
    }
    return null;
  }

  public async autoRestoreSessions(): Promise<void> {
    try {
      if (!fs.existsSync(this.sessionDir)) return;
      const entries = fs.readdirSync(this.sessionDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        if (entry.name === 'wwebjs_auth') {
          console.log('[MultiSessionManager] Found existing default session on disk. Restoring...');
          this.getSession('default', true);
        } else if (entry.name.startsWith('wwebjs_auth_')) {
          const uid = entry.name.replace('wwebjs_auth_', '').trim();
          if (uid) {
            console.log(`[MultiSessionManager] Found existing session for user "${uid}" on disk. Restoring...`);
            this.getSession(uid, true);
          }
        }
      }
    } catch (err: any) {
      console.warn('[MultiSessionManager] Error auto-restoring sessions from disk:', err.message);
    }
  }
}
