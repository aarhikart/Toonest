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
    messages = new Map();
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
                        this.messages.set(key, val);
                    }
                    console.log(`[WhatsApp Worker] Loaded ${this.messages.size} cached messages from store.`);
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
                for (const [k, v] of this.messages.entries()) {
                    obj[k] = v;
                }
                fs_1.default.writeFileSync(this.storeFilePath, JSON.stringify(obj, baileys_1.BufferJSON.replacer), 'utf-8');
            }
            catch (e) {
                console.warn('[WhatsApp Worker] Failed to save message store to disk:', e);
            }
        }, 1500);
    }
    set(id, message) {
        if (!id || !message)
            return;
        if (this.messages.size >= this.maxEntries) {
            const oldestKey = this.messages.keys().next().value;
            if (oldestKey)
                this.messages.delete(oldestKey);
        }
        this.messages.set(id, message);
        this.scheduleSave();
    }
    get(id) {
        return this.messages.get(id);
    }
    has(id) {
        return this.messages.has(id);
    }
    clear() {
        this.messages.clear();
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
    messageStore;
    msgRetryCounterCache = new SimpleCacheStore();
    userDevicesCache = new SimpleCacheStore();
    constructor(sessionDir = './sessions') {
        this.sessionDir = path_1.default.resolve(sessionDir);
        if (!fs_1.default.existsSync(this.sessionDir)) {
            fs_1.default.mkdirSync(this.sessionDir, { recursive: true });
        }
        this.messageStore = new MessageStore(this.sessionDir);
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
        if (this.state === 'CONNECTED')
            return;
        this.state = 'CONNECTING';
        this.isExplicitLogout = false;
        try {
            const { state: authState, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(this.sessionDir);
            this.socket = (0, baileys_1.default)({
                auth: authState,
                printQRInTerminal: false,
                logger: (0, pino_1.default)({ level: 'silent' }),
                browser: ['ToolNest Web', 'Chrome', '124.0.0.0'],
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 15000,
                syncFullHistory: false,
                markOnlineOnConnect: true,
                msgRetryCounterCache: this.msgRetryCounterCache,
                userDevicesCache: this.userDevicesCache,
                getMessage: async (key) => {
                    if (key?.id) {
                        const msg = this.messageStore.get(key.id);
                        if (msg) {
                            console.log(`[WhatsApp Worker] Responding to Signal retry request for message ID: ${key.id} (remote: ${key.remoteJid})`);
                            return msg;
                        }
                    }
                    console.warn(`[WhatsApp Worker] Signal retry requested for ID ${key?.id}, but not found in messageStore.`);
                    return undefined;
                }
            });
            this.socket.ev.on('creds.update', saveCreds);
            this.socket.ev.on('messages.upsert', async ({ messages }) => {
                for (const msg of messages) {
                    if (msg.key?.id && msg.message) {
                        this.messageStore.set(msg.key.id, msg.message);
                    }
                }
            });
            this.socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    try {
                        this.qrCodeDataUrl = await qrcode_1.default.toDataURL(qr, { margin: 2, scale: 7 });
                        this.state = 'QR_CODE_REQUIRED';
                        console.log('[WhatsApp Worker] Generated brand new QR Code data URL');
                    }
                    catch (e) {
                        console.error('[WhatsApp Worker] Error rendering QR code data URL', e);
                    }
                }
                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    console.log(`[WhatsApp Worker] Connection closed. Status: ${statusCode}`);
                    this.user = null;
                    this.qrCodeDataUrl = null;
                    this.pairingCode = null;
                    // Critical fix: If WhatsApp revoked credentials (401 / loggedOut), wipe dead keys immediately
                    if (statusCode === baileys_1.DisconnectReason.loggedOut || statusCode === 401) {
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
                    }
                    else {
                        this.state = 'DISCONNECTED';
                        this.reconnectAttempts = 0;
                        if (!this.isExplicitLogout) {
                            setTimeout(() => this.initialize(), 1500);
                        }
                    }
                }
                else if (connection === 'open') {
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
        }
        catch (err) {
            console.error('[WhatsApp Worker] Failed to initialize Baileys session', err);
            this.clearSessionFiles();
            this.state = 'DISCONNECTED';
            setTimeout(() => this.initialize(), 2000);
        }
    }
    async requestPairingCode(phoneNumber) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (!cleanNumber || cleanNumber.length < 8) {
            throw new Error('Valid phone number with country code is required.');
        }
        if (!this.socket) {
            await this.initialize();
        }
        this.state = 'WAITING_FOR_PAIRING';
        const code = await this.socket.requestPairingCode(cleanNumber);
        this.pairingCode = code;
        return code;
    }
    async logout(clearCredentials = true) {
        this.isExplicitLogout = true;
        try {
            if (this.socket) {
                await this.socket.logout().catch(() => { });
                this.socket.end(undefined);
            }
        }
        catch (e) {
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
    async sendMessage(phoneNumber, text, media) {
        // If socket is briefly reconnecting or negotiating, wait up to 10s before failing
        if (this.state !== 'CONNECTED' || !this.socket) {
            console.log(`[WhatsApp Worker] Socket state is ${this.state}. Waiting up to 10s for connection to stabilize...`);
            for (let i = 0; i < 20; i++) {
                await new Promise(r => setTimeout(r, 500));
                if (this.state === 'CONNECTED' && this.socket)
                    break;
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
        try {
            try {
                const results = await this.socket.onWhatsApp(clean);
                if (results && results.length > 0 && results[0]?.exists) {
                    jid = results[0].jid;
                }
            }
            catch (e) {
                console.warn('[WhatsApp Worker] onWhatsApp lookup warning:', e);
            }
            let sentMsg;
            if (media) {
                if (media.isImage) {
                    sentMsg = await this.socket.sendMessage(jid, {
                        image: media.buffer,
                        caption: text || undefined
                    });
                }
                else {
                    sentMsg = await this.socket.sendMessage(jid, {
                        document: media.buffer,
                        mimetype: media.mimetype,
                        fileName: media.fileName || 'document.pdf',
                        caption: text || undefined
                    });
                }
            }
            else {
                sentMsg = await this.socket.sendMessage(jid, { text });
            }
            const msgId = sentMsg?.key?.id;
            if (msgId && sentMsg?.message) {
                this.messageStore.set(msgId, sentMsg.message);
                console.log(`[WhatsApp Worker] Message cached for retry delivery: ${jid} (ID: ${msgId})`);
            }
            console.log(`[WhatsApp Worker] Message dispatched to ${jid} (ID: ${msgId})`);
            return {
                success: true,
                messageId: msgId || undefined
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
