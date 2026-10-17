/* Turns research/raw/results.jsonl into published aggregates only:
   src/data/yorkshire-2026.json. No business is named in the output. */
import fs from 'node:fs';
const rows = fs.readFileSync('research/raw/results.jsonl', 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
const { pool, created } = JSON.parse(fs.readFileSync('research/raw/sample.json', 'utf8'));
const ok = rows.filter(r => r.ok);
const pct = (a, f) => a.length ? Math.round(a.filter(f).length / a.length * 100) : null;
const avg = (a, f) => a.length ? Math.round(a.reduce((s, r) => s + f(r), 0) / a.length) : null;
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const SECTORS = { cafe: 'Cafés, pubs and restaurants', retail: 'Independent shops', trades: 'Trades and construction', clinic: 'Health, beauty and wellbeing', professional: 'Professional services', hospitality: 'Hotels and places to stay', fitness: 'Gyms and fitness', charity: 'Charities and community' };
const bands = a => ({ excellent: pct(a, r => r.total >= 85), good: pct(a, r => r.total >= 70 && r.total < 85), needs: pct(a, r => r.total >= 50 && r.total < 70), behind: pct(a, r => r.total < 50) });
const P = ['experience', 'findability', 'trust', 'conversion', 'modern'];
const pillars = a => Object.fromEntries(P.map(k => [k, avg(a, r => r.pillars[k] || 0)]));
const hist = Array.from({ length: 10 }, (_, i) => ok.filter(r => Math.min(9, Math.floor(r.total / 10)) === i).length);

const CHECKS = { https: 'Secure (HTTPS)', mobile: 'Set up for phones', title: 'Clear page title', desc: 'Search description', h1: 'One clear main heading', form: 'Enquiry form', contact: 'Tap-to-call or email link', social: 'Preview image when shared', analytics: 'Visitor analytics', fresh: 'Looks up to date', speed: 'Server responds in under 1.5s' };
const SIGS = { ld: 'Structured data for Google and AI search', reviews: 'Reviews on the site', booking: 'Mentions booking or appointments', newsletter: 'Newsletter sign-up', privacy: 'Privacy notice', chat: 'Live chat or WhatsApp link', video: 'Video', social: 'Social media linked' };
const basics = Object.entries(CHECKS).map(([k, t]) => ({ k, t, pct: pct(ok, r => r.checks?.[k]) })).sort((a, b) => a.pct - b.pct);
const extras = Object.entries(SIGS).map(([k, t]) => ({ k, t, pct: pct(ok, r => r.signals?.[k]) })).sort((a, b) => a.pct - b.pct);

const sectors = Object.entries(SECTORS).map(([id, t]) => {
  const a = ok.filter(r => r.sector === id); if (a.length < 15) return null;
  const essNames = [...new Set(a.flatMap(r => (r.ess || []).map(e => e[0])))];
  return { id, t, n: a.length, avg: avg(a, r => r.total), median: median(a.map(r => r.total)), fit: avg(a, r => r.fit), bands: bands(a), pillars: pillars(a),
    ess: essNames.map(name => ({ t: name, pct: pct(a, r => (r.ess || []).some(e => e[0] === name && e[1])) })).sort((x, y) => x.pct - y.pct) };
}).filter(Boolean).sort((a, b) => b.avg - a.avg);

const counties = ['West Yorkshire', 'South Yorkshire', 'North Yorkshire', 'East Yorkshire'].map(c => {
  const a = ok.filter(r => r.county === c); return a.length >= 30 ? { t: c, n: a.length, avg: avg(a, r => r.total), behind: pct(a, r => r.total < 50) } : { t: c, n: a.length, avg: null };
});

const out = {
  title: 'The state of Yorkshire small business websites 2026', sampleDrawn: created.slice(0, 10), checked: rows.length, reachable: ok.length,
  unreachable: pct(rows, r => !r.ok), pool,
  avg: avg(ok, r => r.total), median: median(ok.map(r => r.total)), bands: bands(ok), pillars: pillars(ok), hist,
  basics, extras, sectors, counties,
  noForm: pct(ok, r => !r.checks?.form), noAnalytics: pct(ok, r => !r.checks?.analytics), noLd: pct(ok, r => !r.signals?.ld), noDesc: pct(ok, r => !r.checks?.desc), outdated: pct(ok, r => r.checks?.fresh === false), noMobile: pct(ok, r => !r.checks?.mobile)
};
fs.writeFileSync('src/data/yorkshire-2026.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify({ n: out.reachable, avg: out.avg, median: out.median, bands: out.bands, unreachable: out.unreachable, pillars: out.pillars, sectors: out.sectors.map(s => [s.id, s.n, s.avg]), counties: out.counties, basics: out.basics.map(b => [b.k, b.pct]), extras: out.extras.map(b => [b.k, b.pct]) }, null, 0));
