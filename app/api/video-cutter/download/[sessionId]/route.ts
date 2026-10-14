import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { Readable } from 'stream';
import { getCutterSessionPaths } from '@/lib/video-cutter/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const sessionPaths = getCutterSessionPaths(sessionId);

    if (!sessionPaths || !fs.existsSync(sessionPaths.zipPath)) {
      return NextResponse.json({ success: false, error: 'ZIP file not found or expired.' }, { status: 404 });
    }

    const stats = fs.statSync(sessionPaths.zipPath);
    const queryFilename = req.nextUrl.searchParams.get('filename') || 'video_clips.zip';
    const safeFilename = queryFilename.replace(/[^a-zA-Z0-9._-]/g, '_');

    const nodeStream = fs.createReadStream(sessionPaths.zipPath);
    // Convert Node ReadStream to Web ReadableStream
    // @ts-ignore
    const webStream = Readable.toWeb(nodeStream);

    return new Response(webStream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('[VideoCutter Download Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to download ZIP file.' },
      { status: 500 }
    );
  }
}
