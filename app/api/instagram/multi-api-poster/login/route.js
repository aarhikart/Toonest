import { NextResponse } from 'next/server';
import { openLoginBrowser } from '@/lib/automation/multiApiPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.accountId) {
      return NextResponse.json({ success: false, error: 'accountId is required' }, { status: 400 });
    }
    const result = openLoginBrowser(body.accountId);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
