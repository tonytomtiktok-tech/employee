import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cookie/session-heavy app; enable Cache Components later with Suspense boundaries.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
