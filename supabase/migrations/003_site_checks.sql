-- Minshall Group: record which websites are run through the free check.
-- Stores only the website address, whether it came from an email link, and the time.
-- Used to see which businesses we emailed went on to check their site.
-- Run once: Supabase → SQL Editor → paste → Run.
create table if not exists public.site_checks (
  id bigserial primary key,
  site text not null,
  from_link boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists site_checks_site_idx on public.site_checks (site);
create index if not exists site_checks_created_idx on public.site_checks (created_at desc);
alter table public.site_checks enable row level security;
-- written only by the server (service role); the team can read
drop policy if exists "site_checks: admin read" on public.site_checks;
create policy "site_checks: admin read" on public.site_checks for select using (public.is_admin());
