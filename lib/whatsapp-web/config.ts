import { NextRequest } from 'next/server';

export function getWhatsAppServiceUrl(req?: NextRequest): string {
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
  return (process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '');
}

export function getWhatsAppServiceSecret(): string {
  return process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';
}

export function getWorkerUserId(req?: NextRequest): string {
  if (req) {
    const customHeader = req.headers.get('x-user-id');
    if (customHeader && customHeader.trim()) {
      return customHeader.trim();
    }
    const cookieUser = req.cookies.get('toolnest_wa_user_id')?.value;
    if (cookieUser && cookieUser.trim()) {
      return cookieUser.trim();
    }
    const { searchParams } = new URL(req.url);
    const queryUser = searchParams.get('userId');
    if (queryUser && queryUser.trim()) {
      return queryUser.trim();
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
