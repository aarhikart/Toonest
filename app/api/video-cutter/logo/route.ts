import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCutterSessionPaths } from '@/lib/video-cutter/storage';
import { probeVideo } from '@/lib/video-cutter/ffmpeg';
import { LogoMetadata } from '@/lib/video-cutter/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2-minute timeout

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
      return NextResponse.json(
        { success: false, error: 'Session not found. Please upload the main video first.' },
        { status: 404 }
      );
    }

    if (!file) {
      return NextResponse.json({ success: false, error: 'No logo file provided.' }, { status: 400 });
    }

    const filename = file.name || 'logo.png';
    const ext = (path.extname(filename) || '').toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    if (!validExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, error: 'Please upload a valid image file (PNG, JPG, JPEG, or WebP).' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length < 50) {
      return NextResponse.json({ success: false, error: 'Logo image file is empty or corrupted.' }, { status: 400 });
    }

    // Clean up any existing logo files first
    for (const extCandidate of validExtensions) {
      const oldFile = path.join(sessionPaths.sessionDir, `logo${extCandidate}`);
      if (fs.existsSync(oldFile)) {
        try { fs.unlinkSync(oldFile); } catch (_) {}
      }
    }

    // Save as logo{ext}
    const logoSavePath = path.join(sessionPaths.sessionDir, `logo${ext}`);
    fs.writeFileSync(logoSavePath, buffer);

    // Update paths session paths logoPath reference
    sessionPaths.logoPath = logoSavePath;

    let width = 200;
    let height = 200;
    try {
      const probe = await probeVideo(logoSavePath);
      width = probe.width || 200;
      height = probe.height || 200;
    } catch (_) {}

    const logoMeta: LogoMetadata = {
      filename,
      fileSize: buffer.length,
      width,
      height,
      previewUrl: `/api/video-cutter/logo?sessionId=${sessionId}&v=${Date.now()}`,
    };

    // Update info.json
    try {
      if (fs.existsSync(sessionPaths.infoPath)) {
        const info = JSON.parse(fs.readFileSync(sessionPaths.infoPath, 'utf8'));
        info.logoImage = logoMeta;
        fs.writeFileSync(sessionPaths.infoPath, JSON.stringify(info));
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      logo: logoMeta,
    });
  } catch (err: any) {
    console.error('[VideoCutter Upload Logo Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process logo image.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || '';

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required.' }, { status: 400 });
    }

    const sessionPaths = getCutterSessionPaths(sessionId);
    if (!sessionPaths || !sessionPaths.logoPath || !fs.existsSync(sessionPaths.logoPath)) {
      return NextResponse.json({ success: false, error: 'Logo not found.' }, { status: 404 });
    }

    const ext = path.extname(sessionPaths.logoPath).toLowerCase();
    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    const buffer = fs.readFileSync(sessionPaths.logoPath);
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve logo.' },
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

    // Remove logo files
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    for (const ext of validExtensions) {
      const file = path.join(sessionPaths.sessionDir, `logo${ext}`);
      if (fs.existsSync(file)) {
        try { fs.unlinkSync(file); } catch (_) {}
      }
    }

    // Update info.json
    try {
      if (fs.existsSync(sessionPaths.infoPath)) {
        const info = JSON.parse(fs.readFileSync(sessionPaths.infoPath, 'utf8'));
        delete info.logoImage;
        fs.writeFileSync(sessionPaths.infoPath, JSON.stringify(info));
      }
    } catch (_) {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to remove logo.' },
      { status: 500 }
    );
  }
}
