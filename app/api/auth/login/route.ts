import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models';
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  hashPassword,
  verifyPassword,
  encryptToken,
  ensureAdminAccount
} from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    await connectToDatabase();

    // 1. Check Master Admin Credentials
    if (cleanUsername === ADMIN_USERNAME.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
      const admin = await ensureAdminAccount();
      const token = encryptToken({
        id: admin._id.toString(),
        username: admin.username,
        role: 'admin'
      });

      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful.',
        user: {
          id: admin._id.toString(),
          username: admin.username,
          businessName: admin.businessName || 'ToolNest Master Admin',
          phoneNumber: admin.phoneNumber || '+916263481054',
          role: 'admin',
          status: 'active'
        }
      });

      response.cookies.set('toolnest_auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });

      // Also set client readable role for UI convenience
      response.cookies.set('toolnest_user_role', 'admin', {
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60
      });

      return response;
    }

    // 2. Check Client User Credentials from MongoDB
    const user = await User.findOne({ username: cleanUsername });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Verify hashed password or plain password (for flexibility)
    const isMatch = verifyPassword(cleanPassword, user.password) || user.password === cleanPassword;

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const token = encryptToken({
      id: user._id.toString(),
      username: user.username,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user._id.toString(),
        username: user.username,
        businessName: user.businessName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status
      }
    });

    response.cookies.set('toolnest_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    response.cookies.set('toolnest_user_role', user.role, {
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);

    let message = err.message || 'Internal server error during authentication.';
    if (!process.env.MONGODB_URI) {
      message = 'Database configuration missing: MONGODB_URI is not set in environment variables.';
    } else if (
      err.name === 'MongooseServerSelectionError' ||
      err.name === 'MongoServerSelectionError' ||
      err.message?.includes('buffering timed out') ||
      err.message?.includes('ETIMEDOUT') ||
      err.message?.includes('ECONNREFUSED')
    ) {
      message = 'Could not connect to MongoDB database. Please ensure MongoDB Atlas Network Access allows connections (0.0.0.0/0).';
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
