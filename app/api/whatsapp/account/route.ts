import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/whatsapp/db';
import { WhatsAppCloudApiClient } from '@/lib/whatsapp/client';

export async function GET() {
  const account = db.getAccount();
  const stats = db.getStats();
  const client = new WhatsAppCloudApiClient();

  return NextResponse.json({
    account,
    stats,
    isConfigured: client.isConfigured()
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.updateAccount(body);
    return NextResponse.json({ success: true, account: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
