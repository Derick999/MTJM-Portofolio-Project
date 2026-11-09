"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { projectLabelColor } from "@/lib/service-display";
import { INDONESIA_BOUNDS } from "@/lib/indonesia";
import type { Project } from "@/lib/types";

/** Satu titik lokasi yang diklik di peta (beberapa proyek bisa berada di kota yang sama). */
export interface MapPoint {
  title: string;
  lat: number;
  lng: number;
}

export function projectsAtPoint(pt: MapPoint, projects: Project[]): Project[] {
  return projects.filter((p) => Math.abs(p.lat - pt.lat) < 0.001 && Math.abs(p.lng - pt.lng) < 0.001);
}

interface Props {
  /** Proyek yang lolos filter. */
  projects: Project[];
  /** Provinsi yang sedang dipilih di filter (disorot di peta). */
  provinceFilter: string;
  /** Titik yang sedang dipilih (sementara, tidak mengubah filter). */
  point: MapPoint | null;
  onPoint: (p: MapPoint) => void;
  /** Dipanggil dengan nama-nama provinsi pada poligon yang diklik. */
  onProvince: (names: string[]) => void;
  /** true bila filter sedang aktif: peta menyesuaikan diri ke hasil. */
  fitToResults: boolean;
  /** Naikkan nilainya untuk memaksa peta menyesuaikan ulang tampilan. */
  resetKey: number;
}

type ClusterGroup = Leaflet.FeatureGroup & {
  clearLayers(): void;
  addLayers(l: Leaflet.Layer[]): void;
  getChildCount?(): number;
};
interface ProvinceFeature {
  properties: { provinces: string[] };
}
const namesOf = (layer: Leaflet.Layer): string[] => (layer as unknown as { feature: ProvinceFeature }).feature.properties.provinces;

const POLY_BASE = { color: "#1887cd", weight: 1, fillColor: "#1887cd" };

export default function MapView({ projects, provinceFilter, point, onPoint, onProvince, fitToResults, resetKey }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<{
    L: typeof Leaflet;
    map: Leaflet.Map;
    cluster: ClusterGroup;
    geo: Leaflet.GeoJSON | null;
  } | null>(null);
  const latest = useRef({ projects, provinceFilter, onPoint, onProvince, fitToResults });
  useEffect(() => {
    latest.current = { projects, provinceFilter, onPoint, onProvince, fitToResults };
  });

  const styleProvinces = () => {
    const s = state.current;
    if (!s?.geo) return;
    const { projects, provinceFilter } = latest.current;
    const withProjects = new Set(projects.map((p) => p.province));
    s.geo.eachLayer((layer) => {
      const names = namesOf(layer);
      const has = names.some((n) => withProjects.has(n));
      const sel = Boolean(provinceFilter) && names.includes(provinceFilter);
      (layer as Leaflet.Path).setStyle({
        ...POLY_BASE,
        weight: sel ? 2.5 : 1,
        fillOpacity: sel ? 0.4 : has ? 0.16 : 0.03,
        color: has || sel ? "#1887cd" : "#8aa0b8",
        dashArray: has ? undefined : "3 3",
      });
    });
  };

  /** Sesuaikan tampilan: ke hasil filter bila ada, selain itu seluruh Indonesia. */
  const fit = (layers: number) => {
    const s = state.current;
    if (!s) return;
    if (layers && latest.current.fitToResults) s.map.fitBounds(s.cluster.getBounds().pad(0.3), { maxZoom: 9 });
    else s.map.fitBounds(INDONESIA_BOUNDS);
  };

  const renderMarkers = (initial: boolean) => {
    const s = state.current;
    if (!s) return;
    const { projects, fitToResults } = latest.current;
    s.cluster.clearLayers();
    const layers = projects.map((p) => {
      const color = projectLabelColor(p).color; // warna group layanan utama
      // Area klik 44x44 px (nyaman untuk jari); titik berwarna tetap 18 px.
      const icon = s.L.divIcon({
        className: "",
        html: `<div class="mtjm-hit"><div class="mtjm-pin" style="background:${color}"></div></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      const m = s.L.marker([p.lat, p.lng], { icon, title: p.name, alt: p.name });
      m.on("click", () => latest.current.onPoint({ title: p.city, lat: p.lat, lng: p.lng }));
      return m;
    });
    s.cluster.addLayers(layers);
    styleProvinces();
    if (!initial || fitToResults) fit(layers.length);
  };

  useEffect(() => {
    let disposed = false;
    let ro: ResizeObserver | undefined;
    (async () => {
      const L = (await import("leaflet")).default;
      (window as unknown as { L: typeof L }).L = L;
      await import("leaflet.markercluster");
      if (disposed || !host.current) return;
      const map = L.map(host.current, { zoomControl: true, minZoom: 3, worldCopyJump: false, scrollWheelZoom: false });
      map.fitBounds(INDONESIA_BOUNDS);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      // Scroll halaman tidak boleh "tersangkut" di peta: zoom dengan scroll baru aktif setelah peta diklik.
      map.on("focus", () => map.scrollWheelZoom.enable());
      map.on("blur", () => map.scrollWheelZoom.disable());

      const cluster = (L as unknown as { markerClusterGroup: (o: object) => ClusterGroup }).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: (c: ClusterGroup) =>
          L.divIcon({
            html: `<div><span>${c.getChildCount?.() ?? ""}</span></div>`,
            className: "marker-cluster marker-cluster-small",
            iconSize: [44, 44],
          }),
      });
      map.addLayer(cluster);
      state.current = { L, map, cluster, geo: null };
      renderMarkers(true);

      // Ukuran kontainer bisa berubah setelah peta dibuat (layout, rotasi HP): sesuaikan ulang selama belum disentuh.
      let touched = false;
      host.current.addEventListener("pointerdown", () => (touched = true), { once: true });
      ro = new ResizeObserver(() => {
        map.invalidateSize();
        if (!touched && !latest.current.fitToResults) map.fitBounds(INDONESIA_BOUNDS);
      });
      ro.observe(host.current);

      try {
        const data = await (await fetch("/geo/indonesia-provinces.json")).json();
        if (disposed || !state.current) return;
        const geo = L.geoJSON(data, {
          style: () => ({ ...POLY_BASE, fillOpacity: 0.03 }),
          onEachFeature: (f: ProvinceFeature, layer) => {
            const names = f.properties.provinces;
            layer.bindTooltip(names[0], { sticky: true });
            layer.on("click", () => latest.current.onProvince(names));
            layer.on("mouseover", () => (layer as Leaflet.Path).setStyle({ weight: 2 }));
            layer.on("mouseout", () => styleProvinces());
          },
        }).addTo(map);
        geo.bringToBack();
        state.current.geo = geo;
        styleProvinces();
      } catch {
        // Peta tetap berfungsi tanpa poligon provinsi.
      }
    })();
    return () => {
      disposed = true;
      ro?.disconnect();
      state.current?.map.remove();
      state.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    renderMarkers(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, fitToResults]);

  useEffect(() => {
    styleProvinces();
     
  }, [provinceFilter]);

  useEffect(() => {
    const s = state.current;
    if (s && point) s.map.setView([point.lat, point.lng], Math.max(s.map.getZoom(), 8));
  }, [point]);

  // Reset / "Tampilkan semua lokasi": kembali ke tampilan sesuai hasil filter.
  const firstReset = useRef(true);
  useEffect(() => {
    if (firstReset.current) {
      firstReset.current = false;
      return;
    }
    fit(latest.current.projects.length);
     
  }, [resetKey]);

  return (
    <div
      ref={host}
      tabIndex={0}
      className="h-full w-full"
      role="application"
      aria-label="Peta lokasi proyek di Indonesia. Klik titik atau provinsi untuk melihat proyek."
    />
  );
}
