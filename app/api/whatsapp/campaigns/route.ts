import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/whatsapp/db';
import { queue } from '@/workers/queue';
import { ContactService } from '@/lib/whatsapp/contacts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const campaign = db.getCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    const recipients = db.getRecipients(id);
    return NextResponse.json({ campaign, recipients });
  }

  const campaigns = db.getCampaigns();
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.templateId) {
      return NextResponse.json({ success: false, error: 'Campaign name and template are required.' }, { status: 400 });
    }

    const template = db.getTemplateById(body.templateId);
    if (!template) {
      return NextResponse.json({ success: false, error: 'Selected template not found.' }, { status: 400 });
    }

    // Determine target recipient count (strictly opted-in)
    const allContacts = db.getContacts();
    const eligible = ContactService.filterEligibleRecipients(allContacts, body.targetTags || []);

    const campaign = db.createCampaign({
      name: body.name,
      description: body.description,
      type: body.scheduledAt ? 'SCHEDULED' : 'BROADCAST',
      templateId: template.id,
      templateName: template.name,
      senderPhoneNumberId: body.senderPhoneNumberId || 'phone_id_9928374',
      targetTags: body.targetTags || [],
      totalRecipients: eligible.length,
      scheduledAt: body.scheduledAt || undefined,
      variableMapping: body.variableMapping || {}
    });

    // If immediate broadcast, queue now
    if (!body.scheduledAt) {
      await queue.add('DISPATCH_CAMPAIGN', { campaignId: campaign.id });
    }

    return NextResponse.json({
      success: true,
      campaign,
      eligibleRecipientCount: eligible.length
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
