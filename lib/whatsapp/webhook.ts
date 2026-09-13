import crypto from 'crypto';

export interface WebhookVerificationQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
}

export interface ParsedWebhookStatus {
  waMessageId: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  recipientId: string;
  timestamp: string;
  errorCode?: number;
  errorMessage?: string;
}

export interface ParsedWebhookMessage {
  waMessageId: string;
  from: string;
  timestamp: string;
  type: string;
  text?: string;
  isOptOutKeyword: boolean;
  isOptInKeyword: boolean;
  buttonPayload?: string;
}

export class WhatsAppWebhookService {
  private verifyToken: string;
  private appSecret: string;

  constructor(verifyToken?: string, appSecret?: string) {
    this.verifyToken = verifyToken || process.env.WHATSAPP_VERIFY_TOKEN || 'toolnest_whatsapp_webhook_secret_2026';
    this.appSecret = appSecret || process.env.WHATSAPP_APP_SECRET || '';
  }

  /**
   * Verify GET challenge handshake from Meta
   */
  verifyChallenge(query: WebhookVerificationQuery): { verified: boolean; challenge?: string } {
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === this.verifyToken && challenge) {
      return { verified: true, challenge };
    }
    return { verified: false };
  }

  /**
   * Verify Meta HMAC-SHA256 signature
   * Header: X-Hub-Signature-256=sha256=<signature>
   */
  verifySignature(rawBody: string, signatureHeader: string | null): boolean {
    if (!this.appSecret) {
      // In development/standalone mode without appSecret configured, allow verification
      return true;
    }
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      return false;
    }

    const signature = signatureHeader.substring(7);
    const expectedSignature = crypto
      .createHmac('sha256', this.appSecret)
      .update(rawBody, 'utf8')
      .digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Parse Meta Webhook Payload into normalized status events and incoming messages
   */
  parsePayload(payload: any): {
    statuses: ParsedWebhookStatus[];
    messages: ParsedWebhookMessage[];
    phoneNumberId?: string;
  } {
    const statuses: ParsedWebhookStatus[] = [];
    const messages: ParsedWebhookMessage[] = [];
    let phoneNumberId: string | undefined;

    if (payload?.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
      return { statuses, messages };
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes || []) {
        if (change.field !== 'messages') continue;
        const val = change.value;
        if (!val) continue;

        phoneNumberId = val.metadata?.phone_number_id;

        // Process message statuses (sent, delivered, read, failed)
        if (Array.isArray(val.statuses)) {
          for (const s of val.statuses) {
            statuses.push({
              waMessageId: s.id,
              status: s.status,
              recipientId: s.recipient_id,
              timestamp: s.timestamp ? new Date(parseInt(s.timestamp, 10) * 1000).toISOString() : new Date().toISOString(),
              errorCode: s.errors?.[0]?.code,
              errorMessage: s.errors?.[0]?.title || s.errors?.[0]?.message
            });
          }
        }

        // Process incoming user messages
        if (Array.isArray(val.messages)) {
          for (const m of val.messages) {
            let bodyText = '';
            if (m.type === 'text' && m.text?.body) {
              bodyText = m.text.body.trim();
            } else if (m.type === 'button' && m.button?.text) {
              bodyText = m.button.text.trim();
            } else if (m.type === 'interactive') {
              bodyText = m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || '';
            }

            const lower = bodyText.toLowerCase();
            const isOptOut = ['stop', 'unsubscribe', 'cancel', 'opt out', 'halt', 'end'].includes(lower);
            const isOptIn = ['start', 'unstop', 'subscribe', 'yes', 'opt in'].includes(lower);

            messages.push({
              waMessageId: m.id,
              from: m.from,
              timestamp: m.timestamp ? new Date(parseInt(m.timestamp, 10) * 1000).toISOString() : new Date().toISOString(),
              type: m.type,
              text: bodyText,
              isOptOutKeyword: isOptOut,
              isOptInKeyword: isOptIn,
              buttonPayload: m.button?.payload || m.interactive?.button_reply?.id
            });
          }
        }
      }
    }

    return { statuses, messages, phoneNumberId };
  }
}
