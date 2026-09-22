import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MultiSessionManager } from './whatsapp';
import { tunnelManager } from './tunnel';

dotenv.config();

// Production Process Resilience: Prevent transient socket closes or unhandled promises from crashing the worker daemon
process.on('unhandledRejection', (reason: any) => {
  const msg = reason?.message || String(reason);
  console.warn('[WhatsApp Worker Daemon] Intercepted unhandledRejection (process kept alive):', msg);
});

process.on('uncaughtException', (err: any) => {
  const msg = err?.message || String(err);
  console.warn('[WhatsApp Worker Daemon] Intercepted uncaughtException (process kept alive):', msg);
});

const app = express();
const PORT = process.env.PORT || 5001;
const SERVICE_SECRET = process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';
const SESSIONS_PATH = process.env.WHATSAPP_SESSIONS_DIR || './sessions';

// Multi-Tenant Session Manager
const sessionManager = new MultiSessionManager(SESSIONS_PATH);

// Auto-restore any existing authenticated sessions from disk on boot
sessionManager.autoRestoreSessions().then(() => {
  // Ensure default session is initialized if none exists
  sessionManager.getSession('default', true);
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Strip optional /api/whatsapp-service prefix when deployed behind monorepo service rewrites
app.use((req, res, next) => {
  if (req.url.startsWith('/api/whatsapp-service')) {
    req.url = req.url.replace('/api/whatsapp-service', '') || '/';
  }
  next();
});

// Secret verification middleware
const verifySecret = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-service-key'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!token || token !== SERVICE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid service key' });
  }
  next();
};

// Helper: Extract userId from header, query, or body
function getUserId(req: Request): string {
  const headerId = (req.headers['x-user-id'] as string) || '';
  if (headerId.trim()) return headerId.trim();
  if (req.query.userId && typeof req.query.userId === 'string') return req.query.userId.trim();
  if (req.body?.userId && typeof req.body.userId === 'string') return req.body.userId.trim();
  return 'default';
}

// Public health check
app.get('/health', (req, res) => {
  const allSessions = sessionManager.listSessions();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ToolNest Persistent Multi-Tenant WhatsApp Worker',
    uptime: process.uptime(),
    activeSessionsCount: allSessions.length,
    connectedSessionsCount: allSessions.filter(s => s.status.isConnected).length
  });
});

// Diagnostic sessions list (admin view of all tenants)
app.get('/sessions', verifySecret, (req, res) => {
  const sessions = sessionManager.listSessions();
  res.json({
    total: sessions.length,
    sessions,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Tunnel Management Endpoints
app.get('/tunnel', (req, res) => {
  res.json({
    success: true,
    ...tunnelManager.getStatus()
  });
});

app.post('/tunnel/generate', async (req, res) => {
  try {
    const force = req.body?.force === true;
    const url = await tunnelManager.startTunnel(Number(PORT), force);
    const status = tunnelManager.getStatus();
    res.json({
      success: true,
      url,
      isRunning: status.isRunning,
      status: status.status,
      error: status.error
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate tunnel'
    });
  }
});

app.post('/tunnel/stop', (req, res) => {
  tunnelManager.stopTunnel();
  res.json({
    success: true,
    message: 'Tunnel stopped',
    ...tunnelManager.getStatus()
  });
});

// 1. Get Connection Status (State, QR code data url, user info) for specific tenant
app.get('/status', verifySecret, (req, res) => {
  const userId = getUserId(req);

  // Health check bypass: do NOT spawn a Chromium browser for gateway pings!
  if (userId === 'gateway_health_check' || userId === 'system_ping' || userId === 'health') {
    return res.json({
      state: 'CONNECTED',
      isConnected: true,
      service: 'ToolNest WhatsApp Worker Gateway',
      timestamp: new Date().toISOString()
    });
  }

  const shouldRestart = req.query.restart === 'true';
  const engine = sessionManager.getSession(userId, true);

  if (shouldRestart && engine) {
    console.log(`[WhatsApp Worker (${userId})] /status with restart=true. Restarting session...`);
    engine.logout(true, true).catch(() => {});
  }

  if (!engine) {
    return res.json({
      state: 'DISCONNECTED',
      isConnected: false,
      qrCodeDataUrl: null,
      pairingCode: null,
      user: null,
      lastConnectedAt: null,
      sessionDir: SESSIONS_PATH,
      userId
    });
  }
  const status = engine.getStatus();
  res.json(status);
});

// 2. Request Pairing Code for a Phone Number (Tenant Scoped)
app.post('/pair', verifySecret, async (req, res) => {
  try {
    const userId = getUserId(req);
    const engine = sessionManager.getSession(userId, true);
    if (!engine) {
      return res.status(500).json({ success: false, error: `Could not allocate session for user ${userId}` });
    }

    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'phoneNumber is required' });
    }

    const code = await engine.requestPairingCode(phoneNumber);
    const formattedCode = code && code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
    res.json({ success: true, pairingCode: code, formattedCode, userId });
  } catch (err: any) {
    console.error(`[WhatsApp Worker (${getUserId(req)})] Pairing code generation error:`, err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Disconnect / Logout Session for specific tenant
app.post('/logout', verifySecret, async (req, res) => {
  try {
    const userId = getUserId(req);
    const engine = sessionManager.getSession(userId, false);
    if (engine) {
      await engine.logout(true, false);
    }
    res.json({ success: true, message: `Logged out successfully for user ${userId}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restart / Refresh QR code for specific tenant
app.post('/restart', verifySecret, async (req, res) => {
  try {
    const userId = getUserId(req);
    console.log(`[WhatsApp Worker (${userId})] /restart requested. Wiping session and restarting fresh QR handshake...`);
    const engine = sessionManager.getSession(userId, false);
    if (engine) {
      await engine.logout(true, true);
    } else {
      sessionManager.getSession(userId, true);
    }
    res.json({ success: true, message: `Wiped session and restarting fresh QR for ${userId}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Send Direct Message from specific tenant account
app.post('/send', verifySecret, async (req, res) => {
  try {
    const userId = getUserId(req);
    const engine = sessionManager.getSession(userId, true);

    if (!engine || !engine.getStatus().isConnected || !engine.getClient()) {
      return res.status(400).json({
        success: false,
        error: `WhatsApp account for tenant "${userId}" is not connected. Please connect WhatsApp in Step 1.`
      });
    }

    const { to, text, mediaBase64, mediaMimeType, fileName, isImage, sendTextSeparately, options } = req.body;
    if (!to) {
      return res.status(400).json({ error: 'Recipient phone number (to) is required' });
    }
    if (!text?.trim() && !mediaBase64) {
      return res.status(400).json({ error: 'Message text or media is required' });
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

    const sendOptions = {
      sendTextSeparately: sendTextSeparately ?? options?.sendTextSeparately
    };

    const result = await engine.sendMessage(to, text?.trim() || '', media, sendOptions);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Multi-Tenant Campaign Engine State
interface CampaignState {
  isRunning: boolean;
  isPaused: boolean;
  total: number;
  currentIndex: number;
  sentCount: number;
  failedCount: number;
  logs: any[];
}

const activeCampaigns = new Map<string, CampaignState>();

function getOrCreateCampaign(userId: string): CampaignState {
  let campaign = activeCampaigns.get(userId);
  if (!campaign) {
    campaign = {
      isRunning: false,
      isPaused: false,
      total: 0,
      currentIndex: 0,
      sentCount: 0,
      failedCount: 0,
      logs: []
    };
    activeCampaigns.set(userId, campaign);
  }
  return campaign;
}

// Start Background Campaign for specific tenant
app.post('/campaign/start', verifySecret, async (req, res) => {
  const userId = getUserId(req);
  const engine = sessionManager.getSession(userId, true);
  if (!engine || !engine.getStatus().isConnected || !engine.getClient()) {
    return res.status(400).json({ error: `WhatsApp client for tenant "${userId}" is not connected. Please scan QR code in Step 1.` });
  }

  const { contacts, template, delaySeconds = 3, mediaBase64, mediaMimeType, fileName, isImage, sendTextSeparately } = req.body;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: 'Valid contacts array required' });
  }

  const campaign = getOrCreateCampaign(userId);
  campaign.isRunning = true;
  campaign.isPaused = false;
  campaign.total = contacts.length;
  campaign.currentIndex = 0;
  campaign.sentCount = 0;
  campaign.failedCount = 0;
  campaign.logs = [];

  // Run asynchronously in background for this specific user
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
      if (!campaign.isRunning) break;

      while (campaign.isPaused) {
        await new Promise(r => setTimeout(r, 500));
        if (!campaign.isRunning) break;
      }

      if (!campaign.isRunning) break;

      campaign.currentIndex = i;
      const contact = contacts[i];
      const safeName = (contact.name || 'Friend').trim();
      const firstName = safeName.split(' ')[0] || safeName;
      const phone = contact.phoneNumber || '';

      const renderedText = (template || '')
        .replace(/(\{\{\s*(?:name|customer|customer_name|contact|contact_name)\s*\}\}|\{\s*(?:name|customer|customer_name|contact|contact_name)\s*\}|\[\s*(?:name|customer|customer_name|contact|contact_name)\s*\]|%\s*(?:name|customer|contact)\s*%|\{\{\s*1\s*\}\}|\{\s*1\s*\})/gi, safeName)
        .replace(/(\{\{\s*first_name\s*\}\}|\{\s*first_name\s*\}|\[\s*first_name\s*\])/gi, firstName)
        .replace(/(\{\{\s*(?:phone|number|mobile)\s*\}\}|\{\s*(?:phone|number|mobile)\s*\}|\[\s*(?:phone|number|mobile)\s*\]|\{\{\s*2\s*\}\}|\{\s*2\s*\})/gi, phone)
        .replace(/(\{\{\s*random\s*\}\}|\{\s*random\s*\})/gi, Math.random().toString(36).substring(2, 7).toUpperCase());

      const delayMs = (delaySeconds + (Math.random() * 1.5 - 0.75)) * 1000;
      await new Promise(r => setTimeout(r, Math.max(1500, delayMs)));

      const result = await engine.sendMessage(contact.phoneNumber, renderedText, media, {
        sendTextSeparately: sendTextSeparately === true
      });

      if (result.success) {
        campaign.sentCount++;
      } else {
        campaign.failedCount++;
      }

      campaign.logs.unshift({
        id: `log_${Date.now()}_${i}`,
        timestamp: new Date().toLocaleTimeString(),
        contactName: contact.name,
        phoneNumber: contact.phoneNumber,
        status: result.success ? 'SENT' : 'FAILED',
        error: result.error,
        message: renderedText
      });

      if (campaign.logs.length > 200) campaign.logs.pop();
    }

    campaign.isRunning = false;
  })();

  res.json({ success: true, message: 'Campaign started', userId });
});

// Get Campaign Status for specific tenant
app.get('/campaign/status', verifySecret, (req, res) => {
  const userId = getUserId(req);
  res.json(getOrCreateCampaign(userId));
});

// Stop Campaign for specific tenant
app.post('/campaign/stop', verifySecret, (req, res) => {
  const userId = getUserId(req);
  const campaign = getOrCreateCampaign(userId);
  campaign.isRunning = false;
  campaign.isPaused = false;
  res.json({ success: true, message: 'Campaign stopped', userId });
});

app.listen(PORT, () => {
  console.log(`[WhatsApp Worker] Multi-tenant persistent daemon running on port ${PORT}`);
});
