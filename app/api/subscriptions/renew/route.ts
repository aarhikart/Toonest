import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { RenewalRequest, User } from '@/lib/mongodb/models';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Please log in to submit a renewal request.' }, { status: 401 });
    }

    const body = await req.json();
    const { planType, transactionId, username } = body;

    if (!planType || !transactionId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please select a plan and enter your UPI Transaction ID / UTR.' },
        { status: 400 }
      );
    }

    const priceMap: Record<string, number> = {
      '1_month': 317,
      '3_months': 817,
      '6_months': 1217
    };

    const amount = priceMap[planType];
    if (!amount) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan selected. Choose 1 Month, 3 Months, or 6 Months.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const targetUsername = (username || sessionUser.username).trim().toLowerCase();
    const user = await User.findOne({ username: targetUsername });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User account not found.' }, { status: 404 });
    }

    // Check if duplicate transaction ID pending
    const existing = await RenewalRequest.findOne({
      transactionId: transactionId.trim(),
      status: 'pending'
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This Transaction ID is already submitted and pending review.' },
        { status: 409 }
      );
    }

    await RenewalRequest.create({
      userId: user._id,
      username: user.username,
      businessName: user.businessName,
      phoneNumber: user.phoneNumber,
      planType,
      amount,
      transactionId: transactionId.trim(),
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      message: 'Your renewal request has been submitted! Once verified by the Admin, your plan will be activated immediately.'
    });
  } catch (err: any) {
    console.error('[User Renewal Request Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
