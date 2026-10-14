import { NextRequest, NextResponse } from 'next/server';
import { getGalleryItems, deleteGalleryItem } from '@/lib/pinterest-checker/galleryStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Gallery name is required.' },
        { status: 400 }
      );
    }

    const items = getGalleryItems(name);
    return NextResponse.json({
      success: true,
      gallery: name,
      count: items.length,
      items,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to get gallery items.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const id = searchParams.get('id');
    if (!name || !id) {
      return NextResponse.json(
        { success: false, error: 'Both gallery name and item id are required.' },
        { status: 400 }
      );
    }

    const result = deleteGalleryItem(name, id);
    return NextResponse.json({
      success: result.success,
      gallery: name,
      totalCount: result.totalCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete gallery item.' },
      { status: 500 }
    );
  }
}
