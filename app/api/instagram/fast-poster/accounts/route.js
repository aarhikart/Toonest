import { NextResponse } from 'next/server';
import {
  listAvailableInstagramAccounts,
  switchAccountSession,
  startFastPoster,
} from '@/lib/automation/fastPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accounts = listAvailableInstagramAccounts();
    const active = accounts.find((a) => a.isCurrent)?.id || 'ig_fastposter_session';
    return NextResponse.json({
      success: true,
      activeSession: active,
      accounts,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, sessionName } = body;

    if (action === 'switch') {
      const res = switchAccountSession(sessionName, sessionName);
      return NextResponse.json(res);
    }

    if (action === 'login') {
      // Launch Chrome for login with the specified session
      const targetSession = sessionName || 'ig_fastposter_session';
      const switchRes = switchAccountSession(targetSession, sessionName);
      const res = startFastPoster({
        loginOnly: true,
        sessionDir: switchRes.sessionDir,
      });
      return NextResponse.json({ success: true, ...res, sessionDir: switchRes.sessionDir, name: switchRes.name });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Use "switch" or "login"' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
