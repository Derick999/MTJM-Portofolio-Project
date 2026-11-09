import { GROUPS } from "@/config/services";
import { realPhotos } from "./display";
import { matchesService } from "./filters";
import { getPublished, getServiceCounts, type PublishedRow } from "./published-server";
import { projectLabelColor } from "./service-display";

/** Proyek terbaru berfoto asli untuk hero (hanya data yang dibutuhkan, bukan seluruh proyek). */
export interface LatestProject {
  slug: string;
  name: string;
  city: string;
  label: string;
  photo: string;
}

/** Sampul kartu group: foto asli proyek terbaru dari group itu, dengan nama dan slug untuk keterangan/tautan. */
export interface GroupCover {
  url: string;
  slug: string;
  name: string;
}

export interface HomeSummary {
  /** Jumlah proyek published per sub-layanan dan per group (dari getServiceCounts, cache 60 detik). */
  counts: Record<string, number> | null;
  covers: Record<string, GroupCover | undefined>;
  latest: LatestProject[];
}

const recent = (a: PublishedRow, b: PublishedRow) => b.created_at.localeCompare(a.created_at) || b.year - a.year;

/**
 * Ringkasan ringan untuk beranda, dihitung di server dari data cache bersama: jumlah per layanan, sampul kartu group, dan 3 proyek
 * terbaru berfoto. Seluruh data proyek TIDAK dikirim ke klien di beranda. Gagal: counts null (kartu tetap tampil).
 */
export async function fetchHomeSummary(): Promise<HomeSummary> {
  const [rows, counts] = await Promise.all([getPublished(), getServiceCounts()]);
  const withPhoto = (rows ?? []).filter((r) => realPhotos(r).length > 0).sort(recent);
  const covers: HomeSummary["covers"] = {};
  for (const g of GROUPS) {
    const hit = withPhoto.find((r) => matchesService(r, g.slug));
    covers[g.slug] = hit ? { url: realPhotos(hit)[0], slug: hit.slug, name: hit.name } : undefined;
  }
  const latest = withPhoto.slice(0, 3).map((r) => ({
    slug: r.slug,
    name: r.name,
    city: r.city,
    label: projectLabelColor({ services: r.services, category: r.category as never }).label,
    photo: realPhotos(r)[0],
  }));
  return { counts, covers, latest };
}
