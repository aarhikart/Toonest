import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { Readable } from 'stream';
import { getSessionPaths } from '@/lib/video-metadata/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
  }

  const session = getSessionPaths(id);
  if (!session || !fs.existsSync(session.cleanedPath)) {
    return NextResponse.json(
      { error: 'Cleaned video not found or session has expired.' },
      { status: 404 }
    );
  }

  const stat = fs.statSync(session.cleanedPath);
  const baseName = session.originalFilename.replace(/\.[^/.]+$/, '');
  const cleanFilename = `${baseName}-clean.mp4`;

  const nodeStream = fs.createReadStream(session.cleanedPath);
  const webStream = Readable.toWeb(nodeStream);

  return new Response(webStream as any, {
    status: 200,
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': String(stat.size),
      'Content-Disposition': `attachment; filename="${encodeURIComponent(cleanFilename)}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Accept-Ranges': 'bytes',
    },
  });
}
