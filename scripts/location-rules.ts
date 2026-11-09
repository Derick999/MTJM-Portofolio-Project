// Pemetaan teks LOCATION di CSV ke provinsi + kota + koordinat, memakai dataset statis proyek (src/lib/indonesia.ts).
// Aturan eksplisit di sini (mudah dibaca dan diubah): koreksi salah ketik, kota yang ditambahkan ke dataset, singkatan provinsi,
// dan koreksi lokasi. Lokasi yang tidak bisa dipetakan dengan yakin = needs_review (tidak menebak).
import { PROVINCES, citiesOf } from "../src/lib/indonesia.ts";

/** city = kota/kabupaten; city-approx = titik pusat kota (kota tidak tertulis, mis. "JAKARTA"); province = titik provinsi. */
export type Precision = "city" | "city-approx" | "province";
export interface Place {
  province: string;
  /** Kosong bila hanya diketahui sampai provinsi atau pusat kota. */
  city: string;
  lat: number;
  lng: number;
  precision: Precision;
  /** Cara pemetaan, untuk laporan. */
  how: "dataset" | "extra" | "province" | "approx" | "corrected";
  note?: string;
  /** Lokasi perlu dikonfirmasi ke MTJM (proyek tetap tampil). */
  confirm?: string;
}
export type Resolved = { ok: true; place: Place } | { ok: false; reason: string };

// ---------------------------------------------------------------------------
// Normalisasi
// ---------------------------------------------------------------------------
export const norm = (s: string) => s.toUpperCase().replace(/[–—=]/g, "-").replace(/\s+/g, " ").trim();

/** Salah ketik umum di kolom lokasi. */
const TYPOS: [RegExp, string][] = [
  [/KALIMATAN/g, "KALIMANTAN"],
  [/CILENGSI/g, "CILEUNGSI"],
  [/JAWATIMUR/g, "JAWA TIMUR"],
  [/PALANGKARAYA/g, "PALANGKA RAYA"],
];
const fixTypos = (s: string) => TYPOS.reduce((t, [re, to]) => t.replace(re, to), s);

/** Singkatan provinsi/wilayah yang dipakai di CSV. */
const PROVINCE_ABBR: Record<string, string> = {
  JABAR: "Jawa Barat",
  JATENG: "Jawa Tengah",
  JATIM: "Jawa Timur",
  KALBAR: "Kalimantan Barat",
  KALTENG: "Kalimantan Tengah",
  KALSEL: "Kalimantan Selatan",
  KALTIM: "Kalimantan Timur",
  KALTARA: "Kalimantan Utara",
  SULTENG: "Sulawesi Tengah",
  SULUT: "Sulawesi Utara",
  SULSEL: "Sulawesi Selatan",
  SULTRA: "Sulawesi Tenggara",
  SULBAR: "Sulawesi Barat",
  KEPRI: "Kepulauan Riau",
  NTT: "Nusa Tenggara Timur",
  NTB: "Nusa Tenggara Barat",
  BABEL: "Kepulauan Bangka Belitung",
  JAKARTA: "DKI Jakarta",
  DKI: "DKI Jakarta",
};

/** Singkatan kota administrasi Jakarta. */
const JAKARTA_ABBR: Record<string, string> = { JAKUT: "Jakarta Utara", JAKSEL: "Jakarta Selatan", JAKBAR: "Jakarta Barat", JAKTIM: "Jakarta Timur", JAKPUS: "Jakarta Pusat" };

/** Wilayah (bukan kota) yang diketahui provinsinya saja: dipetakan ke titik provinsi. */
const REGION_ALIASES: Record<string, string> = { HALMAHERA: "Maluku Utara" };

/** Titik pusat Jakarta untuk lokasi yang hanya tertulis "JAKARTA" (satu titik, bukan rata-rata kota): Jakarta Pusat. */
const JAKARTA_CENTER = { province: "DKI Jakarta", city: "Jakarta Pusat" };

// ---------------------------------------------------------------------------
// Dataset proyek + titik provinsi
// ---------------------------------------------------------------------------
interface DsCity {
  province: string;
  city: string;
  lat: number;
  lng: number;
}
const DS: DsCity[] = PROVINCES.flatMap((p) => citiesOf(p).map((c) => ({ province: p, city: c.name, lat: c.lat, lng: c.lng })));
const keysOf = (name: string): string[] => {
  const base = name.toUpperCase();
  const paren = /\(([^)]+)\)/.exec(base)?.[1];
  const head = base.replace(/\s*\([^)]*\)/, "").trim();
  return [head, ...(paren ? [paren.trim()] : [])];
};
const DS_INDEX = new Map<string, DsCity[]>();
for (const c of DS) for (const k of keysOf(c.city)) DS_INDEX.set(k, [...(DS_INDEX.get(k) ?? []), c]);

const PROVINCE_NAMES = new Map(PROVINCES.map((p) => [p.toUpperCase(), p]));
/** Titik tengah provinsi = rata-rata koordinat kota di dataset (perkiraan). */
export const provinceCenter = (province: string) => {
  const cs = DS.filter((c) => c.province === province);
  return { lat: +(cs.reduce((n, c) => n + c.lat, 0) / cs.length).toFixed(2), lng: +(cs.reduce((n, c) => n + c.lng, 0) / cs.length).toFixed(2) };
};
const provinceOf = (key: string): string | undefined => PROVINCE_NAMES.get(key) ?? PROVINCE_ABBR[key];

// ---------------------------------------------------------------------------
// Kota yang DITAMBAHKAN ke src/lib/indonesia.ts untuk impor ini (koordinat di sana; perkiraan). Di sini hanya kunci pencarian.
// ---------------------------------------------------------------------------
export const EXTRAS: { keys: string[]; province: string; city: string }[] = [
  { keys: ["CIKARANG"], province: "Jawa Barat", city: "Cikarang" },
  { keys: ["CILEUNGSI"], province: "Jawa Barat", city: "Cileungsi" },
  { keys: ["CIBITUNG"], province: "Jawa Barat", city: "Cibitung" },
  { keys: ["CIKAMPEK"], province: "Jawa Barat", city: "Cikampek" },
  { keys: ["PALABUHAN RATU"], province: "Jawa Barat", city: "Palabuhan Ratu (Sukabumi)" },
  { keys: ["PLTU LABUAN", "LABUAN"], province: "Banten", city: "Labuan (Pandeglang)" },
  { keys: ["CIKANDE"], province: "Banten", city: "Cikande (Serang)" },
  { keys: ["BELAWAN"], province: "Sumatera Utara", city: "Belawan (Medan)" },
  { keys: ["DOBO"], province: "Maluku", city: "Dobo (Kepulauan Aru)" },
  { keys: ["SAUMLAKI"], province: "Maluku", city: "Saumlaki (Maluku Tenggara Barat)" },
  { keys: ["JOMBANG"], province: "Jawa Timur", city: "Jombang" },
  { keys: ["BOJONEGORO"], province: "Jawa Timur", city: "Bojonegoro" },
  { keys: ["KENDAL"], province: "Jawa Tengah", city: "Kendal" },
  { keys: ["SELAT PANJANG"], province: "Riau", city: "Selat Panjang (Kepulauan Meranti)" },
  { keys: ["ROTE"], province: "Nusa Tenggara Timur", city: "Rote Ndao" },
  { keys: ["ALOR"], province: "Nusa Tenggara Timur", city: "Alor" },
  { keys: ["LARANTUKA"], province: "Nusa Tenggara Timur", city: "Larantuka (Flores Timur)" },
];
/** Kota tambahan untuk koreksi lokasi (juga ditambahkan ke dataset). */
export const EXTRA_CORRECTED_CITIES = ["Kaimana", "Sanana (Kepulauan Sula)"];

/** Nama setempat -> kota di dataset (kecamatan/area yang termasuk kota/kabupaten tersebut). */
const ALIASES: Record<string, { province: string; city: string; note: string }> = {
  UKUI: { province: "Riau", city: "Pelalawan", note: "Ukui termasuk Kab. Pelalawan" },
  DURI: { province: "Riau", city: "Bengkalis", note: "Duri termasuk Kab. Bengkalis" },
  LANGGAM: { province: "Riau", city: "Pelalawan", note: "Langgam termasuk Kab. Pelalawan" },
  LIRIK: { province: "Riau", city: "Indragiri Hulu", note: "Lirik termasuk Kab. Indragiri Hulu" },
  RENGAT: { province: "Riau", city: "Indragiri Hulu", note: "Rengat = ibu kota Kab. Indragiri Hulu" },
  SERPONG: { province: "Banten", city: "Tangerang Selatan", note: "Serpong termasuk Kota Tangerang Selatan" },
  MERAK: { province: "Banten", city: "Cilegon", note: "Merak termasuk Kota Cilegon" },
  "PLTU TANJUNG JATI": { province: "Jawa Tengah", city: "Jepara", note: "PLTU Tanjung Jati ada di Kab. Jepara" },
  "PLTU KUPANG": { province: "Nusa Tenggara Timur", city: "Kupang", note: "PLTU Kupang" },
  TOBELO: { province: "Maluku Utara", city: "Halmahera Utara", note: "Tobelo = ibu kota Kab. Halmahera Utara" },
  SUNTER: { province: "DKI Jakarta", city: "Jakarta Utara", note: "Sunter termasuk Jakarta Utara" },
  CAKUNG: { province: "DKI Jakarta", city: "Jakarta Timur", note: "Cakung termasuk Jakarta Timur" },
  SENTUL: { province: "Jawa Barat", city: "Bogor", note: "Sentul termasuk Kab. Bogor" },
};

function dataset(province: string, city: string): DsCity | undefined {
  return DS.find((x) => x.province === province && x.city === city);
}
function place(province: string, city: string, how: Place["how"], note?: string): Place | undefined {
  const c = dataset(province, city);
  return c ? { province, city: c.city, lat: c.lat, lng: c.lng, precision: "city", how, note } : undefined;
}

/** Koreksi lokasi (kunci = teks setelah normalisasi dan perbaikan salah ketik). Semua koreksi dicantumkan di laporan. */
const CORRECTIONS: Record<string, () => Place | undefined> = {
  "CILEUNGSI - BANTEN": () => place("Jawa Barat", "Cileungsi", "corrected", "CSV menulis Banten; Cileungsi ada di Kab. Bogor, Jawa Barat"),
  "BINTUNI - PAPUA": () => place("Papua Barat", "Teluk Bintuni", "corrected", "CSV menulis Bintuni = Papua; Teluk Bintuni ada di Papua Barat"),
  "KAIMANA - PAPUA": () => place("Papua Barat", "Kaimana", "corrected", "CSV menulis Papua; Kaimana ada di Papua Barat"),
  "TIMIKA - PAPUA": () => place("Papua Tengah", "Mimika (Timika)", "corrected", "CSV menulis Papua; Timika (Kab. Mimika) kini masuk Papua Tengah"),
  "SANANA - MALUKU": () => place("Maluku Utara", "Sanana (Kepulauan Sula)", "corrected", "CSV menulis Maluku; Sanana (Kep. Sula) ada di Maluku Utara"),
  "FATMAWATI - JAKBAR": () => place("DKI Jakarta", "Jakarta Selatan", "corrected", "CSV menulis JAKBAR; Fatmawati ada di Jakarta Selatan"),
  "TOYOTA SUNTER - JAKARTA": () => place("DKI Jakarta", "Jakarta Utara", "corrected", "Sunter termasuk Jakarta Utara"),
  // keputusan pemilik data
  KUNINGAN: () => place("DKI Jakarta", "Jakarta Selatan", "corrected", "Kuningan dipetakan ke Jakarta Selatan (keputusan pemilik data)"),
  MENTAYA: () => ({
    ...provincePlace("Kalimantan Tengah", "Mentaya (Kotawaringin Timur): memakai titik provinsi"),
    confirm: "Lokasi perlu dikonfirmasi ke MTJM: Mentaya (Kotawaringin Timur), Kalimantan Tengah",
  }),
};

/** Koreksi berdasarkan NAMA proyek (lokasi di CSV keliru). */
const NAME_OVERRIDES: { re: RegExp; place: () => Place | undefined }[] = [
  { re: /sembakung/i, place: () => place("Kalimantan Utara", "Nunukan", "corrected", "CSV menulis Kalimantan Barat; Sembakung ada di Kab. Nunukan, Kalimantan Utara") },
];
export function nameOverride(text: string): Place | undefined {
  for (const o of NAME_OVERRIDES) if (o.re.test(text)) return o.place();
  return undefined;
}

function provincePlace(province: string, note?: string): Place {
  // "JAKARTA" saja: satu titik pusat kota (Jakarta Pusat), bukan rata-rata kota
  if (province === JAKARTA_CENTER.province) {
    const c = dataset(JAKARTA_CENTER.province, JAKARTA_CENTER.city)!;
    return { province, city: "", lat: c.lat, lng: c.lng, precision: "city-approx", how: "approx", note: note ?? "Jakarta saja yang tertulis; memakai satu titik pusat Jakarta" };
  }
  return { province, city: "", ...provinceCenter(province), precision: "province", how: "province", note };
}

/** Cari nama sebagai kota: dataset (dalam provinsi bila diketahui), alias, atau kota tambahan. */
function asCity(key: string, province?: string): Place | undefined {
  if (JAKARTA_ABBR[key]) return place("DKI Jakarta", JAKARTA_ABBR[key], "dataset");
  const hits = (DS_INDEX.get(key) ?? []).filter((c) => !province || c.province === province);
  const extra = EXTRAS.find((x) => x.keys.includes(key) && (!province || x.province === province));
  if (extra) return place(extra.province, extra.city, "extra", "kota ditambahkan ke src/lib/indonesia.ts (koordinat perkiraan)");
  if (hits.length === 1) return { province: hits[0].province, city: hits[0].city, lat: hits[0].lat, lng: hits[0].lng, precision: "city", how: "dataset" };
  const al = ALIASES[key];
  if (al && (!province || al.province === province)) {
    const p = place(al.province, al.city, "dataset", al.note);
    if (p) return p;
  }
  // kata alias di dalam teks (mis. "TOYOTA SUNTER")
  for (const k of Object.keys(ALIASES).sort((a, b) => b.length - a.length)) if (new RegExp(`\\b${k}\\b`).test(key)) return asCity(k, province);
  return undefined;
}

/** Petakan satu teks LOCATION dari CSV. */
export function resolveLocation(raw: string): Resolved {
  const key = fixTypos(norm(raw)).replace(/\s*-\s*/g, " - ");
  if (!key) return { ok: false, reason: "lokasi kosong" };
  const fix = CORRECTIONS[key]?.();
  if (fix) return { ok: true, place: fix };

  const parts = key.split(/\s*-\s*/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 2) {
    const [a, b] = parts;
    const prov = provinceOf(b);
    if (prov) {
      const c = asCity(a, prov);
      if (c) return { ok: true, place: c };
      return { ok: true, place: provincePlace(prov, `"${a}" tidak ada di dataset kota; memakai titik ${prov === "DKI Jakarta" ? "pusat Jakarta" : "provinsi"}`) };
    }
    const cb = asCity(b);
    if (cb) return { ok: true, place: { ...cb, note: cb.note ?? `"${a}" termasuk ${cb.city}` } };
    const ca = asCity(a);
    if (ca) return { ok: true, place: { ...ca, note: ca.note ?? `"${b}" tidak dipetakan` } };
    return { ok: false, reason: `tidak bisa dipetakan: "${raw.trim()}"` };
  }

  // satu bagian: kota dulu (mis. JAMBI = kota), lalu provinsi/wilayah
  const c = asCity(key);
  if (c) return { ok: true, place: c };
  const prov = provinceOf(key) ?? REGION_ALIASES[key];
  if (prov) return { ok: true, place: provincePlace(prov, "hanya provinsi/wilayah yang tertulis; memakai titik provinsi") };
  return { ok: false, reason: `tidak bisa dipetakan: "${raw.trim()}"` };
}
