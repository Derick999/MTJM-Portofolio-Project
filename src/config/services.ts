// SUMBER TUNGGAL taksonomi layanan: 8 kelompok (group) dan 27 sub-layanan (service), mengikuti halaman "Our Services" company profile.
// Tidak ada tabel database untuk layanan: kolom `projects.services` (text[]) menyimpan slug layanan; elemen pertama = layanan utama.
//
// Menambah layanan: tambah baris di SERVICES (pilih `group`). Slug harus unik di seluruh file (group dan service tidak boleh sama).
// Jika slug baru dipakai proyek, tidak perlu migrasi: kolom `services` menerima teks apa saja.
import type { CategoryId } from "./categories";

export type GroupSlug =
  | "power-plant"
  | "mechanical"
  | "electrical"
  | "civil-architecture"
  | "water-treatment"
  | "storage-tank-boilers"
  | "relocation-dismantling"
  | "industrial-factory";

export type ServiceSlug =
  | "gas-engine-power-plant"
  | "generator-set-power-plant"
  | "coal-fired-power-plant"
  | "piping-system"
  | "fire-fighting-protection"
  | "hvac"
  | "pump-system"
  | "transmission-distribution"
  | "building-factory-lighting"
  | "instrument-control"
  | "mv-lv-panel"
  | "steel-structure"
  | "building"
  | "interior"
  | "container-modification"
  | "sewage-treatment"
  | "clean-water-treatment"
  | "waste-water-treatment"
  | "oil-water-tank"
  | "chemical-tank"
  | "filter-tank"
  | "pressure-tank"
  | "boilers"
  | "jacking-rolling"
  | "lifting"
  | "annual-maintenance"
  | "custom-machine-installation";

/** Kunci model 3D = kunci model yang sudah ada di src/config/categories.ts (satu registri model untuk viewer). */
export type ModelKey = CategoryId;

export interface GroupInfo {
  slug: GroupSlug;
  label: string;
  blurb: string;
  /** Warna group (titik peta, aksen kartu). Kontras cukup di atas putih. */
  color: string;
  /** Model 3D bawaan group; dipakai sub-layanan yang tidak punya model sendiri. */
  model?: ModelKey;
}

export interface ServiceInfo {
  slug: ServiceSlug;
  label: string;
  /** 1 kalimat, dari cakupan layanan company profile. */
  blurb: string;
  group: GroupSlug;
  /** Model 3D khusus sub-layanan ini (opsional; selain itu memakai model group). */
  model?: ModelKey;
  /**
   * Nilai kolom `projects.category` (lama, deprecated) yang diisi otomatis saat admin menyimpan, karena kolom itu masih NOT NULL
   * dengan CHECK constraint. UI publik tidak lagi memakainya.
   */
  legacyCategory: CategoryId;
}

export const GROUPS: GroupInfo[] = [
  { slug: "power-plant", label: "Power Plant", blurb: "Pembangunan pembangkit listrik: gas engine, generator set, dan coal-fired.", color: "#c2410c", model: "power-plant" },
  { slug: "mechanical", label: "Mechanical", blurb: "Sistem pipa, pemadam kebakaran, tata udara, dan pompa.", color: "#4d7c0f", model: "piping" },
  { slug: "electrical", label: "Electrical", blurb: "Jaringan listrik, instalasi gedung dan pabrik, instrumen, kontrol, dan panel.", color: "#7e22ce", model: "electrical-work" },
  { slug: "civil-architecture", label: "Civil & Architecture", blurb: "Struktur baja, gedung, interior, dan modifikasi container.", color: "#475569", model: "civil-steel" },
  { slug: "water-treatment", label: "Water Treatment Plant", blurb: "Pengolahan air bersih, air limbah, dan sewage.", color: "#0e7490", model: "water" },
  { slug: "storage-tank-boilers", label: "Storage Tank & Boilers", blurb: "Tangki minyak, air, kimia, filter, dan tekanan, serta boiler.", color: "#b45309", model: "storage-tanks" },
  { slug: "relocation-dismantling", label: "Relocation & Dismantling", blurb: "Jacking and rolling dan lifting peralatan berat.", color: "#9d174d", model: "relokasi" },
  { slug: "industrial-factory", label: "Industrial & Factory", blurb: "Perawatan berkala dan instalasi mesin custom di pabrik.", color: "#1b2a78", model: "building-factory" },
];

export const SERVICES: ServiceInfo[] = [
  // Power Plant
  { slug: "gas-engine-power-plant", label: "Gas Engine Power Plant", blurb: "Pembangunan pembangkit listrik dengan mesin gas (gas engine).", group: "power-plant", model: "genset", legacyCategory: "genset" },
  { slug: "generator-set-power-plant", label: "Generator Set Power Plant", blurb: "Pembangunan pembangkit listrik dengan generator set.", group: "power-plant", model: "genset", legacyCategory: "genset" },
  { slug: "coal-fired-power-plant", label: "Coal Fired Power Plant", blurb: "Pembangunan pembangkit listrik berbahan bakar batu bara.", group: "power-plant", legacyCategory: "power-plant" },
  // Mechanical
  { slug: "piping-system", label: "Piping System", blurb: "Instalasi pipa karbon dan stainless, HDPE, cast iron, dan plumbing.", group: "mechanical", legacyCategory: "piping" },
  { slug: "fire-fighting-protection", label: "Fire Fighting & Protection System", blurb: "Sistem pemadam kebakaran, hidran, dan proteksi kebakaran.", group: "mechanical", model: "fire-protection", legacyCategory: "fire-protection" },
  { slug: "hvac", label: "HVAC", blurb: "Sistem tata udara (HVAC).", group: "mechanical", legacyCategory: "piping" },
  { slug: "pump-system", label: "Pumps System", blurb: "Sistem pompa.", group: "mechanical", legacyCategory: "piping" },
  // Electrical
  { slug: "transmission-distribution", label: "Transmission & Distribution Line", blurb: "Jaringan transmisi dan distribusi listrik.", group: "electrical", legacyCategory: "electrical-work" },
  { slug: "building-factory-lighting", label: "Electrical for Building, Factory & Street Lighting", blurb: "Instalasi elektrikal untuk gedung, pabrik, dan penerangan jalan.", group: "electrical", legacyCategory: "electrical-work" },
  { slug: "instrument-control", label: "Instrument & Control Installation", blurb: "Instalasi instrumen dan sistem kontrol.", group: "electrical", legacyCategory: "electrical-work" },
  { slug: "mv-lv-panel", label: "MV & LV Panel Maker and Installation", blurb: "Pembuatan dan instalasi panel MV dan LV.", group: "electrical", legacyCategory: "electrical-work" },
  // Civil & Architecture
  { slug: "steel-structure", label: "Steel Structure", blurb: "Pekerjaan struktur baja.", group: "civil-architecture", legacyCategory: "civil-steel" },
  { slug: "building", label: "Building", blurb: "Pembangunan dan renovasi gedung.", group: "civil-architecture", legacyCategory: "civil-steel" },
  { slug: "interior", label: "Interior", blurb: "Pekerjaan interior.", group: "civil-architecture", legacyCategory: "civil-steel" },
  { slug: "container-modification", label: "Container Modification", blurb: "Modifikasi container menjadi fuel tank, switchgear, control room, office, dan site office.", group: "civil-architecture", model: "container", legacyCategory: "container" },
  // Water Treatment Plant
  { slug: "sewage-treatment", label: "Sewage Treatment Plant", blurb: "Instalasi sewage treatment plant (STP).", group: "water-treatment", legacyCategory: "water" },
  { slug: "clean-water-treatment", label: "Clean Water Treatment Plant", blurb: "Instalasi pengolahan air bersih.", group: "water-treatment", legacyCategory: "water" },
  { slug: "waste-water-treatment", label: "Waste Water Treatment Plant", blurb: "Instalasi pengolahan air limbah (WWTP).", group: "water-treatment", legacyCategory: "water" },
  // Storage Tank & Boilers
  { slug: "oil-water-tank", label: "Oil & Water Tank", blurb: "Tangki minyak dan tangki air.", group: "storage-tank-boilers", legacyCategory: "storage-tanks" },
  { slug: "chemical-tank", label: "Chemical Tank", blurb: "Tangki bahan kimia.", group: "storage-tank-boilers", legacyCategory: "storage-tanks" },
  { slug: "filter-tank", label: "Filter Tank", blurb: "Tangki filter.", group: "storage-tank-boilers", legacyCategory: "storage-tanks" },
  { slug: "pressure-tank", label: "Pressure Tank", blurb: "Tangki bertekanan (pressure tank).", group: "storage-tank-boilers", legacyCategory: "storage-tanks" },
  { slug: "boilers", label: "Boilers", blurb: "Instalasi boiler beserta sistem pendukungnya.", group: "storage-tank-boilers", model: "boiler", legacyCategory: "boiler" },
  // Relocation & Dismantling
  { slug: "jacking-rolling", label: "Jacking & Rolling", blurb: "Perpindahan peralatan berat dengan metode jacking dan rolling.", group: "relocation-dismantling", legacyCategory: "relokasi" },
  { slug: "lifting", label: "Lifting", blurb: "Pekerjaan pengangkatan (lifting) peralatan berat.", group: "relocation-dismantling", legacyCategory: "relokasi" },
  // Industrial & Factory
  { slug: "annual-maintenance", label: "Annual Maintenance Periodic", blurb: "Perawatan berkala tahunan (annual maintenance).", group: "industrial-factory", model: "industrial-maintenance", legacyCategory: "industrial-maintenance" },
  { slug: "custom-machine-installation", label: "Installation Custom Machine", blurb: "Instalasi mesin custom.", group: "industrial-factory", model: "industrial-maintenance", legacyCategory: "industrial-maintenance" },
];

export const GROUP_MAP = Object.fromEntries(GROUPS.map((g) => [g.slug, g])) as Record<GroupSlug, GroupInfo>;
export const SERVICE_MAP = Object.fromEntries(SERVICES.map((s) => [s.slug, s])) as Record<ServiceSlug, ServiceInfo>;

export const isGroup = (v: string | null | undefined): v is GroupSlug => !!v && v in GROUP_MAP;
export const isService = (v: string | null | undefined): v is ServiceSlug => !!v && v in SERVICE_MAP;

export const servicesOf = (group: GroupSlug): ServiceInfo[] => SERVICES.filter((s) => s.group === group);

/** Group dari slug group atau slug layanan. */
export function groupOf(slug: string): GroupInfo | undefined {
  if (isGroup(slug)) return GROUP_MAP[slug];
  return isService(slug) ? GROUP_MAP[SERVICE_MAP[slug].group] : undefined;
}

/**
 * Model 3D untuk sebuah layanan atau group: model milik sub-layanan, kalau tidak ada model default group-nya,
 * kalau tidak ada juga maka undefined (tab 3D disembunyikan).
 */
export function resolveModel(slug: string): ModelKey | undefined {
  if (isService(slug)) return SERVICE_MAP[slug].model ?? GROUP_MAP[SERVICE_MAP[slug].group].model;
  return isGroup(slug) ? GROUP_MAP[slug].model : undefined;
}

/** Nilai kolom `category` (lama) untuk layanan utama; dipakai admin saat menyimpan. */
export const legacyCategoryOf = (main: string): CategoryId => (isService(main) ? SERVICE_MAP[main].legacyCategory : "boiler");

/**
 * Tebakan `services` dari `category` lama + nama proyek. HARUS sama dengan aturan backfill di supabase/migrations/004_services.sql.
 * Dipakai untuk proyek yang belum punya `services` (data seed, fallback offline) dan oleh script pembuat SQL seed.
 */
export function legacyToServices(category: string, name: string): ServiceSlug[] {
  const n = name.toLowerCase();
  const has = (re: RegExp) => re.test(n);
  switch (category) {
    case "boiler":
      return ["boilers"];
    case "genset":
      return [has(/pltd|genset|kva/) ? "generator-set-power-plant" : "gas-engine-power-plant"];
    case "piping":
      return ["piping-system"];
    case "relokasi":
      return ["jacking-rolling"];
    case "container":
      return ["container-modification"];
    case "water":
      return ["clean-water-treatment"];
    case "power-plant":
      return [has(/pltu|coal|batu bara/) ? "coal-fired-power-plant" : "generator-set-power-plant"];
    case "electrical-work":
      return [has(/kabel|panel|load bank|\bmv\b|\blv\b/) ? "mv-lv-panel" : "building-factory-lighting"];
    case "civil-steel":
      return [has(/renovasi|gedung/) ? "building" : "steel-structure"];
    case "fire-protection":
      return ["fire-fighting-protection"];
    case "storage-tanks":
      return ["oil-water-tank"];
    case "industrial-maintenance":
      return ["annual-maintenance"];
    case "building-factory":
      return [has(/renovasi/) ? "building" : "custom-machine-installation"];
    default:
      return [];
  }
}
