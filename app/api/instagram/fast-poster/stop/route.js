import { NextResponse } from 'next/server';
import { stopFastPoster } from '@/lib/automation/fastPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = stopFastPoster();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
