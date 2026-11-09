import Link from "next/link";
import type { LatestProject } from "@/lib/home-server";
import { ProjectPhoto } from "@/components/ProjectPhoto";

/**
 * Kartu "Proyek terbaru" di pojok kanan bawah hero (desktop saja). Hanya tampil bila ada minimal 1 proyek dengan FOTO ASLI
 * (placeholder tidak dihitung). Klik membuka detail proyek di halaman Cari Proyek. Data dihitung di server (maks 3).
 */
export function HeroLatest({ latest }: { latest: LatestProject[] }) {
  if (!latest.length) return null;
  return (
    <aside aria-label="Proyek terbaru" className="absolute bottom-6 right-4 z-10 hidden w-72 space-y-2 lg:block">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">Proyek terbaru</p>
      {latest.map((p) => (
        <Link
          key={p.slug}
          href={`/proyek?p=${p.slug}`}
          className="flex w-full items-center gap-3 rounded-xl border border-white/20 bg-white/95 p-2 text-left text-navy shadow-lg transition hover:bg-white"
        >
          <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            <ProjectPhoto src={p.photo} alt="" sizes="80px" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{p.name}</span>
            <span className="block truncate text-xs text-muted">
              {p.label} &middot; {p.city}
            </span>
          </span>
        </Link>
      ))}
    </aside>
  );
}
