"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_MAP, isCategory, type CategoryId } from "@/lib/categories";
import { applyFilters, EMPTY_FILTERS, hasActiveFilters, SORT_OPTIONS, sortProjects, type Filters, type SortKey } from "@/lib/filters";
import { usePublicProjects } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { FilterBar } from "@/components/FilterBar";
import { ModelViewer } from "@/components/ModelViewer";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectList } from "@/components/ProjectList";
import { projectsAtPoint, type MapPoint } from "@/components/MapView";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" role="status" aria-label="Memuat peta" />,
});

const tabCls = (on: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition ${
    on ? "border-accent bg-accent text-white" : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
  }`;
const linkBtn = "inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 hover:text-navy";

export function Dashboard() {
  const { projects, error } = usePublicProjects();
  // Satu set filter dipakai peta dan daftar kategori, jadi keduanya selalu sinkron.
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [lastCategory, setLastCategory] = useState<CategoryId>("boiler"); // model 3D saat tab "Semua"
  const [sort, setSort] = useState<SortKey>("tahun-baru");
  const [selected, setSelected] = useState<Project | null>(null);
  // Pilihan sementara dari peta. Provinsi yang punya proyek langsung menjadi filter provinsi (dropdown ikut berubah).
  const [point, setPoint] = useState<MapPoint | null>(null);
  const [emptyProvince, setEmptyProvince] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  // Beri tahu header bahwa detail proyek terbuka (menu "Proyek" jadi aktif).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mtjm:detail", { detail: selected !== null }));
  }, [selected]);

  // Tautan seperti /#peta atau /proyek (dialihkan ke /#proyek) harus mendarat di bagiannya, bukan di puncak halaman.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "instant" }), 150);
    return () => window.clearTimeout(t);
  }, []);

  const modelCategory = filters.category || lastCategory;
  const cat = CATEGORY_MAP[modelCategory];

  // Baca ?k=kategori&p=slug dari URL (untuk link yang bisa dibagikan).
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("k");
    if (isCategory(k)) {
      setLastCategory(k);
      setFilters((f) => ({ ...f, category: k }));
    }
  }, []);
  useEffect(() => {
    if (!projects) return;
    const slug = new URLSearchParams(window.location.search).get("p");
    const hit = slug ? projects.find((p) => p.slug === slug) : undefined;
    if (hit) {
      setLastCategory(hit.category);
      setSelected(hit);
    }
  }, [projects]);

  const syncUrl = useCallback((k: CategoryId | "", p?: string) => {
    const q = new URLSearchParams();
    if (k) q.set("k", k);
    if (p) q.set("p", p);
    const s = q.toString();
    window.history.replaceState(null, "", s ? `/?${s}` : window.location.pathname);
  }, []);

  const clearMapPick = () => {
    if (!point && !emptyProvince) return;
    setPoint(null);
    setEmptyProvince(null);
    setResetKey((k) => k + 1);
  };
  const changeFilters = (f: Filters) => {
    clearMapPick();
    setFilters(f);
    if (f.category) setLastCategory(f.category);
    syncUrl(f.category);
  };
  const resetFilters = () => changeFilters(EMPTY_FILTERS);
  const showAllLocations = () => {
    setPoint(null);
    setEmptyProvince(null);
    setFilters((f) => ({ ...f, province: "", city: "" }));
    setResetKey((k) => k + 1);
  };

  /** Klik provinsi di peta: jadikan filter provinsi (klik lagi untuk membatalkan). */
  const pickProvince = (names: string[]) => {
    const target = projects && names.find((n) => projects.some((p) => p.province === n));
    if (!target) {
      setPoint(null);
      setEmptyProvince(names[0]);
      return;
    }
    const already = filters.province === target && !filters.city;
    changeFilters({ ...filters, province: already ? "" : target, city: "" });
  };

  const open = (p: Project) => {
    setSelected(p);
    syncUrl(filters.category, p.slug);
  };
  const close = useCallback(() => {
    setSelected(null);
    syncUrl(filters.category);
  }, [filters.category, syncUrl]);

  const filtered = useMemo(() => (projects ? applyFilters(projects, filters) : null), [projects, filters]);
  const sorted = useMemo(() => (filtered ? sortProjects(filtered, sort) : null), [filtered, sort]);
  const countsByCategory = useMemo(() => {
    const base = projects ? applyFilters(projects, { ...filters, category: "" }) : [];
    return new Map(CATEGORIES.map((c) => [c.id, base.filter((p) => p.category === c.id).length]));
  }, [projects, filters]);

  const panelProjects = useMemo(() => {
    if (!filtered) return null;
    if (point) return sortProjects(projectsAtPoint(point, filtered), "tahun-baru");
    if (emptyProvince) return [];
    return sortProjects(filtered, "tahun-baru");
  }, [filtered, point, emptyProvince]);

  const active = hasActiveFilters(filters);
  const hasLocation = Boolean(point || emptyProvince || filters.province || filters.city);
  const panelTitle = point?.title ?? emptyProvince ?? (filters.city || filters.province || "Semua lokasi");

  // Pesan saat hasil kosong mengikuti kondisi yang sedang aktif.
  const emptyMessage =
    emptyProvince && !point ? (
      <>
        Belum ada proyek di {emptyProvince}.{" "}
        <button type="button" onClick={showAllLocations} className={linkBtn}>
          Lihat semua lokasi
        </button>
      </>
    ) : active ? (
      <>
        Tidak ada proyek yang cocok dengan filter yang dipilih.{" "}
        <button type="button" onClick={resetFilters} className={linkBtn}>
          Reset filter
        </button>
      </>
    ) : (
      "Belum ada proyek untuk ditampilkan."
    );

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
          <FilterBar projects={projects ?? []} value={filters} onChange={changeFilters} count={filtered?.length ?? 0} showCategory />
        </div>

        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Legenda kategori">
          {CATEGORIES.map((c) => {
            const on = filters.category === c.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => changeFilters({ ...filters, category: on ? "" : c.id })}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                    on ? "border-accent bg-accent/10 text-ink" : "border-line bg-surface text-muted hover:border-accent"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full border border-white shadow-[0_0_0_1px_rgb(20_20_74/0.35)]" style={{ background: c.color }} aria-hidden />
                  {c.label}
                  <span className="text-muted">{countsByCategory.get(c.id)}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative isolate z-0 h-[380px] overflow-hidden rounded-2xl border border-line bg-surface shadow-sm sm:h-[520px]">
            <MapView
              projects={filtered ?? []}
              provinceFilter={filters.province}
              point={point}
              onPoint={(p) => {
                setEmptyProvince(null);
                setPoint(p);
              }}
              onProvince={pickProvince}
              fitToResults={active}
              resetKey={resetKey}
            />
          </div>

          <aside aria-label="Daftar proyek di peta" className="flex max-h-[520px] min-h-[220px] flex-col rounded-2xl border border-line bg-surface shadow-sm">
            <div className="flex items-start justify-between gap-2 border-b border-line p-3">
              <div className="min-w-0 py-1">
                <h3 className="truncate text-base font-semibold">{panelTitle}</h3>
                <p className="text-xs text-muted" aria-live="polite">
                  {panelProjects ? `${panelProjects.length} proyek` : "Memuat..."}
                </p>
              </div>
              {hasLocation && (
                <button type="button" className="btn btn-outline shrink-0 text-xs" onClick={showAllLocations}>
                  Tampilkan semua lokasi
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ProjectList projects={panelProjects} onSelect={open} error={error} showCategory emptyMessage={emptyMessage} />
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
          <button role="tab" aria-selected={!filters.category} onClick={() => changeFilters({ ...filters, category: "" })} className={tabCls(!filters.category)}>
            Semua {projects && <span className="ml-1 opacity-80">{applyFilters(projects, { ...filters, category: "" }).length}</span>}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} role="tab" aria-selected={filters.category === c.id} onClick={() => changeFilters({ ...filters, category: c.id })} className={tabCls(filters.category === c.id)}>
              {c.label} <span className="ml-1 opacity-80">{countsByCategory.get(c.id)}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
          <div className="h-[330px] sm:h-[430px] lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)] lg:max-h-[650px]">
            <ModelViewer category={modelCategory} label={cat.label} />
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
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
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
                <strong className="text-ink">{sorted?.length ?? 0}</strong> proyek &middot; filter lokasi dan tahun mengikuti peta di atas
              </span>
              {active && (
                <button type="button" onClick={resetFilters} className={linkBtn}>
                  Reset filter
                </button>
              )}
            </p>
            <ProjectList projects={sorted} onSelect={open} error={error} showCategory={!filters.category} emptyMessage={emptyMessage} />
          </div>
        </div>
      </section>

      {selected && <ProjectDetail project={selected} onClose={close} />}
    </>
  );
}
