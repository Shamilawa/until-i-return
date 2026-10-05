import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Letter photos are compressed in the browser first; this leaves headroom.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
