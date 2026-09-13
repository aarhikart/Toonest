import { NextRequest } from 'next/server';

export function getWhatsAppServiceUrl(req?: NextRequest): string {
  if (req) {
    const customHeader = req.headers.get('x-worker-url');
    if (customHeader && customHeader.trim().startsWith('http')) {
      return customHeader.trim().replace(/\/$/, '');
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

export function getWorkerHeaders(serviceSecret: string = getWhatsAppServiceSecret()): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-service-key': serviceSecret,
    'Bypass-Tunnel-Reminder': 'true',
    'bypass-tunnel-reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
    'User-Agent': 'ToolNest-WhatsApp-Worker-Proxy'
  };
}
