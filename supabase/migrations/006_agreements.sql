-- =====================================================================
-- Minshall Group client portal: agreements signed electronically.
-- Run after 005: Supabase → SQL Editor → New query → paste → Run.
--
--   agreements         a document (a PDF in the project's files, and/or a
--                      link to terms on the website) sent for signature.
--   agreement_signers  who must sign, and the record of each signature:
--                      the name typed, an optional drawn signature, when,
--                      from which IP address and browser, the consent
--                      wording shown, and the fingerprint (SHA-256) of the
--                      exact document signed.
--
-- Signatures are only ever written by our server, after it has checked the
-- signer's verified login email and re-checked that the document has not
-- changed since it was sent. Once an agreement is sent its document cannot
-- be changed, and once a person has signed, that record cannot be changed
-- or deleted by anyone using the portal.
-- =====================================================================

create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  summary text,
  file_id uuid references public.files(id) on delete restrict,
  terms_url text,
  doc_sha256 text,                       -- fingerprint of the PDF, taken when it is sent
  status text not null default 'draft' check (status in ('draft','out','signed','void')),
  signed_file_id uuid references public.files(id) on delete restrict,   -- the signed copy with its certificate page
  created_by text not null default public.uid(),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  completed_at timestamptz,
  check (file_id is not null or terms_url is not null)
);
create index if not exists agreements_client on public.agreements(client_id);
alter table public.agreements enable row level security;
drop policy if exists "agreements: read" on public.agreements;
drop policy if exists "agreements: add" on public.agreements;
drop policy if exists "agreements: change" on public.agreements;
drop policy if exists "agreements: remove" on public.agreements;
create policy "agreements: read" on public.agreements for select using (public.can_see(client_id));
create policy "agreements: add" on public.agreements for insert with check (public.is_admin());
create policy "agreements: change" on public.agreements for update using (public.is_admin());
create policy "agreements: remove" on public.agreements for delete using (public.is_admin() and status = 'draft');

create or replace function public.protect_agreement() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_service() then
      new.status := 'draft'; new.doc_sha256 := null; new.sent_at := null; new.completed_at := null; new.signed_file_id := null;
    end if;
    return new;
  end if;
  new.client_id := old.client_id; new.created_by := old.created_by; new.created_at := old.created_at;
  if not public.is_service() then
    -- sending, completing and fingerprinting happen on the server only; we may void an unsigned agreement
    new.doc_sha256 := old.doc_sha256; new.sent_at := old.sent_at; new.completed_at := old.completed_at; new.signed_file_id := old.signed_file_id;
    if new.status is distinct from old.status and not (new.status = 'void' and old.status in ('draft','out')) then new.status := old.status; end if;
  end if;
  if old.status = 'signed' and not public.is_service() then raise exception 'This agreement has been signed and can no longer be changed'; end if;
  if old.status <> 'draft' then
    -- what was sent is what is signed
    new.title := old.title; new.summary := old.summary; new.file_id := old.file_id; new.terms_url := old.terms_url;
  end if;
  return new;
end $$;
drop trigger if exists agreements_protect on public.agreements;
create trigger agreements_protect before insert or update on public.agreements for each row execute function public.protect_agreement();

create table if not exists public.agreement_signers (
  agreement_id uuid not null references public.agreements(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  email text not null,
  name text not null,
  signs_for text not null,               -- the organisation they sign on behalf of
  sort int not null default 0,
  signed_at timestamptz,
  signed_name text,
  signature_png text,                    -- optional drawn signature, as a PNG data URL
  ip text,
  user_agent text,
  doc_sha256 text,
  consent text,
  primary key (agreement_id, email)
);
alter table public.agreement_signers enable row level security;
drop policy if exists "signers: read" on public.agreement_signers;
drop policy if exists "signers: add" on public.agreement_signers;
drop policy if exists "signers: remove" on public.agreement_signers;
create policy "signers: read" on public.agreement_signers for select using (public.can_see(client_id));
create policy "signers: add" on public.agreement_signers for insert with check (public.is_admin());
create policy "signers: remove" on public.agreement_signers for delete using (public.is_admin());
-- no update policy: signatures are recorded by the server only

create or replace function public.protect_signer() returns trigger language plpgsql security definer set search_path = public as $$
declare st text;
begin
  if tg_op = 'DELETE' then
    if old.signed_at is not null and not public.is_service() then raise exception 'A signature cannot be removed'; end if;
    select status into st from public.agreements where id = old.agreement_id;
    if st is not null and st <> 'draft' and not public.is_service() then raise exception 'Signers can only be changed before the agreement is sent'; end if;
    return old;
  end if;
  select status, client_id into st, new.client_id from public.agreements where id = new.agreement_id;
  new.email := lower(btrim(new.email));
  if tg_op = 'INSERT' and not public.is_service() then
    if st <> 'draft' then raise exception 'Signers can only be changed before the agreement is sent'; end if;
    new.signed_at := null; new.signed_name := null; new.signature_png := null; new.ip := null; new.user_agent := null; new.doc_sha256 := null; new.consent := null;
  end if;
  if tg_op = 'UPDATE' and old.signed_at is not null then raise exception 'A signature cannot be changed'; end if;
  return new;
end $$;
drop trigger if exists signers_protect on public.agreement_signers;
create trigger signers_protect before insert or update or delete on public.agreement_signers for each row execute function public.protect_signer();

-- ---------- a private project page (for example a proposal) ----------
-- Markdown written by our team, shown as the Proposal tab to people on the
-- project only (the same rules as the project itself: never public).
alter table public.clients add column if not exists page_md text;
create or replace function public.protect_client_fields() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or public.is_service()) then
    if tg_op = 'INSERT' then
      new.stage := 'onboarding'; new.preview_url := null; new.live_url := null; new.clarity_url := null; new.admin_note := null;
      new.plan := '[]'::jsonb; new.kpis := '[]'::jsonb; new.xero_contact_id := null; new.page_md := null;
    else
      new.owner_id := old.owner_id; new.stage := old.stage; new.preview_url := old.preview_url; new.live_url := old.live_url;
      new.clarity_url := old.clarity_url; new.admin_note := old.admin_note; new.quote_total := old.quote_total;
      new.package := old.package; new.pages := old.pages; new.addons := old.addons;
      new.service := old.service; new.plan := old.plan; new.kpis := old.kpis; new.xero_contact_id := old.xero_contact_id; new.page_md := old.page_md;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
