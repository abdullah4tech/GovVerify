import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Ensure proper CSS optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Optimize production builds
  swcMinify: true,
  // Ensure proper static optimization
  reactStrictMode: true,
};

export default nextConfig;
