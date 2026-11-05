// SUMBER TUNGGAL kategori proyek (nama mengikuti bagian "Our Services" di company profile).
// Tab publik, filter, legenda peta, dropdown admin, dan viewer 3D semuanya membaca file ini.
//
// Menambah kategori: (1) tambah slug ke CategoryId, (2) tambah baris di CATEGORIES (pilih `family`),
// (3) tambah ikon di src/components/CategoryIcon.tsx, (4) tambah slug ke CHECK constraint lewat migrasi SQL baru
// di supabase/migrations (lihat 003_categories.sql sebagai contoh), (5) arahkan `model` ke komponen 3D-nya.
//
// JANGAN mengubah slug yang sudah dipakai di database; yang boleh diubah hanya label/deskripsi.
import type { ComponentType } from "react";

export type CategoryId =
  | "boiler"
  | "genset"
  | "water"
  | "piping"
  | "relokasi"
  | "container"
  | "power-plant"
  | "electrical-work"
  | "civil-steel"
  | "fire-protection"
  | "storage-tanks"
  | "industrial-maintenance"
  | "building-factory";

/** Pengaturan tampilan kategori. */
export const CATEGORY_UI = {
  /** Kategori dengan 0 proyek publik disembunyikan dari tab, filter, dan legenda publik (admin tetap menampilkan semuanya). */
  hideEmptyCategories: true,
} as const;

/** 5 keluarga warna untuk titik peta dan legenda (13 warna terlalu banyak untuk dibedakan). Warna: tema biru-putih MTJM. */
export type FamilyId = "pembangkit" | "mekanikal" | "elektrikal" | "sipil" | "utilitas";

export interface FamilyInfo {
  id: FamilyId;
  label: string;
  color: string;
}

export const FAMILIES: FamilyInfo[] = [
  { id: "pembangkit", label: "Pembangkit", color: "#c2410c" },
  { id: "mekanikal", label: "Mekanikal", color: "#4d7c0f" },
  { id: "elektrikal", label: "Elektrikal & proteksi", color: "#7e22ce" },
  { id: "sipil", label: "Sipil & bangunan", color: "#475569" },
  { id: "utilitas", label: "Utilitas & penyimpanan", color: "#0e7490" },
];

export const FAMILY_MAP = Object.fromEntries(FAMILIES.map((f) => [f.id, f])) as Record<FamilyId, FamilyInfo>;

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  short: string;
  /** Warna keluarga (dipakai titik peta, aksen teks, ikon). */
  color: string;
  family: FamilyId;
  /** 1-2 kalimat, diambil dari cakupan layanan company profile. */
  blurb: string;
  /** Titik bidik kamera viewer 3D (tengah objek). */
  target: [number, number, number];
  /** Pandangan kamera viewer 3D; model lebar (mis. Piping) memakai jarak lebih jauh dan sudut lebih tinggi. */
  view?: ModelView;
  /** Komponen model 3D, dimuat malas per kategori. */
  model: () => Promise<ComponentType>;
}

export interface ModelView {
  distance: number;
  dir: [number, number, number];
  minDistance: number;
  maxDistance: number;
  /** Lebar area bayangan dan grid (satuan model). */
  groundScale: number;
}

export const DEFAULT_VIEW: ModelView = { distance: 15, dir: [9, 5.5, 10.5], minDistance: 6, maxDistance: 36, groundScale: 18 };

type Def = Omit<CategoryInfo, "color">;

const DEFS: Def[] = [
  {
    id: "boiler",
    label: "Boiler & Heater",
    short: "Boiler",
    family: "mekanikal",
    blurb: "Instalasi dan pemasangan boiler dan heater beserta sistem steam dan feedwater.",
    target: [0, 2.4, 0],
    model: () => import("@/components/models/BoilerModel").then((m) => m.BoilerModel),
  },
  {
    id: "genset",
    label: "Gas Engine & Generator Set",
    short: "Genset",
    family: "pembangkit",
    blurb: "Pembangkit berbahan bakar gas dan diesel: mesin, enclosure, dan balance of plant.",
    target: [0, 1.4, 0],
    model: () => import("@/components/models/GensetModel").then((m) => m.GensetModel),
  },
  {
    id: "water",
    label: "Water Treatment",
    short: "Water",
    family: "utilitas",
    blurb: "Instalasi pengolahan air: tangki, pompa, dan jaringan pipa.",
    target: [0, 1.7, 0],
    model: () => import("@/components/models/WaterModel").then((m) => m.WaterModel),
  },
  {
    id: "piping",
    label: "Mechanical, Pump & Piping",
    short: "Piping",
    family: "mekanikal",
    blurb: "Pipa karbon dan stainless, HDPE, cast iron, dan plumbing; sistem pompa; serta HVAC.",
    target: [0, 1.8, 0],
    view: { distance: 44, dir: [8, 9, 11], minDistance: 10, maxDistance: 80, groundScale: 40 },
    model: () => import("@/components/models/PipingModel").then((m) => m.PipingModel),
  },
  {
    id: "relokasi",
    label: "Relocation & Dismantling",
    short: "Relokasi",
    family: "mekanikal",
    blurb: "Jacking and rolling, lifting, dan dismantle peralatan berat.",
    target: [0, 1.4, 0],
    model: () => import("@/components/models/RelocationModel").then((m) => m.RelocationModel),
  },
  {
    id: "container",
    label: "Container Modification",
    short: "Container",
    family: "sipil",
    blurb: "Container fuel tank, switchgear, control room, office, dan site office.",
    target: [0, 1.2, 0],
    model: () => import("@/components/models/ContainerModel").then((m) => m.ContainerModel),
  },
  {
    id: "power-plant",
    label: "Power Plant",
    short: "Power Plant",
    family: "pembangkit",
    blurb: "Pembangkit listrik secara keseluruhan (EPC): gas engine, generator set, dan coal-fired power plant.",
    target: [0, 1.4, 0],
    view: { distance: 26, dir: [9, 6.5, 10.5], minDistance: 8, maxDistance: 60, groundScale: 30 },
    model: () => import("@/components/models/PowerPlantModel").then((m) => m.PowerPlantModel),
  },
  {
    id: "electrical-work",
    label: "Electrical Work",
    short: "Electrical",
    family: "elektrikal",
    blurb: "Jaringan transmisi dan distribusi, elektrikal gedung dan pabrik, instrumen dan kontrol, serta panel MV/LV.",
    target: [0, 1.4, 0],
    view: { distance: 20, dir: [9, 6, 10.5], minDistance: 8, maxDistance: 45, groundScale: 22 },
    model: () => import("@/components/models/ElectricalModel").then((m) => m.ElectricalModel),
  },
  {
    id: "civil-steel",
    label: "Civil Work & Steel Structure",
    short: "Civil & Steel",
    family: "sipil",
    blurb: "Struktur baja, gedung, interior, serta pekerjaan sipil dan arsitektur.",
    target: [0, 1.4, 0],
    model: () => import("@/components/models/PlaceholderModel").then((m) => m.PlaceholderModel),
  },
  {
    id: "fire-protection",
    label: "Fire Protection & Alarm System",
    short: "Fire Protection",
    family: "elektrikal",
    blurb: "Sistem pemadam kebakaran, hidran, dan alarm.",
    target: [0, 1.4, 0],
    view: { distance: 25, dir: [9, 6, 10.5], minDistance: 8, maxDistance: 50, groundScale: 26 },
    model: () => import("@/components/models/FireProtectionModel").then((m) => m.FireProtectionModel),
  },
  {
    id: "storage-tanks",
    label: "Fuel & Water Storage Tanks",
    short: "Storage Tanks",
    family: "utilitas",
    blurb: "Tangki minyak dan air, tangki kimia, filter tank, dan pressure tank.",
    target: [0, 1.4, 0],
    model: () => import("@/components/models/PlaceholderModel").then((m) => m.PlaceholderModel),
  },
  {
    id: "industrial-maintenance",
    label: "Industrial Maintenance",
    short: "Maintenance",
    family: "mekanikal",
    blurb: "Annual maintenance berkala dan instalasi mesin custom.",
    target: [0, 1.4, 0],
    model: () => import("@/components/models/PlaceholderModel").then((m) => m.PlaceholderModel),
  },
  {
    id: "building-factory",
    label: "Building Factory",
    short: "Building Factory",
    family: "sipil",
    blurb: "Pembangunan dan renovasi pabrik dan fasilitas industri.",
    target: [0, 1.4, 0],
    model: () => import("@/components/models/PlaceholderModel").then((m) => m.PlaceholderModel),
  },
];

export const CATEGORIES: CategoryInfo[] = DEFS.map((d) => ({ ...d, color: FAMILY_MAP[d.family].color }));

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CategoryInfo>;

export function isCategory(v: string | null | undefined): v is CategoryId {
  return !!v && v in CATEGORY_MAP;
}

/**
 * Kategori yang tampil di UI publik: yang punya proyek publik (`totals` = jumlah TANPA filter lokasi/tahun),
 * ditambah `keep` (kategori yang sedang dipilih, supaya tidak hilang dari tab). Semua bila hideEmptyCategories = false.
 */
export function visibleCategories(totals: Map<CategoryId, number>, keep?: CategoryId | ""): CategoryInfo[] {
  if (!CATEGORY_UI.hideEmptyCategories) return CATEGORIES;
  return CATEGORIES.filter((c) => (totals.get(c.id) ?? 0) > 0 || c.id === keep);
}
