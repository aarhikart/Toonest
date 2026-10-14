import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCutterSessionPaths } from '@/lib/video-cutter/storage';
import { normalizeEndingVideo } from '@/lib/video-cutter/ffmpeg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180; // 3-minute timeout

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sessionId = (formData.get('sessionId') as string) || '';
    const file = formData.get('file') as File | null;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required.' }, { status: 400 });
    }

    const sessionPaths = getCutterSessionPaths(sessionId);
    if (!sessionPaths || !fs.existsSync(sessionPaths.originalPath)) {
      return NextResponse.json({ success: false, error: 'Session not found. Please upload the main video first.' }, { status: 404 });
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'No ending video file provided.' }, { status: 400 });
    }

    const filename = file.name || 'ending.mp4';
    const ext = (path.extname(filename) || '').toLowerCase();
    if (ext !== '.mp4' && ext !== '.mkv') {
      return NextResponse.json(
        { success: false, error: 'Please upload an MP4 or MKV ending video file.' },
        { status: 400 }
      );
    }

    // Write raw ending file
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length < 500) {
      return NextResponse.json({ success: false, error: 'Ending video file is empty or corrupted.' }, { status: 400 });
    }

    const endingSavePath = path.join(sessionPaths.sessionDir, `ending_original${ext}`);
    fs.writeFileSync(endingSavePath, buffer);

    // Normalize ending video to match the main video's resolution, fps, and audio
    const normalizedMeta = await normalizeEndingVideo(
      sessionPaths.originalPath,
      endingSavePath,
      sessionPaths.endingNormPath
    );

    normalizedMeta.filename = filename;
    normalizedMeta.previewUrl = `/api/video-cutter/clip/${sessionId}/${path.basename(endingSavePath)}?preview=1`;

    // Update info.json
    try {
      if (fs.existsSync(sessionPaths.infoPath)) {
        const info = JSON.parse(fs.readFileSync(sessionPaths.infoPath, 'utf8'));
        info.endingVideo = normalizedMeta;
        fs.writeFileSync(sessionPaths.infoPath, JSON.stringify(info));
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      endingVideo: normalizedMeta,
    });
  } catch (err: any) {
    console.error('[VideoCutter Upload Ending Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process ending video.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || '';

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required.' }, { status: 400 });
    }

    const sessionPaths = getCutterSessionPaths(sessionId);
    if (!sessionPaths) {
      return NextResponse.json({ success: false, error: 'Session not found.' }, { status: 404 });
    }

    // Remove ending files
    if (sessionPaths.endingPath && fs.existsSync(sessionPaths.endingPath)) {
      try { fs.unlinkSync(sessionPaths.endingPath); } catch (_) {}
    }
    if (sessionPaths.endingNormPath && fs.existsSync(sessionPaths.endingNormPath)) {
      try { fs.unlinkSync(sessionPaths.endingNormPath); } catch (_) {}
    }

    // Update info.json
    try {
      if (fs.existsSync(sessionPaths.infoPath)) {
        const info = JSON.parse(fs.readFileSync(sessionPaths.infoPath, 'utf8'));
        delete info.endingVideo;
        fs.writeFileSync(sessionPaths.infoPath, JSON.stringify(info));
      }
    } catch (_) {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to remove ending video.' },
      { status: 500 }
    );
  }
}
