-- Skema database MTJM. Jalankan di Supabase: SQL Editor -> New query -> paste -> Run.

create extension if not exists "pgcrypto";

-- ============ Tabel ============
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  category    text not null check (category in ('boiler','genset','water','piping','relokasi','container')),
  name        text not null,
  client      text not null default '',
  year        int  not null check (year between 1990 and 2100),
  province    text not null,
  city        text not null,
  lat         double precision not null,
  lng         double precision not null,
  description text not null default '',
  scope       text not null default '',
  status_data text not null default 'draft' check (status_data in ('published','draft')),
  admin_note  text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.project_photos (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  url         text not null,
  sort_order  int  not null default 0
);

create index if not exists project_photos_project_idx on public.project_photos(project_id, sort_order);
create index if not exists projects_category_idx on public.projects(category);

-- Daftar akun admin. Hanya user yang ada di tabel ini yang boleh menulis.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ============ RLS ============
alter table public.projects        enable row level security;
alter table public.project_photos  enable row level security;
alter table public.admins          enable row level security;

drop policy if exists "projects_read_published" on public.projects;
create policy "projects_read_published" on public.projects
  for select using (status_data = 'published' or public.is_admin());

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "photos_read_published" on public.project_photos;
create policy "photos_read_published" on public.project_photos
  for select using (
    public.is_admin()
    or exists (select 1 from public.projects p where p.id = project_id and p.status_data = 'published')
  );

drop policy if exists "photos_admin_write" on public.project_photos;
create policy "photos_admin_write" on public.project_photos
  for all using (public.is_admin()) with check (public.is_admin());

-- User hanya boleh melihat baris miliknya sendiri (dipakai untuk cek "apakah saya admin").
drop policy if exists "admins_read_self" on public.admins;
create policy "admins_read_self" on public.admins
  for select using (user_id = auth.uid());

-- ============ Storage ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-photos', 'project-photos', true, 1048576, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public = true, file_size_limit = 1048576;

drop policy if exists "photos_public_read" on storage.objects;
create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'project-photos');

drop policy if exists "photos_admin_insert" on storage.objects;
create policy "photos_admin_insert" on storage.objects
  for insert with check (bucket_id = 'project-photos' and public.is_admin());

drop policy if exists "photos_admin_update" on storage.objects;
create policy "photos_admin_update" on storage.objects
  for update using (bucket_id = 'project-photos' and public.is_admin());

drop policy if exists "photos_admin_delete" on storage.objects;
create policy "photos_admin_delete" on storage.objects
  for delete using (bucket_id = 'project-photos' and public.is_admin());

-- ============ Menambah admin ============
-- Setelah membuat user di Authentication -> Users, jalankan (ganti emailnya):
--   insert into public.admins (user_id) select id from auth.users where email = 'admin@contoh.com';
