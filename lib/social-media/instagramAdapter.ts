import { SocialMediaItem, SocialMediaProvider } from './types';
import { instagramProvider } from '@/lib/instagram/provider';
import { extractInstagramShortcode, cleanInstagramUrl } from '@/lib/instagram/validator';

export class InstagramAdapter implements SocialMediaProvider {
  name = 'InstagramAdapter';
  platform = 'instagram' as const;

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return (
      (lower.includes('instagram.com') || lower.includes('instagr.am')) &&
      (/\/(?:reel|reels|p)\//i.test(lower))
    );
  }

  async fetchMedia(url: string): Promise<SocialMediaItem | null> {
    const shortcode = extractInstagramShortcode(url);
    if (!shortcode) return null;

    const cleanUrl = cleanInstagramUrl(url);
    const result = await instagramProvider.fetchMedia(cleanUrl, shortcode);

    if (!result) return null;

    return {
      id: shortcode,
      platform: 'instagram',
      type: result.type,
      thumbnail: result.thumbnail,
      downloadUrl: result.downloadUrl,
      sourceUrl: result.sourceUrl,
      title: result.caption || `Instagram Reel #${shortcode}`,
      creator: result.creator,
      filename: result.filename || `instagram_${shortcode}.${result.type === 'video' ? 'mp4' : 'jpg'}`,
      quality: 'HD',
    };
  }
}
