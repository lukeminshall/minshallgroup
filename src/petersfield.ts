/* =====================================================================
   PETERSFIELD — landing page for our response to Petersfield Town
   Council's Tourism and Economic Development Digital Marketing tender.
   Hidden from search. The two portals and the dashboard are working
   previews (see place.ts) with made-up businesses and numbers, and the
   page says so.
   ===================================================================== */
import {dot} from './brand';
import {split} from './components';

import {type Place,type Season,requestPortal,councilPortal,dashboard,year,tabs} from './place';

/* the town's reasons to visit, as the tender lists them */
const ASSETS=['The Square and market','Independent shops','Food and drink','The Heath and pond','The Lido','Physic Garden','Petersfield Museum','South Downs National Park','Mainline station','The A3'];

const OBJECTIVES=[
  ['Awareness as a visitor destination','Seasonal campaigns built on the town brand toolkit. Paid social targeted at day-trip catchments. Destination stories on the website.','Reach outside GU31 and GU32, follower growth, branded search volume.'],
  ['Footfall from a wider area','Geo-targeted paid social to drive-time and rail catchments. “Great day out” itineraries. Partnerships with neighbouring attractions.','Audience location, website sessions by region, footfall data where the Council or BID holds it.'],
  ['Local knowledge of key audiences','An evidence base built in month one from platform data, website analytics, a trader survey and partner input.','Audience profile refreshed every quarter.'],
  ['The town’s best features','Four content pillars: independents and the market, history and buildings, open spaces, what’s on.','Engagement by pillar. Top content reported monthly.'],
  ['Regular, recognisable communications','Brand toolkit and templates. A monthly content calendar approved in advance. A fixed posting rhythm.','Posting consistency and engagement rate trend.'],
  ['Attractions, events, culture and heritage','A monthly What’s On round-up. Signposting to the Museum, The Petersfield Society, the library and partners.','Click-throughs to partner sites and events page views.'],
  ['Day visitors first, local custom too','Paid budget weighted to visitor catchments. Organic content and shop-local moments for residents.','Visitor versus local audience split, every month.']
];

/* Dec to Nov; span is the number of months each campaign covers */
const SEASONS:Season[]=[
  {span:1,t:'Christmas in Petersfield',s:'Christmas',m:'Dec',f:'Lights, late shopping, gift guides from independents, festive food and drink, Small Business Saturday.'},
  {span:2,t:'Fresh Start Petersfield',s:'Fresh Start',m:'Jan to Feb',f:'New openings, winter walks and snowdrops, indoor days out at the Museum and cafes, local loyalty.'},
  {span:2,t:'Spring into Petersfield',s:'Spring',m:'Mar to Apr',f:'Music and arts events, Easter family days out, the market and seasonal produce.'},
  {span:4,t:'Summer on the Heath',s:'Summer on the Heath',m:'May to Aug',f:'The Heath and pond, the Lido, the Physic Garden, South Downs walking and cycling, outdoor dining, summer events.'},
  {span:2,t:'Heritage and Harvest',s:'Heritage and Harvest',m:'Sep to Oct',f:'Heritage Open Days, the Taro Fair, food and drink, history walks with The Petersfield Society.'},
  {span:1,t:'Shop Local, Shop Petersfield',s:'Shop Local',m:'Nov',f:'The pre-Christmas independents campaign, the build-up to the lights switch-on, parking and travel information.'}
];

const AUDIENCES=[
  ['Families','Within around an hour’s drive, looking for an easy, affordable day out.'],
  ['Walkers and outdoor visitors','Using the South Downs, and ready for a coffee, lunch or a pint after.'],
  ['Couples and friends','A food and independent shopping day out, including from London by rail.'],
  ['Local residents','Choosing to shop, eat and spend locally through the year.']
];
const PILLARS=[
  ['Eat, shop and meet','Independents, the market, cafes, restaurants and pubs.'],
  ['History and character','Buildings, stories and heritage, signposting to the Museum and The Petersfield Society.'],
  ['Outdoors','The Heath, the Lido, the Physic Garden and the South Downs.'],
  ['What’s on','Events, culture and entertainment.']
];

const EXAMPLES=[
  ['NHS trusts, with Housden Group','Attracting private patients from across the region and internationally, on an estate that still meets NHS obligations.','Know the catchment, give people a reason to travel, make the visit easy.'],
  ['Leeds Beckett University','A business delivery plan for a sport and health technology incubator, built with the university and local businesses.','Getting to know businesses and giving them a clear reason and route to take part.'],
  ['Prime Health','Self-referral pathways and the booking model behind them, so people could come in directly.','Turning interest into a visit depends on making the next step easy.'],
  ['Eventmaster','UK go-to-market for an events ticketing platform, capturing value before, during and after each event.','The value of an event for local traders is in what visitors do before and after.']
];

const INNOVATION=[
  ['Video first','Reels that show a day out in under a minute, built from our seasonal shoots and trader content.'],
  ['Creator partnerships','Hosted days for regional food, lifestyle and walking creators, in exchange for honest content.'],
  ['Trails and challenges','A Christmas window trail, or a heritage trail with the Museum, that moves visitors around the town.'],
  ['Search and AI discovery','Website content structured to answer what visitors ask search engines and AI assistants.'],
  ['Test and learn','Small monthly tests on paid creative and formats, so budget moves to what works.'],
  ['Trend review','A quarterly look at platform changes, with recommendations at each quarterly meeting.']
];

const MOBILISE=[
  ['December 2026',['Handover and account access','Christmas in Petersfield launches','Website content audit','Analytics and tracking set up','Request portal launched','Baseline report']],
  ['January 2027',['Annual Marketing Plan for approval','Brand toolkit drafted','Listening tour begins','First trader survey','Website quick wins completed','Local photographer and videographer appointed']],
  ['February 2027',['Brand toolkit signed off','Business contributor network launched','Live dashboard shared','First quarterly meeting scheduled']]
];

const ASKS=[
  ['A single point of contact','A named Council Officer, with a deputy for holiday cover.'],
  ['Portal approvals','A named approver for business requests, with an agreed turnaround. We suggest three working days, faster for time-sensitive events.'],
  ['Access at handover','Admin access to the social accounts, the website, Google Analytics, Search Console and Google Business Profile by 1 December 2026.'],
  ['Existing assets and data','Brand files, the photo and video library, brochures, past campaigns, and any visitor, footfall or car park data.'],
  ['Introductions','To the Museum, The Petersfield Society, the library, Winton House Centre, business groups and event organisers.'],
  ['Six weeks’ sight of events','The Council events calendar and planned announcements, so they can be built into campaigns.']
];

/* catchment map: real longitude and latitude, about 3px per km, Petersfield at the centre */
const PX=(lon:number,lat:number):[number,number]=>[Math.round((260+210*(lon+0.94))*10)/10,Math.round((190-333*(lat-51))*10)/10];
const line=(pts:[number,number][])=>pts.map(([lo,la],i)=>{const [x,y]=PX(lo,la);return `${i?'L':'M'}${x} ${y}`;}).join('');
/* the same points as a smooth curve (Catmull-Rom), for coast, roads and the park */
function curve(pts:[number,number][],closed=false){
  const P=pts.map(([lo,la])=>PX(lo,la)),n=P.length,at=(i:number)=>closed?P[(i+n)%n]:P[Math.max(0,Math.min(n-1,i))];
  let d=`M${P[0][0]} ${P[0][1]}`;
  for(let i=0;i<(closed?n:n-1);i++){const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2);
    const f=(v:number)=>Math.round(v*10)/10;
    d+=`C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`;}
  return d+(closed?'Z':'');
}
/* the south coast, west to east, and the Isle of Wight */
const COAST:[number,number][]=[[-2.25,50.6],[-1.95,50.7],[-1.75,50.72],[-1.55,50.75],[-1.4,50.79],[-1.32,50.82],[-1.4,50.89],[-1.3,50.85],[-1.2,50.8],[-1.1,50.785],[-0.99,50.785],[-0.88,50.78],[-0.79,50.735],[-0.68,50.775],[-0.55,50.8],[-0.37,50.808],[-0.14,50.818],[0.08,50.785],[0.26,50.74],[0.45,50.77]];
const WIGHT:[number,number][]=[[-1.58,50.66],[-1.45,50.71],[-1.3,50.76],[-1.17,50.73],[-1.08,50.7],[-1.15,50.6],[-1.3,50.58],[-1.48,50.63]];
/* the South Downs National Park: north edge west to east, then south edge back */
const DOWNS:[number,number][]=[[-1.32,51.08],[-1.05,51.05],[-0.94,51.03],[-0.75,51.01],[-0.5,50.97],[-0.25,50.92],[0,50.9],[0.25,50.82],[0.35,50.78],[0.2,50.77],[0,50.85],[-0.25,50.87],[-0.55,50.88],[-0.78,50.9],[-1,50.91],[-1.2,50.95],[-1.32,51]];
/* [name, lon, lat, label side] — sides chosen so no labels collide */
const TOWNS:[string,number,number,'l'|'r'|'t'|'b'][]=[['London',-0.12,51.5,'l'],['Basingstoke',-1.09,51.27,'l'],['Farnham',-0.8,51.21,'t'],['Guildford',-0.57,51.24,'r'],['Alton',-0.97,51.15,'t'],['Crawley',-0.19,51.11,'r'],['Haslemere',-0.71,51.09,'r'],['Salisbury',-1.79,51.07,'t'],['Winchester',-1.31,51.06,'l'],['Midhurst',-0.74,50.99,'r'],['Southampton',-1.4,50.9,'l'],['Havant',-0.98,50.85,'l'],['Chichester',-0.78,50.84,'r'],['Worthing',-0.37,50.81,'b'],['Brighton',-0.14,50.82,'r'],['Portsmouth',-1.09,50.8,'l']];
const STOPS=['London','Guildford','Haslemere','Havant','Portsmouth'];
function catchmentMap(){
  const C=PX(-0.94,51);
  const lab=(n:string,x:number,y:number,a:string)=>a==='t'?`<text x="${x}" y="${y-9}" text-anchor="middle">${n}</text>`:a==='b'?`<text x="${x}" y="${y+16}" text-anchor="middle">${n}</text>`:`<text x="${a==='l'?x-9:x+9}" y="${y+4}" text-anchor="${a==='l'?'end':'start'}">${n}</text>`;
  const T=TOWNS.map(([n,lo,la,a])=>[n,...PX(lo,la),a] as [string,number,number,string]);
  const at=(n:string)=>T.find(t=>t[0]===n);
  const [pm,hv,hs,gf,ld]=['Portsmouth','Havant','Haslemere','Guildford','London'].map(n=>at(n));
  const rail=`M${pm[1]} ${pm[2]} C${pm[1]+12} ${pm[2]-6} ${hv[1]-6} ${hv[2]+8} ${hv[1]} ${hv[2]} S${C[0]-4} ${C[1]+22} ${C[0]} ${C[1]} S${hs[1]-14} ${hs[2]+8} ${hs[1]} ${hs[2]} S${gf[1]-6} ${gf[2]+22} ${gf[1]} ${gf[2]} S${ld[1]-40} ${ld[2]+36} ${ld[1]} ${ld[2]}`;
  const a3=curve([[-1.1,50.83],[-1.02,50.9],[-0.98,50.96],[-0.96,51.01],[-0.86,51.06],[-0.73,51.11],[-0.62,51.2],[-0.5,51.3],[-0.3,51.42],[-0.15,51.52]]);
  const coast=curve(COAST),land=coast+'L560 -10L-20 -10Z',sea=coast+'L560 360L-20 360Z';
  return `<figure class="pf-map-card">
  <svg class="pf-map" viewBox="0 0 520 345" role="img" aria-label="Map of the south of England: Petersfield at the centre of a day-trip catchment, on the London to Portsmouth railway and the A3, inside the South Downs National Park">
    <defs>
      <pattern id="pf-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="rgba(255,255,255,.11)"/></pattern>
      <pattern id="pf-park" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="rgba(118,201,150,.6)"/></pattern>
      <radialGradient id="pf-glow"><stop offset="0" stop-color="#FF2E63" stop-opacity=".28"/><stop offset="1" stop-color="#FF2E63" stop-opacity="0"/></radialGradient>
      <clipPath id="pf-clip"><rect width="520" height="345"/></clipPath>
    </defs>
    <g clip-path="url(#pf-clip)">
      <path class="pf-sea-fill" d="${sea}"/><path class="pf-land" d="${land}"/><path class="pf-land" d="${curve(WIGHT,true)}"/>
      <path class="pf-coast" d="${coast}"/><path class="pf-coast" d="${curve(WIGHT,true)}"/>
      <text class="pf-sea" x="420" y="300" text-anchor="middle">English Channel</text>
      <path class="pf-downs" d="${curve(DOWNS,true)}"/>
      <circle class="pf-ring outer" cx="${C[0]}" cy="${C[1]}" r="172"/>
      <circle class="pf-ring inner" cx="${C[0]}" cy="${C[1]}" r="70"/>
      <circle cx="${C[0]}" cy="${C[1]}" r="90" fill="url(#pf-glow)"/>
      <text class="pf-downs-l" x="408" y="${C[1]+38}" text-anchor="middle">South Downs National Park</text>
      <path class="pf-road" d="${a3}"/>
      <path id="pf-rail" class="pf-rail" d="${rail}"/>
      <circle class="pf-train" r="4.5"><animateMotion dur="8s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#pf-rail"/></animateMotion></circle>
      <g class="pf-stops">${T.filter(t=>STOPS.includes(t[0])).map(([,x,y])=>`<circle cx="${x}" cy="${y}" r="4.5"/>`).join('')}</g>
      <g class="pf-town">${T.filter(t=>!STOPS.includes(t[0])).map(([,x,y])=>`<circle cx="${x}" cy="${y}" r="3.5"/>`).join('')}${T.map(([n,x,y,a])=>lab(n,x,y,a)).join('')}</g>
      <g class="pf-pill"><text x="${C[0]}" y="${C[1]-168}" text-anchor="middle">Day-trip catchment</text></g>
      <circle class="pf-pulse" cx="${C[0]}" cy="${C[1]}" r="8"/>
      <circle class="pf-home" cx="${C[0]}" cy="${C[1]}" r="7.5"/>
      <g class="pf-home-pill"><rect x="${C[0]-66}" y="${C[1]-42}" width="104" height="26" rx="13"/><path d="M${C[0]-6} ${C[1]-16.5}l6 6 6-6z"/><text x="${C[0]-14}" y="${C[1]-24}" text-anchor="middle">Petersfield</text></g>
    </g>
  </svg>
  <figcaption class="pf-map-key"><span><i class="k-rail"></i>London to Portsmouth line</span><span><i class="k-road"></i>A3</span><span><i class="k-ring"></i>Around an hour’s drive</span><span><i class="k-ring local"></i>Local: GU31 and GU32</span><span><i class="k-downs"></i>South Downs National Park</span></figcaption>
</figure>`;
}

/* the town's portals and dashboard, filled in with made-up businesses and numbers */
const PF:Place={
  host:'visitpetersfield',brand:'Visit Petersfield',client:'Petersfield Town Council',project:'Visit Petersfield 2026/27',
  biz:['The Larder on the Square','Late-night Christmas shopping and mulled cider','Thursday 10 December, 5pm to 8pm'],
  queue:[['event','Event','Heath parkrun volunteer morning','Petersfield Running Club (example) · submitted yesterday'],
    ['listing','Listing change','New opening hours for winter','Heathside Books (example) · submitted 2 days ago']],
  done:['Offer','10% off for walkers on Saturdays','Downs Coffee Co. (example) · approved, in Stories on Saturday'],
  tiles:[['Stage','Plan'],['Next milestone','Plan to Council'],['Waiting for you','2'],['Next meeting','Quarterly · Feb']],
  needs:['Approve the January content calendar','Introductions to event organisers'],
  plan:[['done','Handover and account access','1 Dec'],['done','Christmas in Petersfield live','1 Dec'],['now','Website content audit','19 Dec'],
    ['','2027 Annual Marketing Plan to Council','Jan'],['','Brand toolkit signed off','Feb'],['','Live dashboard shared','Feb']],
  approvals:[['January content calendar','Five working days · due 18 Dec'],['Christmas window trail artwork','Five working days · due 22 Dec']],
  approved:['Christmas in Petersfield campaign plan','Approved 26 Nov'],
  docs:[['PDF','Website content audit and fix list','From Minshall Group · Dec'],['PDF','Baseline report','From Minshall Group · Dec'],
    ['DOC','Christmas in Petersfield campaign plan','From Minshall Group · Nov'],['ZIP','Existing brand assets and photo library','Shared by the Council · Nov']],
  reports:[['RPT','December report and dashboard link','Two pages, published in early January'],['RPT','Baseline: where we start','Published December']],
  dash:{title:'Visit Petersfield · live dashboard',
    kpis:[['Reach outside the local area',61,'% of total reach'],['Website sessions',8420,'this month'],['Clicks to businesses',1260,'to their own sites'],['Portal requests',23,'received, 21 approved']],
    bars:[38,44,41,52,57,63],mon:['Dec','Jan','Feb','Mar','Apr','May'],visitors:61,outside:'Visitors from outside GU31/GU32',
    top:[['What’s On','2,140'],['Parking and getting here','1,380'],['A great day out in Petersfield','960'],['Petersfield by train','610']],
    flag:'Illustrative: these numbers are made up to show the format. Real figures start with the December baseline.'}
};

export function petersfieldPage(){
  return `
<header class="demo-hero dark pf-hero"><div class="grain" aria-hidden="true"></div><div class="wrap pf-hero-in">
  <div>
    <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb">Tender response<span aria-hidden="true">/</span>Petersfield Town Council</nav>
    <h1 class="display split">${split('More day visitors. More spend in the town',1)}${dot}</h1>
    <p class="lede rise" style="--i:6">Our response to the Tourism and Economic Development Digital Marketing tender. One team owning the plan, the content and the result, measured by who actually came and what they spent.</p>
    <div class="actions rise" style="--i:7"><a class="btn" href="#portal"><span>Try the request portal</span></a><a class="btn ghost" href="#year"><span>See the year</span></a></div>
  </div>
  <div class="pf-map-wrap rise" style="--i:5">${catchmentMap()}</div>
</div>
<div class="wrap"><dl class="pf-facts rise" style="--i:8">
  <div><dt>Contract</dt><dd>1 Dec 2026 to 30 Nov 2027, extendable to 2029</dd></div>
  <div><dt>Approvals</dt><dd>Nothing published without the Council’s sign-off</dd></div>
  <div><dt>Contact</dt><dd>One named lead for the whole contract</dd></div>
  <div><dt>Reporting</dt><dd>Monthly report and a live dashboard</dd></div>
</dl></div></header>

<section class="pf-sec"><div class="wrap pf-why">
  <div class="reveal"><span class="eyebrow">The opportunity</span><h2 class="h2">Petersfield already has the reasons. The job is making sure the right people hear them.</h2></div>
  <div class="reveal" style="--i:1">
    <p class="lede-s">Many market towns are trying to manufacture what Petersfield already has. The challenge is making sure people within a realistic day trip know those reasons, can plan an easy visit, and are prompted at the right moments in the year.</p>
    <ul class="pf-assets">${ASSETS.map(a=>`<li>${a}</li>`).join('')}</ul>
    <p class="pf-note">Visit Petersfield already has a strong social presence and a well-loved identity. We build on it rather than replace it.</p>
  </div>
</div></section>

<section class="pf-sec soft"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Contract objectives</span><h2 class="h2">Every objective has an activity and a measure.</h2></div><div class="shead-r reveal" style="--i:1"><p>Pick an objective to see how we deliver it and how the Council will know it is working.</p></div></div>
  <div class="pf-obj reveal" data-pf-obj>
    <div class="pf-obj-list" role="tablist" aria-label="Objectives">${OBJECTIVES.map((o,i)=>`<button type="button" role="tab" aria-selected="${!i}" data-pf-o="${i}"><span>0${i+1}</span>${o[0]}</button>`).join('')}</div>
    <div class="pf-obj-card">${OBJECTIVES.map((o,i)=>`<div data-pf-op="${i}"${i?' hidden':''}><span class="pf-k">Objective 0${i+1}</span><h3>${o[0]}</h3><div class="pf-obj-2"><div><b>How we deliver it</b><p>${o[1]}</p></div><div><b>How we measure it</b><p>${o[2]}</p></div></div></div>`).join('')}</div>
  </div>
</div></section>

<section class="pf-sec" id="year"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The year at a glance</span><h2 class="h2">Six seasonal campaigns, one connected story.</h2></div><div class="shead-r reveal" style="--i:1"><p>A draft framework for the 2027 Annual Marketing Plan, tested against data in December and agreed with the Council.</p></div></div>
  ${year(SEASONS)}
  <div class="pf-two">
    <div class="reveal"><h3 class="pf-h3">Who we start with</h3><p class="pf-note">Our starting hypothesis, tested against data in month one.</p>
      <ul class="pf-cards">${AUDIENCES.map(([t,d])=>`<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul></div>
    <div class="reveal" style="--i:1"><h3 class="pf-h3">What every post connects to</h3><p class="pf-note">Four content pillars, so nothing is a random post.</p>
      <ul class="pf-cards">${PILLARS.map(([t,d])=>`<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul></div>
  </div>
</div></section>

<section class="pf-sec dark pf-portal-sec" id="portal"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The business request portal</span><h2 class="h2">One fair route in for every business. The Council approves everything.</h2></div><div class="shead-r reveal" style="--i:1"><p>Businesses and partners send events, offers, news and listing changes in one place. Each request is logged and goes to the Council before anything is published. Try it: send the request, then approve it as the Council.</p></div></div>
  ${requestPortal(PF)}
  <p class="pf-flag on-dark">Working preview with made-up businesses. Nothing you send here goes anywhere.</p>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The Council’s project portal</span><h2 class="h2">The plan, the approvals and the reports, in one place.</h2></div><div class="shead-r reveal" style="--i:1"><p>Council Officers get their own login to our client portal: where the work is, what needs their sign-off, every document we deliver, and every monthly report.</p></div></div>
  <div class="reveal">${councilPortal(PF)}</div>
  <p class="pf-flag">Preview of our live client portal, filled in with an illustrative Petersfield project.</p>
</div></section>

<section class="pf-sec soft"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Reporting</span><h2 class="h2">Two pages a month, and a dashboard you can open any day.</h2></div><div class="shead-r reveal" style="--i:1"><p>Headline numbers, what worked, what did not, business participation, paid spend and the plan for next month. Built on Meta Business Suite, Google Analytics 4, Search Console, UTM links and Looker Studio.</p></div></div>
  <div class="reveal">${dashboard(PF)}</div>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The first 90 days</span><h2 class="h2">Live on day one, with Christmas already running.</h2></div></div>
  <ol class="pf-90">${MOBILISE.map(([m,items],i)=>`<li class="reveal" style="--i:${i}"><span class="pf-90-n">0${i+1}</span><h3>${m}</h3><ul>${(items as string[]).map(x=>`<li>${x}</li>`).join('')}</ul></li>`).join('')}</ol>
</div></section>

<section class="pf-sec soft"><div class="wrap">
  <div class="pf-honest reveal">
    <span class="eyebrow">Our experience</span>
    <h2 class="h2">We are not a traditional tourism agency. We draw people to places.</h2>
    <p class="lede-s">We want to be straight with the Council: we do not have a track record in destination marketing specifically. What we do have is a lot of experience getting people to choose a place, travel to it and spend there. The disciplines are the same.</p>
  </div>
  <div class="pf-ex">${EXAMPLES.map(([t,d,r],i)=>`<article class="reveal" style="--i:${i%2}"><h3>${t}</h3><p>${d}</p><p class="pf-rel"><b>Why it matters for Petersfield</b>${r}</p></article>`).join('')}</div>
  <p class="pf-clients reveal">Our clients include Prime Health, Medical Imaging Partnership, Housden Group, Leeds Beckett University, Northumbria University, Eventmaster, The Sponsor Collective, Technique Health and Propel Teams. <a class="ulink" href="/work">See the work</a></p>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The team</span><h2 class="h2">Two named people, one point of contact.</h2></div></div>
  <div class="pf-team">
    <article class="reveal"><span class="pf-k">Contract lead</span><h3>Luke Minshall</h3><p>Founder of Minshall Group. Leads marketing for a multi-site UK healthcare provider, covering brand, websites, social media, paid campaigns and local business outreach. Previously led UK go-to-market for an events ticketing platform. Owns the annual plan, partner relationships, reporting and quarterly meetings.</p></article>
    <article class="reveal" style="--i:1"><span class="pf-k">Content and social media lead</span><h3>Catherine Cuthill</h3><p>Leads social media for Minshall Group, Knexusport, DataLense and Minshall Group clients: content calendars, production and day-to-day channel management. Owns content creation, scheduling, community management and website updates.</p></article>
    <article class="reveal" style="--i:2"><span class="pf-k">On the ground</span><h3>A local photographer and videographer</h3><p>Appointed in Petersfield or nearby during mobilisation, so the town is shown by people who know it. Four seasonal shoots plus event coverage, building an owned image library for the Council.</p></article>
  </div>
</div></section>

<section class="pf-sec soft"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Innovation</span><h2 class="h2">Keeping it fresh, and keeping it working.</h2></div></div>
  <div class="pf-inno">${INNOVATION.map(([t,d],i)=>`<div class="reveal" style="--i:${i%3}"><span>0${i+1}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  <div class="pf-two pf-care">
    <div class="reveal"><h3 class="pf-h3">Accessible by default</h3><ul class="ticks"><li>Alt text on every image, captions on every video</li><li>Plain English and strong colour contrast in all templates</li><li>Camel case hashtags and light use of emoji</li><li>Website content to WCAG 2.2 AA principles</li><li>A new Accessible Petersfield guide, made with local groups</li></ul></div>
    <div class="reveal" style="--i:1"><h3 class="pf-h3">Data handled properly</h3><ul class="ticks"><li>UK GDPR and the Data Protection Act 2018</li><li>Written consent before using anyone’s photos or content</li><li>Portal and contact data used only for this contract</li><li>Reports use aggregated analytics, never personal data</li><li>Every account, image and piece of content stays the Council’s</li></ul></div>
  </div>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Working together</span><h2 class="h2">What we ask of the Council.</h2></div><div class="shead-r reveal" style="--i:1"><p>A programme like this works best as a partnership. In return, we commit to the deliverables, timescales and reporting in our response, and to raising any risk to delivery early.</p></div></div>
  <ul class="pf-asks">${ASKS.map(([t,d],i)=>`<li class="reveal" style="--i:${i%3}"><b>${t}</b><span>${d}</span></li>`).join('')}</ul>
</div></section>

<section class="cta-band pf-cta"><div class="wrap cta-in"><div class="reveal"><h2 class="h1">Putting a campaign together is the easy bit.</h2><p class="lede">Making it deliver for the traders on the high street is the hard bit. We would welcome the chance to talk it through.</p></div>
  <div class="actions reveal" style="--i:1"><a class="btn mag" href="mailto:luke@minshallgroup.com?subject=Petersfield%20digital%20marketing%20tender"><span>Email Luke</span></a><a class="btn mag ghost" href="/contact?interest=Petersfield%20tender"><span>Book a call</span></a></div></div></section>`;
}

/* ---------------- behaviour ---------------- */
/* let the team know the page was opened: once per visit, never for us (?me=1 marks this browser) */
function pingView(){
  try{
    if(/[?&]me=1\b/.test(location.search))localStorage.setItem('mg-me','1');
    if(localStorage.getItem('mg-me')||sessionStorage.getItem('pf-seen')||location.hostname!=='minshallgroup.com')return;
    sessionStorage.setItem('pf-seen','1');
    navigator.sendBeacon('/api/page-view',new Blob([JSON.stringify({path:'/petersfield',ref:document.referrer})],{type:'application/json'}));
  }catch{}
}

export function initPetersfield(){
  const obj=document.querySelector<HTMLElement>('[data-pf-obj]');if(!obj)return;
  pingView();
  tabs(obj,'data-pf-o','data-pf-op');
}
