"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppSessionEngine = exports.MessageStore = exports.SimpleCacheStore = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const pino_1 = __importDefault(require("pino"));
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
class SimpleCacheStore {
    store = new Map();
    get(key) {
        return this.store.get(key);
    }
    set(key, value) {
        this.store.set(key, value);
    }
    del(key) {
        this.store.delete(key);
    }
    flushAll() {
        this.store.clear();
    }
}
exports.SimpleCacheStore = SimpleCacheStore;
class MessageStore {
    records = new Map();
    storeFilePath;
    maxEntries = 3000;
    saveTimeout = null;
    constructor(sessionDir) {
        this.storeFilePath = path_1.default.join(sessionDir, 'message_store.json');
        this.loadFromDisk();
    }
    loadFromDisk() {
        try {
            if (fs_1.default.existsSync(this.storeFilePath)) {
                const raw = fs_1.default.readFileSync(this.storeFilePath, 'utf-8');
                const parsed = JSON.parse(raw, baileys_1.BufferJSON.reviver);
                if (parsed && typeof parsed === 'object') {
                    for (const [key, val] of Object.entries(parsed)) {
                        const rec = val;
                        if (rec && rec.message) {
                            this.records.set(key, rec);
                        }
                        else if (rec && typeof rec === 'object') {
                            // Backward compatibility for raw proto objects
                            this.records.set(key, {
                                id: key,
                                jid: '',
                                message: rec,
                                timestamp: Date.now()
                            });
                        }
                    }
                    console.log(`[WhatsApp Worker] Loaded ${this.records.size} cached message records from store.`);
                }
            }
        }
        catch (e) {
            console.warn('[WhatsApp Worker] Could not load message store from disk:', e);
        }
    }
    scheduleSave() {
        if (this.saveTimeout)
            return;
        this.saveTimeout = setTimeout(() => {
            this.saveTimeout = null;
            try {
                const obj = {};
                for (const [k, v] of this.records.entries()) {
                    obj[k] = v;
                }
                fs_1.default.writeFileSync(this.storeFilePath, JSON.stringify(obj, baileys_1.BufferJSON.replacer), 'utf-8');
            }
            catch (e) {
                console.warn('[WhatsApp Worker] Failed to save message store to disk:', e);
            }
        }, 1000);
    }
    setRecord(id, record) {
        if (!id || !record || !record.message)
            return;
        if (this.records.size >= this.maxEntries) {
            const oldestKey = this.records.keys().next().value;
            if (oldestKey)
                this.records.delete(oldestKey);
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
    set(id, message, remoteJid) {
        this.setRecord(id, {
            id,
            jid: remoteJid || '',
            message,
            timestamp: Date.now()
        });
    }
    getRecord(id, remoteJid) {
        if (!id)
            return undefined;
        const cleanId = id.trim();
        let rec = this.records.get(cleanId) || this.records.get(cleanId.toUpperCase()) || this.records.get(cleanId.toLowerCase());
        if (rec)
            return rec;
        if (remoteJid) {
            rec = this.records.get(`${remoteJid}:${cleanId}`) || this.records.get(`${remoteJid}:${cleanId.toUpperCase()}`);
            if (rec)
                return rec;
            const cleanJid = remoteJid.split('@')[0];
            rec = this.records.get(`${cleanJid}:${cleanId}`) || this.records.get(`${cleanJid}:${cleanId.toUpperCase()}`);
            if (rec)
                return rec;
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
    get(id, remoteJid) {
        return this.getRecord(id, remoteJid)?.message;
    }
    has(id) {
        return this.records.has(id);
    }
    clear() {
        this.records.clear();
        try {
            if (fs_1.default.existsSync(this.storeFilePath)) {
                fs_1.default.unlinkSync(this.storeFilePath);
            }
        }
        catch (e) {
            // ignore
        }
    }
}
exports.MessageStore = MessageStore;
class WhatsAppSessionEngine {
    socket = null;
    state = 'DISCONNECTED';
    qrCodeDataUrl = null;
    pairingCode = null;
    user = null;
    lastConnectedAt = null;
    sessionDir;
    reconnectAttempts = 0;
    isExplicitLogout = false;
    isConnecting = false;
    reconnectTimer = null;
    messageStore;
    msgRetryCounterCache = new SimpleCacheStore();
    userDevicesCache = new SimpleCacheStore();
    sendQueue = Promise.resolve();
    constructor(sessionDir = './sessions') {
        this.sessionDir = path_1.default.resolve(sessionDir);
        if (!fs_1.default.existsSync(this.sessionDir)) {
            fs_1.default.mkdirSync(this.sessionDir, { recursive: true });
        }
        this.messageStore = new MessageStore(this.sessionDir);
    }
    /**
     * Destroys existing socket and clears all event listeners.
     * Guarantees that only ONE active WASocket instance exists at any time.
     */
    destroyCurrentSocket() {
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
                const ws = this.socket?.ws;
                if (ws && typeof ws.close === 'function') {
                    ws.close();
                }
                this.socket.end(undefined);
            }
            catch (e) {
                // Non-fatal cleanup
            }
            this.socket = null;
            console.log('[WhatsApp Worker] Previous WASocket instance cleanly destroyed.');
        }
    }
    /**
     * Debounced single-reconnect scheduler to eliminate socket stampedes.
     */
    scheduleReconnect(delayMs) {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.initialize();
        }, delayMs);
    }
    clearSessionFiles() {
        this.messageStore.clear();
        if (fs_1.default.existsSync(this.sessionDir)) {
            try {
                fs_1.default.rmSync(this.sessionDir, { recursive: true, force: true });
                fs_1.default.mkdirSync(this.sessionDir, { recursive: true });
                console.log('[WhatsApp Worker] Session files wiped clean:', this.sessionDir);
            }
            catch (err) {
                console.error('[WhatsApp Worker] Error clearing session files:', err);
            }
        }
    }
    async initialize() {
        // If already connected and socket is live, avoid duplicate initialization
        const isSocketReady = this.socket && (this.socket?.ws?.isOpen ?? this.socket?.ws?.socket?.readyState === 1);
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
            const { state: authState, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(this.sessionDir);
            this.socket = (0, baileys_1.default)({
                auth: {
                    creds: authState.creds,
                    keys: (0, baileys_1.makeCacheableSignalKeyStore)(authState.keys, (0, pino_1.default)({ level: 'silent' }))
                },
                printQRInTerminal: false,
                logger: (0, pino_1.default)({ level: 'silent' }),
                browser: baileys_1.Browsers.appropriate('Chrome'),
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 15000,
                syncFullHistory: false,
                markOnlineOnConnect: true,
                generateHighQualityLinkPreview: false,
                msgRetryCounterCache: this.msgRetryCounterCache,
                userDevicesCache: this.userDevicesCache,
                emitOwnEvents: true,
                shouldIgnoreJid: (jid) => jid.endsWith('@broadcast') || jid.includes('newsletter'),
                resolveLidToJid: (msgId, remoteJid) => {
                    const rec = this.messageStore.getRecord(msgId, remoteJid);
                    if (rec?.jid && !rec.jid.endsWith('@lid')) {
                        return rec.jid;
                    }
                    return undefined;
                },
                getMessage: async (key) => {
                    if (!key?.id)
                        return undefined;
                    const record = this.messageStore.getRecord(key.id, key.remoteJid || undefined);
                    if (record?.message) {
                        console.log(`[WhatsApp Worker] Responding to Signal retry request for message ID: ${key.id} (remote: ${key.remoteJid}, chat: ${record.jid})`);
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
                        const hasContent = !!(msg.message.conversation ||
                            msg.message.extendedTextMessage ||
                            msg.message.imageMessage ||
                            msg.message.documentMessage ||
                            msg.message.videoMessage ||
                            msg.message.audioMessage);
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
                    if (u.update.status === baileys_1.proto.WebMessageInfo.Status.DELIVERY_ACK) {
                        console.log(`[WhatsApp Worker] Message ${u.key.id} confirmed DELIVERED to recipient device.`);
                    }
                    else if (u.update.status === baileys_1.proto.WebMessageInfo.Status.READ) {
                        console.log(`[WhatsApp Worker] Message ${u.key.id} confirmed READ by recipient.`);
                    }
                }
            });
            this.socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    // Never overwrite connected state or pairing state with QR code
                    if (this.state !== 'CONNECTED' && this.state !== 'WAITING_FOR_PAIRING') {
                        try {
                            this.qrCodeDataUrl = await qrcode_1.default.toDataURL(qr, { margin: 2, scale: 7 });
                            this.state = 'QR_CODE_REQUIRED';
                            console.log('[WhatsApp Worker] Generated brand new QR Code data URL');
                        }
                        catch (e) {
                            console.error('[WhatsApp Worker] Error rendering QR code data URL', e);
                        }
                    }
                }
                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
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
                    if (statusCode === baileys_1.DisconnectReason.loggedOut || statusCode === 401) {
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
                        }
                        else {
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
                    }
                    else {
                        this.state = 'DISCONNECTED';
                        this.user = null;
                        this.qrCodeDataUrl = null;
                        this.pairingCode = null;
                        this.reconnectAttempts = 0;
                    }
                }
                else if (connection === 'open') {
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
        }
        catch (err) {
            console.error('[WhatsApp Worker] Failed to initialize Baileys session', err);
            this.clearSessionFiles();
            this.state = 'DISCONNECTED';
            this.scheduleReconnect(2000);
        }
        finally {
            this.isConnecting = false;
        }
    }
    async requestPairingCode(phoneNumber) {
        let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!cleanNumber) {
            throw new Error('Valid phone number with country code is required.');
        }
        // Smart country code normalization: If 10 digits, default to India +91
        if (cleanNumber.length === 10) {
            cleanNumber = '91' + cleanNumber;
        }
        else if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
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
            const isReady = this.socket?.ws?.isOpen ?? (this.socket?.ws?.socket?.readyState === 1);
            if (this.socket && isReady)
                break;
            await new Promise(r => setTimeout(r, 200));
        }
        this.state = 'WAITING_FOR_PAIRING';
        console.log(`[WhatsApp Worker] Requesting official WhatsApp pairing code for +${cleanNumber}...`);
        const code = await this.socket.requestPairingCode(cleanNumber);
        this.pairingCode = code;
        console.log(`[WhatsApp Worker] Official pairing code generated: ${code} for +${cleanNumber}`);
        return code;
    }
    async logout(clearCredentials = true) {
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
    async sendMessage(phoneNumber, text, media, options) {
        return new Promise(resolve => {
            this.sendQueue = this.sendQueue
                .then(async () => {
                try {
                    const res = await this.doSendMessage(phoneNumber, text, media, options);
                    resolve(res);
                }
                catch (err) {
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
    async doSendMessage(phoneNumber, text, media, options) {
        // 1. Ensure socket is CONNECTED and WebSocket is open
        for (let i = 0; i < 25; i++) {
            const wsOpen = this.socket?.ws?.isOpen ?? (this.socket?.ws?.socket?.readyState === 1);
            if (this.state === 'CONNECTED' && this.socket && wsOpen) {
                break;
            }
            console.log(`[WhatsApp Worker] Waiting for socket readiness (state: ${this.state}, wsOpen: ${wsOpen})... (${i + 1}/25)`);
            await new Promise(r => setTimeout(r, 400));
        }
        const wsOpen = this.socket?.ws?.isOpen ?? (this.socket?.ws?.socket?.readyState === 1);
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
                if (prefix)
                    defaultCountryPrefix = prefix;
            }
        }
        if (clean.length === 10) {
            clean = defaultCountryPrefix + clean;
        }
        else if (clean.length === 11 && clean.startsWith('0')) {
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
            }
            catch (e) {
                console.warn('[WhatsApp Worker] onWhatsApp lookup warning:', e);
            }
            // Send composing indicator politely to warm up session
            try {
                await this.socket.sendPresenceUpdate('composing', jid);
                await new Promise(r => setTimeout(r, 600));
            }
            catch (e) {
                // Non-fatal
            }
            // Validate existing Signal session to prevent stale/closed ratchet decryption failure
            try {
                const sessionUser = clean;
                const sessionFile = path_1.default.join(this.sessionDir, `session-${sessionUser}.0.json`);
                if (fs_1.default.existsSync(sessionFile)) {
                    const raw = fs_1.default.readFileSync(sessionFile, 'utf-8');
                    const parsed = JSON.parse(raw);
                    const sessionsObj = parsed?._sessions || {};
                    let hasOpenSession = false;
                    for (const s of Object.values(sessionsObj)) {
                        if (s?.indexInfo && s.indexInfo.closed === -1) {
                            hasOpenSession = true;
                            break;
                        }
                    }
                    if (!hasOpenSession) {
                        console.log(`[WhatsApp Worker] Removing stale closed session for ${sessionUser} to force fresh PreKey assert`);
                        fs_1.default.unlinkSync(sessionFile);
                        if (typeof this.socket?.assertSessions === 'function') {
                            await this.socket.assertSessions([jid], true);
                        }
                    }
                }
            }
            catch (sessCheckErr) {
                console.warn('[WhatsApp Worker] Stale session check warning:', sessCheckErr);
            }
            let primaryMsgId = '';
            // If media is present, dispatch media message (with caption)
            if (media) {
                const mediaMsgId = '3EB0' + crypto_1.default.randomBytes(8).toString('hex').toUpperCase();
                primaryMsgId = mediaMsgId;
                const mediaContent = media.isImage
                    ? {
                        image: media.buffer,
                        caption: cleanText || undefined,
                        mimetype: media.mimetype
                    }
                    : {
                        document: media.buffer,
                        mimetype: media.mimetype,
                        fileName: media.fileName || 'document.pdf',
                        caption: cleanText || undefined
                    };
                const fullMediaMsg = await (0, baileys_1.generateWAMessage)(jid, mediaContent, {
                    userJid: this.socket.user?.id || this.user?.id || this.socket.authState?.creds?.me?.id,
                    upload: this.socket.waUploadToServer,
                    messageId: mediaMsgId,
                    logger: this.socket.logger
                });
                if (!fullMediaMsg?.message) {
                    throw new Error('Failed to generate valid WhatsApp media payload');
                }
                // Cache media message in store before send
                this.messageStore.setRecord(mediaMsgId, {
                    id: mediaMsgId,
                    jid,
                    message: fullMediaMsg.message,
                    text: cleanText,
                    hasMedia: true,
                    timestamp: Date.now()
                });
                await this.socket.relayMessage(jid, fullMediaMsg.message, {
                    messageId: mediaMsgId
                });
                console.log(`[WhatsApp Worker] Media message successfully dispatched to ${jid} (ID: ${mediaMsgId})`);
                // Smart Dual Delivery: If text template is present and separate text delivery is enabled (default true)
                // Send the complete text template so that new users (who do not auto-download media) immediately see the full text!
                const shouldSendSeparateText = options?.sendTextSeparately !== false && !!cleanText;
                if (shouldSendSeparateText) {
                    // Allow 2500ms for recipient device to complete and commit the first Signal ratchet handshake
                    await new Promise(r => setTimeout(r, 2500));
                    const textMsgId = '3EB0' + crypto_1.default.randomBytes(8).toString('hex').toUpperCase();
                    const textContent = { text: cleanText };
                    const fullTextMsg = await (0, baileys_1.generateWAMessage)(jid, textContent, {
                        userJid: this.socket.user?.id || this.user?.id || this.socket.authState?.creds?.me?.id,
                        upload: this.socket.waUploadToServer,
                        messageId: textMsgId,
                        logger: this.socket.logger
                    });
                    if (fullTextMsg?.message) {
                        this.messageStore.setRecord(textMsgId, {
                            id: textMsgId,
                            jid,
                            message: fullTextMsg.message,
                            text: cleanText,
                            hasMedia: false,
                            timestamp: Date.now()
                        });
                        await this.socket.relayMessage(jid, fullTextMsg.message, {
                            messageId: textMsgId
                        });
                        console.log(`[WhatsApp Worker] Guaranteed text template dispatched to ${jid} (ID: ${textMsgId})`);
                    }
                }
            }
            else {
                // Plain text message
                const textMsgId = '3EB0' + crypto_1.default.randomBytes(8).toString('hex').toUpperCase();
                primaryMsgId = textMsgId;
                const textContent = { text: cleanText };
                const fullMsg = await (0, baileys_1.generateWAMessage)(jid, textContent, {
                    userJid: this.socket.user?.id || this.user?.id || this.socket.authState?.creds?.me?.id,
                    upload: this.socket.waUploadToServer,
                    messageId: textMsgId,
                    logger: this.socket.logger
                });
                if (!fullMsg?.message) {
                    throw new Error('Failed to generate valid WhatsApp message payload');
                }
                this.messageStore.setRecord(textMsgId, {
                    id: textMsgId,
                    jid,
                    message: fullMsg.message,
                    text: cleanText,
                    hasMedia: false,
                    timestamp: Date.now()
                });
                await this.socket.relayMessage(jid, fullMsg.message, {
                    messageId: textMsgId
                });
                console.log(`[WhatsApp Worker] Message successfully dispatched to ${jid} (ID: ${textMsgId})`);
            }
            // Clear typing indicator
            try {
                await this.socket.sendPresenceUpdate('paused', jid);
            }
            catch (e) {
                // Non-fatal
            }
            // Allow Signal ratchet state 1000ms to commit
            await new Promise(r => setTimeout(r, 1000));
            return {
                success: true,
                messageId: primaryMsgId
            };
        }
        catch (err) {
            console.error(`[WhatsApp Worker] Failed to send message to ${jid}:`, err);
            return {
                success: false,
                error: err.message || 'Failed to dispatch message via WhatsApp socket'
            };
        }
    }
    getStatus() {
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
exports.WhatsAppSessionEngine = WhatsAppSessionEngine;
