import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { createCutterSession, setCuttingProgress } from '@/lib/video-cutter/storage';
import { probeVideo, formatSecondsToTime } from '@/lib/video-cutter/ffmpeg';
import { VideoCutterSession } from '@/lib/video-cutter/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5-minute timeout

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let filename = 'video.mp4';
    let sessionPaths: any = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'No video file provided.' }, { status: 400 });
      }

      filename = file.name || 'video.mp4';
      sessionPaths = createCutterSession(filename);

      setCuttingProgress(sessionPaths.sessionId, {
        stage: 'uploading',
        percent: 10,
        message: 'Receiving video upload...',
      });

      // Stream arrayBuffer to disk
      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length < 500) {
        return NextResponse.json({ success: false, error: 'The uploaded file is empty or invalid.' }, { status: 400 });
      }
      fs.writeFileSync(sessionPaths.originalPath, buffer);
    } else {
      // Raw streaming upload
      const queryName = req.nextUrl.searchParams.get('filename') || 'video.mp4';
      filename = queryName;
      sessionPaths = createCutterSession(filename);

      setCuttingProgress(sessionPaths.sessionId, {
        stage: 'uploading',
        percent: 10,
        message: 'Receiving video stream...',
      });

      if (!req.body) {
        return NextResponse.json({ success: false, error: 'No request body provided.' }, { status: 400 });
      }

      const fileWriteStream = fs.createWriteStream(sessionPaths.originalPath);
      // @ts-ignore
      const nodeReadable = Readable.fromWeb(req.body);
      await pipeline(nodeReadable, fileWriteStream);
    }

    setCuttingProgress(sessionPaths.sessionId, {
      stage: 'analyzing',
      percent: 30,
      message: 'Analyzing video properties and duration...',
    });

    const stats = fs.statSync(sessionPaths.originalPath);
    if (stats.size < 1000) {
      return NextResponse.json(
        { success: false, error: 'File is too small to be a valid video.' },
        { status: 400 }
      );
    }

    // Probe duration, width, height, fps
    const meta = await probeVideo(sessionPaths.originalPath);

    if (!meta.duration || meta.duration <= 0) {
      return NextResponse.json(
        { success: false, error: 'Could not detect video duration. Please upload a standard MP4 or MKV video file.' },
        { status: 400 }
      );
    }

    const session: VideoCutterSession = {
      sessionId: sessionPaths.sessionId,
      originalFilename: filename,
      fileSize: stats.size,
      duration: meta.duration,
      formattedDuration: formatSecondsToTime(meta.duration),
      width: meta.width,
      height: meta.height,
      fps: meta.fps,
      hasAudio: meta.hasAudio,
      createdAt: Date.now(),
    };

    setCuttingProgress(sessionPaths.sessionId, {
      stage: 'idle',
      percent: 100,
      message: 'Video ready for cutting configuration.',
    });

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error('[VideoCutter Upload Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload and analyze video.' },
      { status: 500 }
    );
  }
}
