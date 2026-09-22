import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { SystemSetting } from '@/lib/mongodb/models';
import { getSessionUser } from '@/lib/auth/session';
import {
  getGlobalWorkerGatewayUrl,
  setCachedGlobalWorkerUrl,
  getWhatsAppServiceSecret,
  getWorkerHeaders
} from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

// Helper to ping the worker URL and measure response time with retry for fresh tunnels
async function testGatewayConnectivity(url: string, retries: number = 2): Promise<{ isOnline: boolean; pingMs: number; error?: string }> {
  const cleanUrl = url.trim().replace(/\/$/, '');
  let lastError = '';

  for (let attempt = 1; attempt <= retries; attempt++) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${cleanUrl}/health`, {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeout);

      const pingMs = Date.now() - start;
      if (res.ok) {
        return { isOnline: true, pingMs };
      } else {
        lastError = `Worker replied with HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err.name === 'AbortError' ? 'Connection timed out (10s)' : (err.message || 'Connection failed');
    }

    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return {
    isOnline: false,
    pingMs: 0,
    error: lastError
  };
}

// GET: Check active Worker Gateway URL & live connectivity
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const setting = await SystemSetting.findOne({ key: 'workerGatewayUrl' }).lean();
    const configuredUrl = setting?.value || '';
    const activeUrl = configuredUrl || (process.env.WHATSAPP_SERVICE_URL || 'http://localhost:5001').replace(/\/$/, '');

    const check = await testGatewayConnectivity(activeUrl);

    return NextResponse.json({
      success: true,
      gatewayUrl: configuredUrl,
      activeUrl,
      isConfigured: Boolean(configuredUrl),
      isOnline: check.isOnline,
      pingMs: check.pingMs,
      error: check.error,
      updatedAt: setting?.updatedAt || null
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Set or update the global Worker Gateway URL (Admin only)
export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { gatewayUrl } = body;

    if (!gatewayUrl || typeof gatewayUrl !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Gateway URL is required.' },
        { status: 400 }
      );
    }

    const cleanUrl = gatewayUrl.trim().replace(/\/$/, '');

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format. Gateway URL must start with http:// or https://' },
        { status: 400 }
      );
    }

    // Test connectivity
    const check = await testGatewayConnectivity(cleanUrl);

    await connectToDatabase();
    const updated = await SystemSetting.findOneAndUpdate(
      { key: 'workerGatewayUrl' },
      { value: cleanUrl, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // Update in-memory cache instantly
    setCachedGlobalWorkerUrl(cleanUrl);

    return NextResponse.json({
      success: true,
      message: check.isOnline
        ? `Worker Gateway connected and active (${check.pingMs}ms)! All users now automatically route through this gateway.`
        : `Worker Gateway URL saved, but worker is currently unreachable at this address. Please verify your tunnel/daemon is running.`,
      gatewayUrl: cleanUrl,
      isOnline: check.isOnline,
      pingMs: check.pingMs,
      error: check.error,
      updatedAt: updated.updatedAt
    });
  } catch (err: any) {
    console.error('[Gateway POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Reset Gateway URL back to default (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    await SystemSetting.findOneAndDelete({ key: 'workerGatewayUrl' });
    setCachedGlobalWorkerUrl(null);

    return NextResponse.json({
      success: true,
      message: 'Worker Gateway URL reset to default local server.'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
