import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { TrialRequest } from '@/lib/mongodb/models';

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

    // Check if there's already a pending request for this phone
    const existing = await TrialRequest.findOne({
      phoneNumber: { $regex: new RegExp(cleanPhone.slice(-10) + '$') },
      status: 'pending'
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Your 10-day free trial request is already under review. Our team will approve it shortly!'
      });
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
