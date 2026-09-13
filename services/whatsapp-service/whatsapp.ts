import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
  BufferJSON,
  CacheStore,
  Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class SimpleCacheStore implements CacheStore {
  private store = new Map<string, any>();

  get<T>(key: string): T | undefined {
    return this.store.get(key) as T;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  del(key: string): void {
    this.store.delete(key);
  }

  flushAll(): void {
    this.store.clear();
  }
}

export interface CachedMessageRecord {
  id: string;
  jid: string;
  message: proto.IMessage;
  text?: string;
  hasMedia?: boolean;
  timestamp: number;
}

export class MessageStore {
  private records = new Map<string, CachedMessageRecord>();
  private storeFilePath: string;
  private maxEntries = 3000;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(sessionDir: string) {
    this.storeFilePath = path.join(sessionDir, 'message_store.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storeFilePath)) {
        const raw = fs.readFileSync(this.storeFilePath, 'utf-8');
        const parsed = JSON.parse(raw, BufferJSON.reviver);
        if (parsed && typeof parsed === 'object') {
          for (const [key, val] of Object.entries(parsed)) {
            const rec = val as any;
            if (rec && rec.message) {
              this.records.set(key, rec as CachedMessageRecord);
            } else if (rec && typeof rec === 'object') {
              // Backward compatibility for raw proto objects
              this.records.set(key, {
                id: key,
                jid: '',
                message: rec as proto.IMessage,
                timestamp: Date.now()
              });
            }
          }
          console.log(`[WhatsApp Worker] Loaded ${this.records.size} cached message records from store.`);
        }
      }
    } catch (e) {
      console.warn('[WhatsApp Worker] Could not load message store from disk:', e);
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      try {
        const obj: Record<string, CachedMessageRecord> = {};
        for (const [k, v] of this.records.entries()) {
          obj[k] = v;
        }
        fs.writeFileSync(this.storeFilePath, JSON.stringify(obj, BufferJSON.replacer), 'utf-8');
      } catch (e) {
        console.warn('[WhatsApp Worker] Failed to save message store to disk:', e);
      }
    }, 1000);
  }

  public setRecord(id: string, record: CachedMessageRecord): void {
    if (!id || !record || !record.message) return;
    if (this.records.size >= this.maxEntries) {
      const oldestKey = this.records.keys().next().value;
      if (oldestKey) this.records.delete(oldestKey);
    }
    const cleanId = id.trim();
    this.records.set(cleanId, record);
    this.records.set(cleanId.toUpperCase(), record);
    this.records.set(cleanId.toLowerCase(), record);

    if (record.jid) {
      this.records.set(`${record.jid}:${cleanId}`, record);
      const cleanJid = record.jid.split('@')[0];
      this.records.set(`${cleanJid}:${cleanId}`, record);
    }
    this.scheduleSave();
  }

  public set(id: string, message: proto.IMessage, remoteJid?: string): void {
    this.setRecord(id, {
      id,
      jid: remoteJid || '',
      message,
      timestamp: Date.now()
    });
  }

  public getRecord(id: string, remoteJid?: string): CachedMessageRecord | undefined {
    if (!id) return undefined;
    const cleanId = id.trim();
    let rec = this.records.get(cleanId) || this.records.get(cleanId.toUpperCase()) || this.records.get(cleanId.toLowerCase());
    if (rec) return rec;

    if (remoteJid) {
      rec = this.records.get(`${remoteJid}:${cleanId}`) || this.records.get(`${remoteJid}:${cleanId.toUpperCase()}`);
      if (rec) return rec;
      const cleanJid = remoteJid.split('@')[0];
      rec = this.records.get(`${cleanJid}:${cleanId}`) || this.records.get(`${cleanJid}:${cleanId.toUpperCase()}`);
      if (rec) return rec;
    }

    // Secondary scan for compound key match (handles LID retry requests)
    const upperId = cleanId.toUpperCase();
    for (const [k, v] of this.records.entries()) {
      if (k.toUpperCase().endsWith(`:${upperId}`) || k.toUpperCase() === upperId) {
        return v;
      }
    }

    return undefined;
  }

  public get(id: string, remoteJid?: string): proto.IMessage | undefined {
    return this.getRecord(id, remoteJid)?.message;
  }

  public has(id: string): boolean {
    return this.records.has(id);
  }

  public clear(): void {
    this.records.clear();
    try {
      if (fs.existsSync(this.storeFilePath)) {
        fs.unlinkSync(this.storeFilePath);
      }
    } catch (e) {
      // ignore
    }
  }
}

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
  private isConnecting = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageStore: MessageStore;
  private msgRetryCounterCache = new SimpleCacheStore();
  private userDevicesCache = new SimpleCacheStore();
  private sendQueue: Promise<any> = Promise.resolve();

  constructor(sessionDir = './sessions') {
    this.sessionDir = path.resolve(sessionDir);
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
    this.messageStore = new MessageStore(this.sessionDir);
  }

  /**
   * Destroys existing socket and clears all event listeners.
   * Guarantees that only ONE active WASocket instance exists at any time.
   */
  private destroyCurrentSocket(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      try {
        this.socket.ev.removeAllListeners('connection.update');
        this.socket.ev.removeAllListeners('creds.update');
        this.socket.ev.removeAllListeners('messages.upsert');
        this.socket.ev.removeAllListeners('messages.update');
        const ws = (this.socket as any)?.ws;
        if (ws && typeof ws.close === 'function') {
          ws.close();
        }
        this.socket.end(undefined);
      } catch (e) {
        // Non-fatal cleanup
      }
      this.socket = null;
      console.log('[WhatsApp Worker] Previous WASocket instance cleanly destroyed.');
    }
  }

  /**
   * Debounced single-reconnect scheduler to eliminate socket stampedes.
   */
  private scheduleReconnect(delayMs: number): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.initialize();
    }, delayMs);
  }

  public clearSessionFiles(): void {
    this.messageStore.clear();
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
    // If already connected and socket is live, avoid duplicate initialization
    const isSocketReady = this.socket && ((this.socket as any)?.ws?.isOpen ?? (this.socket as any)?.ws?.socket?.readyState === 1);
    if (this.state === 'CONNECTED' && isSocketReady) {
      return;
    }
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.destroyCurrentSocket();

    this.state = 'CONNECTING';
    this.isExplicitLogout = false;

    try {
      const { state: authState, saveCreds } = await useMultiFileAuthState(this.sessionDir);

      this.socket = makeWASocket({
        auth: {
          creds: authState.creds,
          keys: makeCacheableSignalKeyStore(authState.keys, pino({ level: 'silent' }))
        },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.appropriate('Chrome'),
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: false,
        msgRetryCounterCache: this.msgRetryCounterCache,
        userDevicesCache: this.userDevicesCache,
        emitOwnEvents: true,
        getMessage: async (key: proto.IMessageKey): Promise<proto.IMessage | undefined> => {
          if (!key?.id) return undefined;
          const record = this.messageStore.getRecord(key.id, key.remoteJid || undefined);
          if (record?.message) {
            console.log(`[WhatsApp Worker] Responding to Signal retry request for message ID: ${key.id} (remote: ${key.remoteJid})`);
            return record.message;
          }
          console.warn(`[WhatsApp Worker] Signal retry requested for ID ${key.id}, but not found in messageStore.`);
          return undefined;
        }
      });

      this.socket.ev.on('creds.update', saveCreds);

      // Only store real user messages to prevent storage bloat and protocol desync
      this.socket.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
          if (msg.key?.id && msg.message) {
            const hasContent = !!(
              msg.message.conversation ||
              msg.message.extendedTextMessage ||
              msg.message.imageMessage ||
              msg.message.documentMessage ||
              msg.message.videoMessage ||
              msg.message.audioMessage
            );
            if (hasContent) {
              const text = (msg.message.conversation || msg.message.extendedTextMessage?.text) ?? undefined;
              this.messageStore.setRecord(msg.key.id, {
                id: msg.key.id,
                jid: msg.key.remoteJid || '',
                message: msg.message,
                text: text || undefined,
                hasMedia: !!(msg.message.imageMessage || msg.message.documentMessage),
                timestamp: Date.now()
              });
            }
          }
        }
      });

      // Track confirmed deliveries from recipient devices
      this.socket.ev.on('messages.update', updates => {
        for (const u of updates) {
          if (u.update.status === proto.WebMessageInfo.Status.DELIVERY_ACK) {
            console.log(`[WhatsApp Worker] Message ${u.key.id} confirmed DELIVERED to recipient device.`);
          } else if (u.update.status === proto.WebMessageInfo.Status.READ) {
            console.log(`[WhatsApp Worker] Message ${u.key.id} confirmed READ by recipient.`);
          }
        }
      });

      this.socket.ev.on('connection.update', async update => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          // Never overwrite connected state or pairing state with QR code
          if (this.state !== 'CONNECTED' && this.state !== 'WAITING_FOR_PAIRING') {
            try {
              this.qrCodeDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 7 });
              this.state = 'QR_CODE_REQUIRED';
              console.log('[WhatsApp Worker] Generated brand new QR Code data URL');
            } catch (e) {
              console.error('[WhatsApp Worker] Error rendering QR code data URL', e);
            }
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          console.log(`[WhatsApp Worker] Connection closed. Status: ${statusCode}, Current State: ${this.state}`);

          // Status 515 = Baileys stream restart required after initial handshake
          if (statusCode === 515) {
            console.log('[WhatsApp Worker] Baileys stream restart required (515). Reconnecting immediately with session...');
            this.state = 'CONNECTING';
            this.scheduleReconnect(500);
            return;
          }

          // Preserve noise keys when user is typing pairing code on mobile
          if (this.state === 'WAITING_FOR_PAIRING') {
            console.log('[WhatsApp Worker] Connection closed during pairing code entry. Reconnecting with pairing keys intact...');
            const shouldReconnect = !this.isExplicitLogout;
            if (shouldReconnect) {
              this.scheduleReconnect(1500);
            }
            return;
          }

          // Resilient 401 handling
          if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
            if (this.isExplicitLogout || this.reconnectAttempts >= 3) {
              console.log('[WhatsApp Worker] Permanent logout confirmed. Wiping session files and restarting...');
              this.clearSessionFiles();
              this.state = 'DISCONNECTED';
              this.user = null;
              this.qrCodeDataUrl = null;
              this.pairingCode = null;
              this.reconnectAttempts = 0;
              this.scheduleReconnect(1000);
              return;
            } else {
              console.log(`[WhatsApp Worker] 401 close intercepted. Reconnect attempt ${this.reconnectAttempts + 1}/3 with existing keys before wiping...`);
              this.reconnectAttempts++;
              this.scheduleReconnect(2000);
              return;
            }
          }

          const shouldReconnect = !this.isExplicitLogout;
          if (shouldReconnect) {
            this.state = 'RECONNECTING';
            const delay = Math.min(5000, 1000 * (this.reconnectAttempts + 1));
            this.reconnectAttempts++;
            this.scheduleReconnect(delay);
          } else {
            this.state = 'DISCONNECTED';
            this.user = null;
            this.qrCodeDataUrl = null;
            this.pairingCode = null;
            this.reconnectAttempts = 0;
          }
        } else if (connection === 'open') {
          this.state = 'CONNECTED';
          this.reconnectAttempts = 0;
          this.qrCodeDataUrl = null;
          this.pairingCode = null;
          this.lastConnectedAt = new Date().toISOString();

          if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
          }

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
      this.scheduleReconnect(2000);
    } finally {
      this.isConnecting = false;
    }
  }

  public async requestPairingCode(phoneNumber: string): Promise<string> {
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNumber) {
      throw new Error('Valid phone number with country code is required.');
    }

    // Smart country code normalization: If 10 digits, default to India +91
    if (cleanNumber.length === 10) {
      cleanNumber = '91' + cleanNumber;
    } else if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
      cleanNumber = '91' + cleanNumber.slice(1);
    }

    if (cleanNumber.length < 10 || cleanNumber.length > 15) {
      throw new Error(`Invalid phone number (+${cleanNumber}). Must include country code without spaces (e.g. +919876543210).`);
    }

    // If currently connected to an account:
    if (this.state === 'CONNECTED') {
      const currentDigits = this.user?.phoneNumber?.replace(/[^0-9]/g, '');
      if (currentDigits && (currentDigits === cleanNumber || currentDigits.endsWith(cleanNumber) || cleanNumber.endsWith(currentDigits))) {
        throw new Error(`WhatsApp is already connected as +${cleanNumber}. No need to pair again!`);
      }
      console.log(`[WhatsApp Worker] Switching WhatsApp account to +${cleanNumber}. Logging out existing session...`);
      await this.logout(true);
      await new Promise(r => setTimeout(r, 1500));
    }

    if (!this.socket) {
      await this.initialize();
    }

    // Wait until WebSocket is ready to receive requests
    for (let i = 0; i < 25; i++) {
      const isReady = (this.socket as any)?.ws?.isOpen ?? ((this.socket as any)?.ws?.socket?.readyState === 1);
      if (this.socket && isReady) break;
      await new Promise(r => setTimeout(r, 200));
    }

    this.state = 'WAITING_FOR_PAIRING';
    console.log(`[WhatsApp Worker] Requesting official WhatsApp pairing code for +${cleanNumber}...`);
    const code = await this.socket!.requestPairingCode(cleanNumber);
    this.pairingCode = code;
    console.log(`[WhatsApp Worker] Official pairing code generated: ${code} for +${cleanNumber}`);
    return code;
  }

  public async logout(clearCredentials = true): Promise<void> {
    this.isExplicitLogout = true;
    this.destroyCurrentSocket();

    this.state = 'DISCONNECTED';
    this.qrCodeDataUrl = null;
    this.pairingCode = null;
    this.user = null;

    if (clearCredentials) {
      this.clearSessionFiles();
    }

    this.scheduleReconnect(1000);
  }

  public async sendMessage(
    phoneNumber: string,
    text: string,
    media?: { buffer: Buffer; mimetype: string; fileName?: string; isImage?: boolean }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return new Promise(resolve => {
      this.sendQueue = this.sendQueue
        .then(async () => {
          try {
            const res = await this.doSendMessage(phoneNumber, text, media);
            resolve(res);
          } catch (err: any) {
            resolve({
              success: false,
              error: err?.message || 'Failed to dispatch message via WhatsApp queue'
            });
          }
        })
        .catch(err => {
          resolve({
            success: false,
            error: err?.message || 'Unexpected error in WhatsApp send queue'
          });
        });
    });
  }

  private async doSendMessage(
    phoneNumber: string,
    text: string,
    media?: { buffer: Buffer; mimetype: string; fileName?: string; isImage?: boolean }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // 1. Ensure socket is CONNECTED and WebSocket is open
    for (let i = 0; i < 25; i++) {
      const wsOpen = (this.socket as any)?.ws?.isOpen ?? ((this.socket as any)?.ws?.socket?.readyState === 1);
      if (this.state === 'CONNECTED' && this.socket && wsOpen) {
        break;
      }
      console.log(`[WhatsApp Worker] Waiting for socket readiness (state: ${this.state}, wsOpen: ${wsOpen})... (${i + 1}/25)`);
      await new Promise(r => setTimeout(r, 400));
    }

    const wsOpen = (this.socket as any)?.ws?.isOpen ?? ((this.socket as any)?.ws?.socket?.readyState === 1);
    if (this.state !== 'CONNECTED' || !this.socket || !wsOpen) {
      return {
        success: false,
        error: `WhatsApp socket is not open (state: ${this.state}, wsOpen: ${wsOpen}). Please verify your connection.`
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

    const cleanText = (text || '').trim();
    if (!cleanText && !media) {
      return { success: false, error: 'Cannot send empty message. Text or media is required.' };
    }

    try {
      // Pre-validate onWhatsApp
      try {
        const results = await this.socket.onWhatsApp(clean);
        if (results && results.length > 0) {
          if (!results[0].exists) {
            return {
              success: false,
              error: `Phone number +${clean} is not registered on WhatsApp.`
            };
          }
          jid = results[0].jid;
        }
      } catch (e) {
        console.warn('[WhatsApp Worker] onWhatsApp lookup warning:', e);
      }

      // Send composing indicator politely (NO presenceSubscribe which causes 408 on unfamiliar numbers)
      try {
        await this.socket.sendPresenceUpdate('composing', jid);
      } catch (e) {
        // Non-fatal
      }

      // Pre-generate unique message ID so it can be cached in MessageStore BEFORE send
      // Standard Baileys 3EB0 prefix + 16 random hex chars
      const msgId = '3EB0' + crypto.randomBytes(8).toString('hex').toUpperCase();

      // Pre-construct proto message for instant Signal retry response
      let protoMessage: proto.IMessage;
      if (media) {
        if (media.isImage) {
          protoMessage = {
            imageMessage: {
              caption: cleanText || undefined,
              mimetype: media.mimetype
            }
          };
        } else {
          protoMessage = {
            documentMessage: {
              caption: cleanText || undefined,
              mimetype: media.mimetype,
              fileName: media.fileName || 'document.pdf'
            }
          };
        }
      } else {
        protoMessage = {
          conversation: cleanText,
          extendedTextMessage: {
            text: cleanText
          }
        };
      }

      // Cache IMMEDIATELY in messageStore before dispatching over socket
      this.messageStore.setRecord(msgId, {
        id: msgId,
        jid,
        message: protoMessage,
        text: cleanText,
        hasMedia: !!media,
        timestamp: Date.now()
      });

      // Dispatch message with our pre-registered messageId
      let sentMsg: proto.WebMessageInfo | undefined;
      if (media) {
        if (media.isImage) {
          sentMsg = await this.socket.sendMessage(jid, {
            image: media.buffer,
            caption: cleanText || undefined
          }, { messageId: msgId });
        } else {
          sentMsg = await this.socket.sendMessage(jid, {
            document: media.buffer,
            mimetype: media.mimetype,
            fileName: media.fileName || 'document.pdf',
            caption: cleanText || undefined
          }, { messageId: msgId });
        }
      } else {
        sentMsg = await this.socket.sendMessage(jid, {
          text: cleanText
        }, { messageId: msgId });
      }

      // If Baileys returned full message proto, update our cached record with the exact proto
      if (sentMsg?.message) {
        this.messageStore.setRecord(msgId, {
          id: msgId,
          jid,
          message: sentMsg.message,
          text: cleanText,
          hasMedia: !!media,
          timestamp: Date.now()
        });
      }

      // Clear typing indicator
      try {
        await this.socket.sendPresenceUpdate('paused', jid);
      } catch (e) {
        // Non-fatal
      }

      console.log(`[WhatsApp Worker] Message successfully dispatched to ${jid} (ID: ${msgId})`);

      // Allow Signal ratchet state 1200ms to commit
      await new Promise(r => setTimeout(r, 1200));

      return {
        success: true,
        messageId: msgId
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
