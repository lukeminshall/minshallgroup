/* Site audit over the built pages in dist/: titles, descriptions, headings,
   canonical, share image, image alt text and broken internal links.
   Run after `npm run build`: node scripts/audit-site.mjs */
import fs from 'node:fs'; import path from 'node:path';
const D = 'dist';
const pages = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!p.includes('assets')) walk(p); } else if (f === 'index.html') pages.push(p); } })(D);
const exists = href => {
  const u = href.split('#')[0].split('?')[0]; if (!u || u === '/') return true;
  const c = [path.join(D, u), path.join(D, u, 'index.html'), path.join(D, u + '.html'), path.join('public', u)];
  return c.some(x => fs.existsSync(x) && (fs.statSync(x).isFile() || fs.existsSync(path.join(x, 'index.html'))));
};
const rows = [], broken = new Map();
for (const p of pages) {
  const h = fs.readFileSync(p, 'utf8'), route = '/' + path.relative(D, path.dirname(p)).replace(/\\/g, '/');
  const r = route === '/.' ? '/' : route;
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  const t = title.replace(/&amp;/g, '&'), dd = desc.replace(/&amp;/g, '&');
  const app = h.includes('id="app"') ? h.slice(h.indexOf('id="app"')) : h;
  const h1 = (app.match(/<h1[\s>]/g) || []).length;
  const imgs = (app.match(/<img\b[^>]*>/g) || []), noAlt = imgs.filter(i => !/\salt=/.test(i)).length;
  const noindex = /name="robots" content="noindex/.test(h);
  const issues = [];
  if (!noindex) {
    if (t.length < 25 || t.length > 65) issues.push(`title ${t.length} chars`);
    if (dd.length < 70 || dd.length > 160) issues.push(`description ${dd.length} chars`);
    if (!/rel="canonical"/.test(h)) issues.push('no canonical');
    if (!/og:image/.test(h)) issues.push('no share image');
  }
  if (h1 !== 1) issues.push(`${h1} h1`);
  if (noAlt) issues.push(`${noAlt} images without alt`);
  for (const m of h.matchAll(/href="(\/[^"]*)"/g)) { const href = m[1]; if (href.startsWith('//') || /\.(css|js|woff2|png|svg|ico|webp|jpg)$/.test(href.split('?')[0])) continue; if (!exists(href)) { if (!broken.has(href)) broken.set(href, new Set()); broken.get(href).add(r); } }
  rows.push({ route: r, title: t, tLen: t.length, dLen: dd.length, h1, noindex, issues });
}
rows.sort((a, b) => a.route.localeCompare(b.route));
const out = { pages: rows.length, withIssues: rows.filter(r => r.issues.length).length, rows, broken: [...broken].map(([href, from]) => ({ href, from: [...from].slice(0, 5) })) };
fs.writeFileSync('research/raw/site-audit.json', JSON.stringify(out, null, 1));
console.log('pages', out.pages, 'with issues', out.withIssues, 'broken links', out.broken.length);
rows.filter(r => r.issues.length).forEach(r => console.log(' ', r.route, '|', r.issues.join(', '), '|', r.title));
out.broken.forEach(b => console.log(' BROKEN', b.href, '<-', b.from.join(' ')));
