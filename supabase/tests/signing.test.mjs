/* End-to-end test of electronic signing: the real api/_lib/sign.js against
   the real migrations in PGlite, with stand-ins for Clerk, file storage and
   email. Run: node --experimental-test-module-mocks supabase/tests/signing.test.mjs */
import { mock } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const pg = new PGlite();
await pg.exec(`
create role authenticated nologin; create role anon nologin;
create schema auth; create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner_id text default (auth.jwt()->>'sub'));
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;`);
for (const f of ['001_client_portal', '002_notifications', '003_site_checks', '004_services_and_team', '005_team_workflow', '006_agreements'])
  await pg.exec(readFileSync(new URL(`../migrations/${f}.sql`, import.meta.url), 'utf8'));
await pg.exec(`set request.jwt.claims = '{"role":"service_role"}'`);   // everything below runs as our server

/* ---- a small stand-in for the Supabase service client ---- */
const store = new Map();
const conv = v => v === undefined ? null : (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) ? JSON.stringify(v) : v;
class Q { constructor(t) { this.t = t; this.f = []; this.o = []; this.op = 'select'; this.cols = '*'; this.one = 0; }
  select(c = '*') { if (this.op === 'select') this.cols = c; return this; }
  eq(k, v) { this.f.push([k, '=', v]); return this; } neq(k, v) { this.f.push([k, '<>', v]); return this; } is(k) { this.f.push([k, 'is', null]); return this; } in(k, v) { this.f.push([k, 'in', v]); return this; }
  order(k, o = {}) { this.o.push(`"${k}" ${o.ascending === false ? 'desc' : 'asc'}`); return this; } limit() { return this; }
  insert(r) { this.op = 'insert'; this.pl = Array.isArray(r) ? r : [r]; return this; } update(r) { this.op = 'update'; this.pl = r; return this; }
  single() { this.one = 1; return this; } maybeSingle() { this.one = 2; return this; }
  then(a, b) { return this.run().then(a, b); }
  async run() { const ps = []; const P = v => { ps.push(conv(v)); return '$' + ps.length; };
    const w = () => this.f.length ? ' where ' + this.f.map(([k, op, v]) => op === 'is' ? `"${k}" is null` : op === 'in' ? `"${k}" = any(${P(v)})` : `"${k}" ${op} ${P(v)}`).join(' and ') : '';
    let sql;
    if (this.op === 'select') sql = `select ${this.cols} from public.${this.t}${w()}${this.o.length ? ' order by ' + this.o.join(',') : ''}`;
    if (this.op === 'insert') { const cols = [...new Set(this.pl.flatMap(r => Object.keys(r)))]; sql = `insert into public.${this.t} (${cols.map(c => `"${c}"`)}) values ${this.pl.map(r => '(' + cols.map(c => P(r[c])) + ')')} returning *`; }
    if (this.op === 'update') sql = `update public.${this.t} set ${Object.entries(this.pl).map(([k, v]) => `"${k}"=${P(v)}`)}${w()} returning *`;
    try { const r = await pg.query(sql, ps); return { data: this.one ? (r.rows[0] ?? null) : r.rows, error: null }; } catch (e) { return { data: null, error: { message: e.message } }; } } }
const fake = { from: t => new Q(t), storage: { from: () => ({
  download: async p => store.has(p) ? { data: new Blob([store.get(p)]), error: null } : { data: null, error: { message: 'missing' } },
  upload: async (p, buf) => { store.set(p, Buffer.from(buf)); return { data: { path: p }, error: null }; },
  createSignedUrl: async p => ({ data: { signedUrl: 'https://files.test/' + p } }) }) } };
const mails = [];
const EMAILS = { user_admin: 'luke@minshallgroup.com', user_l: 'leigh@client.test', user_x: 'x@elsewhere.com' };
mock.module(new URL('../../api/_lib/portal.js', import.meta.url).href, { namedExports: {
  db: () => fake, sendEmail: async m => { mails.push(m); return true; }, TEAM: () => 'luke@minshallgroup.com', PUBLIC_REPLY: 'hello@minshallgroup.com', SITE: 'https://minshallgroup.com',
  projectFor: async (who, cid) => { if (who.isAdmin) return {}; const r = await pg.query(`select 1 from public.project_members m join public.signups s on lower(s.email)=m.email where m.client_id=$1 and s.user_id=$2`, [cid, who.userId]); if (!r.rows.length) throw new Error('Not your project'); return {}; } } });
mock.module('@clerk/backend', { namedExports: { createClerkClient: () => ({ users: { getUser: async id => ({ firstName: id === 'user_l' ? 'Leigh' : 'Someone', lastName: '', primaryEmailAddress: { emailAddress: EMAILS[id] }, emailAddresses: [{ emailAddress: EMAILS[id], verification: { status: 'verified' } }] }) } }) } });
const { signEvent } = await import('../../api/_lib/sign.js');

let fails = 0; const ok = (n, c) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + n); };
const tryE = async fn => { try { await fn(); return ''; } catch (e) { return e.message; } };
const req = ip => ({ headers: { 'x-forwarded-for': ip + ', 10.0.0.1', 'user-agent': 'TestBrowser/1.0' } });
const admin = { userId: 'user_admin', isAdmin: true }, leigh = () => ({ userId: 'user_l', isAdmin: false }), outsider = { userId: 'user_x', isAdmin: false };

/* setup: the project, Leigh on its team, the PDF in storage, a draft agreement */
await pg.query(`insert into public.admins values ('user_admin','Luke')`);
await pg.query(`insert into public.signups (user_id,email,name) values ('user_admin','luke@minshallgroup.com','Luke'),('user_l','leigh@client.test','Leigh'),('user_x','x@elsewhere.com','X')`);
const P = (await pg.query(`insert into public.clients (business_name,service,owner_id) values ('Test Health Ltd','digital','user_admin') returning *`)).rows[0];
await pg.query(`insert into public.project_members (client_id,email,name,role,added_by) values ($1,'leigh@client.test','Leigh','approver','user_admin')`, [P.id]);
const o = await PDFDocument.create(); o.addPage().drawText('Agreement, page 1', { x: 50, y: 700, size: 14, font: await o.embedFont(StandardFonts.Helvetica) });
const original = Buffer.from(await o.save()); const path = `${P.id}/deliverable/agreement.pdf`; store.set(path, original);
const F = (await pg.query(`insert into public.files (client_id,path,name,kind,uploaded_by) values ($1,$2,'Agreement','deliverable','user_admin') returning *`, [P.id, path])).rows[0];
const A = (await pg.query(`insert into public.agreements (client_id,title,summary,file_id,terms_url,created_by) values ($1,'Agreement: Phase 1','Proposal, terms and payment schedule',$2,'https://minshallgroup.com/digitalsme/terms','user_admin') returning *`, [P.id, F.id])).rows[0];
await pg.query(`insert into public.agreement_signers (agreement_id,client_id,email,name,signs_for,sort) values ($1,$2,'leigh@client.test','Leigh','Test Health Ltd',0),($1,$2,'luke@minshallgroup.com','Luke Minshall','Minshall Group Limited',1)`, [A.id, P.id]);

ok('a client cannot send an agreement', (await tryE(() => signEvent('agreement_send', req('1.1.1.1'), leigh(), { agreementId: A.id }))).includes('Only Minshall Group'));
ok('an outsider cannot see a draft', !!(await tryE(() => signEvent('agreement_view', req('1.1.1.1'), outsider, { agreementId: A.id }))));
const sent = await signEvent('agreement_send', req('1.1.1.1'), admin, { agreementId: A.id });
const A1 = (await pg.query(`select * from public.agreements where id=$1`, [A.id])).rows[0];
ok('sending fingerprints the PDF and emails both signers', sent.sent === 2 && A1.status === 'out' && A1.doc_sha256 === createHash('sha256').update(original).digest('hex') && mails.filter(m => m.subject.startsWith('For your signature')).length === 2);
ok('each invitation links to the signing page', mails.some(m => m.to === 'leigh@client.test' && m.html.includes(`/sign?a=${A.id}`)));
ok('it cannot be sent twice', (await tryE(() => signEvent('agreement_send', req('1.1.1.1'), admin, { agreementId: A.id }))).includes('already been sent'));
const v = await signEvent('agreement_view', req('1.1.1.1'), leigh(), { agreementId: A.id });
ok('the signer sees the document and their signing details', v.me && v.me.signs_for === 'Test Health Ltd' && v.docUrl.includes('agreement.pdf') && v.me.consent.includes('authorised to sign on behalf of Test Health Ltd'));
ok('a client does not see other signers’ emails or IP addresses', v.signers.every(s => !('email' in s) && !('ip' in s)));
ok('someone it is not addressed to is turned away', (await tryE(() => signEvent('agreement_view', req('1.1.1.1'), outsider, { agreementId: A.id }))).includes('not addressed to x@elsewhere.com'));
ok('signing needs both confirmations', (await tryE(() => signEvent('agreement_sign', req('203.0.113.7'), leigh(), { agreementId: A.id, name: 'Leigh Test', agree: true }))).includes('tick both'));
ok('signing needs a real name', (await tryE(() => signEvent('agreement_sign', req('203.0.113.7'), leigh(), { agreementId: A.id, name: '12', agree: true, authorised: true }))).includes('full name'));
ok('a bad drawing is refused', (await tryE(() => signEvent('agreement_sign', req('203.0.113.7'), leigh(), { agreementId: A.id, name: 'Leigh Test', agree: true, authorised: true, signature: 'data:text/html,<script>' }))).includes('drawn signature'));
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const s1 = await signEvent('agreement_sign', req('203.0.113.7'), leigh(), { agreementId: A.id, name: 'Leigh Test', agree: true, authorised: true, signature: png });
const r1 = (await pg.query(`select * from public.agreement_signers where email='leigh@client.test'`)).rows[0];
ok('the first signature is recorded, waiting for one more', s1.complete === false && s1.waiting === 1 && r1.signed_name === 'Leigh Test' && r1.ip === '203.0.113.7' && r1.user_agent === 'TestBrowser/1.0' && r1.doc_sha256 === A1.doc_sha256 && r1.consent.includes('Test Health Ltd'));
ok('the same person cannot sign twice', (await tryE(() => signEvent('agreement_sign', req('203.0.113.7'), leigh(), { agreementId: A.id, name: 'Leigh Again', agree: true, authorised: true }))).includes('already signed'));
store.set(path, Buffer.concat([original, Buffer.from('tampered')]));
ok('a changed document cannot be signed', (await tryE(() => signEvent('agreement_sign', req('198.51.100.2'), admin, { agreementId: A.id, name: 'Luke Minshall', agree: true, authorised: true }))).includes('changed since it was sent'));
store.set(path, original);
mails.length = 0;
const s2 = await signEvent('agreement_sign', req('198.51.100.2'), admin, { agreementId: A.id, name: 'Luke Minshall', agree: true, authorised: true });
const A2 = (await pg.query(`select * from public.agreements where id=$1`, [A.id])).rows[0];
const signedFile = (await pg.query(`select * from public.files where id=$1`, [A2.signed_file_id])).rows[0];
ok('the last signature completes the agreement', s2.complete === true && A2.status === 'signed' && A2.completed_at && signedFile && signedFile.name === 'Signed: Agreement: Phase 1');
const copy = await PDFDocument.load(store.get(signedFile.path));
ok('the signed copy is the original plus a certificate', copy.getPageCount() >= 2 && copy.getTitle() === 'Signed: Agreement: Phase 1');
const done = mails.filter(m => m.subject.startsWith('Signed by everyone') || m.subject.startsWith('[Portal] Signed by everyone'));
ok('every signer and our team get the signed copy attached', done.length === 3 && done.every(m => m.attachments?.[0]?.filename.endsWith('-signed.pdf') && m.attachments[0].content.length > 100));
const v2 = await signEvent('agreement_view', req('1.1.1.1'), leigh(), { agreementId: A.id });
ok('afterwards the signer can download the signed copy', v2.agreement.status === 'signed' && v2.signedUrl.includes('signed') && v2.me === null);
ok('nobody can sign after completion', (await tryE(() => signEvent('agreement_sign', req('1.1.1.1'), admin, { agreementId: A.id, name: 'Luke Minshall', agree: true, authorised: true }))).length > 0);
console.log(fails ? `\n${fails} FAILED` : '\nAll signing tests passed');
process.exit(fails ? 1 : 0);
