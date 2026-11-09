"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GROUPS, GROUP_MAP, SERVICE_MAP, groupOf, isGroup, isService, resolveModel, servicesOf } from "@/config/services";
import { SITE } from "@/config/site";
import { mainSiteHref } from "@/lib/links";
import { filterOptions, filterProjects, serviceCounts, sortProjects, EMPTY_FILTERS } from "@/lib/filters";
import { usePublicProjects } from "@/lib/projects";
import type { Project } from "@/lib/types";
import { LazyWhenVisible } from "@/components/LazyWhenVisible";
import { ModelViewer } from "@/components/ModelViewer";
import { ProjectDetail } from "@/components/ProjectDetail";
import { ProjectList } from "@/components/ProjectList";
import { projectsAtPoint, type MapPoint } from "@/components/MapView";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="skeleton h-full w-full" role="status" aria-label="Memuat peta" />,
});

type View = "peta" | "3d" | "daftar";
const VIEW_LABEL: Record<View, string> = { peta: "Peta", "3d": "3D", daftar: "Daftar" };
const isView = (v: string | undefined): v is View => v === "peta" || v === "3d" || v === "daftar";

const box = "h-[340px] sm:h-[420px] lg:h-[460px]";
const selectCls = "min-h-11 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink disabled:bg-surface-2 disabled:opacity-60";

export interface SearchParams {
  layanan?: string;
  provinsi?: string;
  kota?: string;
  tahun?: string;
  q?: string;
  p?: string;
  view?: string;
}

/**
 * Halaman pencarian proyek: filter (teks, layanan, provinsi, kota, tahun) tersimpan di URL; kolom kiri = ilustrasi 3D layanan
 * (atau chip group bila "semua"), kolom kanan = peta, di bawahnya daftar proyek. HP: tab Peta | 3D | Daftar.
 */
export function ProjectSearch({ initialProjects, initial }: { initialProjects: Project[] | null; initial: SearchParams }) {
  const { projects, error } = usePublicProjects(initialProjects);
  const [layanan, setLayanan] = useState(isService(initial.layanan) || isGroup(initial.layanan) ? initial.layanan! : "");
  const [provinsi, setProvinsi] = useState(initial.provinsi ?? "");
  const [kota, setKota] = useState(initial.kota ?? "");
  const [tahun, setTahun] = useState(initial.tahun ?? "");
  const [q, setQ] = useState(initial.q ?? "");
  const [view, setView] = useState<View>(isView(initial.view) ? initial.view : "peta");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(() => initialProjects?.find((p) => p.slug === initial.p) ?? null);
  const [point, setPoint] = useState<MapPoint | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const all = useMemo(() => projects ?? [], [projects]);
  const counts = useMemo(() => serviceCounts(all), [all]);
  const scoped = useMemo(() => filterProjects(all, { layanan }), [all, layanan]);
  const opts = useMemo(() => filterOptions(scoped, { ...EMPTY_FILTERS, province: provinsi }), [scoped, provinsi]);

  const filtered = useMemo(() => {
    const base = filterProjects(all, { layanan, provinsi, kota, tahun });
    const needle = q.trim().toLowerCase();
    if (!needle) return base;
    // klien ikut dicari hanya bila namanya boleh tampil ke publik
    return base.filter((p) => p.name.toLowerCase().includes(needle) || (SITE.showClientNames && `${p.owner} ${p.customer} ${p.client}`.toLowerCase().includes(needle)));
  }, [all, layanan, provinsi, kota, tahun, q]);
  const sorted = useMemo(() => sortProjects(filtered, "tahun-baru"), [filtered]);

  const model = layanan ? resolveModel(layanan) : undefined;
  const views: View[] = model ? ["peta", "3d", "daftar"] : ["peta", "daftar"];
  const activeView: View = views.includes(view) ? view : "peta";
  const anyFilter = Boolean(layanan || provinsi || kota || tahun || q.trim());
  const info = isService(layanan) ? SERVICE_MAP[layanan] : isGroup(layanan) ? GROUP_MAP[layanan] : null;
  const accent = layanan ? groupOf(layanan)?.color : undefined;
  const showLeft = Boolean(model) || !layanan; // 3D (layanan bermodel) atau chip group (semua)
  const legendGroups = GROUPS.filter((g) => (counts.get(g.slug) ?? 0) > 0);

  // Semua filter ke URL, supaya bisa dibagikan.
  useEffect(() => {
    const u = new URLSearchParams();
    if (layanan) u.set("layanan", layanan);
    if (provinsi) u.set("provinsi", provinsi);
    if (kota) u.set("kota", kota);
    if (tahun) u.set("tahun", tahun);
    if (q.trim()) u.set("q", q.trim());
    if (activeView !== "peta") u.set("view", activeView);
    if (selected) u.set("p", selected.slug);
    const s = u.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${s ? `?${s}` : ""}`);
  }, [layanan, provinsi, kota, tahun, q, activeView, selected]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mtjm:detail", { detail: selected !== null }));
  }, [selected]);

  // ?p=slug saat data baru tiba (bila server gagal mengirim data).
  useEffect(() => {
    if (!projects || selected) return;
    const slug = new URLSearchParams(window.location.search).get("p");
    const hit = slug ? projects.find((p) => p.slug === slug) : undefined;
    if (hit) setSelected(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const clearPick = () => {
    setPoint(null);
    setNotice(null);
  };
  const chooseLayanan = (slug: string) => {
    setLayanan(slug);
    setProvinsi("");
    setKota("");
    setTahun("");
    clearPick();
    setResetKey((k) => k + 1);
  };
  const reset = () => {
    setLayanan("");
    setProvinsi("");
    setKota("");
    setTahun("");
    setQ("");
    clearPick();
    setResetKey((k) => k + 1);
  };

  /** Klik provinsi di peta: jadikan filter provinsi (klik lagi membatalkan). */
  const pickProvince = (names: string[]) => {
    const target = names.find((n) => scoped.some((p) => p.province === n));
    if (!target) return setNotice(`Belum ada proyek untuk pilihan ini di ${names[0]}.`);
    clearPick();
    setKota("");
    setProvinsi(provinsi === target ? "" : target);
  };
  const pickPoint = (pt: MapPoint) => {
    const hits = projectsAtPoint(pt, filtered);
    if (hits.length === 1) setSelected(hits[0]);
    else setPoint(pt);
  };
  const close = useCallback(() => setSelected(null), []);
  const pointList = point ? sortProjects(projectsAtPoint(point, filtered), "tahun-baru") : [];

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = views.indexOf(activeView);
    const next = views[(i + (e.key === "ArrowRight" ? 1 : views.length - 1)) % views.length];
    setView(next);
    requestAnimationFrame(() => document.getElementById(`tab-${next}`)?.focus());
  };

  // Tampilan HP: satu panel per tab. Desktop (lg): semuanya tampil sekaligus.
  const show = (v: View) => (activeView === v ? "block" : "hidden lg:block");

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Cari Proyek</h1>
          <p className="mt-1 text-sm text-muted">{SITE.searchPage.note}</p>
          <a href={mainSiteHref("proyek")} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-xs font-semibold text-accent underline underline-offset-2 hover:text-navy">
            {SITE.searchPage.moreLabel} <span aria-hidden className="ml-1">&#8599;</span>
          </a>
        </div>
        <Link href="/#layanan" className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2 hover:text-navy">
          Semua layanan
        </Link>
      </div>

      {/* filter */}
      <form className="mt-4 rounded-2xl border border-line bg-surface p-3 shadow-sm" aria-label="Filter proyek" onSubmit={(e) => e.preventDefault()}>
        <div className="flex gap-2">
          <label className="min-w-0 flex-1 text-xs text-muted">
            Cari
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                clearPick();
              }}
              placeholder={SITE.showClientNames ? "Nama proyek atau klien" : "Nama proyek"}
              className={`${selectCls} mt-0.5 text-base`}
            />
          </label>
          <div className="mt-[1.15rem] shrink-0 lg:hidden">
            <button
              type="button"
              aria-expanded={filtersOpen}
              aria-controls="filter-lanjut"
              onClick={() => setFiltersOpen((v) => !v)}
              className="btn btn-outline !px-4"
            >
              Filter
            </button>
          </div>
        </div>
        <div id="filter-lanjut" className={`mt-2 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] ${filtersOpen ? "grid" : "hidden lg:grid"}`}>
          <label className="col-span-2 text-xs text-muted sm:col-span-3 lg:col-span-1">
            Layanan
            <select className={selectCls} value={layanan} onChange={(e) => chooseLayanan(e.target.value)}>
              <option value="">Semua layanan</option>
              {GROUPS.map((g) => (
                <optgroup key={g.slug} label={g.label}>
                  <option value={g.slug} disabled={(counts.get(g.slug) ?? 0) === 0}>
                    Semua {g.label}
                  </option>
                  {servicesOf(g.slug).map((s) => (
                    <option key={s.slug} value={s.slug} disabled={(counts.get(s.slug) ?? 0) === 0}>
                      {s.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Provinsi
            <select
              className={selectCls}
              value={provinsi}
              onChange={(e) => {
                setProvinsi(e.target.value);
                setKota("");
                clearPick();
              }}
            >
              <option value="">Semua provinsi</option>
              {opts.provinces.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted">
            Kota / Kabupaten
            <select className={selectCls} value={kota} disabled={!provinsi} onChange={(e) => (setKota(e.target.value), clearPick())}>
              <option value="">{provinsi ? "Semua kota" : "Pilih provinsi dulu"}</option>
              {provinsi && opts.cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted">
            Tahun
            <select className={selectCls} value={tahun} onChange={(e) => (setTahun(e.target.value), clearPick())}>
              <option value="">Semua tahun</option>
              {opts.years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <div className="col-span-2 flex items-end justify-end gap-2 sm:col-span-3 lg:col-span-1">
            <button type="button" disabled={!anyFilter} onClick={reset} className="btn btn-outline !px-4 !py-2 disabled:opacity-40">
              Reset
            </button>
          </div>
        </div>
      </form>

      {/* tab HP */}
      <div role="tablist" aria-label="Tampilan hasil" onKeyDown={onTabKey} className="mt-4 flex gap-2 lg:hidden">
        {views.map((v) => (
          <button
            key={v}
            id={`tab-${v}`}
            role="tab"
            aria-selected={activeView === v}
            aria-controls={`panel-${v}`}
            tabIndex={activeView === v ? 0 : -1}
            onClick={() => setView(v)}
            className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
              activeView === v ? "border-accent bg-accent text-white" : "border-line bg-surface text-muted hover:border-accent hover:text-accent"
            }`}
          >
            {VIEW_LABEL[v]}
          </button>
        ))}
      </div>

      <div className={`mt-4 grid gap-4 ${showLeft ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
        {/* kiri: 3D layanan terpilih, atau chip group bila semua layanan */}
        {showLeft && (
          <section id="panel-3d" aria-label={model ? "Ilustrasi 3D" : "Pilih kelompok layanan"} className={`${model ? show("3d") : "hidden lg:block"} rounded-2xl border border-line bg-surface p-3 shadow-sm sm:p-4`}>
            {model ? (
              <>
                <h2 className="text-xl font-bold" style={{ color: accent }}>
                  {info?.label}
                </h2>
                <p className="mb-3 mt-0.5 text-sm text-muted">{info?.blurb}</p>
                <LazyWhenVisible className={box} fallback={<div className="skeleton h-full w-full rounded-lg" />}>
                  <ModelViewer category={model} label={info?.label ?? ""} />
                </LazyWhenVisible>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">Pilih kelompok layanan</h2>
                <p className="mb-3 mt-0.5 text-sm text-muted">Pilih salah satu untuk melihat ilustrasi 3D dan menyaring proyek.</p>
                <ul className="flex flex-wrap gap-2">
                  {GROUPS.map((g) => {
                    const n = counts.get(g.slug) ?? 0;
                    return (
                      <li key={g.slug}>
                        <button
                          type="button"
                          disabled={n === 0}
                          onClick={() => chooseLayanan(g.slug)}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold hover:border-accent disabled:opacity-50"
                        >
                          <span className="h-3 w-3 rounded-full" style={{ background: g.color }} aria-hidden />
                          {g.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        )}

        {/* kanan: peta */}
        <section id="panel-peta" aria-label="Peta lokasi proyek" className={`${show("peta")} min-w-0`}>
          {legendGroups.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-x-3" aria-label="Legenda warna titik peta">
              {legendGroups.map((g) => (
                <li key={g.slug}>
                  <button
                    type="button"
                    aria-pressed={layanan === g.slug}
                    onClick={() => chooseLayanan(g.slug)}
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:text-accent"
                  >
                    <span className="h-3.5 w-3.5 rounded-full border border-white shadow-[0_0_0_1px_rgb(20_20_74/0.35)]" style={{ background: g.color }} aria-hidden />
                    {g.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <LazyWhenVisible className={`relative isolate z-0 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm ${box}`} fallback={<div className="skeleton h-full w-full" />}>
            <MapView projects={filtered} provinceFilter={provinsi} point={point} onPoint={pickPoint} onProvince={pickProvince} fitToResults={anyFilter} resetKey={resetKey} />
          </LazyWhenVisible>
          {notice && (
            <p role="status" className="mt-2 rounded-lg bg-surface-2 p-3 text-sm">
              {notice}
            </p>
          )}
          {point && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {point.title}
                </p>
                <button type="button" onClick={() => setPoint(null)} className="inline-flex min-h-11 items-center text-xs font-semibold text-accent underline underline-offset-2">
                  Tutup
                </button>
              </div>
              <ProjectList projects={pointList} onSelect={setSelected} />
            </div>
          )}
        </section>
      </div>

      {/* daftar proyek */}
      <section id="panel-daftar" aria-label="Daftar proyek" className={`${show("daftar")} mt-6`}>
        <h2 className="mb-3 text-xl font-bold">
          Daftar proyek
        </h2>
        <ProjectList
          projects={projects ? sorted : null}
          onSelect={setSelected}
          error={error}
          showCategory
          grid
          emptyMessage={
            <>
              Tidak ada proyek yang cocok dengan pilihan ini.{" "}
              <button type="button" onClick={reset} className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-2">
                Reset filter
              </button>
            </>
          }
        />
      </section>

      {selected && <ProjectDetail project={selected} onClose={close} />}
    </>
  );
}
