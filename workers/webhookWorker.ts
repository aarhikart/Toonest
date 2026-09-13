import { queue, QueueJob } from './queue';
import { db } from '../lib/whatsapp/db';
import { WhatsAppWebhookService, ParsedWebhookStatus, ParsedWebhookMessage } from '../lib/whatsapp/webhook';

export class WebhookWorker {
  private webhookService: WhatsAppWebhookService;
  private processedEventIds = new Set<string>();

  constructor() {
    this.webhookService = new WhatsAppWebhookService();
    this.register();
  }

  private register() {
    queue.on('process:PROCESS_WEBHOOK', async (job: QueueJob<{ payload: any }>) => {
      await this.processWebhookPayload(job.data.payload);
      job.status = 'completed';
    });
  }

  async processWebhookPayload(payload: any) {
    const { statuses, messages, phoneNumberId } = this.webhookService.parsePayload(payload);

    // Process Status Updates (sent, delivered, read, failed)
    for (const status of statuses) {
      if (this.processedEventIds.has(`${status.waMessageId}_${status.status}`)) {
        continue;
      }
      this.processedEventIds.add(`${status.waMessageId}_${status.status}`);

      // Update in db
      const upperStatus = status.status.toUpperCase() as any;
      db.updateRecipientStatus(status.waMessageId, upperStatus);

      const msg = db.getMessages().find(m => m.waMessageId === status.waMessageId);
      if (msg) {
        msg.status = upperStatus;
      }
    }

    // Process Incoming Messages (including STOP opt-outs)
    for (const msg of messages) {
      if (this.processedEventIds.has(msg.waMessageId)) continue;
      this.processedEventIds.add(msg.waMessageId);

      const contact = db.getContactByPhone(msg.from);

      // Handle STOP / UNSUBSCRIBE policy requirements
      if (msg.isOptOutKeyword) {
        db.recordOptOut(msg.from);
      } else if (msg.isOptInKeyword) {
        db.recordOptIn(msg.from);
      }

      // Record Inbound Message in Unified Inbox
      db.addMessage({
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        waMessageId: msg.waMessageId,
        direction: 'INBOUND',
        type: 'TEXT',
        from: msg.from,
        to: phoneNumberId || '+15557892026',
        contactId: contact?.id,
        contactName: contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.phoneNumber : msg.from,
        status: 'DELIVERED',
        content: msg.text || '(Media / Interactive message)',
        timestamp: msg.timestamp
      });
    }
  }
}

export const webhookWorker = new WebhookWorker();
