/* =====================================================================
   PRODUCT DEMOS — a sample DataLense catchment report and a live
   Straight Talking demo. All data here is illustrative, for a fictional
   site and cohort, and every page says so. Each page has a self-playing
   tour (?tour=1 starts it on load, which is how the demo videos are made).
   ===================================================================== */
import {dot} from './brand';
import {split} from './components';

const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* smooth closed blob around a centre, deterministic from a seed */
function blob(cx:number,cy:number,r:number,wob:number,seed:number,n=9){
  const pts:[number,number][]=[];
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const k=1+wob*Math.sin(seed*1.7+i*2.3)+wob*.6*Math.cos(seed*.9+i*1.3);pts.push([cx+Math.cos(a)*r*k,cy+Math.sin(a)*r*k*.86]);}
  let d='';for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
    if(!i)d+=`M${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
    const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=`C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;}
  return d+'Z';
}

/* ---------------- DATALENSE ---------------- */
const DL={
  site:'Proposed MSK and physiotherapy clinic, Riverside Business Park',
  town:'Riverside (a fictional town)',
  score:72,pop:'186,400',over65:'21%',comp:9,coverage:94,
  competitors:[
    {n:'Provider A',t:'Independent physio',d:'1.8 mi',m:6,w:'High'},
    {n:'Provider B',t:'Private hospital outpatients',d:'4.2 mi',m:11,w:'Medium'},
    {n:'Provider C',t:'Chain MSK clinic',d:'5.0 mi',m:12,w:'Low'},
    {n:'Provider D',t:'NHS community MSK',d:'2.6 mi',m:8,w:'Very high'},
    {n:'Provider E',t:'Sports injury clinic',d:'7.9 mi',m:17,w:'Medium'},
    {n:'Provider F',t:'Osteopath and chiro',d:'3.1 mi',m:9,w:'Low'}
  ],
  /* ranked deviation from comparison catchments, in % */
  health:[['Musculoskeletal conditions',18],['Aged 65 and over',11],['Car dependency',12],['Long-term disability',6],['Physically active adults',-7],['Diabetes',-3],['Deprivation (IMD)',-9]],
  workforce:[['Physiotherapists per 10,000 people',3.1,4.2,'Below the comparison average: plan recruitment early.'],['Vacancy pressure (adverts per post)',1.6,1.2,'Moderate competition for staff.'],['Sports therapists within 30 min',38,29,'A good pool for sports massage and rehab.']],
  trend:[42,45,47,51,49,55,61,66],
  checks:[['Drivetime catchment','ok','Resolved for 10, 20 and 30 minutes.'],['Provider register','ok','Matched 9 providers within 30 minutes.'],['Census population','ok','All output areas resolved.'],['Waiting-time pressure','part','Partial: one provider reports at trust level only, so it is shown but not scored.'],['Insurer network coverage','none','Not available for this catchment. Left blank rather than estimated.']]
};

function dlMap(){
  const cx=300,cy=210;
  let grid='';for(let x=20;x<=580;x+=40)for(let y=20;y<=400;y+=40)grid+=`<circle cx="${x}" cy="${y}" r="1.1" class="dm-g"/>`;
  const comps=[[214,150,'A'],[402,180,'B'],[456,282,'C'],[250,276,'D'],[118,338,'E'],[352,112,'F']];
  return `<svg class="dm-svg" viewBox="0 0 600 420" role="img" aria-label="Map of the 10, 20 and 30 minute drivetime catchments around the proposed site, with six nearby providers">
    ${grid}
    <path class="dm-road" d="M0,250 C150,230 230,200 300,210 S470,170 600,120"/><path class="dm-road" d="M260,0 C280,120 300,160 300,210 S330,330 360,420"/><path class="dm-road thin" d="M60,60 C180,140 240,170 300,210"/>
    <path class="dm-iso i30" d="${blob(cx,cy,200,.12,4)}"/><path class="dm-iso i20" d="${blob(cx,cy,140,.13,9)}"/><path class="dm-iso i10" d="${blob(cx,cy,78,.12,15)}"/>
    <text class="dm-l" x="${cx+10}" y="${cy-60}">10 min</text><text class="dm-l" x="${cx+10}" y="${cy-118}">20 min</text><text class="dm-l" x="${cx+10}" y="${cy-168}">30 min</text>
    ${comps.map(([x,y,k],i)=>`<g class="dm-c" data-tip="${k}" style="--d:${i*120}ms" tabindex="0"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${(y as number)+4}">${k}</text></g>`).join('')}
    <g class="dm-site"><circle cx="${cx}" cy="${cy}" r="26" class="dm-pulse"/><circle cx="${cx}" cy="${cy}" r="9"/></g>
  </svg>`;
}
function dlTrend(){
  const v=DL.trend,w=520,h=160,max=Math.max(...v)*1.1;const pts=v.map((y,i)=>[20+i*(w-40)/(v.length-1),h-20-(y/max)*(h-40)]);
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  return `<svg class="dl-trend" viewBox="0 0 ${w} ${h}" role="img" aria-label="Self-pay MSK demand index rising from 42 in 2019 to 66 in 2026">
    <path d="${d} L${pts[pts.length-1][0]},${h-20} L20,${h-20}Z" class="t-area"/><path d="${d}" class="t-line"/>
    ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" class="t-dot"/><text x="${p[0]}" y="${h-4}" class="t-x">${2019+i}</text>`).join('')}
  </svg>`;
}

export function datalenseSample(){
  const wcls:Record<string,string>={'Very high':'vh',High:'h',Medium:'m',Low:'l'};
  return `
<header class="demo-hero dark"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb"><a href="/products">Products</a><span aria-hidden="true">/</span><a href="/products/datalense">DataLense</a><span aria-hidden="true">/</span>Sample report</nav>
  <h1 class="display split">${split('A sample catchment report',1)}${dot}</h1>
  <p class="lede rise" style="--i:5">What a DataLense report looks like, for a fictional clinic site. Explore the map, switch between the four toolkits and see how every figure carries its coverage status.</p>
  <div class="actions rise" style="--i:6"><button class="btn" type="button" data-tour-start><span>Watch the 60-second tour</span></button><a class="btn ghost" href="/contact?interest=DataLense"><span>Request a real catchment</span></a></div>
  <p class="demo-flag rise" style="--i:7">Illustrative data for a fictional site. Not a real location.</p>
</div></header>

<section class="dl-report" data-demo="datalense"><div class="wrap">
  <div class="dl-head" data-step="head">
    <div><span class="eyebrow">Catchment report</span><h2 class="h2">${DL.site}</h2><p class="dl-sub">${DL.town} · Drivetime 10, 20 and 30 minutes · Prepared October 2026</p></div>
    <button class="btn sm ghost" type="button" onclick="window.print()"><span>Save as PDF</span></button>
  </div>
  <div class="dl-kpis" data-step="kpis">
    <div class="dl-kpi dk"><span>Market score</span><b data-count="${DL.score}">0</b><small>out of 100 · strong</small></div>
    <div class="dl-kpi"><span>Population within 20 minutes</span><b>${DL.pop}</b><small>${DL.over65} aged 65 and over</small></div>
    <div class="dl-kpi"><span>Competing providers</span><b>${DL.comp}</b><small>within 30 minutes</small></div>
    <div class="dl-kpi"><span>Data coverage</span><b>${DL.coverage}%</b><small>of figures fully resolved</small></div>
  </div>
  <div class="dl-grid">
    <div class="dl-map" data-step="map">${dlMap()}<div class="dm-tip" data-tip-box hidden></div>
      <ul class="dm-key"><li><i class="k10"></i>10 min</li><li><i class="k20"></i>20 min</li><li><i class="k30"></i>30 min</li><li><i class="kc"></i>Provider</li><li><i class="ks"></i>Proposed site</li></ul></div>
    <div class="dl-tabs" data-step="tabs">
      <div class="dl-tablist" role="tablist">${['Health Commercials','Population Health','Workforce','General Trends'].map((t,i)=>`<button role="tab" type="button" aria-selected="${i===0}" data-dl-tab="${i}">${t}</button>`).join('')}</div>
      <div class="dl-panel" data-dl-panel="0">
        <table class="dl-table"><thead><tr><th>Provider</th><th>Type</th><th>Distance</th><th>Waiting pressure</th></tr></thead><tbody>
        ${DL.competitors.map(c=>`<tr data-row="${c.n.slice(-1)}"><td><b>${c.n}</b></td><td>${c.t}</td><td>${c.d}<small>${c.m} min</small></td><td><span class="wp ${wcls[c.w]}">${c.w}</span></td></tr>`).join('')}
        </tbody></table>
        <p class="dl-note">Providers anonymised for this sample. Real reports name them, from public registers.</p>
      </div>
      <div class="dl-panel" data-dl-panel="1" hidden>
        <p class="dl-lead">Compared with similar catchments across England, this population has:</p>
        <ul class="dl-dev">${DL.health.map(([t,v])=>`<li><span>${t}</span><span class="dv"><i class="${(v as number)>0?'pos':'neg'}" style="--w:${Math.abs(v as number)*2.4}%"></i></span><b>${(v as number)>0?'+':''}${v}%</b></li>`).join('')}</ul>
      </div>
      <div class="dl-panel" data-dl-panel="2" hidden>
        <ul class="dl-wf">${DL.workforce.map(([t,a,b,n])=>`<li><span>${t}</span><div><b>${a}</b><small>here</small></div><div><b>${b}</b><small>comparison</small></div><p>${n}</p></li>`).join('')}</ul>
      </div>
      <div class="dl-panel" data-dl-panel="3" hidden>
        <p class="dl-lead">Self-pay MSK demand index for the catchment, 2019 to 2026.</p>${dlTrend()}
      </div>
    </div>
  </div>
  <div class="dl-bottom">
    <div class="dl-verdict" data-step="verdict"><span class="eyebrow">What it says</span><h3>Go, with two conditions.</h3>
      <ul class="ticks"><li>Demand is strong and growing, and the nearest NHS service is under very high waiting pressure.</li><li>Recruit physiotherapists before opening: local supply is below average.</li><li>Lead with car-friendly access and older adults, who over-index here.</li></ul></div>
    <div class="dl-cov" data-step="coverage"><span class="eyebrow">Coverage status</span>
      <ul>${DL.checks.map(([t,s,n])=>`<li class="${s}"><i aria-hidden="true"></i><div><b>${t}</b><small>${n}</small></div></li>`).join('')}</ul>
      <p class="dl-note">We would rather say nothing than say something wrong. Anything we cannot resolve is shown as missing, with the reason.</p></div>
  </div>
</div></section>
${demoCta('Considering a real site?','Send us the postcode. We will run the catchment and talk you through what it says.','/contact?interest=DataLense','Request a catchment')}
${tourLayer()}`;
}

/* ---------------- STRAIGHT TALKING ---------------- */
export function straightTalkingDemo(){
  const stages=[['Before treatment',92],['Week 6',81],['Discharge',74],['6 months',63]];
  return `
<header class="demo-hero dark"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb"><a href="/products">Products</a><span aria-hidden="true">/</span><a href="/products/straight-talking">Straight Talking</a><span aria-hidden="true">/</span>Demo</nav>
  <h1 class="display split">${split('Answer as a patient. Watch the clinic see it',1)}${dot}</h1>
  <p class="lede rise" style="--i:5">The patient app and the provider dashboard are one connected loop. Fill in the phone on the left and the dashboard updates as you go.</p>
  <div class="actions rise" style="--i:6"><button class="btn" type="button" data-tour-start><span>Watch the 60-second tour</span></button><a class="btn ghost" href="/contact?interest=Straight%20Talking"><span>Join the first cohort</span></a></div>
  <p class="demo-flag rise" style="--i:7">Demo with illustrative data. No real patient information.</p>
</div></header>

<section class="st-demo" data-demo="straight"><div class="wrap st-grid">
  <div class="st-phone" data-step="phone"><div class="st-notch"></div><div class="st-screen" data-st-screen>
    <div class="st-app-top"><b>Straight Talking</b><span>Northfield Physio · demo</span></div>
    <div class="st-q" data-st-q="0"><span class="st-stage">Before treatment</span><h3>How bad is your pain today?</h3><p class="st-help">0 is no pain, 10 is the worst imaginable.</p>
      <div class="st-scale" data-st-scale>${Array.from({length:11},(_,i)=>`<button type="button" data-v="${i}">${i}</button>`).join('')}</div></div>
    <div class="st-q" data-st-q="1" hidden><span class="st-stage">Before treatment</span><h3>How much does it limit your day?</h3>
      <div class="st-opts">${['Not at all','A little','Moderately','A lot','I cannot do my usual activities'].map((t,i)=>`<button type="button" data-v="${i}">${t}</button>`).join('')}</div></div>
    <div class="st-q" data-st-q="2" hidden><span class="st-stage">Week 6</span><h3>And your pain now?</h3>
      <div class="st-scale" data-st-scale>${Array.from({length:11},(_,i)=>`<button type="button" data-v="${i}">${i}</button>`).join('')}</div></div>
    <div class="st-q" data-st-q="3" hidden><div class="st-done"><span>✓</span><h3>Thank you.</h3><p>Your physiotherapist can see your progress. We will check in again at discharge.</p><button type="button" class="st-restart" data-st-restart>Start again</button></div></div>
  </div></div>
  <div class="st-dash" data-step="dash">
    <div class="st-dash-top"><b>Provider dashboard</b><span class="st-live"><i></i>Live</span></div>
    <div class="st-kpis">
      <div><span>Responses today</span><b data-st-today>37</b></div>
      <div><span>Capture rate, this month</span><b data-st-cap>84%</b></div>
      <div><span>Average pain change</span><b data-st-chg>−3.1</b></div>
    </div>
    <div class="st-feed-h">Latest submissions</div>
    <ul class="st-feed" data-st-feed>
      <li><b>Patient 4821</b><span>Week 6 · pain 3 (was 7)</span><em class="up">Improving</em></li>
      <li><b>Patient 4790</b><span>Discharge · pain 1 (was 6)</span><em class="up">Improving</em></li>
      <li><b>Patient 4815</b><span>Week 6 · pain 8 (was 5)</span><em class="flag">Flag for clinician</em></li>
    </ul>
    <div class="st-feed-h">Capture rate by stage</div>
    <ul class="st-stages">${stages.map(([t,v])=>`<li><span>${t}</span><span class="dv"><i style="--w:${v}%"></i></span><b>${v}%</b></li>`).join('')}</ul>
  </div>
</div></section>

<section class="soft st-report"><div class="wrap">
  <div class="dl-head" data-step="report"><div><span class="eyebrow">Sample outcomes report</span><h2 class="h2">MSK physiotherapy cohort, quarter 3</h2><p class="dl-sub">412 patients · fictional provider · illustrative data</p></div>
    <button class="btn sm ghost" type="button" onclick="window.print()"><span>Save as PDF</span></button></div>
  <div class="dl-kpis">
    <div class="dl-kpi dk"><span>Captured at every stage</span><b>63%</b><small>answered before, during and after treatment</small></div>
    <div class="dl-kpi"><span>Patients improved</span><b>78%</b><small>meaningful pain reduction by discharge</small></div>
    <div class="dl-kpi"><span>Average pain change</span><b>−3.4</b><small>points on a 0 to 10 scale</small></div>
    <div class="dl-kpi"><span>Flagged early</span><b>19</b><small>patients whose scores worsened, seen sooner</small></div>
  </div>
  <div class="st-rep-grid">
    <div><h3 class="dl-h3">Pain score through the pathway</h3>
      <svg class="st-line" viewBox="0 0 520 200" role="img" aria-label="Average pain falling from 6.8 before treatment to 3.4 at discharge and 3.1 at six months">
        ${[[6.8,'Before'],[4.9,'Week 6'],[3.4,'Discharge'],[3.1,'6 months']].map(([v,t],i,a)=>{const x=40+i*146,y=180-(v as number)*22;const nx=i<a.length-1?40+(i+1)*146:0,ny=i<a.length-1?180-((a[i+1][0] as number))*22:0;
          return `${i<a.length-1?`<line x1="${x}" y1="${y}" x2="${nx}" y2="${ny}" class="t-line"/>`:''}<circle cx="${x}" cy="${y}" r="6" class="t-dot"/><text x="${x}" y="${y-14}" class="t-v">${v}</text><text x="${x}" y="198" class="t-x">${t}</text>`;}).join('')}
      </svg></div>
    <div><h3 class="dl-h3">Ready to send</h3>
      <ul class="ticks"><li>PHIN-ready patient-reported measures export</li><li>Insurer summary: outcomes by condition and clinician</li><li>Board pack: capture, outcomes and flags, month by month</li><li>Your data, owned by you, exportable at any time</li></ul></div>
  </div>
</div></section>
${demoCta('Report to PHIN or hold PROMs contracts?','Join the first cohort and help shape what comes next.','/contact?interest=Straight%20Talking','Join the first cohort')}
${tourLayer()}`;
}

function demoCta(h:string,p:string,href:string,label:string){
  return `<section class="cta-band"><div class="wrap cta-in"><div class="reveal"><h2 class="h1">${h}</h2><p class="lede">${p}</p></div>
    <div class="actions reveal" style="--i:1"><a class="btn mag" href="${href}"><span>${label}</span></a></div></div></section>`;
}
function tourLayer(){
  return `<div class="tour" data-tour hidden aria-live="polite"><div class="tour-cursor" data-tour-cursor aria-hidden="true"></div>
    <div class="tour-cap"><span data-tour-n>1/6</span><p data-tour-text></p><button type="button" data-tour-stop>Stop tour</button></div></div>`;
}

/* ---------------- behaviour ---------------- */
type Step={sel:string,text:string,act?:(el:HTMLElement)=>void,click?:string,wait?:number};
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));

export function initDemos(){
  const dl=document.querySelector<HTMLElement>('[data-demo="datalense"]');
  const st=document.querySelector<HTMLElement>('[data-demo="straight"]');
  if(!dl&&!st)return;
  if(dl)wireDatalense(dl);
  if(st)wireStraight(st);
  const steps:Step[]=dl?[
    {sel:'[data-step="head"]',text:'A DataLense report starts with the site and its drivetime catchments: 10, 20 and 30 minutes by car.'},
    {sel:'[data-step="kpis"]',text:'The headline: a weighted market score, the population in reach, the competition and how complete the data is.'},
    {sel:'[data-step="map"]',text:'Every provider in the catchment, mapped. Hover over one to see who they are and how far away.',click:'.dm-c[data-tip="D"]'},
    {sel:'[data-step="tabs"]',text:'Population Health compares the people here with similar catchments across England.',click:'[data-dl-tab="1"]'},
    {sel:'[data-step="tabs"]',text:'Workforce asks the question most site decisions forget: can you staff it?',click:'[data-dl-tab="2"]'},
    {sel:'[data-step="verdict"]',text:'Then a plain-English verdict, with the conditions attached.'},
    {sel:'[data-step="coverage"]',text:'And every figure carries its coverage status. If we cannot resolve it, we say so rather than guess.'}
  ]:[
    {sel:'[data-step="phone"]',text:'A patient is asked one simple question at a time, on their phone, before treatment starts.',click:'[data-st-q="0"] [data-v="7"]'},
    {sel:'[data-step="dash"]',text:'Their answer lands on the provider dashboard the moment they submit.',wait:2400},
    {sel:'[data-step="phone"]',text:'Short and specific: how much does it limit your day?',click:'[data-st-q="1"] [data-v="3"]'},
    {sel:'[data-step="phone"]',text:'Six weeks later, the same patient checks in again.',click:'[data-st-q="2"] [data-v="3"]'},
    {sel:'[data-step="dash"]',text:'The dashboard shows the change, the capture rate at every stage, and flags anyone getting worse.',wait:2800},
    {sel:'[data-step="report"]',text:'Each quarter, it becomes an outcomes report: ready for PHIN, insurers and the board.'}
  ];
  wireTour(steps);
}

function wireDatalense(root:HTMLElement){
  const tabs=[...root.querySelectorAll<HTMLButtonElement>('[data-dl-tab]')],panels=[...root.querySelectorAll<HTMLElement>('[data-dl-panel]')];
  tabs.forEach(t=>t.addEventListener('click',()=>{tabs.forEach(x=>x.setAttribute('aria-selected',String(x===t)));panels.forEach(p=>{p.hidden=p.dataset.dlPanel!==t.dataset.dlTab;p.classList.toggle('in',!p.hidden);});}));
  const tip=root.querySelector<HTMLElement>('[data-tip-box]'),map=root.querySelector<HTMLElement>('.dl-map');
  const C:Record<string,string>={};document.querySelectorAll('.dl-table tr[data-row]').forEach(r=>{const td=r.querySelectorAll('td');C[(r as HTMLElement).dataset.row]=`<b>${td[0].textContent}</b>${td[1].textContent} · ${td[2].childNodes[0].textContent}<br>Waiting pressure: ${td[3].textContent}`;});
  root.querySelectorAll<SVGGElement>('.dm-c').forEach(g=>{
    const show=()=>{const k=g.dataset.tip;const r=g.getBoundingClientRect(),m=map.getBoundingClientRect();tip.innerHTML=C[k]||k;tip.hidden=false;
      tip.style.left=`${Math.min(m.width-220,Math.max(8,r.left-m.left-90))}px`;tip.style.top=`${r.top-m.top-tip.offsetHeight-10}px`;
      root.querySelectorAll('.dl-table tr').forEach(tr=>tr.classList.toggle('hl',(tr as HTMLElement).dataset.row===k));};
    const hide=()=>{tip.hidden=true;root.querySelectorAll('.dl-table tr.hl').forEach(tr=>tr.classList.remove('hl'));};
    g.addEventListener('mouseenter',show);g.addEventListener('focus',show);g.addEventListener('click',show);g.addEventListener('mouseleave',hide);g.addEventListener('blur',hide);
  });
  const sc=root.querySelector<HTMLElement>('[data-count]');
  const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();const to=+sc.dataset.count,t0=performance.now();
    const f=(t:number)=>{const k=Math.min(1,(t-t0)/1400);sc.textContent=String(Math.round(to*(1-Math.pow(1-k,3))));if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);});
  io.observe(sc);
}

function wireStraight(root:HTMLElement){
  const qs=[...root.querySelectorAll<HTMLElement>('[data-st-q]')],feed=root.querySelector<HTMLElement>('[data-st-feed]');
  const today=root.querySelector<HTMLElement>('[data-st-today]'),cap=root.querySelector<HTMLElement>('[data-st-cap]'),chg=root.querySelector<HTMLElement>('[data-st-chg]');
  let before=0,step=0;const id=4800+Math.floor(Math.random()*90);
  const go=(n:number)=>{qs.forEach((q,i)=>{q.hidden=i!==n;q.classList.toggle('in',i===n);});step=n;};
  const push=(html:string)=>{const li=document.createElement('li');li.className='new';li.innerHTML=html;feed.prepend(li);while(feed.children.length>4)feed.lastElementChild.remove();
    today.textContent=String(+today.textContent+1);bump(today);};
  const bump=(el:HTMLElement)=>{el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');};
  root.addEventListener('click',e=>{
    const b=(e.target as HTMLElement).closest<HTMLButtonElement>('[data-v]');
    if((e.target as HTMLElement).closest('[data-st-restart]')){go(0);return;}
    if(!b)return;const v=+b.dataset.v;b.classList.add('on');
    setTimeout(()=>{
      if(step===0){before=v;push(`<b>Patient ${id}</b><span>Before treatment · pain ${v}</span><em>New</em>`);go(1);}
      else if(step===1){push(`<b>Patient ${id}</b><span>Before treatment · limits day: ${b.textContent.toLowerCase()}</span><em>New</em>`);go(2);}
      else if(step===2){const worse=v>before;push(`<b>Patient ${id}</b><span>Week 6 · pain ${v} (was ${before})</span><em class="${worse?'flag':'up'}">${worse?'Flag for clinician':'Improving'}</em>`);
        cap.textContent='85%';bump(cap);chg.textContent=(-3.1+((v-before)+3.1)*.02).toFixed(1).replace('-','−');bump(chg);go(3);}
      b.classList.remove('on');
    },380);
  });
}

function wireTour(steps:Step[]){
  const layer=document.querySelector<HTMLElement>('[data-tour]');if(!layer)return;
  const cur=layer.querySelector<HTMLElement>('[data-tour-cursor]'),txt=layer.querySelector<HTMLElement>('[data-tour-text]'),num=layer.querySelector<HTMLElement>('[data-tour-n]');
  let run=0;
  const moveTo=async(el:Element)=>{const r=el.getBoundingClientRect();cur.style.transform=`translate(${r.left+r.width/2}px,${r.top+r.height/2}px)`;await sleep(900);};
  const play=async()=>{
    const me=++run;layer.hidden=false;document.documentElement.classList.add('touring');
    try{for(let i=0;i<steps.length;i++){
      if(me!==run)return;const s=steps[i],el=document.querySelector(s.sel);if(!el)continue;
      num.textContent=`${i+1}/${steps.length}`;txt.textContent=s.text;
      el.scrollIntoView({behavior:'smooth',block:'center'});await sleep(900);
      document.querySelectorAll('.tour-focus').forEach(x=>x.classList.remove('tour-focus'));el.classList.add('tour-focus');
      if(s.click){const c=document.querySelector(s.click);if(c){await moveTo(c);cur.classList.add('press');c.dispatchEvent(new MouseEvent('mouseenter'));c.dispatchEvent(new MouseEvent('click',{bubbles:true}));await sleep(250);cur.classList.remove('press');}}
      else await moveTo(el);
      await sleep(s.wait||3200);
    }}catch(e){console.error(e);}
    if(me===run)stop();
  };
  const stop=()=>{run++;layer.hidden=true;document.documentElement.classList.remove('touring');document.querySelectorAll('.tour-focus').forEach(x=>x.classList.remove('tour-focus'));};
  document.querySelectorAll('[data-tour-start]').forEach(b=>b.addEventListener('click',play));
  layer.querySelector('[data-tour-stop]').addEventListener('click',stop);
  addEventListener('keydown',e=>{if(e.key==='Escape')stop();});
  if(new URLSearchParams(location.search).get('tour')==='1')setTimeout(play,1600);
}
