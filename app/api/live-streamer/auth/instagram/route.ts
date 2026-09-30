import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const code = searchParams.get('code');
  const origin = req.nextUrl.origin || 'http://localhost:3000';

  const appId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;

  // Instagram Professional/Creator live streaming is managed directly through Meta Graph API
  // Route users to the unified Meta OAuth authorization which authorizes both Instagram and Facebook
  if (action === 'login') {
    if (!appId) {
      return NextResponse.redirect(`${origin}/live-streamer?oauth_error=instagram_not_configured`);
    }

    const redirectUri = `${origin}/api/live-streamer/auth/facebook`;
    const scope = [
      'public_profile',
      'pages_show_list',
      'pages_manage_posts',
      'pages_read_engagement',
    ].join(',');

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&response_type=code`;

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.redirect(`${origin}/live-streamer`);
}
