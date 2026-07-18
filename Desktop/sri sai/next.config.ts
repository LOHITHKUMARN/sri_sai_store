import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  allowedDevOrigins: ['unlinked-sandworm-karma.ngrok-free.dev'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
