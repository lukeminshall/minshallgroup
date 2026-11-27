/* Posting calendar for the social packs.
   Spreads every insight across Tuesday, Wednesday and Thursday mornings,
   rotating topics so the feed never runs two of a kind in a row, and
   writes marketing/social/schedule.json plus a preview page
   (marketing/social/preview/index.html) showing every post.

   Usage: node scripts/social-calendar.mjs [start YYYY-MM-DD]   (default: next Tuesday) */
import {build} from 'esbuild';
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';

const tmp = join(tmpdir(), 'minshall-cal-' + process.pid + '.mjs');
await build({stdin: {contents: "export {INSIGHTS} from './src/content';", resolveDir: '.', loader: 'ts'}, bundle: true, format: 'esm', platform: 'node', outfile: tmp, logLevel: 'warning'});
const {INSIGHTS} = await import(pathToFileURL(tmp).href);
rmSync(tmp);

/* articles that already have LinkedIn drafts in marketing/ may have been posted, so they go last and are flagged */
const earlier = ['marketing/launch-posts.md', 'marketing/linkedin/posts-research-oct-2026.md']
  .filter(existsSync).map(f => readFileSync(f, 'utf8')).join('\n');

const TOPICS = [
  ['Sport and activity', /sport|leisure|participation/],
  ['Health', /nhs|health|patient|care|elective|pmi|self-pay|clinic|waiting/],
  ['Places', /high-street|town|events/],
  ['Small business', /website|webmins|cafe|trades|cookie|hospitality|ai-search/],
  ['Minshall Group', /./]
];
const topic = a => TOPICS.find(([, re]) => re.test(a.slug))[0];

/* articles left out of the calendar on purpose */
const SKIP = ['questions-to-ask-before-signing-a-clinic-lease'];

const items = [...INSIGHTS].filter(a => !SKIP.includes(a.slug)).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  .map(a => ({slug: a.slug, title: a.t, tag: a.tag, topic: topic(a), published: a.date, check: earlier.includes('insights/' + a.slug)}));

/* newest first, but never two of the same topic in a row when another is waiting */
function rotate(list) {
  const left = [...list], out = [];
  while (left.length) {
    const last = out.at(-1)?.topic;
    const i = Math.max(0, left.findIndex(x => x.topic !== last));
    out.push(left.splice(i, 1)[0]);
  }
  return out;
}
const order = [...rotate(items.filter(i => !i.check)), ...rotate(items.filter(i => i.check))];

/* Tue/Wed/Thu at 08:00 UK time, skipping the Christmas fortnight */
const startArg = process.argv[2];
let d = startArg ? new Date(startArg + 'T12:00:00Z') : new Date();
if (!startArg) do d.setUTCDate(d.getUTCDate() + 1); while (d.getUTCDay() !== 2);
const quiet = s => s >= '2026-12-19' && s <= '2027-01-04';
const slots = [];
while (slots.length < order.length) {
  const s = d.toISOString().slice(0, 10);
  if ([2, 3, 4].includes(d.getUTCDay()) && !quiet(s)) slots.push(s);
  d.setUTCDate(d.getUTCDate() + 1);
}
const schedule = order.map((it, i) => ({date: slots[i], time: '08:00', ...it}));
writeFileSync('marketing/social/schedule.json', JSON.stringify(schedule, null, 1) + '\n');

/* preview page */
const out = 'marketing/social/preview';
mkdirSync(join(out, 'img'), {recursive: true});
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = s => new Date(s + 'T12:00:00Z').toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC'});
const rows = schedule.map((p, i) => {
  copyFileSync(`public/social/${p.slug}/linkedin.png`, join(out, 'img', p.slug + '-li.png'));
  copyFileSync(`public/social/${p.slug}/instagram.png`, join(out, 'img', p.slug + '-ig.png'));
  const li = readFileSync(`marketing/social/${p.slug}/linkedin.txt`, 'utf8').trim();
  const ig = readFileSync(`marketing/social/${p.slug}/instagram.txt`, 'utf8').trim();
  return `<article class="post" data-topic="${esc(p.topic)}">
  <div class="when"><b>${fmt(p.date)}</b><span>${p.time} · #${i + 1}</span></div>
  <div class="body">
   <p class="meta">${esc(p.topic)}${p.check ? ' · <em>Drafted for LinkedIn in October: check it wasn’t posted already</em>' : ''}</p>
   <h2>${esc(p.title)}</h2>
   <div class="imgs"><img src="img/${p.slug}-li.png" alt="LinkedIn image" loading="lazy" class="li"><img src="img/${p.slug}-ig.png" alt="Instagram image" loading="lazy" class="ig"></div>
   <div class="copy">
    <details><summary>LinkedIn text</summary><pre>${esc(li)}</pre><button type="button" data-copy>Copy</button></details>
    <details><summary>Instagram caption</summary><pre>${esc(ig)}</pre><button type="button" data-copy>Copy</button></details>
   </div>
  </div>
 </article>`;
}).join('\n');
const counts = TOPICS.map(([t]) => [t, schedule.filter(p => p.topic === t).length]).filter(([, n]) => n);
const first = schedule[0].date, lastD = schedule.at(-1).date;

writeFileSync(join(out, 'index.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Minshall Group posting calendar</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&display=swap" rel="stylesheet">
<style>
/* VOICE: the house style of minshallgroup.com, plain and confident
   IDEA: an editorial planner, one row per post with its date hanging left
   PICTURE: the post images themselves, at real proportions
   COLOUR and TYPE: navy band, pink accent, white body; Archivo wide for headings
   LAYOUT: navy header with the summary, then a list of dated rows, filter chips on top */
:root{color-scheme:light dark;--bg:light-dark(#fff,#0A1A3F);--ink:light-dark(#14171A,#fff);--ink2:light-dark(#3A4152,rgba(255,255,255,.8));--line:light-dark(#E2E5EE,rgba(255,255,255,.14));--soft:light-dark(#F3F4F8,#0E2250);--pink:#D6164B;--navy:#0A1A3F}
:root[data-theme=light]{color-scheme:light}:root[data-theme=dark]{color-scheme:dark;--pink:#FF2E63}
*{box-sizing:border-box;min-width:0}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 Archivo,system-ui,sans-serif;overflow-x:clip}
.band{padding:clamp(28px,4vw,56px) max(5vw,16px)}
header{background:var(--navy);color:#fff}
header h1{font-size:clamp(32px,5vw,52px);line-height:1.05;margin:0 0 14px;font-stretch:112%;font-weight:800;text-wrap:balance;max-width:20ch}
header h1 i{display:inline-block;width:.17em;height:.17em;background:#FF2E63;margin-left:.05em}
header p{margin:0;max-width:62ch;color:rgba(255,255,255,.82);font-size:17px}
.facts{display:flex;flex-wrap:wrap;gap:12px 32px;margin-top:24px}
.facts div b{display:block;font-size:30px;font-weight:800;font-stretch:112%;color:#FF2E63;line-height:1.1}
.facts div{font-size:14px;color:rgba(255,255,255,.7)}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding-top:20px;padding-bottom:0}
.chips button{font:inherit;font-size:15px;min-height:44px;padding:0 16px;border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;cursor:pointer}
.chips button[aria-pressed=true]{background:var(--navy);color:#fff;border-color:var(--navy)}
:root[data-theme=dark] .chips button[aria-pressed=true]{background:#fff;color:var(--navy)}
.list{max-width:1240px;margin:0 auto}
.post{display:grid;grid-template-columns:150px minmax(0,1fr);gap:24px;padding:28px 0;border-top:1px solid var(--line)}
.post[hidden]{display:none}
.when b{display:block;font-size:22px;font-weight:800;font-stretch:112%;white-space:nowrap}
.when span{color:var(--ink2);font-size:14px;white-space:nowrap}
.meta{margin:0 0 4px;font-size:14px;color:var(--pink);font-weight:600}
.meta em{font-style:normal;color:var(--ink2);font-weight:400}
h2{font-size:22px;line-height:1.2;margin:0 0 16px;max-width:60ch;text-wrap:balance}
.imgs{display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap}
.imgs img{display:block;border-radius:4px;box-shadow:0 1px 3px rgba(10,26,63,.18)}
.imgs .li{width:min(100%,420px);aspect-ratio:1200/627}
.imgs .ig{width:min(42%,176px);aspect-ratio:1080/1350}
.copy{display:flex;flex-direction:column;gap:6px;margin-top:14px;max-width:720px}
details{border:1px solid var(--line);border-radius:4px;background:var(--soft)}
summary{cursor:pointer;padding:10px 14px;font-weight:600;min-height:44px;display:flex;align-items:center}
summary:focus-visible,button:focus-visible{outline:2px solid var(--pink);outline-offset:2px}
pre{white-space:pre-wrap;font:15px/1.55 Archivo,system-ui,sans-serif;margin:0;padding:0 14px 8px;color:var(--ink2)}
details button{margin:0 14px 12px;font:inherit;font-size:14px;min-height:40px;padding:0 16px;border:0;border-radius:4px;background:var(--pink);color:#fff;cursor:pointer}
.note{font-size:14px;color:var(--ink2);max-width:70ch}
@media(max-width:600px){.post{grid-template-columns:minmax(0,1fr);gap:10px}.when b{display:inline;margin-right:10px}}
</style></head><body>
<header class="band">
 <h1>${schedule.length} posts for LinkedIn and Instagram<i></i></h1>
 <p>Every Minshall Group insight article as a ready post, three mornings a week from ${fmt(first)} to ${fmt(lastD)}, with a break over Christmas. Each one goes to Buffer as a draft first, so nothing is published until you approve it.</p>
 <div class="facts">${counts.map(([t, n]) => `<div><b>${n}</b>${esc(t)}</div>`).join('')}</div>
</header>
<nav class="band chips" aria-label="Filter by topic"><button type="button" aria-pressed="true" data-f="">All</button>${counts.map(([t]) => `<button type="button" aria-pressed="false" data-f="${esc(t)}">${esc(t)}</button>`).join('')}</nav>
<main class="band list">
${rows}
<p class="note">Times are UK time. Every figure in the posts is taken word for word from the article, which lists its sources. Dates are a suggestion: any post can move.</p>
</main>
<script>{
const posts=[...document.querySelectorAll('.post')];
document.querySelectorAll('.chips button').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.chips button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  posts.forEach(p=>p.hidden=!!b.dataset.f&&p.dataset.topic!==b.dataset.f);
}));
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(b.previousElementSibling.textContent);b.textContent='Copied'}catch{b.textContent='Select the text to copy'}
  setTimeout(()=>b.textContent='Copy',2000);
}));
}</script>
</body></html>
`);
console.log(`${schedule.length} posts, ${first} to ${lastD}`);
counts.forEach(([t, n]) => console.log(' ', n, t));
