import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { Campaign, User } from '@/lib/mongodb/models';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// POST: Record a completed or ongoing campaign run
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const body = await req.json();

    const {
      campaignName = 'WhatsApp Marketing Campaign',
      template = '',
      totalContacts = 0,
      successfulMessages = 0,
      failedMessages = 0,
      status = 'completed',
      logs = []
    } = body;

    await connectToDatabase();

    // Determine user info from session, or fallback if provided in body
    let userId = sessionUser?.id;
    let username = sessionUser?.username;
    let businessName = sessionUser?.businessName;

    if (!username && body.username) {
      const dbUser = await User.findOne({ username: body.username.toLowerCase().trim() });
      if (dbUser) {
        userId = dbUser._id.toString();
        username = dbUser.username;
        businessName = dbUser.businessName;
      }
    }

    if (!username) {
      username = 'anonymous_user';
      businessName = 'ToolNest User';
    }

    const campaign = await Campaign.create({
      userId: userId || undefined,
      username,
      businessName: businessName || username,
      campaignName,
      template,
      totalContacts: Number(totalContacts) || 0,
      successfulMessages: Number(successfulMessages) || 0,
      failedMessages: Number(failedMessages) || 0,
      status,
      createdAt: new Date(),
      logs: Array.isArray(logs) ? logs.slice(-500) : [] // keep last 500 logs max for storage efficiency
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign recorded successfully in MongoDB.',
      campaign: {
        id: campaign._id.toString(),
        username: campaign.username,
        businessName: campaign.businessName,
        totalContacts: campaign.totalContacts,
        successfulMessages: campaign.successfulMessages,
        failedMessages: campaign.failedMessages,
        status: campaign.status,
        createdAt: campaign.createdAt
      }
    });
  } catch (err: any) {
    console.error('[Campaign Record Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record campaign.' },
      { status: 500 }
    );
  }
}

// GET: Retrieve past campaigns for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const query: any = {};
    if (sessionUser.role !== 'admin') {
      query.username = sessionUser.username;
    }

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map((c: any) => ({
        id: c._id.toString(),
        campaignName: c.campaignName,
        totalContacts: c.totalContacts,
        successfulMessages: c.successfulMessages,
        failedMessages: c.failedMessages,
        status: c.status,
        createdAt: c.createdAt
      }))
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
