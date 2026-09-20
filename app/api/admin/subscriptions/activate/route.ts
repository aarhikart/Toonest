import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models';
import { getSessionUser } from '@/lib/auth/session';
import { sendSystemWhatsAppNotification } from '@/lib/whatsapp-web/send-system-message';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, planType } = body;

    if (!userId || !planType) {
      return NextResponse.json(
        { success: false, error: 'User ID and plan type (1_month, 3_months, 6_months) are required.' },
        { status: 400 }
      );
    }

    const planDaysMap: Record<string, { days: number; label: string }> = {
      '1_month': { days: 30, label: '1 Month' },
      '3_months': { days: 90, label: '3 Months' },
      '6_months': { days: 180, label: '6 Months' }
    };

    const selectedPlan = planDaysMap[planType];
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan type. Must be 1_month, 3_months, or 6_months.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const startDate = new Date();
    // If existing active paid plan has time left, extend from that end date; otherwise from now
    const baseDate = user.planEndDate && user.planEndDate > startDate ? user.planEndDate : startDate;
    const endDate = new Date(baseDate.getTime() + selectedPlan.days * 24 * 60 * 60 * 1000);

    user.subscriptionType = 'paid';
    user.planType = planType;
    user.planStartDate = startDate;
    user.planEndDate = endDate;
    user.paidReminderSent = false;
    user.status = 'active';
    await user.save();

    // Automatically send confirmation WhatsApp message
    const formattedDate = endDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const whatsappMsg = `Hello *${user.businessName}*! 🎉\n\nYour *${selectedPlan.label} Plan* on ToolNest WhatsApp Marketing has been successfully activated!\n\n📅 *Valid Until:* ${formattedDate}\n🌐 *Access Portal:* https://toonest.vercel.app/whatsapp-marketing\n\nEnjoy unlimited campaigns, high delivery rates, and full media support. Thank you for subscribing!`;

    sendSystemWhatsAppNotification(user.phoneNumber, whatsappMsg, admin.username).then(res => {
      if (!res.success) {
        console.warn('[Admin Plan Activation] WhatsApp notice could not be sent immediately:', res.error);
      }
    });

    return NextResponse.json({
      success: true,
      message: `${selectedPlan.label} plan activated for "${user.businessName}" until ${formattedDate}.`,
      user: {
        id: user._id.toString(),
        username: user.username,
        businessName: user.businessName,
        subscriptionType: user.subscriptionType,
        planType: user.planType,
        planEndDate: user.planEndDate
      }
    });
  } catch (err: any) {
    console.error('[Admin Plan Activation Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
