import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silence lockfile root detection warning
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
