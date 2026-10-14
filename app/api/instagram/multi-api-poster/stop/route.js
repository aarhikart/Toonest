import { NextResponse } from 'next/server';
import { stopMultiPoster } from '@/lib/automation/multiApiPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = stopMultiPoster();
    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
