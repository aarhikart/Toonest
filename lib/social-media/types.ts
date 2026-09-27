export type SupportedPlatform = 'instagram' | 'pinterest' | 'youtube';

export interface SocialMediaItem {
  id: string;
  platform: SupportedPlatform;
  type: 'video' | 'image';
  thumbnail: string;
  downloadUrl: string;
  sourceUrl: string;
  title?: string;
  creator?: string;
  duration?: string | number;
  filename: string;
  quality?: string;
}

export interface SocialMediaProvider {
  name: string;
  platform: SupportedPlatform;
  canHandle(url: string): boolean;
  fetchMedia(url: string): Promise<SocialMediaItem | null>;
}
