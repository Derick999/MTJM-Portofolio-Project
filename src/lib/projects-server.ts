import { seedProjects } from "@/data/seed";
import { seedCategoryProjects } from "@/data/seed-categories";
import { fromRow, PROJECT_SELECT, type ProjectRow } from "./project-rows";
import type { Project } from "./types";

/**
 * Ambil SEMUA proyek published sekali di server (jumlahnya kecil), lalu dikirim ke klien sebagai JSON ringan; filter dan hitung
 * jumlah dilakukan di klien. Tanpa Supabase: data contoh. Gagal/timeout: null (klien mencoba mengambil sendiri).
 */
export async function fetchProjectsServer(): Promise<Project[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [...seedProjects(), ...seedCategoryProjects()].filter((p) => p.status_data === "published");
  try {
    const res = await fetch(
      `${url}/rest/v1/projects?select=${encodeURIComponent(PROJECT_SELECT)}&status_data=eq.published&order=year.desc,created_at.desc`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) throw new Error(String(res.status));
    return ((await res.json()) as ProjectRow[]).map(fromRow);
  } catch {
    return null;
  }
}
