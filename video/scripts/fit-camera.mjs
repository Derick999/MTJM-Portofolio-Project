// Alat bantu: mencari parameter kamera orbit rendah yang membuat kota-kota tertentu jatuh di posisi layar
// yang sama dengan gambar referensi (video/reference/earth-ref.png, 1536x1024).
// Gambar referensi HANYA dipakai untuk menyetel kamera; bukan aset video.
//   node scripts/fit-camera.mjs [fov]
const R = 3;
const rad = (d) => (d * Math.PI) / 180;
const W = 1536, H = 1024;

// [nama, lat, lng, x piksel di referensi, y piksel di referensi]
const ANCHORS = [
  ["Aceh", 5.55, 95.32, 100, 385],
  ["Singapura", 1.3, 103.8, 345, 480],
  ["Jakarta", -6.2, 106.8, 410, 692],
  ["Pontianak", 0.0, 109.3, 530, 505],
  ["Banjarmasin", -3.3, 114.6, 690, 640],
  ["Kudat (ujung utara Kalimantan)", 7.0, 117.0, 780, 395],
  ["Manila", 14.6, 121.0, 905, 300],
  ["Bangkok", 13.75, 100.5, 300, 235],
  ["Kupang", -10.2, 123.6, 1000, 850],
  ["Jayapura", -2.5, 140.7, 1490, 700],
];

const toVec = (lat, lng, r) => {
  const la = rad(lat), lo = rad(lng);
  return [r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo)];
};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const scale = (a, s) => a.map((v) => v * s);

/** p = [camLat, camLng, alt, yaw, pitchDown, roll] -> basis kamera */
export function basis(p) {
  const [lat, lng, alt, yaw, pitch, roll] = p;
  const C = toVec(lat, lng, R + alt);
  const u = norm(C);
  const n = norm(sub([0, 1, 0], scale(u, u[1])));
  const e = cross(n, u);
  const h = add(scale(n, Math.cos(rad(yaw))), e, Math.sin(rad(yaw)));
  const f = norm(add(scale(h, Math.cos(rad(pitch))), u, -Math.sin(rad(pitch))));
  const up0 = norm(sub(u, scale(f, dot(u, f))));
  const right0 = cross(f, up0);
  const right = add(scale(right0, Math.cos(rad(roll))), up0, Math.sin(rad(roll)));
  const up = add(scale(up0, Math.cos(rad(roll))), right0, -Math.sin(rad(roll)));
  return { C, f, right, up };
}

export function project(p, lat, lng, fov, aspect) {
  const { C, f, right, up } = basis(p);
  const v = sub(toVec(lat, lng, R), C);
  const z = dot(v, f);
  if (z <= 0.01) return null;
  const t = Math.tan(rad(fov) / 2);
  return [((dot(v, right) / (z * t * aspect)) + 1) / 2 * W, (1 - dot(v, up) / (z * t)) / 2 * H];
}

const loss = (p, fov) => {
  if (p[2] < 0.25) return 1e9;
  let s = 0;
  for (const [, la, lo, x, y] of ANCHORS) {
    const q = project(p, la, lo, fov, W / H);
    if (!q) return 1e9;
    s += (q[0] - x) ** 2 + (q[1] - y) ** 2;
  }
  return s / ANCHORS.length;
};

// Nelder-Mead sederhana
function nelder(f, x0, step, iters = 4000) {
  const n = x0.length;
  let pts = [x0, ...x0.map((_, i) => x0.map((v, j) => (i === j ? v + step[i] : v)))].map((x) => ({ x, v: f(x) }));
  for (let k = 0; k < iters; k++) {
    pts.sort((a, b) => a.v - b.v);
    const c = Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += pts[i].x[j] / n;
    const w = pts[n];
    const along = (t) => c.map((v, j) => v + t * (w.x[j] - v));
    const r = along(-1), fr = f(r);
    if (fr < pts[0].v) {
      const e = along(-2), fe = f(e);
      pts[n] = fe < fr ? { x: e, v: fe } : { x: r, v: fr };
    } else if (fr < pts[n - 1].v) pts[n] = { x: r, v: fr };
    else {
      const cc = along(fr < w.v ? -0.5 : 0.5), fc = f(cc);
      if (fc < Math.min(fr, w.v)) pts[n] = { x: cc, v: fc };
      else for (let i = 1; i <= n; i++) pts[i] = { x: pts[i].x.map((v, j) => pts[0].x[j] + 0.5 * (v - pts[0].x[j])), v: f(pts[i].x.map((v, j) => pts[0].x[j] + 0.5 * (v - pts[0].x[j]))) };
    }
  }
  pts.sort((a, b) => a.v - b.v);
  return pts[0];
}

const fov = Number(process.argv[2] ?? 50);
let best = null;
for (const lat0 of [-25, -15, -8]) for (const alt0 of [0.6, 1.0, 1.6]) for (const pitch0 of [35, 50, 65]) {
  const r = nelder((p) => loss(p, fov), [lat0, 112, alt0, 0, pitch0, 0], [4, 4, 0.3, 8, 8, 4]);
  if (!best || r.v < best.v) best = r;
}
const r2 = nelder((p) => loss(p, fov), best.x, [1, 1, 0.1, 2, 2, 1], 3000);
const p = r2.v < best.v ? r2.x : best.x;
console.log(`fov=${fov}  rms error = ${Math.sqrt(Math.min(r2.v, best.v)).toFixed(1)} px (pada gambar ${W}x${H})`);
console.log("camLat, camLng, alt, yaw, pitchDown, roll =", p.map((v) => +v.toFixed(3)).join(", "));
for (const [name, la, lo, x, y] of ANCHORS) {
  const q = project(p, la, lo, fov, W / H);
  console.log(`${name.padEnd(32)} ref (${x},${y})  fit (${q ? q.map((v) => Math.round(v)).join(",") : "-"})`);
}
