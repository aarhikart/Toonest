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

    if (!sessionPaths) {
      return new NextResponse('Session not found', { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const isProcessed = searchParams.get('processed') === 'true';

    const targetPath =
      isProcessed && fs.existsSync(sessionPaths.processedPath)
        ? sessionPaths.processedPath
        : sessionPaths.originalPath;

    if (!fs.existsSync(targetPath)) {
      return new NextResponse('Video file not found', { status: 404 });
    }

    const stat = fs.statSync(targetPath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const fileStream = fs.createReadStream(targetPath, { start, end });
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4',
        },
      });
    } else {
      const fileStream = fs.createReadStream(targetPath);
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
        },
      });
    }
  } catch (error: any) {
    console.error('[Preview API] Error:', error);
    return new NextResponse('Internal error streaming video', { status: 500 });
  }
}
