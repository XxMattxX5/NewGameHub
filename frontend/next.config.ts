import type { NextConfig } from "next";

const hostname = process.env.NEXT_PUBLIC_HOST_NAME;
const isProd = process.env.NEXT_PUBLIC_IS_PRODUCTION === "true";

if (!hostname) {
  throw new Error(
    `NEXT_PUBLIC_HOST_NAME is not set or empty - ${hostname} - ${process.env.ASSET_PREFIX}`
  );
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.igdb.com",
      },
      {
        protocol: isProd ? "https" : "http",
        hostname: hostname,
        pathname: "/api/media/**",
      },
    ],
  },
  assetPrefix: "",
};

export default nextConfig;
