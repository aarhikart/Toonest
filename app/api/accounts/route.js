import { NextResponse } from 'next/server';
import { getAccounts, addCustomAccount, deleteCustomAccount } from '@/lib/automation/accounts';
import { getAllStatus, ensureAccountInStore, stopScript } from '@/lib/automation/processManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accounts = getAccounts();
    const status = getAllStatus();
    return NextResponse.json({
      success: true,
      accounts,
      status,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch accounts.' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, category, folder, hashtags, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Account name is required.' },
        { status: 400 }
      );
    }

    if (!folder || !folder.trim()) {
      return NextResponse.json(
        { success: false, error: 'Local video folder path is required.' },
        { status: 400 }
      );
    }

    const newAccount = addCustomAccount({
      name,
      category,
      folder,
      hashtags,
      color,
    });

    // Ensure runtime store is ready for this account
    ensureAccountInStore(newAccount.id);

    const status = getAllStatus();

    return NextResponse.json({
      success: true,
      message: `Account "${newAccount.name}" created successfully.`,
      account: newAccount,
      status,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    let accountId = null;
    try {
      const body = await req.json();
      accountId = body.accountId || body.id;
    } catch (_) {
      const { searchParams } = new URL(req.url);
      accountId = searchParams.get('accountId') || searchParams.get('id');
    }

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required for deletion.' },
        { status: 400 }
      );
    }

    // Stop script first if currently active
    try {
      stopScript(accountId);
    } catch (_) {}

    deleteCustomAccount(accountId);
    const status = getAllStatus();

    return NextResponse.json({
      success: true,
      message: `Account "${accountId}" deleted successfully.`,
      status,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete account.' },
      { status: 500 }
    );
  }
}
