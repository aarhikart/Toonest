import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models';
import { sendSystemWhatsAppNotification } from '@/lib/whatsapp-web/send-system-message';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const now = Date.now();
    let trialRemindersSent = 0;
    let paidRemindersSent = 0;

    // 1. Check Day-9 Trial Reminders (between 1 and 2 days remaining)
    const trialUsers = await User.find({
      subscriptionType: 'trial',
      trialEndDate: { $exists: true, $ne: null },
      trialReminderSent: { $ne: true }
    });

    for (const u of trialUsers) {
      if (!u.trialEndDate || !u.phoneNumber) continue;
      const diffMs = new Date(u.trialEndDate).getTime() - now;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Day 9 of 10-day trial: 1 or 2 days left
      if (daysLeft <= 2 && daysLeft >= 1) {
        const msg = `Hi *${u.businessName}*! 👋\n\nYour 10-day free trial on ToolNest WhatsApp Marketing is on Day 9.\n\nTo keep sending messages to your customers without interruption, choose a plan today:\n👉 https://toonest.vercel.app/whatsapp-marketing\n\nPlans available: 1 Month, 3 Months, and 6 Months.`;
        
        const res = await sendSystemWhatsAppNotification(u.phoneNumber, msg);
        if (res.success) {
          u.trialReminderSent = true;
          await u.save();
          trialRemindersSent++;
        }
      }
    }

    // 2. Check 3-Days Remaining Paid Plan Reminders
    const paidUsers = await User.find({
      subscriptionType: 'paid',
      planEndDate: { $exists: true, $ne: null },
      paidReminderSent: { $ne: true }
    });

    for (const u of paidUsers) {
      if (!u.planEndDate || !u.phoneNumber) continue;
      const diffMs = new Date(u.planEndDate).getTime() - now;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysLeft <= 3 && daysLeft > 0) {
        const msg = `Hi *${u.businessName}*! 🔔\n\nA quick reminder from ToolNest: Your WhatsApp Marketing plan will expire in *${daysLeft} days*.\n\nTo continue enjoying uninterrupted bulk messaging, submit your renewal request here:\n👉 https://toonest.vercel.app/whatsapp-marketing\n\nNeed help? Feel free to reply directly to this message.`;

        const res = await sendSystemWhatsAppNotification(u.phoneNumber, msg);
        if (res.success) {
          u.paidReminderSent = true;
          await u.save();
          paidRemindersSent++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      trialRemindersSent,
      paidRemindersSent
    });
  } catch (err: any) {
    console.error('[Check Reminders Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
