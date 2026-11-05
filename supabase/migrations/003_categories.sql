-- Memperluas kategori proyek dari 6 menjadi 13 (mengikuti "Our Services" di company profile).
-- Idempotent: aman dijalankan lebih dari sekali. Tidak mengubah 001/002 dan tidak mengubah data proyek yang ada.
-- Jalankan di Supabase: SQL Editor -> New query -> paste -> Run (setelah 001 dan 002).

do $$
declare c record;
begin
  -- buang CHECK lama pada kolom category (nama bawaan: projects_category_check) sebelum dipasang ulang
  for c in
    select conname from pg_constraint
    where conrelid = 'public.projects'::regclass and contype = 'c' and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format('alter table public.projects drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.projects
  add constraint projects_category_check check (category in (
    'boiler', 'genset', 'water', 'piping', 'relokasi', 'container',
    'power-plant', 'electrical-work', 'civil-steel', 'fire-protection',
    'storage-tanks', 'industrial-maintenance', 'building-factory'
  ));
