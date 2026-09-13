import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let isStarting = false;

function ensureWorkerRunning() {
  if (isStarting) return;
  isStarting = true;
  setTimeout(() => { isStarting = false; }, 60000);

  const serverScript = path.resolve(process.cwd(), 'services', 'whatsapp-service', 'dist', 'server.js');
  if (fs.existsSync(serverScript)) {
    try {
      const child = spawn(process.execPath, [serverScript], {
        cwd: path.dirname(serverScript),
        detached: true,
        stdio: 'ignore'
      });
      child.unref();
      console.log('[Next.js Gateway] Spawned WhatsApp Worker Daemon on port 5001');
    } catch (e) {
      console.error('Failed to auto-spawn whatsapp worker', e);
    }
  }
}

export async function GET(req: NextRequest) {
  const serviceUrl = getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();
  const { searchParams } = new URL(req.url);
  const shouldRestart = searchParams.get('restart') === 'true';

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  try {
    if (shouldRestart) {
      await fetch(`${serviceUrl}/restart`, {
        method: 'POST',
        headers: getWorkerHeaders(serviceSecret)
      }).catch(() => {});
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout for cloud/tunnel workers

    const res = await fetch(`${serviceUrl}/status`, {
      headers: getWorkerHeaders(serviceSecret),
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ...data,
        isWorkerOnline: true,
        resolvedServiceUrl: serviceUrl
      }, { headers: noCacheHeaders });
    }
  } catch (err) {
    if (serviceUrl.includes('localhost') || serviceUrl.includes('127.0.0.1')) {
      ensureWorkerRunning();
    }
  }

  return NextResponse.json({
    state: 'DISCONNECTED',
    isConnected: false,
    qrCodeDataUrl: null,
    pairingCode: null,
    user: null,
    lastConnectedAt: null,
    isWorkerOnline: false,
    resolvedServiceUrl: serviceUrl
  }, { headers: noCacheHeaders });
}
