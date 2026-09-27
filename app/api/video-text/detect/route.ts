import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getVideoTextSessionPaths } from '@/lib/video-text/storage';
import { extractFrameAtTimestamp } from '@/lib/video-text/ffmpeg';
import { detectTextInImage } from '@/lib/video-text/ocr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, timestamp = 0 } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Missing sessionId.' }, { status: 400 });
    }

    const sessionPaths = getVideoTextSessionPaths(sessionId);
    if (!sessionPaths || !fs.existsSync(sessionPaths.originalPath)) {
      return NextResponse.json({ success: false, error: 'Session not found or expired.' }, { status: 404 });
    }

    const cleanTimestamp = Math.max(0, parseFloat(timestamp) || 0);
    const frameFilename = `frame_${cleanTimestamp.toFixed(2).replace('.', '_')}.jpg`;
    const framePath = path.join(sessionPaths.framesDir, frameFilename);

    // Extract frame at this timestamp
    await extractFrameAtTimestamp(sessionPaths.originalPath, cleanTimestamp, framePath);

    // Run Tesseract OCR on frame
    const boxes = await detectTextInImage(framePath);

    const imageBuffer = fs.readFileSync(framePath);
    const frameDataUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      timestamp: cleanTimestamp,
      frameDataUrl,
      boxes,
    });
  } catch (error: any) {
    console.error('[Detect API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to detect text on video frame.' },
      { status: 500 }
    );
  }
}
