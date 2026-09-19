import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { connectToDatabase } from '@/lib/mongodb/client';
import { SystemSetting } from '@/lib/mongodb/models';
import { setCachedGlobalWorkerUrl } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

const LOCAL_WORKER_URL = process.env.LOCAL_WORKER_URL || 'http://localhost:5001';

// GET: Check local worker tunnel status
export async function GET(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(`${LOCAL_WORKER_URL}/tunnel`, {
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, localWorkerAvailable: true, ...data });
      } else {
        return NextResponse.json({
          success: false,
          localWorkerAvailable: true,
          error: `Worker returned HTTP ${res.status}`
        });
      }
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      return NextResponse.json({
        success: false,
        localWorkerAvailable: false,
        error: 'Local worker daemon is not reachable on port 5001. Ensure `npm run whatsapp:worker` is running.'
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Request worker to generate/restart tunnel and optionally auto-save to MongoDB
export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { force = false, autoSave = false } = body;

    const controller = new AbortController();
    // Allow up to 30s for Cloudflare tunnel creation
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(`${LOCAL_WORKER_URL}/tunnel/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({
          success: false,
          error: `Worker failed to generate tunnel: ${text || res.statusText}`
        }, { status: 502 });
      }

      const data = await res.json();
      if (!data.success || !data.url) {
        return NextResponse.json({
          success: false,
          error: data.error || 'Worker did not return a valid tunnel URL'
        }, { status: 502 });
      }

      const generatedUrl = data.url.trim().replace(/\/$/, '');

      // If autoSave requested, update MongoDB immediately
      if (autoSave) {
        await connectToDatabase();
        await SystemSetting.findOneAndUpdate(
          { key: 'workerGatewayUrl' },
          { value: generatedUrl, updatedAt: new Date() },
          { upsert: true, new: true }
        );
        setCachedGlobalWorkerUrl(generatedUrl);
      }

      return NextResponse.json({
        success: true,
        url: generatedUrl,
        autoSaved: autoSave,
        message: autoSave
          ? 'Tunnel generated and saved to MongoDB. All users are now connected!'
          : 'Tunnel URL successfully generated!'
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      return NextResponse.json({
        success: false,
        error: fetchErr.name === 'AbortError'
          ? 'Timed out waiting for tunnel startup (30s).'
          : `Failed to contact local worker at ${LOCAL_WORKER_URL}. Please make sure your worker daemon is running locally.`
      }, { status: 503 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
