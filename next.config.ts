import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedOrigins: ["*"],
  },
  async rewrites() {
    return [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
