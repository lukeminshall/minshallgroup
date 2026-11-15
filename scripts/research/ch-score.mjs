/* Webmins Score for Companies House contacts that have a website and email.
   Run: node scripts/research/ch-score.mjs   (re-run any time; it skips sites already scored)
   Same check as the Yorkshire research: homepage only, six at a time.
   Output: research/raw/ch/scores.jsonl, in the same shape as results.jsonl,
   so the outreach drafts can use the score and the sector-specific fixes. */
import fs from 'node:fs';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { runAudit } from '../../api/audit.js';

const DIR = 'research/raw/ch';
await build({ entryPoints: ['src/webmins.ts'], bundle: true, format: 'esm', platform: 'node', outfile: `${DIR}/webmins.mjs`, logLevel: 'error' });
const { score } = await import(pathToFileURL(`${DIR}/webmins.mjs`).href);

/* our Companies House categories -> the Webmins sector they are judged against */
const SECTOR = c => /builder|electrical|joinery|roofing|painting|glazing|landscap|garage|removals|cleaning|repairs|hire/i.test(c) ? 'trades'
  : /café|cater|baker/i.test(c) ? 'cafe' : /hair|dentist|clinic|vets/i.test(c) ? 'clinic' : /shop|garden|florist|laundry/i.test(c) ? 'retail'
  : /hotel/i.test(c) ? 'hospitality' : /sport|gym|leisure/i.test(c) ? 'fitness' : /professional|estate|photograph|tutor/i.test(c) ? 'professional' : 'other';

const out = `${DIR}/scores.jsonl`;
const done = new Set(fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(r => r.ok).map(r => r.website) : []);
const todo = [], seen = new Set();
for (const l of fs.readFileSync(`${DIR}/enriched.jsonl`, 'utf8').split('\n').filter(Boolean)) {
  const c = JSON.parse(l);
  if (!c.website || !c.email || done.has(c.website) || seen.has(c.website)) continue;
  seen.add(c.website); todo.push(c);
}
console.log('to score', todo.length, 'already', done.size);
let i = 0, n = 0;
async function worker() {
  while (i < todo.length) {
    const c = todo[i++]; const sector = SECTOR(c.category);
    let row = { website: c.website, company_number: c.company_number, sector, at: new Date().toISOString() };
    try {
      const r = await Promise.race([runAudit('https://' + c.website, { psi: false }), new Promise(res => setTimeout(() => res({ status: 599, body: { error: 'timeout' } }), 30000))]);
      if (r.status === 200) {
        const b = r.body, sc = score(b, sector);
        row = { ...row, ok: true, total: sc.total, grade: sc.grade, fit: sc.fit, pillars: b.pillars, checks: Object.fromEntries(b.checks.map(x => [x.id, x.ok])), signals: b.signals, ess: sc.ess.map(e => [e.t, e.ok]) };
      } else row = { ...row, ok: false, error: r.body?.error || String(r.status) };
    } catch (e) { row = { ...row, ok: false, error: e.message }; }
    fs.appendFileSync(out, JSON.stringify(row) + '\n');
    if (++n % 25 === 0) console.log(n, '/', todo.length);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log('finished', n);
