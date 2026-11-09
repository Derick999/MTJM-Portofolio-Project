-- Kolom tambahan untuk impor proyek dari CSV (supabase/seed/004_projects_import.sql) dan tampilan owner/customer.
-- Idempotent: aman dijalankan lebih dari sekali. Tidak mengubah 001-004. RLS tidak berubah.
-- Jalankan setelah 004_services.sql dan SEBELUM supabase/seed/004_projects_import.sql.
--
--   owner, customer      : pemilik proyek dan pelanggan (keduanya tampil publik; kartu memakai owner, bila kosong customer)
--   location_precision   : 'city' (kota/kabupaten), 'city-approx' (hanya "Jakarta": titik pusat kota, city kosong),
--                          'province' (hanya provinsi: titik provinsi, city kosong)
--   source_key           : kunci unik baris hasil impor CSV (untuk impor ulang yang idempoten); NULL untuk proyek buatan admin
--   source_rows          : nomor baris CSV sumber

alter table public.projects
  add column if not exists owner text not null default '',
  add column if not exists customer text not null default '',
  add column if not exists location_precision text not null default 'city',
  add column if not exists source_key text,
  add column if not exists source_rows int[] not null default '{}';

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.projects'::regclass and conname = 'projects_location_precision_check') then
    alter table public.projects
      add constraint projects_location_precision_check check (location_precision in ('city', 'city-approx', 'province'));
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.projects'::regclass and conname = 'projects_source_key_key') then
    alter table public.projects add constraint projects_source_key_key unique (source_key);
  end if;
end $$;
