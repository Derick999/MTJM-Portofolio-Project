// Isi FAQ beranda. CONTOH: konfirmasi ke MTJM sebelum publikasi. Jangan menambah klaim di luar daftar ini.
// Setiap jawaban diakhiri tautan "Selengkapnya" ke website utama; item `contact: true` juga menautkan halaman Contact (SITE.contactUrl).
export const FAQ_TITLE = "Pertanyaan yang Sering Diajukan";
export const FAQ_MORE_LABEL = "Selengkapnya di pt-mtjm.co.id";
export const FAQ_CONTACT_LABEL = "Buka halaman Contact";

export interface FaqItem {
  q: string;
  a: string;
  /** Tampilkan tautan ke halaman Contact di web utama. */
  contact?: boolean;
}

export const FAQ: FaqItem[] = [
  {
    q: "Apakah MTJM menangani proyek dari desain sampai konstruksi?",
    a: "Ya, MTJM bergerak di bidang EPC (Engineering, Procurement, Construction), baik sebagai main contractor maupun sub-contractor. Rincian layanan dan proses kerja ada di website resmi.",
  },
  {
    q: "Wilayah mana saja yang sudah pernah dikerjakan?",
    a: "Proyek MTJM tersebar di berbagai wilayah Indonesia. Pilih layanan di atas untuk melihat lokasinya di peta. Daftar lengkap ada di website resmi.",
  },
  {
    q: "Sertifikasi dan legalitas apa yang dimiliki?",
    a: "MTJM adalah anggota ASPEKNAS, bersertifikasi HSE (SMK3), dan memiliki SBU Jasa Pelaksana Konstruksi bidang Mechanical. Dokumen lengkap tersedia di website resmi.",
  },
  {
    q: "Apakah MTJM menerima pekerjaan sebagai sub-kontraktor?",
    a: "Ya, MTJM dapat bekerja sebagai main contractor maupun sub-contractor. Informasi lebih lanjut ada di website resmi.",
  },
  {
    q: "Bagaimana cara berdiskusi atau meminta penawaran?",
    a: "Silakan hubungi MTJM lewat halaman Contact di website resmi untuk berdiskusi atau meminta penawaran.",
    contact: true,
  },
  {
    q: "Apakah semua proyek ada di halaman ini?",
    a: "Halaman ini menampilkan proyek pilihan. Seluruh pengalaman dan profil perusahaan ada di website resmi.",
  },
];
