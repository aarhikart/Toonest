import { NextResponse } from 'next/server';
import { startScript, getAllStatus } from '@/lib/automation/processManager';
import { getAccountById } from '@/lib/automation/accounts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    let accountId = null;

    let tabs = 2;
    let postLimit = 0;
    try {
      const body = await req.json();
      accountId = body.accountId || body.account || body.id;
      if (body.tabs) tabs = parseInt(body.tabs, 10);
      if (body.postLimit !== undefined) postLimit = parseInt(body.postLimit, 10);
      else if (body.loopCount !== undefined) postLimit = parseInt(body.loopCount, 10);
    } catch (_) {
      // Body might be empty or query parameter passed
      const { searchParams } = new URL(req.url);
      accountId = searchParams.get('accountId') || searchParams.get('account') || searchParams.get('id');
      const qTabs = searchParams.get('tabs');
      if (qTabs) tabs = parseInt(qTabs, 10);
      const qLimit = searchParams.get('postLimit') || searchParams.get('loopCount');
      if (qLimit) postLimit = parseInt(qLimit, 10);
    }

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'accountId parameter is required (e.g. "cars", "gym", "food", "pipe", "moviemela").' },
        { status: 400 }
      );
    }

    const account = getAccountById(accountId);
    if (!account) {
      return NextResponse.json(
        { success: false, error: `Invalid accountId "${accountId}". Available: cars, gym, food, pipe, moviemela.` },
        { status: 404 }
      );
    }

    const safeTabs = Math.max(1, Math.min(20, tabs || 2));
    const safeLimit = Math.max(0, postLimit || 0);
    const result = startScript(account.id, { tabs: safeTabs, postLimit: safeLimit });
    const status = getAllStatus();

    return NextResponse.json({
      success: true,
      result,
      status,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to start single script.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') || searchParams.get('account') || searchParams.get('id');

  if (!accountId) {
    return NextResponse.json(
      { success: false, error: 'accountId query param is required.' },
      { status: 400 }
    );
  }

  try {
    const account = getAccountById(accountId);
    if (!account) {
      return NextResponse.json(
        { success: false, error: `Invalid accountId "${accountId}".` },
        { status: 404 }
      );
    }

    const qTabs = searchParams.get('tabs');
    const safeTabs = Math.max(1, Math.min(20, parseInt(qTabs || '2', 10) || 2));

    const result = startScript(account.id, { tabs: safeTabs });
    const status = getAllStatus();

    return NextResponse.json({
      success: true,
      result,
      status,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
