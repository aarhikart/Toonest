import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppWebhookService } from '@/lib/whatsapp/webhook';
import { queue } from '@/workers/queue';
import { db } from '@/lib/whatsapp/db';

const webhookService = new WhatsAppWebhookService();

/**
 * Meta Webhook Challenge Verification (GET)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode') || '';
  const verifyToken = searchParams.get('hub.verify_token') || '';
  const challenge = searchParams.get('hub.challenge') || '';

  const verification = webhookService.verifyChallenge({
    'hub.mode': mode,
    'hub.verify_token': verifyToken,
    'hub.challenge': challenge
  });

  if (verification.verified && verification.challenge) {
    return new Response(verification.challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed: invalid token or mode' }, { status: 403 });
}

/**
 * Meta Webhook Inbound Events & Status Updates (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    // Verify HMAC-SHA256 signature
    const isValid = webhookService.verifySignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Audit log
    db.logWebhook({
      id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      eventId: payload.entry?.[0]?.id || 'unknown',
      eventType: payload.entry?.[0]?.changes?.[0]?.field || 'messages',
      payload,
      receivedAt: new Date().toISOString(),
      processed: true
    });

    // Queue for asynchronous background processing
    await queue.add('PROCESS_WEBHOOK', { payload });

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing webhook' }, { status: 500 });
  }
}
