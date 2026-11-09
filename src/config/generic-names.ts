// Nama proyek di data sumber yang berupa istilah umum. Nama aslinya TETAP disimpan; di kartu, judul tampilan menjadi
// "<Nama> · <Kota>" (lihat displayName() di src/lib/display.ts). Tambahkan nama lain di sini bila perlu.
export const GENERIC_PROJECT_NAMES = [
  "Factory Renovation",
  "Building Renovation",
  "Renovation",
  "Water Treatment Work",
  "HVAC Work",
  "Chiller & Genset Work",
  "Mining Facility",
];

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const SET = new Set(GENERIC_PROJECT_NAMES.map(norm));

export const isGenericName = (name: string): boolean => SET.has(norm(name));
