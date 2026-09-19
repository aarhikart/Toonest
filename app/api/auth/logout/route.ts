import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.set('toolnest_auth_token', '', { path: '/', maxAge: 0 });
  response.cookies.set('toolnest_user_role', '', { path: '/', maxAge: 0 });
  return response;
}
