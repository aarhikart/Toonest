import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/whatsapp/db';

export async function GET() {
  const allMessages = db.getMessages();
  const contacts = db.getContacts();

  // Group messages by contact/phone number
  const conversationsMap = new Map<string, any>();

  for (const msg of allMessages) {
    const key = msg.contactId || msg.to || msg.from;
    if (!conversationsMap.has(key)) {
      const contact = db.getContactById(msg.contactId || '') || db.getContactByPhone(msg.from) || db.getContactByPhone(msg.to);
      conversationsMap.set(key, {
        contactId: contact?.id,
        contactName: contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.phoneNumber : (msg.contactName || msg.from),
        phoneNumber: contact?.phoneNumber || msg.to || msg.from,
        consentStatus: contact?.consentStatus || 'OPTED_IN',
        lastMessage: msg.content,
        lastTimestamp: msg.timestamp,
        unreadCount: msg.direction === 'INBOUND' ? 1 : 0,
        messages: []
      });
    }

    conversationsMap.get(key).messages.push(msg);
  }

  const conversations = Array.from(conversationsMap.values()).map(c => {
    c.messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return c;
  });

  return NextResponse.json({ conversations });
}
