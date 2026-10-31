"use client";

import type { ReactNode } from "react";
import { CATEGORIES, CATEGORY_MAP, type CategoryId } from "@/lib/categories";
import { applyFilters, SORT_OPTIONS, type Filters, type SortKey } from "@/lib/filters";
import type { Project } from "@/lib/types";
import { FilterBar } from "@/components/FilterBar";
import { ProjectList } from "@/components/ProjectList";

export const tabCls = (on: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
    on ? "border-accent bg-accent text-white" : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
  }`;
export const linkBtn = "inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 hover:text-navy";

export interface DashboardViewProps {
  /** Semua proyek (untuk opsi filter dan angka di tab). null = masih memuat. */
  projects: Project[] | null;
  error?: string | null;
  filters: Filters;
  onFilters: (f: Filters) => void;
  sort: SortKey;
  onSort: (k: SortKey) => void;
  /** Jumlah proyek yang lolos filter (ditampilkan di FilterBar). */
  filteredCount: number;
  countsByCategory: Map<CategoryId, number>;
  /** Kategori yang modelnya sedang tampil (tab "Semua" memakai kategori terakhir). */
  modelCategory: CategoryId;
  /** Panel daftar proyek di samping peta. */
  panel: { title: string; projects: Project[] | null; hasLocation: boolean; onShowAll: () => void };
  /** Daftar proyek di bagian "Proyek per Kategori" (sudah diurutkan). */
  sorted: Project[] | null;
  /** Ada filter aktif? */
  active: boolean;
  onReset: () => void;
  emptyMessage: ReactNode;
  onOpen: (p: Project) => void;
  /** Peta (MapView di web; peta berbasis frame di video). */
  map: ReactNode;
  /** Viewer 3D (ModelViewer di web; viewer berbasis frame di video). */
  viewer: ReactNode;
  /** Opsional: isi panel samping menggantikan ProjectList bawaan (video memakainya untuk transisi daftar). */
  panelBody?: ReactNode;
}

/**
 * Tampilan dashboard beranda (bagian peta + proyek per kategori) tanpa state. Dipakai bersama oleh web (Dashboard.tsx)
 * dan video promosi (video/src/web), supaya tampilannya identik.
 */
export function DashboardView(p: DashboardViewProps) {
  const { projects, filters, panel } = p;
  const cat = CATEGORY_MAP[p.modelCategory];
  return (
    <>
      {/* ===== PETA ===== */}
      <section id="peta" aria-labelledby="judul-peta" className="mx-auto mt-12 max-w-7xl px-4">
        <h2 id="judul-peta" className="text-2xl font-bold sm:text-3xl">
          Peta <span className="text-accent">Persebaran Proyek</span>
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Klik titik atau provinsi untuk melihat proyek di lokasi tersebut. Gunakan filter untuk mempersempit tampilan.
        </p>

        <div className="mt-4">
          <FilterBar projects={projects ?? []} value={filters} onChange={p.onFilters} count={p.filteredCount} showCategory />
        </div>

        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Legenda kategori">
          {CATEGORIES.map((c) => {
            const on = filters.category === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => p.onFilters({ ...filters, category: on ? "" : c.id })}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                    on ? "border-accent bg-accent/10 text-ink" : "border-line bg-surface text-muted hover:border-accent"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full border border-white shadow-[0_0_0_1px_rgb(20_20_74/0.35)]" style={{ background: c.color }} aria-hidden />
                  {c.label}
                  <span className="text-muted">{p.countsByCategory.get(c.id)}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div data-metric="map" className="relative isolate z-0 h-[380px] overflow-hidden rounded-2xl border border-line bg-surface shadow-sm sm:h-[520px]">
            {p.map}
          </div>

          <aside data-metric="panel" aria-label="Daftar proyek di peta" className="flex max-h-[520px] min-h-[220px] flex-col rounded-2xl border border-line bg-surface shadow-sm">
            <div className="flex items-start justify-between gap-2 border-b border-line p-3">
              <div className="min-w-0 py-1">
                <h3 className="truncate text-base font-semibold">{panel.title}</h3>
                <p className="text-xs text-muted" aria-live="polite">
                  {panel.projects ? `${panel.projects.length} proyek` : "Memuat..."}
                </p>
              </div>
              {panel.hasLocation && (
                <button type="button" data-metric="btn-show-all" className="btn btn-outline shrink-0 text-xs" onClick={panel.onShowAll}>
                  Tampilkan semua lokasi
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {p.panelBody ?? <ProjectList projects={panel.projects} onSelect={p.onOpen} error={p.error} showCategory emptyMessage={p.emptyMessage} />}
            </div>
          </aside>
        </div>
      </section>

      {/* ===== PROYEK PER KATEGORI ===== */}
      <section id="proyek" aria-labelledby="judul-proyek" className="mx-auto mt-14 max-w-7xl px-4">
        <h2 id="judul-proyek" className="text-2xl font-bold sm:text-3xl">
          Proyek <span className="text-accent">per Kategori</span>
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Pilih kategori untuk melihat ilustrasi 3D dan daftar proyek yang sudah kami kerjakan.
        </p>

        <div role="tablist" aria-label="Kategori proyek" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2">
          <button role="tab" aria-selected={!filters.category} onClick={() => p.onFilters({ ...filters, category: "" })} className={tabCls(!filters.category)}>
            Semua {projects && <span className="ml-1 opacity-80">{applyFilters(projects, { ...filters, category: "" }).length}</span>}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} role="tab" aria-selected={filters.category === c.id} onClick={() => p.onFilters({ ...filters, category: c.id })} className={tabCls(filters.category === c.id)}>
              {c.label} <span className="ml-1 opacity-80">{p.countsByCategory.get(c.id)}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
          <div data-metric="viewer" className="h-[330px] sm:h-[430px] lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)] lg:max-h-[650px]">
            {p.viewer}
          </div>
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-xl font-bold" style={{ color: filters.category ? cat.color : undefined }}>
                  {filters.category ? cat.label : "Semua proyek"}
                </h3>
                <p className="mb-3 text-sm text-muted">
                  {filters.category ? cat.blurb : "Seluruh kategori. Urutkan per tahun, kategori, atau lokasi."}
                </p>
              </div>
              <label className="shrink-0 text-xs text-muted">
                Urutkan
                <select
                  className="mt-0.5 block min-h-11 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
                  value={p.sort}
                  onChange={(e) => p.onSort(e.target.value as SortKey)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mb-3 flex flex-wrap items-center gap-x-3 text-xs text-muted" aria-live="polite">
              <span>
                <strong className="text-ink">{p.sorted?.length ?? 0}</strong> proyek &middot; filter lokasi dan tahun mengikuti peta di atas
              </span>
              {p.active && (
                <button type="button" onClick={p.onReset} className={linkBtn}>
                  Reset filter
                </button>
              )}
            </p>
            <ProjectList projects={p.sorted} onSelect={p.onOpen} error={p.error} showCategory={!filters.category} emptyMessage={p.emptyMessage} />
          </div>
        </div>
      </section>
    </>
  );
}
