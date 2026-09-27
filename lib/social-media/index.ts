import { SocialMediaItem, SocialMediaProvider, SupportedPlatform } from './types';
import { InstagramAdapter } from './instagramAdapter';
import { PinterestProvider } from './pinterestProvider';
import { YouTubeProvider } from './youtubeProvider';
import { detectPlatform, isAllowedMediaCdn } from './detector';

export * from './types';
export * from './detector';

export class SocialMediaManager {
  private providers: SocialMediaProvider[];
  public youtube: YouTubeProvider;

  constructor() {
    this.youtube = new YouTubeProvider();
    this.providers = [
      new InstagramAdapter(),
      new PinterestProvider(),
      this.youtube,
    ];
  }

  async fetchMedia(url: string): Promise<SocialMediaItem | null> {
    const platform = detectPlatform(url);
    if (!platform) return null;

    for (const provider of this.providers) {
      if (provider.platform === platform && provider.canHandle(url)) {
        try {
          const item = await provider.fetchMedia(url);
          if (item) {
            return item;
          }
        } catch (err: any) {
          console.error(`[SocialMediaManager] Error in ${provider.name}:`, err?.message || err);
        }
      }
    }

    return null;
  }
}

export const socialMediaManager = new SocialMediaManager();
