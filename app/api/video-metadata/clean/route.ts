import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getSessionPaths } from '@/lib/video-metadata/storage';
import { cleanVideoMetadata, buildVerificationResult } from '@/lib/video-metadata/ffmpeg';
import { CleaningOptions, ParsedMetadata, CleaningSessionResult } from '@/lib/video-metadata/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max processing timeout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, options } = body as {
      sessionId: string;
      options: CleaningOptions;
    };

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId parameter.' },
        { status: 400 }
      );
    }

    const session = getSessionPaths(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found or has expired. Please re-upload your MP4.' },
        { status: 404 }
      );
    }

    if (!fs.existsSync(session.metadataPath)) {
      return NextResponse.json(
        { success: false, error: 'Original metadata record not found for this session.' },
        { status: 404 }
      );
    }

    const originalMeta: ParsedMetadata = JSON.parse(
      fs.readFileSync(session.metadataPath, 'utf8')
    );

    // Execute FFmpeg metadata cleaning
    const cleanedMeta = await cleanVideoMetadata(
      sessionId,
      session.workingPath,
      session.cleanedPath,
      originalMeta,
      options || { mode: 'all' },
      session.customLayerPath
    );

    // Build verification comparison
    const verification = buildVerificationResult(originalMeta, cleanedMeta, options);

    // File size statistics
    const originalSize = fs.statSync(session.originalPath).size;
    const cleanedSize = fs.existsSync(session.cleanedPath)
      ? fs.statSync(session.cleanedPath).size
      : 0;

    const sizeDiffBytes = originalSize - cleanedSize;
    const sizeSavingsPercent =
      originalSize > 0 ? Math.max(0, Math.round((sizeDiffBytes / originalSize) * 100)) : 0;

    const baseName = session.originalFilename.replace(/\.[^/.]+$/, '');
    const cleanedFilename = `${baseName}-clean.mp4`;

    const result: CleaningSessionResult = {
      sessionId,
      originalFilename: session.originalFilename,
      cleanedFilename,
      originalSize,
      cleanedSize,
      sizeDiffBytes,
      sizeSavingsPercent,
      verification,
      cleanedMetadata: cleanedMeta,
    };

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('[Clean API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to clean video metadata. Please try again.',
      },
      { status: 500 }
    );
  }
}
