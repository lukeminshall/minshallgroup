/* Social pack generator.
   Turns an insight article into ready-to-post drafts for LinkedIn and
   Instagram: post copy plus images in the house style. Nothing is posted;
   everything lands in marketing/social/<slug>/ for review.

   Usage:
     node scripts/social.mjs                 newest article
     node scripts/social.mjs <slug> [<slug>]  specific articles
     node scripts/social.mjs --all           every article

   Every figure in the copy and on the cards comes from the article's own
   stats, which carry their sources. */
import {build} from 'esbuild';
import {mkdirSync, writeFileSync, rmSync, copyFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SITE = 'https://minshallgroup.com';
const OUT = 'marketing/social';
const FONT = pathToFileURL(resolve('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2')).href;

const tmp = join(tmpdir(), 'minshall-social-' + process.pid + '.mjs');
await build({stdin: {contents: "export {INSIGHTS} from './src/content'; export {M_PATH} from './src/brand';", resolveDir: '.', loader: 'ts'},
  bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'warning'});
const {INSIGHTS, M_PATH} = await import(pathToFileURL(tmp).href);
rmSync(tmp);

const args = process.argv.slice(2);
const byDate = [...INSIGHTS].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const picks = args.includes('--all') ? byDate
  : args.length ? args.map(s => INSIGHTS.find(i => i.slug === s) || (() => { throw new Error('No article with slug ' + s); })())
  : byDate.slice(0, 1);

const TAGS = {
  strategy: ['#Strategy', '#UKBusiness'], digital: ['#SmallBusiness', '#WebDesign'], 'data-ai': ['#AI', '#Data'], brand: ['#Brand', '#Marketing']
};
const KEYWORDS = [[/NHS|health|patient|clinic|MSK|care/i, '#Healthcare'], [/sport|activity|leisure|participation/i, '#Sport'],
  [/high street|town|place|BID|council|events/i, '#PlaceMaking'], [/Yorkshire/i, '#Yorkshire'], [/North East/i, '#NorthEast']];
function hashtags(a) {
  const text = a.t + ' ' + a.d, set = new Set();
  KEYWORDS.forEach(([re, tag]) => re.test(text) && set.add(tag));
  (TAGS[a.cap] || []).forEach(t => set.add(t));
  return [...set].slice(0, 4);
}

/* headline for the card: the part before a colon if the title is long */
const short = t => (t.length > 70 && t.includes(':')) ? t.split(':')[0] : t;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = s => s.replace(/\s*\(([^)]*)\)\s*$/, ''); /* stat label without its trailing bracket (usually, not always, the source) */
const source = s => (s.match(/\(([^)]*)\)\s*$/) || [])[1];

function linkedinCopy(a) {
  const url = `${SITE}/insights/${a.slug}`, st = a.stats || [];
  const lines = [];
  lines.push(st[0] ? `${st[0].n}: ${st[0].l}.` : short(a.t) + '.');
  lines.push('', a.d);
  if (st.length > 1) {
    lines.push('', 'Also in the piece:');
    st.slice(1, 4).forEach(s => lines.push(`• ${s.n}: ${s.l}`));
  }
  lines.push('', `Read it, with sources: ${url}`, '', hashtags(a).join(' '));
  return lines.join('\n');
}

function instagramCopy(a) {
  const st = a.stats || [];
  const lines = [short(a.t), '', a.d];
  if (st.length) { lines.push(''); st.slice(0, 3).forEach(s => lines.push(`▪️ ${s.n}: ${s.l}`)); }
  lines.push('', 'Full article, with every source, at the link in our bio or minshallgroup.com/insights', '', [...hashtags(a), '#MinshallGroup'].join(' '));
  return lines.join('\n');
}

const tileSvg = s => `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#fff"/><path d="${M_PATH}" fill="none" stroke="#0A1A3F" stroke-width="11"/><rect x="75" y="61" width="11" height="11" fill="#FF2E63"/></svg>`;

function cardHtml(a, w, h) {
  const st = (a.stats || [])[0], tall = h > w, pad = Math.round(w * 0.075);
  const headSize = tall ? 96 : 62, numSize = tall ? 170 : 96;
  const words = esc(short(a.t)).split(' '), last = words.pop();
  const head = `${words.join(' ')} <span style="white-space:nowrap">${last}<i></i></span>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:A;src:url(${FONT}) format('woff2');font-weight:100 900;font-stretch:62% 125%}
*{margin:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:#0A1A3F;color:#fff;font-family:A,sans-serif;padding:${pad}px;display:flex;flex-direction:column;position:relative}
body:after{content:'';position:absolute;right:-${w * .18}px;top:-${w * .18}px;width:${w * .55}px;height:${w * .55}px;border-radius:50%;background:radial-gradient(circle,rgba(255,46,99,.28),transparent 68%);z-index:0}
body>*{position:relative;z-index:1}
.lede{font-size:30px;line-height:1.45;color:rgba(255,255,255,.78);margin-top:40px;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
.eb{font-size:${tall ? 26 : 20}px;letter-spacing:.14em;text-transform:uppercase;color:#FF2E63;font-weight:700;margin-bottom:${tall ? 34 : 22}px}
h1{font-size:${headSize}px;line-height:1.04;font-weight:800;font-variation-settings:'wdth' 112;letter-spacing:-.01em;max-width:${tall ? 'none' : '78%'}}
h1 i{display:inline-block;width:.17em;height:.17em;background:#FF2E63;margin-left:.06em}
.st{margin-top:auto;padding-top:${tall ? 40 : 24}px;border-top:2px solid rgba(255,255,255,.16);display:${st ? 'block' : 'none'}}
.n{font-size:${numSize}px;font-weight:800;font-variation-settings:'wdth' 112;color:#FF2E63;line-height:1}
.l{font-size:${tall ? 28 : 21}px;line-height:1.35;color:rgba(255,255,255,.82);margin-top:12px;max-width:${tall ? 'none' : '70%'}}
.src{display:block;font-size:.72em;color:rgba(255,255,255,.55);margin-top:8px}
.ft{display:flex;align-items:center;gap:16px;margin-top:${tall ? 54 : 26}px;font-size:${tall ? 24 : 19}px;color:rgba(255,255,255,.7)}
.ft b{color:#fff;font-weight:700;font-size:${tall ? 30 : 23}px}.ft span{margin-left:auto}
</style></head><body>
<div class="eb">${esc(a.tag || 'Insight')}</div>
<h1>${head}</h1>
${tall ? `<p class="lede">${esc(a.d)}</p>` : ''}
${st ? `<div class="st"><div class="n">${esc(st.n)}</div><div class="l">${esc(clean(st.l))}${source(st.l) ? `<span class="src">${esc(source(st.l))}</span>` : ''}</div></div>` : ''}
<div class="ft" style="${st ? '' : 'margin-top:auto'}">${tileSvg(tall ? 56 : 44)}<b>Minshall Group</b><span>minshallgroup.com/insights</span></div>
</body></html>`;
}

function shoot(html, w, h, file) {
  const page = join(tmpdir(), `minshall-card-${process.pid}.html`);
  writeFileSync(page, html);
  const run = () => execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb',
    `--window-size=${w},${h}`, `--screenshot=${resolve(file)}`, '--virtual-time-budget=2000', pathToFileURL(page).href], {stdio: 'ignore'});
  /* headless Chrome occasionally exits early; one retry is enough */
  try { run(); } catch { run(); }
  rmSync(page);
}

for (const a of picks) {
  const dir = join(OUT, a.slug);
  mkdirSync(dir, {recursive: true});
  writeFileSync(join(dir, 'linkedin.txt'), linkedinCopy(a) + '\n');
  writeFileSync(join(dir, 'instagram.txt'), instagramCopy(a) + '\n');
  shoot(cardHtml(a, 1200, 627), 1200, 627, join(dir, 'linkedin-1200x627.png'));
  shoot(cardHtml(a, 1080, 1350), 1080, 1350, join(dir, 'instagram-1080x1350.png'));
  /* public copies: Buffer fetches images from a public URL, so these ship with the site */
  const pub = join('public/social', a.slug);
  mkdirSync(pub, {recursive: true});
  copyFileSync(join(dir, 'linkedin-1200x627.png'), join(pub, 'linkedin.png'));
  copyFileSync(join(dir, 'instagram-1080x1350.png'), join(pub, 'instagram.png'));
  console.log('✓', dir);
}
