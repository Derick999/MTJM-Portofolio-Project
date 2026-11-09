"use client";

import { useMemo } from "react";
import { CATEGORIES, visibleCategories, type CategoryId } from "@/config/categories";
import { applyFilters, EMPTY_FILTERS, filterOptions, hasActiveFilters, type Filters } from "@/lib/filters";
import type { Project } from "@/lib/types";

interface Props {
  projects: Project[];
  value: Filters;
  onChange: (f: Filters) => void;
  count: number;
  /** Di beranda kategori dipilih lewat tab, jadi dropdown kategori disembunyikan. */
  showCategory?: boolean;
  /** Kelas grid kolom (bawaan 5 kolom di desktop; panel sempit memakai lebih sedikit). */
  gridClass?: string;
}

const selectCls =
  "min-h-11 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink disabled:bg-surface-2 disabled:opacity-60";

export function FilterBar({ projects, value, onChange, count, showCategory = true, gridClass = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" }: Props) {
  const opts = useMemo(() => filterOptions(projects, value), [projects, value]);
  const active = hasActiveFilters(value, !showCategory);
  // daftar kategori sama dengan tab; angka mengikuti filter lain, kategori kosong disembunyikan
  const totals = useMemo(() => new Map<CategoryId, number>(CATEGORIES.map((c) => [c.id, projects.filter((p) => p.category === c.id).length])), [projects]);
  const counts = useMemo(() => {
    const base = applyFilters(projects, { ...value, category: "" });
    return new Map<CategoryId, number>(CATEGORIES.map((c) => [c.id, base.filter((p) => p.category === c.id).length]));
  }, [projects, value]);

  return (
    <form
      className={`grid gap-2 ${gridClass}`}
      aria-label="Filter proyek"
      onSubmit={(e) => e.preventDefault()}
    >
      {showCategory && (
        <label className="text-xs text-muted">
          Kategori
          <select
            className={selectCls}
            value={value.category}
            onChange={(e) => onChange({ ...value, category: e.target.value as Filters["category"] })}
          >
            <option value="">Semua kategori</option>
            {visibleCategories(totals, value.category).map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} ({counts.get(c.id) ?? 0})
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="text-xs text-muted">
        Provinsi
        <select
          className={selectCls}
          value={value.province}
          onChange={(e) => onChange({ ...value, province: e.target.value, city: "" })}
        >
          <option value="">Semua provinsi</option>
          {opts.provinces.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted">
        Kota / Kabupaten
        <select
          className={selectCls}
          value={value.city}
          disabled={!value.province}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        >
          <option value="">{value.province ? "Semua kota" : "Pilih provinsi dulu"}</option>
          {value.province && opts.cities.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="text-xs text-muted">
        Tahun
        <select className={selectCls} value={value.year} onChange={(e) => onChange({ ...value, year: e.target.value })}>
          <option value="">Semua tahun</option>
          {opts.years.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </label>
      <div className="col-span-2 flex items-end justify-between gap-2 sm:col-span-1">
        <p className="pb-2 text-sm text-muted" aria-live="polite">
          <strong className="text-ink">{count}</strong> proyek
        </p>
        <button
          type="button"
          disabled={!active}
          onClick={() => onChange({ ...EMPTY_FILTERS, category: showCategory ? "" : value.category })}
          className="btn btn-outline !px-4 !py-2 disabled:opacity-40"
        >
          Reset filter
        </button>
      </div>
    </form>
  );
}
