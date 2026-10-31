import { useEffect, useRef } from "react";
import { continueRender, delayRender } from "remotion";
import L from "./leafletSetup";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type * as Leaflet from "leaflet";
import { CATEGORY_MAP } from "@/lib/categories";
import type { Project } from "@/lib/types";
import { GEO } from "../data";
import type { MapView2 } from "./mapMath";

/**
 * Peta untuk video: tampilan dan perilaku sama dengan src/components/MapView.tsx di web (pin 44 px berwarna per kategori,
 * cluster, poligon provinsi dengan sorotan), tetapi digerakkan per frame:
 *  - tanpa animasi berbasis waktu nyata (zoom/fade/cluster animate = false) supaya hasil render deterministik,
 *  - tampilan (pusat + zoom) dihitung murni dari data lalu diterapkan per frame,
 *  - tanpa tile OpenStreetMap (render tidak bergantung jaringan dan tidak membebani server OSM): daratan digambar dari
 *    poligon provinsi yang sama di atas warna laut bawaan web (#dbe9f6). Lihat README untuk opsi tile lokal.
 */

type ClusterGroup = Leaflet.FeatureGroup & { clearLayers(): void; addLayers(l: Leaflet.Layer[]): void; getChildCount?(): number };
interface ProvinceFeature {
  properties: { provinces: string[] };
}
const namesOf = (layer: Leaflet.Layer): string[] => (layer as unknown as { feature: ProvinceFeature }).feature.properties.provinces;
const POLY_BASE = { color: "#1887cd", weight: 1, fillColor: "#1887cd" };

interface Props {
  /** Proyek yang lolos filter (menjadi pin) */
  projects: Project[];
  /** Provinsi yang sedang dipilih di filter (disorot) */
  provinceFilter: string;
  /** Tampilan yang diterapkan pada frame ini */
  view: MapView2;
}

export function VideoMap({ projects, provinceFilter, view }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<{ map: Leaflet.Map; cluster: ClusterGroup; geo: Leaflet.GeoJSON } | null>(null);
  const latest = useRef({ projects, provinceFilter });
  latest.current = { projects, provinceFilter };

  const styleProvinces = () => {
    const s = state.current;
    if (!s) return;
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

  const renderMarkers = () => {
    const s = state.current;
    if (!s) return;
    s.cluster.clearLayers();
    const layers = latest.current.projects.map((p) => {
      const color = CATEGORY_MAP[p.category].color;
      // sama dengan web: area klik 44x44, titik berwarna 18 px
      const icon = L.divIcon({
        className: "",
        html: `<div class="mtjm-hit"><div class="mtjm-pin" style="background:${color}"></div></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      return L.marker([p.lat, p.lng], { icon, title: p.name, alt: p.name, keyboard: false });
    });
    s.cluster.addLayers(layers);
  };

  // buat peta sekali
  useEffect(() => {
    const handle = delayRender("leaflet-init");
    const el = host.current!;
    const map = L.map(el, {
      zoomControl: true,
      minZoom: 3,
      maxZoom: 18, // tanpa tile layer, maxZoom harus ditentukan sendiri (dibutuhkan cluster)
      zoomSnap: 0,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
      inertia: false,
      attributionControl: false,
      scrollWheelZoom: false,
      keyboard: false,
    });
    map.setView([view.center.lat, view.center.lng], view.zoom, { animate: false });

    // dasar daratan (pengganti tile OSM): poligon provinsi yang sama, di bawah poligon interaktif
    L.geoJSON(GEO as unknown as GeoJSON.GeoJsonObject, {
      interactive: false,
      style: () => ({ color: "#bcc7b4", weight: 0.7, fillColor: "#eceee2", fillOpacity: 1 }),
    }).addTo(map);

    const geo = L.geoJSON(GEO as unknown as GeoJSON.GeoJsonObject, { style: () => ({ ...POLY_BASE, fillOpacity: 0.03 }) }).addTo(map);
    const cluster = (L as unknown as { markerClusterGroup: (o: object) => ClusterGroup }).markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      animate: false,
      animateAddingMarkers: false,
      iconCreateFunction: (c: ClusterGroup) =>
        L.divIcon({
          html: `<div><span>${c.getChildCount?.() ?? ""}</span></div>`,
          className: "marker-cluster marker-cluster-small",
          iconSize: [44, 44],
        }),
    });
    map.addLayer(cluster);
    state.current = { map, cluster, geo };
    renderMarkers();
    styleProvinces();
    requestAnimationFrame(() => continueRender(handle));
    return () => {
      map.remove();
      state.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // proyek / sorotan berubah
  const key = projects.map((p) => p.id).join("|");
  useEffect(() => {
    renderMarkers();
    styleProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, provinceFilter]);

  // tampilan per frame
  useEffect(() => {
    const s = state.current;
    if (!s) return;
    s.map.setView([view.center.lat, view.center.lng], view.zoom, { animate: false });
  }, [view.center.lat, view.center.lng, view.zoom]);

  return <div ref={host} className="h-full w-full" role="application" aria-label="Peta lokasi proyek di Indonesia" />;
}
