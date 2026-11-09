"use client";

import { useMemo } from "react";
import { CATEGORY_MAP } from "@/lib/categories";
import { realPhotos } from "@/lib/display";
import { usePublicProjects } from "@/lib/projects";
import { ProjectPhoto } from "@/components/ProjectPhoto";

/**
 * Kartu "Proyek terbaru" di pojok kanan bawah hero (desktop saja). Hanya tampil bila ada minimal 1 proyek dengan FOTO ASLI
 * (placeholder tidak dihitung). Klik membuka drawer detail proyek (lewat event yang didengar penjelajah proyek).
 */
export function HeroLatest() {
  const { projects } = usePublicProjects();
  const latest = useMemo(
    () =>
      (projects ?? [])
        .filter((p) => realPhotos(p).length > 0)
        .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.year - a.year)
        .slice(0, 3),
    [projects],
  );
  if (!latest.length) return null;

  return (
    <aside aria-label="Proyek terbaru" className="absolute bottom-6 right-4 z-10 hidden w-72 space-y-2 lg:block">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">Proyek terbaru</p>
      {latest.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("mtjm:open-project", { detail: p.slug }))}
          className="flex w-full items-center gap-3 rounded-xl border border-white/20 bg-white/95 p-2 text-left text-navy shadow-lg transition hover:bg-white"
        >
          <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            <ProjectPhoto src={realPhotos(p)[0]} alt="" sizes="80px" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{p.name}</span>
            <span className="block truncate text-xs text-muted">
              {CATEGORY_MAP[p.category].short} &middot; {p.city}
            </span>
          </span>
        </button>
      ))}
    </aside>
  );
}
