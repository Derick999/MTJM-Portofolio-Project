// Data proyek, kategori, dan peta diambil LANGSUNG dari web (satu sumber kebenaran).
import { SEED } from "../../src/data/seed";
import { CATEGORY_MAP, type CategoryId } from "../../src/lib/categories";
import geo from "../../public/geo/indonesia-provinces.json";
import { CONFIG } from "./config";

export type VideoProject = {
  slug: string;
  name: string;
  category: CategoryId;
  color: string;
  lat: number;
  lng: number;
  year: number;
  province: string;
};

export const PROJECTS: VideoProject[] = SEED.filter(
  (p) => CONFIG.includeDraftProjects || p.status_data === "published",
).map((p) => ({
  slug: p.slug,
  name: p.name,
  category: p.category as CategoryId,
  color: CATEGORY_MAP[p.category as CategoryId].color,
  lat: p.lat as number,
  lng: p.lng as number,
  year: p.year as number,
  province: p.province,
}));

const EXTRA: VideoProject[] = CONFIG.extraDots.map((d) => ({
  slug: `placeholder-${d.name}`,
  name: d.name,
  category: d.category as CategoryId,
  color: CATEGORY_MAP[d.category as CategoryId].color,
  lat: d.lat,
  lng: d.lng,
  year: d.year,
  province: d.province,
}));

export type ScheduledDot = VideoProject & {
  /** id wilayah (lihat CONFIG.regionRules) */
  region: string;
  /** detik sejak awal adegan 3 */
  startSec: number;
  /** true = titik Bekasi (pusat penyebaran) */
  isHub: boolean;
};

const regionOf = (lat: number, lng: number): string => {
  const hit = CONFIG.regionRules.find((r) => lat >= r.minLat && lat <= r.maxLat && lng >= r.minLng && lng <= r.maxLng);
  return hit ? hit.id : "papua";
};

const HUB: ScheduledDot = {
  slug: "hub-bekasi",
  name: CONFIG.hub.name,
  category: "boiler", // tidak dipakai (warna hub dari CONFIG.hub.color)
  color: CONFIG.hub.color,
  lat: CONFIG.hub.lat,
  lng: CONFIG.hub.lng,
  year: 0,
  province: "",
  region: "hub",
  startSec: CONFIG.scene3.dots.hubStart,
  isHub: true,
};

/**
 * Jadwal muncul titik: Bekasi dulu, lalu gelombang sesuai CONFIG.scene3.dots.waves.
 * Dalam satu gelombang urutannya dari yang terdekat ke Bekasi, supaya terlihat menyebar keluar.
 */
const buildSchedule = (): ScheduledDot[] => {
  const D = CONFIG.scene3.dots;
  const all = [...PROJECTS, ...EXTRA].map((p) => ({ ...p, region: regionOf(p.lat, p.lng) }));
  const dist = (p: { lat: number; lng: number }) => Math.hypot(p.lat - CONFIG.hub.lat, (p.lng - CONFIG.hub.lng) * Math.cos((CONFIG.hub.lat * Math.PI) / 180));
  const out: ScheduledDot[] = [HUB];
  const used = new Set<string>();
  let t = D.hubStart + D.hubHold;
  for (const wave of D.waves) {
    const inWave = all.filter((p) => (wave.regions as readonly string[]).includes(p.region)).sort((x, y) => dist(x) - dist(y));
    inWave.forEach((p, i) => {
      used.add(p.slug);
      out.push({ ...p, startSec: t + i * D.dotStagger, isHub: false });
    });
    t += Math.max(inWave.length - 1, 0) * D.dotStagger + D.waveGap;
  }
  // titik yang tidak masuk gelombang mana pun muncul terakhir (jaga-jaga bila daftar gelombang diubah)
  all
    .filter((p) => !used.has(p.slug))
    .forEach((p, i) => out.push({ ...p, startSec: t + i * D.dotStagger, isHub: false }));
  return out;
};

/** Semua titik beserta waktu munculnya (urutan sesuai gelombang). */
export const MAP_DOTS: ScheduledDot[] = buildSchedule();

export const GEO = geo as unknown as {
  features: { geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] } }[];
};
