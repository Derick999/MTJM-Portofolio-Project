"use client";

import { useEffect, useState } from "react";
import { seedProjects } from "@/data/seed";
import { seedCategoryProjects } from "@/data/seed-categories";
import { getSupabase } from "./supabase";
import { fromRow, PROJECT_SELECT, type ProjectRow } from "./project-rows";
import type { Project } from "./types";

/** Ambil proyek. Publik hanya melihat yang published (dijaga RLS); admin melihat semuanya. */
export async function fetchProjects(): Promise<Project[]> {
  const sb = getSupabase();
  if (!sb) return [...seedProjects(), ...seedCategoryProjects()];
  const { data, error } = await sb
    .from("projects")
    .select(PROJECT_SELECT)
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProjectRow[]).map(fromRow);
}

// Hook publik berbagi satu permintaan (hero dan penjelajah tidak mengambil data dua kali). Admin memakai fetchProjects langsung.
let publicCache: Promise<Project[]> | null = null;
function fetchPublicOnce(): Promise<Project[]> {
  publicCache ??= fetchProjects().then((all) => all.filter((p) => p.status_data === "published"));
  publicCache.catch(() => (publicCache = null));
  return publicCache;
}

/** Proyek published. `initial` = data dari server (tanpa permintaan lagi); null/undefined = ambil sendiri di klien. */
export function usePublicProjects(initial?: Project[] | null) {
  const [projects, setProjects] = useState<Project[] | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) return;
    let alive = true;
    fetchPublicOnce()
      .then((all) => alive && setProjects(all))
      .catch(() => alive && setError("Data proyek gagal dimuat. Coba muat ulang halaman."));
    return () => {
      alive = false;
    };
  }, [initial]);

  return { projects, error };
}
