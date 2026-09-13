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
    this.records.set(id, record);
    if (record.jid) {
      this.records.set(`${record.jid}:${id}`, record);
      const cleanJid = record.jid.split('@')[0];
      this.records.set(`${cleanJid}:${id}`, record);
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
    let rec = this.records.get(id);
    if (rec) return rec;

    if (remoteJid) {
      rec = this.records.get(`${remoteJid}:${id}`);
      if (rec) return rec;
      const cleanJid = remoteJid.split('@')[0];
      rec = this.records.get(`${cleanJid}:${id}`);
      if (rec) return rec;
    }

    // Secondary scan for compound key match
    for (const [k, v] of this.records.entries()) {
      if (k.endsWith(`:${id}`) || k.includes(id)) {
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
    if (this.state === 'CONNECTED') return;

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
        getMessage: async (key: proto.IMessageKey): Promise<proto.IMessage | undefined> => {
          if (!key?.id) return undefined;
          const record = this.messageStore.getRecord(key.id);
          const msg = record?.message || this.messageStore.get(key.id, key.remoteJid || undefined);
          if (msg) {
            console.log(`[WhatsApp Worker] Responding to Signal retry request for message ID: ${key.id} (remote: ${key.remoteJid})`);
            // Proactive reinforcement: if decryption struggled or arrived via LID, ensure recipient phone gets a reliable copy
            if (record && record.jid) {
              const targetJid = record.jid;
              setTimeout(async () => {
                try {
                  if (this.socket && this.state === 'CONNECTED' && record.text) {
                    console.log(`[WhatsApp Worker] Delivering reinforced copy to ${targetJid} (original ID: ${key.id})...`);
                    await this.socket.sendMessage(targetJid, { text: record.text });
                  }
                } catch (e: any) {
                  console.warn('[WhatsApp Worker] Reinforcement notice:', e.message);
                }
              }, 1200);
            }
            return msg;
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

        if (qr && this.state !== 'WAITING_FOR_PAIRING') {
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
          console.log(`[WhatsApp Worker] Connection closed. Status: ${statusCode}, Current State: ${this.state}`);

          // CRITICAL: If waiting for the user to type the pairing code on their phone,
          // DO NOT wipe creds! The pairing noise keys must be preserved for WhatsApp to finish linking!
          if (this.state === 'WAITING_FOR_PAIRING') {
            console.log('[WhatsApp Worker] Connection closed during pairing code entry. Reconnecting with pairing keys intact...');
            const shouldReconnect = !this.isExplicitLogout;
            if (shouldReconnect) {
              setTimeout(() => this.initialize(), 1500);
            }
            return;
          }

          this.user = null;
          this.qrCodeDataUrl = null;
          this.pairingCode = null;

          // Resilient 401 handling: WhatsApp occasionally drops socket on temporary rate limits or key renegotiations.
          // Only permanently wipe if user explicitly requested logout or after 3 consecutive failed reconnect attempts.
          if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
            if (this.isExplicitLogout || this.reconnectAttempts >= 3) {
              console.log('[WhatsApp Worker] Permanent logout confirmed. Wiping session files and restarting...');
              this.clearSessionFiles();
              this.state = 'DISCONNECTED';
              this.reconnectAttempts = 0;
              setTimeout(() => this.initialize(), 1000);
              return;
            } else {
              console.log(`[WhatsApp Worker] 401 close intercepted. Reconnect attempt ${this.reconnectAttempts + 1}/3 with existing keys before wiping...`);
              this.reconnectAttempts++;
              setTimeout(() => this.initialize(), 2000);
              return;
            }
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
      if (this.socket && (this.socket as any).ws?.readyState === 1) break;
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

    const cleanText = (text || '').trim();
    if (!cleanText && !media) {
      return { success: false, error: 'Cannot send empty message. Text or media is required.' };
    }

    try {
      // Pre-validate onWhatsApp to ensure contact exists and resolve correct JID
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

      // Step 1: Pre-warm Signal E2EE session by subscribing to recipient presence
      console.log(`[WhatsApp Worker] Pre-warming contact ${jid} with presence & composing state...`);
      try {
        await this.socket.presenceSubscribe(jid);
      } catch (e) {
        // Non-fatal
      }

      // Step 2: Send 'composing' typing status so recipient phone wakes up and aligns Signal prekeys
      try {
        await this.socket.sendPresenceUpdate('composing', jid);
      } catch (e) {
        // Non-fatal
      }

      // Pause 2000ms while "typing" to give recipient phone time to wake up and finalize Signal session
      await new Promise(r => setTimeout(r, 2000));

      // Step 3: Dispatch message
      let sentMsg: proto.WebMessageInfo | undefined;

      if (media) {
        if (media.isImage) {
          sentMsg = await this.socket.sendMessage(jid, {
            image: media.buffer,
            caption: cleanText || undefined
          });
        } else {
          sentMsg = await this.socket.sendMessage(jid, {
            document: media.buffer,
            mimetype: media.mimetype,
            fileName: media.fileName || 'document.pdf',
            caption: cleanText || undefined
          });
        }
      } else {
        sentMsg = await this.socket.sendMessage(jid, { text: cleanText });
      }

      // Step 4: Clear typing indicator
      try {
        await this.socket.sendPresenceUpdate('paused', jid);
      } catch (e) {
        // Non-fatal
      }

      // Cache the message in MessageStore with full metadata for Signal retry delivery
      const msgId = sentMsg?.key?.id;
      if (msgId && sentMsg?.message) {
        this.messageStore.setRecord(msgId, {
          id: msgId,
          jid,
          message: sentMsg.message,
          text: cleanText,
          hasMedia: !!media,
          timestamp: Date.now()
        });
        console.log(`[WhatsApp Worker] Message cached with metadata: ${jid} (ID: ${msgId})`);
      }
      console.log(`[WhatsApp Worker] Message dispatched to ${jid} (ID: ${msgId})`);

      // Step 5: Critical Settling Delay (2000ms)
      // Ensures Signal ratchet state is fully committed before the next contact can begin
      await new Promise(r => setTimeout(r, 2000));

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
