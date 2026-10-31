import { SITE } from "@/config/site";
import type { SiteStat } from "./stats";

/**
 * Ambil angka statistik di server supaya ikut ter-render di HTML awal (tanpa kilatan "0+").
 * Gagal/kosong -> nilai awal dari config, dan klien mencoba mengambil sendiri.
 */
export async function fetchStatsServer(): Promise<{ stats: SiteStat[]; fromServer: boolean }> {
  const defaults = SITE.statsDefaults;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { stats: defaults, fromServer: true };
  try {
    const res = await fetch(`${url}/rest/v1/site_stats?select=key,value,label`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const rows = (await res.json()) as SiteStat[];
    const byKey = new Map(rows.map((r) => [r.key, r]));
    return { stats: defaults.map((d) => byKey.get(d.key) ?? d), fromServer: true };
  } catch {
    return { stats: defaults, fromServer: false };
  }
}
