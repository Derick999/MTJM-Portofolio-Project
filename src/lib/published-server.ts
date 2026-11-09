import { unstable_cache } from "next/cache";
import { GROUPS, SERVICES, legacyToServices } from "@/config/services";
import { seedProjects } from "@/data/seed";
import { seedCategoryProjects } from "@/data/seed-categories";
import { matchesService } from "./filters";

/** Baris proyek published yang ringan (tanpa deskripsi) untuk beranda, navbar, dan indeks pencarian. */
export interface PublishedRow {
  slug: string;
  name: string;
  client: string;
  city: string;
  province: string;
  year: number;
  created_at: string;
  category: string;
  services: string[];
  photos: string[];
}

interface RawRow extends Omit<PublishedRow, "services" | "photos"> {
  services?: string[] | null;
  project_photos: { url: string; sort_order: number }[] | null;
}

const COLUMNS = "slug,name,client,city,province,year,created_at,category,services,project_photos(url,sort_order)";

const normalize = (r: RawRow): PublishedRow => {
  const { project_photos, services, ...rest } = r;
  return {
    ...rest,
    services: services?.length ? services : (legacyToServices(r.category, r.name) as string[]),
    photos: (project_photos ?? []).sort((a, b) => a.sort_order - b.sort_order).map((p) => p.url),
  };
};

async function loadPublished(): Promise<PublishedRow[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return [...seedProjects(), ...seedCategoryProjects()]
      .filter((p) => p.status_data === "published")
      .map((p) => normalize({ ...p, project_photos: p.photos.map((u, i) => ({ url: u, sort_order: i })) }));
  }
  const get = (columns: string) =>
    fetch(`${url}/rest/v1/projects?select=${encodeURIComponent(columns)}&status_data=eq.published`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
  try {
    let res = await get(COLUMNS);
    // kolom `services` belum ada (migrasi 004 belum dijalankan): ambil tanpa kolom itu, layanan diturunkan dari category lama
    if (res.status === 400) res = await get(COLUMNS.replace("services,", ""));
    if (!res.ok) throw new Error(String(res.status));
    return ((await res.json()) as RawRow[]).map(normalize);
  } catch {
    // Jangan menyimpan kegagalan di cache: lempar agar unstable_cache tidak menyimpannya
    throw new Error("published fetch failed");
  }
}

const cached = unstable_cache(loadPublished, ["published-projects"], { revalidate: 60, tags: ["projects"] });

/** Semua proyek published (ringan), di-cache 60 detik dan dipakai bersama beranda, navbar, dan pencarian. null bila gagal. */
export async function getPublished(): Promise<PublishedRow[] | null> {
  try {
    return await cached();
  } catch {
    return null;
  }
}

/** Jumlah proyek published per sub-layanan dan per group (cache 60 detik). null bila data gagal dimuat. */
export async function getServiceCounts(): Promise<Record<string, number> | null> {
  const rows = await getPublished();
  if (!rows) return null;
  const counts: Record<string, number> = {};
  for (const sv of SERVICES) counts[sv.slug] = rows.filter((r) => r.services.includes(sv.slug)).length;
  for (const g of GROUPS) counts[g.slug] = rows.filter((r) => matchesService(r, g.slug)).length;
  return counts;
}
