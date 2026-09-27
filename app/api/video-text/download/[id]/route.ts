import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getVideoTextSessionPaths } from '@/lib/video-text/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionPaths = getVideoTextSessionPaths(id);

    if (!sessionPaths || !fs.existsSync(sessionPaths.processedPath)) {
      return new NextResponse('Processed video not found or session expired', { status: 404 });
    }

    let originalFilename = 'video.mp4';
    try {
      if (fs.existsSync(sessionPaths.infoPath)) {
        const info = JSON.parse(fs.readFileSync(sessionPaths.infoPath, 'utf8'));
        if (info.originalFilename) originalFilename = info.originalFilename;
      }
    } catch {}

    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    const downloadFilename = `${baseName}-cleaned.mp4`;

    const fileBuffer = fs.readFileSync(sessionPaths.processedPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('[Download API] Error:', error);
    return new NextResponse('Error downloading video', { status: 500 });
  }
}
