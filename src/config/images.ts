// Daftar gambar umum (BUKAN foto proyek) untuk latar hero dan latar kartu group layanan.
//
// Foto SEMENTARA (placeholder): foto umum berlisensi bebas (Unsplash / Pexels / Pixabay) yang Anda unduh sendiri dan taruh di
// public/placeholder/. Isi `source` dan `license` untuk tiap foto yang dipakai. Entri yang filenya belum ada diabaikan
// (hero memakai gradasi navy + pola titik peta; kartu group memakai gradasi warna group).
//
// ATURAN: foto placeholder HANYA untuk latar hero dan latar kartu group. Tidak boleh dipakai di kartu proyek, galeri, drawer
// detail, atau gambar OG (kodenya hanya membaca daftar ini lewat src/lib/placeholders.ts dari hero dan kartu group).
// Foto proyek asli dari database untuk suatu group menggantikan placeholder kartu group secara otomatis.
//
// Mengganti dengan foto asli perusahaan: taruh file, ubah `src`, set `placeholder: false`, isi `license: "Milik MTJM"`.
// Saat build production, foto dengan placeholder: true yang filenya ada akan dicatat di log sebagai peringatan.
import type { GroupSlug } from "./services";

export interface SiteImage {
  id: string;
  /** Path di folder public/, mis. "/placeholder/hero.jpg". */
  src: string;
  alt: string;
  placeholder: boolean;
  /** Halaman asal foto (URL Unsplash/Pexels/Pixabay) atau keterangan lain. */
  source: string;
  /** Lisensi / atribusi, mis. "Unsplash License - Foto oleh Nama Fotografer". */
  license: string;
  use: "hero" | "group-card";
  /** Untuk use = "group-card". */
  group?: GroupSlug;
}

const TODO_SOURCE = "(isi URL sumber foto)";
const TODO_LICENSE = "(isi lisensi / atribusi)";

const groupImage = (group: GroupSlug, alt: string): SiteImage => ({
  id: `group-${group}`,
  src: `/placeholder/group-${group}.jpg`,
  alt,
  placeholder: true,
  source: TODO_SOURCE,
  license: TODO_LICENSE,
  use: "group-card",
  group,
});

export const IMAGES: SiteImage[] = [
  {
    id: "hero",
    src: "/placeholder/hero.jpg",
    alt: "",
    placeholder: true,
    source: TODO_SOURCE,
    license: TODO_LICENSE,
    use: "hero",
  },
  groupImage("power-plant", ""),
  groupImage("mechanical", ""),
  groupImage("electrical", ""),
  groupImage("civil-architecture", ""),
  groupImage("water-treatment", ""),
  groupImage("storage-tank-boilers", ""),
  groupImage("relocation-dismantling", ""),
  groupImage("industrial-factory", ""),
];
