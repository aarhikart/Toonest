import { NextRequest, NextResponse } from 'next/server';
import { saveGalleryItems, createGallery } from '@/lib/pinterest-checker/galleryStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gallery = body?.gallery;
    const items = body?.items;

    if (!gallery || typeof gallery !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Target gallery name is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Items array is required.' },
        { status: 400 }
      );
    }

    // Ensure gallery exists or auto-create it
    createGallery(gallery);

    const result = saveGalleryItems(gallery, items);

    return NextResponse.json({
      success: true,
      gallery,
      addedCount: result.addedCount,
      totalCount: result.totalCount,
      addedItems: result.addedItems,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save items to gallery.' },
      { status: 500 }
    );
  }
}
