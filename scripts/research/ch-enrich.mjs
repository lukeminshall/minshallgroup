/* Find websites and published emails for Companies House prospects.
   Run: node scripts/research/ch-enrich.mjs   (LIMIT=200 for a trial)
   For each company in research/raw/ch/companies.csv (builders and trades
   first, then sport, garden centres, then everything else):
     1. guess likely domains from the company name (.co.uk, .com, .uk)
     2. keep only those that resolve in DNS
     3. read the homepage and up to two contact/legal pages, and accept the
        site only if it shows the company number, or the name and the town
     4. take the published email addresses from the site
   Saves as it goes to research/raw/ch/enriched.jsonl and resumes from there.
   Only public pages are read. Output stays out of git. */
import fs from 'node:fs';
import dns from 'node:dns/promises';

const DIR = 'research/raw/ch';
const LIMIT = Number(process.env.LIMIT || Infinity);
const CONC = Number(process.env.CONC || 40), TIMEOUT = 9000;
const UA = 'Mozilla/5.0 (compatible; MinshallGroupResearch/1.0; +https://minshallgroup.com)';
const ORDER = ['Builders and construction', 'Electrical, plumbing and heating', 'Joinery and fitting', 'Roofing', 'Painting and decorating', 'Glazing', 'Landscaping and gardening',
  'Sports clubs and facilities', 'Gyms and fitness', 'Garden centres and florists', 'Cafés, pubs and restaurants', 'Hair and beauty', 'Hotels and places to stay', 'Garages and vehicle repair'];

/* ---------- read companies ---------- */
function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; } else if (c === '\n') { row.push(f.replace(/\r$/, '')); rows.push(row); row = []; f = ''; } else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const [hdr, ...data] = parseCSV(fs.readFileSync(`${DIR}/companies.csv`, 'utf8'));
const cos = data.filter(r => r.length === hdr.length).map(r => Object.fromEntries(hdr.map((h, i) => [h, r[i]])));
const rank = c => { const i = ORDER.indexOf(c.category); return i < 0 ? ORDER.length : i; };
cos.sort((a, b) => rank(a) - rank(b));

/* ---------- domain guesses ---------- */
const STOP = /\b(limited|ltd|llp|plc|the|uk|group|holdings|services|company|co|cic|c\.i\.c|community interest company|and|&)\b/g;
function guesses(name) {
  const n = name.toLowerCase().replace(/&/g, ' and ').replace(/['’.]/g, '').replace(/\(.*?\)/g, ' ');
  const full = n.replace(/\b(limited|ltd|llp|plc|cic|community interest company)\b/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const core = n.replace(STOP, ' ').replace(/[^a-z0-9 ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const out = new Set();
  for (const w of [full, core]) {
    if (!w.length) continue;
    const j = w.join(''), h = w.join('-');
    if (j.length < 4 || j.length > 40) continue;
    for (const t of ['.co.uk', '.com', '.uk']) out.add(j + t);
    out.add(h + '.co.uk');
    if (w === full && !/ltd$/.test(j)) out.add(j + 'ltd.co.uk');
  }
  return [...out].slice(0, 8);
}
/* c-ares lookups run in parallel (dns.lookup queues on four threads) */
const R = new dns.Resolver({ timeout: 3000, tries: 1 });
const resolves = async d => { try { return (await R.resolve4(d)).length > 0; } catch { try { return (await R.resolve4('www.' + d)).length > 0; } catch { return false; } } };

/* ---------- reading pages ---------- */
async function get(url) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: ac.signal });
    if (!r.ok || !/html/i.test(r.headers.get('content-type') || '')) return null;
    return { url: r.url, html: (await r.text()).slice(0, 500000) };
  } catch { return null; } finally { clearTimeout(t); }
}
const host = u => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } };
const PARKED = /domain (is )?for sale|buy this domain|parked free|this domain (name )?(may be|is) for sale|godaddy|sedo|dan\.com|hugedomains|domain parking|coming soon|under construction|account suspended|default web site page|it works!/i;
const cfDecode = hex => { const k = parseInt(hex.slice(0, 2), 16); let s = ''; for (let i = 2; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k); return s; };
const JUNK = /(\.(png|jpe?g|gif|webp|svg)$|sentry|wixpress|example\.|domain\.com|email\.com|yourname|godaddy|squarespace|@2x|noreply|no-reply|wordpress|cloudflare)/i;
function emails(html) {
  const found = new Set();
  for (const m of html.matchAll(/data-cfemail="([0-9a-f]+)"/gi)) found.add(cfDecode(m[1]));
  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) { try { found.add(decodeURIComponent(m[1])); } catch {} }
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/&#64;|&commat;/gi, '@');
  for (const m of text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) found.add(m[0]);
  return [...found].map(e => e.trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z]+$/g, '')).filter(e => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e) && !JUNK.test(e) && e.length < 80);
}
const tel = html => { const m = html.match(/href=["']tel:([+\d\s()-]{9,20})["']/i); return m ? m[1].replace(/\s+/g, ' ').trim() : ''; };
function subLinks(base, html) {
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,100}?)<\/a>/gi)) {
    if (!/contact|about|privacy|terms|legal/i.test(m[1] + ' ' + m[2])) continue;
    try { const u = new URL(m[1], base); if (host(u.href) === host(base)) out.push(u.href.split('#')[0]); } catch {}
  }
  return [...new Set(out)].sort((a, b) => (/contact/i.test(b) ? 1 : 0) - (/contact/i.test(a) ? 1 : 0)).slice(0, 2);
}
const norm = s => s.toLowerCase().replace(/&amp;|&/g, ' and ').replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9]+/g, ' ');
function match(co, html, domain = '') {
  const text = norm(html), digits = html.replace(/<[^>]+>/g, ' ');
  const num = co.company_number.replace(/^0+/, '');
  if (new RegExp(`\\b0*${num}\\b`).test(digits)) return 'confirmed: company number on site';
  const words = norm(co.company).replace(/\b(limited|ltd|llp|the|and|uk|services|group)\b/g, ' ').trim().split(/\s+/).filter(w => w.length > 2);
  /* short or generic names ("1 Pro") are too easy to match by chance: they need the company number */
  if (words.join('').length < 8 || words.length < 2 && words[0]?.length < 10) return '';
  const nameHit = words.every(w => text.includes(` ${w} `) || text.includes(` ${w}`));
  const town = norm(co.post_town).trim(); const district = (co.postcode || '').split(' ')[0].toLowerCase();
  if (nameHit && ((town && text.includes(` ${town}`)) || (district && text.includes(` ${district}`)))) return 'likely: name and town on site';
  /* the web address is the company's own distinctive name, and the site uses that name */
  const label = domain.split('.')[0].replace(/-/g, '');
  if (nameHit && label.length >= 10 && label === words.join('').replace(/[^a-z0-9]/g, '').slice(0, label.length) ) return 'likely: own name as web address';
  return '';
}

async function enrich(co) {
  const base = { company: co.company, company_number: co.company_number, category: co.category, region: co.region, town: co.post_town, postcode: co.postcode };
  for (const d of guesses(co.company)) {
    if (!(await resolves(d))) continue;
    const home = await get('https://' + d) || await get('http://' + d);
    if (!home || PARKED.test(home.html.slice(0, 20000))) continue;
    const pages = [home]; for (const u of subLinks(home.url, home.html)) { const p = await get(u); if (p) pages.push(p); }
    const all = pages.map(p => p.html).join('\n');
    const m = match(co, all, d);
    if (!m) continue;
    const site = host(home.url);
    let em = emails(all); const own = em.filter(e => site.endsWith(e.split('@')[1]) || e.split('@')[1].endsWith(site));
    em = [...own, ...em.filter(e => !own.includes(e))];
    return { ...base, website: site, match: m, email: em[0] || '', other_emails: em.slice(1, 3).join(' '), email_on_own_domain: own.length ? 'yes' : 'no', phone: tel(all) };
  }
  return { ...base, website: '', match: '', email: '', other_emails: '', email_on_own_domain: '', phone: '' };
}

const OUT = `${DIR}/enriched.jsonl`;
const done = new Set(fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l).company_number) : []);
const todo = cos.filter(c => !done.has(c.company_number)).slice(0, LIMIT);
console.log(`companies ${cos.length}, already done ${done.size}, this run ${todo.length}`);
let i = 0, n = 0, hits = 0, mails = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  while (i < todo.length) {
    const c = todo[i++];
    try { const r = await enrich(c); fs.appendFileSync(OUT, JSON.stringify(r) + '\n'); if (r.website) hits++; if (r.email) mails++; } catch {}
    if (++n % 500 === 0) console.log(`${n}/${todo.length} · websites ${hits} · emails ${mails}`);
  }
}));
console.log(`done ${n} · websites ${hits} · emails ${mails}`);
