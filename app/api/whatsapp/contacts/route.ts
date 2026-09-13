import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/whatsapp/db';
import { ContactService } from '@/lib/whatsapp/contacts';

export async function GET() {
  const contacts = db.getContacts();
  const tags = db.getTags();
  const stats = {
    total: contacts.length,
    optedIn: contacts.filter(c => c.consentStatus === 'OPTED_IN').length,
    optedOut: contacts.filter(c => c.consentStatus === 'OPTED_OUT').length
  };

  return NextResponse.json({ contacts, tags, stats });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode 1: CSV Bulk Import
    if (body.csvText) {
      const defaultTags = body.tags || [];
      const { contacts, errors } = ContactService.parseCsv(body.csvText, defaultTags);

      const imported: any[] = [];
      for (const item of contacts) {
        if (item.phoneNumber) {
          const c = db.upsertContact(item as any);
          imported.push(c);
        }
      }

      return NextResponse.json({
        success: true,
        importedCount: imported.length,
        errors,
        contacts: imported
      });
    }

    // Mode 2: Consent status toggle (opt-out / opt-in)
    if (body.action === 'toggle_consent') {
      const { phoneNumber, status } = body;
      if (status === 'OPTED_OUT') {
        db.recordOptOut(phoneNumber);
      } else {
        db.recordOptIn(phoneNumber, 'Dashboard Operator Action');
      }
      return NextResponse.json({ success: true, contact: db.getContactByPhone(phoneNumber) });
    }

    // Mode 3: Add new tag
    if (body.action === 'add_tag') {
      const tag = db.addTag(body.name, body.color);
      return NextResponse.json({ success: true, tag });
    }

    // Mode 4: Single contact upsert
    const phoneInfo = ContactService.normalizeE164(body.phoneNumber);
    if (!phoneInfo.valid) {
      return NextResponse.json({ success: false, error: 'Invalid E.164 phone number format.' }, { status: 400 });
    }

    const saved = db.upsertContact({
      ...body,
      phoneNumber: phoneInfo.formatted,
      countryCode: phoneInfo.countryCode
    });

    return NextResponse.json({ success: true, contact: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing contact id' }, { status: 400 });
  }
  const deleted = db.deleteContact(id);
  return NextResponse.json({ success: deleted });
}
