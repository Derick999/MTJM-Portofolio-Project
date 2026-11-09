import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { IMAGES } from "./src/config/images";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  // Peta ada di halaman Cari Proyek. Link lama beranda berparameter (/?layanan=...) diarahkan ke /proyek (query ikut terbawa).
  async redirects() {
    return [
      { source: "/peta", destination: "/proyek", permanent: true },
      { source: "/", has: [{ type: "query", key: "layanan" }], destination: "/proyek", permanent: true },
      { source: "/", has: [{ type: "query", key: "p" }], destination: "/proyek", permanent: true },
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

/** Saat build production: ingatkan bila masih ada foto placeholder yang aktif (src/config/images.ts). */
function warnActivePlaceholders() {
  const active = IMAGES.filter((i) => i.placeholder && fs.existsSync(path.join(process.cwd(), "public", i.src)));
  if (!active.length) return;
  console.warn("\n\x1b[33m⚠ Masih ada foto placeholder yang aktif:\x1b[0m");
  for (const i of active) console.warn(`  - ${i.src} (${i.use}${i.group ? `: ${i.group}` : ""}) | sumber: ${i.source} | lisensi: ${i.license}`);
  console.warn("  Ganti dengan foto asli sebelum publikasi (lihat README: \"Sebelum publikasi: ganti foto placeholder\").\n");
}

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) warnActivePlaceholders();
  return nextConfig;
}
