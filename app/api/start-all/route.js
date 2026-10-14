import { NextResponse } from 'next/server';
import { startAllScripts, getAllStatus } from '@/lib/automation/processManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    let tabs = 2;
    let postLimit = 0;
    let accountIds = null;

    try {
      const body = await req?.json();
      if (body?.tabs) tabs = parseInt(body.tabs, 10);
      if (body?.postLimit !== undefined) postLimit = parseInt(body.postLimit, 10);
      else if (body?.loopCount !== undefined) postLimit = parseInt(body.loopCount, 10);
      if (Array.isArray(body?.accountIds)) accountIds = body.accountIds;
    } catch (_) {
      if (req?.url) {
        const { searchParams } = new URL(req.url);
        const qTabs = searchParams.get('tabs');
        if (qTabs) tabs = parseInt(qTabs, 10);
        const qLimit = searchParams.get('postLimit') || searchParams.get('loopCount');
        if (qLimit) postLimit = parseInt(qLimit, 10);
        const qAccounts = searchParams.get('accountIds') || searchParams.get('accounts');
        if (qAccounts) accountIds = qAccounts.split(',').map((s) => s.trim());
      }
    }

    const safeTabs = Math.max(1, Math.min(20, tabs || 2));
    const safeLimit = Math.max(0, postLimit || 0);
    const results = startAllScripts({ tabs: safeTabs, postLimit: safeLimit, accountIds });
    const currentStatus = getAllStatus();

    const count = Object.keys(results).length;
    return NextResponse.json({
      success: true,
      message: `${count} automation script(s) triggered with ${safeTabs} tabs each${safeLimit > 0 ? ` (Post limit: ${safeLimit})` : ''}.`,
      tabs: safeTabs,
      postLimit: safeLimit,
      results,
      status: currentStatus,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to start all scripts.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  return POST(req);
}
