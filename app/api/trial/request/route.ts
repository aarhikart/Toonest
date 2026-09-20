import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { TrialRequest, User } from '@/lib/mongodb/models';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, phoneNumber } = body;

    if (!businessName?.trim() || !phoneNumber?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter both your Business Name and WhatsApp Phone Number.' },
        { status: 400 }
      );
    }

    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit WhatsApp phone number.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const phone10 = cleanPhone.slice(-10);
    const phoneRegex = new RegExp(phone10);

    // 1. Check if user already exists with an active trial or account on this phone number
    const existingUser = await User.findOne({
      phoneNumber: { $regex: phoneRegex }
    });

    if (existingUser) {
      const now = new Date();
      const isTrialExpired = existingUser.trialEndDate ? new Date(existingUser.trialEndDate) < now : false;

      if (existingUser.subscriptionType === 'trial' && isTrialExpired) {
        return NextResponse.json(
          {
            success: false,
            error: 'Already you have taken the free trial on this number. Please check your WhatsApp or choose a paid plan to continue.'
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Already your plan is active. Please check your WhatsApp for your login details.'
        },
        { status: 400 }
      );
    }

    // 2. Check if there is already an approved trial request for this phone number
    const approvedTrial = await TrialRequest.findOne({
      phoneNumber: { $regex: phoneRegex },
      status: 'approved'
    });

    if (approvedTrial) {
      return NextResponse.json(
        {
          success: false,
          error: 'Already your plan is active. Please check your WhatsApp for your login details.'
        },
        { status: 400 }
      );
    }

    // 3. Check if there is already a pending trial request for this phone number
    const pendingTrial = await TrialRequest.findOne({
      phoneNumber: { $regex: phoneRegex },
      status: 'pending'
    });

    if (pendingTrial) {
      return NextResponse.json(
        {
          success: false,
          error: 'Already your trial request has been submitted and is under review. Please check your WhatsApp shortly.'
        },
        { status: 400 }
      );
    }

    await TrialRequest.create({
      businessName: businessName.trim(),
      phoneNumber: phoneNumber.trim(),
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      message: 'Your 10-day free trial request has been submitted! Our team will approve it shortly and send you your login details directly on WhatsApp.'
    });
  } catch (err: any) {
    console.error('[Trial Request POST Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit trial request.' },
      { status: 500 }
    );
  }
}
