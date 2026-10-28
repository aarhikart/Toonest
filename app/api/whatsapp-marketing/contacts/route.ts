import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { WhatsAppAudience } from '@/lib/mongodb/models';
import { getWorkerUserId } from '@/lib/whatsapp-web/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = getWorkerUserId(req);
    await connectToDatabase();

    const record = await WhatsAppAudience.findOne({ username: userId }).lean() as any;
    const contacts = record?.contacts || [];

    return NextResponse.json({
      success: true,
      contacts
    });
  } catch (err: any) {
    console.error('[API WhatsApp Contacts GET Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch customer list' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = (body?.userId && typeof body.userId === 'string' && body.userId.trim() !== 'default')
      ? body.userId.trim().toLowerCase()
      : getWorkerUserId(req);
    const { contacts } = body;

    if (!Array.isArray(contacts)) {
      return NextResponse.json(
        { success: false, error: 'Invalid contacts list format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await WhatsAppAudience.findOneAndUpdate(
      { username: userId },
      {
        username: userId,
        contacts,
        updatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      count: updated.contacts.length,
      contacts: updated.contacts
    });
  } catch (err: any) {
    console.error('[API WhatsApp Contacts POST Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save customer list' },
      { status: 500 }
    );
  }
}
