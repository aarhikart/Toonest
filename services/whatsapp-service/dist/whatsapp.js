"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiSessionManager = exports.WhatsAppSessionEngine = void 0;
exports.normalizePhoneNumber = normalizePhoneNumber;
const whatsapp_web_js_1 = require("whatsapp-web.js");
const qrcode_1 = __importDefault(require("qrcode"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
/**
 * Intelligent phone number normalizer matching /whatsapp-mess
 */
function normalizePhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return '91' + cleaned.slice(1);
    }
    if (cleaned.length === 10) {
        return '91' + cleaned;
    }
    return cleaned;
}
class WhatsAppSessionEngine {
    userId;
    client = null;
    sessionDir;
    state = 'DISCONNECTED';
    qrCodeDataUrl = null;
    pairingCode = null;
    user = null;
    lastConnectedAt = null;
    isConnecting = false;
    isExplicitLogout = false;
    reconnectTimer = null;
    pairingCodeWaiter = null;
    constructor(sessionDir = './sessions', userId = 'default') {
        this.sessionDir = sessionDir;
        this.userId = (userId || 'default').trim();
        try {
            fs_1.default.mkdirSync(this.sessionDir, { recursive: true });
        }
        catch (_) { }
    }
    getAuthPath() {
        // Backwards compatible: 'default' uses existing './sessions/wwebjs_auth'
        if (this.userId === 'default') {
            return path_1.default.resolve(this.sessionDir, 'wwebjs_auth');
        }
        return path_1.default.resolve(this.sessionDir, `wwebjs_auth_${this.userId}`);
    }
    getPuppeteerOptions() {
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
        const options = {
            headless: true,
            args: baseArgs
        };
        try {
            const puppeteer = require('puppeteer');
            const defaultPath = puppeteer.executablePath();
            if (defaultPath && fs_1.default.existsSync(defaultPath)) {
                options.executablePath = defaultPath;
            }
        }
        catch (_) { }
        return options;
    }
    isClientConnecting() {
        return this.isConnecting;
    }
    killOrphanChromeProcesses() {
        if (process.platform !== 'win32')
            return;
        try {
            const cleanPath = path_1.default.resolve(this.getAuthPath()).toLowerCase();
            const script = `
        $target = ${JSON.stringify(cleanPath)}
        Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" | Where-Object {
          $_.CommandLine -and $_.CommandLine.ToLower().Contains($target)
        } | ForEach-Object {
          Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }
      `;
            const encoded = Buffer.from(script, 'utf16le').toString('base64');
            (0, child_process_1.execFileSync)('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], { stdio: 'ignore', timeout: 8000 });
        }
        catch (_) { }
    }
    purgeLockFiles() {
        try {
            const authPath = this.getAuthPath();
            const sessionPath = path_1.default.join(authPath, 'session');
            if (!fs_1.default.existsSync(sessionPath))
                return;
            const lockItems = [
                'DevToolsActivePort',
                'lockfile',
                'SingletonLock',
                'SingletonCookie',
                'SingletonSocket',
                path_1.default.join('Default', 'LOCK')
            ];
            for (const item of lockItems) {
                const itemPath = path_1.default.join(sessionPath, item);
                try {
                    if (fs_1.default.existsSync(itemPath)) {
                        fs_1.default.unlinkSync(itemPath);
                    }
                }
                catch (_) { }
            }
        }
        catch (_) { }
    }
    async initialize(pairPhoneNumber) {
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
            fs_1.default.mkdirSync(authPath, { recursive: true });
            if (this.client) {
                try {
                    await this.client.destroy();
                }
                catch (_) { }
                this.client = null;
            }
            // Automatically terminate any orphan Chrome process holding this user's profile
            this.killOrphanChromeProcesses();
            // Automatically purge stale lockfiles from any unexpected previous exit or crash
            this.purgeLockFiles();
            console.log(`[WhatsApp Worker (${this.userId})] Launching WhatsApp Web browser engine (Chromium)...`);
            const client = new whatsapp_web_js_1.Client({
                authStrategy: new whatsapp_web_js_1.LocalAuth({
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
                    const qrDataUrl = await qrcode_1.default.toDataURL(qr);
                    this.qrCodeDataUrl = qrDataUrl;
                    this.pairingCode = null;
                    this.state = 'QR_READY';
                    console.log('[WhatsApp Worker] Real scannable WhatsApp Web QR code generated.');
                }
                catch (err) {
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
                const info = client.info;
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
        }
        catch (err) {
            console.error(`[WhatsApp Worker (${this.userId})] Failed to initialize WhatsApp Web client:`, err.message || err);
            this.state = 'DISCONNECTED';
            if (this.pairingCodeWaiter) {
                clearTimeout(this.pairingCodeWaiter.timeout);
                this.pairingCodeWaiter.reject(new Error(err.message || 'Failed to initialize client'));
                this.pairingCodeWaiter = null;
            }
            try {
                const authPath = this.getAuthPath();
                const sessionPath = path_1.default.join(authPath, 'session');
                if (fs_1.default.existsSync(sessionPath)) {
                    const lockItems = ['DevToolsActivePort', 'lockfile', 'SingletonLock', 'SingletonCookie', 'SingletonSocket'];
                    for (const item of lockItems) {
                        const itemPath = path_1.default.join(sessionPath, item);
                        if (fs_1.default.existsSync(itemPath)) {
                            try {
                                fs_1.default.unlinkSync(itemPath);
                            }
                            catch (_) { }
                        }
                    }
                }
            }
            catch (_) { }
            this.scheduleReconnect(8000);
        }
        finally {
            this.isConnecting = false;
        }
    }
    async requestPairingCode(phoneNumber) {
        const digits = normalizePhoneNumber(phoneNumber);
        if (!digits || digits.length < 10 || digits.length > 15) {
            throw new Error(`Invalid phone number (+${digits}). Must be 10 to 15 digits including country code.`);
        }
        if (this.state === 'CONNECTED') {
            const currentDigits = this.user?.phoneNumber?.replace(/\D/g, '');
            if (currentDigits && (currentDigits === digits || currentDigits.endsWith(digits) || digits.endsWith(currentDigits))) {
                throw new Error(`WhatsApp is already connected as +${digits}. No need to pair again!`);
            }
            console.log(`[WhatsApp Worker (${this.userId})] Switching WhatsApp account to +${digits}. Logging out existing session...`);
            await this.logout(true, false);
            await new Promise((r) => setTimeout(r, 1000));
        }
        // Ensure client is initialized
        if (!this.client || this.state === 'DISCONNECTED') {
            await this.initialize();
        }
        // If still connecting, wait for client to reach QR_READY or CONNECTED (up to 15s)
        if (this.isConnecting || this.state === 'CONNECTING') {
            const start = Date.now();
            while ((this.isConnecting || this.state === 'CONNECTING') && Date.now() - start < 15000) {
                await new Promise((r) => setTimeout(r, 500));
            }
        }
        if (this.state === 'CONNECTED') {
            return 'ALREADY_CONNECTED';
        }
        // Request pairing code directly from active WhatsApp Web page
        if (this.client && this.client.pupPage) {
            try {
                console.log(`[WhatsApp Worker (${this.userId})] Requesting pairing code directly from active page for +${digits}...`);
                this.state = 'WAITING_FOR_PAIRING';
                const code = await this.client.requestPairingCode(digits);
                if (code) {
                    this.pairingCode = String(code);
                    return String(code);
                }
            }
            catch (err) {
                const errMsg = err?.message || String(err);
                console.warn(`[WhatsApp Worker (${this.userId})] Pairing code request rejected: ${errMsg}`);
                this.pairingCode = null;
                if (this.qrCodeDataUrl) {
                    this.state = 'QR_READY';
                }
                if (errMsg.includes('429') || errMsg.includes('overlimit') || errMsg.includes('CompanionHelloError') || errMsg.includes('t')) {
                    throw new Error('WhatsApp servers are currently rate-limiting phone code requests (429). Please scan the QR Code on the QR tab instead to connect instantly!');
                }
                throw new Error(errMsg || 'Failed to generate pairing code. Please scan the QR code instead.');
            }
        }
        throw new Error('WhatsApp Web engine is not ready. Please scan the QR code to connect.');
    }
    async logout(clearCredentials = true, autoRestart = false) {
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
            }
            catch (_) { }
            try {
                await this.client.destroy();
            }
            catch (_) { }
            this.client = null;
        }
        // Terminate any lingering Chrome process for this user
        this.killOrphanChromeProcesses();
        if (clearCredentials) {
            const authPath = this.getAuthPath();
            try {
                if (fs_1.default.existsSync(authPath)) {
                    fs_1.default.rmSync(authPath, { recursive: true, force: true });
                    console.log(`[WhatsApp Worker (${this.userId})] Cleared session files from`, authPath);
                }
            }
            catch (err) {
                console.warn(`[WhatsApp Worker (${this.userId})] Failed to clear session files:`, err.message);
            }
        }
        this.purgeLockFiles();
        this.isExplicitLogout = false;
        if (autoRestart) {
            setTimeout(() => {
                this.initialize().catch(() => { });
            }, 1000);
        }
    }
    /**
     * Send WhatsApp message with exact /whatsapp-mess parity
     */
    async sendMessage(to, text, media, options) {
        if (!this.client) {
            return { success: false, error: 'WhatsApp client is not initialized.' };
        }
        if (this.state !== 'CONNECTED') {
            try {
                const state = await Promise.race([
                    this.client.getState(),
                    new Promise((resolve) => setTimeout(() => resolve(null), 3000))
                ]);
                if (state === 'CONNECTED') {
                    this.state = 'CONNECTED';
                }
                else {
                    return { success: false, error: 'WhatsApp Web is not connected. Please scan QR or enter pairing code.' };
                }
            }
            catch {
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
                this.client.getNumberId(digits),
                new Promise((resolve) => setTimeout(() => resolve(null), 12000))
            ]);
            if (numberId?._serialized) {
                chatId = numberId._serialized;
            }
            else {
                console.log(`[WhatsApp Worker] Number lookup returned empty for ${digits}. Trying direct chat ID ${fallbackChatId}.`);
            }
        }
        catch (error) {
            console.warn(`[WhatsApp Worker] Number lookup failed for ${digits}: ${error.message || error}. Trying direct chat ID.`);
        }
        // Prepare media if provided
        let messageMedia = null;
        if (media) {
            let base64Data = '';
            if (media.buffer) {
                base64Data = media.buffer.toString('base64');
            }
            else if (media.base64) {
                base64Data = media.base64.split(',')[1] || media.base64;
            }
            if (base64Data) {
                messageMedia = new whatsapp_web_js_1.MessageMedia(media.mimetype, base64Data, media.fileName || 'attachment');
            }
        }
        let lastError = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                if (messageMedia) {
                    try {
                        if (options?.sendTextSeparately && cleanText) {
                            const mediaSent = await this.client.sendMessage(chatId, messageMedia);
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            const textSent = await this.client.sendMessage(chatId, cleanText);
                            const msgId = textSent?.id?._serialized || textSent?.id?.id || mediaSent?.id?._serialized || `msg_${Date.now()}`;
                            return { success: true, messageId: msgId };
                        }
                        else {
                            // Unified delivery: media with caption as single message (matching /whatsapp-mess)
                            const sent = await this.client.sendMessage(chatId, messageMedia, {
                                caption: cleanText || undefined
                            });
                            const msgId = sent?.id?._serialized || sent?.id?.id || `msg_${Date.now()}`;
                            return { success: true, messageId: msgId };
                        }
                    }
                    catch (mediaErr) {
                        console.warn(`[WhatsApp Worker] Media dispatch failed for ${digits} (${mediaErr.message}). Falling back to text delivery to guarantee 100% campaign completion...`);
                        if (cleanText) {
                            const sentFallback = await this.client.sendMessage(chatId, cleanText);
                            const msgId = sentFallback?.id?._serialized || sentFallback?.id?.id || `msg_${Date.now()}`;
                            return { success: true, messageId: msgId };
                        }
                        throw mediaErr;
                    }
                }
                // Plain text message
                const sent = await this.client.sendMessage(chatId, cleanText);
                const msgId = sent?.id?._serialized || sent?.id?.id || `msg_${Date.now()}`;
                return { success: true, messageId: msgId };
            }
            catch (error) {
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
    getStatus() {
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
    async destroy() {
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
            }
            catch (_) { }
            this.client = null;
        }
        this.killOrphanChromeProcesses();
        this.purgeLockFiles();
        this.state = 'DISCONNECTED';
    }
    scheduleReconnect(delayMs) {
        if (this.reconnectTimer)
            return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.state !== 'CONNECTED' && !this.isExplicitLogout) {
                console.log(`[WhatsApp Worker (${this.userId})] Attempting reconnection...`);
                this.initialize().catch((err) => {
                    console.error(`[WhatsApp Worker (${this.userId})] Reconnect error:`, err.message);
                });
            }
        }, delayMs);
    }
    getClient() {
        return this.client;
    }
}
exports.WhatsAppSessionEngine = WhatsAppSessionEngine;
/**
 * Multi-Session Manager: Coordinates isolated WhatsApp sessions keyed by userId.
 * Each user gets their own sandboxed Chromium context & session directory.
 */
class MultiSessionManager {
    sessions = new Map();
    sessionDir;
    constructor(sessionDir = './sessions') {
        this.sessionDir = sessionDir;
        try {
            fs_1.default.mkdirSync(this.sessionDir, { recursive: true });
        }
        catch (_) { }
    }
    getSession(userId = 'default', autoCreate = true) {
        const cleanId = (userId || 'default').trim();
        let engine = this.sessions.get(cleanId);
        if (!engine) {
            if (autoCreate) {
                engine = new WhatsAppSessionEngine(this.sessionDir, cleanId);
                this.sessions.set(cleanId, engine);
                engine.initialize().catch((err) => {
                    console.error(`[MultiSessionManager] Auto-initialization error for user ${cleanId}:`, err.message);
                });
            }
        }
        else if (autoCreate && engine.getStatus().state === 'DISCONNECTED' && !engine.isClientConnecting()) {
            console.log(`[MultiSessionManager] Session for user "${cleanId}" is DISCONNECTED. Auto-starting WhatsApp Web client...`);
            engine.initialize().catch((err) => {
                console.error(`[MultiSessionManager] Re-initialization error for user ${cleanId}:`, err.message);
            });
        }
        return engine || null;
    }
    async removeSession(userId, clearCredentials = false) {
        const cleanId = (userId || 'default').trim();
        const engine = this.sessions.get(cleanId);
        if (engine) {
            await engine.logout(clearCredentials);
            await engine.destroy();
            this.sessions.delete(cleanId);
        }
    }
    listSessions() {
        const results = [];
        for (const [uid, engine] of this.sessions.entries()) {
            results.push({
                userId: uid,
                status: engine.getStatus()
            });
        }
        return results;
    }
    getActiveConnectedSession() {
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
    async autoRestoreSessions() {
        // Lazy session restoration: only boot default/admin on startup to avoid spawning 10+ Chrome processes
        // Each tenant's session is initialized on-demand when that tenant visits the portal.
        try {
            console.log('[MultiSessionManager] Auto-restoring default admin session on boot...');
            this.getSession('default', true);
        }
        catch (err) {
            console.warn('[MultiSessionManager] Error auto-restoring default session from disk:', err.message);
        }
    }
}
exports.MultiSessionManager = MultiSessionManager;
