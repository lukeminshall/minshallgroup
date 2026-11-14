/* =====================================================================
   DIGBETH: proposal page for Digbeth BID, set out as options: the
   Placeboard software, the managed campaigns and reporting on top of
   it, and event management. Hidden from search. The portals and the
   dashboard are working previews (see place.ts) with made-up
   businesses and numbers, and the page says so.
   ===================================================================== */
import {dot} from './brand';
import {split} from './components';
import {type Place,type Season,requestPortal,councilPortal,dashboard,year,tabs} from './place';
import {PB_PRICES} from './placeboard';

const gbp=(n:number)=>'£'+n.toLocaleString('en-GB');

/* reasons people already come to Digbeth */
const ASSETS=['The Custard Factory','Independent food and drink','Live music venues and clubs','Street art','Warwick Bar and the canals','Creative and digital studios','Birmingham Coach Station','Moor Street and New Street, a short walk','HS2 Curzon Street, under construction','The St Patrick’s parade'];

/* the options: what each includes and how it is priced */
const OPTIONS=[
  {n:'01',name:'The board',price:`${gbp(PB_PRICES.embed)}<span> a year</span>`,sub:`or ${gbp(PB_PRICES.month)} a month`,for:'For a BID team that wants the tools and will run the channels itself.',
    ticks:['One route in for every business: events, offers, news and listing changes','Nothing published without the BID’s approval, and every approval logged','A live What’s On on the BID’s existing website, fed straight from approvals','A seasonal campaign plan template and a dashboard that measures visitors, not likes','Set-up, matched to your brand, and training for the team'],
    cta:['#board','See the board'],pop:true},
  {n:'02',name:'The board, run for you',price:'£14,995<span> a year</span>',sub:'or £1,250 a month, the board included',for:'For a BID team that wants more hands on the marketing.',
    ticks:['Everything in option 1','An annual marketing plan with seasonal campaigns, agreed with the board','Content, photography and social channels managed day to day','Business requests handled and prepared for your approval','A two-page monthly report for the board and levy payers, and a quarterly review'],
    cta:['#managed','See the managed service']},
  {n:'03',name:'Event management',price:'£9,000<span> an event</span>',sub:'Smaller events from £1,500, production at cost',for:'For a BID that wants signature events planned and delivered end to end.',
    ticks:['Concept, budget and programme, agreed with the BID','Licensing, road closures, safety planning and the Safety Advisory Group','Suppliers, stewarding, staging and the run of the day','Businesses signed up to take part through the board','Attendance, visitor origin and trader feedback reported after every event'],
    cta:['#events','See event management']}
];

/* the year: a draft framework, to be tested against the BID business plan */
const SEASONS:Season[]=[
  {span:1,t:'Christmas in Digbeth',s:'Christmas',m:'Dec',f:'Makers’ markets, late opening, gift guides from independents, festive food and drink and the run-up to New Year in the venues.'},
  {span:2,t:'Independent Digbeth',s:'Independent',m:'Jan to Feb',f:'New openings, indoor days out, studio and gallery visits, and reasons for the people who work in Digbeth to stay after hours.'},
  {span:2,t:'St Patrick’s and spring',s:'Spring',m:'Mar to Apr',f:'The St Patrick’s parade through Digbeth, the Irish quarter’s heritage, and the start of the outdoor season.'},
  {span:4,t:'Summer in Digbeth',s:'Summer in Digbeth',m:'May to Aug',f:'Street food, outdoor music, canal-side walks at Warwick Bar, open studios and a signature summer event.'},
  {span:2,t:'Creative Digbeth',s:'Creative Digbeth',m:'Sep to Oct',f:'Heritage Open Days, street art and industrial history walks, festivals in the venues, and the new student intake.'},
  {span:1,t:'Shop Independent',s:'Shop Independent',m:'Nov',f:'The pre-Christmas independents campaign, Small Business Saturday, and getting here by train, coach and bus.'}
];

const AUDIENCES=[
  ['People who work here','Thousands of creative, digital and office workers, given reasons to eat, drink and stay after work.'],
  ['Birmingham and the Black Country','Residents across the city and region, looking for food, music and a night out.'],
  ['Day and night visitors','Arriving by train at Moor Street and New Street or by coach, for events, gigs and the street art.'],
  ['Students','From the city’s universities, on the doorstep and new every September.']
];
const MEASURES=[
  ['Visitors, not likes','Reach and website visits from outside Digbeth, by area, every month.'],
  ['Clicks to businesses','How many people clicked through to a levy payer’s own site, menu or booking page.'],
  ['Business participation','How many businesses sent requests, took part in campaigns and joined events.'],
  ['Footfall where it exists','Footfall counters, venue and event attendance, with the BID’s own data where it holds it.']
];

/* event management: what we handle */
const EVENT_SERVICES=[
  ['Plan and budget','The concept, programme, budget and timeline, agreed with the BID before anything is booked.'],
  ['Licensing and safety','Temporary event notices, road closures with Birmingham City Council, the event management plan, risk assessments and the Safety Advisory Group.'],
  ['Suppliers and site','Staging, power, sound, toilets, security and stewarding, appointed and managed by us.'],
  ['Businesses involved','Levy payers sign up through the board to trade, offer a deal or host part of the programme.'],
  ['Promotion','The event runs as a campaign: social, the What’s On feed, partners and press.'],
  ['Results','Attendance, where people came from, trader feedback and spend indicators, reported to the board.']
];

/* the life of an event, as tabs */
const EVENT_STAGES=[
  ['12 weeks out','Plan and permissions','Concept, budget and programme signed off. Site visit. Licensing and road closure applications made. First suppliers booked.','A one-page event plan and budget to approve, and a timeline with every deadline.'],
  ['8 weeks out','Businesses and partners','Businesses invited through the board to trade, offer or host. Sponsors and partners confirmed. Safety documents to the Safety Advisory Group.','Who has signed up, in the portal, and the safety pack for sign-off.'],
  ['4 weeks out','Promotion','The event campaign goes live on social, the What’s On feed and partner channels. Registration or ticketing opens if needed.','Reach and sign-ups on the dashboard, week by week.'],
  ['Event week','Final checks','Supplier and steward briefings, the run sheet, the site plan, contingencies and weather plans confirmed.','The final run sheet and contact list, with one named lead on call.'],
  ['On the day','Delivery','We run the site: build, stewarding, timings, traders and any issues, with content captured through the day.','A named event manager on site from build to clear-down.'],
  ['After','Report and learn','Clear-down, supplier sign-off and a debrief with the BID. Trader survey and visitor data pulled together.','A short event report for the board and levy payers within ten working days.']
];

/* starting points for a programme, to shape with the BID */
const EVENT_IDEAS=[
  ['A signature summer event','One weekend that puts Digbeth on the regional calendar, with the venues, street food and art.'],
  ['Digbeth late','A monthly late opening for shops, studios, bars and galleries, with something on in the streets.'],
  ['Makers’ markets','Seasonal markets for independent makers and food producers, with Christmas the biggest.'],
  ['Walks and open studios','Guided street art, canal and industrial heritage walks, and studios open to the public.']
];

/* pricing, excluding VAT: [line, £ a year (0 = included), note] */
type Line=[string,number,string];
const PRICES:{tab:string,head:string,body:string,lines:Line[],total:string,after:string}[]=[
  {tab:'Option 1 · The board',head:`${gbp(PB_PRICES.embed)} + VAT a year.`,
    body:`Or ${gbp(PB_PRICES.month)} a month with no annual commitment. A founding place price for 2027, held for founding places in later years. Everything needed to go live is included.`,
    lines:[['The board: requests, approvals, What’s On feed and dashboard',PB_PRICES.embed,'Unlimited businesses and requests'],['Set-up, and matching the feed to the BID brand',0,'Included'],['Training for the BID team',0,'Included'],['Hosting, support and updates',0,'Included']],
    total:'Total, a year',after:''},
  {tab:'Option 2 · Run for you',head:'£14,995 + VAT a year.',
    body:'Or £1,250 a month. The same in years two and three. From year two, the £1,800 for the plan and baseline moves into extra content and paid media, as agreed in the annual plan. Paid media is passed through at cost and reported in full.',
    lines:[['Social media management and organic content',5400,'£450 a month'],['Seasonal photography and video',2400,'Four shoots in Digbeth'],['Paid social media budget',2000,'Passed through at cost'],['Annual plan, evidence base and baseline',1800,'Year one only'],['Business requests and engagement',1500,'Handled and prepared for approval'],['The board',PB_PRICES.embed,'Option 1, included'],['Monthly reporting and quarterly reviews',900,'']],
    total:'Total, year one',after:''},
  {tab:'Option 3 · Events',head:'£9,000 + VAT for a signature event.',
    body:'Our fee to plan, permit, deliver and report a one-day signature event. Production costs such as staging, power, security, stewarding and toilets are budgeted with the BID up front and passed through at cost, with no mark-up.',
    lines:[['Plan, budget and programme',1500,'Agreed with the BID before anything is booked'],['Licensing, safety documents and the Safety Advisory Group',1800,''],['Event-day management team',1600,'An event manager and two crew, build to clear-down'],['Promotion campaign',1500,'Social, What’s On, partners and press'],['Supplier booking and management',1200,''],['Business sign-up and partners',900,'Through the board'],['Report and debrief',500,'Within ten working days']],
    total:'Fee, per signature event',after:'Smaller formats: a Digbeth late from £1,500 an evening, a makers’ market from £2,500 a day. An annual programme is quoted together, with one plan, one licensing calendar and one report to the board.'}
];

const EXAMPLES=[
  ['Eventmaster','UK go-to-market for an events ticketing platform, capturing value before, during and after each event.','The value of an event for traders is in what visitors do before and after it, and in knowing who came.'],
  ['NHS trusts, with Housden Group','Attracting private patients from across the region and internationally, on an estate that still meets NHS obligations.','Know the catchment, give people a reason to travel, make the visit easy.'],
  ['Leeds Beckett University','A business delivery plan for a sport and health technology incubator, built with the university and local businesses.','Getting businesses to take part depends on a clear reason and an easy route in.'],
  ['Prime Health','Self-referral pathways and the booking model behind them, so people could come in directly.','Turning interest into a visit depends on making the next step easy.']
];

const NEXT=[
  ['Try the demo','Two minutes, set in Ripon: send a request as a business, approve it as the BID and watch it appear on the website.'],
  ['A 20-minute call','To understand the BID’s business plan priorities and which option fits the team you have.'],
  ['A founding place for 2027','A small number of founding places, at founding prices, to shape Placeboard with us.']
];

/* catchment map: real longitude and latitude, about 3px per km, Digbeth at the centre */
const PX=(lon:number,lat:number):[number,number]=>[Math.round((260+203*(lon+1.885))*10)/10,Math.round((175-333*(lat-52.476))*10)/10];
const TOWNS:[string,number,number,'l'|'r'|'t'|'b'][]=[['Wolverhampton',-2.128,52.586,'l'],['Walsall',-1.982,52.586,'t'],['Lichfield',-1.826,52.682,'r'],['Tamworth',-1.695,52.633,'r'],['Stafford',-2.117,52.806,'t'],['Telford',-2.447,52.677,'l'],['Derby',-1.476,52.92,'r'],['Leicester',-1.133,52.636,'r'],['Nuneaton',-1.465,52.523,'r'],['Coventry',-1.512,52.408,'b'],['Rugby',-1.264,52.37,'b'],['Solihull',-1.778,52.413,'b'],['Leamington Spa',-1.535,52.292,'r'],['Stratford-upon-Avon',-1.708,52.192,'b'],['Redditch',-1.94,52.306,'l'],['Kidderminster',-2.249,52.388,'l'],['Worcester',-2.22,52.192,'l'],['Northampton',-0.893,52.24,'l']];
const STOPS=['Coventry','Rugby'];
function catchmentMap(){
  const C=PX(-1.885,52.476);
  const lab=(n:string,x:number,y:number,a:string)=>a==='t'?`<text x="${x}" y="${y-9}" text-anchor="middle">${n}</text>`:a==='b'?`<text x="${x}" y="${y+16}" text-anchor="middle">${n}</text>`:`<text x="${a==='l'?x-9:x+9}" y="${y+4}" text-anchor="${a==='l'?'end':'start'}">${n}</text>`;
  const T=TOWNS.map(([n,lo,la,a])=>[n,...PX(lo,la),a] as [string,number,number,string]);
  const at=(n:string)=>T.find(t=>t[0]===n);
  const [cv,rg]=[at('Coventry'),at('Rugby')];
  /* the line to London: Birmingham, Coventry, Rugby, then off the map to the south-east */
  const rail=`M${C[0]} ${C[1]} C${C[0]+30} ${C[1]+18} ${cv[1]-30} ${cv[2]-2} ${cv[1]} ${cv[2]} S${rg[1]-30} ${rg[2]+4} ${rg[1]} ${rg[2]} S${rg[1]+80} ${rg[2]+40} 540 ${rg[2]+90}`;
  return `<figure class="pf-map-card">
  <svg class="pf-map" viewBox="0 0 520 345" role="img" aria-label="Map of the West Midlands: Digbeth at the centre of Birmingham, with Wolverhampton, Walsall, Solihull, Coventry and Lichfield within around 30 minutes to an hour, and the railway to London">
    <defs>
      <radialGradient id="dg-glow"><stop offset="0" stop-color="#FF2E63" stop-opacity=".28"/><stop offset="1" stop-color="#FF2E63" stop-opacity="0"/></radialGradient>
      <clipPath id="dg-clip"><rect width="520" height="345"/></clipPath>
    </defs>
    <g clip-path="url(#dg-clip)">
      <rect class="pf-land" width="520" height="345"/>
      <circle class="pf-ring outer" cx="${C[0]}" cy="${C[1]}" r="180"/>
      <circle class="pf-ring inner" cx="${C[0]}" cy="${C[1]}" r="75"/>
      <circle cx="${C[0]}" cy="${C[1]}" r="90" fill="url(#dg-glow)"/>
      <path id="dg-rail" class="pf-rail" d="${rail}"/>
      <circle class="pf-train" r="4.5"><animateMotion dur="8s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#dg-rail"/></animateMotion></circle>
      <g class="pf-stops">${T.filter(t=>STOPS.includes(t[0])).map(([,x,y])=>`<circle cx="${x}" cy="${y}" r="4.5"/>`).join('')}</g>
      <g class="pf-town">${T.filter(t=>!STOPS.includes(t[0])).map(([,x,y])=>`<circle cx="${x}" cy="${y}" r="3.5"/>`).join('')}${T.map(([n,x,y,a])=>lab(n,x,y,a)).join('')}</g>
      <g class="pf-pill"><text x="510" y="332" text-anchor="end">To London Euston, about 80 minutes</text></g>
      <circle class="pf-pulse" cx="${C[0]}" cy="${C[1]}" r="8"/>
      <circle class="pf-home" cx="${C[0]}" cy="${C[1]}" r="7.5"/>
      <g class="pf-home-pill"><rect x="${C[0]-42}" y="${C[1]-42}" width="84" height="26" rx="13"/><path d="M${C[0]-6} ${C[1]-16.5}l6 6 6-6z"/><text x="${C[0]}" y="${C[1]-24}" text-anchor="middle">Digbeth</text></g>
    </g>
  </svg>
  <figcaption class="pf-map-key"><span><i class="k-rail"></i>Railway to London</span><span><i class="k-ring local"></i>Around 30 minutes</span><span><i class="k-ring"></i>Around an hour</span></figcaption>
</figure>`;
}

/* the BID's portals and dashboard, filled in with made-up businesses and numbers */
const DG:Place={
  host:'digbethbid.co.uk',brand:'Digbeth BID',client:'Digbeth BID',project:'Digbeth BID 2027 · sample plan',org:'BID',
  biz:['A Custard Factory café (example)','Late opening with live DJs in the courtyard','Friday 4 December, 6pm to 11pm'],
  queue:[['event','Event','Open studio weekend','A Floodgate Street studio (example) · submitted yesterday'],
    ['offer','Offer','Two-for-one street food before gigs','A Digbeth food hall (example) · submitted 2 days ago']],
  done:['News','New canal-side bar opens at Warwick Bar','A Fazeley Street bar (example) · approved, on Instagram on Friday'],
  tiles:[['Stage','Plan'],['Next milestone','Plan to the board'],['Waiting for you','2'],['Next meeting','Quarterly · Mar']],
  needs:['Approve the February content calendar','Confirm the summer event date'],
  plan:[['done','Board set up and businesses invited','Jan'],['done','Baseline report','Jan'],['now','Spring campaign and St Patrick’s content','Feb'],
    ['','2027 marketing plan to the BID board','Feb'],['','Summer event licensing submitted','Mar'],['','Quarterly review','Mar']],
  approvals:[['February content calendar','Five working days · due 23 Jan'],['Summer event plan and budget','Ten working days · due 30 Jan']],
  approved:['Independent Digbeth campaign plan','Approved 12 Jan'],
  docs:[['PDF','Baseline report: reach and findability','From Minshall Group · Jan'],['DOC','Summer event plan and budget','From Minshall Group · Jan'],
    ['DOC','Independent Digbeth campaign plan','From Minshall Group · Jan'],['ZIP','BID brand files and photo library','Shared by the BID · Jan']],
  reports:[['RPT','January report and dashboard link','Two pages, published in early February'],['RPT','Baseline: where we start','Published January']],
  dash:{title:'Digbeth · live dashboard (sample)',
    kpis:[['Reach outside Digbeth',72,'% of total reach'],['Website sessions',9310,'this month'],['Clicks to businesses',1480,'to their own sites'],['Board requests',38,'received, 35 approved']],
    bars:[52,57,55,61,66,72],mon:['Jan','Feb','Mar','Apr','May','Jun'],visitors:72,outside:'Visitors from outside Digbeth',
    top:[['What’s on in Digbeth','2,460'],['Street art walk','1,310'],['Getting here: trains, coaches and parking','1,050'],['Eat and drink','880']],
    flag:'Illustrative: these numbers are made up to show the format. They are not Digbeth’s results.'}
};

export function digbethPage(){
  return `
<header class="demo-hero dark pf-hero"><div class="grain" aria-hidden="true"></div><div class="wrap pf-hero-in">
  <div>
    <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb">Proposal<span aria-hidden="true">/</span>Digbeth BID</nav>
    <h1 class="display split">${split('More people in Digbeth. More reasons to stay',1)}${dot}</h1>
    <p class="lede rise" style="--i:6">Three options for Digbeth BID’s first term, from the software on its own to campaigns and events delivered for you. Each one is measured by who came and what they did, so the board can report a return to levy payers.</p>
    <div class="actions rise" style="--i:7"><a class="btn" href="#options"><span>See the options</span></a><a class="btn ghost" href="#board"><span>Try the request portal</span></a></div>
  </div>
  <div class="pf-map-wrap rise" style="--i:5">${catchmentMap()}</div>
</div>
<div class="wrap"><dl class="pf-facts rise" style="--i:8">
  <div><dt>Term</dt><dd>Digbeth BID’s first term, from 2026</dd></div>
  <div><dt>Approvals</dt><dd>Nothing published without the BID’s sign-off</dd></div>
  <div><dt>Price</dt><dd>From ${gbp(PB_PRICES.embed)} + VAT a year, fixed and itemised</dd></div>
  <div><dt>Contact</dt><dd>One named lead, whichever options you choose</dd></div>
</dl></div></header>

<section class="pf-sec"><div class="wrap pf-why">
  <div class="reveal"><span class="eyebrow">The opportunity</span><h2 class="h2">Digbeth already has the reasons. The job is making sure the right people hear them.</h2></div>
  <div class="reveal" style="--i:1">
    <p class="lede-s">Digbeth has more going on than most districts its size: venues, food, studios, street art and canals, a short walk from two city centre stations. A first-term BID has to turn that into more visits for levy payers, and show them the evidence.</p>
    <ul class="pf-assets">${ASSETS.map(a=>`<li>${a}</li>`).join('')}</ul>
    <p class="pf-note">We have not yet seen the BID business plan. Whatever you choose is built on its priorities, not ours.</p>
  </div>
</div></section>

<section class="pf-sec soft" id="options"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The options</span><h2 class="h2">Start with the board. Add as many hands as you need.</h2></div><div class="shead-r reveal" style="--i:1"><p>Option 1 is the software. Option 2 adds our team running it. Option 3, event management, can be taken on its own, but works best with the board, because business sign-up and promotion run through it.</p></div></div>
  <div class="pkgs dg-opts">${OPTIONS.map((o,i)=>`<article class="pkg${o.pop?' pop':''} reveal" style="--i:${i}">
      ${o.pop?'<span class="pkg-flag">Founding place price</span>':''}<span class="dg-n">Option ${o.n}</span>
      <h3 class="pkg-name">${o.name}</h3>
      <p class="pkg-price">${o.price}</p>
      <p class="pb-month">${o.sub}</p>
      <p class="pkg-for">${o.for}</p>
      <ul class="ticks">${o.ticks.map(t=>`<li>${t}</li>`).join('')}</ul>
      <a class="btn${o.pop?'':' ghost'}" href="${o.cta[0]}"><span>${o.cta[1]}</span></a>
    </article>`).join('')}</div>
  <p class="pf-flag">Prices exclude VAT. Need a new visitor website as well? We build one from ${gbp(PB_PRICES.site)}, with the board built in.</p>
</div></section>

<section class="pf-sec" id="pricing"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Price</span><h2 class="h2">What each option costs, line by line.</h2></div><div class="shead-r reveal" style="--i:1"><p>Fixed prices, so the board knows the cost before it commits. Options 2 and 3 can be combined, and the board is never charged twice.</p></div></div>
  <div class="dg-price reveal" data-dg-price>
    <div class="dg-ptabs" role="tablist" aria-label="Price by option">${PRICES.map((o,i)=>`<button type="button" role="tab" aria-selected="${!i}" data-dg-p="${i}">${o.tab}</button>`).join('')}</div>
    ${PRICES.map((o,i)=>{const total=o.lines.reduce((a,l)=>a+l[1],0),paid=o.lines.filter(l=>l[1]);return `<div class="pf-price-w" data-dg-pp="${i}"${i?' hidden':''}>
      <div><h3 class="h2">${o.head}</h3><p class="lede-s">${o.body}</p>${o.after?`<p class="pf-note">${o.after}</p>`:''}</div>
      <div class="pf-price">
        <div class="pf-stack" aria-hidden="true">${paid.map((l,j)=>`<i style="--w:${l[1]/total*100}%;--o:${1-j*.11}"></i>`).join('')}</div>
        <table><caption class="sr">${o.tab} price breakdown, excluding VAT</caption><tbody>${o.lines.map(([t,v,n])=>{const j=paid.findIndex(l=>l[0]===t);return `<tr><td><i style="--o:${j<0?0.15:1-j*.11}"></i>${t}${n?`<small>${n}</small>`:''}</td><td>${v?gbp(v):'Included'}</td></tr>`;}).join('')}</tbody>
        <tfoot><tr><td>${o.total}</td><td>${gbp(total)}</td></tr></tfoot></table>
      </div>
    </div>`;}).join('\n    ')}
  </div>
</div></section>

<section class="pf-sec dark pf-portal-sec" id="board"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Option 1 · The board</span><h2 class="h2">One fair route in for every business. The BID approves everything.</h2></div><div class="shead-r reveal" style="--i:1"><p>Businesses send events, offers, news and listing changes through one simple form. You approve them, and they go straight onto a live What’s On on the BID website and your social channels. Nothing to copy or re-upload. Try it: send the request, then approve it as the BID.</p></div></div>
  ${requestPortal(DG)}
  <p class="pf-flag on-dark">Working preview with made-up businesses. Nothing you send here goes anywhere.</p>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Option 1 · Results</span><h2 class="h2">Measured on visitors, not likes.</h2></div><div class="shead-r reveal" style="--i:1"><p>A dashboard the BID can open any day: who was reached outside Digbeth, what they clicked through to, and how many businesses took part. The figures levy payers want to see.</p></div></div>
  <div class="reveal">${dashboard(DG)}</div>
  <p class="pf-note dg-demo">See the board working end to end, with the What’s On feed on a website: <a class="ulink" href="/products/placeboard/demo">the two-minute demo set in Ripon</a>.</p>
</div></section>

<section class="pf-sec soft" id="managed"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Option 2 · The board, run for you</span><h2 class="h2">A year of campaigns, one connected story.</h2></div><div class="shead-r reveal" style="--i:1"><p>A draft framework for the year, to be tested against the BID business plan and agreed with the board. Every season has hero content, a way for businesses to join in, and a measure agreed up front.</p></div></div>
  ${year(SEASONS)}
  <div class="pf-two">
    <div class="reveal"><h3 class="pf-h3">Who we start with</h3><p class="pf-note">Our starting hypothesis, tested against data in month one.</p>
      <ul class="pf-cards">${AUDIENCES.map(([t,d])=>`<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul></div>
    <div class="reveal" style="--i:1"><h3 class="pf-h3">What we report to the board</h3><p class="pf-note">Two pages a month, and a quarterly review.</p>
      <ul class="pf-cards">${MEASURES.map(([t,d])=>`<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul></div>
  </div>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Option 2 · The BID’s project portal</span><h2 class="h2">The plan, the approvals and the reports, in one place.</h2></div><div class="shead-r reveal" style="--i:1"><p>The BID team gets its own login to our client portal: where the work is, what needs sign-off, every document we deliver and every monthly report.</p></div></div>
  <div class="reveal">${councilPortal(DG)}</div>
  <p class="pf-flag">Preview of our live client portal, filled in with an illustrative Digbeth project.</p>
</div></section>

<section class="pf-sec soft" id="events"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Option 3 · Event management</span><h2 class="h2">Events planned, permitted, delivered and reported.</h2></div><div class="shead-r reveal" style="--i:1"><p>We take an event from an idea to a report for the board. The BID approves the plan and the budget. We handle the rest, with one named event manager from first meeting to clear-down.</p></div></div>
  <div class="pf-inno">${EVENT_SERVICES.map(([t,d],i)=>`<div class="reveal" style="--i:${i%3}"><span>0${i+1}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  <h3 class="pf-h3 dg-h3 reveal">The life of an event</h3>
  <div class="pf-obj reveal" data-dg-ev>
    <div class="pf-obj-list" role="tablist" aria-label="Stages of an event">${EVENT_STAGES.map((o,i)=>`<button type="button" role="tab" aria-selected="${!i}" data-dg-e="${i}"><span>0${i+1}</span>${o[0]}</button>`).join('')}</div>
    <div class="pf-obj-card">${EVENT_STAGES.map((o,i)=>`<div data-dg-ep="${i}"${i?' hidden':''}><span class="pf-k">${o[0]}</span><h3>${o[1]}</h3><div class="pf-obj-2"><div><b>What we do</b><p>${o[2]}</p></div><div><b>What the BID sees</b><p>${o[3]}</p></div></div></div>`).join('')}</div>
  </div>
  <div class="pf-two">
    <div class="reveal"><h3 class="pf-h3">Where a programme could start</h3><p class="pf-note">Ideas to shape with the BID and the venues, not a fixed list.</p>
      <ul class="pf-cards">${EVENT_IDEAS.map(([t,d])=>`<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul></div>
    <div class="reveal" style="--i:1"><h3 class="pf-h3">Done properly</h3><p class="pf-note">The things that must be right before anyone arrives.</p>
      <ul class="ticks"><li>Public liability insurance in place, and suppliers’ cover checked</li><li>An event management plan and risk assessments for every event</li><li>Licensing, road closures and the Safety Advisory Group handled to their deadlines</li><li>Accessible sites, routes and information, planned in from the start</li><li>Written consent before we use anyone’s photos or content</li></ul></div>
  </div>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="pf-honest reveal">
    <span class="eyebrow">Our experience</span>
    <h2 class="h2">We draw people to places, and help them choose to spend there.</h2>
    <p class="lede-s">Placeboard is new, and we want to be straight about that: the founding places for 2027 will shape it with us. What we bring is experience of getting people to choose a place, travel to it and spend there, including the ticketing side of events.</p>
  </div>
  <div class="pf-ex">${EXAMPLES.map(([t,d,r],i)=>`<article class="reveal" style="--i:${i%2}"><h3>${t}</h3><p>${d}</p><p class="pf-rel"><b>Why it matters for Digbeth</b>${r}</p></article>`).join('')}</div>
  <p class="pf-clients reveal">Our clients include Prime Health, Medical Imaging Partnership, Housden Group, Leeds Beckett University, Northumbria University, Eventmaster, The Sponsor Collective, Technique Health and Propel Teams. <a class="ulink" href="/work">See the work</a></p>
</div></section>

<section class="pf-sec soft"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The team</span><h2 class="h2">Named people, one point of contact.</h2></div></div>
  <div class="pf-team">
    <article class="reveal"><span class="pf-k">Lead</span><h3>Luke Minshall</h3><p>Founder of Minshall Group. Leads marketing for a multi-site UK healthcare provider, covering brand, websites, social media, paid campaigns and local business outreach. Previously led UK go-to-market for an events ticketing platform. Owns the plan, the relationship with the BID and the reporting.</p></article>
    <article class="reveal" style="--i:1"><span class="pf-k">Content and social media lead</span><h3>Catherine Cuthill</h3><p>Leads social media for Minshall Group, Knexusport, DataLense and Minshall Group clients: content calendars, production and day-to-day channel management. Owns content, scheduling and community management under option 2.</p></article>
    <article class="reveal" style="--i:2"><span class="pf-k">On the ground</span><h3>Local specialists</h3><p>A Birmingham photographer and videographer, and for events, licensed suppliers for staging, security and stewarding. Appointed and managed by us, so the BID has one contract and one contact.</p></article>
  </div>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Next steps</span><h2 class="h2">Three easy ways to take this forward.</h2></div></div>
  <ol class="pf-90">${NEXT.map(([t,d],i)=>`<li class="reveal" style="--i:${i}"><span class="pf-90-n">0${i+1}</span><h3>${t}</h3><p class="dg-next">${d}</p></li>`).join('')}</ol>
</div></section>

<section class="cta-band pf-cta"><div class="wrap cta-in"><div class="reveal"><h2 class="h1">Putting a campaign together is the easy bit.</h2><p class="lede">Making it deliver for the businesses in Digbeth is the hard bit. We would welcome the chance to talk it through.</p></div>
  <div class="actions reveal" style="--i:1"><a class="btn mag" href="/products/placeboard/demo"><span>Try the demo</span></a><a class="btn mag ghost" href="mailto:luke@minshallgroup.com?subject=Digbeth%20BID"><span>Email Luke</span></a></div></div></section>`;
}

/* ---------------- behaviour ---------------- */
/* let the team know the page was opened: once per visit, never for us (?me=1 marks this browser) */
function pingView(){
  try{
    if(/[?&]me=1\b/.test(location.search))localStorage.setItem('mg-me','1');
    if(localStorage.getItem('mg-me')||sessionStorage.getItem('dg-seen')||location.hostname!=='minshallgroup.com')return;
    sessionStorage.setItem('dg-seen','1');
    navigator.sendBeacon('/api/page-view',new Blob([JSON.stringify({path:'/digbeth',ref:document.referrer})],{type:'application/json'}));
  }catch{}
}

export function initDigbeth(){
  const ev=document.querySelector<HTMLElement>('[data-dg-ev]');if(!ev)return;
  pingView();
  tabs(ev,'data-dg-e','data-dg-ep');
  const pr=document.querySelector<HTMLElement>('[data-dg-price]');if(pr)tabs(pr,'data-dg-p','data-dg-pp');
}
