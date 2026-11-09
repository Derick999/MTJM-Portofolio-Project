// Isi FAQ beranda. CONTOH: konfirmasi ke MTJM sebelum publikasi. Jangan menambah klaim di luar daftar ini.
// `{phone}` dan `{email}` diganti otomatis dari src/config/site.ts. Setiap jawaban diakhiri tautan "Selengkapnya" ke website utama.
export const FAQ_TITLE = "Pertanyaan yang Sering Diajukan";
export const FAQ_MORE_LABEL = "Selengkapnya di pt-mtjm.co.id";

export interface FaqItem {
  q: string;
  a: string;
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
    a: "Hubungi MTJM lewat telepon {phone} atau email {email}, atau kunjungi website resmi.",
  },
  {
    q: "Apakah semua proyek ada di halaman ini?",
    a: "Halaman ini menampilkan proyek pilihan. Seluruh pengalaman dan profil perusahaan ada di website resmi.",
  },
];
