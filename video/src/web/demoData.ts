// Data untuk UI simulasi adegan 5-8: proyek published dari seed web (asli) + proyek contoh dari titik tambahan (PLACEHOLDER).
// Seed web belum punya proyek di Kalimantan/Sumatra/Sulawesi/Papua (selain Riau, Sulut, Sulteng), padahal adegan 5 meminta klik Kalimantan,
// jadi titik tambahan di config.ts dijadikan "proyek contoh". Nama, tahun, dan provinsinya PLACEHOLDER, revisi setelah dikonfirmasi MTJM.
import { seedProjects } from "../../../src/data/seed";
import { CATEGORY_MAP, type CategoryId } from "@/lib/categories";
import type { Project } from "@/lib/types";
import { CONFIG } from "../config";
import manifest from "../photosManifest.json";

const NAME_PREFIX: Partial<Record<CategoryId, string>> = {
  boiler: "Boiler",
  genset: "PLTMG",
  water: "Water Treatment",
  piping: "Piping",
  relokasi: "Relokasi Transformator",
  container: "Container",
};

const BASE = seedProjects().filter((p) => CONFIG.includeDraftProjects || p.status_data === "published");

// proyek unggulan harus ada di seed dan published (bukan draft)
const featured = BASE.find((p) => p.slug === CONFIG.featuredProject);
if (!featured) throw new Error(`featuredProject "${CONFIG.featuredProject}" tidak ada di seed atau bukan published`);

// foto proyek unggulan dari video/public/photos/<slug>/ (diproses scripts/prepare-photos.mjs); kosong -> tetap tanpa foto
const REAL: Project[] = BASE.map((p) =>
  p.slug === CONFIG.featuredProject && manifest.slug === p.slug && manifest.files.length ? { ...p, photos: manifest.files } : p,
);

const PLACEHOLDER: Project[] = CONFIG.extraDots.map((d, i) => ({
  id: `contoh-${i + 1}`,
  slug: `contoh-${d.name.toLowerCase().replace(/\s+/g, "-")}`,
  category: d.category as CategoryId,
  name: `${NAME_PREFIX[d.category as CategoryId] ?? CATEGORY_MAP[d.category as CategoryId].short} ${d.name}`,
  client: "",
  year: d.year,
  province: d.province,
  city: d.name,
  lat: d.lat,
  lng: d.lng,
  description: "",
  scope: "",
  status_data: "published",
  admin_note: "PLACEHOLDER",
  created_at: new Date(Date.UTC(2024, 6, 1, 0, i)).toISOString(),
  services: [],
  photos: [], // tanpa foto: kartu tampil dengan ikon kategori, sama seperti di web
}));

/** Semua proyek yang tampil di UI simulasi. */
export const DEMO_PROJECTS: Project[] = [...REAL, ...PLACEHOLDER];

export const categoryLabel = (id: CategoryId) => CATEGORY_MAP[id].label;
