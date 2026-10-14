import { NextResponse } from 'next/server';
import { getMultiPosterStatus } from '@/lib/automation/multiApiPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = getMultiPosterStatus();
    return NextResponse.json({ success: true, ...status });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
