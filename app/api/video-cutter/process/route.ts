import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCutterSessionPaths, setCuttingProgress } from '@/lib/video-cutter/storage';
import { probeVideo, cutVideoIntoSegments, bundleClipsToZip, formatSecondsToTime } from '@/lib/video-cutter/ffmpeg';
import { ProcessResult } from '@/lib/video-cutter/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5-minute timeout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, clipDurationSeconds, overlayWatermark, includeEndingVideo, includeLogo } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required.' }, { status: 400 });
    }

    const durationSec = parseFloat(clipDurationSeconds);
    if (!durationSec || isNaN(durationSec) || durationSec < 1) {
      return NextResponse.json(
        { success: false, error: 'Clip duration must be at least 1 second.' },
        { status: 400 }
      );
    }

    const sessionPaths = getCutterSessionPaths(sessionId);
    if (!sessionPaths || !fs.existsSync(sessionPaths.originalPath)) {
      return NextResponse.json(
        { success: false, error: 'Session expired or video file not found. Please upload again.' },
        { status: 404 }
      );
    }

    let originalFilename = 'video.mp4';
    let endingVideoInfo: any = null;
    try {
      if (fs.existsSync(sessionPaths.infoPath)) {
        const info = JSON.parse(fs.readFileSync(sessionPaths.infoPath, 'utf8'));
        originalFilename = info.originalFilename || 'video.mp4';
        endingVideoInfo = info.endingVideo || null;
      }
    } catch (_) {}

    // Clean previous clips or zip in this session if any
    try {
      const existingClips = fs.readdirSync(sessionPaths.clipsDir);
      for (const f of existingClips) {
        fs.unlinkSync(path.join(sessionPaths.clipsDir, f));
      }
      if (fs.existsSync(sessionPaths.zipPath)) {
        fs.unlinkSync(sessionPaths.zipPath);
      }
    } catch (_) {}

    // Probe duration of original video
    const meta = await probeVideo(sessionPaths.originalPath);

    const hasEnding = includeEndingVideo === true && fs.existsSync(sessionPaths.endingNormPath);
    const hasLogo = includeLogo === true && fs.existsSync(sessionPaths.logoPath);

    // 1. Cut into segments with FFmpeg
    const clips = await cutVideoIntoSegments(
      sessionPaths,
      durationSec,
      originalFilename,
      meta.duration,
      overlayWatermark === true,
      hasEnding,
      hasLogo
    );

    // 2. Generate zip filename
    const stem = path.parse(originalFilename).name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'video';
    const durationLabel = Math.round(durationSec / 60) >= 1
      ? `${Math.round(durationSec / 60)}min`
      : `${Math.round(durationSec)}sec`;
    const zipFilename = `${stem}_${clips.length}_clips_${durationLabel}${hasLogo ? '_with_logo' : ''}${hasEnding ? '_with_ending' : ''}.zip`;

    // 3. Package all clips into ZIP archive
    const zipSizeBytes = await bundleClipsToZip(sessionPaths, clips, zipFilename);

    const result: ProcessResult = {
      sessionId,
      originalFilename,
      clipDurationSeconds: durationSec,
      totalClips: clips.length,
      clips,
      zipFilename,
      zipSizeBytes,
      zipDownloadUrl: `/api/video-cutter/download/${sessionId}?filename=${encodeURIComponent(zipFilename)}`,
      durationSeconds: meta.duration,
      formattedDuration: formatSecondsToTime(meta.duration),
      hasEndingVideo: hasEnding,
      endingVideoDuration: endingVideoInfo?.duration || 0,
      hasLogo: hasLogo,
    };

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[VideoCutter Process Error]:', error);
    if (req.body) {
      try {
        const body = await req.json().catch(() => null);
        if (body?.sessionId) {
          setCuttingProgress(body.sessionId, {
            stage: 'error',
            percent: 0,
            message: error.message || 'Error occurred during cutting.',
            error: error.message,
          });
        }
      } catch (_) {}
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process and cut video.' },
      { status: 500 }
    );
  }
}
