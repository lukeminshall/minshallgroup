/* =====================================================================
   PAGES — the route map P. Each entry returns the page markup string.
   Data comes from content.ts; markup helpers from components.ts.
   ===================================================================== */
import {CAPS,RETURNS,INDUSTRIES,PRODUCTS,CASES,FINDER,STEPS,MODELS,PRINCIPLES,INSIGHTS,CLIENTS,LANDINGS,LEGAL,SME,SCORE,CONTACT} from './content';
import {subscribeBox,split,splitLetters,eyebrow,shead,phead,btn,cards,returnsRow,capTags,caseCard,marquee,insightCard,ctaBand,gfx,capBySlug,indById} from './components';
import {dot,tile} from './brand';
import {gRidge,gDial,gNetwork} from './graphics';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export const P:Record<string,()=>string>={};

/* ================= HOME ================= */
P['/']=()=>`
<section class="hero2 dark" id="hero" data-hero>
  <div class="hero2-pin">
    <div class="grain" aria-hidden="true"></div>
    <div class="wrap hero2-in">
      <div class="fadebox"><div class="hero2-top rise" style="--i:0"><span>Strategy</span><span>Digital</span><span>Data &amp; AI</span><span>Brand</span></div></div>
      <h1 class="hero2-h split" data-vf>${splitLetters('Strategy measured by the <em>return</em>, not the recommendation',1)}<span class="dot zoomdot" data-zoomdot aria-hidden="true"></span></h1>
      <div class="hero2-foot">
        <p class="hero2-lede rise" style="--i:7">We are a strategy, digital, data and brand group. Clients bring us a number that needs to move. We work out how, build what it takes, and stay until it has moved.</p>
        <div class="actions rise" style="--i:8">${btn('Start a conversation','/contact')}${btn('See the work','/work',true)}</div>
      </div>
      <div class="fadebox"><a class="hero2-scroll rise" style="--i:9" href="#intro"><i aria-hidden="true"></i>Scroll</a></div>
    </div>
  </div>
</section>

<section class="pinksec" id="intro">
  <div class="wrap">
    <span class="eyebrow">Why Minshall Group</span>
    <p class="scrub" data-scrub>Most firms hand over a strategy and leave. Somebody else builds the platform, somebody else runs the data, somebody else does the brand, and nobody owns the result. We do all four, and we own the result.</p>
    <div class="pink-foot">
      <span class="pink-we">We <span class="rot" id="rot"><b class="on">find the number</b><b>design the route</b><b>build the platform</b><b>tell the story</b><b>prove it moved</b></span></span>
      <a class="tlink" href="/about">How we got here</a>
    </div>
  </div>
  <div class="bigmarq" data-velomarq aria-hidden="true"><div class="bigmarq-track">${[0,1].map(()=>`<div class="bigmarq-row">${CAPS.map(c=>`<span>${c.t}</span><i></i>`).join('')}</div>`).join('')}</div></div>
</section>

<section class="hcaps dark" data-hscroll id="capabilities">
  <div class="hcaps-pin">
    <div class="wrap hcaps-head">
      <div>${eyebrow('Capabilities')}<h2 class="h2">Four practices, one team.</h2></div>
      <div class="hcaps-count" aria-hidden="true"><b data-hcount>01</b><span>/ 0${CAPS.length}</span></div>
    </div>
    <div class="hcaps-track" data-htrack>
      ${CAPS.map(c=>`
      <article class="hpanel">
        <span class="hp-n" aria-hidden="true">${c.n}</span>
        <div class="hp-copy">
          <h3 class="hp-t">${c.t}</h3>
          <p class="hp-line">${c.line}</p>
          <p class="hp-d">${c.d}</p>
          <ul class="hp-list">${c.services.map(x=>`<li>${x.t}</li>`).join('')}</ul>
          <a class="tlink" href="/capabilities/${c.slug}" data-cursor="Open">Explore ${c.short}</a>
        </div>
        <div class="hp-gfx">${gfx(c.gfx)}</div>
      </article>`).join('')}
      <article class="hpanel hp-end">
        <p class="h2">Most programmes use two or three practices together.</p>
        <a class="btn mag" href="/capabilities"><span>All capabilities</span></a>
      </article>
    </div>
  </div>
</section>

<section class="ret-sec"><div class="wrap">
  ${shead({eyebrow:'The return',h:'Three ways we are measured.',p:'We agree which one an engagement is for before it starts, and report against it at the end.'})}
  ${returnsRow(RETURNS)}
</div></section>

<section class="finder-sec soft" id="finder"><div class="wrap">
  ${shead({eyebrow:'Where do you start?',h:'What are you trying to do?',p:'Pick the closest. We will show you which practices it needs and some work that looks like yours.'})}
  <div class="finder" data-finder>
    <div class="finder-q" role="tablist" aria-label="Choose a challenge">
      ${FINDER.map((f,i)=>`<button class="pill-btn${i===0?' on':''}" role="tab" aria-selected="${i===0}" data-f="${i}">${f.q}</button>`).join('')}
    </div>
    <div class="finder-panels">
      ${FINDER.map((f,i)=>{const c=CASES.find(x=>x.id===f.case);return `
      <div class="finder-a${i===0?' on':''}" role="tabpanel" data-fa="${i}"${i===0?'':' hidden'}>
        <div class="finder-main">
          <span class="eyebrow">How we would approach it</span>
          <p class="finder-lead">${f.a}</p>
          <div class="finder-caps">${f.caps.map((s,k)=>{const cp=capBySlug(s);return `<a class="fcap" style="--k:${k}" href="/capabilities/${cp.slug}"><span>${cp.n}</span><b>${cp.t}</b></a>`;}).join('')}</div>
        </div>
        ${c?`<a class="finder-case" href="/work#${c.id}" data-cursor="Read"><span class="eyebrow">Related work · ${c.client}</span><b>${c.head}</b><span>${c.ret}</span><em>See the case →</em></a>`:''}
      </div>`;}).join('')}
    </div>
  </div>
</div></section>

<section class="worklist-sec"><div class="wrap">
  ${shead({eyebrow:'Selected work',h:'Recent work.',link:['All work','/work']})}
  <ol class="wl" data-hoverlist>
    ${CASES.slice(0,6).map((c,i)=>`
    <li class="reveal" style="--i:${i%3}"><a href="/work#${c.id}" data-preview="${i}" data-cursor="View">
      <span class="wl-n">${String(i+1).padStart(2,'0')}</span>
      <span class="wl-client">${c.client}${c.status?` <em class="wl-status">${c.status}</em>`:''}</span>
      <span class="wl-head">${c.head}</span>
      <span class="wl-ind">${indById(c.ind).t}</span>
      <span class="wl-arrow" aria-hidden="true">→</span>
    </a></li>`).join('')}
  </ol>
  <p class="clients-line reveal"><span class="eyebrow">Clients include</span>${CLIENTS.join('<i></i>')}</p>
</div>
<div class="hover-preview" data-preview-box aria-hidden="true">${CASES.slice(0,6).map((c,i)=>`<div class="hpv" data-pv="${i}"><div class="hpv-gfx">${gfx(c.gfx)}</div><p>${c.ret}</p></div>`).join('')}</div>
</section>

<section class="sme-band"><div class="wrap sme-band-in">
  <div class="reveal"><span class="eyebrow">Small business?</span><h2 class="h1">Your website, refreshed from £495.</h2><p class="lede">Get a free instant check: your Webmins Score, plain-English fixes and a fixed price in two minutes.</p></div>
  <form class="sme-check reveal" style="--i:1" action="/digitalsme" method="get" data-sme-jump>
    <label class="sr" for="band-url">Your website address</label>
    <input id="band-url" name="url" type="text" inputmode="url" placeholder="yourbusiness.co.uk" required>
    <button class="btn" type="submit"><span>Check my site</span></button>
  </form>
</div></section>

<section class="prod-sec dark"><div class="wrap">
  ${shead({eyebrow:'Products',h:'We built these because clients kept asking.',p:'Products we own and run. Each started as a problem we saw in client after client.',link:['All products','/products']})}
  <div class="prods">${PRODUCTS.map((p,i)=>`
    <a class="prod reveal" style="--i:${i}" href="/products/${p.slug}" data-cursor="Open">
      <div class="prod-top"><span class="status${p.status==='Live'?' live':''}">${p.status}</span>${tile('mini')}</div>
      <div class="prod-gfx">${gfx(p.gfx)}</div>
      <h3>${p.t}</h3><p><b>${p.line}</b> ${p.d}</p>
      <span class="tlink">Explore ${p.t}</span>
    </a>`).join('')}</div>
</div></section>

<section class="steps-mini"><div class="wrap">
  ${shead({eyebrow:'Approach',h:'Diagnose. Design. Build. Grow.',p:'Four stages, run as one programme by one team.',link:['How we work','/approach']})}
  <ol class="steps-row">${STEPS.map((s,i)=>`<li class="reveal" style="--i:${i}"><span class="sn">${s.n}</span><b>${s.t}</b><span class="when">${s.when}</span><p>${s.d}</p></li>`).join('')}</ol>
</div></section>

<section class="ind-sec soft"><div class="wrap">
  ${shead({eyebrow:'Industries',h:'Where we know the ground.',p:'Six sectors we know well enough to be accountable for the outcome.',link:['All industries','/industries']})}
  <div class="ind-grid">${INDUSTRIES.map((x,i)=>`
    <a class="ind reveal" style="--i:${i%3}" href="/industries#${x.id}"><span class="ind-n">${String(i+1).padStart(2,'0')}</span><div class="ind-gfx">${gfx(x.gfx)}</div><h3>${x.t}</h3><p>${x.d}</p></a>`).join('')}</div>
</div></section>

<section><div class="wrap">
  ${shead({eyebrow:'Insights',h:'Things we have been thinking about.',link:['All insights','/insights']})}
  <div class="icards">${INSIGHTS.slice(0,3).map(insightCard).join('')}</div>
</div></section>`;

/* ================= CAPABILITIES ================= */
P['/capabilities']=()=>`
${phead({eyebrow:'Capabilities',title:'Four practices. One measure.',lede:'Strategy & consultancy, digital & product, data, AI & automation, and brand, marketing & growth. Each is strong on its own. The value is in how they work together.'})}
<section><div class="wrap">
  <div class="caplist">${CAPS.map((c,i)=>`
    <a class="capitem reveal" data-cursor="Open" href="/capabilities/${c.slug}">
      <span class="cap-n">${c.n}</span>
      <div class="cap-main"><h2 class="h2">${c.t}</h2><p class="cap-line">${c.line}</p><p>${c.d}</p>
        <ul class="ticks cols">${c.services.map(s=>`<li>${s.t}</li>`).join('')}</ul></div>
      <div class="cap-gfx">${gfx(c.gfx)}</div>
      <span class="card-arrow" aria-hidden="true">→</span>
    </a>`).join('')}</div>
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'Why one team',h:'The handover is where value leaks.',p:'When strategy, product, data and brand sit with different firms, every handover loses context and accountability. We remove the handovers.'})}
  ${cards([
    {n:'01',t:'One outcome',d:'Every practice works to the same number, agreed at the start and reported against at the end.'},
    {n:'02',t:'One context',d:'The people who diagnosed the problem are in the room when it is designed, built and launched.'},
    {n:'03',t:'One owner',d:'A single accountable lead across the whole programme.'}
  ])}
</div></section>
${ctaBand('Not sure which practice you need?','Most good engagements use two or three. Tell us the outcome and we will shape the team around it.')}`;

function capPage(c){
  const others=CAPS.filter(x=>x.slug!==c.slug);
  const f=c.feature;
  const work=CASES.filter(x=>x.caps.includes(c.slug)&&!(f&&f.cases.includes(x.id))).slice(0,3);
  const reads=INSIGHTS.filter(x=>x.cap===c.slug);
  return `
${phead({crumb:`<a href="/capabilities">Capabilities</a><span>/</span>${c.n}`,kicker:c.t,title:c.line.replace(/\.$/,''),lede:c.lede,gfx:c.gfx})}
<section><div class="wrap split-2">
  <div class="reveal">${eyebrow('The practice')}<h2 class="h2">${c.t}</h2></div>
  <div class="prose reveal" style="--i:1">${c.body.map(p=>`<p>${p}</p>`).join('')}</div>
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'What we do',h:'Services.'})}
  ${cards(c.services.map((s,i)=>({n:String(i+1).padStart(2,'0'),t:s.t,d:s.d})))}
</div></section>
${f?`<section class="dark entry" id="uk-market-entry"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <div class="split-2">
    <div class="reveal">${eyebrow(f.eyebrow)}<h2 class="h1">${f.h}</h2>
      <div class="partner"><span class="partner-k">In partnership with</span><b>${f.partner.name}</b><span>${f.partner.d}</span></div></div>
    <div class="prose reveal" style="--i:1">${f.body.map(p=>`<p>${p}</p>`).join('')}</div>
  </div>
  <ol class="entry-steps">${f.steps.map((x,i)=>`<li class="reveal" style="--i:${i}"><span>${String(i+1).padStart(2,'0')}</span><b>${x.t}</b><p>${x.d}</p></li>`).join('')}</ol>
  <div class="cases two">${f.cases.map((id,i)=>caseCard(CASES.find(x=>x.id===id),i)).join('')}</div>
  <div class="actions reveal">${btn('Talk to us about UK entry','/contact?interest=UK%20market%20entry')}${btn('How UK entry works','/uk-market-entry',true)}</div>
</div></section>`:''}
<section><div class="wrap">
  ${shead({eyebrow:'What it returns',h:'Measured on the number.'})}
  ${returnsRow(c.returns)}
</div></section>
${work.length?`<section class="soft"><div class="wrap">
  ${shead({eyebrow:'Related work',h:'Where we have done it.',link:['All work','/work']})}
  <div class="cases">${work.map(caseCard).join('')}</div>
</div></section>`:''}
${c.slug==='digital'?`<section class="sme-band slim"><div class="wrap sme-band-in"><div><span class="eyebrow">Small business?</span><h2 class="h2">Website refresh from £495, with a free instant check.</h2></div><a class="btn" href="/digitalsme"><span>Check my site</span></a></div></section>`:''}
<section class="dark connect"><div class="wrap">
  ${shead({eyebrow:'Works best with',h:'The rest of the group.',p:'The practices are designed to combine. Most programmes use two or three.'})}
  ${cards(others.map(o=>({n:o.n,t:o.t,d:o.line+' '+o.d,href:'/capabilities/'+o.slug})))}
  ${reads.length?`<div class="reads reveal">${eyebrow('Read')} ${reads.map(r=>`<a class="tlink" href="/insights/${r.slug}">${r.t}</a>`).join('')}</div>`:''}
</div></section>
${ctaBand(`What do you need ${c.short.toLowerCase()} to return?`,'A first conversation is thirty minutes and costs nothing. Bring the outcome, the constraint and the date.')}`;
}
CAPS.forEach(c=>{P['/capabilities/'+c.slug]=()=>capPage(c);});

/* ================= INDUSTRIES ================= */
P['/industries']=()=>`
${phead({eyebrow:'Industries',title:'Deep where it counts, broad where it helps.',lede:'We lead with capability, but we know these sectors well enough to be accountable for the outcome: the regulation, the buyers, the economics and the people.'})}
<section><div class="wrap">
  <div class="tabs" data-tabs>
    <div class="tab-list" role="tablist" aria-label="Industries">${INDUSTRIES.map((x,i)=>`<button role="tab" id="tab-${x.id}" aria-controls="${x.id}" aria-selected="${i===0}" class="${i===0?'on':''}" data-tab="${x.id}"><span>${String(i+1).padStart(2,'0')}</span>${x.t}</button>`).join('')}</div>
    <div class="tab-panels">${INDUSTRIES.map((x,i)=>`
      <article class="tab-panel${i===0?' on':''}" id="${x.id}" role="tabpanel" aria-labelledby="tab-${x.id}">
        <div class="tp-head"><div><h2 class="h2">${x.t}</h2><p class="lede-s">${x.d}</p></div><div class="tp-gfx">${gfx(x.gfx)}</div></div>
        <div class="tp-grid">
          <div><span class="eyebrow">Challenges we solve</span><ul class="ticks">${x.challenges.map(c=>`<li>${c}</li>`).join('')}</ul></div>
          <div><span class="eyebrow">Practices involved</span><div class="chips lg">${capTags(x.caps)}</div>
            <span class="eyebrow" style="margin-top:28px">Clients include</span><p class="clients">${x.clients.join(' · ')}</p></div>
        </div>
        <div class="tp-links"><a class="tlink" href="/work?ind=${x.id}">See ${x.t.toLowerCase()} work</a>${x.id==='health'?'<a class="tlink" href="/healthcare-consultancy">Healthcare consultancy</a>':''}</div>
      </article>`).join('')}</div>
  </div>
</div></section>
${ctaBand('Not on the list?','The capability carries. If your sector has a number that needs moving, we would like to hear about it.')}`;

/* ================= PRODUCTS ================= */
P['/products']=()=>`
${phead({eyebrow:'Products · A Minshall Group company',title:'Some of our best advice became software.',lede:'When we see the same problem in client after client, we build the product that solves it, then own and operate it. Each one is independently useful and connects to the rest of the group.'})}
<section><div class="wrap">
  <div class="prods light">${PRODUCTS.map((p,i)=>`
    <a class="prod reveal" data-cursor="Open" style="--i:${i}" href="/products/${p.slug}">
      <div class="prod-top"><span class="status${p.status==='Live'?' live':''}">${p.status}</span>${tile('mini')}</div>
      <div class="prod-gfx">${gfx(p.gfx)}</div>
      <h3>${p.t}</h3><p><b>${p.line}</b> ${p.d}</p>
      <span class="tlink">Explore ${p.t}</span>
    </a>`).join('')}</div>
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'How we build products',h:'Four rules we do not break.'})}
  ${cards([
    {n:'01',t:'Honest degradation',d:'When a data source fails, the answer says so. Every figure carries its own coverage status.'},
    {n:'02',t:'Production, not demo',d:'Real authentication, access control and an audit trail from the first release.'},
    {n:'03',t:'You own your data',d:'Exports, schema and documentation belong to the customer. Integration is never capture.'},
    {n:'04',t:'Ship in slices',d:'One capability at a time, each usable and earning on its own.'}
  ],2)}
</div></section>
${ctaBand('Want a demo?','We run short, structured demonstrations on your own data where we can.',`${btn('Request a demo','/contact?interest=DataLense')}${btn('Join the Straight Talking cohort','/contact?interest=Straight%20Talking',true)}`)}`;

P['/products/datalense']=()=>`
${phead({crumb:'<a href="/products">Products</a><span>/</span>DataLense',title:'Know the site before you sign the lease.',lede:'DataLense is healthcare commercial intelligence: where the next site should go, who is already there, and what the population around it actually needs, before the capital is committed.',gfx:'radar',
  actions:`<a class="btn mag" href="https://datalense.org" target="_blank" rel="noopener"><span>Visit datalense.org</span></a>${btn('Request a catchment','/contact',true)}`,meta:'<span class="status live">Live</span>'})}
<section><div class="wrap split-2">
  <div class="reveal">${eyebrow('The problem')}<h2 class="h2">The wrong site is the most expensive mistake in the sector.</h2></div>
  <div class="prose reveal" style="--i:1"><p>Site selection in independent healthcare is usually decided on instinct, a rent quote and whatever someone already knows about the town. The data to do it properly exists, but it is spread across provider registers, census tables, deprivation indices, waiting-time publications and workforce returns, each in a different shape.</p><p>DataLense joins it up around a real drivetime catchment and scores the market, so the decision is made on evidence and the evidence says what it does not know.</p></div>
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'Toolkits',h:'Four toolkits, one catchment.',p:'Each answers a different question about the same drivetime catchment. All four are live and the underlying data expands continuously.'})}
  ${cards([
    {n:'01',t:'Health Commercials',d:'Competitor and provider landscape, activity and waiting-time pressure, demographics and a weighted market score.'},
    {n:'02',t:'Population Health',d:'Long-term conditions, disability, car dependency and more, as ranked deviations from a national sample of comparison catchments.'},
    {n:'03',t:'Workforce',d:'Clinical and support workforce availability and pressure, so the site can actually be staffed.'},
    {n:'04',t:'General Trends',d:'Demand and activity trends over time, so you can see where the market is heading.'}
  ],2)}
</div></section>
<section><div class="wrap split-2 flip">
  <div class="gpanel reveal">${gRidge()}</div>
  <div class="prose reveal" style="--i:1">${eyebrow('Our principle')}<h2 class="h2">We would rather say nothing than say something wrong.</h2><p><a class="tlink" href="/healthcare-site-selection">Healthcare site selection</a></p><p>Every figure carries a coverage status. If a catchment cannot be resolved, the derived numbers come back empty with the reason attached, while postcode-level data still resolves. A partial answer that knows it is partial is safer than a confident wrong one.</p></div>
</div></section>
${ctaBand('Considering a site?','Send us the postcode. We will run the catchment and talk you through what it says.')}`;

P['/products/straight-talking']=()=>`
${phead({crumb:'<a href="/products">Products</a><span>/</span>Straight Talking',title:'A compliance cost, turned into evidence.',lede:'Straight Talking is the patient-reported spine for a whole clinical journey: one capture surface from first contact to outcome, with the mandated instruments layered on top.',gfx:'layers',
  actions:`${btn('Join the first cohort','/contact')}`,meta:'<span class="status">First cohort · October 2026</span>'})}
<section><div class="wrap split-2">
  <div class="reveal">${eyebrow('The problem')}<h2 class="h2">Feedback collected once, at the end, from the few who reply.</h2></div>
  <div class="prose reveal" style="--i:1"><p>Most providers collect patient feedback at one point, usually by email, from a small share of patients. It satisfies a reporting requirement and tells the organisation almost nothing it can act on, or negotiate with.</p><p>Straight Talking treats the patient’s voice as a continuous record across the journey. Capture rate comes first; validated instruments sit on the same spine; experience and outcome live on one record.</p></div>
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'Why now',h:'Why it matters now.'})}
  ${cards([
    {n:'PHIN',t:'Publication duties',d:'Patient-reported measures are part of what independent providers must publish.'},
    {n:'PROMs',t:'Participation is public',d:'Capture rate itself becomes a published metric.'},
    {n:'NHS',t:'Contractual PROMs',d:'The same expectation applies to NHS-funded activity in independent settings.'},
    {n:'Value',t:'Insurer negotiation',d:'Value-based arguments need outcome evidence that belongs to the provider.'}
  ],2)}
</div></section>
<section><div class="wrap split-2 flip">
  <div class="gpanel reveal">${gDial()}</div>
  <div class="prose reveal" style="--i:1">${eyebrow('Status')}<h2 class="h2">Built, demonstrable, and onboarding.</h2><p>The platform is a working product with a connected loop: submissions from the patient app appear live in the provider dashboard. We are running structured demonstrations with provider groups and onboarding the first cohort now.</p></div>
</div></section>
${ctaBand('Report to PHIN or hold PROMs contracts?','Join the first cohort and help shape what comes next.')}`;

/* ================= WORK ================= */
P['/work']=()=>`
${phead({eyebrow:'Work',title:'The challenge, what we did, and the return.',lede:'Selected engagements across the group. Filter by practice or industry. Return figures are confirmed with each client before publication.'})}
<section><div class="wrap">
  <div class="filters" data-filters>
    <div class="fgroup" role="group" aria-label="Filter by practice"><span class="eyebrow">Practice</span>
      <button class="pill-btn on" data-fcap="all" aria-pressed="true">All</button>${CAPS.map(c=>`<button class="pill-btn" data-fcap="${c.slug}" aria-pressed="false">${c.short}</button>`).join('')}</div>
    <div class="fgroup" role="group" aria-label="Filter by industry"><span class="eyebrow">Industry</span>
      <button class="pill-btn on" data-find="all" aria-pressed="true">All</button>${INDUSTRIES.map(x=>`<button class="pill-btn" data-find="${x.id}" aria-pressed="false">${x.t}</button>`).join('')}</div>
    <p class="fcount" aria-live="polite"><b data-fcount>${CASES.length}</b> engagements</p>
  </div>
  <div class="cases grid">${CASES.map((c,i)=>caseCard(c,i).replace('<article ',`<article id="${c.id}" `)).join('')}</div>
  <p class="empty" data-empty hidden>Nothing matches that combination yet. <button class="ulink" data-freset>Clear filters</button></p>
</div></section>
${ctaBand('Want an outcome like one of these?')}`;

/* ================= APPROACH ================= */
P['/approach']=()=>`
${phead({eyebrow:'Approach',title:'Diagnose. Design. Build. Grow.',lede:'One programme, four stages, a single outcome. Strategy, product, data and brand are designed together, so nothing is lost at the handover.'})}
<section class="sticky-steps"><div class="wrap ss-grid">
  <div class="ss-left"><div class="ss-pin">
    ${eyebrow('How a programme runs')}
    <h2 class="h2">From the number to the proof.</h2>
    <div class="ss-progress" aria-hidden="true"><i data-ss-bar></i></div>
    <ol class="ss-index">${STEPS.map((s,i)=>`<li data-ss-i="${i}" class="${i===0?'on':''}"><span>${s.n}</span>${s.t}</li>`).join('')}</ol>
  </div></div>
  <div class="ss-right">${STEPS.map((s,i)=>`
    <article class="ss-step" data-ss="${i}">
      <span class="ss-n">${s.n}</span><span class="when">${s.when}</span>
      <h3 class="h2">${s.t}</h3><p>${s.d}</p>
      <span class="eyebrow">You get</span><ul class="ticks">${s.out.map(o=>`<li>${o}</li>`).join('')}</ul>
    </article>`).join('')}</div>
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'Engagement models',h:'Four ways to work with us.',p:'Start small and prove it, or bring us in for the whole journey.'})}
  ${cards(MODELS.map(m=>({n:m.when,t:m.t,d:m.d})),4)}
</div></section>
<section class="dark"><div class="wrap">
  ${shead({eyebrow:'Principles',h:'Six things we hold to.'})}
  ${cards(PRINCIPLES.map((p,i)=>({n:String(i+1).padStart(2,'0'),t:p.t,d:p.d})))}
</div></section>
<section><div class="wrap split-2">
  <div class="gpanel reveal">${gNetwork()}</div>
  <div class="prose reveal" style="--i:1">${eyebrow('How we are set up')}<h2 class="h2">A senior core, and a network that scales.</h2><p>The people in the first meeting are the people who do the work. Around that core sits a network of trusted associates, specialists in clinical, commercial, technical and creative disciplines, who join on a defined scope when a programme needs them.</p><p>It keeps us small enough to care and broad enough to deliver end to end.</p></div>
</div></section>
${ctaBand('Which stage are you at?','Most clients start with a diagnosis sprint. Some arrive with a plan and need it built. Either works.')}`;

/* ================= INSIGHTS ================= */
P['/insights']=()=>`
${phead({eyebrow:'Insights',title:'Where markets are moving.',lede:'Short, opinionated pieces on strategy, data, AI, digital products and growth. Written by the people doing the work.'})}
<section><div class="wrap">
  <a class="ifeature reveal" data-cursor="Read" href="/insights/${INSIGHTS[0].slug}">
    <div><span class="icard-tag">${INSIGHTS[0].tag} · Latest</span><h2 class="h1">${INSIGHTS[0].t}</h2><p class="lede-s">${INSIGHTS[0].d}</p><span class="tlink">Read · ${INSIGHTS[0].mins} min</span></div>
    <div class="if-gfx">${gfx(capBySlug(INSIGHTS[0].cap).gfx)}</div>
  </a>
  <div class="icards">${INSIGHTS.slice(1).map(insightCard).join('')}</div>
</div></section>
<section class="soft"><div class="wrap">${subscribeBox('insights')}</div></section>`;

function article(a){
  const d=new Date(a.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  const cap=capBySlug(a.cap);const more=INSIGHTS.filter(x=>x.slug!==a.slug).slice(0,3);
  return `
${phead({crumb:`<a href="/insights">Insights</a><span>/</span>${a.tag}`,title:a.t.replace(/\.$/,''),lede:a.d,meta:`<span class="eyebrow">${d} · ${a.mins} min read</span>`})}
<section><div class="wrap article">
  <div class="prose lg reveal">${a.body.map(p=>`<p>${p}</p>`).join('')}</div>
  <aside class="article-side reveal" style="--i:1">
    ${eyebrow('Related practice')}<a class="mega-link" href="/capabilities/${cap.slug}"><span class="mn">${cap.n}</span><b>${cap.t}</b><span>${cap.line}</span></a>
    <a class="btn sm mag" href="/contact"><span>Talk to us about this</span></a>
  </aside>
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'Keep reading',h:'More insights.',link:['All insights','/insights']})}
  <div class="icards">${more.map(insightCard).join('')}</div>
</div></section>
<section><div class="wrap">${subscribeBox('article-'+a.slug.slice(0,40))}</div></section>`;
}
INSIGHTS.forEach(a=>{P['/insights/'+a.slug]=()=>article(a);});

/* ================= ABOUT ================= */
P['/about']=()=>`
${phead({eyebrow:'About',title:'One team for the whole journey.',lede:'Minshall Group brings strategy, digital, data and brand together under one senior team. We are hired to move a number, and we stay until it moves.'})}
<section><div class="wrap split-2">
  <div class="reveal">${eyebrow('Our story')}<h2 class="h2">From Knexu to Minshall Group.</h2></div>
  <div class="prose reveal" style="--i:1">
    <p>We started as Knexu, a strategic growth agency for sport, health and wellbeing. The work was always measured on the return: new revenue, recovered margin, unlocked capital.</p>
    <p>Over time the work kept asking for more than advice. A self-referral strategy needed a booking front end. A site decision needed a catchment model. A new service needed a brand and a launch. So we built those too, and some of them became products in their own right.</p>
    <p>Minshall Group is the name for what we became: one group with four practices and its own products, still measured on the same thing. Same people, same standards, broader reach.</p>
    <a class="tlink" href="/insights/knexu-is-now-minshall-group">Read the announcement</a>
  </div>
</div></section>
<section class="dark"><div class="wrap">
  ${shead({eyebrow:'The group',h:'How it fits together.'})}
  <div class="orgmap reveal">
    <div class="org-root">${tile('mid')}<b>Minshall Group</b><span>One outcome, one owner</span></div>
    <div class="org-branch"><span class="eyebrow">Practices</span><div class="org-row">${CAPS.map(c=>`<a href="/capabilities/${c.slug}" class="org-node"><span>${c.n}</span>${c.t}</a>`).join('')}</div></div>
    <div class="org-branch"><span class="eyebrow">Products</span><div class="org-row">${PRODUCTS.map(p=>`<a href="/products/${p.slug}" class="org-node prod-node">${p.t}<span>${p.status}</span></a>`).join('')}</div></div>
  </div>
</div></section>
<section><div class="wrap">
  ${shead({eyebrow:'What we value',h:'How we behave.'})}
  ${cards([
    {n:'01',t:'Accountable',d:'We name the number first and report against it. If it did not move, we say so.'},
    {n:'02',t:'Honest',d:'Diagnosis before prescription, and a straight answer when we are not the right people.'},
    {n:'03',t:'Builders',d:'We would rather leave something that earns than something that describes what could.'}
  ])}
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'Clients',h:'Who we work with.'})}
  <ul class="client-wall">${CLIENTS.map((c,i)=>`<li class="reveal" style="--i:${i%4}">${c}</li>`).join('')}</ul>
</div></section>
<section><div class="wrap split-2">
  <div class="reveal">${eyebrow('Work with us')}<h2 class="h2">Specialist? Join the network.</h2></div>
  <div class="prose reveal" style="--i:1"><p>We work with a trusted network of associates across clinical, commercial, product, data and creative disciplines. If you are senior, independent and want to do work that is measured on outcomes, we would like to hear from you.</p><a class="tlink" href="/contact?interest=Associate%20network">Introduce yourself</a></div>
</div></section>`;

/* ================= CONTACT ================= */
const INTERESTS=[...CAPS.map(c=>c.short),'UK market entry',...PRODUCTS.map(p=>p.t),'Associate network','Something else'];
P['/contact']=()=>`
${phead({eyebrow:'Contact',title:'Tell us the number you want to move.',lede:'The outcome you want, the constraint in the way, and the date it has to change by. We will tell you honestly whether we are the right people.'})}
<section><div class="wrap contact-grid">
  <form id="contact-form" class="cform reveal" novalidate>
    <p class="hp" hidden aria-hidden="true"><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    <fieldset class="cfield"><legend>What can we help with?</legend>
      <div class="chips-in">${INTERESTS.map((t,i)=>`<label class="chk"><input type="checkbox" name="interest" value="${t}"><span>${t}</span></label>`).join('')}</div>
    </fieldset>
    <div class="row2">
      <div class="cfield"><label for="cf-name">Your name</label><input id="cf-name" name="name" type="text" required autocomplete="name"></div>
      <div class="cfield"><label for="cf-email">Email</label><input id="cf-email" name="email" type="email" required autocomplete="email"></div>
    </div>
    <div class="row2">
      <div class="cfield"><label for="cf-org">Organisation <span class="opt">optional</span></label><input id="cf-org" name="organisation" type="text" autocomplete="organization"></div>
      <div class="cfield"><label for="cf-when">When does it need to change? <span class="opt">optional</span></label>
        <select id="cf-when" name="timeline"><option value="">Choose one</option><option>This quarter</option><option>Within six months</option><option>This year</option><option>Just exploring</option></select></div>
    </div>
    <div class="cfield"><label for="cf-msg">The outcome, the constraint, and anything else we should know</label><textarea id="cf-msg" name="message" rows="5" required></textarea></div>
    <button class="btn mag" type="submit"><span>Send it over</span></button>
    <p class="cform-status" role="status" aria-live="polite"></p>
    <p class="cform-note">We use your details only to reply. See our <a class="ulink" href="/privacy">privacy notice</a>.</p>
  </form>
  <aside class="contact-side reveal" style="--i:1">
    <div class="cs-block">${eyebrow('Email')}<a class="cs-big" href="mailto:${CONTACT.email}">${CONTACT.email}</a><p>New enquiries, partnerships and press. The form and this address both come straight to us.</p></div>
    <div class="cs-block">${eyebrow('Products')}<p>Asking about DataLense access or a Straight Talking cohort place? Tick it above and we will set up a demo.</p></div>
    <div class="cs-block">${eyebrow('What happens next')}<ol class="next"><li>We reply within two working days.</li><li>A thirty-minute call, free, with someone senior.</li><li>If we are a fit, a short written proposal scoped to the number.</li></ol></div>
  </aside>
</div></section>`;

/* ================= SEARCH LANDING PAGES ================= */
function landing(L){
  const cases=L.cases.map(id=>CASES.find(c=>c.id===id)).filter(Boolean);
  const faqLd={"@context":"https://schema.org","@type":"FAQPage","mainEntity":L.faq.map(f=>({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))};
  return `
${phead({kicker:L.eyebrow,title:L.title,lede:L.lede,gfx:L.gfx,actions:`${btn('Start a conversation','/contact')}${btn('See the work','/work',true)}`})}
<section><div class="wrap split-2">
  <div class="reveal">${eyebrow(L.whoH)}<ul class="ticks big">${L.who.map(w=>`<li>${w}</li>`).join('')}</ul></div>
  <div class="prose reveal" style="--i:1">${L.whoBody.map(p=>`<p>${p}</p>`).join('')}</div>
</div></section>
<section class="soft"><div class="wrap">
  ${shead({eyebrow:'What we do',h:'How we help.'})}
  <div class="cards c3">${L.services.map((s,i)=>`<div class="card reveal" style="--i:${i%3}"><span class="card-n">${String(i+1).padStart(2,'0')}</span><h2 class="card-h">${s.t}</h2><p>${s.d}</p></div>`).join('')}</div>
</div></section>
${cases.length?`<section><div class="wrap">
  ${shead({eyebrow:'Proof',h:'Work we have done.',link:['All work','/work']})}
  <div class="cases">${cases.map(caseCard).join('')}</div>
</div></section>`:''}
${L.slug==='digital-consultancy'?`<section class="sme-band slim"><div class="wrap sme-band-in"><div><span class="eyebrow">Small business?</span><h2 class="h2">Website refresh from £495, with a free instant check.</h2></div><a class="btn" href="/digitalsme"><span>Check my site</span></a></div></section>`:''}
${L.products?`<section class="prod-sec dark"><div class="wrap">
  ${shead({eyebrow:'Our products',h:'Platforms we built and run.'})}
  <div class="prods">${PRODUCTS.map((p,i)=>`<a class="prod reveal" style="--i:${i}" href="/products/${p.slug}" data-cursor="Open"><div class="prod-top"><span class="status${p.status==='Live'?' live':''}">${p.status}</span>${tile('mini')}</div><div class="prod-gfx">${gfx(p.gfx)}</div><h3>${p.t}</h3><p><b>${p.line}</b> ${p.d}</p><span class="tlink">Explore ${p.t}</span></a>`).join('')}</div>
</div></section>`:''}
<section class="soft"><div class="wrap split-2">
  <div class="reveal">${eyebrow('Questions')}<h2 class="h2">Frequently asked.</h2></div>
  <div class="faq reveal" style="--i:1">${L.faq.map(f=>`<details class="faq-i"><summary><h3>${f.q}</h3></summary><p>${f.a}</p></details>`).join('')}</div>
</div></section>
<script type="application/ld+json">${JSON.stringify(faqLd)}</script>
${ctaBand('Tell us the number you want to move','A first conversation is thirty minutes and costs nothing. Bring the outcome, the constraint and the date.')}`;
}
LANDINGS.forEach(L=>{P['/'+L.slug]=()=>landing(L);});

/* ================= PRIVACY ================= */
P['/privacy']=()=>`
${phead({eyebrow:'Privacy',title:'Privacy notice',lede:`How ${LEGAL.trading} uses the information you give us through this website. Last updated 17 October 2026.`})}
<section><div class="wrap"><div class="prose legal">
  <h2>Who we are</h2>
  <p>${LEGAL.trading} is a trading name of ${LEGAL.company}, a company registered in ${LEGAL.reg} (company number ${LEGAL.number}), registered office ${LEGAL.office}. ${LEGAL.company} is the controller of the personal data described here.</p>
  <h2>What we collect</h2>
  <p>When you use our contact form we collect the details you choose to give us: your name, email address, organisation, the topics you tick, when you need things to change, and your message.</p>
  <h2>Analytics</h2>
  <p>We use Microsoft Clarity to understand how visitors use this website, for example which pages are read, where people click and scroll, and where they get stuck. Clarity records anonymised usage information such as clicks, scrolling and page views, along with general device and browser details. It masks what you type into forms. Unless you have given consent, Clarity runs without setting cookies. Microsoft processes this data on our behalf; see Microsoft’s privacy statement for details. Our lawful basis is our legitimate interest in improving the website.</p>
  <p>We do not use advertising trackers. The site also stores a single flag in your browser’s session storage so the opening animation plays only once per visit; it is deleted when you close the tab.</p>
  <h2>How we use it and why</h2>
  <p>We use your details only to reply to your enquiry and, if we go on to work together, to manage that relationship. Our lawful basis is our legitimate interest in responding to people who contact us, or taking steps at your request before entering into a contract.</p>
  <p>We do not sell your information. We only send you marketing emails if you sign up to our newsletter and tick to confirm you want them.</p>
  <h2>Newsletter</h2>
  <p>If you sign up, we keep your email address, where you signed up and when, so we can send you our newsletter and prove you asked for it. Our lawful basis is your consent. Every email has an unsubscribe link, and unsubscribing takes effect straight away. Newsletters are sent through Resend.</p>
  <h2>Who processes it for us</h2>
  <p>The website is hosted by Vercel. Usage analytics are provided by Microsoft Clarity. Form submissions are delivered to us by email through Resend, and received in our Microsoft 365 mailbox. Some of these providers may process data outside the UK under appropriate safeguards.</p>
  <h2>How long we keep it</h2>
  <p>We keep enquiries for as long as we need to deal with them. If we do not go on to work together, we delete them within 24 months of our last contact.</p>
  <h2>Your rights</h2>
  <p>You can ask us for a copy of your information, to correct it, to delete it, or to stop using it. Use the <a class="ulink" href="/contact">contact form</a> and tell us what you would like us to do. If you are unhappy with how we have handled your information, you can complain to the Information Commissioner’s Office at <a class="ulink" href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a>.</p>
</div></div></section>`;

/* ================= DIGITAL SME OFFER ================= */
const gbp=n=>'£'+n.toLocaleString('en-GB');
const SME_FAQ=[
  {q:'How quickly will my site be ready?',a:'Refresh sites usually take two weeks, Rebuild three to four, and Grow five to six, from the day we have your content and the first payment. Your quote confirms the dates.'},
  {q:'What do I need to provide?',a:'Your logo, any photos you want to use, and about 15 minutes to answer our online onboarding questions in your client portal. There is no kick-off call to book: everything happens online. If you do not want to write the words, add our copywriting option.'},
  {q:'Do I keep my domain name?',a:'Yes. Your domain stays yours. We point it at the new site when it is ready to go live.'},
  {q:'Do I have to host with you?',a:`No. We build your site and place it on Vercel. You can take the code and use it on your own platform: you have ${SME.handoverDays} days from delivery to move it. Or we host it for you and point it to your domain for ${gbp(SME.hosting)} a year.`},
  {q:'What does hosting with you include?',a:`For ${gbp(SME.hosting)} a year we host your site, point your domain to it, keep the security certificate current and keep it online. It renews each year and you can leave at any time with your code.`},
  {q:'What if I need a new domain?',a:'Choose “Please secure one for me” in the quote builder to check availability and price. We register it for you and add the first year to your first invoice. The domain is yours.'},
  {q:'Who owns the website?',a:'Once the final payment is made, the design and content we create for you are yours. The terms explain exactly how this works.'},
  {q:'Is this for businesses only?',a:'Yes. This offer is for businesses and organisations, not for personal or household use.'}
];
P['/digitalsme']=()=>`
<header class="phead dark sme-hero">
  <div class="grain" aria-hidden="true"></div>
  <div class="wrap">
    <h1 class="eyebrow kicker rise" style="--i:0">Website refresh for small businesses</h1>
    <p class="display split">${split('Your website, refreshed. From £495',1)}${dot}</p>
    <p class="lede rise" style="--i:6">Paste your website address for a free instant check. You get your Webmins Score, plain-English fixes and the package that suits you, then build a fixed quote in two minutes.</p>
    <form class="sme-check rise" style="--i:7" id="sme-check" novalidate>
      <label class="sr" for="sme-url">Your website address</label>
      <input id="sme-url" name="url" type="text" inputmode="url" autocomplete="url" placeholder="yourbusiness.co.uk" required>
      <button class="btn" type="submit"><span>Check my site</span></button>
    </form>
    <p class="sme-note rise" style="--i:8">Free. Get your Webmins Score across experience, findability, trust, conversion and relevance, compared with what customers expect in your sector. Takes about 20 seconds.</p>
  </div>
</header>

<section class="sme-results" id="sme-results" hidden><div class="wrap">
  <div class="sme-loading" data-loading><span class="sme-spin" aria-hidden="true"></span><p data-loading-msg>Fetching your site…</p></div>
  <div class="sme-out" data-out hidden>
    <div class="shead"><div><span class="eyebrow">Your results</span><h2 class="h2" data-out-title>Here is how your site is doing.</h2></div><div class="shead-r"><p data-out-url></p></div></div>
    <div class="ms">
      <div class="ms-dial" data-mscore></div>
      <div class="ms-side">
        <label class="ms-ind"><span class="eyebrow">Your sector</span><select data-industry>${SCORE.industries.map(i=>`<option value="${i.id}">${i.t}</option>`).join('')}</select></label>
        <div class="pillars" data-pillars></div>
      </div>
    </div>
    <div class="ess-box"><h3 class="sme-h3" data-ess-title>What customers expect in your sector</h3><ul class="ess" data-ess></ul></div>
    <div class="lh-row"><h3 class="sme-h3">Google’s technical view</h3><div class="scores" data-scores></div><p class="psi-note" data-psi-note hidden></p></div>
    <div class="sme-grid">
      <div><h3 class="sme-h3">What we checked</h3><ul class="checks" data-checks></ul></div>
      <div><h3 class="sme-h3">What we would fix first</h3><ol class="fixes" data-fixes></ol>
        <div class="sme-rec" data-rec></div></div>
    </div>
    <form class="rep" data-report novalidate>
      <div><h3 class="sme-h3">Email me this report</h3><p>Keep your score and fixes, or forward them to whoever looks after your website.</p></div>
      <div>
        <p class="hp" hidden aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
        <div class="sub-row rep-row"><label class="sr" for="rep-email">Email address</label><input id="rep-email" name="email" type="email" required autocomplete="email" placeholder="you@yourbusiness.co.uk"><button class="btn" type="submit"><span>Send my report</span></button></div>
        <label class="sub-consent"><input type="checkbox" name="consent" required> <span>Email my report to this address.</span></label>
        <label class="sub-consent"><input type="checkbox" name="optin"> <span>Also send me one practical website tip a month (optional). See our <a class="ulink" href="/privacy">privacy notice</a>.</span></label>
        <p class="sub-status" role="status" aria-live="polite"></p>
      </div>
    </form>
  </div>
  <p class="sme-err" data-err hidden></p>
</div></section>

<section class="soft" id="packages"><div class="wrap">
  ${shead({eyebrow:'Packages',h:'Three fixed starting prices.',p:`Pick the one that fits and add only what you need. Every site is built and delivered on Vercel: take the code to your own platform within ${SME.handoverDays} days, or we host it and point your domain for ${gbp(SME.hosting)} a year. Prices exclude VAT, if applicable.`})}
  <div class="pkgs">${SME.packages.map((k,i)=>`
    <article class="pkg reveal${k.popular?' pop':''}" style="--i:${i}">
      ${k.popular?'<span class="pkg-flag">Most chosen</span>':''}
      <h3 class="pkg-name">${k.name}</h3>
      <p class="pkg-price"><span>from</span> ${gbp(k.price)}</p>
      <p class="pkg-for">${k.for}</p>
      <ul class="ticks">${k.includes.map(x=>`<li>${x}</li>`).join('')}</ul>
      <p class="pkg-time">Typically ${k.weeks}</p>
      <a class="btn${k.popular?'':' ghost'}" href="#quote" data-pick="${k.id}"><span>Choose ${k.name}</span></a>
    </article>`).join('')}</div>
</div></section>

<section id="examples"><div class="wrap">
  ${shead({eyebrow:'Examples',h:'See what we build.',p:'Three concept sites for fictional businesses, one for each package. Open them on your phone too: every site is built mobile first.'})}
  <div class="exs">${SME.examples.map((x,i)=>{const pk=SME.packages.find(k=>k.id===x.package);return `
    <article class="ex reveal" style="--i:${i}">
      <a class="ex-shot" href="/examples/${x.slug}/" target="_blank" rel="noopener" aria-label="Open the ${esc(x.name)} example site in a new tab" data-cursor="Open">
        <iframe src="/examples/${x.slug}/" title="${esc(x.name)} preview" loading="lazy" tabindex="-1" aria-hidden="true"></iframe>
      </a>
      <div class="ex-body">
        <div class="ex-top"><span class="ex-pk">${pk.name} · from ${gbp(pk.price)}</span>${x.score?`<a class="ex-score" href="/digitalsme?url=${encodeURIComponent('minshallgroup.com/examples/'+x.slug+'/')}" title="Run the check on this site"><b>${x.score}</b> Webmins</a>`:''}</div>
        <h3>${esc(x.name)}</h3><p class="ex-sector">${esc(x.sector)} · concept</p>
        <ul class="ticks">${x.features.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
        <div class="ex-acts"><a class="tlink" href="/examples/${x.slug}/" target="_blank" rel="noopener">View the site</a><a class="ulink" href="#quote" data-pick="${x.package}">Choose ${pk.name}</a></div>
      </div>
    </article>`;}).join('')}</div>
</div></section>

<section id="quote"><div class="wrap">
  ${shead({eyebrow:'Build your quote',h:'Your price, in two minutes.',p:'Tell us what you need and the price updates as you go. Send it to us and we will confirm within one working day.'})}
  <form class="qb" id="sme-form" novalidate>
    <p class="hp" hidden aria-hidden="true"><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
    <div class="qb-main">
      <fieldset class="qb-step"><legend><span>1</span>Your package</legend>
        <div class="qb-pkgs">${SME.packages.map((k,i)=>`<label class="qb-pkg"><input type="radio" name="package" value="${k.id}"${k.popular?' checked':''}><span><b>${k.name}</b><em>from ${gbp(k.price)}</em><small>Up to ${k.pages} pages</small></span></label>`).join('')}</div>
      </fieldset>
      <fieldset class="qb-step"><legend><span>2</span>How many pages?</legend>
        <div class="qb-pages"><input type="range" name="pages" id="qb-pages" aria-label="Number of pages" min="1" max="250" value="8" aria-describedby="qb-pages-out"><label class="qb-num"><input type="number" id="qb-pages-num" min="1" max="250" value="8" aria-label="Number of pages, typed"><span data-pages-out>pages</span></label></div>
        <p class="qb-hint" data-pages-hint></p>
      </fieldset>
      <fieldset class="qb-step"><legend><span>3</span>What else do you need?</legend>
        <div class="qb-addons">${SME.addons.map(a=>`<label class="qb-add" data-addon="${a.id}"><input type="checkbox" name="addon" value="${a.id}"><span><b>${a.t}</b><small>${a.d}</small></span><em data-addon-price>+${gbp(a.price)}</em></label>`).join('')}</div>
      </fieldset>
      <fieldset class="qb-step"><legend><span>4</span>Domain and hosting</legend>
        <p class="qb-sub">Do you want us to secure a domain for you, or do you already have one?</p>
        <div class="qb-pkgs two">
          <label class="qb-pkg"><input type="radio" name="dmode" value="need"><span><b>Please secure one for me</b><small>Check availability and price here. Added to your first invoice.</small></span></label>
          <label class="qb-pkg"><input type="radio" name="dmode" value="have" checked><span><b>I already have a domain</b><small>We host your new site on it</small></span></label>
        </div>
        <div class="qb-dpanel" data-dhave><div class="cfield"><label for="qb-domain">Your domain <span class="opt">optional</span></label><input id="qb-domain" name="domain" placeholder="yourbusiness.co.uk" autocomplete="off"></div></div>
        <div class="qb-dpanel" data-dneed hidden>
          <div class="qb-dsearch"><label class="sr" for="qb-dname">Domain name to check</label><input id="qb-dname" placeholder="yourbusiness" autocomplete="off"><button type="button" class="btn sm" data-dcheck><span>Check availability</span></button></div>
          <p class="qb-hint" data-dmsg>Type a name, with or without an ending. We check .co.uk, .uk, .com and .org.</p>
          <ul class="qb-dres" data-dres></ul>
        </div>
        <p class="qb-sub" style="margin-top:22px">Who hosts the finished site?</p>
        <div class="qb-pkgs two">
          <label class="qb-pkg"><input type="radio" name="hosting" value="us" checked><span><b>Host it for me</b><em>${gbp(SME.hosting)} a year</em><small>We host it on Vercel and point your domain to it</small></span></label>
          <label class="qb-pkg"><input type="radio" name="hosting" value="self"><span><b>I will host it myself</b><em>No hosting fee</em><small>We place the code on Vercel; you have ${SME.handoverDays} days to move it to your own platform</small></span></label>
        </div>
      </fieldset>
      <fieldset class="qb-step"><legend><span>5</span>About you</legend>
        <div class="row2">
          <div class="cfield"><label for="qb-name">Your name</label><input id="qb-name" name="name" required autocomplete="name"></div>
          <div class="cfield"><label for="qb-email">Email</label><input id="qb-email" name="email" type="email" required autocomplete="email"></div>
        </div>
        <div class="row2">
          <div class="cfield"><label for="qb-biz">Business name</label><input id="qb-biz" name="organisation" required autocomplete="organization"></div>
          <div class="cfield"><label for="qb-site">Current website <span class="opt">optional</span></label><input id="qb-site" name="website" inputmode="url" placeholder="yourbusiness.co.uk"></div>
        </div>
        <div class="cfield"><label for="qb-notes">Anything else we should know? <span class="opt">optional</span></label><textarea id="qb-notes" name="notes" rows="3"></textarea></div>
      </fieldset>
    </div>
    <aside class="qb-sum" aria-live="polite">
      <span class="eyebrow">Your quote</span>
      <ul class="qb-lines" data-lines></ul>
      <p class="qb-total"><span>Build total</span><b data-total>£0</b></p>
      <ul class="qb-lines qb-extra" data-extra></ul>
      <ol class="qb-stages" data-stages></ol>
      <label class="qb-agree"><input type="checkbox" name="agree" required> <span>I have read the <a class="ulink" href="/digitalsme/terms" target="_blank" rel="noopener">offer terms</a>.</span></label>
      <button class="btn" type="submit"><span>Request this quote</span></button>
      <p class="cform-status" role="status" aria-live="polite"></p>
      <p class="qb-small">No payment now. We confirm your quote and dates, then invoice the first payment. Prices exclude VAT, if applicable. Domain prices are confirmed on your quote.</p>
    </aside>
  </form>
</div></section>

<section class="soft"><div class="wrap">
  ${shead({eyebrow:'How it works',h:'Simple, fixed and clear.'})}
  <ol class="steps-row">${[
    ['Check','Run the free check and see what to fix first.'],
    ['Quote','Build your quote here. We confirm it within one working day.'],
    ['Onboard and build','Answer the onboarding questions online in your client portal, then we design and build. You approve the design there too.'],
    ['Deliver',`We place your finished site on Vercel. Take the code to your own platform within ${SME.handoverDays} days, or let us host it and point your domain for ${gbp(SME.hosting)} a year.`]
  ].map((s,i)=>`<li class="reveal" style="--i:${i}"><span class="sn">0${i+1}</span><b>${s[0]}</b><p>${s[1]}</p></li>`).join('')}</ol>
</div></section>

<section id="support"><div class="wrap">
  ${shead({eyebrow:'Hosting and support',h:'Looked after once it is live.',p:'Your site does not stop at launch. Here is what we can look after for you, and what it costs.'})}
  ${cards([
    {n:`${gbp(SME.hosting)} a year`,t:'Hosting',d:'We host your site on Vercel, point your domain to it, keep the security certificate current and keep it online. Renews yearly; leave any time with your code.'},
    {n:'At cost',t:'Domains',d:'We check availability and secure the domain for you. The first year goes on your first invoice and renewals are billed at cost. The domain is always yours.'},
    {n:'Included',t:'Launch support',d:'We fix anything we built that goes wrong in the first 30 days, free. Grow packages also include 30 days of small changes.'},
    {n:'On request',t:'Changes and updates',d:'Need a new page, new prices or a seasonal update after that? Tell us what you need and we will quote it before we start.'},
    {n:'Rebuild and Grow',t:'Analytics and reporting',d:'Microsoft Clarity shows how visitors use your site, and we send a before-and-after Webmins Score at launch.'},
    {n:`${SME.handoverDays} days`,t:'Prefer to host it yourself?',d:`We place the finished code on Vercel and you have ${SME.handoverDays} days to move it to the platform of your choice.`}
  ])}
  <div class="actions reveal">${btn('Ask about support','/contact?interest=Digital')}${btn('Build your quote','#quote',true)}</div>
</div></section>

<section class="dark"><div class="grain" aria-hidden="true"></div><div class="wrap" style="position:relative">
  ${shead({eyebrow:'Payments',h:'Paid in three equal parts.',p:'You never pay for work you have not seen. Each invoice is due within seven days.'})}
  <ol class="entry-steps three">${SME.stages.map((s,i)=>`<li class="reveal" style="--i:${i}"><span>${['⅓','⅓','⅓'][i]}</span><b>${s.t}</b><p>${s.d}</p></li>`).join('')}</ol>
</div></section>

<section class="soft"><div class="wrap">${subscribeBox('digitalsme','Not ready yet? Get the tips.','One short email a month on making a small business website earn its keep. Unsubscribe at any time.')}</div></section>

<section><div class="wrap split-2">
  <div class="reveal">${eyebrow('Questions')}<h2 class="h2">Before you ask.</h2><p class="prose" style="margin-top:20px"><a class="tlink" href="/digitalsme/terms">Read the offer terms</a></p></div>
  <div class="faq reveal" style="--i:1">${SME_FAQ.map(f=>`<details class="faq-i"><summary><h3>${f.q}</h3></summary><p>${f.a}</p></details>`).join('')}</div>
</div></section>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Service","name":"Website refresh for small businesses","serviceType":"Website design and development","provider":{"@type":"ProfessionalService","name":"Minshall Group","url":"https://minshallgroup.com"},"areaServed":"GB","url":"https://minshallgroup.com/digitalsme","offers":SME.packages.map(k=>({"@type":"Offer","name":k.name,"description":k.for,"price":k.price,"priceCurrency":"GBP","url":"https://minshallgroup.com/digitalsme#packages"}))})}</script>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":SME_FAQ.map(f=>({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))})}</script>`;

P['/digitalsme/terms']=()=>`
${phead({crumb:'<a href="/digitalsme">Website refresh</a><span>/</span>Terms',eyebrow:'',title:'Website refresh offer terms',lede:`The terms that apply when you accept a quote under our website refresh offer. Version 1, 17 October 2026.`})}
<section><div class="wrap"><div class="prose legal">
  <h2>1. Who we are and who this is for</h2>
  <p>These terms are between you and ${LEGAL.company}, trading as ${LEGAL.trading} (company number ${LEGAL.number}, registered office ${LEGAL.office}). The offer is for businesses and organisations only, not for consumers.</p>
  <h2>2. Your quote and what is included</h2>
  <p>Your quote sets out the package, the number of pages, any add-ons, the price, whether we host the site, any domain fee and the expected dates. Only what is listed in your accepted quote is included. Anything else is extra work, which we will price and agree with you in writing before we do it.</p>
  <p>Package prices are starting prices for the stated number of pages. Additional pages are charged at ${gbp(SME.extraPage)} each. All prices exclude VAT, if applicable.</p>
  <h2>3. Accepting the quote</h2>
  <p>A contract starts when you confirm the quote in writing (email is fine) and we receive the first payment. The prices on our website give an indication. Your confirmed written quote is what applies.</p>
  <h2>4. Payments</h2>
  <p>The price is paid in three equal parts:</p>
  <ul class="ticks"><li><b>One third to start.</b> This books your slot and pays for discovery and design.</li><li><b>One third at the halfway point,</b> when we show you the design and first pages for approval.</li><li><b>One third on completion,</b> when the site is ready to go live.</li></ul>
  <p>Invoices are due within seven days. If a payment is late, we may pause work until it is paid, and the timetable moves accordingly. We deliver the finished site once the final payment is received.</p>
  <h2>5. What we need from you</h2>
  <p>You agree to provide content, images, logins and approvals promptly. Our dates depend on this. If we are waiting on you for more than 30 days, we may invoice the next stage of the work completed so far and reschedule the remaining work.</p>
  <p>You confirm that you have the right to use everything you give us, such as text, images and logos, and that it does not infringe anyone else’s rights.</p>
  <h2>6. Revisions</h2>
  <p>Each package includes two rounds of changes to the design and one round of changes to the finished pages. Further changes, or changes of direction after approval, are charged as extra work.</p>
  <h2>7. Delivery, hosting and domains</h2>
  <p><b>Delivery.</b> We build your website and place the finished code on Vercel. You can then choose either of the following.</p>
  <ul class="ticks"><li><b>Host it yourself.</b> You can take the code and use it on any platform you choose. You have ${SME.handoverDays} days from delivery to move it, and we will give you access to the code or a copy of it. After ${SME.handoverDays} days we may remove our copy of the delivered site, unless you have chosen our hosting.</li><li><b>We host it.</b> We host the site and point your domain to it for ${gbp(SME.hosting)} a year, billed separately from the build. Hosting renews each year unless either of us gives notice. If you leave, we give you the code to take with you.</li></ul>
  <p>You keep ownership of your domain name in either case.</p>
  <p>If you ask us to secure a domain, we register it on your behalf and in your name where the registry allows. The first year’s fee is added to your first invoice, and renewals are billed at cost each year unless you take the domain over. Prices shown in the quote builder are indicative and confirmed in your quote. Availability is checked at the time of your quote; a domain is not reserved until it is registered, which we do once the first invoice is paid.</p>
  <p> Where your site uses third-party services, for example for hosting, email delivery, customer logins or analytics, those services run under their providers’ own terms. If your usage goes beyond their free allowances, we will tell you before passing on any cost.</p>
  <h2>8. Who owns the website</h2>
  <p>Once we have received payment in full, you own the content and design we create specifically for you. We keep ownership of our general tools, templates and code that we reuse across projects, and we give you a permanent licence to use them as part of your website. Until payment in full, everything we create remains ours.</p>
  <p>We may show your finished website in our portfolio unless you ask us not to.</p>
  <h2>9. Cancelling</h2>
  <p>Either of us may end the work by giving written notice. If you cancel, you pay for the work completed up to that point: the first payment is not refundable once discovery has started, and if the design has been approved, the second payment is due. We hand over the work you have paid for.</p>
  <h2>10. After launch</h2>
  <p>We fix any faults in what we built that you report within 30 days of launch, free of charge. Grow packages also include 30 days of support for small changes. After that, changes and support are available as extra work or through a care plan.</p>
  <h2>11. Liability</h2>
  <p>We will carry out the work with reasonable skill and care. We do not guarantee particular search rankings, visitor numbers or sales. Our total liability under these terms is limited to the price paid for the work, and we are not liable for indirect losses or loss of profit. Nothing in these terms limits liability that cannot be limited by law.</p>
  <h2>12. Data protection</h2>
  <p>Where we handle personal data on your behalf, for example enquiries submitted through your website’s forms, we act as your processor, follow your instructions and keep it secure. Our <a class="ulink" href="/privacy">privacy notice</a> explains how we handle your own details.</p>
  <h2>13. General</h2>
  <p>These terms and your accepted quote are the whole agreement between us. If there is a conflict, the quote wins. These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction.</p>
</div></div></section>`;

/* ================= CLIENT PORTAL ================= */
P['/portal']=()=>`
${phead({eyebrow:'Client portal',title:'Your project, online',lede:'Onboarding, progress, approvals, change requests, invoices and performance, all in one place. No calls needed.'})}
<section id="portal-root"><div class="wrap"><div data-portal><p class="pp-loading">Loading your portal…</p></div></div></section>`;

/* ================= INTERNAL: PROSPECTING TOOL ================= */
P['/tools/prospect']=()=>`
${phead({eyebrow:'Internal tool',title:'Prospect list',lede:'Paste prospect websites, get each one’s Webmins Score and a personalised email to send by hand from hello@.'})}
<section id="prospect"><div class="wrap">
  <form class="pt-gate" data-gate data-gate-form>
    <label for="pt-pw"><b>Password</b></label>
    <div class="pt-row"><input id="pt-pw" name="pw" type="password" autocomplete="current-password" required><button class="btn" type="submit"><span>Unlock</span></button></div>
    <p class="pt-msg" data-gate-msg role="status"></p>
  </form>
  <div data-app hidden>
    <div class="pt-input">
      <div class="cfield"><label for="pt-list">Prospects, one per line: <code>website, email, contact name</code> (email and name optional). Up to 50 at a time.</label>
        <textarea id="pt-list" name="list" rows="7" placeholder="examplecafe.co.uk, jo@examplecafe.co.uk, Jo Smith&#10;smithbuilders.co.uk"></textarea></div>
      <div class="pt-opts">
        <div class="cfield"><label for="pt-sender">Sign the emails as</label><input id="pt-sender" name="sender"></div>
        <label class="pt-check"><input type="checkbox" name="psi"> Include Google scores (slower, about 30 seconds a site)</label>
        <div class="pt-btns"><button class="btn" type="button" data-run><span>Score these sites</span></button><button class="btn ghost" type="button" data-csv><span>Download CSV</span></button><button class="ulink pt-clear" type="button" data-clear>Clear results</button></div>
        <p class="pt-count" data-count></p>
      </div>
    </div>
    <div class="pt-rules"><b>Before you send:</b> only cold-email limited companies and LLPs. Sole traders and partnerships need their consent first. Send 15–25 a day from hello@, personalise the first line, and honour every opt-out straight away.</div>
    <div class="pt-out" data-out></div>
  </div>
</div></section>`;

/* ================= 404 ================= */
P['/404']=()=>`
${phead({eyebrow:'404',title:'That page has moved, or never was.',lede:'If you followed a link from knexu.co.uk, most of what was there now lives under Capabilities, Industries and Products.',actions:`${btn('Go home','/')}${btn('Capabilities','/capabilities',true)}`})}`;
