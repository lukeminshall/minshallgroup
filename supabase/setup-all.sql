-- Minshall Group client portal: full setup (001 + 002). Paste into Supabase SQL Editor and press Run once.

-- =====================================================================
-- Minshall Group client portal — schema, security rules and storage.
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Logins come from Clerk (Supabase → Authentication → Third-party auth →
-- Clerk). auth.jwt()->>'sub' is the Clerk user id.
-- Clients only ever see their own project. Admins (rows in public.admins)
-- see and manage everything. Only admins can change stages, quotes,
-- invoices and scores; triggers enforce this even if a client edits a row.
-- =====================================================================


-- ---------- who is an admin ----------
create table if not exists public.admins (
  user_id text primary key,            -- Clerk user id, e.g. user_2abc…
  note text
);
alter table public.admins enable row level security;
create or replace function public.uid() returns text language sql stable as $$ select auth.jwt()->>'sub' $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = public.uid())
$$;
create policy "admins can see admins" on public.admins for select using (public.is_admin() or user_id = public.uid());

-- ---------- projects ----------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null default public.uid(),
  owner_email text,
  owner_name text,
  business_name text not null,
  website text,
  package text check (package in ('refresh','rebuild','grow')),
  pages int,
  addons text[] not null default '{}',
  domain_mode text check (domain_mode in ('have','need')),
  domain text,
  hosting text not null default 'us' check (hosting in ('us','self')),
  quote_total int,
  stage text not null default 'onboarding' check (stage in ('onboarding','design','build','review','live')),
  preview_url text,
  live_url text,
  clarity_url text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clients_owner on public.clients(owner_id);
alter table public.clients enable row level security;
create policy "clients: read own" on public.clients for select using (owner_id = public.uid() or public.is_admin());
create policy "clients: create own" on public.clients for insert with check (owner_id = public.uid());
create policy "clients: update own" on public.clients for update using (owner_id = public.uid() or public.is_admin());
create policy "clients: admin delete" on public.clients for delete using (public.is_admin());

-- clients cannot move their own stage, links, quote or notes
create or replace function public.protect_client_fields() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.stage := 'onboarding'; new.preview_url := null; new.live_url := null; new.clarity_url := null; new.admin_note := null;
    else
      new.owner_id := old.owner_id; new.stage := old.stage; new.preview_url := old.preview_url; new.live_url := old.live_url;
      new.clarity_url := old.clarity_url; new.admin_note := old.admin_note; new.quote_total := old.quote_total;
      new.package := old.package; new.pages := old.pages; new.addons := old.addons;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists clients_protect on public.clients;
create trigger clients_protect before insert or update on public.clients for each row execute function public.protect_client_fields();

-- helper: may the caller see this project?
create or replace function public.can_see(cid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (select 1 from public.clients c where c.id = cid and c.owner_id = public.uid())
$$;

-- ---------- onboarding brief ----------
create table if not exists public.briefs (
  client_id uuid primary key references public.clients(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.briefs enable row level security;
create policy "briefs: read" on public.briefs for select using (public.can_see(client_id));
create policy "briefs: write" on public.briefs for insert with check (public.can_see(client_id));
create policy "briefs: update" on public.briefs for update using (public.can_see(client_id));

-- ---------- uploaded files (metadata; the files live in storage) ----------
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  path text not null,
  name text,
  kind text not null default 'brief' check (kind in ('brief','request','invoice','other')),
  size int,
  uploaded_by text not null default public.uid(),
  created_at timestamptz not null default now()
);
alter table public.files enable row level security;
create policy "files: read" on public.files for select using (public.can_see(client_id));
create policy "files: add" on public.files for insert with check (public.can_see(client_id));
create policy "files: remove own" on public.files for delete using (public.is_admin() or (public.can_see(client_id) and uploaded_by = public.uid()));

-- ---------- change requests, questions, approvals ----------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  kind text not null default 'change' check (kind in ('change','question','approval')),
  title text not null,
  body text,
  status text not null default 'new' check (status in ('new','quoted','approved','in_progress','done','declined')),
  quote_gbp int,
  created_by text not null default public.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists requests_client on public.requests(client_id);
alter table public.requests enable row level security;
create policy "requests: read" on public.requests for select using (public.can_see(client_id));
create policy "requests: add" on public.requests for insert with check (public.can_see(client_id));
create policy "requests: update" on public.requests for update using (public.can_see(client_id));

-- clients can only: open new requests, approve a design, and approve/decline a quote
create or replace function public.protect_request_fields() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.quote_gbp := null;
      new.status := case when new.kind = 'approval' then 'approved' else 'new' end;
    else
      new.client_id := old.client_id; new.kind := old.kind; new.quote_gbp := old.quote_gbp; new.created_by := old.created_by;
      if not (old.status = 'quoted' and new.status in ('approved','declined')) then new.status := old.status; end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists requests_protect on public.requests;
create trigger requests_protect before insert or update on public.requests for each row execute function public.protect_request_fields();

create table if not exists public.request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  author_id text not null default public.uid(),
  from_admin boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.request_messages enable row level security;
create policy "messages: read" on public.request_messages for select using (exists (select 1 from public.requests r where r.id = request_id and public.can_see(r.client_id)));
create policy "messages: add" on public.request_messages for insert with check (author_id = public.uid() and exists (select 1 from public.requests r where r.id = request_id and public.can_see(r.client_id)));
create or replace function public.stamp_message() returns trigger language plpgsql security definer set search_path = public as $$
begin new.from_admin := public.is_admin(); return new; end $$;
drop trigger if exists messages_stamp on public.request_messages;
create trigger messages_stamp before insert on public.request_messages for each row execute function public.stamp_message();

-- ---------- invoices (raised in your accounting software, tracked here) ----------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  number text,
  label text not null,
  amount_gbp numeric(10,2) not null,
  status text not null default 'draft' check (status in ('draft','due','paid','overdue','void')),
  issued_on date,
  due_on date,
  view_url text,          -- the online invoice / pay link from your accounting software
  pdf_path text,          -- optional PDF in storage
  created_at timestamptz not null default now()
);
alter table public.invoices enable row level security;
create policy "invoices: client reads issued" on public.invoices for select using (public.is_admin() or (status <> 'draft' and public.can_see(client_id)));
create policy "invoices: admin writes" on public.invoices for all using (public.is_admin()) with check (public.is_admin());

-- ---------- performance history ----------
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  url text,
  checked_at timestamptz not null default now(),
  data jsonb not null,    -- the full Webmins check result (signals, pillars, industry, Google scores)
  label text              -- e.g. 'Before', 'Launch', 'Monthly'
);
create index if not exists scores_client on public.scores(client_id, checked_at desc);
alter table public.scores enable row level security;
create policy "scores: read" on public.scores for select using (public.can_see(client_id));
-- scores are written by the server (service role), never by browsers

-- ---------- storage: private bucket, one folder per project ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-files', 'client-files', false, 26214400)
on conflict (id) do nothing;
create policy "files bucket: read" on storage.objects for select
  using (bucket_id = 'client-files' and public.can_see(((storage.foldername(name))[1])::uuid));
create policy "files bucket: upload" on storage.objects for insert
  with check (bucket_id = 'client-files' and public.can_see(((storage.foldername(name))[1])::uuid));
create policy "files bucket: delete" on storage.objects for delete
  using (bucket_id = 'client-files' and (public.is_admin() or owner_id = public.uid()));

-- =====================================================================
-- Minshall Group client portal: notifications and unread updates.
-- Run after 001_client_portal.sql: SQL Editor → New query → paste → Run.
--   1. signups: one row per new account, so the team is emailed once.
--   2. 'message' requests: the team can start a conversation with a client.
--   3. unread tracking: each request remembers the latest activity from each
--      side and when each side last looked at it.
-- =====================================================================

-- ---------- 1. new accounts ----------
create table if not exists public.signups (
  user_id text primary key,              -- Clerk user id
  email text,
  name text,
  created_at timestamptz not null default now()
);
alter table public.signups enable row level security;
-- written only by the server (service role); admins can read
drop policy if exists "signups: admin read" on public.signups;
create policy "signups: admin read" on public.signups for select using (public.is_admin());

-- ---------- 2. team-started conversations ----------
alter table public.requests drop constraint if exists requests_kind_check;
alter table public.requests add constraint requests_kind_check check (kind in ('change','question','approval','message'));

-- ---------- 3. unread tracking ----------
alter table public.requests add column if not exists last_team_at timestamptz;
alter table public.requests add column if not exists last_client_at timestamptz;
alter table public.requests add column if not exists team_seen_at timestamptz;
alter table public.requests add column if not exists client_seen_at timestamptz;
update public.requests set last_client_at = coalesce(last_client_at, created_at), client_seen_at = coalesce(client_seen_at, created_at) where created_by not in (select user_id from public.admins);

-- Replaces the 001 version. Same protections, plus:
--  * only the team can start a 'message' (a client's becomes a 'question')
--  * activity is stamped for the side that acted (new request, status or quote change)
--  * each side may mark only its own "seen" time, and cannot fake the other side's activity
create or replace function public.protect_request_fields() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.kind = 'message' then new.kind := 'question'; end if;
      new.quote_gbp := null;
      new.status := case when new.kind = 'approval' then 'approved' else 'new' end;
      new.last_client_at := now(); new.client_seen_at := now();
      new.last_team_at := null; new.team_seen_at := null;
    else
      new.client_id := old.client_id; new.kind := old.kind; new.quote_gbp := old.quote_gbp; new.created_by := old.created_by;
      if not (old.status = 'quoted' and new.status in ('approved','declined')) then new.status := old.status; end if;
      new.last_team_at := old.last_team_at; new.team_seen_at := old.team_seen_at;
      if new.status is distinct from old.status then new.last_client_at := now(); end if;
    end if;
  else
    if tg_op = 'INSERT' then
      new.last_team_at := now(); new.team_seen_at := now(); new.last_client_at := null; new.client_seen_at := null;
    else
      new.last_client_at := old.last_client_at; new.client_seen_at := old.client_seen_at;
      if new.status is distinct from old.status or new.quote_gbp is distinct from old.quote_gbp then new.last_team_at := now(); end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

-- a new message counts as activity for the side that wrote it
create or replace function public.touch_request() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.from_admin then
    update public.requests set last_team_at = now(), team_seen_at = now() where id = new.request_id;
  else
    update public.requests set last_client_at = now(), client_seen_at = now() where id = new.request_id;
  end if;
  return new;
end $$;
drop trigger if exists messages_touch on public.request_messages;
create trigger messages_touch after insert on public.request_messages for each row execute function public.touch_request();
