import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { createVideoTextSession } from '@/lib/video-text/storage';
import { probeVideo, extractFrameAtTimestamp } from '@/lib/video-text/ffmpeg';
import { VideoTextSession } from '@/lib/video-text/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No video file provided.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length < 1000) {
      return NextResponse.json({ success: false, error: 'File is too small to be a valid video.' }, { status: 400 });
    }

    const sessionPaths = createVideoTextSession(buffer, file.name);

    // Probe video properties
    const meta = await probeVideo(sessionPaths.originalPath);

    // Extract first frame
    const initialFramePath = path.join(sessionPaths.framesDir, 'frame_0.jpg');
    await extractFrameAtTimestamp(sessionPaths.originalPath, 0, initialFramePath);

    const session: VideoTextSession = {
      sessionId: sessionPaths.sessionId,
      originalFilename: file.name,
      fileSize: buffer.length,
      duration: meta.duration,
      formattedDuration: formatDuration(meta.duration),
      width: meta.width,
      height: meta.height,
      fps: meta.fps,
      hasAudio: meta.hasAudio,
    };

    return NextResponse.json({
      success: true,
      session,
      previewUrl: `/api/video-text/preview/${sessionPaths.sessionId}`,
    });
  } catch (error: any) {
    console.error('[Upload Video API] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload and probe video.' },
      { status: 500 }
    );
  }
}
