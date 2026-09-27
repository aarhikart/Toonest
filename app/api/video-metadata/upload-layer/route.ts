import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getSessionPaths } from '@/lib/video-metadata/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const file = formData.get('file') as File | null;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId parameter.' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No layer file uploaded.' },
        { status: 400 }
      );
    }

    const session = getSessionPaths(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found or expired.' },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(session.customLayerPath, buffer);

    return NextResponse.json({
      success: true,
      message: 'Custom transparent layer uploaded successfully.',
      filename: file.name,
      size: buffer.length,
    });
  } catch (error: any) {
    console.error('[Upload Layer API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload custom layer.' },
      { status: 500 }
    );
  }
}
