import { NextRequest, NextResponse } from 'next/server';
import { listGalleries, createGallery, deleteGallery } from '@/lib/pinterest-checker/galleryStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const galleries = listGalleries();
    return NextResponse.json({ success: true, galleries });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list galleries.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body?.name;
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Gallery name is required.' },
        { status: 400 }
      );
    }

    const result = createGallery(name);
    return NextResponse.json({
      success: true,
      gallery: result,
      galleries: listGalleries(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create gallery.' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Gallery name query parameter is required.' },
        { status: 400 }
      );
    }

    const success = deleteGallery(name);
    return NextResponse.json({
      success,
      galleries: listGalleries(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete gallery.' },
      { status: 500 }
    );
  }
}
