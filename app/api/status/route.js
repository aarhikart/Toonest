import { NextResponse } from 'next/server';
import { getAllStatus } from '@/lib/automation/processManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const statusData = getAllStatus();
    return NextResponse.json({
      success: true,
      ...statusData,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve automation status.' },
      { status: 500 }
    );
  }
}
