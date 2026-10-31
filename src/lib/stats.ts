"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/config/site";
import { getSupabase } from "./supabase";

export interface SiteStat {
  key: string;
  value: number;
  label: string;
}

export const STAT_KEYS = SITE.statsDefaults.map((s) => s.key);

/** Ambil angka dari database; bila gagal/kosong, pakai nilai awal dari config. */
export async function fetchStats(): Promise<SiteStat[]> {
  const defaults = SITE.statsDefaults;
  const sb = getSupabase();
  if (!sb) return defaults;
  const { data, error } = await sb.from("site_stats").select("key, value, label");
  if (error || !data?.length) return defaults;
  const byKey = new Map((data as SiteStat[]).map((s) => [s.key, s]));
  return defaults.map((d) => byKey.get(d.key) ?? d);
}

/**
 * Angka statistik untuk beranda. `initial` datang dari server (ikut ter-render di HTML awal);
 * klien hanya mengambil sendiri bila server tidak berhasil mengambilnya.
 */
export function useSiteStats(initial?: SiteStat[], serverOk = false) {
  const [stats, setStats] = useState<SiteStat[]>(initial ?? SITE.statsDefaults);
  const [loading, setLoading] = useState(!serverOk);
  useEffect(() => {
    if (serverOk) return;
    let alive = true;
    fetchStats()
      .then((s) => alive && setStats(s))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [serverOk]);
  return { stats, loading };
}

export async function saveStats(values: Record<string, number>): Promise<void> {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase belum disambungkan.");
  const rows = SITE.statsDefaults.map((d) => ({
    key: d.key,
    label: d.label,
    value: Math.max(0, Math.round(values[d.key] ?? d.value)),
    updated_at: new Date().toISOString(),
  }));
  const { error } = await sb.from("site_stats").upsert(rows, { onConflict: "key" });
  if (error) throw new Error("Angka statistik gagal disimpan. Pastikan SQL 002_site_stats.sql sudah dijalankan di Supabase dan Anda masuk sebagai admin.");
}
