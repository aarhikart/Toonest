import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { Invoice, User } from '@/lib/mongodb/models';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// GET: Retrieve past invoices for the current user/customer
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const queryUsername = searchParams.get('username')?.toLowerCase().trim();

    const username = sessionUser?.username?.toLowerCase().trim() || queryUsername;

    if (!username) {
      return NextResponse.json({ success: true, invoices: [] });
    }

    await connectToDatabase();

    const invoices = await Invoice.find({ username })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      invoices
    });
  } catch (err: any) {
    console.error('[API /api/whatsapp/invoices GET] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST: Store invoice/customer details in the database associated with that user
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    const body = await req.json().catch(() => ({}));

    const {
      customerName,
      customerPhone,
      invoiceNumber,
      amount,
      message,
      status = 'SENT',
      error = ''
    } = body;

    if (!customerName || !customerPhone || !message) {
      return NextResponse.json(
        { success: false, error: 'Customer Name, Phone Number, and Message are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Resolve user details
    let userId = sessionUser?.id;
    let username = sessionUser?.username?.toLowerCase().trim();
    let businessName = sessionUser?.businessName;

    if (!username && body.username) {
      username = body.username.toLowerCase().trim();
      const dbUser = await User.findOne({ username });
      if (dbUser) {
        userId = dbUser._id.toString();
        businessName = dbUser.businessName || businessName;
      }
    }

    if (!username) {
      username = 'anonymous_user';
      businessName = 'ToolNest User';
    }

    const newInvoice = await Invoice.create({
      userId: userId || undefined,
      username,
      businessName: businessName || 'HP Store',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      invoiceNumber: invoiceNumber ? String(invoiceNumber).trim() : '',
      amount: amount ? Number(amount) : 0,
      message: message.trim(),
      status: status === 'FAILED' ? 'FAILED' : 'SENT',
      sentAt: status === 'SENT' ? new Date() : undefined,
      error: error || '',
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      invoice: newInvoice
    });
  } catch (err: any) {
    console.error('[API /api/whatsapp/invoices POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to store invoice record' },
      { status: 500 }
    );
  }
}
