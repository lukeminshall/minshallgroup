/* Prospect list from the Yorkshire research.
   Run: node scripts/research/prospects.mjs   (LIMIT=50 for a trial run)
   For every site we scored, reads the homepage and up to three contact,
   about or legal pages, and records:
     - published email addresses (mailto links, plain text, Cloudflare-protected)
     - a registered company number, if shown (UK companies must show it on
       their website, so it is the best sign they are a company, not a sole
       trader, which matters for PECR: only corporate subscribers may be
       emailed without consent)
     - the site's Webmins Score and its two most useful fixes, in plain English
   Business names and phone numbers come from the OpenStreetMap extracts.
   Output: research/raw/prospects.csv and prospects.json (kept out of git:
   they name businesses and contacts). Only public pages are read. */
import fs from 'node:fs';

const RAW = process.env.REGION && process.env.REGION !== 'yorkshire' ? `research/raw/${process.env.REGION}` : 'research/raw';
const LIMIT = Number(process.env.LIMIT || Infinity);
const CONC = 10, TIMEOUT = 10000;
const UA = 'Mozilla/5.0 (compatible; MinshallGroupResearch/1.0; +https://minshallgroup.com/insights/state-of-yorkshire-small-business-websites-2026)';

/* ---------- names and phones from OpenStreetMap ---------- */
const host = u => { try { return new URL(/^https?:/.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } };
const osm = new Map();
for (const f of fs.readdirSync(RAW).filter(f => f.startsWith('osm-'))) {
  const j = JSON.parse(fs.readFileSync(`${RAW}/${f}`, 'utf8'));
  for (const e of (Array.isArray(j) ? j : j.elements || [])) {
    const t = e.tags || {}; const d = host(t.website || t['contact:website'] || '');
    if (!d || osm.has(d)) continue;
    const kind = (t.craft || t.shop || t.amenity || t.office || t.tourism || t.leisure || t.healthcare || '').replace(/_/g, ' ');
    osm.set(d, { name: t.name || '', kind, phone: t.phone || t['contact:phone'] || '', email: t.email || t['contact:email'] || '', company: t['ref:GB:companies_house'] || '' });
  }
}

/* ---------- fixes, in the order they usually matter ---------- */
const ESS_FIX = {
  'Menu on the site': 'Put your menu on the site', 'Opening hours': 'Show today’s opening hours near the top', 'Map or directions': 'Add a map and directions',
  'Book a table or order online': 'Add online booking or ordering', 'Reviews shown': 'Show your reviews on the homepage', 'Instagram linked': 'Link your Instagram',
  'Tap-to-call phone number': 'Add a tap-to-call phone number', 'Buy online': 'Let people buy online', 'Prices shown': 'Show your prices', 'Delivery information': 'Add delivery information',
  'Returns policy': 'Add a returns policy', 'Newsletter sign-up': 'Add a newsletter sign-up', 'Social links': 'Link your social accounts', 'Quote or enquiry form': 'Add a quote form above the fold',
  'Accreditations shown': 'Show your accreditations', 'Photos of past work': 'Add photos of past work', 'Areas covered': 'List the areas you cover', 'Address or location': 'Show your address',
  'Book online': 'Add online booking', 'Practitioners introduced': 'Introduce your practitioners', 'Professional registration shown': 'Show professional registration', 'Privacy notice': 'Add a privacy notice',
  'Case studies or clients': 'Add short client case studies', 'Team introduced': 'Introduce your team', 'News or insights': 'Add news or insights', 'Enquiry form': 'Add an enquiry form',
  'LinkedIn linked': 'Link your LinkedIn page', 'Structured data for search': 'Tell Google and AI search who you are (structured data)', 'Rooms or spaces described': 'Describe your rooms or spaces',
  'Photo gallery': 'Add a photo gallery', 'Video tour': 'Add a short video tour', 'Class timetable': 'Put your class timetable online', 'Membership options': 'Show membership options',
  'Free trial offer': 'Offer a free trial or first class', 'Donate online': 'Add online donations', 'Charity number shown': 'Show your charity number', 'News or stories': 'Share news or stories', 'Contact or volunteer form': 'Add a contact or volunteer form'
};
function fixes(r) {
  const out = [];
  const c = r.checks || {}, s = r.signals || {};
  if (c.mobile === false) out.push('Make the site work properly on phones');
  for (const [label, ok] of r.ess || []) if (!ok && ESS_FIX[label]) out.push(ESS_FIX[label]);
  if (c.form === false && !out.some(x => /form/i.test(x))) out.push('Add an enquiry form to the homepage');
  if (c.speed === false) out.push('Speed up the site on mobile');
  if (s.ld === false && !out.some(x => /structured/i.test(x))) out.push('Tell Google and AI search who you are (structured data)');
  if (c.desc === false) out.push('Write a search description for Google');
  if (c.analytics === false) out.push('Add privacy-friendly visitor analytics');
  return [...new Set(out)];
}

/* ---------- reading a site ---------- */
async function get(url) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), TIMEOUT);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, redirect: 'follow', signal: ac.signal });
    if (!r.ok || !/html/i.test(r.headers.get('content-type') || '')) return null;
    return { url: r.url, html: (await r.text()).slice(0, 600000) };
  } catch { return null; } finally { clearTimeout(t); }
}
const cfDecode = hex => { const k = parseInt(hex.slice(0, 2), 16); let s = ''; for (let i = 2; i < hex.length; i += 2) s += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ k); return s; };
const JUNK = /(\.(png|jpe?g|gif|webp|svg)$|sentry|wixpress|example\.|domain\.com|email\.com|yourname|@sentry|godaddy|wordpress\.com$|squarespace|@2x|u003e|noreply|no-reply)/i;
function emails(html) {
  const found = new Set();
  for (const m of html.matchAll(/data-cfemail="([0-9a-f]+)"/gi)) found.add(cfDecode(m[1]));
  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) found.add(decodeURIComponent(m[1]));
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/&#64;|&commat;|\s?\[at\]\s?|\s?\(at\)\s?/gi, '@');
  for (const m of text.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)) found.add(m[0]);
  return [...found].map(e => e.trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z]+$/g, '')).filter(e => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e) && !JUNK.test(e) && e.length < 80);
}
function companyNo(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ');
  const m = text.match(/(?:company|registration|registered|reg\.?)\s*(?:no\.?|number|num\.?)?\s*[:.#-]?\s*((?:SC|NI|OC|SO|NC|R0)?\d{6,8})\b/i);
  const reg = /registered (?:in|office)|companies house|registered in england|registered in scotland|registered in wales/i.test(text);
  return { no: m && (reg || /company/i.test(m[0])) ? m[1].toUpperCase() : '', ltd: /\b(ltd|limited|llp)\b/i.test(text) };
}
function subLinks(base, html) {
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)) {
    const href = m[1], label = m[2].replace(/<[^>]+>/g, '');
    if (!/contact|about|privacy|terms|legal|impressum|get-in-touch|find-us/i.test(href + ' ' + label)) continue;
    try { const u = new URL(href, base); if (host(u.href) === host(base)) out.push(u.href.split('#')[0]); } catch {}
  }
  const rank = u => /contact|get-in-touch|find-us/i.test(u) ? 0 : /privacy|terms|legal/i.test(u) ? 1 : 2;
  return [...new Set(out)].sort((a, b) => rank(a) - rank(b)).slice(0, 3);
}

async function visit(r) {
  const d = host(r.final || r.url), o = osm.get(d) || osm.get(host(r.url)) || {};
  const pages = []; const home = await get(r.final || r.url);
  if (home) { pages.push(home); for (const u of subLinks(home.url, home.html)) { const p = await get(u); if (p) pages.push(p); } }
  const all = pages.map(p => p.html).join('\n');
  let em = [...new Set([...(o.email ? [o.email.toLowerCase()] : []), ...emails(all)])];
  const own = em.filter(e => host(e.split('@')[1]) === d || d.endsWith(e.split('@')[1]));
  em = [...own, ...em.filter(e => !own.includes(e))].slice(0, 3);
  const co = companyNo(all); const companyNumber = o.company || co.no;
  const fx = fixes(r);
  return {
    business: o.name || d, sector: r.sector, type: o.kind || '', town: r.town, county: r.county, website: d, score: r.total, grade: r.grade,
    fix_1: fx[0] || '', fix_2: fx[1] || '', fixes_total: fx.length, email: em[0] || '', other_emails: em.slice(1).join(' '),
    email_on_own_domain: own.length ? 'yes' : 'no', phone: o.phone || '', company_number: companyNumber, ltd_mentioned: co.ltd ? 'yes' : 'no',
    /* PECR: a company number on the site means a corporate subscriber; otherwise check Companies House before emailing */
    pecr: companyNumber ? 'company: ok to email' : co.ltd ? 'probably company: confirm on Companies House' : 'check first: may be a sole trader', pages_read: pages.length
  };
}

/* saved as it goes, so a stopped run resumes where it left off */
const PART = `${RAW}/prospects.part.jsonl`;
const doneSet = new Set(fs.existsSync(PART) ? fs.readFileSync(PART, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l).website) : []);
const rows = fs.readFileSync(`${RAW}/results.jsonl`, 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(r => r.ok).slice(0, LIMIT)
  .filter(r => !doneSet.has(host(r.final || r.url)));
console.log(`resuming: ${doneSet.size} done, ${rows.length} to go`);
let i = 0, done = 0;
await Promise.all(Array.from({ length: CONC }, async () => {
  while (i < rows.length) { const r = rows[i++]; try { fs.appendFileSync(PART, JSON.stringify(await visit(r)) + '\n'); } catch {} if (++done % 100 === 0) console.log(`${done}/${rows.length}`); }
}));
const out = fs.readFileSync(PART, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
out.sort((a, b) => a.county.localeCompare(b.county) || a.town.localeCompare(b.town) || a.score - b.score);
const cols = Object.keys(out[0]);
const csv = [cols.join(','), ...out.map(o => cols.map(c => `"${String(o[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
fs.writeFileSync(`${RAW}/prospects.csv`, csv); fs.writeFileSync(`${RAW}/prospects.json`, JSON.stringify(out, null, 1));
const n = k => out.filter(k).length;
console.log(JSON.stringify({ sites: out.length, withEmail: n(o => o.email), ownDomainEmail: n(o => o.email_on_own_domain === 'yes'), companyNumber: n(o => o.company_number), okToEmail: n(o => o.email && o.company_number), probableCompany: n(o => o.email && !o.company_number && o.ltd_mentioned === 'yes') }));
