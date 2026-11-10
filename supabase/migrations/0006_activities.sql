-- =====================================================================
-- SIM Karang Taruna Dusun Tagog
-- Migrasi 6: Agenda kegiatan
--
-- Agenda dikelola pengurus dan ditampilkan di halaman publik.
-- Tidak ada hard delete: kegiatan yang batal cukup diubah statusnya.
-- =====================================================================

create type public.activity_status as enum (
  'planned',
  'ongoing',
  'done',
  'cancelled'
);

create table public.activities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(trim(title)) > 0),
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  status      public.activity_status not null default 'planned',
  is_public   boolean not null default true,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint activities_time_range check (ends_at is null or ends_at >= starts_at)
);

create index idx_activities_starts_at on public.activities (starts_at desc);
create index idx_activities_public_starts
  on public.activities (starts_at)
  where is_public = true and status <> 'cancelled';

create trigger trg_activities_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

alter table public.activities enable row level security;

-- Pengurus boleh membaca seluruh agenda (termasuk yang belum publik).
create policy activities_select_board
on public.activities for select to authenticated
using (public.is_board());

-- Pengurus boleh membuat agenda.
create policy activities_insert_board
on public.activities for insert to authenticated
with check (public.is_board());

-- Pengurus boleh mengubah agenda. Tidak ada policy DELETE.
create policy activities_update_board
on public.activities for update to authenticated
using (public.is_board())
with check (public.is_board());

-- ---------------------------------------------------------------------
-- View publik: hanya agenda yang ditandai publik dan tidak dibatalkan.
-- ---------------------------------------------------------------------
create or replace view public.public_activities
with (security_barrier = true) as
select
  a.id,
  a.title,
  a.description,
  a.location,
  a.starts_at,
  a.ends_at,
  a.status
from public.activities a
where a.is_public = true
  and a.status <> 'cancelled';

grant select on public.public_activities to anon, authenticated;

comment on view public.public_activities is
  'Agenda kegiatan yang aman ditampilkan ke publik. Tidak memuat identitas pembuat.';
