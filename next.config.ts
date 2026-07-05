import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 写真の複数枚アップロードに対応（既定は1MB）
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
