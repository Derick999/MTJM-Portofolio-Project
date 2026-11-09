import type { Project } from "@/lib/types";
import { publicClient, realPhotos } from "@/lib/display";
import { projectLabelColor } from "@/lib/service-display";
import { CategoryIcon } from "./CategoryIcon";
import { ProjectPhoto } from "./ProjectPhoto";

interface Props {
  projects: Project[] | null;
  onSelect: (p: Project) => void;
  error?: string | null;
  /** Tampilkan label kategori (dipakai di tab "Semua"). */
  showCategory?: boolean;
  /** Tata letak grid beberapa kolom (halaman pencarian), bukan satu kolom. */
  grid?: boolean;
  /** Isi pesan saat tidak ada hasil (menyesuaikan filter yang aktif). */
  emptyMessage?: React.ReactNode;
}

export function ProjectList({ projects, onSelect, error, showCategory = false, grid = false, emptyMessage }: Props) {
  if (error) return <p className="rounded border border-danger/50 bg-danger/10 p-4 text-sm">{error}</p>;

  if (!projects) {
    return (
      <ul className="space-y-3" aria-busy="true" aria-label="Memuat proyek">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="skeleton h-24 rounded-lg" />
        ))}
      </ul>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">
        {emptyMessage ?? "Belum ada proyek untuk ditampilkan."}
      </div>
    );
  }

  return (
    <ul className={grid ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
      {projects.map((p) => {
        const photo = realPhotos(p)[0];
        const sd = projectLabelColor(p);
        return (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => onSelect(p)}
            className="group flex w-full gap-3 rounded-lg border border-line bg-surface p-2 text-left transition hover:border-accent"
          >
            {photo ? (
              <span className="relative h-20 w-28 shrink-0 overflow-hidden rounded bg-surface-2">
                <ProjectPhoto src={photo} alt="" sizes="112px" />
              </span>
            ) : (
              <span
                className="grid h-20 w-20 shrink-0 place-items-center rounded"
                style={{ color: sd.color, background: `${sd.color}1a` }}
              >
                <CategoryIcon category={p.category} className="h-10 w-10" />
              </span>
            )}
            <span className="min-w-0 flex-1 py-0.5">
              <span className="block line-clamp-2 text-base font-bold leading-tight group-hover:text-accent">
                {p.name}
              </span>
              {showCategory && (
                <span className="block text-xs font-semibold uppercase tracking-wide" style={{ color: sd.color }}>
                  {sd.label}
                </span>
              )}
              {(publicClient(p) || !showCategory) && (
                <span className="block truncate text-sm text-muted">{publicClient(p) || sd.label}</span>
              )}
              <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                <span>{p.year}</span>
                <span className="truncate">
                  {p.city}, {p.province}
                </span>
              </span>
            </span>
          </button>
        </li>
        );
      })}
    </ul>
  );
}
