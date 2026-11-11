/* Tests for agreements and electronic signatures (migration 006), in PGlite.
   Run: npm run test:db   Every line should start with PASS. */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const db = new PGlite();
const q = (s, p) => db.query(s, p);
await db.exec(`
create role authenticated nologin; create role anon nologin;
create schema auth; create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner_id text default (auth.jwt()->>'sub'));
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;`);
for (const f of ['001_client_portal', '002_notifications', '003_site_checks', '004_services_and_team', '005_team_workflow', '006_agreements'])
  await db.exec(readFileSync(new URL(`../migrations/${f}.sql`, import.meta.url), 'utf8'));
await db.exec(`grant usage on schema public, storage, auth to authenticated; grant all on all tables in schema public, storage to authenticated; grant execute on all functions in schema public, auth, storage to authenticated;`);
const as = async (sub, fn) => { await db.exec(`reset role`); await db.exec(`set request.jwt.claims = '${JSON.stringify({ sub })}'`); await db.exec(`set role authenticated`); try { return await fn(); } finally { await db.exec(`reset role`); } };
const server = async fn => { await db.exec(`reset role`); await db.exec(`set request.jwt.claims = '${JSON.stringify({ role: 'service_role' })}'`); try { return await fn(); } finally { await db.exec(`set request.jwt.claims = ''`); } };
const fails_ = async fn => { try { await fn(); return false; } catch (e) { return e.message || true; } };
let fails = 0; const ok = (n, c) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + n); };

await db.exec(`insert into public.admins values ('user_admin','Luke')`);
await db.exec(`insert into public.signups (user_id,email,name) values ('user_admin','luke@minshallgroup.com','Luke'),('user_l','leigh@client.test','Leigh'),('user_x','x@else.com','X')`);
const P = (await as('user_admin', () => q(`insert into public.clients (business_name, service) values ('IML test','digital') returning *`))).rows[0];
await as('user_admin', () => q(`insert into public.project_members (client_id,email,name,role) values ($1,'leigh@client.test','Leigh','approver')`, [P.id]));
const F = (await as('user_admin', () => q(`insert into public.files (client_id,path,name,kind) values ($1,'p/a.pdf','Agreement','deliverable') returning *`, [P.id]))).rows[0];

ok('client team member cannot create an agreement', !!(await fails_(() => as('user_l', () => q(`insert into public.agreements (client_id,title,file_id) values ($1,'Fake',$2)`, [P.id, F.id])))));
ok('an agreement needs a document or terms', !!(await fails_(() => as('user_admin', () => q(`insert into public.agreements (client_id,title) values ($1,'Nothing')`, [P.id])))));
const A = (await as('user_admin', () => q(`insert into public.agreements (client_id,title,file_id,status,doc_sha256) values ($1,'Agreement',$2,'signed','fake') returning *`, [P.id, F.id]))).rows[0];
ok('a new agreement starts as a draft, with no fingerprint', A.status === 'draft' && A.doc_sha256 === null);
await as('user_admin', () => q(`insert into public.agreement_signers (agreement_id,client_id,email,name,signs_for,signed_at,signed_name) values ($1,$2,' Leigh@Client.test ','Leigh','IML test',now(),'Forged')`, [A.id, P.id]));
const s0 = (await q(`select * from public.agreement_signers`)).rows[0];
ok('a signer cannot be added already signed', s0.signed_at === null && s0.signed_name === null && s0.email === 'leigh@client.test');
ok('team member can read the agreement', (await as('user_l', () => q(`select id from public.agreements`))).rows.length === 1);
ok('outsider cannot read it', (await as('user_x', () => q(`select id from public.agreements`))).rows.length === 0);
ok('nobody can sign through the portal directly', (await as('user_l', () => q(`update public.agreement_signers set signed_at=now() where agreement_id=$1 returning *`, [A.id]))).rows.length === 0);
await as('user_admin', () => q(`update public.agreements set status='out', doc_sha256='abc' where id=$1`, [A.id]));
ok('only the server sends an agreement', (await q(`select status from public.agreements where id=$1`, [A.id])).rows[0].status === 'draft');
await server(() => q(`update public.agreements set status='out', doc_sha256='abc', sent_at=now() where id=$1`, [A.id]));
ok('the server sends it', (await q(`select status from public.agreements where id=$1`, [A.id])).rows[0].status === 'out');
await as('user_admin', () => q(`update public.agreements set title='Changed', file_id=null, terms_url='x' where id=$1`, [A.id]));
ok('once sent, the document cannot be changed', (await q(`select title,file_id from public.agreements where id=$1`, [A.id])).rows[0].title === 'Agreement');
ok('signers cannot be added after sending', !!(await fails_(() => as('user_admin', () => q(`insert into public.agreement_signers (agreement_id,client_id,email,name,signs_for) values ($1,$2,'late@x.com','Late','X')`, [A.id, P.id])))));
await server(() => q(`update public.agreement_signers set signed_at=now(), signed_name='Leigh Melville', ip='1.2.3.4', doc_sha256='abc' where agreement_id=$1`, [A.id]));
ok('the server records a signature', (await q(`select signed_name from public.agreement_signers`)).rows[0].signed_name === 'Leigh Melville');
ok('a signature cannot be changed', !!(await fails_(() => server(() => q(`update public.agreement_signers set signed_name='Someone else' where agreement_id=$1`, [A.id])))));
ok('a signature cannot be deleted from the portal', !!(await fails_(() => as('user_admin', () => q(`delete from public.agreement_signers where agreement_id=$1`, [A.id])))));
await server(() => q(`update public.agreements set status='signed', completed_at=now() where id=$1`, [A.id]));
ok('a signed agreement cannot be voided or edited', !!(await fails_(() => as('user_admin', () => q(`update public.agreements set status='void' where id=$1`, [A.id])))));
ok('a signed agreement cannot be deleted', (await as('user_admin', () => q(`delete from public.agreements where id=$1 returning id`, [A.id]))).rows.length === 0);
ok('the signed document file cannot be deleted while referenced', !!(await fails_(() => q(`delete from public.files where id=$1`, [F.id]))));
const B = (await as('user_admin', () => q(`insert into public.agreements (client_id,title,terms_url) values ($1,'Terms','https://minshallgroup.com/digitalsme/terms') returning *`, [P.id]))).rows[0];
await server(() => q(`update public.agreements set status='out' where id=$1`, [B.id]));
await as('user_admin', () => q(`update public.agreements set status='void' where id=$1`, [B.id]));
ok('an unsigned agreement can be voided', (await q(`select status from public.agreements where id=$1`, [B.id])).rows[0].status === 'void');
await as('user_admin', () => q(`update public.clients set page_md='# Private proposal' where id=$1`, [P.id]));
ok('our team can set the project page', (await q(`select page_md from public.clients where id=$1`, [P.id])).rows[0].page_md === '# Private proposal');
ok('the project team can read it', (await as('user_l', () => q(`select page_md from public.clients where id=$1`, [P.id]))).rows[0]?.page_md === '# Private proposal');
ok('nobody else can read it', (await as('user_x', () => q(`select page_md from public.clients where id=$1`, [P.id]))).rows.length === 0);
await q(`insert into public.signups (user_id,email,name) values ('user_o','own@client.test','Owner')`);
const own = (await as('user_o', () => q(`insert into public.clients (business_name, page_md) values ('Own','# Mine') returning *`))).rows[0];
ok('a client cannot write their own project page', own.page_md === null);
console.log(fails ? `\n${fails} FAILED` : '\nAll agreement tests passed');
process.exit(fails ? 1 : 0);
