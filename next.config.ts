import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is an unrelated package-lock.json in the parent directory, which makes
  // Next infer the wrong workspace root. Pin it to this project.
  turbopack: {
    root: path.join(import.meta.dirname, "."),
  },
  experimental: {
    workerThreads: false,
    cpus: 4,
  },
};

export default nextConfig;
