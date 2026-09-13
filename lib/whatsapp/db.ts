import {
  WhatsAppAccount,
  WhatsAppPhoneNumber,
  Contact,
  ContactTag,
  MessageTemplate,
  Campaign,
  CampaignRecipient,
  WhatsAppMessage,
  MessageEvent,
  WebhookLog,
  DashboardStats
} from './types';

// In-Memory Dual Store pre-seeded with realistic production data
class WhatsAppDatabase {
  private account: WhatsAppAccount;
  private tags: ContactTag[];
  private contacts: Contact[];
  private templates: MessageTemplate[];
  private campaigns: Campaign[];
  private recipients: CampaignRecipient[];
  private messages: WhatsAppMessage[];
  private messageEvents: MessageEvent[];
  private webhookLogs: WebhookLog[];

  constructor() {
    this.account = {
      id: 'acc_waba_01',
      name: 'ToolNest Enterprise WhatsApp',
      wabaId: '109845729184712',
      appId: '984712039485712',
      businessName: 'ToolNest Technologies Inc.',
      timezone: 'America/New_York',
      currency: 'USD',
      qualityRating: 'GREEN',
      messagingLimit: 'TIER_100K',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      phoneNumbers: [
        {
          id: 'phone_01',
          phoneNumberId: 'phone_id_9928374',
          displayPhoneNumber: '+1 (555) 789-2026',
          verifiedName: 'ToolNest Official Support',
          qualityRating: 'GREEN',
          messagingLimit: '100,000 conversations/day',
          codeVerificationStatus: 'VERIFIED',
          isDefault: true
        },
        {
          id: 'phone_02',
          phoneNumberId: 'phone_id_4492817',
          displayPhoneNumber: '+44 20 7946 0912',
          verifiedName: 'ToolNest Europe Alerts',
          qualityRating: 'GREEN',
          messagingLimit: '50,000 conversations/day',
          codeVerificationStatus: 'VERIFIED',
          isDefault: false
        }
      ]
    };

    this.tags = [
      { id: 'tag_vip', name: 'VIP Customers', color: '#5722AF' },
      { id: 'tag_leads', name: 'Product Leads', color: '#2563EB' },
      { id: 'tag_subscribers', name: 'Newsletter Opt-in', color: '#10B981' },
      { id: 'tag_churned', name: 'Re-engagement', color: '#F59E0B' },
      { id: 'tag_tech', name: 'Developers', color: '#6366F1' }
    ];

    this.contacts = [
      {
        id: 'c_01',
        phoneNumber: '+12025550143',
        countryCode: '1',
        firstName: 'Alexander',
        lastName: 'Wright',
        email: 'alex.wright@example.com',
        consentStatus: 'OPTED_IN',
        optInSource: 'Website Checkout Checkbox',
        optInAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        tags: ['VIP Customers', 'Developers'],
        metadata: { company: 'Apex Innovations', plan: 'Enterprise', discount: '25%' },
        lastMessageAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'c_02',
        phoneNumber: '+14155552671',
        countryCode: '1',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.r@cloudflow.io',
        consentStatus: 'OPTED_IN',
        optInSource: 'Click-to-WhatsApp QR Code',
        optInAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        tags: ['VIP Customers', 'Product Leads'],
        metadata: { company: 'CloudFlow', plan: 'Scale', discount: '30%' },
        lastMessageAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 'c_03',
        phoneNumber: '+442079460192',
        countryCode: '44',
        firstName: 'Marcus',
        lastName: 'Sterling',
        email: 'm.sterling@ukretail.co.uk',
        consentStatus: 'OPTED_IN',
        optInSource: 'SMS Double Opt-in',
        optInAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        tags: ['Newsletter Opt-in', 'Product Leads'],
        metadata: { company: 'Sterling & Co', region: 'EMEA', discount: '20%' },
        lastMessageAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'c_04',
        phoneNumber: '+919876543210',
        countryCode: '91',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@techsphere.in',
        consentStatus: 'OPTED_IN',
        optInSource: 'In-App Onboarding Flow',
        optInAt: new Date(Date.now() - 45 * 86400000).toISOString(),
        tags: ['VIP Customers', 'Newsletter Opt-in'],
        metadata: { company: 'TechSphere India', plan: 'Enterprise', discount: '40%' },
        lastMessageAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
      },
      {
        id: 'c_05',
        phoneNumber: '+13125558901',
        countryCode: '1',
        firstName: 'Daniel',
        lastName: 'O\'Connor',
        email: 'doconnor@midwestdata.com',
        consentStatus: 'OPTED_OUT', // Explicitly Opted Out (Suppressed)
        optInSource: 'Website Form',
        optInAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        optOutAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        tags: ['Re-engagement'],
        metadata: { reason: 'User sent STOP via WhatsApp' },
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
      },
      {
        id: 'c_06',
        phoneNumber: '+17025553311',
        countryCode: '1',
        firstName: 'Samantha',
        lastName: 'Vance',
        email: 's.vance@vegasfin.org',
        consentStatus: 'OPTED_IN',
        optInSource: 'Trade Show QR Booth',
        optInAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        tags: ['Product Leads', 'Developers'],
        metadata: { interest: 'API Automation', discount: '20%' },
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
      }
    ];

    this.templates = [
      {
        id: 'tmpl_promo_01',
        name: 'summer_feature_launch_2026',
        category: 'MARKETING',
        language: 'en_US',
        status: 'APPROVED',
        headerType: 'TEXT',
        headerText: 'Exclusive Announcement for {{1}}',
        bodyText: 'Hi {{1}}, we are excited to release the new ToolNest WhatsApp Engine! Upgrade your account this week to claim your exclusive {{2}} discount on all annual enterprise plans.',
        footerText: 'Reply STOP to unsubscribe at any time.',
        buttons: [
          { type: 'URL', text: 'Claim Discount', url: 'https://toolnest.com/offer' },
          { type: 'QUICK_REPLY', text: 'Talk to Sales' }
        ],
        variables: ['1', '2'],
        sampleValues: { '1': 'Alexander', '2': '25%' },
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'tmpl_order_02',
        name: 'order_status_update_v2',
        category: 'UTILITY',
        language: 'en_US',
        status: 'APPROVED',
        headerType: 'TEXT',
        headerText: 'Order #{{1}} Confirmed',
        bodyText: 'Hello {{2}}, your order #{{1}} has been confirmed and is now being packaged. Expected delivery is {{3}}.',
        footerText: 'ToolNest Order Tracking',
        buttons: [
          { type: 'URL', text: 'Track Order', url: 'https://toolnest.com/orders/{{1}}' },
          { type: 'PHONE_NUMBER', text: 'Call Support', phoneNumber: '+18005550199' }
        ],
        variables: ['1', '2', '3'],
        sampleValues: { '1': 'TN-9481', '2': 'Elena', '3': 'Tomorrow, 4:00 PM' },
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
      },
      {
        id: 'tmpl_auth_03',
        name: 'security_verification_code',
        category: 'AUTHENTICATION',
        language: 'en_US',
        status: 'APPROVED',
        bodyText: '{{1}} is your ToolNest security code. For your protection, never share this code with anyone.',
        footerText: 'Expires in 10 minutes.',
        buttons: [
          { type: 'QUICK_REPLY', text: 'Copy Code' }
        ],
        variables: ['1'],
        sampleValues: { '1': '839210' },
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'tmpl_reminder_04',
        name: 'vip_webinar_reminder',
        category: 'MARKETING',
        language: 'en_US',
        status: 'APPROVED',
        headerType: 'TEXT',
        headerText: 'Reminder: Live Workshop Tomorrow',
        bodyText: 'Hi {{1}}, this is a friendly reminder that our VIP workshop on WhatsApp automation starts tomorrow at {{2}}. Have your questions ready!',
        footerText: 'Reply STOP to opt out.',
        buttons: [
          { type: 'URL', text: 'Join Webinar', url: 'https://toolnest.com/workshop' },
          { type: 'QUICK_REPLY', text: 'Add to Calendar' }
        ],
        variables: ['1', '2'],
        sampleValues: { '1': 'Marcus', '2': '2:00 PM EST' },
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ];

    this.campaigns = [
      {
        id: 'cmp_01',
        name: 'Q3 Enterprise Feature Launch',
        description: 'Targeted broadcast to all VIP customers with personalized discount codes.',
        type: 'BROADCAST',
        status: 'COMPLETED',
        templateId: 'tmpl_promo_01',
        templateName: 'summer_feature_launch_2026',
        senderPhoneNumberId: 'phone_id_9928374',
        targetTags: ['VIP Customers'],
        totalRecipients: 3,
        sentCount: 3,
        deliveredCount: 3,
        readCount: 2,
        failedCount: 0,
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 85000000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        variableMapping: { '1': 'firstName', '2': 'metadata.discount' }
      },
      {
        id: 'cmp_02',
        name: 'Product Leads Workshop Invite',
        description: 'Exclusive invitation broadcast for qualified leads.',
        type: 'SCHEDULED',
        status: 'SCHEDULED',
        templateId: 'tmpl_reminder_04',
        templateName: 'vip_webinar_reminder',
        senderPhoneNumberId: 'phone_id_9928374',
        targetTags: ['Product Leads'],
        totalRecipients: 3,
        sentCount: 0,
        deliveredCount: 0,
        readCount: 0,
        failedCount: 0,
        scheduledAt: new Date(Date.now() + 24 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        variableMapping: { '1': 'firstName', '2': 'Tomorrow, 2:00 PM EST' }
      }
    ];

    this.recipients = [
      {
        id: 'rec_01',
        campaignId: 'cmp_01',
        contactId: 'c_01',
        contactName: 'Alexander Wright',
        phoneNumber: '+12025550143',
        status: 'READ',
        waMessageId: 'wamid.HBgLMTY5ODQ1NzI5MThBFjNFN0E1QTMwMUE4QzQ5QTk=',
        sentAt: new Date(Date.now() - 86400000).toISOString(),
        deliveredAt: new Date(Date.now() - 86390000).toISOString(),
        readAt: new Date(Date.now() - 86300000).toISOString()
      },
      {
        id: 'rec_02',
        campaignId: 'cmp_01',
        contactId: 'c_02',
        contactName: 'Elena Rostova',
        phoneNumber: '+14155552671',
        status: 'READ',
        waMessageId: 'wamid.HBgLMTY5ODQ1NzI5MThBFjNFN0E1QTMwMUE4QzQ5QkI=',
        sentAt: new Date(Date.now() - 86395000).toISOString(),
        deliveredAt: new Date(Date.now() - 86385000).toISOString(),
        readAt: new Date(Date.now() - 86250000).toISOString()
      },
      {
        id: 'rec_03',
        campaignId: 'cmp_01',
        contactId: 'c_04',
        contactName: 'Priya Sharma',
        phoneNumber: '+919876543210',
        status: 'DELIVERED',
        waMessageId: 'wamid.HBgLMTY5ODQ1NzI5MThBFjNFN0E1QTMwMUE4QzQ5Q0M=',
        sentAt: new Date(Date.now() - 86390000).toISOString(),
        deliveredAt: new Date(Date.now() - 86370000).toISOString()
      }
    ];

    this.messages = [
      {
        id: 'msg_01',
        waMessageId: 'wamid.HBgLMTY5ODQ1NzI5MThBFjNFN0E1QTMwMUE4QzQ5QTk=',
        direction: 'OUTBOUND',
        type: 'TEMPLATE',
        from: '+15557892026',
        to: '+12025550143',
        contactId: 'c_01',
        contactName: 'Alexander Wright',
        campaignId: 'cmp_01',
        templateId: 'tmpl_promo_01',
        status: 'READ',
        content: 'Hi Alexander, we are excited to release the new ToolNest WhatsApp Engine! Upgrade your account this week to claim your exclusive 25% discount on all annual enterprise plans.',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'msg_02',
        waMessageId: 'wamid.HBgLMTE4OTQxMjA0MTkAFjNFN0E1QTMwMUE4QzQ5REQ=',
        direction: 'INBOUND',
        type: 'TEXT',
        from: '+12025550143',
        to: '+15557892026',
        contactId: 'c_01',
        contactName: 'Alexander Wright',
        status: 'DELIVERED',
        content: 'Thanks Alexander! Can we schedule a demo call with your solutions team on Friday?',
        timestamp: new Date(Date.now() - 82000000).toISOString()
      },
      {
        id: 'msg_03',
        waMessageId: 'wamid.HBgLMTY5ODQ1NzI5MThBFjNFN0E1QTMwMUE4QzQ5RUU=',
        direction: 'OUTBOUND',
        type: 'TEXT',
        from: '+15557892026',
        to: '+12025550143',
        contactId: 'c_01',
        contactName: 'Alexander Wright',
        status: 'READ',
        content: 'Absolutely! I have booked a slot for Friday at 11:00 AM EST. Looking forward to speaking with you.',
        timestamp: new Date(Date.now() - 81000000).toISOString()
      },
      {
        id: 'msg_04',
        waMessageId: 'wamid.HBgLMTY5ODQ1NzI5MThBFjNFN0E1QTMwMUE4QzQ5RkY=',
        direction: 'INBOUND',
        type: 'TEXT',
        from: '+13125558901',
        to: '+15557892026',
        contactId: 'c_05',
        contactName: 'Daniel O\'Connor',
        status: 'DELIVERED',
        content: 'STOP',
        timestamp: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ];

    this.messageEvents = [];
    this.webhookLogs = [];
  }

  // Account
  getAccount(): WhatsAppAccount {
    return this.account;
  }

  updateAccount(updates: Partial<WhatsAppAccount>): WhatsAppAccount {
    this.account = { ...this.account, ...updates };
    return this.account;
  }

  // Tags
  getTags(): ContactTag[] {
    return this.tags;
  }

  addTag(name: string, color = '#5722AF'): ContactTag {
    const existing = this.tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const newTag: ContactTag = {
      id: `tag_${Date.now()}`,
      name,
      color
    };
    this.tags.push(newTag);
    return newTag;
  }

  // Contacts
  getContacts(): Contact[] {
    return this.contacts;
  }

  getContactById(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  getContactByPhone(phone: string): Contact | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    return this.contacts.find(c => c.phoneNumber.replace(/[^0-9]/g, '') === clean);
  }

  upsertContact(contactData: Partial<Contact> & { phoneNumber: string }): Contact {
    const existing = this.getContactByPhone(contactData.phoneNumber);
    if (existing) {
      Object.assign(existing, contactData);
      return existing;
    }
    const newContact: Contact = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      phoneNumber: contactData.phoneNumber,
      countryCode: contactData.countryCode || '1',
      firstName: contactData.firstName || '',
      lastName: contactData.lastName || '',
      email: contactData.email,
      consentStatus: contactData.consentStatus || 'OPTED_IN',
      optInSource: contactData.optInSource || 'Dashboard Manual Entry',
      optInAt: contactData.optInAt || new Date().toISOString(),
      tags: contactData.tags || [],
      metadata: contactData.metadata || {},
      createdAt: new Date().toISOString()
    };
    this.contacts.unshift(newContact);
    return newContact;
  }

  deleteContact(id: string): boolean {
    const idx = this.contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.contacts.splice(idx, 1);
      return true;
    }
    return false;
  }

  recordOptOut(phoneNumber: string): boolean {
    const contact = this.getContactByPhone(phoneNumber);
    if (contact) {
      contact.consentStatus = 'OPTED_OUT';
      contact.optOutAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  recordOptIn(phoneNumber: string, source = 'User Inbound Message'): boolean {
    const contact = this.getContactByPhone(phoneNumber);
    if (contact) {
      contact.consentStatus = 'OPTED_IN';
      contact.optInSource = source;
      contact.optInAt = new Date().toISOString();
      delete contact.optOutAt;
      return true;
    }
    return false;
  }

  // Templates
  getTemplates(): MessageTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): MessageTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  createTemplate(template: Omit<MessageTemplate, 'id' | 'createdAt' | 'status'>): MessageTemplate {
    const newTemplate: MessageTemplate = {
      ...template,
      id: `tmpl_${Date.now()}`,
      status: 'APPROVED', // For production simulation/sandbox
      createdAt: new Date().toISOString()
    };
    this.templates.unshift(newTemplate);
    return newTemplate;
  }

  // Campaigns
  getCampaigns(): Campaign[] {
    return this.campaigns;
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.campaigns.find(c => c.id === id);
  }

  createCampaign(campaignData: Partial<Campaign>): Campaign {
    const newCampaign: Campaign = {
      id: `cmp_${Date.now()}`,
      name: campaignData.name || 'Untitled Campaign',
      description: campaignData.description,
      type: campaignData.type || 'BROADCAST',
      status: campaignData.scheduledAt ? 'SCHEDULED' : 'QUEUED',
      templateId: campaignData.templateId || '',
      templateName: campaignData.templateName || '',
      senderPhoneNumberId: campaignData.senderPhoneNumberId || 'phone_id_9928374',
      targetTags: campaignData.targetTags || [],
      totalRecipients: campaignData.totalRecipients || 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      scheduledAt: campaignData.scheduledAt,
      variableMapping: campaignData.variableMapping || {},
      createdAt: new Date().toISOString()
    };
    this.campaigns.unshift(newCampaign);
    return newCampaign;
  }

  updateCampaign(id: string, updates: Partial<Campaign>): Campaign | undefined {
    const cmp = this.getCampaignById(id);
    if (cmp) {
      Object.assign(cmp, updates);
      return cmp;
    }
    return undefined;
  }

  // Recipients
  getRecipients(campaignId?: string): CampaignRecipient[] {
    if (campaignId) {
      return this.recipients.filter(r => r.campaignId === campaignId);
    }
    return this.recipients;
  }

  addRecipient(recipient: CampaignRecipient): void {
    this.recipients.push(recipient);
  }

  updateRecipientStatus(waMessageId: string, status: any): void {
    const r = this.recipients.find(rec => rec.waMessageId === waMessageId);
    if (r) {
      r.status = status;
      const now = new Date().toISOString();
      if (status === 'SENT') r.sentAt = now;
      if (status === 'DELIVERED') r.deliveredAt = now;
      if (status === 'READ') r.readAt = now;
      if (status === 'FAILED') r.failedAt = now;

      // Update campaign counters
      const cmp = this.getCampaignById(r.campaignId);
      if (cmp) {
        if (status === 'SENT') cmp.sentCount++;
        if (status === 'DELIVERED') cmp.deliveredCount++;
        if (status === 'READ') cmp.readCount++;
        if (status === 'FAILED') cmp.failedCount++;
      }
    }
  }

  // Messages & Webhooks
  getMessages(contactId?: string): WhatsAppMessage[] {
    if (contactId) {
      return this.messages.filter(m => m.contactId === contactId);
    }
    return this.messages;
  }

  addMessage(message: WhatsAppMessage): void {
    this.messages.unshift(message);
  }

  logWebhook(event: WebhookLog): void {
    this.webhookLogs.unshift(event);
    if (this.webhookLogs.length > 500) {
      this.webhookLogs.pop();
    }
  }

  getWebhookLogs(): WebhookLog[] {
    return this.webhookLogs;
  }

  // Statistics
  getStats(): DashboardStats {
    const totalSent = this.messages.filter(m => m.direction === 'OUTBOUND').length;
    const totalDelivered = this.messages.filter(m => m.status === 'DELIVERED' || m.status === 'READ').length;
    const totalRead = this.messages.filter(m => m.status === 'READ').length;
    const optedInCount = this.contacts.filter(c => c.consentStatus === 'OPTED_IN').length;
    const activeCmp = this.campaigns.filter(c => c.status === 'RUNNING' || c.status === 'QUEUED').length;

    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 100;
    const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 85;

    return {
      totalSent,
      deliveryRate,
      readRate,
      activeCampaigns: activeCmp,
      optedInContacts: optedInCount,
      qualityRating: this.account.qualityRating,
      messagingLimit: this.account.messagingLimit,
      recentMessages: this.messages.slice(0, 8)
    };
  }
}

// Global Singleton for development and runtime persistence
const globalForDb = globalThis as unknown as {
  whatsAppDb?: WhatsAppDatabase;
};

export const db = globalForDb.whatsAppDb || new WhatsAppDatabase();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.whatsAppDb = db;
}
