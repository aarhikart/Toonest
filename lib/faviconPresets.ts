import { FaviconSizePreset } from './faviconTypes';

export const FAVICON_SIZE_PRESETS: FaviconSizePreset[] = [
  // Multi-resolution ICO
  {
    id: 'ico-multi',
    name: 'Multi-Resolution ICO (16, 32, 48)',
    width: 48,
    height: 48,
    category: 'browser',
    filename: 'favicon.ico',
    recommendedFormat: 'ico',
    description: 'Universal fallback for legacy and modern desktop browsers (contains 16x16, 32x32, 48x48)',
    isDefaultSelected: true,
  },

  // Standard Browser PNGs
  {
    id: 'png-16',
    name: 'Standard Browser Tab (16 × 16)',
    width: 16,
    height: 16,
    category: 'browser',
    filename: 'favicon-16x16.png',
    recommendedFormat: 'png',
    description: 'Standard desktop browser tab icon',
    isDefaultSelected: true,
  },
  {
    id: 'png-32',
    name: 'High-DPI Browser Tab (32 × 32)',
    width: 32,
    height: 32,
    category: 'browser',
    filename: 'favicon-32x32.png',
    recommendedFormat: 'png',
    description: 'Retina & 4K desktop browser tab icon',
    isDefaultSelected: true,
  },
  {
    id: 'png-48',
    name: 'Windows Desktop / Taskbar (48 × 48)',
    width: 48,
    height: 48,
    category: 'browser',
    filename: 'favicon-48x48.png',
    recommendedFormat: 'png',
    description: 'Windows site shortcut and desktop tile display',
    isDefaultSelected: true,
  },

  // Apple Touch Icons
  {
    id: 'apple-180',
    name: 'Apple Touch Icon (180 × 180)',
    width: 180,
    height: 180,
    category: 'apple',
    filename: 'apple-touch-icon.png',
    recommendedFormat: 'png',
    description: 'iOS Home Screen bookmark icon for iPhone (Retina HD display)',
    isDefaultSelected: true,
  },
  {
    id: 'apple-167',
    name: 'iPad Pro Touch Icon (167 × 167)',
    width: 167,
    height: 167,
    category: 'apple',
    filename: 'apple-touch-icon-167x167.png',
    recommendedFormat: 'png',
    description: 'iPad Pro Retina home screen shortcut',
    isDefaultSelected: false,
  },
  {
    id: 'apple-152',
    name: 'iPad Touch Icon (152 × 152)',
    width: 152,
    height: 152,
    category: 'apple',
    filename: 'apple-touch-icon-152x152.png',
    recommendedFormat: 'png',
    description: 'Standard iPad home screen web clip',
    isDefaultSelected: false,
  },

  // Android & PWA
  {
    id: 'android-192',
    name: 'Android Chrome / PWA (192 × 192)',
    width: 192,
    height: 192,
    category: 'android',
    filename: 'android-chrome-192x192.png',
    recommendedFormat: 'png',
    description: 'Android Home Screen shortcut and PWA splash screen',
    isDefaultSelected: true,
  },
  {
    id: 'android-512',
    name: 'Android Chrome High-Res (512 × 512)',
    width: 512,
    height: 512,
    category: 'android',
    filename: 'android-chrome-512x512.png',
    recommendedFormat: 'png',
    description: 'Google Play Store / PWA install splash icon',
    isDefaultSelected: true,
  },

  // Additional Common Sizes
  {
    id: 'png-64',
    name: 'Additional Size (64 × 64)',
    width: 64,
    height: 64,
    category: 'additional',
    filename: 'favicon-64x64.png',
    recommendedFormat: 'png',
    description: 'High-DPI bookmark display and favorites',
    isDefaultSelected: false,
  },
  {
    id: 'png-96',
    name: 'Google TV / Android HD (96 × 96)',
    width: 96,
    height: 96,
    category: 'additional',
    filename: 'favicon-96x96.png',
    recommendedFormat: 'png',
    description: 'Google TV and medium Android density screen icon',
    isDefaultSelected: false,
  },
  {
    id: 'png-128',
    name: 'Chrome Web Store (128 × 128)',
    width: 128,
    height: 128,
    category: 'additional',
    filename: 'favicon-128x128.png',
    recommendedFormat: 'png',
    description: 'Chrome Web Store and extension standard icon',
    isDefaultSelected: false,
  },
  {
    id: 'png-144',
    name: 'Windows 8/10 Tile (144 × 144)',
    width: 144,
    height: 144,
    category: 'additional',
    filename: 'ms-tile-144x144.png',
    recommendedFormat: 'png',
    description: 'Windows start menu pinned site tile',
    isDefaultSelected: false,
  },
];

export interface QuickPackagePreset {
  id: string;
  name: string;
  description: string;
  sizeIds: string[];
}

export const QUICK_PACKAGE_PRESETS: QuickPackagePreset[] = [
  {
    id: 'basic',
    name: 'Basic Favicon',
    description: 'Standard ICO and essential 16x16, 32x32, 48x48 PNGs for standard websites',
    sizeIds: ['ico-multi', 'png-16', 'png-32', 'png-48'],
  },
  {
    id: 'website',
    name: 'Complete Website Package',
    description: 'Includes ICO, PNGs, Apple Touch Icon, and standard PWA icons (Recommended)',
    sizeIds: ['ico-multi', 'png-16', 'png-32', 'png-48', 'apple-180', 'android-192', 'android-512'],
  },
  {
    id: 'pwa',
    name: 'PWA Package',
    description: 'Essential icons for Progressive Web Apps (192x192 & 512x512 with manifest)',
    sizeIds: ['android-192', 'android-512'],
  },
  {
    id: 'all',
    name: 'All Common Sizes',
    description: 'Every supported browser, Apple, Android, Windows, and PWA icon size',
    sizeIds: FAVICON_SIZE_PRESETS.map((p) => p.id),
  },
];

export function getPresetById(id: string): FaviconSizePreset | undefined {
  return FAVICON_SIZE_PRESETS.find((p) => p.id === id);
}
