import { forwardRef } from "react";
import { Easing } from "remotion";
import { CATEGORIES, visibleCategories } from "@/lib/categories";
import { sortProjects } from "@/lib/filters";
import { hasActiveFilters } from "@/lib/filters";
import { DashboardView } from "@/components/home/DashboardView";
import { ProjectList } from "@/components/ProjectList";
import { SITE } from "@/config/site";
import { sec } from "../config";
import { DEMO_PROJECTS } from "./demoData";
import { TOTALS, countsFor, filteredFor, panelFor, type Metrics, type Rect, type Session } from "./session";
import type { MapView2 } from "./mapMath";
import { VideoMap } from "./VideoMap";
import { VideoModel } from "./VideoModel";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const noop = () => {};

/** Ukur posisi elemen penting di halaman (koordinat halaman, sebelum gulir). Kompensasi skala jendela. */
export function collectMetrics(root: HTMLElement): Metrics {
  const rr = root.getBoundingClientRect();
  const s = rr.width / root.offsetWidth || 1;
  const rect = (el: Element | null): Rect => {
    if (!el) return { x: 0, y: 0, w: 0, h: 0 };
    const r = el.getBoundingClientRect();
    return { x: (r.left - rr.left) / s, y: (r.top - rr.top) / s, w: r.width / s, h: r.height / s };
  };
  const selects = root.querySelectorAll('form[aria-label="Filter proyek"] select'); // Kategori, Provinsi, Kota, Tahun
  const tabEls = root.querySelectorAll('[role="tab"]'); // Semua + kategori
  const tabs: Record<string, Rect> = {};
  ["semua", ...visibleCategories(TOTALS).map((c) => c.id)].forEach((id, i) => (tabs[id] = rect(tabEls[i])));
  return {
    map: rect(root.querySelector('[data-metric="map"]')),
    panel: rect(root.querySelector('[data-metric="panel"]')),
    viewer: rect(root.querySelector('[data-metric="viewer"]')),
    cardFirst: rect(root.querySelector('[data-metric="panel"] li button')),
    selYear: rect(selects[3]),
    selCategory: rect(selects[0]),
    tabs,
    sectionPeta: rect(root.querySelector("#peta")).y,
    sectionProyek: rect(root.querySelector("#proyek")).y,
    mainSite: { x: 0, y: 0, w: 0, h: 0 }, // diisi Scene58Web (header ada di luar WebPage)
  };
}

interface Props {
  session: Session;
  frame: number;
  view: MapView2;
  /** sudut putar model 3D (derajat) */
  modelAngle: number;
  modelOpacity: number;
}

/**
 * Halaman beranda web (hero + statistik + dashboard peta + proyek per kategori). Hero dan statistik meniru app/page.tsx;
 * dashboard memakai DashboardView yang sama dengan web (src/components/home/DashboardView.tsx), dengan peta dan viewer 3D versi frame.
 */
export const WebPage = forwardRef<HTMLDivElement, Props>(function WebPage({ session, frame, view, modelAngle, modelOpacity }, ref) {
  const f = session.filters;
  const filtered = filteredFor(f);
  const modelCategory = f.category || session.lastCategory;

  // daftar di panel samping peta: transisi silang (fade) saat filter berubah
  const mix = Easing.inOut(Easing.cubic)(clamp01((frame - session.filterChangeFrame) / sec(0.5)));
  const nextList = panelFor(f);
  const list = (projects: typeof nextList) => <ProjectList projects={projects} onSelect={noop} showCategory emptyMessage="Tidak ada proyek yang cocok dengan filter yang dipilih." />;
  const panelBody =
    mix >= 1 ? (
      list(nextList)
    ) : (
      <div className="relative">
        <div className="absolute inset-x-0 top-0" style={{ opacity: 1 - mix }}>
          {list(panelFor(session.prevFilters))}
        </div>
        <div style={{ opacity: mix, transform: `translateY(${(1 - mix) * 12}px)` }}>{list(nextList)}</div>
      </div>
    );

  return (
    <div ref={ref} style={{ position: "relative", width: "100%", paddingTop: 64 }}>
      {/* Hero (meniru src/app/page.tsx) */}
      <section className="on-navy bg-gradient-to-br from-navy via-navy to-navy-2 pb-20 pt-10 text-white sm:pb-24 sm:pt-14">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-2">{SITE.hero.eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{SITE.hero.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">{SITE.hero.text}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="btn btn-white">{SITE.hero.primary.label}</span>
            <span className="btn btn-ghost-white">{SITE.mainSiteButton}</span>
          </div>
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:-mt-14">
        <dl className="grid grid-cols-3 gap-2 sm:gap-4">
          {SITE.statsDefaults.map((s) => (
            <div key={s.key} className="flex flex-col rounded-2xl border border-line bg-surface px-2 py-4 text-center shadow-sm sm:px-6 sm:py-6">
              <dt className="order-2 mt-1 text-xs font-medium leading-tight text-muted sm:text-base">{s.label}</dt>
              <dd className="text-3xl font-bold text-accent sm:text-5xl">{s.value}+</dd>
            </div>
          ))}
        </dl>
      </div>

      <DashboardView
        projects={DEMO_PROJECTS}
        filters={f}
        onFilters={noop}
        sort="tahun-baru"
        onSort={noop}
        filteredCount={filtered.length}
        countsByCategory={countsFor(f)}
        totalsByCategory={TOTALS}
        modelCategory={modelCategory}
        panel={{ title: f.city || f.province || "Semua lokasi", projects: nextList, hasLocation: Boolean(f.province || f.city), onShowAll: noop }}
        sorted={sortProjects(filtered, "tahun-baru")}
        active={hasActiveFilters(f)}
        onReset={noop}
        emptyMessage="Tidak ada proyek yang cocok dengan filter yang dipilih."
        onOpen={noop}
        map={<VideoMap projects={filtered} provinceFilter={f.province} view={view} />}
        viewer={<VideoModel category={modelCategory} angleDeg={modelAngle} opacity={modelOpacity} />}
        panelBody={panelBody}
      />
      <div style={{ height: 120 }} />
    </div>
  );
});
