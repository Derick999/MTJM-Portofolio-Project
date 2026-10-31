// Skrip interaksi UI simulasi. Semua urutan dan kecepatan kursor/pengetikan dibaca dari sini.
// `frame` = frame sejak awal adegan yang bersangkutan (30 fps). Ubah angka detik di dalam sec(...) untuk mempercepat/memperlambat.
import { Easing, random } from "remotion";
import { CONFIG, sec } from "./config";
import { CURSOR_START, TARGETS } from "./ui/layout";

export type Action = "moveTo" | "click" | "type" | "press";
export interface Step {
  frame: number;
  action: Action;
  /** id elemen tujuan (lihat TARGETS di ui/layout.ts) */
  target?: string;
  /** teks yang diketik, atau nama tombol yang ditekan */
  value?: string;
  /** lama gerakan / pengetikan, dalam frame */
  duration?: number;
}

/** Adegan 4 (0:30-0:36): kursor mengklik kolom pencarian, mengetik, Enter, lalu mengklik hasil pertama. */
export const SCENE4_SCRIPT: Step[] = [
  { frame: sec(0.9), action: "moveTo", target: "search-field", duration: sec(0.85) },
  { frame: sec(1.85), action: "click", target: "search-field" },
  {
    frame: sec(2.1),
    action: "type",
    target: "search-field",
    value: CONFIG.searchQuery,
    duration: sec(CONFIG.searchQuery.length * CONFIG.scene4.typeCharSeconds),
  },
  { frame: sec(4.5), action: "press", value: "Enter" },
  { frame: sec(4.7), action: "moveTo", target: "result-1", duration: sec(0.65) },
  { frame: sec(5.45), action: "click", target: "result-1" },
];

// ---------------------------------------------------------------------------
// Penghitung status UI dari skrip (murni fungsi dari frame)
// ---------------------------------------------------------------------------
const first = (steps: Step[], action: Action, target?: string) =>
  steps.find((s) => s.action === action && (target === undefined || s.target === target));

const moveEase = Easing.bezier(0.45, 0, 0.2, 1);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Posisi kursor (koordinat jendela) pada frame tertentu: gerak melengkung halus, berhenti sebentar di tiap tujuan. */
export const cursorAt = (frame: number, steps: Step[]) => {
  let from = { ...CURSOR_START };
  for (const s of steps.filter((x) => x.action === "moveTo")) {
    const to = TARGETS[s.target!];
    const dur = s.duration ?? sec(0.8);
    if (frame < s.frame) return from;
    const p = clamp01((frame - s.frame) / dur);
    if (p < 1) {
      const e = moveEase(p);
      // lengkungan tipis tegak lurus arah gerak, supaya tidak terlihat seperti garis lurus mekanis
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const len = Math.hypot(dx, dy) || 1;
      const arc = Math.sin(Math.PI * e) * 0.1 * len;
      return { x: from.x + dx * e - (dy / len) * arc, y: from.y + dy * e + (dx / len) * arc };
    }
    from = { ...to };
  }
  return from;
};

/** Frame-frame klik (untuk efek riak dan kursor menekan). */
export const clickFrames = (steps: Step[]) => steps.filter((s) => s.action === "click").map((s) => s.frame);

/** Jumlah huruf yang sudah diketik pada frame tertentu. Irama sedikit tidak rata (jeda lebih panjang di spasi). */
export const typedCount = (frame: number, step: Step) => {
  const text = step.value ?? "";
  const dur = step.duration ?? sec(2);
  if (frame <= step.frame) return 0;
  const w = [...text].map((ch, i) => (0.7 + 0.6 * random(`type-${i}`)) * (ch === " " ? 1.5 : 1));
  const total = w.reduce((a, b) => a + b, 0);
  const t = clamp01((frame - step.frame) / dur) * total;
  let acc = 0;
  for (let i = 0; i < w.length; i++) {
    acc += w[i];
    if (t < acc) return i;
  }
  return text.length;
};

export interface Scene4State {
  typed: string;
  focused: boolean;
  /** 0..1: progres peralihan halaman pencarian -> halaman hasil setelah Enter */
  results: number;
  /** 0..1: progres membuka hasil pertama (loading) setelah diklik */
  navigating: number;
  /** hasil pertama sedang di-hover (kursor di atasnya) */
  hoverResult: boolean;
}

export const scene4State = (frame: number, steps: Step[] = SCENE4_SCRIPT): Scene4State => {
  const click = first(steps, "click", "search-field");
  const type = first(steps, "type");
  const enter = first(steps, "press");
  const open = first(steps, "click", "result-1");
  const typed = type ? (type.value ?? "").slice(0, typedCount(frame, type)) : "";
  const finished = type && frame >= type.frame + (type.duration ?? 0) ? type.value ?? "" : typed;
  const cur = cursorAt(frame, steps);
  const r1 = TARGETS["result-1"];
  return {
    typed: finished,
    focused: !!click && frame >= click.frame && !(enter && frame >= enter.frame + sec(0.1)),
    results: enter ? clamp01((frame - enter.frame) / sec(0.55)) : 0,
    navigating: open ? clamp01((frame - open.frame - sec(0.05)) / sec(0.55)) : 0,
    hoverResult: !!enter && frame > enter.frame && Math.hypot(cur.x - r1.x, cur.y - r1.y) < 40,
  };
};

// ---------------------------------------------------------------------------
// Adegan 5-8 (0:36-0:56): UI simulasi halaman web. `frame` = frame sejak 0:36 (awal adegan 5).
// target: "province-kaltim", "btn-show-all", "select-year", "select-category", "option" (value "year:2023" / "category:genset"),
// "card-first", "tab-<kategori>". Posisi target dihitung dari tata letak halaman (web/session.ts), bukan ditulis tangan di sini.
// ---------------------------------------------------------------------------
/** Waktu adegan 9 relatif terhadap 0:36 (adegan 9 mulai di 20 detik). */
export const S9_START = sec(20);
export const S9_CURSOR_AT = S9_START + sec(CONFIG.scene9.cursorStart);
export const S9_CLICK_AT = S9_CURSOR_AT + sec(CONFIG.scene9.cursorMove + CONFIG.scene9.hoverPause);

export const SCENE58_SCRIPT: Step[] = [
  // Adegan 5 (0:36-0:42): klik provinsi Kalimantan di peta, panel daftar proyek terbuka. Teks: "Just by clicking."
  { frame: sec(1.75), action: "moveTo", target: "province-kaltim", duration: sec(0.95) },
  { frame: sec(2.85), action: "click", target: "province-kaltim" },
  { frame: sec(4.55), action: "moveTo", target: "btn-show-all", duration: sec(0.6) },
  { frame: sec(5.3), action: "click", target: "btn-show-all" },
  // Adegan 6 (0:42-0:47): buka dropdown Tahun lalu Kategori, daftar ter-filter dengan animasi. Teks: "Filter by year and type"
  { frame: sec(6.15), action: "moveTo", target: "select-year", duration: sec(0.6) },
  { frame: sec(6.85), action: "click", target: "select-year" },
  { frame: sec(7.1), action: "moveTo", target: "option", value: "year:2023", duration: sec(0.55) },
  { frame: sec(7.85), action: "click", target: "option", value: "year:2023" },
  { frame: sec(8.3), action: "moveTo", target: "select-category", duration: sec(0.55) },
  { frame: sec(9.0), action: "click", target: "select-category" },
  { frame: sec(9.25), action: "moveTo", target: "option", value: "category:genset", duration: sec(0.55) },
  { frame: sec(10.0), action: "click", target: "option", value: "category:genset" },
  // Adegan 7 (0:47-0:51): klik satu proyek, drawer detail terbuka. Teks: "Scope. Client. Site photos."
  { frame: sec(11.25), action: "moveTo", target: "card-first", duration: sec(0.7) },
  { frame: sec(12.1), action: "click", target: "card-first" },
  { frame: sec(14.9), action: "press", value: "Escape" }, // Esc menutup drawer (sama seperti di web)
  // Adegan 8 (0:51-0:56): klik tab kategori, model 3D berputar otomatis dan berganti. Teks: "See each type of work in 3D"
  { frame: sec(15.55), action: "moveTo", target: "tab-boiler", duration: sec(0.65) },
  { frame: sec(16.3), action: "click", target: "tab-boiler" },
  { frame: sec(16.75), action: "moveTo", target: "tab-genset", duration: sec(0.5) },
  { frame: sec(17.35), action: "click", target: "tab-genset" },
  { frame: sec(17.8), action: "moveTo", target: "tab-water", duration: sec(0.5) },
  { frame: sec(18.4), action: "click", target: "tab-water" },
  { frame: sec(18.85), action: "moveTo", target: "tab-piping", duration: sec(0.5) },
  { frame: sec(19.4), action: "click", target: "tab-piping" },
  // Adegan 9 (0:56): kursor meluncur ke tombol "Main Website" di navbar, jeda, klik. Waktu dari CONFIG.scene9.
  { frame: S9_CURSOR_AT, action: "moveTo", target: "nav-main", duration: sec(CONFIG.scene9.cursorMove) },
  { frame: S9_CLICK_AT, action: "click", target: "nav-main" },
];

/** Gulir halaman di dalam jendela. `to` = bagian halaman tujuan (posisi dihitung dari tata letak). */
export const SCENE58_SCROLL: { frame: number; to: "top" | "peta" | "proyek"; duration: number }[] = [
  { frame: sec(0.45), to: "peta", duration: sec(1.1) },
  { frame: sec(15.05), to: "proyek", duration: sec(1.0) },
];

/** Batas adegan 5-8 relatif terhadap 0:36, untuk teks keterangan. */
export const SCENE58_CAPTIONS: { from: number; to: number; text: string }[] = [
  { from: sec(1.2), to: sec(6.0), text: CONFIG.captions.click },
  { from: sec(6.0), to: sec(11.0), text: CONFIG.captions.filter },
  { from: sec(11.0), to: sec(15.0), text: CONFIG.captions.detail },
  { from: sec(15.0), to: sec(20.0), text: CONFIG.captions.models },
];
