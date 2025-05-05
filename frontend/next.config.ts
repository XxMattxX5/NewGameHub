import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.igdb.com"],
  },
  assetPrefix: process.env.ASSET_PREFIX || "",
  devTools: true,
};

export default nextConfig;
