import L from "./leafletSetup";
import type * as Leaflet from "leaflet";
import { INDONESIA_BOUNDS } from "@/lib/indonesia";

// Perhitungan tampilan peta yang murni (tanpa instance Leaflet), supaya posisi kursor dan zoom bisa dihitung per frame.

export interface MapView2 {
  center: { lat: number; lng: number };
  zoom: number;
}

const crs = L.CRS.EPSG3857;

/** Setara map.fitBounds: pusat + zoom agar `points` muat di kotak w x h (tanpa snap zoom). Kosong = seluruh Indonesia. */
export function fitView(points: { lat: number; lng: number }[] | null, w: number, h: number, maxZoom = 9): MapView2 {
  const empty = !points || points.length === 0;
  const bounds = empty
    ? L.latLngBounds(INDONESIA_BOUNDS as Leaflet.LatLngBoundsLiteral)
    : L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])).pad(0.3); // sama dengan web: cluster.getBounds().pad(0.3)
  const sw = crs.latLngToPoint(bounds.getSouthWest(), 0);
  const ne = crs.latLngToPoint(bounds.getNorthEast(), 0);
  const bx = Math.abs(ne.x - sw.x);
  const by = Math.abs(sw.y - ne.y);
  const zFit = Math.min(bx > 0 ? Math.log2(w / bx) : Infinity, by > 0 ? Math.log2(h / by) : Infinity);
  const zoom = Math.max(3, empty ? zFit : Math.min(maxZoom, zFit)); // minZoom 3 dan maxZoom 9 seperti di web
  const mid = L.point((sw.x + ne.x) / 2, (sw.y + ne.y) / 2);
  const c = crs.pointToLatLng(mid, 0);
  return { center: { lat: c.lat, lng: c.lng }, zoom };
}

/** Posisi piksel (di dalam kotak peta w x h) sebuah koordinat pada tampilan tertentu. */
export function containerPoint(lat: number, lng: number, view: MapView2, w: number, h: number) {
  const c = crs.latLngToPoint(L.latLng(view.center.lat, view.center.lng), view.zoom);
  const p = crs.latLngToPoint(L.latLng(lat, lng), view.zoom);
  return { x: w / 2 + (p.x - c.x), y: h / 2 + (p.y - c.y) };
}

/** Tampilan di antara dua tampilan (progres 0..1 sudah di-ease): pusat dan zoom diinterpolasi. */
export const lerpView = (a: MapView2, b: MapView2, t: number): MapView2 => ({
  center: { lat: a.center.lat + (b.center.lat - a.center.lat) * t, lng: a.center.lng + (b.center.lng - a.center.lng) * t },
  zoom: a.zoom + (b.zoom - a.zoom) * t,
});
