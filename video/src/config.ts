// SEMUA teks, angka, alamat web, label tombol, dan durasi video dibaca dari file ini.
// Ubah di sini, lalu render ulang. Urutan interaksi kursor (adegan 4-9) ada di script.ts.

export const FPS = 30;

/**
 * Label di titik Bekasi (adegan 3): fade in bersamaan dengan denyut pertama, ditahan `hold`, lalu fade out tepat saat
 * gelombang titik pertama mulai muncul (jadi jeda Bekasi -> gelombang 1 = fadeIn + hold).
 * `offset` = posisi ujung garis penghubung relatif terhadap titik (piksel pada tinggi 1080; negatif = kiri/atas).
 * Default: ke kiri-bawah, di atas Samudra Hindia, agar tidak menimpa titik Jawa dan Sumatra.
 */
const HUB_LABEL = {
  text: "Bekasi · Headquarters", // contoh lain: "Since 2012 · Bekasi"
  fadeIn: 0.3, // detik
  hold: 1.5, // detik
  fadeOut: 0.35, // detik
  offset: { dx: -120, dy: 120 },
} as const;

export const CONFIG = {
  /** Brand */
  brandName: "MTJM",
  companyName: "PT Multi Tehnik Jaya Mandiri",
  logoFile: "mtjm-logo.jpg", // di video/public/

  /** Alamat web & label tombol (label harus sama dengan navbar web: ../src/config/site.ts -> mainSiteButton) */
  mainSiteButton: "Main Website",
  mainSiteUrl: "pt-mtjm.co.id",

  /**
   * Proyek unggulan (slug dari seed web, harus published): fotonya (video/public/photos/<slug>/1.jpg-5.jpg, maks 5) tampil di kartu
   * dan galeri drawer. Tanpa foto -> kartu tanpa foto (ikon kategori + teks). Jangan pakai proyek draft (Dumai, Muthu Gading, Lirik).
   * Foto dikecilkan otomatis saat render (photoMaxWidth px, kualitas JPEG photoQuality).
   */
  featuredProject: "pltd-waingapu-sumba-2023",
  photoMaxWidth: 1600,
  photoQuality: 80,

  /** Tagline brand. Hanya muncul di penutup bila showTagline = true. */
  tagline: "Your Technical Partner",
  showTagline: false,

  /** Adegan 1: dua baris fade in bertahap (satuan detik) */
  openingLines: ["Every project we've delivered", "has a place on the map."],
  opening: {
    startDelay: 0.6, // layar hitam sebelum baris 1
    fadeIn: 0.8, // lama fade in tiap baris
    gap: 0.4, // jeda antara baris 1 selesai dan baris 2 mulai
    hold: 1.2, // tahan setelah baris 2 selesai, sebelum Bumi mulai fade in
    fadeOut: 2.6, // teks memudar perlahan (bersamaan dengan Bumi fade in)
  },

  /** Adegan 3, waktu dalam detik sejak awal adegan 3 */
  scene3: {
    /**
     * Urutan titik: titik pertama di Bekasi (kantor MTJM, ring pulsa besar), lalu menyebar sebagai gelombang.
     * Dalam satu gelombang titik muncul beruntun cepat, diurutkan dari yang terdekat ke Bekasi (menyebar keluar).
     */
    dots: {
      hubStart: 0.3, // detik: titik Bekasi muncul
      hubHold: HUB_LABEL.fadeIn + HUB_LABEL.hold, // jeda setelah Bekasi sebelum gelombang pertama = label tampil penuh, lalu memudar saat gelombang mulai
      dotStagger: 0.055, // jeda antar titik dalam satu gelombang
      waveGap: 0.4, // jeda antar gelombang (disarankan 0,3-0,5)
      /** Urutan gelombang; `regions` mengacu ke id di `regionRules` di bawah. */
      waves: [
        { name: "Jawa dan Sumatra", regions: ["jawa", "sumatra"] },
        { name: "Kalimantan dan Sulawesi", regions: ["kalimantan", "sulawesi"] },
        { name: "Nusa Tenggara dan Papua", regions: ["nusatenggara", "papua"] },
      ],
    },
    listStart: 3.6, // teks layanan mulai
    perItem: 1.0, // tiap kata ditahan minimal segini sebelum kata berikutnya muncul
    lastHold: 1.5, // "and more" ditahan sebelum daftar memudar
    listFadeOut: 0.5,
    pauseBeforeStats: 0.5, // jeda sebelum counter muncul
    statStagger: 0.3, // jarak antar counter
    statRise: 1.8, // lama angka naik
  },
  workTypes: ["Power plants", "Boilers", "Water treatment", "Piping", "and more"],

  // PLACEHOLDER, revisi setelah dikonfirmasi MTJM
  stats: [
    { label: "Projects", value: 165, suffix: "+" }, // PLACEHOLDER, revisi setelah dikonfirmasi MTJM
    { label: "Clients", value: 50, suffix: "+" }, // PLACEHOLDER, revisi setelah dikonfirmasi MTJM
    { label: "Locations", value: 20, suffix: "+" }, // PLACEHOLDER, revisi setelah dikonfirmasi MTJM
  ],

  /** Titik pusat penyebaran (kantor MTJM). Koordinat = Bekasi dari ../src/lib/indonesia.ts. Warna = cyan brand, bukan warna kategori. */
  hub: { name: "Bekasi", lat: -6.24, lng: 106.99, color: "#1dc7f4", label: HUB_LABEL },

  /**
   * Aturan wilayah (kotak lintang/bujur, dicek berurutan, yang pertama cocok dipakai). Titik di luar semua aturan masuk "papua".
   * Dipakai untuk menentukan titik masuk gelombang yang mana.
   */
  regionRules: [
    { id: "nusatenggara", minLat: -11.5, maxLat: -7.8, minLng: 115.4, maxLng: 127.5 },
    { id: "papua", minLat: -90, maxLat: 90, minLng: 126.5, maxLng: 180 },
    { id: "sumatra", minLat: -6.6, maxLat: 6.5, minLng: 90, maxLng: 106.2 },
    { id: "jawa", minLat: -9, maxLat: -5.4, minLng: 105.5, maxLng: 115.4 },
    { id: "kalimantan", minLat: -4.6, maxLat: 7.5, minLng: 108.5, maxLng: 118.2 },
    { id: "sulawesi", minLat: -7, maxLat: 4, minLng: 118.2, maxLng: 126.5 },
  ],

  /** Titik di peta mengambil data seed web (../src/data/seed.ts). false = hanya proyek berstatus published. */
  includeDraftProjects: false,

  /**
   * Titik tambahan agar persebaran merata (Kalimantan 8 titik, plus Sumatra, Sulawesi, Papua).
   * Koordinat = pusat kota dari ../src/lib/indonesia.ts (bukan lokasi proyek).
   * PLACEHOLDER, revisi setelah dikonfirmasi MTJM (ganti dengan lokasi proyek asli sebelum dipublikasikan).
   * province & year juga dipakai untuk "proyek contoh" di adegan 5-8 (seed web belum punya proyek di Kalimantan dll); nama & tahun = PLACEHOLDER.
   */
  extraDots: [
    // Kalimantan: Barat, Tengah, Timur, Selatan
    { name: "Pontianak", province: "Kalimantan Barat", year: 2023, category: "genset", lat: -0.03, lng: 109.33 },
    { name: "Sanggau", province: "Kalimantan Barat", year: 2021, category: "boiler", lat: 0.12, lng: 110.6 },
    { name: "Sampit", province: "Kalimantan Tengah", year: 2019, category: "boiler", lat: -2.53, lng: 112.95 },
    { name: "Palangka Raya", province: "Kalimantan Tengah", year: 2022, category: "piping", lat: -2.21, lng: 113.92 },
    { name: "Banjarmasin", province: "Kalimantan Selatan", year: 2024, category: "water", lat: -3.32, lng: 114.59 },
    { name: "Tabalong", province: "Kalimantan Selatan", year: 2020, category: "relokasi", lat: -2.0, lng: 115.4 },
    { name: "Balikpapan", province: "Kalimantan Timur", year: 2023, category: "piping", lat: -1.24, lng: 116.83 },
    { name: "Samarinda", province: "Kalimantan Timur", year: 2022, category: "container", lat: -0.5, lng: 117.15 },
    // Sumatra
    { name: "Banda Aceh", province: "Aceh", year: 2021, category: "container", lat: 5.55, lng: 95.32 },
    { name: "Medan", province: "Sumatera Utara", year: 2024, category: "boiler", lat: 3.59, lng: 98.67 },
    { name: "Padang", province: "Sumatera Barat", year: 2020, category: "relokasi", lat: -0.95, lng: 100.35 },
    { name: "Jambi", province: "Jambi", year: 2022, category: "water", lat: -1.61, lng: 103.61 },
    { name: "Palembang", province: "Sumatera Selatan", year: 2019, category: "piping", lat: -2.98, lng: 104.75 },
    { name: "Bandar Lampung", province: "Lampung", year: 2021, category: "genset", lat: -5.43, lng: 105.26 },
    // Sulawesi
    { name: "Makassar", province: "Sulawesi Selatan", year: 2023, category: "water", lat: -5.15, lng: 119.43 },
    { name: "Morowali", province: "Sulawesi Tengah", year: 2024, category: "boiler", lat: -2.7, lng: 121.9 },
    { name: "Kendari", province: "Sulawesi Tenggara", year: 2020, category: "piping", lat: -3.97, lng: 122.51 },
    { name: "Gorontalo", province: "Gorontalo", year: 2022, category: "genset", lat: 0.54, lng: 123.06 },
    // Papua
    { name: "Sorong", province: "Papua Barat Daya", year: 2021, category: "piping", lat: -0.88, lng: 131.26 },
    { name: "Manokwari", province: "Papua Barat", year: 2019, category: "genset", lat: -0.86, lng: 134.06 },
    { name: "Timika", province: "Papua Tengah", year: 2023, category: "relokasi", lat: -4.55, lng: 136.89 },
    { name: "Jayapura", province: "Papua", year: 2024, category: "container", lat: -2.53, lng: 140.72 },
  ],

  /**
   * Tampilan Bumi malam dari orbit rendah (adegan 2-3). Waktu `t` = detik sejak awal video.
   * Kamera: dilihat dari selatan Indonesia, menghadap utara, horizon melengkung di atas layar.
   */
  globe: {
    earthFadeInSeconds: 4.0, // Bumi fade in dari hitam (mulai saat baris 2 selesai + tahan)
    /**
     * Putaran Bumi ke samping (kamera hampir diam): Samudra Hindia -> Sumatra -> Indonesia tengah.
     * spinFromDeg = pergeseran bujur di awal (derajat); melambat dengan ease-out dan berhenti di 0 saat Kalimantan-Sulawesi tepat di tengah frame.
     */
    spinFromDeg: 46,
    spinEndAt: 13.0, // detik: putaran berhenti (zoom tetap berjalan)
    /**
     * Kamera dekat ke permukaan sejak frame pertama Bumi (framing = pratinjau v4 detik 12) dan hanya maju pelan ke dalam,
     * tanpa menjauh atau mengitari globe. Satu kurva easing (cubic-bezier) memetakan waktu -> progres 0..1 untuk semua parameter,
     * dengan kecepatan awal tidak nol, jadi kamera tidak pernah diam. Kamera selalu membidik `target`.
     */
    journey: {
      end: 20, // detik: progres mencapai 1 (peta datar); mulai = saat teks adegan 1 mulai memudar
      drift: 0.06, // setelah `end`, kamera tetap maju sangat pelan sampai akhir adegan 3 (6% lebih dekat) agar tidak membeku
      curve: [0.25, 0.15, 0.4, 1] as const, // cubic-bezier(x1, y1, x2, y2): progres ~7% di detik 5, 58% di 10, 81% di 13, 95% di 16
      target: { lat: -1.5, lng: 118 }, // tengah Kalimantan-Sulawesi
      yaw: 0, // arah pandang dari utara (0 = menghadap utara, kamera di selatan)
      // dist = jarak kamera ke target (unit; Bumi = 3), elev = sudut pandang kamera ke bawah (derajat; 90 = tegak lurus ke bawah), fov vertikal, roll = kemiringan horizon
      from: { dist: 4.48, elev: 76.2, fov: 34.7, roll: 3.9 }, // = keadaan v4 pada detik 12
      to: { dist: 3.25, elev: 86, fov: 24, roll: 0 }, // Sumatra-Papua memenuhi ~88% lebar layar, lengkung Bumi keluar frame
      outlineFade: [13.5, 17.5] as const, // garis batas provinsi fade in bersamaan dengan peta mendatar
    },
    lights: { gain: 1.7, boost: 0.6, color: [1.0, 0.56, 0.14] as const }, // lampu kota: penguat, kurva gamma (kecil = redup ikut terang), warna emas
    bloom: { strength: 0.48, radius: 0.45, threshold: 0.62 },
    cloudOpacity: 0.5, // opasitas awal lapisan awan
    cloudDriftDegPerSec: 0.25, // awan bergeser sangat pelan
    /**
     * Awan terlihat di awal, lalu memudar selama zoom: seluruh lapisan turun ke `edgeKeep` (sisa tipis di tepi), dan area Indonesia
     * dibersihkan dari tengah ke luar (awan "menyingkir ke tepi") sehingga Sumatra-Jawa-Kalimantan-Sulawesi-Papua bersih saat titik muncul.
     */
    cloudFade: {
      from: 8.5, // detik: mulai memudar
      to: 15.5, // detik: selesai (titik pertama muncul di 16,3)
      curve: [0.4, 0, 0.6, 1] as const, // cubic-bezier kecepatan fade
      edgeKeep: 0.3, // sisa opasitas awan di luar area Indonesia (0 = hilang total)
      region: { lat: -2, lng: 118, rx: 26, ry: 13 }, // elips area bersih (derajat: setengah lebar bujur, setengah tinggi lintang)
      feather: 0.4, // kelembutan tepi area bersih
    },
    outlineOpacity: 0.32, // garis provinsi tipis pada adegan 3
  },

  /** Adegan 4: layar miring dan pencarian. Urutan & waktu kursor ada di script.ts. */
  searchQuery: "portofolio proyek MTJM",
  scene4: {
    typeCharSeconds: 0.1, // rata-rata lama per huruf (sedikit lebih lambat dari mengetik biasa agar terbaca di LinkedIn)
    /**
     * Jendela browser masuk dengan SLIDE UP (tanpa fade in, solid sejak frame pertama): muncul dari bawah frame dalam kondisi miring,
     * naik dengan ease-out tegas, lalu kamera meluruskan layar. Sudut miring awal tidak berubah (tilt).
     */
    slideUp: {
      duration: 0.7, // detik (disarankan 0,6-0,8)
      fromY: 1300, // piksel di bawah posisi akhir slide (cukup jauh agar jendela mulai di luar frame)
    },
    straighten: { start: 0.6, duration: 1.8 }, // detik: kamera meluruskan layar (dimulai tepat sebelum slide selesai agar mengalir)
    tilt: { x: 430, y: 120, z: -720, rotY: -40, rotX: 13, rotZ: 4.5 }, // pose miring awal (px & derajat)
    /** Bumi (adegan 3) di belakang jendela: tetap bergerak maju, lalu meredup dan mengabur selama slide up; latar navy menggantikan setelahnya. */
    backdrop: {
      dimSeconds: 0.8, // lama meredup/mengabur (mulai saat jendela mulai naik)
      blurPx: 10,
      brightness: 0.45, // kecerahan akhir (1 = tidak redup)
      navyFrom: 1.0, // detik: latar navy mulai menutupi Bumi
      navyDuration: 1.2,
      globeEnd: 2.5, // detik setelah awal adegan 4: Bumi berhenti dirender
    },
  },
  /** Adegan 5-8: halaman web di dalam jendela browser. Urutan klik/gulir ada di script.ts. */
  /**
   * Adegan 9 (penutup). Semua waktu dalam detik sejak awal adegan 9 (0:56). Urutan: kursor meluncur ke tombol navbar,
   * jeda (tombol menyala), klik, jendela mengecil + memudar, logo, teks bertahap, tahan, fade out ke navy, hening.
   * Total = fadeOutStart + fadeOut + silence harus = SCENES.s9[1] - SCENES.s9[0].
   */
  scene9: {
    background: "#14144a", // navy MTJM (warna web: --color-navy)
    cursorStart: 0.0, // kursor mulai meluncur dari posisi terakhir adegan 8
    cursorMove: 0.7, // lama meluncur
    hoverPause: 0.25, // jeda di atas tombol (tombol menyala) sebelum klik
    shrinkDelay: 0.15, // jeda setelah klik sebelum jendela mengecil
    shrink: { seconds: 0.8, toScale: 0.5 },
    logo: { delayAfterShrink: -0.2, fadeSeconds: 0.8, fromScale: 0.95, cardWidth: 560 }, // logo muncul saat jendela hampir hilang
    textGap: 0.4, // jarak antar teks bertahap (label -> alamat web -> tagline)
    textFade: 0.5,
    holdSeconds: 1.5, // tahan setelah semua teks tampil
    fadeOut: 0.5, // semua konten memudar ke navy
    silence: 0.5, // navy polos di akhir video
  },

  /**
   * Audio. Taruh file di video/public/audio/music.mp3 dan voiceover.mp3 (juga .wav/.m4a); jika tidak ada, video tanpa suara.
   * volume 0-1; fadeOutSeconds = lama fade out di akhir video. Musik TIDAK disertakan (belum ada file berlisensi).
   */
  audio: {
    music: { volume: 0.5, fadeOutSeconds: 2.0 },
    voiceover: { volume: 1.0, fadeOutSeconds: 0.4 },
  },

  scene58: {
    settleSeconds: 0.9, // jendela mengecil dari ukuran akhir adegan 4 ke ukuran akhir (menyisakan ruang teks)
    windowScale: 0.84, // skala akhir jendela (relatif ukuran penuh)
    windowShiftY: 34, // jendela naik sedikit (px pada tinggi 1080) agar teks keterangan muat di bawah
    mapMaxZoom: 7, // batas zoom peta saat memperbesar ke provinsi (web: 9). Poligon provinsi yang disederhanakan tampak kasar di zoom tinggi
    modelSpinDegPerSec: 30, // putaran model 3D (di web autoRotate lebih lambat; dipercepat agar terbaca di video)
  },
  /** Halaman pencarian tiruan (netral, tanpa merek mesin pencari). Judul/deskripsi hasil #1 = tampilan web portofolio. */
  search: {
    placeholder: "Search the web",
    tabTitleBefore: "New tab",
    addressBefore: "search",
    addressResults: "search?q=portofolio+proyek+MTJM",
    results: [
      {
        title: "Portofolio Proyek | PT Multi Tehnik Jaya Mandiri",
        url: "portofolio.pt-mtjm.co.id", // PLACEHOLDER, revisi setelah alamat web portofolio final
        description: "Portofolio proyek EPC: boiler, genset, water treatment, piping, relokasi, dan modifikasi container.",
      },
      {
        title: "PT Multi Tehnik Jaya Mandiri",
        url: "pt-mtjm.co.id",
        description: "Profil lengkap perusahaan, layanan, sertifikasi, dan kabar terbaru kami tersedia di website resmi.",
      },
    ],
  },
  /** Adegan 5-9 (diisi di tahap berikutnya) */
  captions: {
    click: "Just by clicking.",
    filter: "Filter by year and type",
    detail: "Scope. Client. Site photos.",
    models: "See each type of work in 3D",
  },
} as const;

/** Batas adegan, dalam detik (sesuai prompt). */
/** Waktu turunan adegan 9 (detik sejak 0:56). Dihitung dari CONFIG.scene9 + showTagline. */
const S9C = CONFIG.scene9;
const s9Click = S9C.cursorStart + S9C.cursorMove + S9C.hoverPause;
const s9ShrinkStart = s9Click + S9C.shrinkDelay;
const s9LogoStart = s9ShrinkStart + S9C.shrink.seconds + S9C.logo.delayAfterShrink;
const s9Label = s9LogoStart + S9C.logo.fadeSeconds;
const s9Url = s9Label + S9C.textGap;
const s9Tag = s9Url + S9C.textGap;
const s9LastIn = (CONFIG.showTagline ? s9Tag : s9Url) + S9C.textFade;
const s9FadeOutStart = s9LastIn + S9C.holdSeconds;
export const S9 = {
  click: s9Click,
  shrinkStart: s9ShrinkStart,
  logoStart: s9LogoStart,
  label: s9Label,
  url: s9Url,
  tagline: s9Tag,
  fadeOutStart: s9FadeOutStart,
  total: s9FadeOutStart + S9C.fadeOut + S9C.silence,
};

export const SCENES = {
  s1: [0, 8],
  s2: [8, 16],
  s3: [16, 30],
  s4: [30, 36],
  s5: [36, 42],
  s6: [42, 47],
  s7: [47, 51],
  s8: [51, 56],
  s9: [56, 56 + S9.total], // otomatis dari CONFIG.scene9
} as const;

export const sec = (s: number) => Math.round(s * FPS);

/** Detik (sejak awal video) saat baris 2 selesai muncul + tahan = Bumi mulai fade in. */
export const EARTH_FADE_IN_AT_SEC =
  CONFIG.opening.startDelay + CONFIG.opening.fadeIn * 2 + CONFIG.opening.gap + CONFIG.opening.hold;
export const EARTH_FADE_IN_AT = sec(EARTH_FADE_IN_AT_SEC);
