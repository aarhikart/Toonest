import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { ConnectedSocialAccountModel } from '@/lib/live-streamer/models';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const appId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET;

  const origin = req.nextUrl.origin || 'http://localhost:3000';
  const redirectUri = `${origin}/api/live-streamer/auth/facebook`;

  // 1. OAuth Initiate Flow
  if (action === 'login') {
    if (!appId) {
      return NextResponse.redirect(`${origin}/live-streamer?oauth_error=facebook_not_configured`);
    }

    // Support scope selection or standard permissions
    const requestedScope = searchParams.get('scope');
    let scope = requestedScope;

    if (!scope) {
      // Valid permissions for Facebook Page Live broadcasting
      scope = [
        'public_profile',
        'pages_show_list',
        'pages_manage_posts',
        'pages_read_engagement',
      ].join(',');
    }

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}&response_type=code`;

    return NextResponse.redirect(authUrl);
  }

  // 2. Error handling from Meta callback
  if (error) {
    console.error('[Meta OAuth Error]:', error, errorDescription);
    return NextResponse.redirect(
      `${origin}/live-streamer?oauth_error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // 3. OAuth Code Callback Flow
  if (code) {
    try {
      if (!appId || !appSecret) {
        throw new Error('Meta App ID and Secret must be configured in .env.local');
      }

      // Step 3a: Exchange short code for user access token
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${appSecret}&code=${code}`;

      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        throw new Error(tokenData.error.message || 'Failed to exchange authorization code with Meta');
      }

      let userAccessToken = tokenData.access_token;

      // Step 3b: Exchange for Long-Lived Token (60 days validity)
      try {
        const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${userAccessToken}`;
        const longRes = await fetch(longLivedUrl);
        const longData = await longRes.json();
        if (longData.access_token) {
          userAccessToken = longData.access_token;
        }
      } catch (err) {
        console.warn('[Meta OAuth] Long-lived token notice:', err);
      }

      // Step 3c: Fetch User Info and Pages with linked Instagram Business Account
      const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture&access_token=${userAccessToken}`);
      const meData = await meRes.json();

      const accountsRes = await fetch(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,picture,instagram_business_account{id,username,name,profile_picture_url}&access_token=${userAccessToken}`
      );
      const accountsData = await accountsRes.json();
      const pages = accountsData.data || [];

      await connectToDatabase();

      let connectedPlatforms: string[] = [];

      // Save Primary Facebook Page
      const primaryPage = pages[0];
      if (primaryPage) {
        const pageToken = primaryPage.access_token;
        let rtmpUrl = 'rtmps://live-api-s.facebook.com:443/rtmp/';
        let streamKey = '';

        // Test creation of live video object or default RTMP
        try {
          const liveRes = await fetch(`https://graph.facebook.com/v19.0/${primaryPage.id}/live_videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'UNPUBLISHED',
              title: 'ToolNest Live Broadcast',
              access_token: pageToken,
            }),
          });
          const liveData = await liveRes.json();
          if (liveData.secure_stream_url) {
            const parts = liveData.secure_stream_url.split('/');
            streamKey = parts.pop() || '';
            rtmpUrl = parts.join('/') + '/';
          }
        } catch (_) {}

        await ConnectedSocialAccountModel.findOneAndUpdate(
          { platform: 'facebook' },
          {
            $set: {
              platform: 'facebook',
              accountId: primaryPage.id,
              accountName: `${primaryPage.name} (Facebook Page)`,
              avatarUrl: primaryPage.picture?.data?.url || meData.picture?.data?.url || '',
              rtmpUrl,
              streamKey,
              accessToken: pageToken,
              isConnected: true,
              lastUsedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
        connectedPlatforms.push('facebook');

        // Check if this page has a connected Instagram Business/Creator Account
        if (primaryPage.instagram_business_account) {
          const ig = primaryPage.instagram_business_account;
          await ConnectedSocialAccountModel.findOneAndUpdate(
            { platform: 'instagram' },
            {
              $set: {
                platform: 'instagram',
                accountId: ig.id,
                accountName: `@${ig.username} (Instagram)`,
                avatarUrl: ig.profile_picture_url || '',
                rtmpUrl: 'rtmps://live-upload.instagram.com:443/rtmp/',
                accessToken: pageToken,
                isConnected: true,
                lastUsedAt: new Date(),
              },
            },
            { upsert: true, new: true }
          );
          connectedPlatforms.push('instagram');
        }
      } else {
        // Fallback: Save user profile for Facebook Live
        await ConnectedSocialAccountModel.findOneAndUpdate(
          { platform: 'facebook' },
          {
            $set: {
              platform: 'facebook',
              accountId: meData.id,
              accountName: meData.name || 'Facebook User',
              avatarUrl: meData.picture?.data?.url || '',
              rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
              accessToken: userAccessToken,
              isConnected: true,
              lastUsedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
        connectedPlatforms.push('facebook');
      }

      const connectedParam = connectedPlatforms.join('_and_') || 'meta';
      return NextResponse.redirect(`${origin}/live-streamer?connected=${connectedParam}`);
    } catch (err: any) {
      console.error('[Facebook Callback Error]:', err.message);
      return NextResponse.redirect(`${origin}/live-streamer?oauth_error=${encodeURIComponent(err.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/live-streamer`);
}
