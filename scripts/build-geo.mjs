// Menyederhanakan GeoJSON batas provinsi (sumber: BAKOSURTANAL/Dukcapil, data terbuka) untuk peta beranda.
// Pakai: node scripts/build-geo.mjs <input.geojson>   -> public/geo/indonesia-provinces.json
import fs from "node:fs";

const input = process.argv[2];
if (!input) throw new Error("Berikan path file GeoJSON provinsi.");
const TOL = 0.012; // derajat, sekitar 1,3 km

// Nama di sumber -> nama provinsi di aplikasi (+ provinsi pemekaran yang tercakup poligon ini).
const NAMES = {
  "NUSATENGGARA BARAT": ["Nusa Tenggara Barat"],
  "DAERAH ISTIMEWA YOGYAKARTA": ["DI Yogyakarta"],
  "DI. ACEH": ["Aceh"],
  "BANGKA BELITUNG": ["Kepulauan Bangka Belitung"],
  PAPUA: ["Papua", "Papua Selatan", "Papua Tengah", "Papua Pegunungan"],
  "PAPUA BARAT": ["Papua Barat", "Papua Barat Daya"],
};
const title = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/^Dki /, "DKI ");

function sqSegDist(p, a, b) {
  let [x, y] = a;
  let dx = b[0] - x, dy = b[1] - y;
  if (dx || dy) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) [x, y] = b;
    else if (t > 0) { x += dx * t; y += dy * t; }
  }
  dx = p[0] - x; dy = p[1] - y;
  return dx * dx + dy * dy;
}
function rdp(pts, tol) {
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let max = 0, idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = sqSegDist(pts[i], pts[s], pts[e]);
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol * tol) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const r3 = (n) => Math.round(n * 1000) / 1000;
function ring(r) {
  const s = rdp(r, TOL).map(([x, y]) => [r3(x), r3(y)]);
  return s.length >= 4 ? s : null;
}

const src = JSON.parse(fs.readFileSync(input, "utf8"));
const features = src.features.map((f) => {
  const raw = f.properties.Propinsi.trim();
  const provinces = NAMES[raw] ?? [title(raw)];
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const out = polys.map((p) => p.map(ring).filter(Boolean)).filter((p) => p.length);
  return {
    type: "Feature",
    properties: { provinces },
    geometry: { type: "MultiPolygon", coordinates: out },
  };
});
fs.writeFileSync("public/geo/indonesia-provinces.json", JSON.stringify({ type: "FeatureCollection", features }));
console.log(features.length, "provinsi,", (fs.statSync("public/geo/indonesia-provinces.json").size / 1024).toFixed(0), "KB");
