-- Data awal MTJM (dibuat otomatis oleh scripts/gen-seed-sql.mjs). Jalankan setelah 001_schema.sql.
insert into public.projects (slug, category, name, client, year, province, city, lat, lng, description, scope, status_data, admin_note) values
  ('pltmg-teluk-lembu-pekanbaru-2016', 'genset', 'PLTMG Teluk Lembu 7 x 3,3 MW', '', 2016, 'Riau', 'Pekanbaru', 0.51, 101.45, 'Pembangkit listrik tenaga mesin gas (PLTMG) Teluk Lembu, Pekanbaru, kapasitas 7 x 3,3 MW. Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', 'Gas engine / genset 7 unit @ 3,3 MW.', 'published', ''),
  ('pltd-waingapu-sumba-2023', 'genset', 'PLTD Waingapu, Sumba', '', 2023, 'Nusa Tenggara Timur', 'Waingapu (Sumba Timur)', -9.66, 120.26, 'Pembangkit listrik tenaga diesel (PLTD) Waingapu, Pulau Sumba. Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', 'Pekerjaan genset PLTD.', 'published', ''),
  ('boiler-thermax-amurang-2023', 'boiler', 'Boiler Thermax 2 x 6 TPH, Amurang', '', 2023, 'Sulawesi Utara', 'Minahasa Selatan (Amurang)', 1.2, 124.58, 'Pekerjaan boiler Thermax 2 unit @ 6 TPH di Amurang. Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', 'Boiler Thermax 2 x 6 TPH.', 'published', ''),
  ('pipeline-spam-jatiluhur-2024', 'piping', 'Pipeline SPAM Jatiluhur', '', 2024, 'Jawa Barat', 'Purwakarta', -6.56, 107.44, 'Pekerjaan pipeline sistem penyediaan air minum (SPAM) Jatiluhur, periode 2024-2025. Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', 'Pekerjaan pipeline SPAM.', 'published', 'Pekerjaan berjalan 2024-2025; tahun diisi dengan tahun mulai.'),
  ('piping-pendingin-pltu-palu-2015', 'piping', 'Piping Sistem Pendingin PLTU Palu 2 x 18 MW', '', 2015, 'Sulawesi Tengah', 'Palu', -0.9, 119.87, 'Pekerjaan piping sistem pendingin PLTU Palu 2 x 18 MW. Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', 'Piping sistem pendingin.', 'published', ''),
  ('relokasi-transformator-pltu-kupang-2022', 'relokasi', 'Relokasi Transformator 100 MVA PLTU Kupang', '', 2022, 'Nusa Tenggara Timur', 'Kupang', -10.18, 123.6, 'Relokasi transformator 100 MVA di PLTU Kupang dengan metode jacking dan rolling. Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', 'Jacking and rolling transformator 100 MVA.', 'published', ''),
  ('wtp-cilacap-2018', 'water', 'Water Treatment Plant Cilacap 15 LPS', '', 2018, 'Jawa Tengah', 'Cilacap', -7.73, 109.02, 'Instalasi water treatment plant kapasitas 15 liter per detik di Cilacap, periode 2018-2019. Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', 'WTP kapasitas 15 LPS.', 'published', 'Pekerjaan berjalan 2018-2019; tahun diisi dengan tahun mulai.'),
  ('boiler-dumai', 'boiler', 'Boiler Dumai', '', 2020, 'Riau', 'Dumai', 1.67, 101.45, 'Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', '', 'draft', 'Perlu dicek: kapasitas boiler tidak konsisten di dokumen sumber. Tahun masih perkiraan.'),
  ('boiler-muthu-gading-solo', 'boiler', 'Boiler Muthu Gading, Solo', 'Muthu Gading', 2020, 'Jawa Tengah', 'Surakarta (Solo)', -7.57, 110.82, 'Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', '', 'draft', 'Perlu dicek: kapasitas boiler tidak konsisten di dokumen sumber. Tahun masih perkiraan.'),
  ('proyek-lirik', 'genset', 'Proyek Lirik', '', 2020, 'Riau', 'Indragiri Hulu', -0.73, 102.25, 'Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', '', 'draft', 'Perlu dicek: tahun tidak konsisten di dokumen sumber. Kategori masih perkiraan.'),
  ('proyek-teluk-lamong', 'piping', 'Proyek Teluk Lamong', '', 2020, 'Jawa Timur', 'Surabaya', -7.25, 112.75, 'Data contoh dari ringkasan company profile. Lengkapi keterangan dan foto lewat halaman admin.', '', 'draft', 'Perlu dicek: tahun tidak konsisten di dokumen sumber. Kategori masih perkiraan.')
on conflict (slug) do nothing;

-- Foto placeholder (ganti dengan foto asli lewat halaman admin).
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/genset.svg', 0 from public.projects where slug = 'pltmg-teluk-lembu-pekanbaru-2016'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/genset.svg', 0 from public.projects where slug = 'pltd-waingapu-sumba-2023'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/boiler.svg', 0 from public.projects where slug = 'boiler-thermax-amurang-2023'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/piping.svg', 0 from public.projects where slug = 'pipeline-spam-jatiluhur-2024'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/piping.svg', 0 from public.projects where slug = 'piping-pendingin-pltu-palu-2015'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/relokasi.svg', 0 from public.projects where slug = 'relokasi-transformator-pltu-kupang-2022'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/water.svg', 0 from public.projects where slug = 'wtp-cilacap-2018'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/boiler.svg', 0 from public.projects where slug = 'boiler-dumai'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/boiler.svg', 0 from public.projects where slug = 'boiler-muthu-gading-solo'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/genset.svg', 0 from public.projects where slug = 'proyek-lirik'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
insert into public.project_photos (project_id, url, sort_order)
select id, '/placeholder/piping.svg', 0 from public.projects where slug = 'proyek-teluk-lamong'
and not exists (select 1 from public.project_photos x where x.project_id = public.projects.id);
