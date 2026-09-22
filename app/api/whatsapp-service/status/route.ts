import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getWhatsAppServiceUrl, getWhatsAppServiceSecret, getWorkerHeaders, getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let isStarting = false;

async function ensureWorkerRunning() {
  if (isStarting) return;
  isStarting = true;
  setTimeout(() => { isStarting = false; }, 60000);

  try {
    const check = await fetch('http://localhost:5001/health', { signal: AbortSignal.timeout(1200) });
    if (check.ok) return; // Already running, no need to spawn duplicate!
  } catch (_) {}

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
  const serviceUrl = await getWhatsAppServiceUrl(req);
  const serviceSecret = getWhatsAppServiceSecret();
  const userId = getWorkerUserId(req);
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
        headers: getWorkerHeaders(serviceSecret, userId)
      }).catch(() => {});
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout for cloud/tunnel workers

    const res = await fetch(`${serviceUrl}/status`, {
      headers: getWorkerHeaders(serviceSecret, userId),
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

    // If remote gateway returned error (e.g. 530, 502) and we're not already on localhost, try local fallback
    if (serviceUrl !== 'http://localhost:5001') {
      try {
        const localRes = await fetch('http://localhost:5001/status', {
          headers: getWorkerHeaders(serviceSecret, userId),
          signal: AbortSignal.timeout(3000),
          cache: 'no-store'
        });
        if (localRes.ok) {
          const data = await localRes.json();
          return NextResponse.json({
            ...data,
            isWorkerOnline: true,
            resolvedServiceUrl: 'http://localhost:5001'
          }, { headers: noCacheHeaders });
        }
      } catch (_) {}
    }
  } catch (err) {
    if (serviceUrl !== 'http://localhost:5001') {
      try {
        const localRes = await fetch('http://localhost:5001/status', {
          headers: getWorkerHeaders(serviceSecret, userId),
          signal: AbortSignal.timeout(3000),
          cache: 'no-store'
        });
        if (localRes.ok) {
          const data = await localRes.json();
          return NextResponse.json({
            ...data,
            isWorkerOnline: true,
            resolvedServiceUrl: 'http://localhost:5001'
          }, { headers: noCacheHeaders });
        }
      } catch (_) {}
    }
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
