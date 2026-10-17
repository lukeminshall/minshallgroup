/* =====================================================================
   RESEARCH — "The state of Yorkshire small business websites 2026".
   Renders the published aggregates in src/data/yorkshire-2026.json
   (built by scripts/research/analyse.mjs). Charts are plain SVG/CSS so
   the page stays fast and prints cleanly.
   ===================================================================== */
import Y from './data/yorkshire-2026.json';
import {dot} from './brand';
import {split} from './components';

export const RESEARCH_SLUG='state-of-yorkshire-small-business-websites-2026';
const bandCls=(v:number)=>v>=85?'ex':v>=70?'gd':v>=50?'nw':'fb';
const pc=(v:number|null)=>v==null?'–':`${v}%`;

function hist(){
  const max=Math.max(...Y.hist,1);
  return `<div class="rs-hist" role="img" aria-label="How the ${Y.reachable} sites scored, in bands of ten">
    ${Y.hist.map((n,i)=>`<div class="rs-hb ${bandCls(i*10+5)}" style="--h:${(n/max*100).toFixed(1)}%"><b>${n}</b><i></i><span>${i*10}${i===9?'+':''}</span></div>`).join('')}
  </div>`;
}
function bars(list:{t:string,pct:number|null}[],cls=''){
  return `<ul class="rs-bars ${cls}">${list.map(b=>`<li><span class="rs-bt">${b.t}</span><span class="rs-bv"><i style="--w:${b.pct??0}%"></i></span><b>${pc(b.pct)}</b></li>`).join('')}</ul>`;
}

export function researchPage(){
  const worst=Y.basics.slice(0,3),sec=Y.sectors,top=sec[0],bottom=sec[sec.length-1];
  const P:[string,string][]= [['experience','Experience'],['findability','Findability'],['trust','Trust'],['conversion','Conversion'],['modern','Modern & relevant']];
  const findings=[
    [`${Y.bands.behind+Y.bands.needs}%`,'of sites score below 70, the point where we would recommend a refresh.'],
    [`${Y.noForm}%`,'have no enquiry form on the homepage, so visitors who will not phone simply leave.'],
    [`${Y.noLd}%`,'give Google and AI assistants no structured information about the business.'],
    [`${Y.noAnalytics}%`,'have no visitor analytics, so the owner cannot see what is or is not working.']
  ];
  const share=encodeURIComponent('https://minshallgroup.com/insights/'+RESEARCH_SLUG);
  return `
<header class="rs-hero dark"><div class="grain" aria-hidden="true"></div><div class="wrap rs-hero-in">
  <div>
    <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb"><a href="/insights">Insights</a><span aria-hidden="true">/</span>Research</nav>
    <h1 class="display split rs-h">${split("The state of Yorkshire's small business websites",1)}${dot}</h1>
    <p class="lede rise" style="--i:6">We ran the Webmins check on ${Y.reachable} independent business websites across West, South, North and East Yorkshire, from cafés and shops to builders, clinics and charities. Here is what we found, sector by sector, and what to fix first.</p>
    <p class="rs-by rise" style="--i:7">Minshall Group research · October 2026 · ${Y.reachable} websites</p>
  </div>
  <div class="rs-dial rise" style="--i:4" aria-label="Average Webmins Score ${Y.avg} out of 100">
    <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" class="rs-d-bg"/><circle cx="100" cy="100" r="86" class="rs-d-fg" style="--v:${Y.avg}"/></svg>
    <div><b>${Y.avg}</b><span>average Webmins Score</span></div>
  </div>
</div></header>

<section class="rs-find"><div class="wrap">
  <h2 class="eyebrow">Four findings</h2>
  <div class="rs-cards">${findings.map(([n,t],i)=>`<div class="rs-card reveal" style="--i:${i}"><b>${n}</b><p>${t}</p></div>`).join('')}</div>
</div></section>

<section class="soft"><div class="wrap rs-split">
  <div class="reveal"><h2 class="eyebrow">The spread</h2><p class="rs-big">Most sites are not broken. They have just stopped keeping up.</p>
    <p class="rs-p">The median site scores ${Y.median}. Only ${Y.bands.excellent}% reach Excellent (85 or more), while ${Y.bands.behind}% are falling behind (under 50). The typical gap is not a missing website but missing basics: a way to enquire, a clear description for Google, and any idea of who visits.</p>
    <ul class="rs-key"><li class="ex">Excellent 85+ <b>${Y.bands.excellent}%</b></li><li class="gd">Good 70–84 <b>${Y.bands.good}%</b></li><li class="nw">Needs work 50–69 <b>${Y.bands.needs}%</b></li><li class="fb">Falling behind &lt;50 <b>${Y.bands.behind}%</b></li></ul>
  </div>
  <div class="reveal" style="--i:1">${hist()}<p class="rs-cap">Number of sites by Webmins Score</p></div>
</div></section>

<section><div class="wrap">
  <h2 class="eyebrow">Sector by sector</h2>
  <p class="rs-big">${top.t} lead. ${bottom.t} have furthest to go.</p>
  <div class="rs-league" data-league>
    ${sec.map((s,i)=>`<details class="rs-row reveal" style="--i:${i%4}">
      <summary><span class="rs-rank">${String(i+1).padStart(2,'0')}</span><span class="rs-st">${s.t}<small>${s.n} sites</small></span><span class="rs-sbar"><i class="${bandCls(s.avg)}" style="--w:${s.avg}%"></i></span><b class="rs-sv">${s.avg}</b></summary>
      <div class="rs-more"><div><h3>What customers expect, and how many sites have it</h3>${bars(s.ess)}</div>
        <div><h3>Pillars</h3>${bars(P.map(([k,t])=>({t,pct:(s.pillars as any)[k]})),'pillar')}<p class="rs-p sm">${s.bands.behind}% falling behind · ${s.bands.excellent}% excellent</p></div></div>
    </details>`).join('')}
  </div>
  <p class="rs-cap">Average Webmins Score by sector. Tap a sector for the detail.</p>
</div></section>

<section class="dark rs-basics"><div class="wrap rs-split">
  <div class="reveal"><h2 class="eyebrow">The basics</h2><p class="rs-big">The fixes that cost least are the ones most often missing.</p>
    <p class="rs-p">${worst.map(w=>`${100-(w.pct??0)}% have no ${w.t.toLowerCase()}`).join(', ')}. None of these needs a new website. Most take an afternoon.</p></div>
  <div class="reveal" style="--i:1">${bars(Y.basics)}<p class="rs-cap">Share of sites with each basic in place</p></div>
</div></section>

<section><div class="wrap rs-split">
  <div class="reveal"><h2 class="eyebrow">What 2026 expects</h2><p class="rs-big">The modern extras are still rare.</p>
    <p class="rs-p">Customers now expect to book, see reviews and get an answer without phoning. Search is changing too: AI assistants rely on structured data to describe a business accurately, and most sites give them nothing to work with.</p></div>
  <div class="reveal" style="--i:1">${bars(Y.extras)}<p class="rs-cap">Share of sites with each feature</p></div>
</div></section>

${Y.counties.some(c=>c.avg!=null)?`<section class="soft"><div class="wrap">
  <h2 class="eyebrow">Across the county</h2>
  <div class="rs-counties">${Y.counties.map((c,i)=>`<div class="rs-county reveal" style="--i:${i}"><span>${c.t}</span>${c.avg!=null?`<b>${c.avg}</b><small>${c.n} sites · ${c.behind}% falling behind</small>`:`<b class="na">–</b><small>Too few sites mapped to report fairly (${c.n})</small>`}</div>`).join('')}</div>
</div></section>`:''}

<section><div class="wrap rs-split">
  <div class="reveal"><h2 class="eyebrow">What to do about it</h2><p class="rs-big">Five fixes, in order.</p></div>
  <ol class="rs-fix reveal" style="--i:1">
    <li><b>Add a short enquiry form.</b> Many people will not phone or email, but they will fill in three fields.</li>
    <li><b>Write your search description.</b> Two lines that say what you do and where. It is the advert under your link.</li>
    <li><b>Install free analytics.</b> Microsoft Clarity or Google Analytics shows where visitors give up.</li>
    <li><b>Add structured data.</b> It tells Google and AI assistants your opening hours, location and services accurately.</li>
    <li><b>Show your reviews and keep the page current.</b> An old copyright year quietly says nobody is looking after the site.</li>
  </ol>
</div></section>

<section class="sme-band"><div class="wrap sme-band-in">
  <div class="reveal"><h2 class="eyebrow">How does yours compare?</h2><p class="h1">Get your own Webmins Score in 20 seconds.</p><p class="lede">Free, with the same check we used for this research, compared with your sector.</p></div>
  <form class="sme-check reveal" style="--i:1" action="/digitalsme" method="get" data-sme-jump>
    <label class="sr" for="rs-url">Your website address</label>
    <input id="rs-url" name="url" type="text" inputmode="url" placeholder="yourbusiness.co.uk" required>
    <button class="btn" type="submit"><span>Check my site</span></button>
  </form>
</div></section>

<section><div class="wrap rs-split">
  <div><h2 class="eyebrow">Method</h2><p class="rs-p">We drew the sample from OpenStreetMap, the open map of the world, taking places in West, South, North and East Yorkshire (including York and Hull) that list their own website. We excluded chains (a website shared by three or more places), public bodies and social media pages, leaving ${Y.pool.toLocaleString('en-GB')} independent businesses. We then took a random sample of up to 70 per sector.</p>
    <p class="rs-p">Each homepage was checked once in October 2026 by the Webmins Score, which looks at experience, findability, trust, conversion and how current a site is, plus what customers expect in that sector. ${Y.unreachable}% of listed websites did not load and are not scored. We checked the homepage only and did not run Google’s speed test, so results reflect what a visitor sees first rather than a full audit. No business is named.</p></div>
  <div><h2 class="eyebrow">Use this research</h2><p class="rs-p">You are welcome to quote and share these findings with a link to this page. Map data © OpenStreetMap contributors, available under the Open Database Licence.</p>
    <div class="rs-share"><a class="btn sm ghost" href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener"><span>Share on LinkedIn</span></a><a class="btn sm ghost" href="mailto:?subject=${encodeURIComponent(Y.title)}&body=${share}"><span>Email it</span></a></div>
    <p class="rs-p sm">Questions about the data, or want it for your area? <a class="ulink" href="/contact">Get in touch</a>.</p></div>
</div></section>`;
}
