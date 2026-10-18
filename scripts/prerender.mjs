/* Build-time prerenderer.
   After `vite build`, this bundles the DOM-free page code, renders every
   canonical route to a static HTML file (dist/<route>/index.html) with the
   right title/description/canonical/OG tags baked in, and regenerates
   sitemap.xml. Deep links and crawlers now get real per-page HTML; the
   client router hydrates on top. Run via the `build` npm script. */
import {build} from 'esbuild';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';

const DIST = 'dist';

/* 1. Bundle the pure entry so we can import it in Node. */
const tmp = join(tmpdir(), 'minshall-prerender-' + process.pid + '.mjs');
await build({
  entryPoints: ['src/prerender-entry.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: tmp,
  logLevel: 'warning'
});
const {P, ROUTES, SITE, DEFAULT_TITLE, DEFAULT_DESC, navMarkup, mobileNavMarkup, footerMarkup, tile} = await import(pathToFileURL(tmp).href);

/* 2. Read the built shell (index.html with hashed asset tags injected). */
let shell = readFileSync(join(DIST, 'index.html'), 'utf8');
/* preload the headline and body fonts so text paints in the right face */
import {readdirSync} from 'node:fs';
const assets = readdirSync(join(DIST, 'assets'));
const pre = [/^fraunces-latin-opsz-normal.*\.woff2$/, /^manrope-latin-wght-normal.*\.woff2$/]
  .map(re => assets.find(f => re.test(f))).filter(Boolean)
  .map(f => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`).join('\n');
shell = shell.replace('</head>', pre + '\n</head>');
/* inline the stylesheet: phones then paint without waiting for a second request */
shell = shell.replace(/<link rel="stylesheet"[^>]*href="\/assets\/([^"]+\.css)"[^>]*>/, (m, f) => `<style>${readFileSync(join(DIST, 'assets', f), 'utf8').replace(/<\/style/gi, '<\\/style')}</style>`);
/* bake the header, mobile menu and footer into the shell once */
shell = shell
  .replace('<span id="brand-tile"></span>', () => `<span id="brand-tile">${tile()}</span>`)
  .replace(/<nav class="primary" id="nav"([^>]*)><\/nav>/, (m, a) => `<nav class="primary" id="nav"${a}>${navMarkup()}</nav>`)
  .replace(/<div class="mnav" id="mnav" hidden><\/div>/, () => `<div class="mnav" id="mnav" hidden>${mobileNavMarkup()}</div>`)
  .replace(/<footer class="site-foot" id="site-foot"><\/footer>/, () => `<footer class="site-foot" id="site-foot">${footerMarkup()}</footer>`);

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function replaceAttr(doc, pattern, value) {
  return doc.replace(pattern, (m, a, b) => a + esc(value) + b);
}

function renderRoute(path) {
  const meta = ROUTES[path] || {title: 'Page not found | Minshall Group'};
  const title = meta.title || DEFAULT_TITLE;
  const desc = meta.description || DEFAULT_DESC;
  const url = SITE + (path === '/' ? '/' : path);
  let doc = shell;
  /* inject rendered page markup into the empty app root */
  doc = doc.replace(/<main id="app">[\s\S]*?<\/main>/, () => `<main id="app">${P[path]()}</main>`);
  /* title + per-page meta */
  doc = doc.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  doc = replaceAttr(doc, /(<meta name="description" content=")[\s\S]*?(">)/, desc);
  doc = replaceAttr(doc, /(<link rel="canonical" href=")[\s\S]*?(">)/, url);
  doc = replaceAttr(doc, /(<meta property="og:url" content=")[\s\S]*?(">)/, url);
  doc = replaceAttr(doc, /(<meta property="og:title" content=")[\s\S]*?(">)/, title);
  doc = replaceAttr(doc, /(<meta property="og:description" content=")[\s\S]*?(">)/, desc);
  doc = replaceAttr(doc, /(<meta name="twitter:title" content=")[\s\S]*?(">)/, title);
  doc = replaceAttr(doc, /(<meta name="twitter:description" content=")[\s\S]*?(">)/, desc);
  if (meta.noindex) doc = doc.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>');
  return doc;
}

const routes = Object.keys(ROUTES);
/* 404 page for hosts that serve dist/404.html */
writeFileSync(join(DIST, '404.html'), renderRoute('/404').replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex">'));
for (const path of routes) {
  const out = path === '/' ? join(DIST, 'index.html') : join(DIST, path.slice(1), 'index.html');
  mkdirSync(dirname(out), {recursive: true});
  writeFileSync(out, renderRoute(path));
}

/* 3. Regenerate sitemap.xml from the canonical route list. */
const urls = routes.filter(p => !ROUTES[p].noindex).map(p => {
  const loc = SITE + (p === '/' ? '/' : p);
  const priority = p === '/' ? '1.0' : (p === '/healthcare-consultancy' || p === '/digital-consultancy') ? '0.9' : p === '/privacy' ? '0.3' : '0.8';
  const lastmod = new Date().toISOString().slice(0, 10);
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}).join('\n');
writeFileSync(join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

console.log(`prerendered ${routes.length} routes + sitemap`);
