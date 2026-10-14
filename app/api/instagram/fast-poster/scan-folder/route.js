import { NextResponse } from 'next/server';
import { scanImagesFolder, DEFAULT_IMAGES_FOLDER } from '@/lib/automation/fastPosterProcessManager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder') || DEFAULT_IMAGES_FOLDER;
  const result = scanImagesFolder(folder);
  return NextResponse.json({ success: true, ...result });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || DEFAULT_IMAGES_FOLDER;
    const result = scanImagesFolder(folder);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
