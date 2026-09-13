import { queue, QueueJob } from './queue';
import { db } from '../lib/whatsapp/db';
import { WhatsAppCloudApiClient } from '../lib/whatsapp/client';
import { ContactService } from '../lib/whatsapp/contacts';
import { TemplateService } from '../lib/whatsapp/templates';

export class CampaignWorker {
  private client: WhatsAppCloudApiClient;

  constructor() {
    this.client = new WhatsAppCloudApiClient();
    this.register();
  }

  private register() {
    queue.on('process:DISPATCH_CAMPAIGN', async (job: QueueJob<{ campaignId: string }>) => {
      await this.processCampaign(job.data.campaignId, job);
    });
  }

  async processCampaign(campaignId: string, job?: QueueJob) {
    const campaign = db.getCampaignById(campaignId);
    if (!campaign) {
      if (job) job.status = 'failed';
      return;
    }

    // Mark as running
    campaign.status = 'RUNNING';
    campaign.startedAt = new Date().toISOString();

    const template = db.getTemplateById(campaign.templateId);
    if (!template) {
      campaign.status = 'FAILED';
      if (job) {
        job.status = 'failed';
        job.error = 'Template not found';
      }
      return;
    }

    // Fetch all opted-in contacts filtered by target tags
    const allContacts = db.getContacts();
    const eligibleContacts = ContactService.filterEligibleRecipients(allContacts, campaign.targetTags);

    campaign.totalRecipients = eligibleContacts.length;

    if (eligibleContacts.length === 0) {
      campaign.status = 'COMPLETED';
      campaign.completedAt = new Date().toISOString();
      if (job) job.status = 'completed';
      return;
    }

    // Process batch
    for (const contact of eligibleContacts) {
      try {
        // Resolve variables
        const variableParams: Record<string, string> = {};
        for (const [varKey, mapField] of Object.entries(campaign.variableMapping)) {
          if (mapField === 'firstName') variableParams[varKey] = contact.firstName || 'there';
          else if (mapField === 'lastName') variableParams[varKey] = contact.lastName || '';
          else if (mapField.startsWith('metadata.')) {
            const metaKey = mapField.replace('metadata.', '');
            variableParams[varKey] = contact.metadata?.[metaKey] || '';
          } else {
            variableParams[varKey] = mapField;
          }
        }

        const renderedBody = TemplateService.renderBody(template, variableParams, contact);

        // Build Meta Template API components
        const bodyParameters = Object.values(variableParams).map(val => ({
          type: 'text' as const,
          text: val
        }));

        const components: any[] = [];
        if (bodyParameters.length > 0) {
          components.push({
            type: 'body',
            parameters: bodyParameters
          });
        }

        // Send via Meta Cloud API
        const sendResult = await this.client.sendTemplateMessage({
          phoneNumberId: campaign.senderPhoneNumberId,
          to: contact.phoneNumber,
          templateName: template.name,
          languageCode: template.language,
          components
        });

        const waMsgId = sendResult.waMessageId || `sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        // Record Recipient
        db.addRecipient({
          id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          campaignId: campaign.id,
          contactId: contact.id,
          contactName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.phoneNumber,
          phoneNumber: contact.phoneNumber,
          status: sendResult.success ? 'SENT' : 'FAILED',
          waMessageId: waMsgId,
          sentAt: sendResult.success ? new Date().toISOString() : undefined,
          failedAt: !sendResult.success ? new Date().toISOString() : undefined,
          errorMessage: sendResult.error
        });

        // Record Outbound Message
        db.addMessage({
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          waMessageId: waMsgId,
          direction: 'OUTBOUND',
          type: 'TEMPLATE',
          from: '+15557892026',
          to: contact.phoneNumber,
          contactId: contact.id,
          contactName: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.phoneNumber,
          campaignId: campaign.id,
          templateId: template.id,
          status: sendResult.success ? 'SENT' : 'FAILED',
          content: renderedBody,
          timestamp: new Date().toISOString(),
          errorMessage: sendResult.error
        });

        if (sendResult.success) {
          campaign.sentCount++;
          // Simulate realistic delivery/read progress in demo mode
          this.simulateMessageProgression(waMsgId);
        } else {
          campaign.failedCount++;
        }

        // Respect Meta rate limits (throttle between dispatches)
        await new Promise(r => setTimeout(r, 250));
      } catch (err: any) {
        campaign.failedCount++;
      }
    }

    campaign.status = 'COMPLETED';
    campaign.completedAt = new Date().toISOString();
    if (job) job.status = 'completed';
  }

  private simulateMessageProgression(waMessageId: string) {
    // Stage 1: DELIVERED after 2-4 seconds
    setTimeout(() => {
      db.updateRecipientStatus(waMessageId, 'DELIVERED');
      const msg = db.getMessages().find(m => m.waMessageId === waMessageId);
      if (msg) msg.status = 'DELIVERED';

      // Stage 2: READ after 5-10 seconds for 80% of recipients
      if (Math.random() < 0.8) {
        setTimeout(() => {
          db.updateRecipientStatus(waMessageId, 'READ');
          if (msg) msg.status = 'READ';
        }, 5000 + Math.random() * 4000);
      }
    }, 2000 + Math.random() * 2000);
  }
}

export const campaignWorker = new CampaignWorker();
