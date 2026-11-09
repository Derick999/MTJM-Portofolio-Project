# Prompt Claude Code: Homepage Baru + Our Services (8 Bab) + Penjelajah Peta/3D

PENGGANTI file `PROMPT-KATEGORI.md` (13 kategori). Jangan jalankan prompt kategori lama.

Cara pakai (di Claude Code yang berjalan di folder project web, bukan folder video):
1. Commit dan push dulu supaya ada titik aman untuk kembali.
2. Simpan file ini ke project sebagai `docs/PROMPT-HOMEPAGE.md`.
3. Ketik: "Baca docs/PROMPT-HOMEPAGE.md lalu kerjakan tahap 1."

---

# ISI PROMPT

Web portofolio MTJM sudah jalan (Next.js, R3F, Supabase, tema biru-putih). Ubah halaman utama menjadi landing page dengan urutan: Hero, Angka, Layanan + Penjelajah (peta/3D/daftar), FAQ, ajakan ke Main Website, footer. Layanan mengikuti halaman "Our Services" company profile (8 kelompok dengan sub-poin).

PRINSIP EFISIENSI (berlaku untuk semua bagian):
- Satu sumber kebenaran untuk taksonomi layanan: `src/config/services.ts`. Tidak ada tabel database baru untuk layanan. Menambah layanan = edit satu file.
- Ambil semua proyek published sekali di server (jumlahnya kecil, di bawah beberapa ratus), kirim ke klien sebagai JSON ringan, lalu filter dan hitung jumlah di sisi klien. Tidak ada query per klik.
- Peta, 3D, dan penjelajah dimuat lazy (dynamic import + IntersectionObserver), bukan saat halaman pertama dibuka.
- Pakai ulang komponen yang sudah ada (peta, drawer detail, kartu proyek, viewer 3D, counter, CTA, footer). Jangan menulis ulang.
- Semua teks, label, dan warna lewat config dan design token yang sudah ada.

## 1. Taksonomi layanan (`src/config/services.ts`)

8 kelompok (group) dan 27 sub-layanan (service). Slug harus unik di seluruh file (group dan service tidak boleh bentrok). Tiap entri: slug, label (nama sesuai company profile, bahasa Inggris), deskripsi singkat 1 kalimat bahasa Indonesia (dari cakupan di bawah, jangan mengarang klaim), warna (per group, dari design token), dan kunci model 3D (opsional).

| Group (slug) | Sub-layanan (slug) |
|---|---|
| Power Plant (power-plant) | Gas Engine Power Plant (gas-engine-power-plant); Generator Set Power Plant (generator-set-power-plant); Coal Fired Power Plant (coal-fired-power-plant) |
| Mechanical (mechanical) | Piping System (piping-system; carbon dan stainless, HDPE, cast iron, plumbing); Fire Fighting & Protection System (fire-fighting-protection); HVAC (hvac); Pumps System (pump-system) |
| Electrical (electrical) | Transmission & Distribution Line (transmission-distribution); Electrical for Building, Factory & Street Lighting (building-factory-lighting); Instrument & Control Installation (instrument-control); MV & LV Panel Maker and Installation (mv-lv-panel) |
| Civil & Architecture (civil-architecture) | Steel Structure (steel-structure); Building (building); Interior (interior); Container Modification (container-modification) |
| Water Treatment Plant (water-treatment) | Sewage Treatment Plant (sewage-treatment); Clean Water Treatment Plant (clean-water-treatment); Waste Water Treatment Plant (waste-water-treatment) |
| Storage Tank & Boilers (storage-tank-boilers) | Oil & Water Tank (oil-water-tank); Chemical Tank (chemical-tank); Filter Tank (filter-tank); Pressure Tank (pressure-tank); Boilers (boilers) |
| Relocation & Dismantling (relocation-dismantling) | Jacking & Rolling (jacking-rolling); Lifting (lifting) |
| Industrial & Factory (industrial-factory) | Annual Maintenance Periodic (annual-maintenance); Installation Custom Machine (custom-machine-installation) |

Aturan pemilihan model 3D: `resolveModel(serviceSlug)` mengembalikan model milik sub-layanan, kalau tidak ada pakai model default group-nya, kalau tidak ada maka tab 3D disembunyikan. Pemetaan awal:
- Model yang SUDAH ada dipakai ulang: boilers: model Boiler; gas-engine-power-plant dan generator-set-power-plant: model Gas Engine/Genset; piping-system dan group mechanical: model Piping (versi revisi, bagian 6); water-treatment (group dan semua sub): model Water Treatment; jacking-rolling, lifting, dan group relocation-dismantling: model Relokasi; container-modification: model Container.
- Model BARU hanya untuk group yang belum punya (bagian 7): power-plant (default), electrical (default), civil-architecture (default, dipakai steel-structure dan building), storage-tank-boilers (default, dipakai tangki), industrial-factory (default).

## 2. Database (efisien, satu migrasi kecil)
- Migrasi baru `supabase/migrations/003_services.sql` (idempotent, jangan ubah 001 dan 002): tambah kolom `services text[] not null default '{}'` pada `projects` (elemen pertama = layanan utama, sisanya layanan tambahan) dan index GIN pada kolom itu. Tidak ada tabel baru. RLS tidak berubah.
- JANGAN menghapus kolom `category` lama (tetap ada untuk kompatibilitas, tandai deprecated di komentar). UI tidak lagi memakainya.
- Backfill dari `category` lama ke `services` hanya untuk baris yang `services`-nya masih kosong: Boiler menjadi boilers; Gas Engine & Genset menjadi gas-engine-power-plant, kecuali nama proyek memuat PLTD atau genset atau kVA maka generator-set-power-plant; Piping menjadi piping-system; Relokasi menjadi jacking-rolling; Container menjadi container-modification; Water Treatment menjadi clean-water-treatment (laporkan baris WTP/STP/WWTP yang sebaiknya dipindah ke sub yang tepat).
- Di laporan, daftarkan baris yang diisi lewat aturan tebak supaya saya cek. Beri tahu saya SQL apa yang harus dijalankan di Supabase.
- Admin: ganti dropdown Kategori menjadi "Layanan utama" (dropdown dikelompokkan per group via optgroup, wajib) dan "Layanan lain (opsional)" (checkbox, bisa dilipat, dikelompokkan per group). Label berbahasa Indonesia, tetap sederhana untuk orang gaptek. Daftar opsi dibaca dari services.ts.
- Setelah admin menyimpan atau menghapus proyek, panggil revalidasi halaman utama supaya data langsung tampil tanpa deploy (atau `revalidate = 60` sebagai cadangan).

## 3. Halaman utama (urutan section)

### 3a. Hero
- Headline besar dan subjudul dari `src/config/site.ts` (usul awal: "Setiap proyek punya tempat di peta." dan "Riwayat proyek PT Multi Tehnik Jaya Mandiri di seluruh Indonesia, dari pembangkit sampai pengolahan air."). Dua tombol pil: "Jelajahi Layanan" (scroll halus ke penjelajah) dan "Main Website" (outline, tautan ke situs utama dari config, tab baru, rel noopener noreferrer).
- Latar: kalau ada `public/hero/hero.jpg` pakai itu (next/image, priority, kompres, maks sekitar 200 KB) dengan overlay biru navy agar teks terbaca. Kalau tidak ada, pakai gradasi navy ke biru dengan pola titik-titik peta Indonesia SVG ringan. JANGAN memakai gambar stok dan JANGAN mengunduh gambar dari internet.
- Opsional (aktif hanya jika ada minimal 1 proyek dengan foto): kartu bertumpuk di pojok kanan bawah desktop berisi "Proyek terbaru" (maks 3, dari data proyek, klik membuka drawer detail). Disembunyikan di HP.
- Tidak ada peta atau 3D di hero.

### 3b. Angka
- Empat angka: Proyek, Klien, Lokasi (dari `site_stats` yang sudah ada, animasi hitung naik, nilai awal dari server, format "20+" konsisten) dan "Sejak 2012" (dari config, tanpa animasi). Tata letak bersih seperti blok statistik: angka besar, label kecil di bawahnya, di samping headline pendek "Dipercaya industri sejak 2012" (teks dari config).
- Hormati `prefers-reduced-motion` (langsung tampil tanpa animasi).

### 3c. Layanan + Penjelajah (id="layanan")
Desktop (lebar sekitar 1024 px ke atas): dua kolom. Kiri: delapan kartu group ditumpuk. Kanan: panel penjelajah yang menempel (sticky).
- Kartu group (gaya kartu bergambar): judul group, daftar sub-layanan sebagai poin di dalam kartu. Latar kartu: foto sampul proyek terbaru yang punya foto dari group itu (dengan overlay gelap agar teks terbaca); kalau tidak ada, gradasi biru dengan warna group. Tiap sub-layanan punya badge jumlah proyek.
- Klik sub-layanan = memilih layanan itu. Klik judul group = memilih seluruh group. Sub-layanan dengan 0 proyek TIDAK bisa diklik: tampil sebagai teks biasa berwarna redup dengan keterangan kecil "proyek segera ditambahkan".
- Panel penjelajah punya tiga tab: Peta | 3D | Daftar.
  - Kondisi awal: "Semua layanan", yaitu peta seluruh Indonesia dengan semua titik (ini momen "wow" dan memenuhi permintaan peta Indonesia yang bisa diklik). Titik berwarna per group, ada legenda. Tab 3D tersembunyi sampai layanan yang punya model dipilih.
  - Saat layanan dipilih: peta hanya menampilkan titik proyek layanan itu (ikut filter layanan; sub-layanan termasuk layanan tambahan di `services`), 3D menampilkan model hasil `resolveModel`, Daftar menampilkan kartu proyek. Header panel menampilkan nama layanan, deskripsi singkat, jumlah proyek, dan tombol "Lihat semua layanan" untuk reset.
  - Klik titik peta atau kartu proyek membuka drawer detail yang sudah ada (?p=slug tetap berfungsi).
  - Filter provinsi dan tahun yang sudah ada tetap tersedia di dalam panel dan bisa dikombinasikan dengan layanan.
- Status tersimpan di URL: `?layanan=<slug>&view=peta|3d|daftar`. Link langsung ke layanan tertentu harus langsung membuka penjelajah dalam kondisi itu (untuk dibagikan di postingan LinkedIn). Saat memilih layanan dari kartu, scroll halus ke panel.
- Mobile: kartu group menumpuk satu kolom, panel penjelajah ada di bawah kartu, pilih layanan = scroll halus ke panel dengan tombol "Kembali ke daftar layanan". Tab penjelajah dan semua target sentuh minimal 44 px.
- Lazy load: panel (peta dan 3D) baru dimuat saat section terlihat. Satu Canvas R3F dipakai bergantian untuk semua model (jangan satu Canvas per model).

### 3d. FAQ
- Section di atas ajakan ke Main Website. Accordion aksesibel (keyboard, aria-expanded), satu terbuka pada satu waktu. Isi dari `src/config/faq.ts`. Setiap jawaban 2-3 kalimat yang benar-benar menjawab sebagian lalu diakhiri tautan "Selengkapnya di pt-mtjm.co.id" (tab baru). Tambahkan data terstruktur FAQPage (JSON-LD).
- Teks awal (CONTOH, tandai di config "konfirmasi ke MTJM sebelum publikasi"):
  1. "Apakah MTJM menangani proyek dari desain sampai konstruksi?" Jawab: ya, MTJM bergerak di bidang EPC (Engineering, Procurement, Construction) sebagai main contractor maupun sub-contractor. Rincian layanan dan proses kerja ada di website resmi.
  2. "Wilayah mana saja yang sudah pernah dikerjakan?" Jawab: tersebar di berbagai wilayah Indonesia; pilih layanan di atas untuk melihat lokasinya di peta; daftar lengkap ada di website resmi.
  3. "Sertifikasi dan legalitas apa yang dimiliki?" Jawab: anggota ASPEKNAS, bersertifikasi HSE (SMK3), dan memiliki SBU Jasa Pelaksana Konstruksi bidang Mechanical; dokumen lengkap tersedia di website resmi.
  4. "Apakah MTJM menerima pekerjaan sebagai sub-kontraktor?" Jawab: ya, MTJM dapat bekerja sebagai main contractor maupun sub-contractor.
  5. "Bagaimana cara berdiskusi atau meminta penawaran?" Jawab: hubungi lewat telepon atau email di bagian kontak (dari config), atau kunjungi website resmi.
  6. "Apakah semua proyek ada di halaman ini?" Jawab: halaman ini menampilkan proyek pilihan; seluruh pengalaman dan profil perusahaan ada di website resmi.
- Jangan menambah klaim di luar daftar ini. Semua tautan ke situs utama diambil dari config.

### 3e. Ajakan ke Main Website dan footer
Pakai section CTA yang sudah ada (tepat di atas footer), tidak diubah selain posisinya setelah FAQ.

### 3f. Navigasi
Menu: Beranda, Layanan (anchor #layanan), FAQ (anchor), Main Website. Halaman /proyek dan /peta diarahkan (redirect) ke `/#layanan`. State aktif menu mengikuti section yang sedang terlihat (scroll-spy) dan tetap memakai gaya abu yang sudah ada.

## 4. Konsistensi
- Peta, daftar, drawer, dan jumlah di badge semua membaca satu sumber data yang sama dan satu fungsi filter (satu fungsi `filterProjects({layanan, provinsi, tahun})`).
- Hanya hitung proyek dengan status published.
- Aksesibilitas: tab ARIA, fokus terlihat, focus trap drawer yang sudah ada tetap, kontras sesuai standar, `prefers-reduced-motion` mematikan animasi counter dan auto-rotate.
- Performa: target LCP di bawah 2,5 detik di HP, tanpa pergeseran layout, 3D dan peta tidak memblokir render awal.

## 5. Revisi model Piping (jadi satu lokasi luas)
Ganti model Piping dengan satu lokasi pipa dan pompa yang luas (framing kamera lebih lebar):
- Footprint sekitar 2,5 kali model lain, kamera default lebih jauh dan agak naik (tiga perempat), auto-rotate pelan.
- Pipe rack baja layang yang membentang melintasi scene (4-6 bay, dua tingkat) dengan 6-8 jalur pipa paralel berbeda diameter dan warna (karbon abu, berisolasi perak, stainless, HDPE hitam, satu pipa pendingin besar). Ada belokan siku di sudut, expansion loop, dan cabang tee ke tanah.
- Stasiun valve (gate valve dengan handwheel, butterfly valve), sambungan flange, penyangga pipa.
- Area pompa di satu ujung (dua pompa sentrifugal dengan suction dan discharge serta check valve), dua tangki atau manifold di ujung lain.
- Walkway dan tangga di sepanjang rack, slab beton bergaris, rambu keselamatan, satu titik pengelasan kecil dengan cahaya berkedip pelan.

## 6. Gaya umum model 3D baru
Ikuti gaya model yang sudah ada: low-poly konsisten, bevel kecil, warna material berbeda per bagian, lantai tipis, latar gradasi biru muda. Tanpa tekstur gambar. Lazy-load per model, pakai ulang geometri dan material, instancing untuk elemen berulang, target di bawah sekitar 40 ribu segitiga, lancar di HP. Ilustrasi saja (bukan model proyek tertentu), bisa diputar dan di-zoom.

## 7. Lima model baru (hanya yang belum punya)
1. Power Plant: bangunan power house dengan louver atap, dua cerobong, area trafo dengan dua trafo bersirip radiator, menara transmisi kecil, tangki bahan bakar, unit kipas pendingin, jembatan pipa.
2. Electrical: deretan kubikel switchgear MV/LV dengan pintu dan lampu indikator kecil berkedip, satu trafo dengan sirip dan bushing, cable tray di atas, menara transmisi kisi, panel kontrol.
3. Civil & Architecture: rangka baja bangunan (kolom H-beam, balok, bracing X), sebagian atap dengan gording, pondasi pedestal dengan base plate dan baut angkur, scaffolding di satu sisi.
4. Storage Tank & Boilers: tiga tangki silinder besar berbeda ukuran (atap kerucut, tangga spiral, ring penguat) dengan dinding bund, manifold dan valve, satu pompa; tangki bahan bakar (abu/oranye) berbeda warna dari tangki air (biru).
5. Industrial & Factory: bangunan pabrik beratap gigi gergaji dengan dinding panel berusuk, pintu rolling, dok bongkar muat, unit HVAC di atap, derek gantry di dalam bay workshop (terlihat lewat bukaan), dan palet di halaman.
Fire Fighting, HVAC, Pumps, Interior, dan sub-layanan lain tanpa model memakai model group-nya.

## 8. Seed tambahan (idempotent, terpisah dari seed lama)
Seed baru memakai `services` dan konflik pada slug: do nothing. Proyek hanya dimasukkan jika datanya jelas; yang tidak jelas lokasi atau tahunnya diberi status draft dan catatan "perlu dicek". Jangan memasukkan proyek yang datanya bentrok (boiler Dumai, boiler Muthu Gading Solo, proyek Lirik dan Teluk Lamong). Data diambil dari ringkasan company profile:
- generator-set-power-plant: PLTD Belawan 5x2 MW (2019, WIKA); PLTD Toboali, Bangka 7x1.000 kW (2017); Nusa Halmahera Mineral 11x5 MW (2022).
- mv-lv-panel / transmission-distribution: penggantian kabel MV Pertamina dan Barata Indonesia (tahun perlu dicek, draft); load bank data center MIG 14x400 kW (2023) dan EDGE 28x400 kW (2024) (lokasi perlu dicek, draft).
- building-factory-lighting: instalasi elektrikal apartemen Regatta (2016).
- steel-structure: rak gudang Sunter (2016); RPTRA Pondok Kopi dan Pondok Kelapa (2016); erection baja Cikarang (2025).
- building: renovasi pabrik Bentoel, Malang (2016); renovasi pabrik Mitsubishi Electric, Cikarang (2012); renovasi gedung HKBP (2018, lokasi perlu dicek, draft).
- fire-fighting-protection: piping LPG dan hidran SPBE Jatirangon (2011); hidran Regatta (2016); perbaikan hidran KDS Indonesia (2019); fire fighting dan fire alarm Indorama (2022, lokasi perlu dicek, draft).
- oil-water-tank: tangki air 1.500 KL Palabuhan Ratu (2018); tangki fuel 5x20 KL Belawan (2019); tangki 2.000 KL Asian Agri (tahun perlu dicek, draft).
- annual-maintenance: data tipis; buat satu entri draft dengan catatan "minta contoh annual maintenance dari MTJM".
- custom-machine-installation: painting shop Handal Indonesia Motor, Cikampek (2024-2025); Frina Nusantara, Cikarang (2024).
Nama klien yang tampil publik bisa dimatikan lewat satu flag di config (menunggu izin MTJM).

## 9. Cara kerja
Kerjakan bertahap. Setelah tiap tahap, jalankan web, cek di lebar 375 dan 1280 px, jelaskan singkat apa yang berubah, dan tunggu saya sebelum lanjut:
1. services.ts, migrasi 003, backfill, field admin, fungsi filter bersama (belum ada perubahan tampilan publik besar).
2. Hero, angka, FAQ, navigasi, redirect /proyek dan /peta.
3. Kartu layanan dan penjelajah (peta, daftar, 3D dengan model yang sudah ada), state di URL, lazy load.
4. Revisi model Piping dan lima model baru.
5. Seed tambahan dan pengecekan akhir (performa di HP, sub-layanan kosong tidak bisa diklik, deep link, tab 3D tersembunyi bila tidak ada model).

Di akhir, jelaskan SQL yang harus saya jalankan di Supabase, cara menambah layanan atau FAQ lewat config, dan daftar baris yang diisi lewat aturan tebak untuk saya cek.
