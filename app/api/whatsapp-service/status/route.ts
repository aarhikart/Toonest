import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let isStarting = false;

function ensureWorkerRunning() {
  if (isStarting) return;
  isStarting = true;
  setTimeout(() => { isStarting = false; }, 10000);

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
  const serviceUrl = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001';
  const serviceSecret = process.env.WHATSAPP_SERVICE_SECRET || 'toolnest_secure_service_token_2026';
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
        headers: { 'x-service-key': serviceSecret }
      }).catch(() => {});
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${serviceUrl}/status`, {
      headers: {
        'x-service-key': serviceSecret
      },
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ...data,
        isWorkerOnline: true
      }, { headers: noCacheHeaders });
    }
  } catch (err) {
    if (serviceUrl.includes('localhost') || serviceUrl.includes('127.0.0.1')) {
      ensureWorkerRunning();
    }
  }

  return NextResponse.json({
    state: 'CONNECTING',
    isConnected: false,
    qrCodeDataUrl: null,
    pairingCode: null,
    user: null,
    lastConnectedAt: null,
    isWorkerOnline: false,
    serviceUrl
  }, { headers: noCacheHeaders });
}
