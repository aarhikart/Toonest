import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
