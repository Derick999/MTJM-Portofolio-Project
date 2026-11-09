# Portofolio Proyek MTJM

Website portofolio proyek PT Multi Tehnik Jaya Mandiri. Beranda berbentuk landing page (hero, angka, peta Indonesia interaktif dan proyek per kategori dengan 3D, FAQ, ajakan ke Main Website). Isi website mengikuti data di database; tampilan tetap. Admin menambah/mengubah proyek lewat `/admin`, dan hasilnya langsung tampil tanpa deploy ulang.

Stack: Next.js (App Router) + TypeScript + Tailwind, React Three Fiber (3D), Leaflet + OpenStreetMap (peta, tanpa API key), Supabase (database, foto, login), Vercel (hosting).

## Menjalankan di komputer

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Tanpa Supabase, situs memakai **data contoh** (`src/data/seed.ts`) dan halaman admin menampilkan pesan "Supabase belum disambungkan".

## 1. Setup Supabase

1. Buat project di https://supabase.com (gratis cukup).
2. Buka **SQL Editor**, jalankan berurutan:
   1. isi `supabase/migrations/001_schema.sql` (tabel, kebijakan RLS, bucket foto `project-photos`)
   2. isi `supabase/migrations/002_site_stats.sql` (tabel angka statistik beranda + nilai awal 165 / 50 / 20)
   3. isi `supabase/seed.sql` (data awal, opsional)
3. Ambil **Project URL** dan **anon public key** di *Project Settings > API*.

Keamanan: baca publik hanya untuk proyek `published` dan tabel `site_stats`; tulis (proyek, foto, upload, angka statistik) hanya untuk user yang ada di tabel `admins`. Dijaga oleh RLS di database, bukan sekadar disembunyikan di tampilan.

## 2. Environment variable

Salin `.env.example` menjadi `.env.local`:

| Variabel | Fungsi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (aman dipublikasikan, dibatasi RLS) |
| `NEXT_PUBLIC_SITE_URL` | alamat situs final (untuk Open Graph) |
| `NEXT_PUBLIC_COMPANY_URL` / `_ADDRESS` / `_EMAIL` / `_PHONE` | isi footer |

Jangan pernah memakai `service_role` key di project ini.

## 3. Membuat akun admin

1. Supabase > **Authentication > Users > Add user**: isi email + password, centang *Auto Confirm User*.
2. Di **SQL Editor**, jadikan user itu admin (ganti emailnya):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'admin@contoh.com';
```

3. Buka `/admin` dan masuk. Akun yang tidak ada di tabel `admins` ditolak.

Untuk mencabut akses: `delete from public.admins where user_id = '...';`

## 4. Deploy ke Vercel

1. Push project ke GitHub, lalu **Add New > Project** di Vercel dan pilih repo-nya.
2. Isi environment variable di atas (Settings > Environment Variables).
3. Deploy. Setiap perubahan data lewat admin langsung terlihat tanpa deploy ulang.
4. Setelah punya domain, isi `NEXT_PUBLIC_SITE_URL` lalu redeploy sekali.

## 5. Sebelum publikasi: ganti foto placeholder

Hero dan (di tahap berikutnya) kartu group layanan boleh memakai **foto umum berlisensi bebas** (Unsplash / Pexels / Pixabay) sementara foto asli perusahaan belum ada. Foto sementara ini **hanya** untuk latar hero dan latar kartu group, tidak pernah dipakai di kartu proyek, galeri, drawer detail, atau gambar OG.

1. Unduh foto sendiri, taruh di `public/placeholder/` dengan nama sesuai daftar di `src/config/images.ts` (`hero.jpg`, `group-power-plant.jpg`, `group-mechanical.jpg`, dst.). Foto yang filenya belum ada diabaikan: hero memakai gradasi navy + pola titik peta, kartu group memakai gradasi warna group.
2. Isi `source` (URL halaman foto) dan `license` (lisensi / nama fotografer) di `images.ts` untuk setiap foto yang dipakai.
3. Saat `npm run build`, log menampilkan peringatan **"Masih ada foto placeholder yang aktif"** beserta daftarnya selama masih ada foto dengan `placeholder: true`.
4. **Sebelum publikasi, ganti dengan foto asli:** taruh foto perusahaan, ubah `src` di `images.ts`, set `placeholder: false`, isi `license` ("Milik MTJM"). Peringatan hilang bila tidak ada lagi yang aktif.

Kompres foto hero (sekitar 200 KB, lebar 1920 px) supaya halaman cepat dimuat.

## Mengubah isi beranda

- **Headline, subjudul, tombol hero, menu, blok angka ("Dipercaya industri sejak ...", "Sejak 2012"):** `src/config/site.ts`.
- **FAQ:** `src/config/faq.ts` (pertanyaan, jawaban 2-3 kalimat; `{phone}` dan `{email}` diambil dari site.ts). Isi awal hanyalah CONTOH: konfirmasi ke MTJM sebelum publikasi. Data terstruktur FAQPage dibuat otomatis dari file ini.
- **Layanan:** `src/config/services.ts` (8 group, 27 sub-layanan). Migrasi `supabase/migrations/004_services.sql` menambah kolom `services` pada proyek.

## Panduan singkat untuk admin MTJM

**Masuk:** buka `alamat-situs/admin`, isi email dan password.

**Tambah proyek:** klik **+ Tambah proyek**, isi form dari atas ke bawah:
1. Pilih *Layanan utama* (wajib), *Layanan lain* jika ada (opsional), dan *Tahun*.
2. Isi *Nama proyek* dan *Klien*.
3. Pilih *Provinsi*, lalu *Kota/Kabupaten*. Titik di peta terisi otomatis. Kalau ingin lebih tepat, geser pin di mini-peta.
4. Isi *Keterangan* dan *Bagian pekerjaan*.
5. Klik **+ Pilih foto** (1 sampai 5 foto). Foto pertama jadi sampul; pakai tombol panah untuk mengubah urutan. Foto otomatis dikecilkan, jadi tidak perlu diedit dulu. Foto asli maksimal 10 MB.
6. Klik **Simpan proyek**. Tunggu sampai pesan sukses muncul.

**Angka statistik beranda:** di bagian atas `/admin` ada kotak *Angka Statistik* (Proyek, Klien, Lokasi di Indonesia). Ubah angkanya lalu klik **Simpan angka**. Angka ini diisi manual, tidak dihitung dari daftar proyek, karena proyek yang diunggah hanya sebagian dari seluruh pekerjaan MTJM.

**Edit / Hapus:** di daftar proyek klik **Edit** atau **Hapus** (ada konfirmasi sebelum benar-benar dihapus).

**Sembunyikan sementara:** hilangkan centang *Tampilkan proyek ini di website*. Proyek berstatus Draft hanya terlihat oleh admin.

## Struktur folder

```
src/app            halaman: / (beranda), /admin, /admin/proyek/[id]  (/peta dan /proyek dialihkan ke /#layanan)
src/components     UI; models/ = model 3D per kategori (prims.tsx = bahan dasar)
src/lib            kategori, filter, data provinsi->kota (indonesia.ts), Supabase, kompresi foto
src/config/site.ts  semua teks & data perusahaan (menu, hero, CTA, kontak, angka awal)
src/components/home  Hero, FAQ, Dashboard (peta + kategori), CTA
src/data/seed.ts   data contoh (sumber untuk supabase/seed.sql)
supabase/          migrasi SQL + seed
```

## Menyesuaikan

- **Warna & font:** token di `src/app/globals.css` (`@theme`). Tema biru-putih mengikuti logo (biru #1887cd, cyan #1dc7f4) dan navy #14144a; font Poppins dimuat di `src/app/layout.tsx`. Warna kategori ada di `src/lib/categories.ts`.
- **Teks & data perusahaan:** `src/config/site.ts` (menu, hero, CTA, footer, alamat/telepon/email). Alamat/telepon/email juga bisa ditimpa lewat environment variable.
- **Company Profile:** taruh file PDF di `public/company-profile.pdf` maka tautan "Unduh Company Profile" muncul otomatis di bagian CTA (dicek saat build, jadi deploy ulang setelah menambah file). Nama file diatur di `site.ts`.
- **Logo:** `public/mtjm-logo.jpg` (header, footer). Favicon dibuat dari `src/app/icon.png` dan `apple-icon.png`; gambar preview link `public/og.png` (1200x630).
- **Batas provinsi di peta:** `public/geo/indonesia-provinces.json`, dibuat ulang dengan `node scripts/build-geo.mjs <file.geojson>`. Papua Selatan/Tengah/Pegunungan memakai batas Papua, dan Papua Barat Daya memakai batas Papua Barat (sumber data masih 34 provinsi).
- **Kota baru:** tambah baris di `src/lib/indonesia.ts` (format `[nama, lat, lng]`).
- **Data awal:** ubah `src/data/seed.ts`, lalu `npm run seed:sql` untuk membuat ulang `supabase/seed.sql`.

## Catatan data awal

Seed berisi proyek yang disebut jelas di ringkasan (status *published*), serta empat proyek yang datanya tidak konsisten di dokumen sumber (Dumai, Muthu Gading Solo, Lirik, Teluk Lamong) dengan status *draft* dan catatan "perlu dicek". Klien dan foto belum diisi; lengkapi lewat admin. Koordinat memakai titik tengah kota.
