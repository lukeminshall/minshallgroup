/* Scores every page of our own site with the Webmins check (live).
   node scripts/webmins-self.mjs [--psi]  ->  research/raw/webmins-self.json */
import fs from 'node:fs'; import { build } from 'esbuild'; import { pathToFileURL } from 'node:url';
import { runAudit } from '../api/audit.js';
await build({ entryPoints: ['src/webmins.ts'], bundle: true, format: 'esm', platform: 'node', outfile: 'research/raw/webmins.mjs', logLevel: 'error' });
const { score } = await import(pathToFileURL('research/raw/webmins.mjs').href);
const urls = [...fs.readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const psi = process.argv.includes('--psi'); const out = [];
let i = 0;
async function worker() { while (i < urls.length) { const u = urls[i++];
  const r = await runAudit(u, { psi }); if (r.status !== 200) { out.push({ u, err: r.body.error }); continue; }
  const b = r.body, s = score(b, b.industry);
  out.push({ u: u.replace('https://minshallgroup.com', '') || '/', total: s.total, ind: b.industry, p: b.pillars, fit: s.fit, miss: s.ess.filter(e => !e.ok).map(e => e.t), fails: b.checks.filter(c => !c.ok).map(c => c.id), sug: b.suggestions }); } }
await Promise.all(Array.from({ length: psi ? 3 : 6 }, worker));
out.sort((a, b) => (a.total ?? 0) - (b.total ?? 0));
fs.writeFileSync('research/raw/webmins-self.json', JSON.stringify(out, null, 1));
for (const r of out) console.log(String(r.total).padStart(3), r.u, r.ind, JSON.stringify(r.p), 'fit', r.fit, '| miss:', (r.miss || []).join('; '), '| fails:', (r.fails || []).join(','));
