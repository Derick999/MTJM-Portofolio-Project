// Semua teks & data perusahaan di satu tempat. Ubah di sini, bukan di komponen.
export const SITE = {
  name: "PT Multi Tehnik Jaya Mandiri",
  short: "MTJM",
  tagline: "Portofolio proyek EPC: boiler, genset, water treatment, piping, relokasi, dan modifikasi container.",
  /** Website utama perusahaan. */
  url: process.env.NEXT_PUBLIC_COMPANY_URL || "https://pt-mtjm.co.id",
  urlLabel: "pt-mtjm.co.id",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: { src: "/mtjm-logo.jpg", width: 738, height: 225 },
  /**
   * Halaman Contact di web utama (tujuan jawaban FAQ "cara berdiskusi / meminta penawaran").
   * TODO: ganti ke URL halaman Contact yang sebenarnya, mis. "https://pt-mtjm.co.id/contact".
   */
  contactUrl: process.env.NEXT_PUBLIC_COMPANY_CONTACT_URL || process.env.NEXT_PUBLIC_COMPANY_URL || "https://pt-mtjm.co.id",
  /** Parameter pelacak (UTM) untuk SEMUA tautan ke web utama; dibuat lewat mainSiteHref() di src/lib/links.ts. */
  utm: { source: "portofolio", medium: "web", campaign: "proyek" },

  /** Menu navbar (diikuti tombol Main Website). */
  nav: [
    { href: "/", label: "Beranda" },
    { href: "/#layanan", label: "Layanan" },
    { href: "/proyek", label: "Peta & Proyek" },
    { href: "/#faq", label: "FAQ" },
  ] as { href: string; label: string }[],
  mainSiteButton: "Main Website",
  backToTop: "Kembali ke atas",

  /** Tampilkan owner/customer ke publik (kartu: owner, bila kosong customer; drawer: Owner dan Customer). Matikan bila MTJM meminta. */
  showClientNames: true,

  hero: {
    eyebrow: "Your Technical Partner",
    title: "Setiap proyek punya tempat di peta.",
    text: "Riwayat proyek PT Multi Tehnik Jaya Mandiri di seluruh Indonesia, dari pembangkit sampai pengolahan air.",
    primary: { label: "Lihat Peta & Proyek", href: "/proyek" },
  },

  /** Judul blok angka di bawah hero. KONFIRMASI tahun ke MTJM sebelum publikasi. */
  statsBlock: {
    headline: "Rekam jejak kami sejak 2012",
  },

  /** Halaman Peta & Proyek (/proyek): keterangan di bawah judul dan tautan kecil ke daftar lengkap di web utama. */
  searchPage: {
    note: "Menampilkan proyek pilihan kami",
    moreLabel: "Daftar pengalaman lengkap di pt-mtjm.co.id",
  },

  /** Nilai awal angka statistik (dipakai bila database belum terhubung). Diubah admin lewat /admin. */
  statsDefaults: [
    { key: "projects", value: 165, label: "Proyek" },
    { key: "clients", value: 50, label: "Klien" },
    { key: "locations", value: 20, label: "Lokasi di Indonesia" },
  ],

  cta: {
    title: "Ingin Tahu Lebih Jauh tentang MTJM?",
    text: "Profil lengkap perusahaan, layanan, sertifikasi, dan kabar terbaru kami tersedia di website resmi.",
    button: "Kunjungi pt-mtjm.co.id",
    /** Tautan unduh hanya tampil bila file ini ada di folder public/. */
    profileFile: "/company-profile.pdf",
    profileLabel: "Unduh Company Profile",
  },
  moreInfoLabel: "Info lengkap di pt-mtjm.co.id",
};
