import { NextResponse } from 'next/server';
import { stopScript, stopAllScripts, getAllStatus } from '@/lib/automation/processManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    let accountId = null;
    let stopAll = false;

    try {
      const body = await req.json();
      accountId = body.accountId || body.account || body.id;
      stopAll = body.all === true || body.stopAll === true;
    } catch (_) {
      const { searchParams } = new URL(req.url);
      accountId = searchParams.get('accountId') || searchParams.get('account') || searchParams.get('id');
      stopAll = searchParams.get('all') === '1' || searchParams.get('all') === 'true';
    }

    if (stopAll || (!accountId && !stopAll)) {
      // If all is requested, or no specific accountId is specified
      const results = stopAllScripts();
      const status = getAllStatus();
      return NextResponse.json({
        success: true,
        message: 'All running automation scripts terminated.',
        results,
        status,
      });
    }

    const result = stopScript(accountId);
    const status = getAllStatus();

    return NextResponse.json({
      success: true,
      result,
      status,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to stop script.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  return POST(req);
}
