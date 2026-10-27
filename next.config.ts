import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    '*': [
      './services/**',
      './services/**/*',
      '**/services/**',
      '**/services/**/*',
      'sessions/**',
      '**/sessions/**',
      '.wwebjs_auth/**',
      '**/.wwebjs_auth/**',
      '.wwebjs_cache/**',
      '**/.wwebjs_cache/**',
    ],
  },
  serverExternalPackages: [
    'ffmpeg-static',
    'ffprobe-static',
    'archiver',
    'pdf-lib',
    'tesseract.js',
    'xlsx',
  ],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/whatsapp-marketing',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
