// Mesin sesi UI simulasi (adegan 5-8): menurunkan SEMUA keadaan halaman (filter, drawer, dropdown, tampilan peta, gulir,
// posisi kursor) murni dari frame + skrip (script.ts). Tidak ada state nyata: tiap frame dihitung ulang.
import { Easing } from "remotion";
import { CATEGORIES, type CategoryId } from "@/lib/categories";
import { applyFilters, EMPTY_FILTERS, filterOptions, hasActiveFilters, sortProjects, type Filters } from "@/lib/filters";
import type { Project } from "@/lib/types";
import { CONFIG, sec } from "../config";
import { SCENE58_SCROLL, type Step } from "../script";
import { WIN } from "../ui/layout";
import { DEMO_PROJECTS } from "./demoData";
import { containerPoint, fitView, lerpView, type MapView2 } from "./mapMath";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Posisi elemen halaman (koordinat halaman, tanpa gulir), diukur dari DOM sekali. */
export interface Metrics {
  map: Rect;
  panel: Rect;
  viewer: Rect;
  cardFirst: Rect;
  selYear: Rect;
  selCategory: Rect;
  tabs: Record<string, Rect>;
  sectionPeta: number;
  sectionProyek: number;
  /** tombol "Main Website" di navbar (koordinat halaman = koordinat jendela tanpa chrome; header tidak ikut gulir) */
  mainSite: Rect;
}

export interface Session {
  filters: Filters;
  lastCategory: CategoryId;
  /** filter sebelum perubahan terakhir + frame perubahan (untuk transisi daftar) */
  prevFilters: Filters;
  filterChangeFrame: number;
  /** semua perubahan filter berurutan (untuk transisi tampilan peta) */
  filterEvents: { frame: number; filters: Filters }[];
  dropdown: null | { id: "year" | "category"; openFrame: number };
  drawer: null | { project: Project; openFrame: number; closeFrame: number | null };
}

const withCategory = (f: Filters, c: CategoryId | ""): Filters => ({ ...f, category: c });

/** Keadaan sesi pada frame tertentu: peristiwa (klik/Esc) yang sudah lewat diterapkan berurutan. */
export function sessionAt(frame: number, steps: Step[]): Session {
  let filters: Filters = EMPTY_FILTERS;
  let lastCategory: CategoryId = "boiler";
  let prevFilters: Filters = EMPTY_FILTERS;
  let filterChangeFrame = -9999;
  const filterEvents: Session["filterEvents"] = [];
  let dropdown: Session["dropdown"] = null;
  let drawer: Session["drawer"] = null;

  const setFilters = (next: Filters, at: number) => {
    prevFilters = filters;
    filters = next;
    filterChangeFrame = at;
    filterEvents.push({ frame: at, filters: next });
    if (next.category) lastCategory = next.category;
  };

  for (const s of steps) {
    if (s.frame > frame) break;
    if (s.action === "click") {
      if (s.target === "province-kaltim") setFilters({ ...filters, province: "Kalimantan Timur", city: "" }, s.frame);
      else if (s.target === "btn-show-all") setFilters({ ...filters, province: "", city: "" }, s.frame);
      else if (s.target === "select-year") dropdown = { id: "year", openFrame: s.frame };
      else if (s.target === "select-category") dropdown = { id: "category", openFrame: s.frame };
      else if (s.target === "option" && s.value) {
        const [kind, v] = s.value.split(":");
        dropdown = null;
        if (kind === "year") setFilters({ ...filters, year: v }, s.frame);
        else if (kind === "category") setFilters(withCategory(filters, v as CategoryId), s.frame);
      } else if (s.target === "card-first") {
        const first = sortProjects(applyFilters(DEMO_PROJECTS, filters), "tahun-baru")[0];
        if (first) drawer = { project: first, openFrame: s.frame, closeFrame: null };
      } else if (s.target?.startsWith("tab-")) {
        setFilters(withCategory(filters, s.target.slice(4) as CategoryId), s.frame);
      }
    } else if (s.action === "press" && s.value === "Escape") {
      const d = drawer as Session["drawer"];
      if (d && d.closeFrame === null) drawer = { project: d.project, openFrame: d.openFrame, closeFrame: s.frame };
    }
  }
  return { filters, lastCategory, prevFilters, filterChangeFrame, filterEvents, dropdown, drawer };
}

// ---------------------------------------------------------------------------
// Turunan dari filter
// ---------------------------------------------------------------------------
export const filteredFor = (f: Filters) => applyFilters(DEMO_PROJECTS, f);
export const panelFor = (f: Filters) => sortProjects(filteredFor(f), "tahun-baru");
export const countsFor = (f: Filters) => {
  const base = applyFilters(DEMO_PROJECTS, { ...f, category: "" });
  return new Map(CATEGORIES.map((c) => [c.id, base.filter((p) => p.category === c.id).length]));
};

/** Sama dengan web: peta menyesuaikan diri ke hasil bila ada filter aktif, selain itu seluruh Indonesia. */
const fitSetFor = (f: Filters) => (hasActiveFilters(f) ? filteredFor(f) : null);

export const MAP_MOVE_SECONDS = 1.0;

/** Tampilan peta pada frame tertentu: berpindah halus dari tampilan sebelumnya ke tampilan hasil filter terbaru. */
export function mapViewAt(frame: number, s: Session, w: number, h: number): MapView2 {
  const maxZ = CONFIG.scene58.mapMaxZoom;
  const views = [fitView(null, w, h, maxZ), ...s.filterEvents.map((e) => fitView(fitSetFor(e.filters), w, h, maxZ))];
  let i = 0;
  s.filterEvents.forEach((e, idx) => {
    if (frame >= e.frame + sec(0.05)) i = idx + 1;
  });
  if (i === 0) return views[0];
  const t0 = s.filterEvents[i - 1].frame + sec(0.05);
  const p = Easing.inOut(Easing.cubic)(clamp01((frame - t0) / sec(MAP_MOVE_SECONDS)));
  return lerpView(views[i - 1], views[i], p);
}

// ---------------------------------------------------------------------------
// Gulir halaman
// ---------------------------------------------------------------------------
export function scrollAt(frame: number, m: Metrics): number {
  // header web setinggi 64 px menutupi bagian atas halaman: sisakan ruang agar judul seksi terlihat
  const dest = { top: 0, peta: Math.max(0, m.sectionPeta - 64 - 14), // untuk "Proyek per Kategori": tab di bawah header, seluruh viewer 3D muat di jendela (judul seksi boleh tergulir di bawah header)
    proyek: Math.max(0, (m.tabs.semua?.y ?? m.sectionProyek + 78) - 64 - 12) };
  let y = 0;
  for (const k of SCENE58_SCROLL) {
    if (frame <= k.frame) break;
    const p = Easing.inOut(Easing.cubic)(clamp01((frame - k.frame) / k.duration));
    y = y + (dest[k.to] - y) * p;
    if (p < 1) break;
  }
  return y;
}

// ---------------------------------------------------------------------------
// Dropdown tiruan (select asli tidak bisa "dibuka" secara visual)
// ---------------------------------------------------------------------------
export const DROPDOWN_ROW = 36;
export const dropdownOptions = (id: "year" | "category", f: Filters): { value: string; label: string }[] =>
  id === "year"
    ? [{ value: "", label: "Semua tahun" }, ...filterOptions(DEMO_PROJECTS, f).years.map((y) => ({ value: y, label: y }))]
    : [{ value: "", label: "Semua kategori" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.label }))];

// ---------------------------------------------------------------------------
// Posisi kursor (koordinat jendela, termasuk chrome)
// ---------------------------------------------------------------------------
const center = (r: Rect, fx = 0.5, fy = 0.5) => ({ x: r.x + r.w * fx, y: r.y + r.h * fy });

/** Posisi target dalam koordinat halaman (sebelum gulir). */
export function pagePoint(step: Step, m: Metrics, filtersAtStep: Filters): { x: number; y: number } | null {
  switch (step.target) {
    case "province-kaltim": {
      const w = m.map.w - 2;
      const h = m.map.h - 2;
      const p = containerPoint(0.35, 116.3, fitView(null, w, h), w, h);
      return { x: m.map.x + 1 + p.x, y: m.map.y + 1 + p.y };
    }
    case "btn-show-all":
      // tombol di kanan atas panel (rata kanan, padding 12px)
      return { x: m.panel.x + m.panel.w - 12 - 96, y: m.panel.y + 12 + 22 };
    case "select-year":
      return center(m.selYear, 0.35);
    case "select-category":
      return center(m.selCategory, 0.35);
    case "option": {
      const [kind, v] = (step.value ?? "").split(":");
      const id = kind === "year" ? "year" : "category";
      const sel = id === "year" ? m.selYear : m.selCategory;
      const idx = Math.max(0, dropdownOptions(id, filtersAtStep).findIndex((o) => o.value === v));
      return { x: sel.x + sel.w * 0.35, y: sel.y + sel.h + 4 + 6 + idx * DROPDOWN_ROW + DROPDOWN_ROW / 2 };
    }
    case "nav-main":
      return center(m.mainSite);
    case "card-first":
      return center(m.cardFirst, 0.4, 0.5);
    default:
      if (step.target?.startsWith("tab-") && m.tabs[step.target.slice(4)]) return center(m.tabs[step.target.slice(4)]);
      return null;
  }
}

const moveEase = Easing.bezier(0.45, 0, 0.2, 1);

/** Kursor pada frame tertentu: gerak melengkung halus antar target, diam sebentar di tiap target. */
export function cursorAt(frame: number, steps: Step[], m: Metrics, start: { x: number; y: number }) {
  const scrollEnd = (f: number) => scrollAt(f, m);
  let from = { ...start };
  for (const s of steps) {
    if (s.action !== "moveTo") continue;
    const dur = s.duration ?? sec(0.8);
    const filtersAtStep = sessionAt(s.frame, steps).filters;
    const pp = pagePoint(s, m, filtersAtStep);
    if (!pp) continue;
    // titik tujuan dalam koordinat jendela, memakai gulir di akhir gerakan
    const to = { x: pp.x, y: pp.y - (s.target === "nav-main" ? 0 : scrollEnd(s.frame + dur)) + WIN.chrome };
    if (frame < s.frame) return from;
    const p = clamp01((frame - s.frame) / dur);
    if (p < 1) {
      const e = moveEase(p);
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy) || 1;
      const arc = Math.sin(Math.PI * e) * 0.08 * len;
      return { x: from.x + dx * e - (dy / len) * arc, y: from.y + dy * e + (dx / len) * arc };
    }
    from = to;
  }
  return from;
}
