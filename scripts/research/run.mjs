/* Runs the Webmins check over research/raw/sample.json.
   Homepage only, six at a time, identifying itself as our site check.
   Output: research/raw/results.jsonl (one line per site, resumable). */
import fs from 'node:fs';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { runAudit } from '../../api/audit.js';
const RAW = process.env.REGION && process.env.REGION !== 'yorkshire' ? `research/raw/${process.env.REGION}` : 'research/raw';

await build({ entryPoints: ['src/webmins.ts'], bundle: true, format: 'esm', platform: 'node', outfile: `${RAW}/webmins.mjs`, logLevel: 'error' });
const { score } = await import(pathToFileURL(`${RAW}/webmins.mjs`).href);

const { sample } = JSON.parse(fs.readFileSync(`${RAW}/sample.json`, 'utf8'));
const out = `${RAW}/results.jsonl`;
const done = new Set(fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l).domain) : []);
const todo = sample.filter(s => !done.has(s.domain));
console.log('to check', todo.length, 'already', done.size);
let i = 0, n = 0;
async function worker() {
  while (i < todo.length) {
    const s = todo[i++];
    let row = { ...s, at: new Date().toISOString() };
    try {
      const r = await Promise.race([runAudit(s.url, { psi: false }), new Promise(res => setTimeout(() => res({ status: 599, body: { error: 'timeout' } }), 30000))]);
      if (r.status === 200) {
        const b = r.body, sc = score(b, s.sector);
        row = { ...row, ok: true, final: b.url, total: sc.total, grade: sc.grade, fit: sc.fit, pillars: b.pillars, checks: Object.fromEntries(b.checks.map(c => [c.id, c.ok])), signals: b.signals, ess: sc.ess.map(e => [e.t, e.ok]) };
      } else row = { ...row, ok: false, error: r.body?.error || String(r.status) };
    } catch (e) { row = { ...row, ok: false, error: e.message }; }
    fs.appendFileSync(out, JSON.stringify(row) + '\n');
    if (++n % 25 === 0) console.log(n, '/', todo.length);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log('finished', n);
