import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { User, Campaign } from '@/lib/mongodb/models';
import { getSessionUser, hashPassword } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// GET: List all users with their campaign metrics
export async function GET(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();

    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).lean();

    // Aggregate campaign metrics for each user
    const usersWithMetrics = await Promise.all(
      users.map(async (u: any) => {
        const campaigns = await Campaign.find({ username: u.username }).lean();
        const totalCampaigns = campaigns.length;
        const totalSuccessful = campaigns.reduce((acc, c: any) => acc + (c.successfulMessages || 0), 0);
        const totalFailed = campaigns.reduce((acc, c: any) => acc + (c.failedMessages || 0), 0);

        return {
          id: u._id.toString(),
          businessName: u.businessName,
          username: u.username,
          phoneNumber: u.phoneNumber,
          status: u.status,
          createdAt: u.createdAt,
          campaignsCount: totalCampaigns,
          successfulMessages: totalSuccessful,
          failedMessages: totalFailed
        };
      })
    );

    return NextResponse.json({ success: true, users: usersWithMetrics });
  } catch (err: any) {
    console.error('[Admin Users GET Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Create a new user account
export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { businessName, username, password, phoneNumber } = body;

    if (!businessName?.trim() || !username?.trim() || !password?.trim() || !phoneNumber?.trim()) {
      return NextResponse.json(
        { success: false, error: 'All fields (Business Name, Username, Password, Phone Number) are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    await connectToDatabase();

    // Check if username already taken
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Username "${cleanUsername}" is already in use. Please choose another.` },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      businessName: businessName.trim(),
      username: cleanUsername,
      password: hashPassword(password.trim()),
      phoneNumber: phoneNumber.trim(),
      role: 'user',
      status: 'active'
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully.',
      user: {
        id: newUser._id.toString(),
        businessName: newUser.businessName,
        username: newUser.username,
        phoneNumber: newUser.phoneNumber,
        status: newUser.status,
        createdAt: newUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('[Admin Users POST Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a user account
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Optionally cleanup user campaigns
    await Campaign.deleteMany({ username: deleted.username });

    return NextResponse.json({ success: true, message: `User "${deleted.username}" deleted successfully.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update user status or password
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, password, businessName, phoneNumber } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const updateData: any = {};
    if (status && (status === 'active' || status === 'inactive')) updateData.status = status;
    if (password && password.trim()) updateData.password = hashPassword(password.trim());
    if (businessName && businessName.trim()) updateData.businessName = businessName.trim();
    if (phoneNumber && phoneNumber.trim()) updateData.phoneNumber = phoneNumber.trim();

    const updated = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully.', user: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
