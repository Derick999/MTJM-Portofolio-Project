# MTJM Promo Video (Remotion) — VERSI CONTOH (adegan 1-9)

Video promosi 1920x1080 / 30 fps (+ versi 1080x1080). Angka & beberapa titik lokasi masih PLACEHOLDER
(revisi setelah dikonfirmasi MTJM). Prompt lengkap: `prompt-video-remotion-mtjm-v2.md`.

Status: lengkap, adegan 1-9 (± 61,9 detik). Hasil akhir: `out/mtjm-promo.mp4` (1920x1080) dan `out/mtjm-promo-square.mp4` (1080x1080).

## Perintah
```bash
cd video
npm install
npm run studio                 # pratinjau interaktif
npx remotion render src/index.ts Promo-16x9 out/preview-stage1.mp4 --codec=h264 --gl=angle --concurrency=3
npm run render                 # out/mtjm-promo.mp4 (H.264 1920x1080 30fps); foto diproses otomatis lebih dulu
npm run render:square          # out/mtjm-promo-square.mp4 (1080x1080)
npm run photos                 # hanya memproses foto proyek unggulan + deteksi file audio
npx remotion still src/index.ts Promo-16x9 out/still.png --frame=426 --gl=angle   # satu frame (cepat, untuk setel tampilan)
```
`--gl=angle` diperlukan agar WebGL (Bumi 3D) tampil benar saat render di Windows.

## Mengganti isi
Semua ada di **`src/config.ts`** (satu file):
- Teks adegan 1, urutan teks layanan, label tombol (`mainSiteButton`), alamat web (`mainSiteUrl`), tagline (`showTagline`).
- Durasi: `opening` (fade in/jeda/tahan), `scene3` (kapan titik, teks layanan, dan counter muncul; satuan detik), `SCENES` (batas tiap adegan).
- Angka statistik: `stats` (diberi komentar PLACEHOLDER).
- Urutan muncul titik (adegan 3): `scene3.dots` di config: titik Bekasi dulu (`hub`, ring pulsa besar), lalu gelombang `waves` (Jawa+Sumatra, Kalimantan+Sulawesi, Nusa Tenggara+Papua). Jeda antar gelombang `waveGap` (0,3-0,5 detik), jeda antar titik dalam gelombang `dotStagger`. Wilayah tiap titik ditentukan `regionRules` (kotak lintang/bujur); dalam satu gelombang titik diurutkan dari yang terdekat ke Bekasi.
- Titik di peta: proyek published dari `../src/data/seed.ts` otomatis (`includeDraftProjects` untuk ikut draft)
  ditambah `extraDots` (titik contoh Kalimantan/Sumatra/Sulawesi/Papua, PLACEHOLDER). Tambah/hapus baris di `extraDots` untuk mengubah titik.
- Tampilan Bumi: `globe` (FOV, bidikan kamera `shot`, zoom `dolly`, putaran Bumi, penguat lampu kota `lights`, `bloom`, awan).
- Label tombol "Main Website" juga ada di web: `../src/config/site.ts` (`mainSiteButton`), jaga agar sama.
- Label di titik Bekasi: `hub.label` di config (teks, lama fade/tahan, posisi). Contoh teks lain: "Since 2012 · Bekasi". Lama tahan label menentukan kapan gelombang titik pertama mulai.
- Adegan 4 (pencarian): kecepatan mengetik `scene4.typeCharSeconds`, isi halaman pencarian `search` (alamat portofolio masih PLACEHOLDER), kata kunci `searchQuery`.
- Adegan 4: jendela browser masuk dengan slide up (tanpa fade): `scene4.slideUp`, `straighten`, `tilt`; Bumi di belakangnya meredup: `scene4.backdrop`.
- Adegan 5-8: `scene58` (ukuran jendela, kecepatan putar model 3D, batas zoom peta). Teks keterangan: `captions`.
- Urutan interaksi kursor: `src/script.ts` (daftar langkah `{frame, action, target, value, duration}`; waktu dalam sec(detik)). Tujuan kursor (`target`) ada di `src/ui/layout.ts`.
- Foto proyek: `featuredProject` (slug dari seed, harus published; bukan draft Dumai/Muthu Gading/Lirik). Taruh 1-5 foto di `public/photos/<slug>/1.jpg` ... `5.jpg` (juga .png/.webp). Saat render foto dikecilkan otomatis (`photoMaxWidth`, `photoQuality`) dan muncul di kartu + galeri drawer (adegan 7). Tanpa foto: kartu tanpa foto (ikon kategori + teks), tanpa kotak kosong. Contoh slug: `pltd-waingapu-sumba-2023`.
- Adegan 9 (penutup): `scene9` (warna navy, kecepatan kursor, jeda, lama mengecil, animasi logo, jarak antar teks 0,4 dtk, tahan 1,5 dtk, fade out, hening 0,5 dtk). Teks: `mainSiteButton` (label kecil), `mainSiteUrl` (alamat besar), `tagline` tampil bila `showTagline: true`. Durasi total video otomatis mengikuti.
- Audio: taruh `public/audio/music.mp3` dan/atau `voiceover.mp3` (juga .wav/.m4a); volume dan fade out di `audio` (config). Tanpa file = video tanpa suara. Tidak ada musik yang diunduh.

## Gerakan kamera (satu perjalanan)
Kamera bergerak SATU kali dari awal teks memudar (detik 3,8) sampai peta datar, dengan satu kurva easing untuk semua parameter,
jadi tidak pernah berhenti di tengah. Atur di `src/config.ts` -> `globe.journey`:
- `curve`: cubic-bezier waktu -> progres; `end`: detik saat peta datar tercapai (setelah itu dorongan sangat pelan sampai akhir adegan 3, `drift`).
- `target`: titik yang selalu di tengah layar (tengah Kalimantan-Sulawesi). Geser lat/lng untuk menggeser komposisi.
- `from` / `to`: jarak kamera (`dist`), sudut pandang kamera ke bawah (`elev`, 90 = tegak lurus), FOV, dan roll horizon.
- `outlineFade`: rentang detik fade in garis batas provinsi. `spinEndAt`: detik putaran Bumi berhenti.
`scripts/fit-camera.mjs` (alat bantu) dipakai di tahap awal untuk mencocokkan komposisi dengan gambar referensi
(`reference/earth-ref.png`, hanya untuk menyetel kamera, bukan aset video).

## Adegan 5-8: komponen web asli
Halaman di dalam jendela browser (adegan 5-8) adalah web sungguhan, bukan tiruan gambar:
- **Dipakai langsung dari `../src`**: `DashboardView` (tata letak peta + proyek per kategori, dipakai bersama oleh web), `FilterBar`, `ProjectList`, `ProjectDetail` (drawer), `SiteHeader`, ikon kategori, dan model 3D (`components/models/*`). Gaya = Tailwind + token yang sama (`src/web.css`).
- **Versi per frame** (karena animasi bawaannya berbasis waktu nyata): peta (`src/web/VideoMap.tsx`, Leaflet dengan pin, cluster, dan poligon provinsi yang sama dengan `MapView.tsx`) dan viewer 3D (`src/web/VideoModel.tsx`, kamera berputar mengikuti frame; uap/kipas statis).
- **Peta tanpa tile OpenStreetMap**: render tidak bergantung jaringan dan tidak membebani server OSM. Daratan digambar dari poligon provinsi yang sama di atas warna laut web. Zoom provinsi dibatasi 7 (web: 9) karena poligon disederhanakan. Opsi: simpan tile OSM secukupnya secara lokal bila ingin tampilan persis web.
- Interaksi dianimasikan dari `src/script.ts` (`SCENE58_SCRIPT`); semua keadaan halaman (filter, drawer, dropdown, tampilan peta, gulir, kursor) dihitung murni dari frame di `src/web/session.ts`. Dropdown yang "terbuka" digambar sendiri karena `<select>` asli tidak bisa dibuka secara visual.
- **Data**: proyek published dari seed web + "proyek contoh" dari `extraDots` di config (PLACEHOLDER; seed belum punya proyek di Kalimantan dll.). Seed web belum punya nama klien maupun foto proyek, jadi drawer detail tampil tanpa klien/galeri (sama seperti web saat ini).
- `next/image`, `next/link`, `next/navigation` diganti shim di `src/shims/` (lihat `remotion.config.ts`).

## Struktur
```
src/config.ts            semua teks/angka/durasi/titik/parameter tampilan
src/data.ts              data proyek & batas provinsi diambil langsung dari web (../src)
src/scenes/Scene1Tagline.tsx     adegan 1 (teks fade in)
src/scenes/Scene23Globe.tsx      adegan 2-3 (Bumi, titik, teks layanan, counter)
src/scenes/globe/                shader Bumi, atmosfer, awan, titik, label Bekasi, bloom, jalur kamera
src/scenes/Scene4Search.tsx      adegan 4 (jendela browser slide up miring di ruang 3D, kursor, mengetik)
src/scenes/Scene58Web.tsx        adegan 5-8 (halaman web di jendela: peta, filter, drawer, viewer 3D)
src/script.ts                    urutan interaksi kursor/pengetikan (dibaca per frame)
src/ui/                          Cursor, BrowserWindow, SearchPage, layout (posisi target kursor)
src/web/                         VideoMap, VideoModel, WebPage, session (mesin keadaan), data peragaan
src/shims/                       pengganti next/image, next/link, next/navigation
```

## Atribusi tekstur (domain publik, NASA)
- Bumi malam (lampu kota): NASA Earth Observatory / NASA Goddard, "Black Marble 2016" (VIIRS), https://earthobservatory.nasa.gov/images/144898
- Bumi siang (membedakan darat/laut): NASA Earth Observatory, "Blue Marble: Next Generation" (world.topo.bathy.200412), https://visibleearth.nasa.gov/images/73909
- Awan (peta awan global 2048x1024): `public/textures/clouds.jpg`. **Sumber asli file ini tidak tercatat** (ditambahkan pada pekerjaan sebelumnya). Pastikan asal dan lisensinya (mis. citra awan NASA/GIBS) sebelum video dipublikasikan, lalu catat tautannya di sini; bila ragu, ganti dengan citra awan NASA yang terdokumentasi.
Citra NASA bebas dipakai dengan menyebut NASA sebagai sumber.

Catatan: tampilan Bumi dibuat dengan tekstur domain publik di atas ditambah pengolahan di shader (lampu emas diperkuat, bloom, halo atmosfer).
Gambar referensi TIDAK dipakai sebagai aset.
