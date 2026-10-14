import { NextResponse } from 'next/server';
import { getAllAccountsEnriched } from '@/lib/automation/multiApiPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accounts = getAllAccountsEnriched();
    return NextResponse.json({ success: true, accounts });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
