import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { RenewalRequest, User } from '@/lib/mongodb/models';
import { getSessionUser } from '@/lib/auth/session';
import { sendSystemWhatsAppNotification } from '@/lib/whatsapp-web/send-system-message';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();

    const renewals = await RenewalRequest.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      renewals: renewals.map((r: any) => ({
        id: r._id.toString(),
        userId: r.userId ? r.userId.toString() : null,
        username: r.username,
        businessName: r.businessName,
        phoneNumber: r.phoneNumber,
        planType: r.planType,
        amount: r.amount,
        transactionId: r.transactionId,
        status: r.status,
        createdAt: r.createdAt,
        approvedAt: r.approvedAt
      }))
    });
  } catch (err: any) {
    console.error('[Admin Renewals GET Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json({ success: false, error: 'Request ID and action are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const renewal = await RenewalRequest.findById(requestId);
    if (!renewal) {
      return NextResponse.json({ success: false, error: 'Renewal request not found.' }, { status: 404 });
    }

    if (action === 'reject') {
      renewal.status = 'rejected';
      await renewal.save();
      return NextResponse.json({ success: true, message: 'Renewal request rejected.' });
    }

    if (action === 'approve') {
      const planDaysMap: Record<string, { days: number; label: string }> = {
        '1_month': { days: 30, label: '1 Month' },
        '3_months': { days: 90, label: '3 Months' },
        '6_months': { days: 180, label: '6 Months' }
      };

      const selectedPlan = planDaysMap[renewal.planType] || { days: 30, label: '1 Month' };

      const user = await User.findOne({ username: renewal.username.toLowerCase() });
      if (!user) {
        return NextResponse.json({ success: false, error: `User "@${renewal.username}" not found.` }, { status: 404 });
      }

      const now = new Date();
      const baseDate = user.planEndDate && user.planEndDate > now ? user.planEndDate : now;
      const newEndDate = new Date(baseDate.getTime() + selectedPlan.days * 24 * 60 * 60 * 1000);

      user.subscriptionType = 'paid';
      user.planType = renewal.planType;
      user.planStartDate = user.planStartDate || now;
      user.planEndDate = newEndDate;
      user.paidReminderSent = false;
      user.status = 'active';
      await user.save();

      renewal.status = 'approved';
      renewal.approvedAt = new Date();
      await renewal.save();

      // Automatically send confirmation WhatsApp message
      const formattedDate = newEndDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const whatsappMsg = `Hello *${user.businessName}*! 🎉\n\nYour payment has been verified and your *${selectedPlan.label} Plan* on ToolNest WhatsApp Marketing is now active!\n\n📅 *Valid Until:* ${formattedDate}\n🌐 *Access Portal:* https://toonest.vercel.app/whatsapp-marketing\n\nThank you for renewing your subscription!`;

      sendSystemWhatsAppNotification(user.phoneNumber, whatsappMsg, admin.username).then(res => {
        if (!res.success) {
          console.warn('[Admin Renewal Approval] WhatsApp notice could not be sent immediately:', res.error);
        }
      });

      return NextResponse.json({
        success: true,
        message: `Plan renewal approved for "@${user.username}". Valid until ${formattedDate}.`
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Renewal Action Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
