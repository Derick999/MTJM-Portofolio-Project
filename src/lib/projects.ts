"use client";

import { useEffect, useState } from "react";
import { seedProjects } from "@/data/seed";
import { seedCategoryProjects } from "@/data/seed-categories";
import { legacyToServices } from "@/config/services";
import { getSupabase } from "./supabase";
import type { Project } from "./types";

interface Row extends Omit<Project, "photos"> {
  project_photos: { url: string; sort_order: number }[] | null;
}

function fromRow(r: Row): Project {
  const { project_photos, ...rest } = r;
  return {
    ...rest,
    // proyek yang belum di-backfill (migrasi 004 belum dijalankan) memakai tebakan dari category lama
    services: rest.services?.length ? rest.services : legacyToServices(rest.category, rest.name),
    photos: (project_photos ?? []).sort((a, b) => a.sort_order - b.sort_order).map((p) => p.url),
  };
}

/** Ambil proyek. Publik hanya melihat yang published (dijaga RLS); admin melihat semuanya. */
export async function fetchProjects(): Promise<Project[]> {
  const sb = getSupabase();
  if (!sb) return [...seedProjects(), ...seedCategoryProjects()];
  const { data, error } = await sb
    .from("projects")
    .select("*, project_photos(url, sort_order)")
    .order("year", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(fromRow);
}

// Hook publik berbagi satu permintaan (hero dan penjelajah tidak mengambil data dua kali). Admin memakai fetchProjects langsung.
let publicCache: Promise<Project[]> | null = null;
function fetchPublicOnce(): Promise<Project[]> {
  publicCache ??= fetchProjects().then((all) => all.filter((p) => p.status_data === "published"));
  publicCache.catch(() => (publicCache = null));
  return publicCache;
}

export function usePublicProjects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchPublicOnce()
      .then((all) => alive && setProjects(all))
      .catch(() => alive && setError("Data proyek gagal dimuat. Coba muat ulang halaman."));
    return () => {
      alive = false;
    };
  }, []);

  return { projects, error };
}
