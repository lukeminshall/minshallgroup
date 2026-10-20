/* Research sample: Yorkshire small-business websites from OpenStreetMap.
   Run: node scripts/research/collect.mjs
   Pulls businesses that list a website in the four Yorkshire areas, maps
   OSM tags to our sectors, drops chains (a domain used by 3+ places), social
   pages and public bodies, then draws a stratified random sample.
   Output: research/raw/sample.json (kept out of git: it names businesses).
   Data © OpenStreetMap contributors, ODbL. */
import fs from 'node:fs';

/* REGION=lincolnshire|north-east|lancashire writes to research/raw/<region>/; default is Yorkshire in research/raw */
const REGIONS = {
  yorkshire: { 'West Yorkshire': 'West Yorkshire', 'South Yorkshire': 'South Yorkshire', 'North Yorkshire': 'North Yorkshire', 'East Yorkshire': 'East Riding of Yorkshire', 'York': 'York', 'Hull': 'Kingston upon Hull' },
  lincolnshire: { 'Lincolnshire': 'Lincolnshire', 'North Lincolnshire': 'North Lincolnshire', 'North East Lincolnshire': 'North East Lincolnshire' },
  'north-east': { 'Northumberland': 'Northumberland', 'Tyne and Wear': 'Tyne and Wear', 'County Durham': 'County Durham', 'Darlington': 'Darlington', 'Hartlepool': 'Hartlepool', 'Stockton-on-Tees': 'Stockton-on-Tees', 'Middlesbrough': 'Middlesbrough', 'Redcar and Cleveland': 'Redcar and Cleveland' },
  lancashire: { 'Lancashire': 'Lancashire', 'Blackpool': 'Blackpool', 'Blackburn with Darwen': 'Blackburn with Darwen' }
};
const REGION = process.env.REGION || 'yorkshire';
const RAW = REGION === 'yorkshire' ? 'research/raw' : `research/raw/${REGION}`;
const AREAS = REGIONS[REGION];
const REGION_NAME = { lincolnshire: 'Lincolnshire', 'north-east': 'North East', lancashire: 'Lancashire' }[REGION];
const COUNTY = REGION === 'yorkshire' ? { 'York': 'North Yorkshire', 'Hull': 'East Yorkshire' } : new Proxy({}, { get: () => REGION_NAME });
const PER_SECTOR = process.env.ALL ? Infinity : Number(process.env.PER || 70);  /* ALL=1 checks every mapped business */
const SEED = 20261017;

const SECTOR = tags => {
  const a = tags.amenity, s = tags.shop, c = tags.craft, o = tags.office, h = tags.healthcare, t = tags.tourism, l = tags.leisure;
  if (['cafe', 'restaurant', 'pub', 'bar'].includes(a)) return 'cafe';
  if (c || s === 'trade' || ['builder', 'plumber', 'electrician', 'roofer', 'carpenter', 'hvac', 'glaziery', 'painter', 'stonemason', 'landscaper'].includes(c)) return 'trades';
  if (['physiotherapist', 'chiropractor', 'osteopath', 'podiatrist', 'counselling', 'psychotherapist'].includes(h) || a === 'dentist' || s === 'optician' || s === 'beauty' || s === 'hairdresser') return 'clinic';
  if (['accountant', 'lawyer', 'estate_agent', 'architect', 'insurance', 'financial_advisor', 'consulting', 'it', 'surveyor', 'notary'].includes(o)) return 'professional';
  if (['hotel', 'guest_house', 'apartment', 'chalet', 'hostel', 'camp_site'].includes(t)) return 'hospitality';
  if (['fitness_centre', 'sports_centre', 'dance', 'horse_riding', 'golf_course', 'marina'].includes(l) || tags.club === 'sport') return 'fitness';
  if (s === 'charity' || o === 'charity' || o === 'ngo') return 'charity';
  if (s && !['supermarket', 'convenience', 'fuel', 'car', 'department_store', 'mobile_phone', 'bookmaker', 'pawnbroker'].includes(s)) return 'retail';
  return null;
};

/* one query per area keeps each response small and lets us record the county */
async function overpass(name) {
  const cache = `${RAW}/osm-${name.replace(/\W+/g, '-')}.json`;
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, 'utf8'));
  for (let attempt = 0; attempt < 5; attempt++) {
    const els = await overpassOnce(name);
    if (els.length) { fs.mkdirSync(RAW, { recursive: true }); fs.writeFileSync(cache, JSON.stringify(els)); return els; }
    await new Promise(r => setTimeout(r, 15000 * (attempt + 1)));
  }
  throw new Error('No data for ' + name);
}
async function overpassOnce(name) {
  const body = `[out:json][timeout:180];area["name"="${name}"]["boundary"="administrative"]->.a;
(nwr(area.a)["website"]["amenity"~"^(cafe|restaurant|pub|bar|dentist)$"];
 nwr(area.a)["website"]["shop"];
 nwr(area.a)["website"]["craft"];
 nwr(area.a)["website"]["office"~"^(accountant|lawyer|estate_agent|architect|insurance|financial_advisor|consulting|it|surveyor|notary|charity|ngo)$"];
 nwr(area.a)["website"]["healthcare"];
 nwr(area.a)["website"]["tourism"~"^(hotel|guest_house|apartment|chalet|hostel|camp_site)$"];
 nwr(area.a)["website"]["leisure"~"^(fitness_centre|sports_centre|dance|horse_riding|golf_course|marina)$"];
 nwr(area.a)["website"]["club"="sport"];);
out tags;`;
  for (const ep of ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
    try {
      const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'MinshallGroupResearch/1.0 (+https://minshallgroup.com)' }, body: 'data=' + encodeURIComponent(body) });
      if (r.ok) return (await r.json()).elements || [];
      console.error(name, ep, r.status);
    } catch (e) { console.error(name, ep, e.message); }
  }
  return [];
}

const SKIP = /(facebook|instagram|twitter|x\.com|linkedin|tripadvisor|booking\.com|airbnb|yell\.com|google\.|wixsite|nhs\.uk|gov\.uk|\.ac\.uk|police|council|wikipedia|linktr\.ee|ubereats|deliveroo|just-eat|youtube|tiktok)/i;
const domainOf = u => { try { return new URL(/^https?:/.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return null; } };

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; }; }

const rows = [];
for (const [label, name] of Object.entries(AREAS)) {
  const els = await overpass(name);
  console.log(label, els.length, 'places with a website');
  for (const e of els) {
    const t = e.tags || {}; const sector = SECTOR(t); const web = t.website || t['contact:website'];
    if (!sector || !web || SKIP.test(web) || t.brand || t['brand:wikidata']) continue;
    const d = domainOf(web); if (!d) continue;
    rows.push({ domain: d, url: /^https?:/.test(web) ? web : 'https://' + web, sector, county: COUNTY[label] || label, town: t['addr:city'] || t['addr:town'] || '', postcode: (t['addr:postcode'] || '').toUpperCase().trim() });
  }
  await new Promise(r => setTimeout(r, 4000)); /* be kind to the public Overpass servers */
}
/* chains: the same domain behind 3+ places */
const count = {}; rows.forEach(r => { count[r.domain] = (count[r.domain] || 0) + 1; });
const seen = new Set(); const pool = rows.filter(r => count[r.domain] < 3 && !seen.has(r.domain) && seen.add(r.domain));
const rand = rng(SEED); const bySector = {};
pool.forEach(r => (bySector[r.sector] ||= []).push(r));
const sample = Object.values(bySector).flatMap(list => list.map(r => [rand(), r]).sort((a, b) => a[0] - b[0]).slice(0, PER_SECTOR).map(x => x[1]));
fs.mkdirSync(RAW, { recursive: true });
fs.writeFileSync(`${RAW}/sample.json`, JSON.stringify({ created: new Date().toISOString(), mode: process.env.ALL ? 'all' : 'sample', pool: pool.length, poolBySector: Object.fromEntries(Object.entries(bySector).map(([k, v]) => [k, v.length])), sample }, null, 1));
console.log('pool', pool.length, Object.fromEntries(Object.entries(bySector).map(([k, v]) => [k, v.length])), 'sample', sample.length);
