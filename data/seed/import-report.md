# Laporan impor proyek (sudah memuat keputusan atas laporan tahap 1)

Sumber: `data/seed/list-project-mtjm.csv`. Dibuat oleh `npm run import:projects`. Aturan: `scripts/service-rules.ts` (layanan), `scripts/location-rules.ts` (lokasi), `src/config/client-aliases.ts` (klien). SQL: `supabase/seed/004_projects_import.sql`.

## Ringkasan

- Baris data CSV: **166**
- Proyek unik setelah penggabungan: **155** (11 baris digabung ke proyek lain)
- Published: **152**
- Draft (published=false): **3** (tanya MTJM)
- Published dengan lokasi perlu konfirmasi (needs_confirm): **1**
- Klien unik (setelah penggabungan alias): owner **96**, customer **57**, gabungan **131**
- Lokasi unik: **22** provinsi, **61** kota/kabupaten (di luar titik pusat Jakarta dan titik provinsi)
- Dimasukkan ke SQL: **155** proyek

## Draft (tanya MTJM)

Semua tetap draft dan diberi komentar `tanya MTJM` di SQL.

| Baris CSV | Proyek | Lokasi (CSV) | Alasan |
|---|---|---|---|
| 58 | WPS & PQR Splicing Works | PLTU TANJUNG JATI | tanya MTJM: objek dan layanan tidak jelas dari CSV |
| 149 | NHM P1 | HALMAHERA | baris 149: tidak ada aturan layanan yang cocok ("CIVIL ,MECHANICAL & ELECTRICAL WORK" / "NHM P1") |
| 150 | NHM P2 | HALMAHERA | baris 150: tidak ada aturan layanan yang cocok ("CIVIL ,MECHANICAL & ELECTRICAL WORK" / "NHM P2") |

## Keputusan yang diterapkan

- Klasifikasi: Repair SPBU Shell Fatmawati = Annual Maintenance Periodic; Apartemen Regatta dan Solar Panel = Electrical for Building, Factory & Street Lighting; 4XKTA50G3 dan Siemens Energy JKT02 = Generator Set Power Plant; SMG = Boilers; Manifold = Piping System.
- Objek kerja yang merupakan group utama (boiler, power plant, water treatment, tangki, dst) menjadi layanan primer; scope (piping, steel structure, electrical, jacking/rolling) menjadi layanan tambahan. Gas turbine bukan Gas Engine (Indorama: Boilers + Piping System).
- Lokasi: Mentaya = Kalimantan Tengah (Kotawaringin Timur), titik provinsi, needs_confirm; Data Center Kuningan = Jakarta Selatan; Sembakung = Kab. Nunukan, Kalimantan Utara; tujuh koreksi otomatis tahap 1 disetujui.
- "JAKARTA" saja = satu titik pusat Jakarta (Jakarta Pusat), `location_precision='city-approx'`, `city` kosong.
- Judul tampilan di kartu untuk nama generik = "<Nama> · <Kota>" (nama asli tetap disimpan).

## Jumlah per group layanan

Menurut layanan primer (hanya proyek yang punya layanan):

| Group | Proyek |
|---|---:|
| Power Plant | 49 |
| Storage Tank & Boilers | 25 |
| Civil & Architecture | 21 |
| Electrical | 15 |
| Mechanical | 15 |
| Industrial & Factory | 12 |
| Water Treatment Plant | 11 |
| Relocation & Dismantling | 4 |

Menurut keanggotaan (proyek dihitung sekali di tiap group yang disentuh layanannya):

| Group | Proyek |
|---|---:|
| Power Plant | 50 |
| Mechanical | 37 |
| Civil & Architecture | 25 |
| Storage Tank & Boilers | 25 |
| Electrical | 16 |
| Water Treatment Plant | 13 |
| Industrial & Factory | 12 |
| Relocation & Dismantling | 7 |

Menurut sub-layanan primer:

| Sub-layanan | Proyek |
|---|---:|
| Generator Set Power Plant | 32 |
| Boilers | 19 |
| Gas Engine Power Plant | 13 |
| Installation Custom Machine | 11 |
| Building | 10 |
| Piping System | 10 |
| Clean Water Treatment Plant | 8 |
| Transmission & Distribution Line | 8 |
| Steel Structure | 7 |
| Oil & Water Tank | 5 |
| Coal Fired Power Plant | 4 |
| Container Modification | 4 |
| Jacking & Rolling | 4 |
| Electrical for Building, Factory & Street Lighting | 3 |
| MV & LV Panel Maker and Installation | 3 |
| Fire Fighting & Protection System | 2 |
| HVAC | 2 |
| Sewage Treatment Plant | 2 |
| Annual Maintenance Periodic | 1 |
| Filter Tank | 1 |
| Instrument & Control Installation | 1 |
| Pumps System | 1 |
| Waste Water Treatment Plant | 1 |

## Jumlah per provinsi

| Provinsi | Proyek |
|---|---:|
| Jawa Barat | 43 |
| DKI Jakarta | 41 |
| Riau | 13 |
| Banten | 9 |
| Nusa Tenggara Timur | 8 |
| Jawa Tengah | 5 |
| Jawa Timur | 5 |
| Kepulauan Riau | 5 |
| Kalimantan Tengah | 4 |
| Maluku Utara | 4 |
| Kalimantan Utara | 3 |
| Maluku | 3 |
| Kalimantan Barat | 2 |
| Papua Barat | 2 |
| Bali | 1 |
| Jambi | 1 |
| Kalimantan Timur | 1 |
| Papua Tengah | 1 |
| Sulawesi Tengah | 1 |
| Sulawesi Utara | 1 |
| Sumatera Selatan | 1 |
| Sumatera Utara | 1 |

## Jumlah per tahun

| Tahun | Proyek |
|---|---:|
| 2011 | 3 |
| 2012 | 8 |
| 2013 | 6 |
| 2014 | 3 |
| 2015 | 7 |
| 2016 | 10 |
| 2017 | 12 |
| 2018 | 12 |
| 2019 | 11 |
| 2020 | 5 |
| 2021 | 6 |
| 2022 | 12 |
| 2023 | 6 |
| 2024 | 13 |
| 2025 | 15 |
| 2026 | 26 |

## Baris yang digabung

Kombinasi (nama proyek + lokasi + owner + tahun) sama setelah dinormalisasi. Scope tiap baris masuk ke daftar layanan proyek.

| Proyek | Baris CSV | Layanan hasil gabungan |
|---|---|---|
| Water Storage Tank Cap 1500KL (2018) | 54, 55 | Oil & Water Tank; Piping System; Instrument & Control Installation |
| International Terminal Container (2019) | 65, 66, 67, 68 | Oil & Water Tank; Jacking & Rolling; Piping System |
| Install Boiler 4 TPH (2022) | 92, 95 | Boilers; Oil & Water Tank |
| Boiler 5 TPH (2022) | 93, 96, 97 | Boilers; Steel Structure |
| Recycled PET Bottle (2023) | 103, 106, 108, 109, 111 | Installation Custom Machine; Piping System |

## Penggabungan nama klien (alias)

Varian penulisan nama yang SAMA digabung (`src/config/client-aliases.ts`). Anak perusahaan/entitas berbeda tidak digabung.

| Nama yang dipakai | Varian yang digabung |
|---|---|
| PT PLN Persero | PT PLN |
| PT Sumberdaya Sewatama | PT Sewatama |
| PT Inductotherm Indonesia | PT Inductotherm |
| PT Wijaya Karya | PT Wika |
| PT Thermax International Indonesia | PT Thermax International |
| PT Aggreko Indonesia | PT Aggreko - Kbt; PT Aggreko International |

Klien unik akhir: owner **96**, customer **57**, gabungan **131**.

## Lokasi dengan satu titik pusat Jakarta (city-approx)

`location_precision='city-approx'`, `city` kosong, titik = Jakarta Pusat.

| Proyek | Baris | Teks CSV |
|---|---|---|
| Installation Trafo & Cubicle | 32 | JAKARTA |
| Replacemet Cable MV | 46 | JAKARTA |
| Dismantle & Installation Cubicle | 53 | JAKARTA |
| Installation Genset 1 X 400 KV | 73 | DAANMOGOT - JAKARTA |
| HVAC Work | 81 | JAKARTA |
| Perbaikan Hotel | 85 | JAKARTA |
| Installation Genset 5 X 1250 KVA | 98 | JAKARTA |
| MIG Data Centre | 112 | JAKARTA |
| Edge Data Centre | 113 | JAKARTA |
| Relocation Boiler & Press Machine | 120 | JAKARTA |
| Installation Genset 5 X 1250 KVA | 133 | JAKARTA |

## Lokasi yang dipetakan ke titik provinsi (perkiraan)

`location_precision='province'`, `city` kosong, titik = rata-rata kota di dataset.

| Proyek | Baris | Teks CSV | Provinsi | Catatan |
|---|---|---|---|---|
| Dismantle Gas Engine MWM 14 X 1,7 MW | 51 | RAWA MINYAK - RIAU | Riau | "RAWA MINYAK" tidak ada di dataset kota; memakai titik provinsi |
| PLTMG Gasib Gas Engine MWM 14 X 1,7 MW | 52 | GASIB - RIAU | Riau | "GASIB" tidak ada di dataset kota; memakai titik provinsi |
| PLTD Nanga Tayap 6 MW | 61 | KALIMANTAN BARAT | Kalimantan Barat | hanya provinsi/wilayah yang tertulis; memakai titik provinsi |
| PLTU 2 X 1000 KALTENG | 75 | KALTENG | Kalimantan Tengah | hanya provinsi/wilayah yang tertulis; memakai titik provinsi |
| Boiler 5 TPH | 90 | MENTAYA | Kalimantan Tengah | Lokasi perlu dikonfirmasi ke MTJM: Mentaya (Kotawaringin Timur), Kalimantan Tengah |
| Installation Genset 7 X 1250 KVA | 105 | SUMBA - NTT | Nusa Tenggara Timur | "SUMBA" tidak ada di dataset kota; memakai titik provinsi |
| PT Elnusa Rokan | 114 | RIAU | Riau | hanya provinsi/wilayah yang tertulis; memakai titik provinsi |
| PLTD NTT Container Control Room | 136 | NTT | Nusa Tenggara Timur | hanya provinsi/wilayah yang tertulis; memakai titik provinsi |
| PLTD NTT Fuel Pump Skid | 137 | NTT | Nusa Tenggara Timur | hanya provinsi/wilayah yang tertulis; memakai titik provinsi |
| NHM P1 | 149 | HALMAHERA | Maluku Utara | hanya provinsi/wilayah yang tertulis; memakai titik provinsi |
| NHM P2 | 150 | HALMAHERA | Maluku Utara | hanya provinsi/wilayah yang tertulis; memakai titik provinsi |

## Koreksi lokasi otomatis

| Proyek | Baris | Teks CSV | Hasil | Alasan |
|---|---|---|---|---|
| Repair SPBU Shell - Fatmawati | 31 | FATMAWATI - JAKBAR | Jakarta Selatan, DKI Jakarta | CSV menulis JAKBAR; Fatmawati ada di Jakarta Selatan |
| Instalasi Steel Furnace Cap. 3 Ton | 47 | TOYOTA SUNTER - JAKARTA | Jakarta Utara, DKI Jakarta | Sunter termasuk Jakarta Utara |
| PLTD Pertamina Sembakung | 63 | KALIMANTAN BARAT | Nunukan, Kalimantan Utara | CSV menulis Kalimantan Barat; Sembakung ada di Kab. Nunukan, Kalimantan Utara |
| PLTD Kaimana | 69 | KAIMANA - PAPUA | Kaimana, Papua Barat | CSV menulis Papua; Kaimana ada di Papua Barat |
| PLTD Timika 5 MW | 70 | TIMIKA - PAPUA | Mimika (Timika), Papua Tengah | CSV menulis Papua; Timika (Kab. Mimika) kini masuk Papua Tengah |
| Boiler Kap 10TS | 78 | CILENGSI - BANTEN | Cileungsi, Jawa Barat | CSV menulis Banten; Cileungsi ada di Kab. Bogor, Jawa Barat |
| PLTD 5MW 20kV 50Hz Dieses | 130 | BINTUNI = PAPUA | Teluk Bintuni, Papua Barat | CSV menulis Bintuni = Papua; Teluk Bintuni ada di Papua Barat |
| Work Termination and Replaced Bushing PLN Ambon Sanana | 142 | SANANA- MALUKU | Sanana (Kepulauan Sula), Maluku Utara | CSV menulis Maluku; Sanana (Kep. Sula) ada di Maluku Utara |
| Work Termination 150ml data center kuningan | 152 | KUNINGAN | Jakarta Selatan, DKI Jakarta | Kuningan dipetakan ke Jakarta Selatan (keputusan pemilik data) |

## Kota yang ditambahkan ke src/lib/indonesia.ts

Agar admin bisa memilihnya di form. Koordinat perkiraan.

| Kota | Provinsi | Koordinat |
|---|---|---|
| Cikarang | Jawa Barat | -6.31, 107.15 |
| Cileungsi | Jawa Barat | -6.39, 106.96 |
| Palabuhan Ratu (Sukabumi) | Jawa Barat | -6.99, 106.55 |
| Labuan (Pandeglang) | Banten | -6.37, 105.83 |
| Belawan (Medan) | Sumatera Utara | 3.78, 98.69 |
| Cibitung | Jawa Barat | -6.27, 107.08 |
| Dobo (Kepulauan Aru) | Maluku | -5.77, 134.22 |
| Saumlaki (Maluku Tenggara Barat) | Maluku | -7.98, 131.3 |
| Jombang | Jawa Timur | -7.55, 112.23 |
| Bojonegoro | Jawa Timur | -7.15, 111.88 |
| Cikande (Serang) | Banten | -6.22, 106.31 |
| Rote Ndao | Nusa Tenggara Timur | -10.75, 123.1 |
| Alor | Nusa Tenggara Timur | -8.25, 124.6 |
| Kendal | Jawa Tengah | -6.92, 110.2 |
| Cikampek | Jawa Barat | -6.41, 107.45 |
| Selat Panjang (Kepulauan Meranti) | Riau | 1, 102.72 |
| Larantuka (Flores Timur) | Nusa Tenggara Timur | -8.34, 122.99 |
| Kaimana | Papua Barat | -3.65, 133.75 |
| Sanana (Kepulauan Sula) | Maluku Utara | -2.06, 125.97 |

## Lokasi yang dipetakan lewat alias ke kota/kabupaten di dataset

| Teks CSV | Hasil | Catatan |
|---|---|---|
| PONDOK INDAH - JAKARTA SELATAN | Jakarta Selatan, DKI Jakarta | "PONDOK INDAH" termasuk Jakarta Selatan |
| GROGOL - JAKARTA BARAT | Jakarta Barat, DKI Jakarta | "GROGOL" termasuk Jakarta Barat |
| TJ PRIOK - JAKARTA UTARA | Jakarta Utara, DKI Jakarta | "TJ PRIOK" termasuk Jakarta Utara |
| KEBON JERUK - JAKARTA BARAT | Jakarta Barat, DKI Jakarta | "KEBON JERUK" termasuk Jakarta Barat |
| UKUI - RIAU | Pelalawan, Riau | Ukui termasuk Kab. Pelalawan |
| DURI - RIAU | Bengkalis, Riau | Duri termasuk Kab. Bengkalis |
| KEMANG - JAKSEL | Jakarta Selatan, DKI Jakarta | "KEMANG" termasuk Jakarta Selatan |
| SUNTER - JAKUT | Jakarta Utara, DKI Jakarta | "SUNTER" termasuk Jakarta Utara |
| PLUIT - JAKUT | Jakarta Utara, DKI Jakarta | "PLUIT" termasuk Jakarta Utara |
| LIRIK - RIAU | Indragiri Hulu, Riau | Lirik termasuk Kab. Indragiri Hulu |
| SENTUL - BOGOR | Bogor, Jawa Barat | "SENTUL" termasuk Bogor |
| SPBU SHELL - BANDUNG | Bandung, Jawa Barat | "SPBU SHELL" termasuk Bandung |
| LANGGAM - RIAU | Pelalawan, Riau | Langgam termasuk Kab. Pelalawan |
| PLTU TANJUNG JATI | Jepara, Jawa Tengah | PLTU Tanjung Jati ada di Kab. Jepara |
| RENGAT - RIAU | Indragiri Hulu, Riau | Rengat = ibu kota Kab. Indragiri Hulu |
| SERPONG - BANTEN | Tangerang Selatan, Banten | Serpong termasuk Kota Tangerang Selatan |
| CAKUNG | Jakarta Timur, DKI Jakarta | Cakung termasuk Jakarta Timur |
| PLTU KUPANG | Kupang, Nusa Tenggara Timur | PLTU Kupang |
| MARUNDA - JAKARTA UTARA | Jakarta Utara, DKI Jakarta | "MARUNDA" termasuk Jakarta Utara |
| MERAK - BANTEN | Cilegon, Banten | Merak termasuk Kota Cilegon |
| WAINGAPU - SUMBA | Waingapu (Sumba Timur), Nusa Tenggara Timur | "SUMBA" tidak dipetakan |
| TOBELO | Halmahera Utara, Maluku Utara | Tobelo = ibu kota Kab. Halmahera Utara |

## Nama proyek generik

Nama asli disimpan. Di kartu, judul tampil "<Nama> · <Kota>" (daftar: `src/config/generic-names.ts`).

| Nama | Baris | Lokasi | Owner |
|---|---|---|---|
| Factory Renovation | 6 | CIKARANG - JAWA BARAT | PT Mitsubishi Electric |
| Building Renovation | 9 | GROGOL - JAKARTA BARAT | Kementerian Perdagangan |
| Building Renovation | 10 | TJ PRIOK - JAKARTA UTARA | KPP Pratama - Tj Priok |
| Factory Renovation | 36 | MALANG | Bentoel Group |
| Water Treatment Work | 56 | PLTU LABUAN | PLTU Labuan |
| Renovation | 57 | BEKASI | HKBP |
| HVAC Work | 81 | JAKARTA | Cyber Bulding 2 |
| Water Treatment Work | 82 | TANGERANG | PT Kobe |
| Chiller & Genset Work | 83 | CIBITUNG - JABAR | PT XL |
| Chiller & Genset Work | 88 | BATAM - KEPRI | McDermott |
| Mining Facility | 89 | SAMARINDA | PT Kutai Energi |

## Catatan metode

- Scope generik tanpa kata kunci spesifik ("ELECTRICAL WORK", "MECHANICAL & ELECTRICAL WORK", "E.P.C ...", "CIVIL, MECHANICAL & ELECTRICAL WORK") tidak menentukan sub-layanan.
- "Dismantle gas engine" masuk Gas Engine Power Plant; load bank masuk Generator Set; reverse osmosis dan IPA masuk Clean Water Treatment; civil work generik masuk Building.
- Kolom `category` (lama) diisi dari layanan primer; draft tanpa layanan memakai `industrial-maintenance` sebagai nilai netral. Kolom `client` diisi owner (atau customer bila owner kosong).
- Deskripsi memakai template netral "<Layanan> work at <Kota>, <Provinsi> (<Tahun>)" ("in" bila kota kosong); kosong untuk draft tanpa layanan.
- `PT.` / `PT` / `Tbk.` diseragamkan menjadi `PT` dan `Tbk`; teks yang sudah campuran huruf besar/kecil dipertahankan.
- Catatan di kolom `admin_note` (hanya terlihat di admin): koreksi lokasi, lokasi perkiraan, dan permintaan konfirmasi.

