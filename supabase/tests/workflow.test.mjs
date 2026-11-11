/* Tests for client teams, tasks and multi-person sign-off (migration 005),
   run in in-memory Postgres (PGlite) with stand-ins for Supabase.
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
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
`);
for (const f of ['001_client_portal', '002_notifications', '003_site_checks', '004_services_and_team', '005_team_workflow'])
  await db.exec(readFileSync(new URL(`../migrations/${f}.sql`, import.meta.url), 'utf8'));
await db.exec(`grant usage on schema public, storage, auth to authenticated; grant all on all tables in schema public, storage to authenticated; grant execute on all functions in schema public, auth, storage to authenticated;`);
const as = async (sub, fn) => { await db.exec(`reset role`); await db.exec(`set request.jwt.claims = '${JSON.stringify({ sub })}'`); await db.exec(`set role authenticated`); try { return await fn(); } finally { await db.exec(`reset role`); } };
const asServer = async fn => { await db.exec(`reset role`); await db.exec(`set request.jwt.claims = '${JSON.stringify({ role: 'service_role' })}'`); try { return await fn(); } finally { await db.exec(`set request.jwt.claims = ''`); } };
const fails_ = async fn => { try { await fn(); return false; } catch (e) { return e.message || true; } };
let fails = 0;
const ok = (name, cond) => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + name); };

// people: our admin, the client who owns the project, their team a,b,c,e and an outsider x
await db.exec(`insert into public.admins values ('user_admin','Luke')`);
await db.exec(`insert into public.signups (user_id,email,name) values
  ('user_o','owner@client.co','Olive Owner'),('user_a','Alex@Client.co','Alex A'),('user_b','bea@client.co','Bea B'),
  ('user_c','cal@client.co','Cal C'),('user_e','eve@client.co','Eve E'),('user_x','x@elsewhere.com','Xavier')`);
const P = (await as('user_o', () => q(`insert into public.clients (business_name, service) values ('IML test','digital') returning *`))).rows[0];

// ---------- team ----------
await as('user_admin', () => q(`insert into public.project_members (client_id,email,name,role) values
  ($1,' EVE@client.co ','Eve E','approver'),($1,'alex@client.co','Alex A','reviewer'),($1,'bea@client.co','Bea B','reviewer'),($1,'cal@client.co','Cal C','contributor')`, [P.id]));
ok('team member sees the project once signed up', (await as('user_a', () => q(`select id from public.clients`))).rows.length === 1);
ok('emails are stored in lower case, trimmed', (await q(`select 1 from public.project_members where email='eve@client.co'`)).rows.length === 1);
ok('outsider cannot see the project', (await as('user_x', () => q(`select id from public.clients`))).rows.length === 0);
ok('outsider cannot see the team', (await as('user_x', () => q(`select * from public.project_members`))).rows.length === 0);
ok('reviewer cannot add people to the team', !!(await fails_(() => as('user_a', () => q(`insert into public.project_members (client_id,email,role) values ($1,'friend@x.com','viewer')`, [P.id])))));
ok('client owner can add people to the team', !(await fails_(() => as('user_o', () => q(`insert into public.project_members (client_id,email,role) values ($1,'dan@client.co','viewer')`, [P.id])))));
ok('only one final approver per project', !!(await fails_(() => as('user_admin', () => q(`update public.project_members set role='approver' where client_id=$1 and email='bea@client.co'`, [P.id])))));
ok('team member cannot change the project stage', await as('user_a', async () => (await q(`update public.clients set stage='complete' where id=$1 returning id`, [P.id])).rows.length === 0));

// ---------- phases and tasks ----------
const ph = (await as('user_admin', () => q(`insert into public.phases (client_id,sort,title) values ($1,1,'Specification') returning *`, [P.id]))).rows[0];
ok('reviewer cannot add a phase', !!(await fails_(() => as('user_a', () => q(`insert into public.phases (client_id,title) values ($1,'Sneaky')`, [P.id])))));
const t = (await as('user_admin', () => q(`insert into public.tasks (client_id,phase_id,title,assignee_email) values ($1,$2,'Write user stories','Cal@Client.co') returning *`, [P.id, ph.id]))).rows[0];
await as('user_c', () => q(`update public.tasks set status='doing', title='renamed' where id=$1`, [t.id]));
const t2 = (await q(`select * from public.tasks where id=$1`, [t.id])).rows[0];
ok('assignee can move their task, but not rename it', t2.status === 'doing' && t2.title === 'Write user stories');
ok('someone else cannot move another person’s task', !!(await fails_(() => as('user_b', () => q(`update public.tasks set status='done' where id=$1`, [t.id])))));
ok('client owner can reallocate a task', await as('user_o', async () => (await q(`update public.tasks set assignee_email='bea@client.co' where id=$1 returning assignee_email`, [t.id])).rows[0]?.assignee_email === 'bea@client.co'));

// ---------- sign-off ----------
const so = (await as('user_admin', () => q(`insert into public.signoffs (client_id,phase_id,title,approver_email,invoice_label,invoice_amount,status) values ($1,$2,'Specification v1','eve@client.co','Project costs',5000,'approved') returning *`, [P.id, ph.id]))).rows[0];
ok('a new sign-off always starts open', so.status === 'open');
await as('user_admin', () => q(`insert into public.signoff_reviews (signoff_id,client_id,email,name,decision) values ($1,$2,'alex@client.co','Alex A','approved'),($1,$2,'bea@client.co','Bea B',null)`, [so.id, P.id]));
ok('reviewers cannot be added pre-approved', (await q(`select count(*)::int n from public.signoff_reviews where signoff_id=$1 and decision is not null`, [so.id])).rows[0].n === 0);
const ownSo = (await as('user_o', () => q(`insert into public.signoffs (client_id,title,invoice_amount,invoice_label) values ($1,'Owner one',99999,'x') returning *`, [P.id]))).rows[0];
ok('client owner cannot attach an invoice to a sign-off', ownSo.invoice_amount === null && ownSo.invoice_label === null);
await as('user_o', () => q(`update public.signoffs set status='approved', invoice_amount=1 where id=$1`, [so.id]));
const so1 = (await q(`select * from public.signoffs where id=$1`, [so.id])).rows[0];
ok('nobody can mark a sign-off approved directly', so1.status === 'open' && Number(so1.invoice_amount) === 5000);
ok('reviewer cannot edit the sign-off', await as('user_a', async () => (await q(`update public.signoffs set title='x' where id=$1 returning id`, [so.id])).rows.length === 0));
const early = await fails_(() => as('user_e', () => q(`select public.decide_signoff($1,'approved','Looks fine')`, [so.id])));
ok('final approver must wait for the reviewers', String(early).includes('Waiting for 2 reviewers'));
ok('outsider cannot decide', !!(await fails_(() => as('user_x', () => q(`select public.decide_signoff($1,'approved')`, [so.id])))));
ok('contributor who is not a reviewer cannot decide', String(await fails_(() => as('user_c', () => q(`select public.decide_signoff($1,'approved')`, [so.id])))).includes('not a reviewer'));
const r1 = (await as('user_a', () => q(`select public.decide_signoff($1,'approved','Happy with scope') s`, [so.id]))).rows[0].s;
ok('one of two reviewers approves: still open', r1 === 'open');
ok('asking for changes needs a reason', String(await fails_(() => as('user_b', () => q(`select public.decide_signoff($1,'changes','')`, [so.id])))).includes('say what needs to change'));
const r2 = (await as('user_b', () => q(`select public.decide_signoff($1,'changes','Section 4 misses the referral flow') s`, [so.id]))).rows[0].s;
ok('a reviewer asking for changes sends it back', r2 === 'changes');
const cm = (await as('user_b', () => q(`select * from public.comments where signoff_id=$1 order by created_at`, [so.id]))).rows;
ok('decisions with a note are logged as comments, by name', cm.length === 2 && cm[1].author_name === 'Bea B' && cm[1].body.startsWith('Changes requested:'));
await as('user_admin', () => q(`select public.reopen_signoff($1)`, [so.id]));
const so2 = (await q(`select * from public.signoffs where id=$1`, [so.id])).rows[0];
ok('a new version clears every decision', so2.status === 'open' && so2.version === 2 && (await q(`select count(*)::int n from public.signoff_reviews where signoff_id=$1 and decision is not null`, [so.id])).rows[0].n === 0);
await as('user_a', () => q(`select public.decide_signoff($1,'approved')`, [so.id]));
const r3 = (await as('user_b', () => q(`select public.decide_signoff($1,'approved','Fixed, thanks') s`, [so.id]))).rows[0].s;
ok('all reviewers approved: ready for the final approver', r3 === 'ready');
const r4 = (await as('user_e', () => q(`select public.decide_signoff($1,'approved','Signed off') s`, [so.id]))).rows[0].s;
const so3 = (await q(`select * from public.signoffs where id=$1`, [so.id])).rows[0];
ok('final approver signs off', r4 === 'approved' && so3.decided_by === 'eve@client.co' && so3.decided_at);
ok('a signed-off record cannot be changed by the client', !!(await fails_(() => as('user_o', () => q(`update public.signoffs set title='changed' where id=$1`, [so.id])))));
ok('a second decision is refused', String(await fails_(() => as('user_a', () => q(`select public.decide_signoff($1,'changes','late')`, [so.id])))).includes('already been signed off'));
ok('client owner cannot reopen a signed-off record', !!(await fails_(() => as('user_o', () => q(`select public.reopen_signoff($1)`, [so.id])))));
await as('user_admin', () => q(`update public.signoffs set invoice_state='raised' where id=$1`, [so.id]));
ok('only the server records the invoice state', (await q(`select invoice_state from public.signoffs where id=$1`, [so.id])).rows[0].invoice_state === null);
await asServer(() => q(`update public.signoffs set invoice_state='raised' where id=$1`, [so.id]));
ok('the server can record the invoice state', (await q(`select invoice_state from public.signoffs where id=$1`, [so.id])).rows[0].invoice_state === 'raised');

// ---------- comments ----------
const fake = (await as('user_c', () => q(`insert into public.comments (client_id,task_id,body,author_name,from_admin) values ($1,$2,' On it ','Luke (Minshall)',true) returning *`, [P.id, t.id]))).rows[0];
ok('comment author and side are stamped by the database', fake.author_name === 'Cal C' && fake.from_admin === false && fake.body === 'On it');
ok('outsider cannot comment', !!(await fails_(() => as('user_x', () => q(`insert into public.comments (client_id,task_id,body) values ($1,$2,'hi')`, [P.id, t.id])))));
ok('reviewer sees documents in the project folder', await as('user_a', async () => (await q(`select public.can_see($1) v`, [P.id])).rows[0].v === true));
ok('removed member loses access', await (async () => { await as('user_o', () => q(`delete from public.project_members where client_id=$1 and email='alex@client.co'`, [P.id])); return (await as('user_a', () => q(`select id from public.clients`))).rows.length === 0; })());

console.log(fails ? `\n${fails} FAILED` : '\nAll workflow tests passed');
process.exit(fails ? 1 : 0);
