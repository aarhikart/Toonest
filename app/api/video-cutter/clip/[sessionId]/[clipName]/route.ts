import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { getCutterSessionPaths } from '@/lib/video-cutter/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string; clipName: string }> }
) {
  try {
    const { sessionId, clipName } = await params;
    const sessionPaths = getCutterSessionPaths(sessionId);

    if (!sessionPaths) {
      return NextResponse.json({ success: false, error: 'Session not found.' }, { status: 404 });
    }

    const safeClipName = path.basename(clipName);
    let clipFilePath = path.join(sessionPaths.clipsDir, safeClipName);
    if (!fs.existsSync(clipFilePath)) {
      clipFilePath = path.join(sessionPaths.sessionDir, safeClipName);
    }

    if (!fs.existsSync(clipFilePath)) {
      return NextResponse.json({ success: false, error: 'Clip not found.' }, { status: 404 });
    }

    const stat = fs.statSync(clipFilePath);
    const fileSize = stat.size;
    const isPreview = req.nextUrl.searchParams.get('preview') === '1';

    const isMkv = safeClipName.toLowerCase().endsWith('.mkv');
    const contentType = isMkv ? 'video/x-matroska' : 'video/mp4';

    // HTTP Range request for smooth in-browser video playback
    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(clipFilePath, { start, end });
      // @ts-ignore
      const webStream = Readable.toWeb(fileStream);

      return new Response(webStream as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': contentType,
        },
      });
    }

    const fileStream = fs.createReadStream(clipFilePath);
    // @ts-ignore
    const webStream = Readable.toWeb(fileStream);

    const headers: Record<string, string> = {
      'Content-Length': fileSize.toString(),
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    };

    if (!isPreview) {
      headers['Content-Disposition'] = `attachment; filename="${safeClipName}"`;
    }

    return new Response(webStream as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('[VideoCutter Clip Stream Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to stream video clip.' },
      { status: 500 }
    );
  }
}
