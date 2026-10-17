/* Security tests for the client-portal schema, run in in-memory Postgres
   (PGlite) with stand-ins for Supabase's auth.jwt() and storage schema.
   Run: npm run test:db   Every line should start with PASS. */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
const db = new PGlite();
const q = (s, p) => db.query(s, p);
// --- Supabase stand-ins: auth.jwt(), storage schema, roles ---
await db.exec(`
create role authenticated nologin; create role anon nologin;
create schema auth; create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner_id text default (auth.jwt()->>'sub'));
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
`);
await db.exec(readFileSync(new URL('../migrations/001_client_portal.sql', import.meta.url), 'utf8'));
await db.exec(`grant usage on schema public, storage, auth to authenticated; grant all on all tables in schema public, storage to authenticated; grant execute on all functions in schema public, auth, storage to authenticated;`);
const as = async (sub, fn) => { await db.exec(`reset role`); await db.exec(`set request.jwt.claims = '${JSON.stringify({sub})}'`); await db.exec(`set role authenticated`); try { return await fn(); } finally { await db.exec(`reset role`); } };
let fails = 0;
const ok = (name, cond) => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + name); };
await db.exec(`insert into public.admins values ('user_admin','Luke')`);
// client A creates a project, trying to sneak a stage and preview link
const a = await as('user_a', () => q(`insert into public.clients (business_name, stage, preview_url, quote_total) values ('Cafe A','live','http://x',995) returning *`));
const A = a.rows[0];
ok('new project forced to onboarding', A.stage === 'onboarding' && A.preview_url === null && A.owner_id === 'user_a');
await as('user_a', () => q(`insert into public.briefs (client_id, answers) values ($1, '{"what":"cafe"}')`, [A.id]));
const b = await as('user_b', () => q(`insert into public.clients (business_name) values ('Builder B') returning *`));
const B = b.rows[0];
ok('A sees only own project', (await as('user_a', () => q(`select id from public.clients`))).rows.length === 1);
ok('B cannot read A brief', (await as('user_b', () => q(`select * from public.briefs where client_id=$1`, [A.id]))).rows.length === 0);
let threw = false; try { await as('user_b', () => q(`insert into public.briefs (client_id, answers) values ($1,'{}')`, [A.id])); } catch { threw = true; }
ok('B cannot write A brief', threw);
await as('user_a', () => q(`update public.clients set stage='live', live_url='http://hack', business_name='Cafe A Ltd' where id=$1`, [A.id]));
const A2 = (await q(`select * from public.clients where id=$1`, [A.id])).rows[0];
ok('client cannot change stage/links but can rename', A2.stage === 'onboarding' && A2.live_url === null && A2.business_name === 'Cafe A Ltd');
const up = await as('user_b', () => q(`update public.clients set business_name='hacked' where id=$1 returning id`, [A.id]));
ok('B cannot update A project', up.rows.length === 0);
// admin
ok('admin sees all projects', (await as('user_admin', () => q(`select id from public.clients`))).rows.length === 2);
await as('user_admin', () => q(`update public.clients set stage='design', preview_url='https://preview' where id=$1`, [A.id]));
ok('admin can move stage', (await q(`select stage from public.clients where id=$1`, [A.id])).rows[0].stage === 'design');
// requests
const r = (await as('user_a', () => q(`insert into public.requests (client_id, kind, title, status, quote_gbp) values ($1,'change','New page','done',1) returning *`, [A.id]))).rows[0];
ok('client request forced to new with no quote', r.status === 'new' && r.quote_gbp === null);
await as('user_a', () => q(`update public.requests set status='approved' where id=$1`, [r.id]));
ok('client cannot approve an unquoted request', (await q(`select status from public.requests where id=$1`, [r.id])).rows[0].status === 'new');
await as('user_admin', () => q(`update public.requests set status='quoted', quote_gbp=120 where id=$1`, [r.id]));
await as('user_a', () => q(`update public.requests set status='approved', quote_gbp=1 where id=$1`, [r.id]));
const r2 = (await q(`select status, quote_gbp from public.requests where id=$1`, [r.id])).rows[0];
ok('client can approve a quote but not change price', r2.status === 'approved' && r2.quote_gbp === 120);
const ap = (await as('user_a', () => q(`insert into public.requests (client_id, kind, title) values ($1,'approval','Design approved') returning status`, [A.id]))).rows[0];
ok('design approval recorded as approved', ap.status === 'approved');
const m = (await as('user_a', () => q(`insert into public.request_messages (request_id, body) values ($1,'hi') returning from_admin`, [r.id]))).rows[0];
const m2 = (await as('user_admin', () => q(`insert into public.request_messages (request_id, body) values ($1,'hello') returning from_admin`, [r.id]))).rows[0];
ok('messages stamped correctly', m.from_admin === false && m2.from_admin === true);
// invoices
threw = false; try { await as('user_a', () => q(`insert into public.invoices (client_id,label,amount_gbp) values ($1,'x',1)`, [A.id])); } catch { threw = true; }
ok('client cannot create invoices', threw);
await as('user_admin', () => q(`insert into public.invoices (client_id,label,amount_gbp,status) values ($1,'Stage 1',332,'draft'),($1,'Stage 2',332,'due')`, [A.id]));
ok('client sees issued invoices, not drafts', (await as('user_a', () => q(`select label from public.invoices`))).rows.map(x => x.label).join() === 'Stage 2');
const iu = await as('user_a', () => q(`update public.invoices set status='paid' returning id`));
ok('client cannot mark invoice paid', iu.rows.length === 0);
// scores and storage
threw = false; try { await as('user_a', () => q(`insert into public.scores (client_id, data) values ($1,'{}')`, [A.id])); } catch { threw = true; }
ok('client cannot write scores', threw);
await as('user_a', () => q(`insert into storage.objects (bucket_id, name) values ('client-files', $1)`, [A.id + '/brief/logo.png']));
threw = false; try { await as('user_b', () => q(`insert into storage.objects (bucket_id, name) values ('client-files', $1)`, [A.id + '/brief/evil.png'])); } catch { threw = true; }
ok('B cannot upload into A folder', threw);
ok('B cannot see A files', (await as('user_b', () => q(`select * from storage.objects`))).rows.length === 0);
ok('admin sees A files', (await as('user_admin', () => q(`select * from storage.objects`))).rows.length === 1);

if (fails) { console.error(`${fails} failed`); process.exit(1); } else console.log('All security tests passed');
