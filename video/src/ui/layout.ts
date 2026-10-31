// Ukuran jendela browser tiruan dan posisi target kursor (koordinat jendela, piksel).
// Dipakai bersama oleh halaman (supaya elemen ada di tempat yang sama) dan script.ts (tujuan kursor).

export const WIN = { w: 1640, h: 920, chrome: 84 }; // chrome = tinggi tab + toolbar di atas halaman

/** Tata letak halaman pencarian (koordinat relatif terhadap area halaman, di bawah chrome). */
export const PAGE = {
  // sebelum Enter: kolom pencarian di tengah
  fieldBefore: { cx: 820, cy: 330, w: 760, h: 72 },
  // sesudah Enter: kolom naik ke kiri atas, hasil muncul di bawahnya
  fieldAfter: { cx: 560, cy: 74, w: 640, h: 64 },
  resultsX: 200,
  resultsY: 170,
  resultGap: 168,
};

/** Titik tujuan kursor (koordinat jendela, termasuk chrome). */
export const TARGETS: Record<string, { x: number; y: number }> = {
  "search-field": { x: PAGE.fieldBefore.cx - 150, y: WIN.chrome + PAGE.fieldBefore.cy },
  "result-1": { x: PAGE.resultsX + 330, y: WIN.chrome + PAGE.resultsY + 52 },
};

/** Posisi awal kursor (di luar tengah layar, kanan-bawah). */
export const CURSOR_START = { x: WIN.w - 140, y: WIN.h - 120 };
