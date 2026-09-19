import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { Campaign } from '@/lib/mongodb/models';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// GET: View all campaigns across all users
export async function GET(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUsername = searchParams.get('username');

    await connectToDatabase();

    const query: any = {};
    if (targetUsername) {
      query.username = targetUsername.toLowerCase().trim();
    }

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).lean();

    const totalSuccessful = campaigns.reduce((sum, c: any) => sum + (c.successfulMessages || 0), 0);
    const totalFailed = campaigns.reduce((sum, c: any) => sum + (c.failedMessages || 0), 0);
    const totalContacts = campaigns.reduce((sum, c: any) => sum + (c.totalContacts || 0), 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalCampaigns: campaigns.length,
        totalContacts,
        totalSuccessful,
        totalFailed,
        deliveryRate: totalContacts > 0 ? ((totalSuccessful / totalContacts) * 100).toFixed(1) : '100'
      },
      campaigns: campaigns.map((c: any) => ({
        id: c._id.toString(),
        username: c.username,
        businessName: c.businessName,
        campaignName: c.campaignName,
        template: c.template,
        totalContacts: c.totalContacts,
        successfulMessages: c.successfulMessages,
        failedMessages: c.failedMessages,
        status: c.status,
        createdAt: c.createdAt,
        logsCount: Array.isArray(c.logs) ? c.logs.length : 0,
        logs: c.logs || []
      }))
    });
  } catch (err: any) {
    console.error('[Admin Campaigns GET Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a campaign record
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json({ success: false, error: 'Campaign ID is required.' }, { status: 400 });
    }

    await connectToDatabase();
    await Campaign.findByIdAndDelete(campaignId);

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
