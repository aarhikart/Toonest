"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const whatsapp_1 = require("./whatsapp");
dotenv_1.default.config();
// Production Process Resilience: Prevent transient Baileys socket closes from crashing the worker daemon
process.on('unhandledRejection', (reason) => {
    const msg = reason?.message || String(reason);
    console.warn('[WhatsApp Worker Daemon] Intercepted unhandledRejection (process kept alive):', msg);
});
process.on('uncaughtException', (err) => {
    const msg = err?.message || String(err);
    console.warn('[WhatsApp Worker Daemon] Intercepted uncaughtException (process kept alive):', msg);
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
const SERVICE_SECRET = process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';
const SESSIONS_PATH = process.env.WHATSAPP_SESSIONS_DIR || './sessions';
const engine = new whatsapp_1.WhatsAppSessionEngine(SESSIONS_PATH);
// Automatically initialize connection on service boot
engine.initialize();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '25mb' }));
// Secret verification middleware
const verifySecret = (req, res, next) => {
    const token = req.headers['x-service-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (!token || token !== SERVICE_SECRET) {
        return res.status(401).json({ error: 'Unauthorized: Invalid service key' });
    }
    next();
};
// Public health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ToolNest Persistent WhatsApp Worker',
        uptime: process.uptime()
    });
});
// 1. Get Connection Status (State, QR code data url, user info)
app.get('/status', verifySecret, (req, res) => {
    const status = engine.getStatus();
    res.json(status);
});
// 2. Request Pairing Code for a Phone Number
app.post('/pair', verifySecret, async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: 'phoneNumber is required' });
        }
        const code = await engine.requestPairingCode(phoneNumber);
        const formattedCode = code && code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
        res.json({ success: true, pairingCode: code, formattedCode });
    }
    catch (err) {
        console.error('[WhatsApp Worker] Pairing code generation error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});
// 3. Disconnect / Logout Session
app.post('/logout', verifySecret, async (req, res) => {
    try {
        await engine.logout(true);
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// Restart / Refresh QR code (clears unauthenticated stale session & regenerates fresh QR)
app.post('/restart', verifySecret, async (req, res) => {
    try {
        const current = engine.getStatus();
        if (current.isConnected) {
            return res.json({ success: true, message: 'Session is currently connected', status: current });
        }
        await engine.logout(true);
        res.json({ success: true, message: 'Wiped session and restarting fresh QR' });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// 4. Send Direct Message
app.post('/send', verifySecret, async (req, res) => {
    try {
        const { to, text, mediaBase64, mediaMimeType, fileName, isImage } = req.body;
        if (!to) {
            return res.status(400).json({ error: 'Recipient phone number (to) is required' });
        }
        let media;
        if (mediaBase64 && mediaMimeType) {
            media = {
                buffer: Buffer.from(mediaBase64, 'base64'),
                mimetype: mediaMimeType,
                fileName,
                isImage: isImage ?? mediaMimeType.startsWith('image/')
            };
        }
        const result = await engine.sendMessage(to, text, media);
        res.status(result.success ? 200 : 400).json(result);
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// 5. Campaign Engine State
let activeCampaign = {
    isRunning: false,
    isPaused: false,
    total: 0,
    currentIndex: 0,
    sentCount: 0,
    failedCount: 0,
    logs: []
};
// Start Background Campaign
app.post('/campaign/start', verifySecret, async (req, res) => {
    const { contacts, template, delaySeconds = 3, mediaBase64, mediaMimeType, fileName, isImage } = req.body;
    if (!Array.isArray(contacts) || contacts.length === 0) {
        return res.status(400).json({ error: 'Valid contacts array required' });
    }
    activeCampaign = {
        isRunning: true,
        isPaused: false,
        total: contacts.length,
        currentIndex: 0,
        sentCount: 0,
        failedCount: 0,
        logs: []
    };
    // Run asynchronously in background
    (async () => {
        let media;
        if (mediaBase64 && mediaMimeType) {
            media = {
                buffer: Buffer.from(mediaBase64, 'base64'),
                mimetype: mediaMimeType,
                fileName,
                isImage: isImage ?? mediaMimeType.startsWith('image/')
            };
        }
        for (let i = 0; i < contacts.length; i++) {
            if (!activeCampaign.isRunning)
                break;
            while (activeCampaign.isPaused) {
                await new Promise(r => setTimeout(r, 500));
                if (!activeCampaign.isRunning)
                    break;
            }
            if (!activeCampaign.isRunning)
                break;
            activeCampaign.currentIndex = i;
            const contact = contacts[i];
            const renderedText = (template || '')
                .replace(/\{name\}/gi, contact.name || 'Friend')
                .replace(/\{phone\}/gi, contact.phoneNumber)
                .replace(/\{number\}/gi, contact.phoneNumber);
            const delayMs = (delaySeconds + (Math.random() * 1.5 - 0.75)) * 1000;
            await new Promise(r => setTimeout(r, Math.max(1500, delayMs)));
            const result = await engine.sendMessage(contact.phoneNumber, renderedText, media);
            if (result.success) {
                activeCampaign.sentCount++;
            }
            else {
                activeCampaign.failedCount++;
            }
            activeCampaign.logs.unshift({
                id: `log_${Date.now()}_${i}`,
                timestamp: new Date().toLocaleTimeString(),
                contactName: contact.name,
                phoneNumber: contact.phoneNumber,
                status: result.success ? 'SENT' : 'FAILED',
                error: result.error,
                message: renderedText
            });
            if (activeCampaign.logs.length > 200)
                activeCampaign.logs.pop();
        }
        activeCampaign.isRunning = false;
    })();
    res.json({ success: true, message: 'Campaign started' });
});
// Get Campaign Status
app.get('/campaign/status', verifySecret, (req, res) => {
    res.json(activeCampaign);
});
// Stop Campaign
app.post('/campaign/stop', verifySecret, (req, res) => {
    activeCampaign.isRunning = false;
    activeCampaign.isPaused = false;
    res.json({ success: true, message: 'Campaign stopped' });
});
app.listen(PORT, () => {
    console.log(`[WhatsApp Worker] Persistent daemon running on port ${PORT}`);
});
