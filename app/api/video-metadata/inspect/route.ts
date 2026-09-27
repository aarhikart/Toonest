import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { validateMp4Signature, createSessionFiles, purgeOldSessions } from '@/lib/video-metadata/storage';
import { inspectVideoWithFfprobe } from '@/lib/video-metadata/ffprobe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB limit

export async function POST(req: NextRequest) {
  try {
    // Routine purge of old sessions
    purgeOldSessions(30);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No video file provided.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds the 500 MB limit. (Size: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Uploaded file is empty.' },
        { status: 400 }
      );
    }

    // Validate container signature (ftyp box)
    const sigCheck = validateMp4Signature(buffer);
    if (!sigCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: sigCheck.reason || 'Invalid MP4 file. The container signature could not be verified.',
        },
        { status: 400 }
      );
    }

    // Create session and write original & working copies
    const session = await createSessionFiles(buffer, file.name || 'video.mp4');

    // Inspect metadata with FFprobe on the original file
    const metadata = await inspectVideoWithFfprobe(session.originalPath, session.originalFilename);

    // Save parsed metadata for subsequent cleaning verification
    fs.writeFileSync(session.metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      filename: session.originalFilename,
      metadata,
    });
  } catch (error: any) {
    console.error('[Inspect API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to inspect MP4 metadata. File may be corrupted or unsupported.',
      },
      { status: 500 }
    );
  }
}
