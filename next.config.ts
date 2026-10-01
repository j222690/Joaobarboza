import type { NextConfig } from "next";

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/webp"], qualities: [75, 90] },
  async headers() {
    return [
      { source: "/paineljbadmin", headers: [...noindex, { key: "Cache-Control", value: "no-store" }] },
      { source: "/paineljbadmin/:path*", headers: [...noindex, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: noindex },
    ];
  },
};

export default nextConfig;
