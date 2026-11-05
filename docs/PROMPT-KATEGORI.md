# Prompt Claude Code: Kategori Our Services + Model 3D Baru + Revisi Piping

Cara pakai (di Claude Code yang berjalan di folder project web, bukan folder video):
1. Commit dan push dulu supaya ada titik aman untuk kembali.
2. Simpan file ini ke project sebagai `docs/PROMPT-KATEGORI.md`.
3. Ketik: "Baca docs/PROMPT-KATEGORI.md lalu kerjakan tahap 1."

---

# ISI PROMPT

Web portofolio MTJM sudah jalan (Next.js, React Three Fiber, Supabase). Sekarang: (a) kategori disamakan dengan bagian "Our Services" di company profile, (b) tiap kategori punya model 3D ilustrasi sendiri, (c) model Piping dirombak menjadi satu lokasi yang lebih luas. Kerjakan bertahap sesuai bagian "Cara kerja" di bawah.

## 1. Daftar kategori (13, nama mengikuti company profile)

Enam kategori yang sudah ada tetap dipakai, tujuh ditambah. PENTING: jangan mengubah nilai `category` (slug) yang sudah dipakai di database atau data admin, supaya proyek yang sudah ada tidak rusak. Yang diubah hanya LABEL tampilan.

| Slug | Label tampilan | Status |
|---|---|---|
| (slug lama Boiler) | Boiler & Heater | ada, ganti label |
| (slug lama Gas Engine) | Gas Engine & Generator Set | ada, ganti label |
| (slug lama Water Treatment) | Water Treatment | ada |
| (slug lama Piping) | Mechanical, Pump & Piping | ada, ganti label, model dirombak |
| (slug lama Relokasi) | Relocation & Dismantling | ada, ganti label (tetap sebut Jacking & Rolling di deskripsi) |
| (slug lama Container) | Container Modification | ada |
| power-plant | Power Plant | baru |
| electrical-work | Electrical Work | baru |
| civil-steel | Civil Work & Steel Structure | baru |
| fire-protection | Fire Protection & Alarm System | baru |
| storage-tanks | Fuel & Water Storage Tanks | baru |
| industrial-maintenance | Industrial Maintenance | baru |
| building-factory | Building Factory | baru |

Batas antar kategori supaya satu proyek tidak muncul di dua tempat: tiap proyek punya SATU kategori utama, dipilih dari lingkup pekerjaan terbesarnya.
- Gas Engine & Generator Set: PLTMG (gas engine), genset gedung, genset sementara, relokasi dan dismantle engine.
- Power Plant: pembangkit tingkat keseluruhan di luar PLTMG, seperti PLTD, PLTU, pembangkit tambang.

## 2. Sumber tunggal kategori dan database
- Buat satu file konfigurasi `src/config/categories.ts` sebagai sumber kebenaran: slug, label, deskripsi singkat (1-2 kalimat berbahasa Indonesia, diambil dari cakupan layanan di bawah, jangan mengarang klaim), kelompok warna, dan komponen model 3D. Dropdown kategori di admin, tab publik, filter, legenda peta, dan viewer 3D semuanya membaca file ini.
- Kalau kolom `category` di database memakai enum atau CHECK constraint, buat migrasi baru `supabase/migrations/003_categories.sql` yang memperluasnya. Migrasi harus idempotent (aman dijalankan dua kali) dan tidak mengubah 001 atau 002. Setelah itu beri tahu saya SQL apa yang harus dijalankan di Supabase dan urutannya.
- Jangan mengubah kategori proyek yang SUDAH ada di database secara otomatis. Kalau ada proyek yang menurut batas di atas lebih cocok pindah (misalnya PLTD yang sekarang di Gas Engine), cukup daftarkan di laporan akhir dan tanya saya dulu.

Cakupan layanan dari company profile (dasar deskripsi tiap kategori):
- Power Plant (EPC): gas engine power plant, generator set power plant, coal-fired power plant.
- Mechanical, Pump & Piping: pipa karbon dan stainless, HDPE, cast iron, plumbing; sistem pompa; HVAC.
- Electrical Work: jaringan transmisi dan distribusi; elektrikal gedung, pabrik, penerangan jalan; instrumen dan kontrol; pembuatan dan instalasi panel MV/LV (distribusi, MDP, kontrol genset, ATS, PLC, inverter, soft starter).
- Civil Work & Steel Structure: struktur baja, gedung, interior, sipil dan arsitektur.
- Fire Protection & Alarm System: sistem pemadam kebakaran, hidran, dan alarm.
- Fuel & Water Storage Tanks: tangki minyak dan air, tangki kimia, filter tank, pressure tank.
- Industrial Maintenance: annual maintenance berkala, instalasi mesin custom.
- Building Factory: pembangunan dan renovasi pabrik dan fasilitas industri.
- Relocation & Dismantling: jacking and rolling, lifting, dismantle.
- Container Modification: container fuel tank, switchgear, control room, office, site office.

## 3. Tampilan tab, peta, dan filter
- 13 tab terlalu banyak untuk satu baris. Di HP: baris tab bisa digeser horizontal dengan snap, ada fade di tepi, dan tab aktif otomatis digulir ke tengah. Di desktop: boleh membungkus ke dua baris atau tetap digeser, pilih yang paling rapi. Target sentuh minimal 44 px.
- Kategori yang jumlah proyek publiknya 0 DISEMBUNYIKAN dari tab publik (tetap muncul di dropdown admin). Sediakan flag `hideEmptyCategories` di config.
- Warna titik peta: 13 warna terlalu banyak untuk dibedakan. Kelompokkan jadi 5 keluarga warna dan legenda peta menampilkan keluarga itu: (1) Pembangkit: Power Plant, Gas Engine; (2) Mekanikal: Boiler, Piping, Relocation, Industrial Maintenance; (3) Elektrikal dan proteksi: Electrical, Fire Protection; (4) Sipil dan bangunan: Civil & Steel, Building Factory, Container; (5) Utilitas dan penyimpanan: Water Treatment, Storage Tanks. Warna tetap lewat design token tema biru-putih.
- Filter kategori memakai daftar yang sama dan menampilkan jumlah.

## 4. Gaya umum model 3D (berlaku untuk semua model baru)
- Ikuti gaya model yang sudah ada (cek komponen model eksisting): low-poly konsisten, bevel kecil, warna material berbeda per bagian, lantai/grid tipis, latar gradasi biru muda sesuai tema. Tanpa tekstur gambar (hanya material dan warna) supaya ringan.
- Tiap model berupa komponen sendiri, di-lazy-load per kategori. Pakai ulang geometri dan material, dan pakai instancing untuk elemen berulang (penyangga pipa, baut, kisi). Target di bawah sekitar 40 ribu segitiga per model, harus lancar di HP.
- Semua model ilustrasi saja (bukan model proyek tertentu), bisa diputar dan di-zoom, auto-rotate pelan yang mati di perangkat lemah. Boleh ada animasi halus yang murah (uap, kipas, kedip lampu indikator).

## 5. Model baru (7)

1. Power Plant: bangunan power house besar dengan louver atap, dua cerobong, area trafo dengan dua trafo bersirip radiator, menara transmisi kecil, tangki bahan bakar, unit kipas pendingin, jembatan pipa, pagar dan jalan kecil. Beda dari model Gas Engine: ini tampak keseluruhan pembangkit, bukan satu unit mesin.
2. Electrical Work: deretan kubikel switchgear MV/LV dengan pintu, handle, dan lampu indikator kecil yang berkedip; satu trafo dengan sirip dan bushing; cable tray di atas dengan kabel; menara transmisi kisi; panel kontrol dengan layar kecil; grid pembumian di lantai.
3. Fire Protection & Alarm System: skid pompa pemadam berwarna merah (pompa listrik, pompa diesel, jockey pump), pressure tank, pipa riser merah, dua atau tiga hidran pilar dengan outlet, grid pipa sprinkler dengan kepala sprinkler di atas, tiang alarm dengan strobe, panel alarm, tangki air pemadam.
4. Civil Work & Steel Structure: rangka baja bangunan (kolom H-beam, balok, bracing X), sebagian atap dengan gording dan sebagian dek, pondasi pedestal dengan base plate dan baut angkur, scaffolding di satu sisi, tangga kerja.
5. Fuel & Water Storage Tanks: tiga tangki silinder besar berbeda ukuran (atap kerucut dengan tangga spiral, ring penguat, manhole), dinding bund/dike melingkupinya, manifold pipa dengan valve, satu pompa, level gauge. Bedakan tangki bahan bakar (abu/oranye) dan tangki air (biru). Beda dari model Water Treatment (itu proses dengan bak dan tangki kecil).
6. Industrial Maintenance: bay workshop dengan mesin industri generik (skid pompa-motor) yang tutupnya terbuka, derek gantry atau chain hoist di atas, platform perawatan, rak suku cadang, toolbox, papan rambu keselamatan, dan roda gigi atau flywheel yang berputar pelan.
7. Building Factory: bangunan pabrik dengan atap gigi gergaji (sawtooth), dinding panel berusuk, pintu rolling, dok bongkar muat dengan bay truk, ventilator atap, unit HVAC di atap, kanopi samping, anex kantor kecil, dan palet di halaman.

## 6. Revisi model Piping (jadi satu lokasi yang luas)

Model Piping sekarang terlalu kecil dan terasa seperti potongan jaringan pipa. Ganti dengan satu lokasi (site) pipa dan pompa yang luas, dengan framing kamera lebih lebar.
- Skala: footprint sekitar 2,5 kali lebar model lain. Kamera default lebih jauh dan agak naik (pandangan tiga perempat), supaya seluruh lokasi terlihat. Auto-rotate pelan.
- Elemen utama: pipe rack baja layang yang membentang melintasi scene (empat sampai enam bay, dua tingkat), dengan enam sampai delapan jalur pipa paralel berbeda diameter dan warna (karbon abu, berisolasi perak, stainless, HDPE hitam, dan satu pipa pendingin diameter besar sebagai pipa utama). Ada belokan siku di sudut, expansion loop, dan cabang tee yang turun ke tanah.
- Stasiun valve: gate valve dengan handwheel dan butterfly valve, sambungan flange, penyangga dan shoe pipa.
- Area pompa di satu ujung: dua pompa sentrifugal dengan jalur suction dan discharge serta check valve.
- Ujung lain: dua tangki atau satu manifold besar tempat jalur pipa berakhir.
- Detail lokasi: walkway dan tangga di sepanjang rack, slab beton bergaris, rambu keselamatan, dan satu titik pengelasan kecil dengan cahaya berkedip pelan sebagai penanda pekerjaan.
- Label deskripsi kategori ikut diperbarui sesuai cakupan: pipa karbon dan stainless, HDPE, cast iron, plumbing, pompa, HVAC.

## 7. Data awal (seed) untuk kategori baru

Buat file seed baru yang idempotent (conflict pada slug: do nothing), TERPISAH dari seed lama. Data di bawah diambil dari ringkasan company profile; yang tidak jelas lokasi atau tahunnya diberi status draft dan catatan "perlu dicek". Jangan memasukkan proyek yang datanya bentrok (boiler Dumai, boiler Muthu Gading Solo, proyek Lirik dan Teluk Lamong). Tiap proyek hanya satu kategori; kalau slug sudah ada di database, lewati.

- Power Plant: PLTD Belawan 5x2 MW (2019, WIKA); PLTD Toboali, Bangka 7x1.000 kW (2017); pembangkit tambang Nusa Halmahera Mineral 11x5 MW (2022).
- Electrical Work: instalasi elektrikal apartemen Regatta (2016); load bank data center MIG 14x400 kW (2023) dan EDGE 28x400 kW (2024), lokasi perlu dicek, draft; penggantian kabel MV untuk Pertamina dan Barata Indonesia, tahun perlu dicek, draft.
- Civil Work & Steel Structure: rak gudang Sunter (2016); RPTRA Pondok Kopi dan Pondok Kelapa (2016); erection baja Cikarang (2025); renovasi gedung HKBP (2018), lokasi perlu dicek; fasilitas tambang Samarinda (2022).
- Fire Protection & Alarm System: piping LPG dan hidran SPBE Jatirangon (2011); hidran Regatta (2016); perbaikan hidran KDS Indonesia (2019); fire fighting dan fire alarm Indorama (2022), lokasi perlu dicek, draft.
- Fuel & Water Storage Tanks: tangki air 1.500 KL Palabuhan Ratu (2018); tangki fuel 5x20 KL untuk Belawan (2019); tangki 2.000 KL Asian Agri, tahun perlu dicek, draft.
- Industrial Maintenance: datanya tipis di dokumen sumber. Buat satu atau dua entri draft (misalnya shut down dan turn on furnace Inductotherm) dengan catatan "minta contoh annual maintenance dari MTJM".
- Building Factory: renovasi pabrik Bentoel, Malang (2016); renovasi pabrik Mitsubishi Electric, Cikarang (2012); painting shop Handal Indonesia Motor, Cikampek (2024-2025); Frina Nusantara, Cikarang (2024).

Nama klien yang tampil publik harus bisa dimatikan lewat satu flag di config (menunggu izin MTJM).

## 8. Cara kerja
Kerjakan bertahap. Setelah tiap tahap, jalankan web, cek di lebar 375 dan 1280 px, jelaskan singkat apa yang berubah, dan tunggu saya sebelum lanjut:
1. Config kategori, migrasi 003, tab, filter, legenda peta, dropdown admin (belum ada model baru; kategori baru sementara memakai model placeholder sederhana).
2. Revisi model Piping (bagian 6).
3. Model baru batch 1: Power Plant, Electrical Work, Fire Protection & Alarm.
4. Model baru batch 2: Civil & Steel, Storage Tanks, Industrial Maintenance, Building Factory.
5. Seed kategori baru dan cek akhir (performa model di HP, tab kosong tersembunyi, peta dan legenda).

Di akhir: jelaskan SQL yang harus saya jalankan di Supabase, cara menambah kategori lagi lewat config, dan daftar proyek yang menurut batas kategori sebaiknya dipindah (tanpa memindahkannya otomatis).
