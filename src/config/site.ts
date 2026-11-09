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
    { href: "/#layanan", label: "Layanan" },
    { href: "/#faq", label: "FAQ" },
  ],
  mainSiteButton: "Main Website",

  /** Tampilkan nama klien ke publik? Matikan sampai MTJM memberi izin; nama klien tetap tersimpan dan terlihat di admin. */
  showClientNames: false,

  hero: {
    eyebrow: "Your Technical Partner",
    title: "Setiap proyek punya tempat di peta.",
    text: "Riwayat proyek PT Multi Tehnik Jaya Mandiri di seluruh Indonesia, dari pembangkit sampai pengolahan air.",
    primary: { label: "Jelajahi Layanan", href: "#layanan" },
  },

  /** Blok angka di bawah hero (di samping headline pendek). "Sejak" tampil tanpa animasi. KONFIRMASI tahun ke MTJM sebelum publikasi. */
  statsBlock: {
    headline: "Dipercaya industri sejak 2012",
    since: { value: "2012", label: "Sejak" },
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
