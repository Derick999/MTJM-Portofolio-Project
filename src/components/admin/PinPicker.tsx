"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

/** Mini-peta gratis (OpenStreetMap) untuk menggeser pin. */
export default function PinPicker({ lat, lng, onChange }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const st = useRef<{ map: Leaflet.Map; marker: Leaflet.Marker } | null>(null);
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });

  useEffect(() => {
    let dead = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (dead || !host.current) return;
      const map = L.map(host.current).setView([lat, lng], 10);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const icon = L.divIcon({ className: "", html: '<div class="mtjm-pin" style="background:#1887cd"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
      const marker = L.marker([lat, lng], { icon, draggable: true, title: "Geser untuk memindahkan pin" }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        cb.current(Number(p.lat.toFixed(5)), Number(p.lng.toFixed(5)));
      });
      map.on("click", (e: Leaflet.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        cb.current(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)));
      });
      st.current = { map, marker };
    })();
    return () => {
      dead = true;
      st.current?.map.remove();
      st.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pindah saat koordinat berubah dari luar (ganti kota).
  useEffect(() => {
    const s = st.current;
    if (!s) return;
    const cur = s.marker.getLatLng();
    if (Math.abs(cur.lat - lat) > 1e-6 || Math.abs(cur.lng - lng) > 1e-6) {
      s.marker.setLatLng([lat, lng]);
      s.map.setView([lat, lng], Math.max(s.map.getZoom(), 9));
    }
  }, [lat, lng]);

  return <div ref={host} className="h-64 w-full overflow-hidden rounded border border-line" role="application" aria-label="Mini-peta untuk menggeser pin lokasi" />;
}
