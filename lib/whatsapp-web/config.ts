import { NextRequest } from 'next/server';

let cachedGlobalWorkerUrl: string | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10s memory cache

export async function getGlobalWorkerGatewayUrl(): Promise<string | null> {
  const now = Date.now();
  if (cachedGlobalWorkerUrl !== null && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedGlobalWorkerUrl;
  }

  try {
    const { connectToDatabase } = await import('@/lib/mongodb/client');
    const { SystemSetting } = await import('@/lib/mongodb/models');
    await connectToDatabase();
    const setting = await SystemSetting.findOne({ key: 'workerGatewayUrl' });
    if (setting && setting.value && setting.value.trim().startsWith('http')) {
      cachedGlobalWorkerUrl = setting.value.trim().replace(/\/$/, '');
      lastCacheTime = now;
      return cachedGlobalWorkerUrl;
    }
  } catch (err) {
    console.error('Failed to load global worker gateway URL from MongoDB:', err);
  }

  return null;
}

export function setCachedGlobalWorkerUrl(url: string | null) {
  cachedGlobalWorkerUrl = url ? url.trim().replace(/\/$/, '') : null;
  lastCacheTime = Date.now();
}

export async function getWhatsAppServiceUrl(req?: NextRequest): Promise<string> {
  if (req) {
    const customHeader = req.headers.get('x-worker-url');
    if (customHeader && customHeader.trim().startsWith('http')) {
      return customHeader.trim().replace(/\/$/, '');
    }
    const cookieUrl = req.cookies.get('toolnest_wa_worker_url')?.value;
    if (cookieUrl) {
      try {
        const decoded = decodeURIComponent(cookieUrl).trim();
        if (decoded.startsWith('http')) {
          return decoded.replace(/\/$/, '');
        }
      } catch {}
    }
    const { searchParams } = new URL(req.url);
    const customQuery = searchParams.get('workerUrl');
    if (customQuery && customQuery.trim().startsWith('http')) {
      return customQuery.trim().replace(/\/$/, '');
    }
  }

  // Check Admin Global Worker Gateway URL configured in MongoDB
  const globalUrl = await getGlobalWorkerGatewayUrl();
  if (globalUrl) {
    return globalUrl;
  }

  return (process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '');
}

export function getWhatsAppServiceSecret(): string {
  return process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';
}

export function getWorkerUserId(req?: NextRequest): string {
  if (req) {
    const customHeader = req.headers.get('x-user-id');
    if (customHeader && customHeader.trim() && customHeader.trim() !== 'default') {
      return customHeader.trim().toLowerCase();
    }
    const cookieUser = req.cookies.get('toolnest_wa_user_id')?.value;
    if (cookieUser && cookieUser.trim() && cookieUser.trim() !== 'default') {
      return cookieUser.trim().toLowerCase();
    }

    // Authenticated session fallback: extract username from decrypted auth token
    const token = req.cookies.get('toolnest_auth_token')?.value;
    if (token) {
      try {
        const { decryptToken } = require('@/lib/auth/session');
        const payload = decryptToken(token);
        if (payload && payload.username && typeof payload.username === 'string') {
          return payload.username.trim().toLowerCase();
        }
      } catch (_) {}
    }

    const { searchParams } = new URL(req.url);
    const queryUser = searchParams.get('userId');
    if (queryUser && queryUser.trim() && queryUser.trim() !== 'default') {
      return queryUser.trim().toLowerCase();
    }

    if (customHeader && customHeader.trim()) {
      return customHeader.trim().toLowerCase();
    }
    if (cookieUser && cookieUser.trim()) {
      return cookieUser.trim().toLowerCase();
    }
  }
  return 'default';
}

export function getWorkerHeaders(
  serviceSecret: string = getWhatsAppServiceSecret(),
  userId: string = 'default'
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-service-key': serviceSecret,
    'x-user-id': userId,
    'Bypass-Tunnel-Reminder': 'true',
    'bypass-tunnel-reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
    'User-Agent': 'ToolNest-WhatsApp-Worker-Proxy'
  };
}
