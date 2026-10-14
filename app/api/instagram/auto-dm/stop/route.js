import { NextResponse } from 'next/server';
import { stopAutoDm } from '@/lib/automation/autoDmProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = stopAutoDm();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
