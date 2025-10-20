import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // We use Biome instead of ESLint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
