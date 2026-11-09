// Penggabungan varian penulisan nama klien (owner/customer) yang SAMA. Kunci = nama kanonik yang dipakai; nilai = varian di CSV.
// JANGAN menggabungkan anak perusahaan atau entitas berbeda (mis. PT PLN Batam, PT Wijaya Rekayasa Konstruksi, KSO Sewatama - MAP
// tetap berdiri sendiri). Perbandingan tidak peka huruf besar/kecil dan mengabaikan tanda baca. Dipakai oleh scripts/import-projects.ts.
export const CLIENT_ALIASES: Record<string, string[]> = {
  "PT PLN Persero": ["PT PLN"],
  "PT Wijaya Karya": ["PT Wika"],
  "PT Thermax International Indonesia": ["PT Thermax International"],
  "PT Inductotherm Indonesia": ["PT Inductotherm"],
  "PT Aggreko Indonesia": ["PT Aggreko International", "PT Aggreko - Kbt"],
  "PT Sumberdaya Sewatama": ["PT Sewatama"],
};

const key = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
const INDEX = new Map<string, string>();
for (const [canonical, variants] of Object.entries(CLIENT_ALIASES)) for (const v of variants) INDEX.set(key(v), canonical);

/** Nama kanonik untuk sebuah nama klien (apa adanya bila tidak ada alias). */
export const canonicalClient = (name: string): string => INDEX.get(key(name)) ?? name;
