/* Vercel Serverless Function — domain availability and price for the
   /digitalsme quote builder. Asks every registrar that is connected and
   returns each one's first-year price, so the browser can show the cheapest.

   POST { name } → { results: [{ domain, available, offers: [{ provider, amount, currency }] }] }

   Registrars (each is optional; set the env vars in Vercel to switch on):
   - Vercel:  VERCEL_TOKEN (+ optional VERCEL_TEAM_ID). Prices .com/.org/.net/.co/.io;
              cannot price or sell .co.uk or .uk.
   - GoDaddy: GODADDY_KEY + GODADDY_SECRET (production API key). Covers .co.uk/.uk too.
              GoDaddy limits Domains API access on smaller accounts; if it
              refuses, the other sources are used.
   Availability always has a fallback: the public RDAP registry lookup
   (Nominet, Verisign, PIR), where 404 = available and 200 = registered.
   With no registrar connected, the browser prices from the table in
   src/content.ts. */
const TRY = ['.co.uk', '.uk', '.com', '.org'];
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TEAM = process.env.VERCEL_TEAM_ID || 'lukeminshalls-projects';
const UA = 'MinshallGroupDomainCheck/1.0 (+https://minshallgroup.com/digitalsme)';

function candidates(input) {
  const n = String(input || '').trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/[\/?#].*$/, '');
  if (!n || n.length > 120) return null;
  const parts = n.split('.');
  if (!parts.every(p => LABEL.test(p))) return null;
  if (parts.length === 1) return TRY.map(t => n + t);
  return [n, ...TRY.map(t => parts[0] + t).filter(d => d !== n)].slice(0, 5);
}

async function timed(url, opts = {}, ms = 6000) {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ac.signal }); } finally { clearTimeout(t); }
}

/* ---- Vercel registrar ---- */
const vq = () => (TEAM.startsWith('team_') ? `teamId=${TEAM}` : `slug=${encodeURIComponent(TEAM)}`);
const vh = () => ({ Authorization: `Bearer ${process.env.VERCEL_TOKEN}`, 'Content-Type': 'application/json' });
async function vercel(domains) {
  if (!process.env.VERCEL_TOKEN) return {};
  const out = {};
  try {
    const r = await timed(`https://api.vercel.com/v1/registrar/domains/availability?${vq()}`, { method: 'POST', headers: vh(), body: JSON.stringify({ domains }) });
    if (!r.ok) return {};
    for (const x of (await r.json()).results || []) out[x.domain] = { available: String(x.available) === 'true' };
  } catch { return {}; }
  await Promise.all(Object.keys(out).filter(d => out[d].available).map(async d => {
    try {
      const r = await timed(`https://api.vercel.com/v1/registrar/domains/${encodeURIComponent(d)}/price?years=1&${vq()}`, { headers: vh() });
      if (!r.ok) return;
      const j = await r.json();
      if (typeof j.purchasePrice === 'number') out[d].offer = { provider: 'Vercel', amount: j.purchasePrice, currency: 'USD' };
    } catch { /* no price from Vercel for this ending */ }
  }));
  return out;
}

/* ---- GoDaddy ---- */
async function godaddy(domains) {
  if (!process.env.GODADDY_KEY || !process.env.GODADDY_SECRET) return {};
  try {
    const r = await timed('https://api.godaddy.com/v1/domains/available?checkType=FAST', {
      method: 'POST',
      headers: { Authorization: `sso-key ${process.env.GODADDY_KEY}:${process.env.GODADDY_SECRET}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(domains)
    }, 8000);
    if (!r.ok) return {};
    const j = await r.json(); const out = {};
    for (const x of j.domains || []) {
      out[x.domain] = { available: !!x.available };
      /* GoDaddy prices are in millionths of the account currency */
      if (x.available && typeof x.price === 'number') out[x.domain].offer = { provider: 'GoDaddy', amount: x.price / 1e6, currency: x.currency || 'USD' };
    }
    return out;
  } catch { return {}; }
}

/* ---- public registry fallback ---- */
const RDAP = { uk: 'https://rdap.nominet.uk/uk/domain/', com: 'https://rdap.verisign.com/com/v1/domain/', net: 'https://rdap.verisign.com/net/v1/domain/', org: 'https://rdap.publicinterestregistry.org/rdap/domain/' };
async function rdap(domain) {
  const base = RDAP[domain.split('.').pop()] || 'https://rdap.org/domain/';
  try {
    const r = await timed(base + encodeURIComponent(domain), { redirect: 'follow', headers: { Accept: 'application/rdap+json, application/json', 'User-Agent': UA } });
    if (r.status === 404) return true;
    if (r.ok) return false;
    return null;
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  let body = req.body; if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const list = candidates(body?.name);
  if (!list) return res.status(400).json({ error: 'Enter a domain name using letters, numbers and hyphens, like yourbusiness or yourbusiness.co.uk.' });

  const [v, g] = await Promise.all([vercel(list), godaddy(list)]);
  const results = await Promise.all(list.map(async domain => {
    const known = [v[domain], g[domain]].filter(Boolean);
    /* a registrar saying "taken" wins; otherwise any "available"; otherwise ask the registry */
    let available = known.some(k => k.available === false) ? false : known.some(k => k.available) ? true : await rdap(domain);
    const offers = available ? known.map(k => k.offer).filter(Boolean) : [];
    return { domain, available, offers };
  }));
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ results });
}
