import { NextResponse } from 'next/server';
import { getFastPosterStatus, clearFastPosterLogs } from '@/lib/automation/fastPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getFastPosterStatus();
  return NextResponse.json({ success: true, ...status });
}

export async function DELETE() {
  clearFastPosterLogs();
  return NextResponse.json({ success: true });
}
