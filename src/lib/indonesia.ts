// Dataset statis provinsi -> kota/kabupaten beserta koordinat pusatnya (perkiraan).
// Tidak memakai API eksternal. Kota yang belum ada bisa ditambah di bawah;
// admin juga bisa menggeser pin di mini-peta untuk memperhalus posisi.
// Format: [nama, lat, lng]
type City = [string, number, number];

const RAW: Record<string, City[]> = {
  Aceh: [["Banda Aceh", 5.55, 95.32], ["Lhokseumawe", 5.18, 97.15], ["Langsa", 4.47, 97.97], ["Meulaboh", 4.14, 96.13], ["Aceh Timur", 4.63, 97.65], ["Aceh Utara", 5.1, 97.1]],
  "Sumatera Utara": [["Medan", 3.59, 98.67], ["Binjai", 3.6, 98.49], ["Pematangsiantar", 2.96, 99.06], ["Tebing Tinggi", 3.33, 99.16], ["Labuhanbatu", 2.33, 99.85], ["Asahan", 2.98, 99.62], ["Sibolga", 1.74, 98.78], ["Deli Serdang", 3.43, 98.73], ["Belawan (Medan)", 3.78, 98.69]],
  "Sumatera Barat": [["Padang", -0.95, 100.35], ["Bukittinggi", -0.31, 100.37], ["Payakumbuh", -0.23, 100.63], ["Solok", -0.8, 100.65], ["Pariaman", -0.63, 100.12]],
  Riau: [["Pekanbaru", 0.51, 101.45], ["Dumai", 1.67, 101.45], ["Siak", 0.8, 102.05], ["Kampar", 0.34, 101.1], ["Bengkalis", 1.47, 102.1], ["Indragiri Hulu", -0.73, 102.25], ["Pelalawan", 0.4, 102.0], ["Selat Panjang (Kepulauan Meranti)", 1, 102.72]],
  "Kepulauan Riau": [["Batam", 1.05, 104.03], ["Tanjung Pinang", 0.92, 104.45], ["Karimun", 1.0, 103.4], ["Bintan", 1.1, 104.5]],
  Jambi: [["Jambi", -1.61, 103.61], ["Batanghari", -1.7, 103.1], ["Muaro Jambi", -1.5, 103.9], ["Sarolangun", -2.3, 102.7]],
  "Sumatera Selatan": [["Palembang", -2.98, 104.75], ["Prabumulih", -3.43, 104.24], ["Lubuklinggau", -3.3, 102.86], ["Muara Enim", -3.65, 103.77], ["Banyuasin", -2.6, 104.5], ["Musi Banyuasin", -2.55, 103.95]],
  "Kepulauan Bangka Belitung": [["Pangkal Pinang", -2.13, 106.11], ["Bangka", -2.0, 105.9], ["Belitung", -2.75, 107.65]],
  Bengkulu: [["Bengkulu", -3.8, 102.26], ["Rejang Lebong", -3.45, 102.55], ["Seluma", -4.0, 102.45]],
  Lampung: [["Bandar Lampung", -5.43, 105.26], ["Metro", -5.11, 105.31], ["Lampung Selatan", -5.56, 105.55], ["Lampung Tengah", -4.95, 105.25], ["Tulang Bawang", -4.4, 105.9]],
  Banten: [["Serang", -6.12, 106.15], ["Cilegon", -6.0, 106.02], ["Tangerang", -6.18, 106.63], ["Tangerang Selatan", -6.29, 106.71], ["Lebak", -6.55, 106.25], ["Labuan (Pandeglang)", -6.37, 105.83], ["Cikande (Serang)", -6.22, 106.31]],
  "DKI Jakarta": [["Jakarta Pusat", -6.18, 106.83], ["Jakarta Utara", -6.14, 106.89], ["Jakarta Barat", -6.17, 106.76], ["Jakarta Selatan", -6.26, 106.81], ["Jakarta Timur", -6.23, 106.9]],
  "Jawa Barat": [["Bandung", -6.91, 107.61], ["Bekasi", -6.24, 106.99], ["Bogor", -6.6, 106.8], ["Depok", -6.4, 106.82], ["Cirebon", -6.71, 108.56], ["Karawang", -6.31, 107.34], ["Purwakarta", -6.56, 107.44], ["Indramayu", -6.33, 108.32], ["Subang", -6.57, 107.76], ["Sukabumi", -6.92, 106.93], ["Cianjur", -6.82, 107.14], ["Tasikmalaya", -7.33, 108.22], ["Cikarang", -6.31, 107.15], ["Cileungsi", -6.39, 106.96], ["Cibitung", -6.27, 107.08], ["Cikampek", -6.41, 107.45], ["Palabuhan Ratu (Sukabumi)", -6.99, 106.55]],
  "Jawa Tengah": [["Semarang", -6.97, 110.42], ["Surakarta (Solo)", -7.57, 110.82], ["Cilacap", -7.73, 109.02], ["Tegal", -6.87, 109.14], ["Pekalongan", -6.89, 109.68], ["Kudus", -6.8, 110.84], ["Jepara", -6.59, 110.67], ["Magelang", -7.47, 110.22], ["Banyumas", -7.45, 109.15], ["Sukoharjo", -7.68, 110.84], ["Karanganyar", -7.6, 110.95], ["Batang", -6.91, 109.73], ["Kendal", -6.92, 110.2]],
  "DI Yogyakarta": [["Yogyakarta", -7.8, 110.36], ["Sleman", -7.72, 110.35], ["Bantul", -7.89, 110.33], ["Kulon Progo", -7.86, 110.16]],
  "Jawa Timur": [["Surabaya", -7.25, 112.75], ["Sidoarjo", -7.45, 112.72], ["Gresik", -7.16, 112.65], ["Malang", -7.98, 112.63], ["Pasuruan", -7.65, 112.91], ["Mojokerto", -7.47, 112.43], ["Kediri", -7.82, 112.01], ["Banyuwangi", -8.22, 114.37], ["Jember", -8.17, 113.7], ["Probolinggo", -7.75, 113.22], ["Tuban", -6.9, 112.05], ["Madiun", -7.63, 111.52], ["Lamongan", -7.12, 112.41], ["Jombang", -7.55, 112.23], ["Bojonegoro", -7.15, 111.88]],
  Bali: [["Denpasar", -8.65, 115.22], ["Badung", -8.55, 115.18], ["Gianyar", -8.54, 115.33], ["Buleleng", -8.11, 115.09], ["Karangasem", -8.45, 115.6]],
  "Nusa Tenggara Barat": [["Mataram", -8.58, 116.1], ["Lombok Barat", -8.65, 116.15], ["Lombok Timur", -8.65, 116.55], ["Sumbawa", -8.5, 117.42], ["Bima", -8.46, 118.73]],
  "Nusa Tenggara Timur": [["Kupang", -10.18, 123.6], ["Waingapu (Sumba Timur)", -9.66, 120.26], ["Ende", -8.84, 121.66], ["Maumere (Sikka)", -8.62, 122.21], ["Labuan Bajo (Manggarai Barat)", -8.5, 119.88], ["Tambolaka (Sumba Barat Daya)", -9.4, 119.25], ["Atambua (Belu)", -9.1, 124.89], ["Rote Ndao", -10.75, 123.1], ["Alor", -8.25, 124.6], ["Larantuka (Flores Timur)", -8.34, 122.99]],
  "Kalimantan Barat": [["Pontianak", -0.03, 109.33], ["Singkawang", 0.9, 108.98], ["Sanggau", 0.12, 110.6], ["Sintang", 0.08, 111.5], ["Ketapang", -1.83, 109.98], ["Kubu Raya", -0.35, 109.4]],
  "Kalimantan Tengah": [["Palangka Raya", -2.21, 113.92], ["Sampit (Kotawaringin Timur)", -2.53, 112.95], ["Pangkalan Bun", -2.68, 111.62], ["Kapuas", -3.0, 114.4]],
  "Kalimantan Selatan": [["Banjarmasin", -3.32, 114.59], ["Banjarbaru", -3.44, 114.83], ["Tanah Laut", -3.8, 114.8], ["Kotabaru", -3.25, 116.2], ["Tabalong", -2.0, 115.4]],
  "Kalimantan Timur": [["Samarinda", -0.5, 117.15], ["Balikpapan", -1.24, 116.83], ["Bontang", 0.13, 117.5], ["Kutai Kartanegara", -0.45, 116.95], ["Kutai Timur", 0.55, 117.9], ["Penajam Paser Utara", -1.2, 116.7]],
  "Kalimantan Utara": [["Tarakan", 3.3, 117.63], ["Tanjung Selor (Bulungan)", 2.84, 117.37], ["Nunukan", 4.14, 117.66]],
  "Sulawesi Utara": [["Manado", 1.47, 124.84], ["Bitung", 1.44, 125.19], ["Tomohon", 1.32, 124.84], ["Minahasa Selatan (Amurang)", 1.2, 124.58], ["Minahasa Utara", 1.5, 125.0], ["Kotamobagu", 0.73, 124.31]],
  Gorontalo: [["Gorontalo", 0.54, 123.06], ["Gorontalo Utara", 0.9, 122.5], ["Boalemo", 0.65, 122.35]],
  "Sulawesi Tengah": [["Palu", -0.9, 119.87], ["Donggala", -0.68, 119.74], ["Morowali", -2.7, 121.9], ["Banggai", -1.6, 123.5], ["Poso", -1.4, 120.75], ["Luwuk", -0.95, 122.79]],
  "Sulawesi Barat": [["Mamuju", -2.68, 118.89], ["Majene", -3.54, 118.97], ["Polewali Mandar", -3.43, 119.34]],
  "Sulawesi Selatan": [["Makassar", -5.15, 119.43], ["Parepare", -4.01, 119.63], ["Palopo", -2.99, 120.2], ["Maros", -4.99, 119.57], ["Gowa", -5.3, 119.45], ["Bone", -4.75, 120.3], ["Pangkep", -4.8, 119.55]],
  "Sulawesi Tenggara": [["Kendari", -3.97, 122.51], ["Bau-Bau", -5.47, 122.63], ["Kolaka", -4.05, 121.6], ["Konawe", -3.9, 122.1]],
  Maluku: [["Ambon", -3.7, 128.18], ["Tual", -5.64, 132.75], ["Maluku Tengah", -3.3, 129.5], ["Seram Bagian Barat", -3.1, 128.2], ["Dobo (Kepulauan Aru)", -5.77, 134.22], ["Saumlaki (Maluku Tenggara Barat)", -7.98, 131.3]],
  "Maluku Utara": [["Ternate", 0.79, 127.38], ["Tidore", 0.68, 127.4], ["Halmahera Utara", 1.6, 128.0], ["Halmahera Tengah", 0.5, 128.2], ["Sanana (Kepulauan Sula)", -2.06, 125.97]],
  "Papua Barat": [["Manokwari", -0.86, 134.06], ["Fakfak", -2.92, 132.3], ["Teluk Bintuni", -2.2, 133.5], ["Kaimana", -3.65, 133.75]],
  "Papua Barat Daya": [["Sorong", -0.88, 131.26], ["Raja Ampat", -0.5, 130.8], ["Sorong Selatan", -1.9, 132.0]],
  Papua: [["Jayapura", -2.53, 140.72], ["Keerom", -3.2, 140.8], ["Biak Numfor", -1.18, 136.1]],
  "Papua Tengah": [["Nabire", -3.37, 135.49], ["Mimika (Timika)", -4.55, 136.89], ["Paniai", -3.9, 136.3]],
  "Papua Pegunungan": [["Wamena (Jayawijaya)", -4.1, 138.95], ["Yahukimo", -4.6, 139.5]],
  "Papua Selatan": [["Merauke", -8.5, 140.4], ["Mappi", -7.1, 139.4], ["Boven Digoel", -6.1, 140.3]],
};

export interface CityInfo {
  name: string;
  lat: number;
  lng: number;
}

export const PROVINCES: string[] = Object.keys(RAW).sort((a, b) => a.localeCompare(b, "id"));

export function citiesOf(province: string): CityInfo[] {
  return (RAW[province] ?? [])
    .map(([name, lat, lng]) => ({ name, lat, lng }))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
}

export function findCity(province: string, city: string): CityInfo | undefined {
  return citiesOf(province).find((c) => c.name === city);
}

export const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [-11.2, 94.8],
  [6.2, 141.2],
];
