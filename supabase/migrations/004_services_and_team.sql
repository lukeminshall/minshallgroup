-- Minshall Group: the portal covers every kind of project, not only websites,
-- and named team members become admins automatically when they sign up.
-- Run once: Supabase → SQL Editor → paste → Run.

-- ---------- what kind of project ----------
alter table public.clients add column if not exists service text not null default 'website';
alter table public.clients drop constraint if exists clients_service_check;
alter table public.clients add constraint clients_service_check check (service in ('website','strategy','digital'));
alter table public.clients add column if not exists summary text;                         -- the outcome the client wants, in their words
alter table public.clients add column if not exists plan jsonb not null default '[]'::jsonb;  -- milestones: [{t, due, done}], set by the team
alter table public.clients add column if not exists kpis jsonb not null default '[]'::jsonb;  -- results we measure: [{label, baseline, current, target}], set by the team

-- each service has its own stages
alter table public.clients drop constraint if exists clients_stage_check;
alter table public.clients add constraint clients_stage_check check (stage in
  ('onboarding','design','build','review','live','discovery','analysis','recommendations','complete'));

-- files the team delivers (reports, decks, models)
alter table public.files drop constraint if exists files_kind_check;
alter table public.files add constraint files_kind_check check (kind in ('brief','request','invoice','deliverable','other'));

-- clients still cannot move their own stage, plan, results, links, quote or notes
create or replace function public.protect_client_fields() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.stage := 'onboarding'; new.preview_url := null; new.live_url := null; new.clarity_url := null; new.admin_note := null;
      new.plan := '[]'::jsonb; new.kpis := '[]'::jsonb;
    else
      new.owner_id := old.owner_id; new.stage := old.stage; new.preview_url := old.preview_url; new.live_url := old.live_url;
      new.clarity_url := old.clarity_url; new.admin_note := old.admin_note; new.quote_total := old.quote_total;
      new.package := old.package; new.pages := old.pages; new.addons := old.addons;
      new.service := old.service; new.plan := old.plan; new.kpis := old.kpis;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

-- ---------- team members: admin as soon as they sign up ----------
-- The sign-up email is recorded by the server from Clerk (verified), so it can be trusted here.
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;
drop policy if exists "admin_emails: admin read" on public.admin_emails;
create policy "admin_emails: admin read" on public.admin_emails for select using (public.is_admin());
insert into public.admin_emails (email) values ('luke@minshallgroup.com'), ('catherine@minshallgroup.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = public.uid())
      or exists (select 1 from public.signups s join public.admin_emails e on lower(s.email) = lower(e.email) where s.user_id = public.uid())
$$;
