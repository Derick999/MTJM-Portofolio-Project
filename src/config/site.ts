// Semua teks & data perusahaan di satu tempat. Ubah di sini, bukan di komponen.
// Alamat/telepon/email bisa ditimpa lewat environment variable (lihat .env.example).
export const SITE = {
  name: "PT Multi Tehnik Jaya Mandiri",
  short: "MTJM",
  tagline: "Portofolio proyek EPC: boiler, genset, water treatment, piping, relokasi, dan modifikasi container.",
  /** Website utama perusahaan. */
  url: process.env.NEXT_PUBLIC_COMPANY_URL || "https://pt-mtjm.co.id",
  urlLabel: "pt-mtjm.co.id",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  logo: { src: "/mtjm-logo.jpg", width: 738, height: 225 },
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Jl. Bumur I No. 72, Kranggan, Bekasi",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "poltak.sinaga@pt-mtjm.co.id",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+62 811 8702 119",

  nav: [
    { href: "/", label: "Beranda" },
    { href: "/#proyek", label: "Proyek" },
    { href: "/#peta", label: "Peta" },
    { href: "/#hubungi", label: "Hubungi" },
  ],
  mainSiteButton: "Website Utama",

  hero: {
    eyebrow: "Your Technical Partner",
    title: "Portofolio Proyek MTJM",
    text: "Jejak pekerjaan kami di seluruh Indonesia: boiler, genset, water treatment, piping, relokasi, dan modifikasi container.",
    primary: { label: "Lihat Peta Proyek", href: "#peta" },
    secondary: { label: "Proyek per Kategori", href: "#proyek" },
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
