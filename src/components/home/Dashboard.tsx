"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_MAP, isCategory, type CategoryId } from "@/lib/categories";
import { applyFilters, EMPTY_FILTERS, hasActiveFilters, sortProjects, type Filters, type SortKey } from "@/lib/filters";
import { usePublicProjects } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { ModelViewer } from "@/components/ModelViewer";
import { ProjectDetail } from "@/components/ProjectDetail";
import { DashboardView, linkBtn } from "./DashboardView";
import { projectsAtPoint, type MapPoint } from "@/components/MapView";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" role="status" aria-label="Memuat peta" />,
});

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
      <DashboardView
        projects={projects}
        error={error}
        filters={filters}
        onFilters={changeFilters}
        sort={sort}
        onSort={setSort}
        filteredCount={filtered?.length ?? 0}
        countsByCategory={countsByCategory}
        modelCategory={modelCategory}
        panel={{ title: panelTitle, projects: panelProjects, hasLocation, onShowAll: showAllLocations }}
        sorted={sorted}
        active={active}
        onReset={resetFilters}
        emptyMessage={emptyMessage}
        onOpen={open}
        map={
          <MapView
            projects={filtered ?? []}
            provinceFilter={filters.province}
            point={point}
            onPoint={(pt) => {
              setEmptyProvince(null);
              setPoint(pt);
            }}
            onProvince={pickProvince}
            fitToResults={active}
            resetKey={resetKey}
          />
        }
        viewer={<ModelViewer category={modelCategory} label={CATEGORY_MAP[modelCategory].label} />}
      />

      {selected && <ProjectDetail project={selected} onClose={close} />}
    </>
  );
}
