import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getVideoTextSessionPaths } from '@/lib/video-text/storage';
import { probeVideo, processVideoTextRemoval } from '@/lib/video-text/ffmpeg';
import { RemovalOptions, ProcessResult } from '@/lib/video-text/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min timeout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, options } = body as {
      sessionId: string;
      options: RemovalOptions;
    };

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId.' }, { status: 400 });
    }

    if (!options || !options.boxes || options.boxes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one text or logo region to remove.' },
        { status: 400 }
      );
    }

    const sessionPaths = getVideoTextSessionPaths(sessionId);
    if (!sessionPaths || !fs.existsSync(sessionPaths.originalPath)) {
      return NextResponse.json({ success: false, error: 'Session not found or expired.' }, { status: 404 });
    }

    // Get original video specs
    const meta = await probeVideo(sessionPaths.originalPath);

    // Run text removal processing
    await processVideoTextRemoval(
      sessionPaths.originalPath,
      sessionPaths.processedPath,
      options,
      meta.width,
      meta.height
    );

    const originalSize = fs.statSync(sessionPaths.originalPath).size;
    const processedSize = fs.existsSync(sessionPaths.processedPath)
      ? fs.statSync(sessionPaths.processedPath).size
      : originalSize;

    let originalFilename = 'video.mp4';
    try {
      if (fs.existsSync(sessionPaths.infoPath)) {
        const info = JSON.parse(fs.readFileSync(sessionPaths.infoPath, 'utf8'));
        if (info.originalFilename) originalFilename = info.originalFilename;
      }
    } catch {}

    const baseName = originalFilename.replace(/\.[^/.]+$/, '');
    const processedFilename = `${baseName}-cleaned.mp4`;

    const result: ProcessResult = {
      sessionId,
      processedFilename,
      originalSize,
      processedSize,
      duration: meta.duration,
      boxesCount: options.boxes.length,
      method: options.method,
      downloadUrl: `/api/video-text/download/${sessionId}`,
      previewUrl: `/api/video-text/preview/${sessionId}?t=${Date.now()}&processed=true`,
    };

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[Process Video API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process text removal.' },
      { status: 500 }
    );
  }
}
