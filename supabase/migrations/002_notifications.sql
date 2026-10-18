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
