import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  srcDir: "src", // ← tambahkan baris ini
};

export default nextConfig;
