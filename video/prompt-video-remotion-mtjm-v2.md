# Prompt Video Remotion MTJM (versi terupdate)

Dipakai di Claude Code yang berjalan di folder project web (C:\ClaudeProject\WebEPC3D), BUKAN di folder video yang terpisah.

## Persiapan (dilakukan manual, sekali)
1. Commit dan push perubahan web dulu supaya ada titik aman untuk kembali.
2. Di dalam folder project web, buat folder `video/reference/` lalu simpan foto referensi Bumi malam sebagai `video/reference/earth-ref.jpg`.
3. Simpan file ini di project (misalnya `video/PROMPT.md`), lalu ketik ke Claude Code: "Baca video/PROMPT.md dan video/reference/earth-ref.jpg, lalu kerjakan tahap 1." Cara ini mencegah prompt terpotong.

---

# ISI PROMPT

Buat video animasi promosi memakai Remotion di subfolder `video/` di dalam project web ini. Ini VERSI CONTOH untuk gambaran awal: angka statistik dan sebagian titik lokasi masih placeholder dan akan direvisi setelah web final. Video memakai komponen dan data dari web ini supaya tampilannya identik.

## Spesifikasi
- 16:9, 1920x1080, 30 fps, sekitar 55-60 detik. Render ke MP4 (H.264). Sediakan juga versi 1080x1080 sebagai cadangan.
- Gaya: sinematik, latar gelap, aksen biru dan putih sesuai tema web MTJM. Gerak kamera halus, easing lembut, tanpa efek berlebihan.
- Semua teks, angka, alamat web, label tombol, dan durasi dibaca dari SATU file konfigurasi (`video/src/config.ts`). Angka statistik dan titik contoh diberi komentar "PLACEHOLDER, revisi setelah dikonfirmasi MTJM".
- Teks di layar wajib ada di semua adegan (video harus terbaca tanpa suara). Voiceover tidak dibuat; sediakan slot audio untuk narasi dan musik, tapi JANGAN mengunduh musik. Saya yang memilih track bebas lisensi.
- Folder `video/` punya `package.json` sendiri, dikecualikan dari `tsconfig` dan build Next.js (exclude "video"), tidak ikut terdeploy ke Vercel (tambahkan ke `.vercelignore`), dan hasil render di `video/out/` masuk `.gitignore`.
- Label tombol di simulasi UI adalah "Main Website" (dari config). Ubah juga label "Website Utama" di navbar web menjadi "Main Website" lewat config/teks situs, supaya video dan web konsisten.

## Gambar referensi tampilan Bumi
Baca `video/reference/earth-ref.jpg` sebagai TARGET TAMPILAN SAJA. Jangan memakai gambar itu sebagai aset video. Pakai tekstur domain publik (NASA Black Marble atau night lights lain, sertakan atribusi di README). Kalau tekstur domain publik tidak bisa mencapai tampilan itu, laporkan ke saya dengan opsinya; jangan diam-diam memakai gambar referensi.

## Adegan

### Adegan 1 (0:00-0:08): Teks fade in
- Layar hitam polos.
- Baris 1 "Every project we've delivered" fade in sendiri (sekitar 0,8 detik).
- Jeda sekitar 0,4 detik, lalu baris 2 "has a place on the map." fade in (sekitar 0,8 detik) di bawahnya.
- Kedua baris tertata di tengah layar, teks putih bersih.
- Tanpa gerak naik, loncat, overshoot, atau blur. Fade in murni.
- Tahan sebentar. Saat baris 2 selesai muncul, Bumi mulai fade in di belakang teks, dan teks perlahan memudar.
- Durasi fade, jeda, dan lama tahan ada di config.

### Adegan 2 (0:08-0:16): Bumi malam
- Target tampilan (sesuai earth-ref.jpg): Bumi malam dilihat dari orbit rendah dengan sudut miring. Lengkung Bumi terlihat di bagian atas layar dengan halo atmosfer biru terang, lampu kota emas yang cerah dan berpendar, awan putih tipis di atas permukaan, langit berbintang. Asia Tenggara memenuhi layar. JANGAN terlihat kecil, jauh, dan gelap (Bumi bulat utuh yang redup).
- Teknis: kamera dekat ke permukaan (FOV sekitar 45-55, posisi rendah, menunduk ke arah Indonesia). Tingkatkan intensitas lampu kota (emissive), tambahkan bloom/glow, lapisan awan terpisah yang bergerak sangat pelan, dan rim light biru di tepi atmosfer.
- Gerak: Bumi fade in sambil zoom in lembut. Selama fade in, Bumi berputar. Putaran melambat (easing halus) dan berhenti saat komposisinya sama dengan referensi: Sumatra di kiri, Kalimantan di tengah, Sulawesi dan Papua di kanan. Lalu zoom in sedikit lagi ke Indonesia.
- Tidak ada bulan sama sekali.

### Adegan 3 (0:16-0:30): Titik proyek dan teks layanan
- Peta Indonesia dengan titik proyek muncul satu per satu (pop halus), diwarnai per kategori. Koordinat dari data seed web.
- Banyakkan titik di Kalimantan (sekitar 6-8 titik tersebar di Barat, Tengah, Timur, Selatan) dan tambahkan titik di Sumatra, Sulawesi, dan Papua yang masih jarang, supaya persebaran merata dan tidak terlihat kosong. Titik tambahan ini DATA CONTOH, tandai di config sebagai PLACEHOLDER.
- Teks "Power plants · Boilers · Water treatment · Piping · and more" muncul bergantian. Tiap kata ditahan minimal 1 detik, "and more" ditahan sekitar 1,5 detik. Beri jeda sebelum counter muncul.
- Lalu tiga counter naik: Projects, Clients, Locations (nilai dari config, PLACEHOLDER).

### Adegan 4 (0:30-0:36): Layar miring dan pencarian
- Jendela browser tiruan masuk dari sudut miring (tampilan layar di ruang 3D), kamera bergerak dan meluruskan layar.
- Kursor animasi klik kolom pencarian dan mengetik per huruf "portofolio proyek MTJM" (dari config), hasil pertama muncul dan diklik.

### Adegan 5 (0:36-0:42)
UI simulasi: kursor klik provinsi Kalimantan di peta, panel daftar proyek terbuka. Teks: "Just by clicking."

### Adegan 6 (0:42-0:47)
Kursor membuka dropdown Tahun lalu Kategori, daftar ter-filter dengan animasi. Teks: "Filter by year and type".

### Adegan 7 (0:47-0:51)
Kursor klik satu proyek, drawer detail terbuka dengan keterangan dan galeri foto. Teks: "Scope. Client. Site photos."

### Adegan 8 (0:51-0:56)
Kursor klik tab kategori, model 3D berputar otomatis dan berganti antar kategori. Teks: "See each type of work in 3D".

### Adegan 9 (0:56-1:01)
Kursor bergerak ke tombol "Main Website" dan klik. Layar mengecil ke latar navy, logo MTJM (dari public/) muncul dengan animasi halus. Teks: "Main Website" dan alamat web dari config. Tagline "Your Technical Partner" hanya muncul kalau diaktifkan di config.

## Cara membuat UI simulasi
- Pakai komponen React yang sama dengan web asli (kartu proyek, filter, peta, drawer, viewer 3D) dengan data statis, supaya identik dengan web sebenarnya.
- Interaksi TIDAK dijalankan sungguhan, tetapi dianimasikan berdasarkan frame. Buat komponen Cursor (gerak dengan kurva halus, berhenti sebentar, efek klik berupa riak kecil) dan Typewriter (ketik per huruf, kursor berkedip).
- Urutan interaksi dibaca dari satu file skrip (`video/src/script.ts`) berisi daftar langkah {frame, aksi, target, nilai}, supaya urutan dan kecepatan mudah diubah.
- Kecepatan sedikit lebih lambat dari natural supaya terbaca di LinkedIn.

## Aturan
- Hanya tampilkan fitur yang benar-benar ada di web. Nama proyek, lokasi, dan kategori yang tampil harus ada di data seed.
- Foto proyek: pakai foto asli dari public/ kalau sudah ada. Kalau belum, tampilkan kartu tanpa foto sesuai tampilan web.
- Jangan meniru elemen, teks, atau branding dari video referensi mana pun. Ambil hanya teknik gerak kamera dan kursor.
- Jangan menyalin atau memakai gambar referensi sebagai aset.

## Cara kerja
Kerjakan bertahap. Setelah tiap tahap render pratinjau (preview-stage1, preview-stage2, dst), jelaskan singkat apa yang dibuat, dan tunggu saya sebelum lanjut:
1. Config + adegan 1-3
2. Adegan 4 (layar miring, kursor, mengetik)
3. Adegan 5-8
4. Adegan 9 + render akhir

Di akhir, jelaskan cara mengganti angka, teks, titik lokasi, dan alamat web di config, serta cara render ulang.
