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
  const faces=[['1','Poor'],['2','Not great'],['3','Mixed'],['4','Good'],['5','Wonderful']];
  return `
<header class="demo-hero dark"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb"><a href="/products">Products</a><span aria-hidden="true">/</span><a href="/products/straight-talking">Straight Talking</a><span aria-hidden="true">/</span>Demo</nav>
  <h1 class="display split">${split('Say it straight. Watch it land',1)}${dot}</h1>
  <p class="lede rise" style="--i:5">Give feedback as a patient on the phone. The service sees it straight away, routed to the right person, and kind words appear on the waiting-room screen for the next patient.</p>
  <div class="actions rise" style="--i:6"><button class="btn" type="button" data-tour-start><span>Watch the 45-second tour</span></button><a class="btn ghost" href="/contact?interest=Straight%20Talking"><span>Join the first cohort</span></a></div>
  <p class="demo-flag rise" style="--i:7">Demo with made-up feedback. No real patient information.</p>
</div></header>

<section class="st-demo" data-demo="straight"><div class="wrap st-grid">
  <div class="st-phone" data-step="phone"><div class="st-notch"></div><div class="st-screen">
    <div class="st-app-top"><b>Straight Talking</b><span>Riverside Health Centre</span></div>
    <div class="st-q" data-st-q="0"><span class="st-stage">Your visit today</span><h3>How was your care today?</h3><p class="st-help">Your feedback is anonymous.</p>
      <div class="st-faces">${faces.map(([v,t])=>`<button type="button" data-v="${v}" aria-label="${t}"><span>${'★'.repeat(+v)}</span><small>${t}</small></button>`).join('')}</div></div>
    <div class="st-q" data-st-q="1" hidden><span class="st-stage" data-st-word></span><h3>What would you like to tell us?</h3>
      <div class="st-opts"><button type="button" data-k="compliment">Say thank you</button><button type="button" data-k="concern">Raise a concern</button><button type="button" data-k="comment">Share a thought</button></div></div>
    <div class="st-q" data-st-q="2" hidden><span class="st-stage">In a few words</span><h3 data-st-ask>What stood out?</h3>
      <div class="st-opts" data-st-say></div></div>
    <div class="st-q" data-st-q="3" hidden><div class="st-done"><span>✓</span><h3>Thank you.</h3><p data-st-thanks>The team will see this today.</p><button type="button" class="st-restart" data-st-restart>Give more feedback</button></div></div>
  </div></div>
  <div class="st-dash" data-step="dash">
    <div class="st-dash-top"><b>Service dashboard · Riverside Health Centre</b><span class="st-live"><i></i>Live</span></div>
    <div class="st-kpis">
      <div><span>Feedback today</span><b data-st-today>23</b></div>
      <div><span>Positive</span><b data-st-pos>87%</b></div>
      <div><span>Concerns to follow up</span><b data-st-open>1</b></div>
    </div>
    <div class="st-feed-h">Latest feedback</div>
    <ul class="st-feed" data-st-feed>
      <li><b>★★★★★</b><span>“Sam on reception made a stressful morning easy.”</span><em class="up">To the team</em></li>
      <li><b>★★</b><span>“Waited 40 minutes with no update.”</span><em class="flag">To the manager</em></li>
      <li><b>★★★★</b><span>“Clear explanation of what happens next.”</span><em class="up">To the team</em></li>
    </ul>
  </div>
</div></section>

<section class="soft st-board-sec"><div class="wrap">
  <div class="dl-head" data-step="board"><div><span class="eyebrow">Waiting-room screen</span><h2 class="h2">Patients hear from each other.</h2><p class="dl-sub">Shown on a screen where people wait. Compliments appear only with the person’s permission.</p></div></div>
  <div class="st-board">
    <div class="st-bq"><h3>What patients are saying</h3><ul data-st-board>
      <li><q>The nurse explained every step and settled my nerves.</q><span>★★★★★ · today</span></li>
      <li><q>Kind, quick and clear about what happens next.</q><span>★★★★★ · yesterday</span></li>
    </ul></div>
    <div class="st-bq ysd"><h3>You said, we did</h3><ul>
      <li><b>You said</b> waiting without an update was stressful.<br><b>We did</b> reception now gives a wait-time update every 15 minutes.</li>
      <li><b>You said</b> the entrance was hard to find.<br><b>We did</b> new signs from the car park and a map in every appointment letter.</li>
    </ul></div>
  </div>
</div></section>
${demoCta('Want to hear from your patients more often?','Join the first cohort and help shape what comes next.','/contact?interest=Straight%20Talking','Join the first cohort')}
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
    {sel:'[data-step="phone"]',text:'A patient scans a code in the waiting room and rates their care. No app, no account.',click:'[data-st-q="0"] [data-v="5"]'},
    {sel:'[data-step="phone"]',text:'They choose what they want to say: a thank you, a concern or a thought.',click:'[data-st-q="1"] [data-k="compliment"]'},
    {sel:'[data-step="phone"]',text:'A few words about that visit, and permission to share it with other patients.',click:'[data-st-q="2"] [data-say]'},
    {sel:'[data-step="dash"]',text:'It reaches the service straight away. Compliments go to the team, concerns to someone who can act.',wait:3400},
    {sel:'[data-step="board"]',text:'And kind words appear on the waiting-room screen, with “you said, we did”, so patients hear from each other.',wait:3600}
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
  const today=root.querySelector<HTMLElement>('[data-st-today]'),pos=root.querySelector<HTMLElement>('[data-st-pos]'),open=root.querySelector<HTMLElement>('[data-st-open]');
  const say=root.querySelector<HTMLElement>('[data-st-say]'),ask=root.querySelector<HTMLElement>('[data-st-ask]'),word=root.querySelector<HTMLElement>('[data-st-word]'),thanks=root.querySelector<HTMLElement>('[data-st-thanks]');
  const board=document.querySelector<HTMLElement>('[data-st-board]');
  const WORDS=['','We’re sorry to hear that','Not the visit we want for you','A mixed one, thank you for telling us','Glad it went well','Wonderful, thank you'];
  const SAY:Record<string,[string,string[]]>={
    compliment:['What stood out?',['The staff were kind and patient','I was seen quickly','Everything was explained clearly']],
    concern:['What went wrong?',['I waited with no update','I did not feel listened to','It was hard to find my way']],
    comment:['What is on your mind?',['Parking was tricky','More seating would help','The online booking was easy']]};
  let stars=0,kind='compliment';
  const go=(n:number)=>{qs.forEach((q,i)=>{q.hidden=i!==n;q.classList.toggle('in',i===n);});};
  const bump=(el:HTMLElement)=>{el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');};
  root.addEventListener('click',e=>{
    const t=e.target as HTMLElement;
    if(t.closest('[data-st-restart]')){go(0);return;}
    const v=t.closest<HTMLButtonElement>('[data-v]'),k=t.closest<HTMLButtonElement>('[data-k]'),sy=t.closest<HTMLButtonElement>('[data-say]');
    const b=v||k||sy;if(!b)return;b.classList.add('on');
    setTimeout(()=>{b.classList.remove('on');
      if(v){stars=+v.dataset.v;word.textContent=WORDS[stars];go(1);}
      else if(k){kind=k.dataset.k;const[q,opts]=SAY[kind];ask.textContent=q;
        say.innerHTML=opts.map(o=>`<button type="button" data-say="${o}">${o}</button>`).join('')+(kind==='compliment'?'<p class="st-share">✓ Happy for this to be shown to other patients</p>':'');go(2);}
      else if(sy){const text=sy.dataset.say,concern=kind==='concern';
        const li=document.createElement('li');li.className='new';
        li.innerHTML=`<b>${'★'.repeat(stars)}</b><span>“${text}.”</span><em class="${concern?'flag':'up'}">${concern?'To the manager':kind==='compliment'?'To the team':'To the team'}</em>`;
        feed.prepend(li);while(feed.children.length>4)feed.lastElementChild.remove();
        today.textContent=String(+today.textContent+1);bump(today);
        if(concern){open.textContent=String(+open.textContent+1);bump(open);thanks.textContent='Your concern has gone straight to the manager.';}
        else{thanks.textContent=kind==='compliment'?'The team will see your thank you today.':'Thank you, the team will read this today.';}
        if(kind==='compliment'&&board){const q=document.createElement('li');q.className='new';q.innerHTML=`<q>${text}.</q><span>${'★'.repeat(stars)} · just now</span>`;board.prepend(q);while(board.children.length>3)board.lastElementChild.remove();}
        if(stars>=4&&!concern){pos.textContent='88%';bump(pos);}
        go(3);}
    },350);
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
