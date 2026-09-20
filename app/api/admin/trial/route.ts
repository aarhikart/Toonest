import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { TrialRequest, User } from '@/lib/mongodb/models';
import { getSessionUser, hashPassword } from '@/lib/auth/session';
import { sendSystemWhatsAppNotification } from '@/lib/whatsapp-web/send-system-message';

export const dynamic = 'force-dynamic';

// GET: Admin fetches all trial requests
export async function GET(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();

    const requests = await TrialRequest.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      requests: requests.map((r: any) => ({
        id: r._id.toString(),
        businessName: r.businessName,
        phoneNumber: r.phoneNumber,
        status: r.status,
        assignedUsername: r.assignedUsername,
        createdAt: r.createdAt,
        approvedAt: r.approvedAt
      }))
    });
  } catch (err: any) {
    console.error('[Admin Trial GET Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Admin approves or rejects trial request
export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action, customUsername, customPassword } = body;

    if (!requestId || !action) {
      return NextResponse.json({ success: false, error: 'Request ID and action are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const trialReq = await TrialRequest.findById(requestId);
    if (!trialReq) {
      return NextResponse.json({ success: false, error: 'Trial request not found.' }, { status: 404 });
    }

    if (action === 'reject') {
      trialReq.status = 'rejected';
      await trialReq.save();
      return NextResponse.json({ success: true, message: 'Trial request rejected.' });
    }

    if (action === 'approve') {
      // Generate clean username and password based on their business name
      const cleanBiz = (trialReq.businessName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '');
      const bizPrefix = cleanBiz.slice(0, 10) || 'user';
      const cleanPhoneDigits = trialReq.phoneNumber.replace(/\D/g, '').slice(-4);
      const baseUser = (customUsername || `${bizPrefix}${cleanPhoneDigits}`).toLowerCase();
      
      let finalUsername = baseUser;
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${baseUser}${counter}`;
        counter++;
      }

      // Password generated based on business name (e.g. "Sharma@4829")
      const rawBizName = trialReq.businessName ? trialReq.businessName.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) : 'ToolNest';
      const capBiz = rawBizName ? (rawBizName.charAt(0).toUpperCase() + rawBizName.slice(1)) : 'ToolNest';
      const rawPassword = customPassword || `${capBiz}@${Math.floor(1000 + Math.random() * 9000)}`;

      // 10-day trial calculation
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days

      // Create or update user account
      let user = await User.findOne({ phoneNumber: trialReq.phoneNumber });
      if (user) {
        user.subscriptionType = 'trial';
        user.trialStartDate = startDate;
        user.trialEndDate = endDate;
        user.trialReminderSent = false;
        user.status = 'active';
        user.password = hashPassword(rawPassword);
        await user.save();
      } else {
        user = await User.create({
          businessName: trialReq.businessName,
          phoneNumber: trialReq.phoneNumber,
          username: finalUsername,
          password: hashPassword(rawPassword),
          role: 'user',
          status: 'active',
          subscriptionType: 'trial',
          trialStartDate: startDate,
          trialEndDate: endDate,
          trialReminderSent: false
        });
      }

      // Update TrialRequest record
      trialReq.status = 'approved';
      trialReq.assignedUsername = finalUsername;
      trialReq.assignedPassword = rawPassword;
      trialReq.approvedAt = new Date();
      await trialReq.save();

      // Automatically send WhatsApp message to the user

      const whatsappMsg = `Hello *${trialReq.businessName}*! 🎉\n\nYour 10-Day Free Trial for ToolNest WhatsApp Marketing has been approved!\n\n🌐 *Access Portal & Start Trial:*\n(or visit https://toonest.vercel.app/)\n\n🔑 *Your Login Credentials:*\n• Username: *${finalUsername}*\n• Password: *${rawPassword}*\n\nYour 10-day trial countdown is now active. Enjoy fast and safe bulk messaging!`; 
      // Dispatch WhatsApp message from admin's connected session
      let waSent = false;
      try {
        const waResult = await sendSystemWhatsAppNotification(trialReq.phoneNumber, whatsappMsg, admin.username);
        waSent = Boolean(waResult && waResult.success);
        if (!waSent) {
          console.warn('[Admin Trial Approval] Note: WhatsApp message could not be sent immediately:', waResult?.error);
        }
      } catch (waErr) {
        console.warn('[Admin Trial Approval] Error dispatching WhatsApp notification:', waErr);
      }

      return NextResponse.json({
        success: true,
        message: `Trial approved for "${trialReq.businessName}". User account created: @${finalUsername}`,
        credentials: {
          username: finalUsername,
          password: rawPassword
        },
        whatsappSent: waSent
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Trial Action Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
