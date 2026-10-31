import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  // Peta kini menyatu di beranda.
  async redirects() {
    return [
      { source: "/peta", destination: "/#peta", permanent: true },
      { source: "/proyek", destination: "/#proyek", permanent: true },
    ];
  },
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
