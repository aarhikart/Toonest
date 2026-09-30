import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb/client';
import { ConnectedSocialAccountModel } from '@/lib/live-streamer/models';

export async function GET() {
  try {
    await connectToDatabase();
    const accounts = await ConnectedSocialAccountModel.find({}).lean();

    // Redact sensitive tokens while exposing configuration status
    const sanitized = accounts.map(acc => ({
      platform: acc.platform,
      accountName: acc.accountName || (acc.platform === 'facebook' ? 'Facebook Account' : 'Instagram Account'),
      accountId: acc.accountId || '',
      avatarUrl: acc.avatarUrl || '',
      rtmpUrl: acc.rtmpUrl || (acc.platform === 'facebook' ? 'rtmps://live-api-s.facebook.com:443/rtmp/' : 'rtmps://live-upload.instagram.com:443/rtmp/'),
      hasStreamKey: Boolean(acc.streamKey && acc.streamKey.trim().length > 0),
      hasOAuth: Boolean(acc.accessToken && acc.accessToken.trim().length > 0),
      isConfigured: Boolean((acc.streamKey && acc.streamKey.trim().length > 0) || (acc.accessToken && acc.accessToken.trim().length > 0)),
      // Masked stream key for UI preview
      maskedKey: acc.streamKey ? `${acc.streamKey.slice(0, 4)}••••••••${acc.streamKey.slice(-4)}` : '',
      streamKey: acc.streamKey || '',
      isConnected: acc.isConnected || false,
      lastUsedAt: acc.lastUsedAt || null,
    }));

    return NextResponse.json({ success: true, accounts: sanitized });
  } catch (error: any) {
    console.error('[API accounts GET error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { platform, accountName, rtmpUrl, streamKey } = body;

    if (!platform || !['facebook', 'instagram'].includes(platform)) {
      return NextResponse.json({ success: false, error: 'Platform must be either facebook or instagram' }, { status: 400 });
    }

    if (!streamKey || streamKey.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Stream Key cannot be empty' }, { status: 400 });
    }

    const defaultRtmp =
      platform === 'facebook'
        ? 'rtmps://live-api-s.facebook.com:443/rtmp/'
        : 'rtmps://live-upload.instagram.com:443/rtmp/';

    const cleanRtmp = (rtmpUrl && rtmpUrl.trim().length > 0) ? rtmpUrl.trim() : defaultRtmp;

    const updated = await ConnectedSocialAccountModel.findOneAndUpdate(
      { platform },
      {
        $set: {
          platform,
          accountName: (accountName && accountName.trim()) || (platform === 'facebook' ? 'Facebook Live Destination' : 'Instagram Live Destination'),
          rtmpUrl: cleanRtmp,
          streamKey: streamKey.trim(),
          isConnected: true,
          lastUsedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      message: `${platform === 'facebook' ? 'Facebook' : 'Instagram'} live destination credentials saved successfully!`,
      account: {
        platform: updated.platform,
        accountName: updated.accountName,
        rtmpUrl: updated.rtmpUrl,
        hasStreamKey: true,
        isConnected: true,
      },
    });
  } catch (error: any) {
    console.error('[API accounts POST error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');

    if (!platform || !['facebook', 'instagram'].includes(platform)) {
      return NextResponse.json({ success: false, error: 'Invalid platform parameter' }, { status: 400 });
    }

    await ConnectedSocialAccountModel.deleteOne({ platform: platform as 'facebook' | 'instagram' });
    return NextResponse.json({ success: true, message: `Disconnected ${platform} account successfully.` });
  } catch (error: any) {
    console.error('[API accounts DELETE error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
