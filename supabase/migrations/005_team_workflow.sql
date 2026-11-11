-- =====================================================================
-- Minshall Group client portal: client teams, project phases, tasks and
-- multi-person sign-off, with an invoice raised when a sign-off is approved.
-- Run after 001 to 004: Supabase → SQL Editor → New query → paste → Run.
--
--   project_members  the client's team on a project, by email. Roles:
--                    approver (one per project: the final sign-off),
--                    reviewer (views, comments, approves or asks for changes),
--                    contributor (is given tasks), viewer (read only).
--                    People see the project once they sign up with that email.
--   phases           the stages of the build, in order.
--   tasks            work in a phase, allocated to a team member.
--   signoffs         a sign-off point: documents to review, reviewers, one
--                    final approver, and optionally an invoice to raise.
--   signoff_reviews  each reviewer's decision.
--   comments         discussion on a sign-off or a task.
--
-- Decisions are only ever made through public.decide_signoff(), which checks
-- the caller's verified sign-up email against the reviewer list, so nobody
-- can approve on someone else's behalf. Invoice settings and invoice state
-- can only be set by the Minshall Group team or the server.
-- =====================================================================

-- ---------- who is calling ----------
-- the caller's verified email, recorded by the server from Clerk at sign-up
create or replace function public.my_email() returns text language sql stable security definer set search_path = public as $$
  select lower(email) from public.signups where user_id = public.uid() limit 1
$$;
-- requests made by our own server functions with the service-role key
create or replace function public.is_service() returns boolean language sql stable as $$
  select coalesce(auth.jwt()->>'role', '') = 'service_role'
$$;

-- ---------- the client's team ----------
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  email text not null,
  name text,
  job_title text,
  role text not null default 'reviewer' check (role in ('approver','reviewer','contributor','viewer')),
  added_by text not null default public.uid(),
  created_at timestamptz not null default now(),
  unique (client_id, email)
);
create unique index if not exists project_members_one_approver on public.project_members(client_id) where role = 'approver';
alter table public.project_members enable row level security;

create or replace function public.tidy_member() returns trigger language plpgsql as $$
begin new.email := lower(btrim(new.email)); new.name := nullif(btrim(coalesce(new.name,'')),''); return new; end $$;
drop trigger if exists members_tidy on public.project_members;
create trigger members_tidy before insert or update on public.project_members for each row execute function public.tidy_member();

create or replace function public.is_member(cid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.project_members m where m.client_id = cid and m.email = public.my_email())
$$;
-- may see the project: the team, the owner, or anyone on the client's team
create or replace function public.can_see(cid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.is_member(cid) or exists (select 1 from public.clients c where c.id = cid and c.owner_id = public.uid())
$$;
-- may run the project's team, phases, tasks and sign-offs: our team, or the client who owns the project
create or replace function public.can_manage(cid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (select 1 from public.clients c where c.id = cid and c.owner_id = public.uid())
$$;

drop policy if exists "clients: read own" on public.clients;
create policy "clients: read own" on public.clients for select using (owner_id = public.uid() or public.is_admin() or public.is_member(id));

drop policy if exists "members: read" on public.project_members;
drop policy if exists "members: add" on public.project_members;
drop policy if exists "members: change" on public.project_members;
drop policy if exists "members: remove" on public.project_members;
create policy "members: read" on public.project_members for select using (public.can_see(client_id));
create policy "members: add" on public.project_members for insert with check (public.can_manage(client_id));
create policy "members: change" on public.project_members for update using (public.can_manage(client_id)) with check (public.can_manage(client_id));
create policy "members: remove" on public.project_members for delete using (public.can_manage(client_id));

-- ---------- who receives invoices ----------
alter table public.clients add column if not exists billing_name text;
alter table public.clients add column if not exists billing_email text;
alter table public.clients add column if not exists xero_contact_id text;
alter table public.invoices add column if not exists xero_invoice_id text;

-- replaces the 004 version: the same protections, plus the Xero contact link,
-- and our own server functions may write the protected fields
create or replace function public.protect_client_fields() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or public.is_service()) then
    if tg_op = 'INSERT' then
      new.stage := 'onboarding'; new.preview_url := null; new.live_url := null; new.clarity_url := null; new.admin_note := null;
      new.plan := '[]'::jsonb; new.kpis := '[]'::jsonb; new.xero_contact_id := null;
    else
      new.owner_id := old.owner_id; new.stage := old.stage; new.preview_url := old.preview_url; new.live_url := old.live_url;
      new.clarity_url := old.clarity_url; new.admin_note := old.admin_note; new.quote_total := old.quote_total;
      new.package := old.package; new.pages := old.pages; new.addons := old.addons;
      new.service := old.service; new.plan := old.plan; new.kpis := old.kpis; new.xero_contact_id := old.xero_contact_id;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

-- ---------- phases: the stages of the build ----------
create table if not exists public.phases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  sort int not null default 0,
  title text not null,
  detail text,
  due_on date,
  status text not null default 'upcoming' check (status in ('upcoming','active','done')),
  created_at timestamptz not null default now()
);
create index if not exists phases_client on public.phases(client_id, sort);
alter table public.phases enable row level security;
drop policy if exists "phases: read" on public.phases;
drop policy if exists "phases: write" on public.phases;
create policy "phases: read" on public.phases for select using (public.can_see(client_id));
create policy "phases: write" on public.phases for all using (public.can_manage(client_id)) with check (public.can_manage(client_id));

-- ---------- tasks ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  phase_id uuid references public.phases(id) on delete set null,
  title text not null,
  detail text,
  assignee_email text,
  due_on date,
  status text not null default 'todo' check (status in ('todo','doing','review','done')),
  sort int not null default 0,
  created_by text not null default public.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_client on public.tasks(client_id);
alter table public.tasks enable row level security;
drop policy if exists "tasks: read" on public.tasks;
drop policy if exists "tasks: add" on public.tasks;
drop policy if exists "tasks: update" on public.tasks;
drop policy if exists "tasks: remove" on public.tasks;
create policy "tasks: read" on public.tasks for select using (public.can_see(client_id));
create policy "tasks: add" on public.tasks for insert with check (public.can_manage(client_id));
create policy "tasks: update" on public.tasks for update using (public.can_see(client_id));
create policy "tasks: remove" on public.tasks for delete using (public.can_manage(client_id));
-- the person a task is allocated to may move its status; only managers change anything else
create or replace function public.protect_task() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.assignee_email := nullif(lower(btrim(coalesce(new.assignee_email,''))),'');
  if tg_op = 'UPDATE' and not (public.can_manage(old.client_id) or public.is_service()) then
    if coalesce(old.assignee_email,'') <> coalesce(public.my_email(),'-') then
      raise exception 'Only the person this task is allocated to can update it';
    end if;
    new.client_id := old.client_id; new.phase_id := old.phase_id; new.title := old.title; new.detail := old.detail;
    new.assignee_email := old.assignee_email; new.due_on := old.due_on; new.sort := old.sort; new.created_by := old.created_by;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists tasks_protect on public.tasks;
create trigger tasks_protect before insert or update on public.tasks for each row execute function public.protect_task();

-- ---------- sign-offs ----------
create table if not exists public.signoffs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  phase_id uuid references public.phases(id) on delete set null,
  title text not null,
  detail text,
  due_on date,
  file_ids uuid[] not null default '{}',
  approver_email text,
  status text not null default 'open' check (status in ('open','changes','ready','approved')),
  version int not null default 1,
  final_note text,
  decided_at timestamptz,
  decided_by text,
  -- an invoice to raise when this is approved (set by our team only)
  invoice_label text,
  invoice_amount numeric(10,2),
  invoice_auto_send boolean not null default true,
  invoice_state text check (invoice_state in ('raising','raised','manual','failed')),
  invoice_ref uuid references public.invoices(id) on delete set null,
  invoice_error text,
  created_by text not null default public.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists signoffs_client on public.signoffs(client_id);
alter table public.signoffs enable row level security;
drop policy if exists "signoffs: read" on public.signoffs;
drop policy if exists "signoffs: add" on public.signoffs;
drop policy if exists "signoffs: change" on public.signoffs;
drop policy if exists "signoffs: remove" on public.signoffs;
create policy "signoffs: read" on public.signoffs for select using (public.can_see(client_id));
create policy "signoffs: add" on public.signoffs for insert with check (public.can_manage(client_id));
create policy "signoffs: change" on public.signoffs for update using (public.can_manage(client_id));
create policy "signoffs: remove" on public.signoffs for delete using (public.is_admin() or (public.can_manage(client_id) and status <> 'approved'));

-- status and decisions only move through decide_signoff()/reopen_signoff(); invoice fields are ours
create or replace function public.protect_signoff() returns trigger language plpgsql security definer set search_path = public as $$
declare deciding boolean := coalesce(current_setting('mg.decide', true), '') = '1';
begin
  new.approver_email := nullif(lower(btrim(coalesce(new.approver_email,''))),'');
  if tg_op = 'INSERT' then
    new.status := 'open'; new.version := 1; new.decided_at := null; new.decided_by := null; new.final_note := null;
    new.invoice_state := null; new.invoice_ref := null; new.invoice_error := null;
    if not public.is_admin() then new.invoice_label := null; new.invoice_amount := null; new.invoice_auto_send := true; end if;
  else
    new.client_id := old.client_id; new.created_by := old.created_by;
    if not (deciding or public.is_service()) then
      new.status := old.status; new.version := old.version; new.decided_at := old.decided_at; new.decided_by := old.decided_by; new.final_note := old.final_note;
    end if;
    if not public.is_service() then
      new.invoice_state := old.invoice_state; new.invoice_ref := old.invoice_ref; new.invoice_error := old.invoice_error;
    end if;
    if not (public.is_admin() or public.is_service()) then
      new.invoice_label := old.invoice_label; new.invoice_amount := old.invoice_amount; new.invoice_auto_send := old.invoice_auto_send;
    end if;
    -- once signed off, the record is fixed: only our team and the server may touch it
    if old.status = 'approved' and not (public.is_admin() or public.is_service()) then
      raise exception 'This has been signed off and can no longer be changed';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists signoffs_protect on public.signoffs;
create trigger signoffs_protect before insert or update on public.signoffs for each row execute function public.protect_signoff();

create table if not exists public.signoff_reviews (
  signoff_id uuid not null references public.signoffs(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  email text not null,
  name text,
  decision text check (decision in ('approved','changes')),
  note text,
  decided_at timestamptz,
  primary key (signoff_id, email)
);
alter table public.signoff_reviews enable row level security;
drop policy if exists "reviews: read" on public.signoff_reviews;
drop policy if exists "reviews: add" on public.signoff_reviews;
drop policy if exists "reviews: remove" on public.signoff_reviews;
create policy "reviews: read" on public.signoff_reviews for select using (public.can_see(client_id));
create policy "reviews: add" on public.signoff_reviews for insert with check (public.can_manage(client_id));
create policy "reviews: remove" on public.signoff_reviews for delete using (public.can_manage(client_id));
-- no update policy: decisions are recorded by decide_signoff() only
create or replace function public.tidy_review() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.email := lower(btrim(new.email));
  select s.client_id into new.client_id from public.signoffs s where s.id = new.signoff_id;
  if coalesce(current_setting('mg.decide', true), '') <> '1' then new.decision := null; new.note := null; new.decided_at := null; end if;
  return new;
end $$;
drop trigger if exists reviews_tidy on public.signoff_reviews;
create trigger reviews_tidy before insert on public.signoff_reviews for each row execute function public.tidy_review();

-- work out a sign-off's status from its reviews
create or replace function public.recalc_signoff(sid uuid) returns text language plpgsql security definer set search_path = public as $$
declare st text; n_changes int; n_waiting int;
begin
  select status into st from public.signoffs where id = sid;
  if st is null or st = 'approved' then return st; end if;
  select count(*) filter (where decision = 'changes'), count(*) filter (where coalesce(decision,'') <> 'approved')
    into n_changes, n_waiting from public.signoff_reviews where signoff_id = sid;
  st := case when n_changes > 0 then 'changes' when n_waiting = 0 then 'ready' else 'open' end;
  perform set_config('mg.decide', '1', true);
  update public.signoffs set status = st where id = sid;
  perform set_config('mg.decide', '', true);
  return st;
end $$;
revoke execute on function public.recalc_signoff(uuid) from public;
create or replace function public.reviews_changed() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.recalc_signoff(coalesce(new.signoff_id, old.signoff_id)); return null; end $$;
drop trigger if exists reviews_changed on public.signoff_reviews;
create trigger reviews_changed after insert or delete on public.signoff_reviews for each row execute function public.reviews_changed();

-- ---------- comments on a sign-off or a task ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  signoff_id uuid references public.signoffs(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  author_id text not null default public.uid(),
  author_name text,
  from_admin boolean not null default false,
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  check (signoff_id is not null or task_id is not null)
);
create index if not exists comments_signoff on public.comments(signoff_id);
create index if not exists comments_task on public.comments(task_id);
alter table public.comments enable row level security;
drop policy if exists "comments: read" on public.comments;
drop policy if exists "comments: add" on public.comments;
create policy "comments: read" on public.comments for select using (public.can_see(client_id));
create policy "comments: add" on public.comments for insert with check (author_id = public.uid() and public.can_see(client_id));
-- the project, author and side are set here, never by the browser
create or replace function public.stamp_comment() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.signoff_id is not null then select client_id into new.client_id from public.signoffs where id = new.signoff_id;
  else select client_id into new.client_id from public.tasks where id = new.task_id; end if;
  new.author_id := public.uid();
  new.from_admin := public.is_admin();
  new.author_name := coalesce((select coalesce(nullif(m.name,''), s.name) from public.signups s left join public.project_members m on m.client_id = new.client_id and m.email = lower(s.email) where s.user_id = public.uid()), new.author_name);
  new.body := btrim(new.body);
  return new;
end $$;
drop trigger if exists comments_stamp on public.comments;
create trigger comments_stamp before insert on public.comments for each row execute function public.stamp_comment();

-- ---------- making a decision ----------
-- A reviewer approves or asks for changes. The final approver can sign off
-- once every reviewer has approved, or send it back for changes.
create or replace function public.decide_signoff(p_signoff uuid, p_decision text, p_note text default null) returns text
language plpgsql security definer set search_path = public as $$
declare s public.signoffs; me text := public.my_email(); waiting int; st text;
begin
  select * into s from public.signoffs where id = p_signoff for update;
  if not found or not public.can_see(s.client_id) then raise exception 'Sign-off not found'; end if;
  if p_decision not in ('approved','changes') then raise exception 'Choose approve or request changes'; end if;
  if s.status = 'approved' then raise exception 'This has already been signed off'; end if;
  if me is null then raise exception 'We could not confirm your email address yet. Please refresh the page and try again.'; end if;
  if p_decision = 'changes' and btrim(coalesce(p_note,'')) = '' then raise exception 'Please say what needs to change'; end if;
  if btrim(coalesce(p_note,'')) <> '' then
    insert into public.comments (client_id, signoff_id, body) values (s.client_id, s.id, (case when p_decision = 'approved' then 'Approved: ' else 'Changes requested: ' end) || btrim(p_note));
  end if;
  perform set_config('mg.decide', '1', true);
  if coalesce(s.approver_email, '') = me then
    if p_decision = 'approved' then
      select count(*) into waiting from public.signoff_reviews where signoff_id = s.id and coalesce(decision,'') <> 'approved';
      if waiting > 0 then perform set_config('mg.decide', '', true); raise exception 'Waiting for % reviewer% before the final sign-off', waiting, case when waiting = 1 then '' else 's' end; end if;
      update public.signoffs set status = 'approved', decided_at = now(), decided_by = me, final_note = nullif(btrim(coalesce(p_note,'')),'') where id = s.id;
      st := 'approved';
    else
      update public.signoffs set status = 'changes', final_note = btrim(p_note) where id = s.id;
      st := 'changes';
    end if;
    perform set_config('mg.decide', '', true);
    return st;
  end if;
  update public.signoff_reviews set decision = p_decision, note = nullif(btrim(coalesce(p_note,'')),''), decided_at = now() where signoff_id = s.id and email = me;
  if not found then perform set_config('mg.decide', '', true); raise exception 'You are not a reviewer on this sign-off'; end if;
  perform set_config('mg.decide', '', true);
  return public.recalc_signoff(s.id);
end $$;

-- a new version goes back out for review: every decision is cleared
create or replace function public.reopen_signoff(p_signoff uuid) returns text language plpgsql security definer set search_path = public as $$
declare s public.signoffs;
begin
  select * into s from public.signoffs where id = p_signoff for update;
  if not found or not public.can_manage(s.client_id) then raise exception 'Sign-off not found'; end if;
  if s.status = 'approved' and not public.is_admin() then raise exception 'This has been signed off; ask Minshall Group to reopen it'; end if;
  perform set_config('mg.decide', '1', true);
  update public.signoff_reviews set decision = null, note = null, decided_at = null where signoff_id = s.id;
  update public.signoffs set status = 'open', version = version + 1, decided_at = null, decided_by = null, final_note = null where id = s.id;
  perform set_config('mg.decide', '', true);
  return public.recalc_signoff(s.id);
end $$;
