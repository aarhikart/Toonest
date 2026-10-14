import { NextResponse } from 'next/server';
import { getAutoDmStatus, clearAutoDmLogs } from '@/lib/automation/autoDmProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getAutoDmStatus();
  return NextResponse.json({ success: true, ...status });
}

export async function DELETE() {
  clearAutoDmLogs();
  return NextResponse.json({ success: true });
}
