-- Menambah kolom `services` (taksonomi layanan 8 group / 27 sub-layanan, lihat src/config/services.ts).
-- Idempotent: aman dijalankan lebih dari sekali. Tidak mengubah 001-003. RLS tidak berubah.
-- Jalankan di Supabase: SQL Editor -> New query -> paste -> Run (setelah 001, 002, dan 003_categories.sql).
--
-- services[1] = layanan utama, elemen berikutnya = layanan tambahan. Slug tidak dibatasi CHECK, jadi menambah layanan baru
-- cukup lewat src/config/services.ts.
--
-- Kolom `category` LAMA TETAP ADA (DEPRECATED): masih NOT NULL dengan CHECK constraint dan diisi otomatis oleh admin dari layanan utama.
-- UI publik tidak lagi memakainya.

alter table public.projects add column if not exists services text[] not null default '{}';

create index if not exists projects_services_gin on public.projects using gin (services);

-- Backfill hanya untuk baris yang services-nya masih kosong. Aturan TEBAKAN, sama dengan legacyToServices() di src/config/services.ts.
update public.projects
set services = array[
  case category
    when 'boiler' then 'boilers'
    when 'genset' then case when name ~* 'pltd|genset|kva' then 'generator-set-power-plant' else 'gas-engine-power-plant' end
    when 'piping' then 'piping-system'
    when 'relokasi' then 'jacking-rolling'
    when 'container' then 'container-modification'
    when 'water' then 'clean-water-treatment'
    when 'power-plant' then case when name ~* 'pltu|coal|batu bara' then 'coal-fired-power-plant' else 'generator-set-power-plant' end
    when 'electrical-work' then case when name ~* 'kabel|panel|load bank|\ymv\y|\ylv\y' then 'mv-lv-panel' else 'building-factory-lighting' end
    when 'civil-steel' then case when name ~* 'renovasi|gedung' then 'building' else 'steel-structure' end
    when 'fire-protection' then 'fire-fighting-protection'
    when 'storage-tanks' then 'oil-water-tank'
    when 'industrial-maintenance' then 'annual-maintenance'
    when 'building-factory' then case when name ~* 'renovasi' then 'building' else 'custom-machine-installation' end
  end
]
where services = '{}';

-- Untuk memeriksa hasil tebakan (laporan): jalankan query ini, lalu perbaiki yang keliru lewat halaman admin.
--   select slug, name, category, services from public.projects order by category, name;
