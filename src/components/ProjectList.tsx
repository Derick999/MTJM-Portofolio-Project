import { CATEGORY_MAP } from "@/lib/categories";
import type { Project } from "@/lib/types";
import { realPhotos } from "@/lib/display";
import { CategoryIcon } from "./CategoryIcon";
import { ProjectPhoto } from "./ProjectPhoto";

interface Props {
  projects: Project[] | null;
  onSelect: (p: Project) => void;
  error?: string | null;
  /** Tampilkan label kategori (dipakai di tab "Semua"). */
  showCategory?: boolean;
  /** Isi pesan saat tidak ada hasil (menyesuaikan filter yang aktif). */
  emptyMessage?: React.ReactNode;
}

export function ProjectList({ projects, onSelect, error, showCategory = false, emptyMessage }: Props) {
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
    <ul className="space-y-3">
      {projects.map((p) => {
        const photo = realPhotos(p)[0];
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
                style={{ color: CATEGORY_MAP[p.category].color, background: `${CATEGORY_MAP[p.category].color}1a` }}
              >
                <CategoryIcon category={p.category} className="h-10 w-10" />
              </span>
            )}
            <span className="min-w-0 flex-1 py-0.5">
              <span className="block line-clamp-2 text-base font-bold leading-tight group-hover:text-accent">
                {p.name}
              </span>
              {showCategory && (
                <span className="block text-xs font-semibold uppercase tracking-wide" style={{ color: CATEGORY_MAP[p.category].color }}>
                  {CATEGORY_MAP[p.category].label}
                </span>
              )}
              {(p.client || !showCategory) && (
                <span className="block truncate text-sm text-muted">{p.client || CATEGORY_MAP[p.category].label}</span>
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
