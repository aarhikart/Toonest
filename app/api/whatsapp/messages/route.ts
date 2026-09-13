import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/whatsapp/db';
import { WhatsAppCloudApiClient } from '@/lib/whatsapp/client';
import { ContactService } from '@/lib/whatsapp/contacts';
import { WhatsAppMessage, MessageStatus } from '@/lib/whatsapp/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contactId = searchParams.get('contactId') || undefined;
  const messages = db.getMessages(contactId);

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, text, contactId } = body;

    if (!to || !text) {
      return NextResponse.json({ success: false, error: 'Recipient and text are required.' }, { status: 400 });
    }

    const { valid, formatted } = ContactService.normalizeE164(to);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid E.164 phone number.' }, { status: 400 });
    }

    const client = new WhatsAppCloudApiClient();
    const res = await client.sendTextMessage({
      phoneNumberId: 'phone_id_9928374',
      to: formatted,
      text
    });

    const contact = db.getContactByPhone(formatted);

    const message: WhatsAppMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      waMessageId: res.waMessageId || `sim_${Date.now()}`,
      direction: 'OUTBOUND',
      type: 'TEXT',
      from: '+15557892026',
      to: formatted,
      contactId: contact?.id || contactId,
      contactName: contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.phoneNumber : formatted,
      status: (res.success ? 'SENT' : 'FAILED') as MessageStatus,
      content: text,
      timestamp: new Date().toISOString(),
      errorMessage: res.error
    };

    db.addMessage(message);

    // Simulate quick delivery & read
    setTimeout(() => {
      message.status = 'DELIVERED';
      setTimeout(() => {
        message.status = 'READ';
      }, 3000);
    }, 1500);

    return NextResponse.json({ success: res.success, message, error: res.error });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
