import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.igdb.com",
      },
    ],
  },
  assetPrefix: process.env.ASSET_PREFIX || "",
};

export default nextConfig;
