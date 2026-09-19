import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
