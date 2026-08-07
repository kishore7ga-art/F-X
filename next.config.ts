import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is an unrelated package-lock.json in the parent directory, which makes
  // Next infer the wrong workspace root. Pin it to this project.
  turbopack: {
    root: path.join(import.meta.dirname, "."),
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/site/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/preview/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/editor/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
