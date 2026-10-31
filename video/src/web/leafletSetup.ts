import L from "leaflet";

// leaflet.markercluster membutuhkan window.L sebelum plugin dievaluasi (sama seperti di web: src/components/MapView.tsx).
(globalThis as unknown as { L: typeof L }).L = L;

export default L;
