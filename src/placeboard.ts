/* =====================================================================
   PLACEBOARD DEMO — a working Placeboard for Riverside, a made-up market
   town (the same fictional town as the DataLense sample). Every business,
   place and number is invented, and the page says so.
   ===================================================================== */
import {dot} from './brand';
import {split} from './components';
import {type Place,type Season,requestPortal,councilPortal,dashboard,year} from './place';

const RIVERSIDE:Place={
  host:'visitriverside',brand:'Visit Riverside',client:'Riverside Town Council',project:'Visit Riverside 2027',
  biz:['The Old Mill Café','Spring tasting menu and riverside walk','Saturday 18 April, 10am to 4pm'],
  queue:[['event','Event','Riverside makers’ market','Riverside Makers (example) · submitted yesterday'],
    ['news','News','New bike hire at the station','Station Cycles (example) · submitted 2 days ago']],
  done:['Offer','Free coffee with any walking map','Towpath Coffee (example) · approved, in Stories on Saturday'],
  tiles:[['Stage','Plan'],['Next milestone','Spring campaign live'],['Waiting for you','2'],['Next meeting','Quarterly · Apr']],
  needs:['Approve the April content calendar','Sign off the spring itinerary page'],
  plan:[['done','Accounts and analytics connected','Jan'],['done','Baseline report','Jan'],['now','Spring campaign creative','Mar'],
    ['','Annual plan to committee','Mar'],['','Summer by the River launches','May'],['','Quarterly review','Jun']],
  approvals:[['April content calendar','Five working days · due 20 Mar'],['Spring itinerary page','Five working days · due 24 Mar']],
  approved:['Spring into Riverside campaign plan','Approved 2 Mar'],
  docs:[['PDF','Place check: reach and findability','From Minshall Group · Jan'],['PDF','Baseline report','From Minshall Group · Jan'],
    ['DOC','Spring into Riverside campaign plan','From Minshall Group · Feb'],['ZIP','Town photo library','Shared by the Council · Jan']],
  reports:[['RPT','February report and dashboard link','Two pages, published in early March'],['RPT','January report','Published February']],
  dash:{title:'Visit Riverside · live dashboard',
    kpis:[['Reach outside the local area',58,'% of total reach'],['Website sessions',6930,'this month'],['Clicks to businesses',1040,'to their own sites'],['Portal requests',31,'received, 28 approved']],
    bars:[34,39,42,47,53,58],mon:['Jan','Feb','Mar','Apr','May','Jun'],visitors:58,outside:'Visitors from outside the town',
    top:[['What’s On','1,870'],['A day out by the river','1,220'],['Parking and getting here','990'],['Riverside by train','540']],
    flag:'Sample town: every number here is made up to show the format.'}
};

const SEASONS:Season[]=[
  {span:1,t:'Christmas in Riverside',s:'Christmas',m:'Dec',f:'Lights, late-night shopping, gift guides from independents, and festive food and drink.'},
  {span:2,t:'Fresh Start',s:'Fresh Start',m:'Jan to Feb',f:'New openings, winter walks, indoor days out and reasons for residents to shop local.'},
  {span:2,t:'Spring into Riverside',s:'Spring',m:'Mar to Apr',f:'Easter family days out, the makers’ market and seasonal produce.'},
  {span:4,t:'Summer by the River',s:'Summer by the River',m:'May to Aug',f:'Towpath walks and cycling, outdoor dining, the regatta and summer events.'},
  {span:2,t:'Heritage and Harvest',s:'Heritage and Harvest',m:'Sep to Oct',f:'Heritage Open Days, food and drink, and history walks.'},
  {span:1,t:'Shop Local',s:'Shop Local',m:'Nov',f:'The pre-Christmas independents campaign, the lights switch-on, and parking and travel information.'}
];

/* a schematic catchment for the made-up town: reach by road and rail */
const TOWNS:[string,number,number,'l'|'r'|'t'|'b',boolean][]=[['The City',455,48,'l',true],['Millbrook',335,138,'r',true],['Elmford',168,242,'l',true],['Port Selby',92,300,'r',true],
  ['Northgate',205,82,'t',false],['Ashby Cross',100,142,'l',false],['Haddon',408,214,'r',false],['Kelsey',300,292,'b',false]];
function sampleMap(){
  const C=[250,190];
  const lab=(n:string,x:number,y:number,a:string)=>a==='t'?`<text x="${x}" y="${y-9}" text-anchor="middle">${n}</text>`:a==='b'?`<text x="${x}" y="${y+16}" text-anchor="middle">${n}</text>`:`<text x="${a==='l'?x-9:x+9}" y="${y+4}" text-anchor="${a==='l'?'end':'start'}">${n}</text>`;
  return `<figure class="pf-map-card">
  <svg class="pf-map" viewBox="0 0 520 345" role="img" aria-label="Schematic map of Riverside, a made-up town, at the centre of rings showing 30, 60 and 90 minutes’ travel, on a railway to a city">
    <defs>
      <pattern id="pf-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="rgba(255,255,255,.11)"/></pattern>
      <pattern id="pf-park" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.4" fill="rgba(118,201,150,.6)"/></pattern>
      <radialGradient id="pf-glow"><stop offset="0" stop-color="#FF2E63" stop-opacity=".28"/><stop offset="1" stop-color="#FF2E63" stop-opacity="0"/></radialGradient>
      <clipPath id="pf-clip"><rect width="520" height="345"/></clipPath>
    </defs>
    <g clip-path="url(#pf-clip)">
      <rect class="pf-land" width="520" height="345"/>
      <path class="pf-sea-fill" d="M0 318C60 306 120 330 190 322S330 300 420 318S500 330 520 326L520 345L0 345Z"/>
      <path class="pf-coast" d="M0 318C60 306 120 330 190 322S330 300 420 318S500 330 520 326"/>
      <path class="pf-coast" d="M250 190C232 214 214 236 222 262S262 296 252 322"/>
      <path class="pf-downs" d="M346 264C370 248 420 246 452 258S480 290 452 298S372 300 350 288S330 274 346 264Z"/>
      <text class="pf-downs-l" x="414" y="282" text-anchor="middle">Country park</text>
      <circle class="pf-ring outer" cx="${C[0]}" cy="${C[1]}" r="168"/>
      <circle class="pf-ring outer" cx="${C[0]}" cy="${C[1]}" r="114"/>
      <circle class="pf-ring inner" cx="${C[0]}" cy="${C[1]}" r="58"/>
      <circle cx="${C[0]}" cy="${C[1]}" r="90" fill="url(#pf-glow)"/>
      <path class="pf-road" d="M20 168C90 160 170 178 250 190S420 222 510 236"/>
      <path id="pf-rail" class="pf-rail" d="M92 300C120 280 150 256 168 242S226 204 250 190S310 152 335 138S430 70 455 48"/>
      <circle class="pf-train" r="4.5"><animateMotion dur="8s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#pf-rail"/></animateMotion></circle>
      <g class="pf-stops">${TOWNS.filter(t=>t[4]).map(([,x,y])=>`<circle cx="${x}" cy="${y}" r="4.5"/>`).join('')}</g>
      <g class="pf-town">${TOWNS.filter(t=>!t[4]).map(([,x,y])=>`<circle cx="${x}" cy="${y}" r="3.5"/>`).join('')}${TOWNS.map(([n,x,y,a])=>lab(n,x,y,a)).join('')}</g>
      <g class="pf-pill"><text x="${C[0]}" y="${C[1]-174}" text-anchor="middle">Sample catchment</text></g>
      <circle class="pf-pulse" cx="${C[0]}" cy="${C[1]}" r="8"/>
      <circle class="pf-home" cx="${C[0]}" cy="${C[1]}" r="7.5"/>
      <g class="pf-home-pill"><rect x="${C[0]-58}" y="${C[1]-42}" width="96" height="26" rx="13"/><path d="M${C[0]-6} ${C[1]-16.5}l6 6 6-6z"/><text x="${C[0]-10}" y="${C[1]-24}" text-anchor="middle">Riverside</text></g>
    </g>
  </svg>
  <figcaption class="pf-map-key"><span><i class="k-rail"></i>Railway</span><span><i class="k-road"></i>Main road</span><span><i class="k-ring local"></i>30 minutes</span><span><i class="k-ring"></i>60 and 90 minutes</span><span><i class="k-downs"></i>Country park</span></figcaption>
</figure>`;
}

export function placeboardDemo(){
  return `
<header class="demo-hero dark pf-hero"><div class="grain" aria-hidden="true"></div><div class="wrap pf-hero-in">
  <div>
    <nav class="crumb rise" style="--i:0" aria-label="Breadcrumb"><a href="/products">Products</a><span aria-hidden="true">/</span><a href="/products/placeboard">Placeboard</a><span aria-hidden="true">/</span>Demo</nav>
    <h1 class="display split">${split('Your town, on one board',1)}${dot}</h1>
    <p class="lede rise" style="--i:6">A working Placeboard for Riverside, a made-up market town. Send a request as a local business, approve it as the council, and open the dashboard the council sees every day.</p>
    <div class="actions rise" style="--i:7"><a class="btn" href="#portal"><span>Send a request</span></a><a class="btn ghost" href="/contact?interest=Placeboard"><span>Become a founding place</span></a></div>
    <p class="demo-flag rise" style="--i:8">Sample town and made-up data. Nothing you send goes anywhere.</p>
  </div>
  <div class="pf-map-wrap rise" style="--i:5">${sampleMap()}</div>
</div>
<div class="wrap"><dl class="pf-facts rise" style="--i:8">
  <div><dt>For</dt><dd>Town and parish councils, BIDs and destination partnerships</dd></div>
  <div><dt>Businesses</dt><dd>One fair route in for every one of them</dd></div>
  <div><dt>Approvals</dt><dd>Nothing goes out without the council’s sign-off</dd></div>
  <div><dt>Results</dt><dd>A live dashboard, measured on visitors</dd></div>
</dl></div></header>

<section class="pf-sec dark pf-portal-sec" id="portal"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">01 · Local businesses</span><h2 class="h2">One fair route in. The council approves everything.</h2></div><div class="shead-r reveal" style="--i:1"><p>Businesses and partners send events, offers, news and listing changes in one place. Each request is logged and goes to the council before anything is published. Try it: send the request, then approve it as the council.</p></div></div>
  ${requestPortal(RIVERSIDE)}
  <p class="pf-flag on-dark">Made-up businesses. Nothing you send here goes anywhere.</p>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">02 · The council</span><h2 class="h2">The plan, the approvals and the reports, in one place.</h2></div><div class="shead-r reveal" style="--i:1"><p>Council officers get their own login: where the work is, what needs their sign-off, every document delivered and every monthly report. Approvals are logged with who gave them and when.</p></div></div>
  <div class="reveal">${councilPortal(RIVERSIDE)}</div>
  <p class="pf-flag">Sample project for a made-up council.</p>
</div></section>

<section class="pf-sec soft"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">03 · The year</span><h2 class="h2">Six seasonal campaigns, one connected story.</h2></div><div class="shead-r reveal" style="--i:1"><p>Every season has hero content, a way for businesses to join in and a measure agreed up front. Pick a season to see what goes into it.</p></div></div>
  ${year(SEASONS)}
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">04 · Results</span><h2 class="h2">Measured on visitors, not likes.</h2></div><div class="shead-r reveal" style="--i:1"><p>A dashboard the council can open any day, and a two-page report each month: who was reached outside the town, what they clicked through to, and how many businesses took part.</p></div></div>
  <div class="reveal">${dashboard(RIVERSIDE)}</div>
</div></section>

<section class="cta-band"><div class="wrap cta-in"><div class="reveal"><h2 class="h1">Want Placeboard for your town?</h2><p class="lede">We are looking for a small number of founding places to shape it with us.</p></div>
  <div class="actions reveal" style="--i:1"><a class="btn mag" href="/contact?interest=Placeboard"><span>Become a founding place</span></a></div></div></section>`;
}
