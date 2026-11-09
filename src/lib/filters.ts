import { CATEGORIES, type CategoryId } from "./categories";
import { isGroup, isService, SERVICE_MAP, SERVICES, GROUPS } from "@/config/services";
import type { Project } from "./types";

export interface Filters {
  category: CategoryId | "";
  province: string;
  city: string;
  year: string;
}

export const EMPTY_FILTERS: Filters = { category: "", province: "", city: "", year: "" };

export function applyFilters(projects: Project[], f: Filters): Project[] {
  return projects.filter(
    (p) =>
      (!f.category || p.category === f.category) &&
      (!f.province || p.province === f.province) &&
      (!f.city || p.city === f.city) &&
      (!f.year || String(p.year) === f.year),
  );
}

export type SortKey = "tahun-baru" | "tahun-lama" | "kategori" | "lokasi" | "nama";

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "tahun-baru", label: "Tahun (terbaru)" },
  { id: "tahun-lama", label: "Tahun (terlama)" },
  { id: "kategori", label: "Kategori" },
  { id: "lokasi", label: "Lokasi (A-Z)" },
  { id: "nama", label: "Nama (A-Z)" },
];

const byText = (a: string, b: string) => a.localeCompare(b, "id");

export function sortProjects(projects: Project[], key: SortKey): Project[] {
  const order = new Map(CATEGORIES.map((c, i) => [c.id, i]));
  const cmp: Record<SortKey, (a: Project, b: Project) => number> = {
    "tahun-baru": (a, b) => b.year - a.year,
    "tahun-lama": (a, b) => a.year - b.year,
    kategori: (a, b) => (order.get(a.category)! - order.get(b.category)!) || b.year - a.year,
    lokasi: (a, b) => byText(a.province, b.province) || byText(a.city, b.city) || b.year - a.year,
    nama: (a, b) => byText(a.name, b.name),
  };
  return [...projects].sort((a, b) => cmp[key](a, b) || byText(a.name, b.name));
}

export function hasActiveFilters(f: Filters, ignoreCategory = false): boolean {
  return Boolean(f.province || f.city || f.year || (!ignoreCategory && f.category));
}

/** Pilihan filter diambil dari data yang ada, jadi tidak pernah ada opsi kosong. */
export function filterOptions(projects: Project[], f: Filters) {
  const provinces = [...new Set(projects.map((p) => p.province))].sort((a, b) => a.localeCompare(b, "id"));
  const cities = [
    ...new Set(projects.filter((p) => !f.province || p.province === f.province).map((p) => p.city)),
  ].sort((a, b) => a.localeCompare(b, "id"));
  const years = [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a).map(String);
  return { provinces, cities, years };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

// ---------------------------------------------------------------------------
// Filter berbasis layanan (taksonomi 8 group / 27 sub-layanan). SATU fungsi untuk peta, daftar, drawer, dan badge jumlah.
// Hanya proyek published yang dihitung; pemanggil bertanggung jawab memberi daftar published (usePublicProjects sudah begitu).
// ---------------------------------------------------------------------------
export interface ServiceFilters {
  /** slug sub-layanan ATAU slug group (group = salah satu sub-layanannya, utama atau tambahan) */
  layanan?: string;
  provinsi?: string;
  kota?: string;
  tahun?: string | number;
}

/** Apakah proyek termasuk layanan/group ini (layanan utama maupun tambahan). */
export function matchesService(p: Pick<Project, "services">, layanan: string): boolean {
  if (isService(layanan)) return p.services.includes(layanan);
  if (isGroup(layanan)) return p.services.some((s) => isService(s) && SERVICE_MAP[s].group === layanan);
  return false;
}

export function filterProjects(projects: Project[], f: ServiceFilters): Project[] {
  return projects.filter(
    (p) =>
      (!f.layanan || matchesService(p, f.layanan)) &&
      (!f.provinsi || p.province === f.provinsi) &&
      (!f.kota || p.city === f.kota) &&
      (!f.tahun || String(p.year) === String(f.tahun)),
  );
}

/** Jumlah proyek per sub-layanan dan per group (satu proyek dihitung sekali per group). Untuk badge. */
export function serviceCounts(projects: Project[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const sv of SERVICES) out.set(sv.slug, projects.filter((p) => p.services.includes(sv.slug)).length);
  for (const g of GROUPS) out.set(g.slug, projects.filter((p) => matchesService(p, g.slug)).length);
  return out;
}
