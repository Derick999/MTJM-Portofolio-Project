-- Angka statistik di beranda (diisi manual oleh admin, bukan dihitung dari tabel projects).
-- Jalankan di Supabase > SQL Editor SETELAH 001_schema.sql. Aman dijalankan ulang.

create table if not exists public.site_stats (
  key        text primary key,
  value      integer not null check (value >= 0),
  label      text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_stats enable row level security;

-- Semua orang boleh membaca; hanya admin yang boleh menulis.
drop policy if exists "site_stats_read_public" on public.site_stats;
create policy "site_stats_read_public" on public.site_stats
  for select using (true);

drop policy if exists "site_stats_admin_write" on public.site_stats;
create policy "site_stats_admin_write" on public.site_stats
  for all using (public.is_admin()) with check (public.is_admin());

-- Nilai awal. Tidak menimpa angka yang sudah diubah admin.
insert into public.site_stats (key, value, label) values
  ('projects',  165, 'Proyek'),
  ('clients',    50, 'Klien'),
  ('locations',  20, 'Lokasi di Indonesia')
on conflict (key) do nothing;
