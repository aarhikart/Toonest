import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { User, IUser } from '@/lib/mongodb/models';

export const ADMIN_USERNAME = 'hitesh1720';
export const ADMIN_PASSWORD = 'hak@1720';

const ALGORITHM = 'aes-256-cbc';
const SECRET = process.env.JWT_SECRET || 'supersecure_jwt_token_decryption_secret_key_1720!';
const KEY = crypto.scryptSync(SECRET, 'toolnest_salt_1720', 32);

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SECRET).update(password).digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function encryptToken(payload: any): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptToken(token: string): any | null {
  try {
    const [ivHex, encrypted] = token.split(':');
    if (!ivHex || !encrypted) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (_) {
    return null;
  }
}

export async function ensureAdminAccount(): Promise<IUser> {
  await connectToDatabase();
  let admin = await User.findOne({ username: ADMIN_USERNAME.toLowerCase() });
  if (!admin) {
    admin = await User.create({
      username: ADMIN_USERNAME.toLowerCase(),
      password: hashPassword(ADMIN_PASSWORD),
      businessName: 'ToolNest Master Admin',
      phoneNumber: '+916263481054',
      role: 'admin',
      status: 'active'
    });
    console.log('[MongoDB] Master admin account created:', ADMIN_USERNAME);
  } else {
    let needsUpdate = false;
    if (admin.status !== 'active') {
      admin.status = 'active';
      needsUpdate = true;
    }
    if (!admin.businessName) {
      admin.businessName = 'ToolNest Master Admin';
      needsUpdate = true;
    }
    if (!admin.phoneNumber) {
      admin.phoneNumber = '+916263481054';
      needsUpdate = true;
    }
    if (needsUpdate) {
      try {
        await admin.save();
      } catch {}
    }
  }
  return admin;
}

export interface SessionUser {
  id: string;
  username: string;
  businessName: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  subscriptionType: 'trial' | 'paid' | 'none';
  planType: '1_month' | '3_months' | '6_months' | null;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  planStartDate?: string | null;
  planEndDate?: string | null;
  daysRemaining: number | null;
  isExpired: boolean;
}

export async function getSessionUser(req?: NextRequest): Promise<SessionUser | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get('toolnest_auth_token')?.value;
      if (!token) {
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.slice(7).trim();
        }
      }
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get('toolnest_auth_token')?.value;
    }

    if (!token) return null;

    const payload = decryptToken(token);
    if (!payload || !payload.id) return null;

    await connectToDatabase();
    const user = await User.findById(payload.id);
    if (!user) return null;

    const isActive = user.status === 'active' || user.role === 'admin' || !user.status;
    if (!isActive) return null;

    const now = Date.now();
    let daysRemaining: number | null = null;
    let isExpired = false;

    if (user.role === 'admin') {
      daysRemaining = 999;
      isExpired = false;
    } else if (user.subscriptionType === 'paid' && user.planEndDate) {
      const endMs = new Date(user.planEndDate).getTime();
      const diffMs = endMs - now;
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      isExpired = diffMs <= 0;
    } else if (user.subscriptionType === 'trial' && user.trialEndDate) {
      const endMs = new Date(user.trialEndDate).getTime();
      const diffMs = endMs - now;
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      isExpired = diffMs <= 0;
    }

    return {
      id: user._id.toString(),
      username: user.username,
      businessName: user.businessName || 'ToolNest Business',
      phoneNumber: user.phoneNumber || '',
      role: (user.role as any) === 'admin' ? 'admin' : 'user',
      status: (user.status as any) || 'active',
      subscriptionType: (user.subscriptionType as any) || 'none',
      planType: user.planType || null,
      trialStartDate: user.trialStartDate ? user.trialStartDate.toISOString() : null,
      trialEndDate: user.trialEndDate ? user.trialEndDate.toISOString() : null,
      planStartDate: user.planStartDate ? user.planStartDate.toISOString() : null,
      planEndDate: user.planEndDate ? user.planEndDate.toISOString() : null,
      daysRemaining,
      isExpired
    };
  } catch (_) {
    return null;
  }
}
