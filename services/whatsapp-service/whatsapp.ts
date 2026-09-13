import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export type ConnectionState =
  | 'CONNECTING'
  | 'QR_CODE_REQUIRED'
  | 'WAITING_FOR_PAIRING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'RECONNECTING';

export interface WhatsAppServiceStatus {
  state: ConnectionState;
  isConnected: boolean;
  qrCodeDataUrl: string | null;
  pairingCode: string | null;
  user: {
    id: string | null;
    name: string | null;
    phoneNumber: string | null;
  } | null;
  lastConnectedAt: string | null;
  sessionDir: string;
}

export class WhatsAppSessionEngine {
  private socket: WASocket | null = null;
  private state: ConnectionState = 'DISCONNECTED';
  private qrCodeDataUrl: string | null = null;
  private pairingCode: string | null = null;
  private user: { id: string | null; name: string | null; phoneNumber: string | null } | null = null;
  private lastConnectedAt: string | null = null;
  private sessionDir: string;
  private reconnectAttempts = 0;
  private isExplicitLogout = false;

  constructor(sessionDir = './sessions') {
    this.sessionDir = path.resolve(sessionDir);
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  public clearSessionFiles(): void {
    if (fs.existsSync(this.sessionDir)) {
      try {
        fs.rmSync(this.sessionDir, { recursive: true, force: true });
        fs.mkdirSync(this.sessionDir, { recursive: true });
        console.log('[WhatsApp Worker] Session files wiped clean:', this.sessionDir);
      } catch (err) {
        console.error('[WhatsApp Worker] Error clearing session files:', err);
      }
    }
  }

  public async initialize(): Promise<void> {
    if (this.state === 'CONNECTED') return;

    this.state = 'CONNECTING';
    this.isExplicitLogout = false;

    try {
      const { state: authState, saveCreds } = await useMultiFileAuthState(this.sessionDir);

      this.socket = makeWASocket({
        auth: authState,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['ToolNest Web', 'Chrome', '124.0.0.0'],
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
        syncFullHistory: false
      });

      this.socket.ev.on('creds.update', saveCreds);

      this.socket.ev.on('connection.update', async update => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            this.qrCodeDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 7 });
            this.state = 'QR_CODE_REQUIRED';
            console.log('[WhatsApp Worker] Generated brand new QR Code data URL');
          } catch (e) {
            console.error('[WhatsApp Worker] Error rendering QR code data URL', e);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          console.log(`[WhatsApp Worker] Connection closed. Status: ${statusCode}`);

          this.user = null;
          this.qrCodeDataUrl = null;
          this.pairingCode = null;

          // Critical fix: If WhatsApp revoked credentials (401 / loggedOut), wipe dead keys immediately
          if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
            console.log('[WhatsApp Worker] Stale session detected (401). Wiping dead keys and restarting...');
            this.clearSessionFiles();
            this.state = 'DISCONNECTED';
            this.reconnectAttempts = 0;
            setTimeout(() => this.initialize(), 1000);
            return;
          }

          const shouldReconnect = !this.isExplicitLogout;

          if (shouldReconnect) {
            this.state = 'RECONNECTING';
            const delay = Math.min(6000, Math.pow(2, Math.min(this.reconnectAttempts, 3)) * 1000);
            this.reconnectAttempts++;
            setTimeout(() => this.initialize(), delay);
          } else {
            this.state = 'DISCONNECTED';
            this.reconnectAttempts = 0;
            if (!this.isExplicitLogout) {
              setTimeout(() => this.initialize(), 1500);
            }
          }
        } else if (connection === 'open') {
          this.state = 'CONNECTED';
          this.reconnectAttempts = 0;
          this.qrCodeDataUrl = null;
          this.pairingCode = null;
          this.lastConnectedAt = new Date().toISOString();

          const me = this.socket?.user;
          const phone = me?.id ? me.id.split(':')[0] : null;

          this.user = {
            id: me?.id || null,
            name: me?.name || 'WhatsApp Account',
            phoneNumber: phone ? `+${phone}` : null
          };

          console.log(`[WhatsApp Worker] Successfully connected as ${this.user.name} (${this.user.phoneNumber})`);
        }
      });
    } catch (err) {
      console.error('[WhatsApp Worker] Failed to initialize Baileys session', err);
      this.clearSessionFiles();
      this.state = 'DISCONNECTED';
      setTimeout(() => this.initialize(), 2000);
    }
  }

  public async requestPairingCode(phoneNumber: string): Promise<string> {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber || cleanNumber.length < 8) {
      throw new Error('Valid phone number with country code is required.');
    }

    if (!this.socket) {
      await this.initialize();
    }

    this.state = 'WAITING_FOR_PAIRING';
    const code = await this.socket!.requestPairingCode(cleanNumber);
    this.pairingCode = code;
    return code;
  }

  public async logout(clearCredentials = true): Promise<void> {
    this.isExplicitLogout = true;
    try {
      if (this.socket) {
        await this.socket.logout().catch(() => {});
        this.socket.end(undefined);
      }
    } catch (e) {
      // Ignore
    }

    this.socket = null;
    this.state = 'DISCONNECTED';
    this.qrCodeDataUrl = null;
    this.pairingCode = null;
    this.user = null;

    if (clearCredentials) {
      this.clearSessionFiles();
    }

    setTimeout(() => {
      this.initialize();
    }, 1000);
  }

  public async sendMessage(
    phoneNumber: string,
    text: string,
    media?: { buffer: Buffer; mimetype: string; fileName?: string; isImage?: boolean }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // If socket is briefly reconnecting or negotiating, wait up to 10s before failing
    if (this.state !== 'CONNECTED' || !this.socket) {
      console.log(`[WhatsApp Worker] Socket state is ${this.state}. Waiting up to 10s for connection to stabilize...`);
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        if (this.state === 'CONNECTED' && this.socket) break;
      }
    }

    if (this.state !== 'CONNECTED' || !this.socket) {
      return {
        success: false,
        error: `WhatsApp session is currently ${this.state}. Please make sure your phone is connected.`
      };
    }

    let clean = phoneNumber.replace(/[^0-9]/g, '');
    if (!clean) {
      return { success: false, error: 'Recipient phone number is invalid.' };
    }

    let defaultCountryPrefix = '91';
    if (this.user?.phoneNumber) {
      const userDigits = this.user.phoneNumber.replace(/[^0-9]/g, '');
      if (userDigits.length >= 10) {
        const prefix = userDigits.slice(0, userDigits.length - 10);
        if (prefix) defaultCountryPrefix = prefix;
      }
    }

    if (clean.length === 10) {
      clean = defaultCountryPrefix + clean;
    } else if (clean.length === 11 && clean.startsWith('0')) {
      clean = defaultCountryPrefix + clean.slice(1);
    }

    let jid = `${clean}@s.whatsapp.net`;

    try {
      try {
        const results = await this.socket.onWhatsApp(clean);
        if (results && results.length > 0 && results[0]?.exists) {
          jid = results[0].jid;
        }
      } catch (e) {
        console.warn('[WhatsApp Worker] onWhatsApp lookup warning:', e);
      }

      let sentMsg: proto.WebMessageInfo | undefined;

      if (media) {
        if (media.isImage) {
          sentMsg = await this.socket.sendMessage(jid, {
            image: media.buffer,
            caption: text || undefined
          });
        } else {
          sentMsg = await this.socket.sendMessage(jid, {
            document: media.buffer,
            mimetype: media.mimetype,
            fileName: media.fileName || 'document.pdf',
            caption: text || undefined
          });
        }
      } else {
        sentMsg = await this.socket.sendMessage(jid, { text });
      }

      const msgId = sentMsg?.key?.id;
      console.log(`[WhatsApp Worker] Message dispatched to ${jid} (ID: ${msgId})`);

      return {
        success: true,
        messageId: msgId || undefined
      };
    } catch (err: any) {
      console.error(`[WhatsApp Worker] Failed to send message to ${jid}:`, err);
      return {
        success: false,
        error: err.message || 'Failed to dispatch message via WhatsApp socket'
      };
    }
  }

  public getStatus(): WhatsAppServiceStatus {
    return {
      state: this.state,
      isConnected: this.state === 'CONNECTED',
      qrCodeDataUrl: this.qrCodeDataUrl,
      pairingCode: this.pairingCode,
      user: this.user,
      lastConnectedAt: this.lastConnectedAt,
      sessionDir: this.sessionDir
    };
  }
}
