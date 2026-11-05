import type { CategoryId } from "@/config/categories";
import type { Project, StatusData } from "@/lib/types";

// Data awal untuk kategori baru (Power Plant, Electrical, Civil, Fire Protection, Storage Tanks, Maintenance, Building Factory).
// TERPISAH dari seed lama (src/data/seed.ts). Sumber: ringkasan company profile. Hanya proyek dengan lokasi dan tahun yang jelas
// yang berstatus "published"; sisanya "draft" dengan catatan "Perlu dicek". Proyek yang bentrok datanya (boiler Dumai,
// boiler Muthu Gading Solo, proyek Lirik, Teluk Lamong) sengaja tidak dimasukkan. Satu proyek = satu kategori utama.
//
// Nama klien (mis. Pertamina, Bentoel) hanya ada di kolom `client`; nama proyek, slug, dan deskripsi dibuat netral supaya
// SITE.showClientNames = false benar-benar menyembunyikannya dari publik.
// Draft yang lokasinya belum diketahui memakai titik sementara (Jakarta atau Bekasi); koordinat itu BUKAN lokasi proyek.
// Jalankan `npm run seed:categories:sql` untuk membuat supabase/seed_categories.sql dari file ini.

type Seed = Omit<Project, "id" | "created_at" | "photos">;

const DEMO = "Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.";

const JKT = { province: "DKI Jakarta", city: "Jakarta", lat: -6.2, lng: 106.82 }; // titik sementara untuk lokasi yang belum diketahui
const CHECK_LOC = "Perlu dicek: lokasi proyek belum diketahui (titik di peta sementara).";

function s(
  slug: string,
  category: CategoryId,
  name: string,
  client: string,
  year: number,
  place: { province: string; city: string; lat: number; lng: number },
  what: string,
  status: StatusData = "published",
  note = "",
): Seed {
  return {
    slug,
    category,
    name,
    client,
    year,
    ...place,
    description: `${what} ${DEMO}`,
    scope: what,
    status_data: status,
    admin_note: note,
  };
}

export const SEED_CATEGORIES: Seed[] = [
  // --- Power Plant ---
  s("pltd-belawan-5x2mw-2019", "power-plant", "PLTD Belawan 5 x 2 MW", "WIKA", 2019, { province: "Sumatera Utara", city: "Medan (Belawan)", lat: 3.78, lng: 98.69 }, "Pembangkit listrik tenaga diesel (PLTD) Belawan, kapasitas 5 x 2 MW."),
  s("pltd-toboali-bangka-2017", "power-plant", "PLTD Toboali, Bangka 7 x 1.000 kW", "", 2017, { province: "Kepulauan Bangka Belitung", city: "Bangka Selatan (Toboali)", lat: -3.01, lng: 106.46 }, "Pembangkit listrik tenaga diesel (PLTD) Toboali, Bangka, kapasitas 7 x 1.000 kW."),
  s("pembangkit-tambang-halmahera-2022", "power-plant", "Pembangkit Tambang Halmahera 11 x 5 MW", "Nusa Halmahera Minerals", 2022, { province: "Maluku Utara", city: "Halmahera Utara", lat: 1.5, lng: 127.9 }, "Pembangkit untuk area tambang di Halmahera, kapasitas 11 x 5 MW.", "draft", "Perlu dicek: lokasi tepat di Halmahera belum dipastikan (koordinat perkiraan)."),

  // --- Electrical Work ---
  s("elektrikal-apartemen-regatta-2016", "electrical-work", "Instalasi Elektrikal Apartemen Regatta", "", 2016, JKT, "Pekerjaan instalasi elektrikal apartemen Regatta.", "draft", CHECK_LOC),
  s("load-bank-data-center-14x400kw-2023", "electrical-work", "Load Bank Data Center 14 x 400 kW", "", 2023, JKT, "Pekerjaan load bank data center, 14 unit @ 400 kW.", "draft", CHECK_LOC),
  s("load-bank-data-center-28x400kw-2024", "electrical-work", "Load Bank Data Center 28 x 400 kW", "", 2024, JKT, "Pekerjaan load bank data center, 28 unit @ 400 kW.", "draft", CHECK_LOC),
  s("kabel-mv-1", "electrical-work", "Penggantian Kabel MV (1)", "Pertamina", 2020, JKT, "Pekerjaan penggantian kabel MV.", "draft", `Perlu dicek: tahun masih perkiraan. ${CHECK_LOC}`),
  s("kabel-mv-2", "electrical-work", "Penggantian Kabel MV (2)", "Barata Indonesia", 2020, JKT, "Pekerjaan penggantian kabel MV.", "draft", `Perlu dicek: tahun masih perkiraan. ${CHECK_LOC}`),

  // --- Civil Work & Steel Structure ---
  s("rak-gudang-sunter-2016", "civil-steel", "Rak Gudang Sunter", "", 2016, { province: "DKI Jakarta", city: "Jakarta Utara (Sunter)", lat: -6.14, lng: 106.87 }, "Pekerjaan rak gudang di Sunter."),
  s("rptra-pondok-kopi-2016", "civil-steel", "RPTRA Pondok Kopi", "", 2016, { province: "DKI Jakarta", city: "Jakarta Timur (Pondok Kopi)", lat: -6.226, lng: 106.926 }, "Pekerjaan ruang publik terpadu ramah anak (RPTRA) Pondok Kopi."),
  s("rptra-pondok-kelapa-2016", "civil-steel", "RPTRA Pondok Kelapa", "", 2016, { province: "DKI Jakarta", city: "Jakarta Timur (Pondok Kelapa)", lat: -6.245, lng: 106.94 }, "Pekerjaan ruang publik terpadu ramah anak (RPTRA) Pondok Kelapa."),
  s("erection-baja-cikarang-2025", "civil-steel", "Erection Struktur Baja Cikarang", "", 2025, { province: "Jawa Barat", city: "Bekasi (Cikarang)", lat: -6.31, lng: 107.15 }, "Pekerjaan erection struktur baja di Cikarang."),
  s("renovasi-gedung-2018", "civil-steel", "Renovasi Gedung", "HKBP", 2018, JKT, "Pekerjaan renovasi gedung.", "draft", CHECK_LOC),
  s("fasilitas-tambang-samarinda-2022", "civil-steel", "Fasilitas Tambang Samarinda", "", 2022, { province: "Kalimantan Timur", city: "Samarinda", lat: -0.5, lng: 117.15 }, "Pekerjaan fasilitas tambang di Samarinda."),

  // --- Fire Protection & Alarm System ---
  s("piping-lpg-hidran-spbe-jatirangon-2011", "fire-protection", "Piping LPG dan Hidran SPBE Jatirangon", "", 2011, { province: "Jawa Barat", city: "Bekasi (Jatirangon)", lat: -6.34, lng: 106.93 }, "Pekerjaan piping LPG dan hidran SPBE Jatirangon."),
  s("hidran-apartemen-regatta-2016", "fire-protection", "Hidran Apartemen Regatta", "", 2016, JKT, "Pekerjaan sistem hidran apartemen Regatta.", "draft", CHECK_LOC),
  s("perbaikan-hidran-2019", "fire-protection", "Perbaikan Hidran", "KDS Indonesia", 2019, JKT, "Pekerjaan perbaikan hidran.", "draft", CHECK_LOC),
  s("fire-fighting-alarm-2022", "fire-protection", "Fire Fighting dan Fire Alarm", "Indorama", 2022, JKT, "Pekerjaan sistem fire fighting dan fire alarm.", "draft", CHECK_LOC),

  // --- Fuel & Water Storage Tanks ---
  s("tangki-air-1500kl-palabuhan-ratu-2018", "storage-tanks", "Tangki Air 1.500 KL Palabuhan Ratu", "", 2018, { province: "Jawa Barat", city: "Sukabumi (Palabuhan Ratu)", lat: -6.99, lng: 106.55 }, "Pekerjaan tangki air kapasitas 1.500 KL di Palabuhan Ratu."),
  s("tangki-fuel-5x20kl-belawan-2019", "storage-tanks", "Tangki Fuel 5 x 20 KL Belawan", "", 2019, { province: "Sumatera Utara", city: "Medan (Belawan)", lat: 3.78, lng: 98.69 }, "Pekerjaan tangki bahan bakar 5 unit @ 20 KL untuk Belawan."),
  s("tangki-2000kl", "storage-tanks", "Tangki 2.000 KL", "Asian Agri", 2020, JKT, "Pekerjaan tangki kapasitas 2.000 KL.", "draft", `Perlu dicek: tahun masih perkiraan. ${CHECK_LOC}`),

  // --- Industrial Maintenance (data tipis di dokumen sumber) ---
  s("shutdown-turn-on-furnace-inductotherm", "industrial-maintenance", "Shut Down dan Turn On Furnace Inductotherm", "", 2020, JKT, "Pekerjaan shut down dan turn on furnace Inductotherm.", "draft", `Minta contoh annual maintenance dari MTJM. Perlu dicek: tahun dan lokasi belum diketahui.`),
  s("annual-maintenance-contoh", "industrial-maintenance", "Annual Maintenance Berkala (contoh)", "", 2020, JKT, "Entri contoh untuk annual maintenance berkala dan instalasi mesin custom.", "draft", "Minta contoh annual maintenance dari MTJM; ganti entri ini dengan proyek sebenarnya."),

  // --- Building Factory ---
  s("renovasi-pabrik-malang-2016", "building-factory", "Renovasi Pabrik, Malang", "Bentoel", 2016, { province: "Jawa Timur", city: "Malang", lat: -7.98, lng: 112.63 }, "Pekerjaan renovasi pabrik di Malang."),
  s("renovasi-pabrik-cikarang-2012", "building-factory", "Renovasi Pabrik, Cikarang", "Mitsubishi Electric", 2012, { province: "Jawa Barat", city: "Bekasi (Cikarang)", lat: -6.31, lng: 107.15 }, "Pekerjaan renovasi pabrik di Cikarang."),
  s("painting-shop-cikampek-2024", "building-factory", "Painting Shop, Cikampek", "Handal Indonesia Motor", 2024, { province: "Jawa Barat", city: "Karawang (Cikampek)", lat: -6.41, lng: 107.45 }, "Pekerjaan painting shop di Cikampek, periode 2024-2025.", "published", "Pekerjaan berjalan 2024-2025; tahun diisi dengan tahun mulai."),
  s("pabrik-cikarang-2024", "building-factory", "Pabrik, Cikarang", "Frina Nusantara", 2024, { province: "Jawa Barat", city: "Bekasi (Cikarang)", lat: -6.31, lng: 107.15 }, "Pekerjaan pabrik di Cikarang."),
];

export function seedCategoryProjects(): Project[] {
  return SEED_CATEGORIES.map((p, i) => ({
    ...p,
    id: `seedc-${i + 1}`,
    created_at: new Date(Date.UTC(2024, 1, 1, 0, i)).toISOString(),
    photos: [], // tanpa foto: kartu memakai ikon kategori
  }));
}
