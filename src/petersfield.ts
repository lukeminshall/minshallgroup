/* =====================================================================
   PETERSFIELD — landing page for our response to Petersfield Town
   Council's Tourism and Economic Development Digital Marketing tender.
   Hidden from search. The two portals and the dashboard are working
   previews with made-up businesses and numbers, and the page says so.
   ===================================================================== */
import {dot} from './brand';
import {split} from './components';

const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

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
const SEASONS=[
  {span:1,t:'Christmas in Petersfield',s:'Christmas',m:'Dec',f:'Lights, late shopping, gift guides from independents, festive food and drink, Small Business Saturday.'},
  {span:2,t:'Fresh Start Petersfield',s:'Fresh Start',m:'Jan to Feb',f:'New openings, winter walks and snowdrops, indoor days out at the Museum and cafes, local loyalty.'},
  {span:2,t:'Spring into Petersfield',s:'Spring',m:'Mar to Apr',f:'Music and arts events, Easter family days out, the market and seasonal produce.'},
  {span:4,t:'Summer on the Heath',s:'Summer on the Heath',m:'May to Aug',f:'The Heath and pond, the Lido, the Physic Garden, South Downs walking and cycling, outdoor dining, summer events.'},
  {span:2,t:'Heritage and Harvest',s:'Heritage and Harvest',m:'Sep to Oct',f:'Heritage Open Days, the Taro Fair, food and drink, history walks with The Petersfield Society.'},
  {span:1,t:'Shop Local, Shop Petersfield',s:'Shop Local',m:'Nov',f:'The pre-Christmas independents campaign, the build-up to the lights switch-on, parking and travel information.'}
];
const MONTHS=['Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov'];

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

/* catchment map: rough real geography, 3px per km, Petersfield at the centre */
function catchmentMap(){
  const towns:[string,number,number,string?][]=[['London',431,63,'e'],['Guildford',338,149,'e'],['Haslemere',308,200,'e'],['Alton',254,179,'w'],['Winchester',182,210,'w'],['Southampton',164,263,'w'],['Portsmouth',228,296,'w'],['Chichester',293,284,'e'],['Brighton',428,290,'e']];
  return `<svg class="pf-map" viewBox="0 0 520 380" role="img" aria-label="Map: Petersfield at the centre of a day-trip catchment, on the London to Portsmouth railway and the A3, at the edge of the South Downs National Park">
  <defs><radialGradient id="pf-glow"><stop offset="0" stop-color="#FF2E63" stop-opacity=".35"/><stop offset="1" stop-color="#FF2E63" stop-opacity="0"/></radialGradient></defs>
  <path class="pf-downs" d="M120 250 C190 232 250 236 300 252 S420 262 500 248 L500 286 C430 300 360 296 300 290 S180 284 120 292Z"/>
  <text class="pf-downs-l" x="372" y="276">South Downs National Park</text>
  <circle class="pf-ring r3" cx="260" cy="230" r="190"/><circle class="pf-ring r2" cx="260" cy="230" r="110"/><circle class="pf-ring r1" cx="260" cy="230" r="36"/>
  <text class="pf-ring-l" x="260" y="34" text-anchor="middle">Around an hour’s drive</text>
  <text class="pf-ring-l" x="260" y="114" text-anchor="middle">Day-trip heartland</text>
  <path class="pf-road" d="M228 296 C240 270 250 248 260 230 C276 206 300 190 338 149 C370 116 400 90 431 63"/>
  <path id="pf-rail" class="pf-rail" d="M228 296 C244 266 252 246 260 230 C280 214 296 206 308 200 C322 182 330 166 338 149 C366 120 398 92 431 63"/>
  <circle class="pf-train" r="5"><animateMotion dur="7s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear"><mpath href="#pf-rail"/></animateMotion></circle>
  ${towns.map(([n,x,y,a])=>`<g class="pf-town"><circle cx="${x}" cy="${y}" r="4"/><text x="${a==='w'?x-9:x+9}" y="${y+4}" text-anchor="${a==='w'?'end':'start'}">${n}</text></g>`).join('')}
  <circle cx="260" cy="230" r="60" fill="url(#pf-glow)"/>
  <circle class="pf-pulse" cx="260" cy="230" r="9"/><circle class="pf-home" cx="260" cy="230" r="8"/>
  <text class="pf-home-l" x="274" y="254">Petersfield</text>
  <g class="pf-key"><line x1="22" y1="352" x2="46" y2="352" class="pf-rail"/><text x="52" y="356">London to Portsmouth line</text><line x1="210" y1="352" x2="234" y2="352" class="pf-road"/><text x="240" y="356">A3</text></g>
</svg>`;
}

/* the business request portal: a trader submits, the Council approves */
function requestPortal(){
  const types=[['event','An event'],['offer','An offer'],['news','News or an opening'],['listing','A listing change']];
  return `<div class="pf-rp" data-pf-rp>
  <div class="pf-win pf-biz" data-step="biz">
    <div class="pf-bar"><i></i><i></i><i></i><span>visitpetersfield · share with us</span></div>
    <form class="pf-form" data-pf-form novalidate>
      <p class="pf-k">For local businesses and partners</p>
      <h3>Share something with Visit Petersfield</h3>
      <label class="pf-l">Your business<input name="biz" value="The Larder on the Square" autocomplete="off"></label>
      <fieldset class="pf-types"><legend class="pf-l">What would you like to share?</legend>
        ${types.map(([v,t],i)=>`<label><input type="radio" name="type" value="${v}"${i?'':' checked'}><span>${t}</span></label>`).join('')}</fieldset>
      <label class="pf-l">Title<input name="title" value="Late-night Christmas shopping and mulled cider" autocomplete="off"></label>
      <label class="pf-l">When<input name="when" value="Thursday 10 December, 5pm to 8pm" autocomplete="off"></label>
      <label class="pf-check"><input type="checkbox" name="ok" checked><span>We have permission to use any photos we send.</span></label>
      <button class="btn sm" type="submit"><span>Send for approval</span></button>
    </form>
  </div>
  <div class="pf-flow" aria-hidden="true"><i></i><span>Logged and sent to the Council</span></div>
  <div class="pf-win pf-council" data-step="council">
    <div class="pf-bar"><i></i><i></i><i></i><span>Council approvals</span><b class="pf-live"><i></i>Live</b></div>
    <div class="pf-cq">
      <div class="pf-cq-k"><div><span>Awaiting approval</span><b data-pf-wait>2</b></div><div><span>Approved this month</span><b data-pf-done>14</b></div><div><span>Average turnaround</span><b>1.8 days</b></div></div>
      <ul class="pf-queue" data-pf-queue>
        <li data-state="wait" data-type="event"><div><em>Event</em><b>Heath parkrun volunteer morning</b><small>Petersfield Running Club (example) · submitted yesterday</small></div><div class="pf-acts"><button type="button" data-pf-approve>Approve</button><button type="button" class="ghost" data-pf-change>Ask for changes</button></div></li>
        <li data-state="wait" data-type="listing"><div><em>Listing change</em><b>New opening hours for winter</b><small>Heathside Books (example) · submitted 2 days ago</small></div><div class="pf-acts"><button type="button" data-pf-approve>Approve</button><button type="button" class="ghost" data-pf-change>Ask for changes</button></div></li>
        <li data-state="done"><div><em>Offer</em><b>10% off for walkers on Saturdays</b><small>Downs Coffee Co. (example) · approved, in Stories on Saturday</small></div><span class="pf-tag ok">Approved</span></li>
      </ul>
      <p class="pf-audit" data-pf-audit>Every request is logged with who sent it, who approved it and where it was published.</p>
    </div>
  </div>
</div>`;
}

/* the Council's own project portal */
function councilPortal(){
  const tabs=['Overview','Plan','Approvals','Documents','Reports'];
  const stages=['Mobilise','Plan','Brand toolkit','Deliver','Review'];
  return `<div class="pf-win pf-cp" data-pf-cp data-step="cp">
  <div class="pf-bar"><i></i><i></i><i></i><span>minshallgroup.com/portal · Petersfield Town Council</span></div>
  <div class="pf-cp-in">
    <nav class="pf-cp-nav" role="tablist" aria-label="Portal sections">${tabs.map((t,i)=>`<button type="button" role="tab" aria-selected="${!i}" data-pf-tab="${i}">${t}</button>`).join('')}</nav>
    <div class="pf-cp-body">
      <section class="pf-cp-p" data-pf-panel="0">
        <p class="pf-k">Client portal · Digital marketing</p><h4>Visit Petersfield 2026/27</h4>
        <ol class="pf-stages">${stages.map((s,i)=>`<li class="${i<1?'done':i===1?'now':''}"><i></i><span>${s}</span></li>`).join('')}</ol>
        <div class="pf-tiles"><div><span>Stage</span><b>Plan</b></div><div><span>Next milestone</span><b>Plan to Council</b></div><div><span>Waiting for you</span><b>2</b></div><div><span>Next meeting</span><b>Quarterly · Feb</b></div></div>
        <div class="pf-needs"><b>What needs you</b><span>Approve the January content calendar</span><span>Introductions to event organisers</span></div>
      </section>
      <section class="pf-cp-p" data-pf-panel="1" hidden>
        <p class="pf-k">Plan and milestones</p>
        <ul class="pf-plan">
          <li class="done"><i></i><b>Handover and account access</b><span>1 Dec</span></li>
          <li class="done"><i></i><b>Christmas in Petersfield live</b><span>1 Dec</span></li>
          <li class="now"><i></i><b>Website content audit</b><span>19 Dec</span></li>
          <li><i></i><b>2027 Annual Marketing Plan to Council</b><span>Jan</span></li>
          <li><i></i><b>Brand toolkit signed off</b><span>Feb</span></li>
          <li><i></i><b>Live dashboard shared</b><span>Feb</span></li>
        </ul>
      </section>
      <section class="pf-cp-p" data-pf-panel="2" hidden>
        <p class="pf-k">Waiting for Council sign-off</p>
        <ul class="pf-apr">
          <li><div><b>January content calendar</b><small>Five working days · due 18 Dec</small></div><button type="button" data-pf-ok>Approve</button></li>
          <li><div><b>Christmas window trail artwork</b><small>Five working days · due 22 Dec</small></div><button type="button" data-pf-ok>Approve</button></li>
          <li class="ok"><div><b>Christmas in Petersfield campaign plan</b><small>Approved 26 Nov</small></div><span class="pf-tag ok">Approved</span></li>
        </ul>
      </section>
      <section class="pf-cp-p" data-pf-panel="3" hidden>
        <p class="pf-k">Documents</p>
        <ul class="pf-docs">
          <li><i>PDF</i><b>Website content audit and fix list</b><small>From Minshall Group · Dec</small></li>
          <li><i>PDF</i><b>Baseline report</b><small>From Minshall Group · Dec</small></li>
          <li><i>DOC</i><b>Christmas in Petersfield campaign plan</b><small>From Minshall Group · Nov</small></li>
          <li><i>ZIP</i><b>Existing brand assets and photo library</b><small>Shared by the Council · Nov</small></li>
        </ul>
      </section>
      <section class="pf-cp-p" data-pf-panel="4" hidden>
        <p class="pf-k">Monthly reports</p>
        <ul class="pf-docs">
          <li><i>RPT</i><b>December report and dashboard link</b><small>Two pages, published in early January</small></li>
          <li><i>RPT</i><b>Baseline: where we start</b><small>Published December</small></li>
        </ul>
        <p class="pf-note">Each report covers headline numbers, what worked, what did not, business participation, paid spend and next month’s plan.</p>
      </section>
    </div>
  </div>
</div>`;
}

/* the live dashboard the Council can open at any time */
function dashboard(){
  const bars=[38,44,41,52,57,63];const mon=['Dec','Jan','Feb','Mar','Apr','May'];
  return `<div class="pf-dash" data-step="dash">
  <div class="pf-dash-top"><b>Visit Petersfield · live dashboard</b><span class="pf-live"><i></i>Updated daily</span></div>
  <div class="pf-dk">
    <div><span>Reach outside the local area</span><b data-pf-count="61">0</b><small>% of total reach</small></div>
    <div><span>Website sessions</span><b data-pf-count="8420">0</b><small>this month</small></div>
    <div><span>Clicks to businesses</span><b data-pf-count="1260">0</b><small>to their own sites</small></div>
    <div><span>Portal requests</span><b data-pf-count="23">0</b><small>received, 21 approved</small></div>
  </div>
  <div class="pf-dg">
    <div class="pf-chart"><span class="pf-dh">Share of reach from day-trip catchments</span>
      <div class="pf-bars">${bars.map((v,i)=>`<div><i style="--h:${v}%"></i><span>${mon[i]}</span><b>${v}%</b></div>`).join('')}</div></div>
    <div class="pf-split"><span class="pf-dh">Audience this month</span>
      <div class="pf-donut" style="--v:61"><b>61%</b><span>visitors</span></div>
      <ul><li><i class="v"></i>Visitors from outside GU31/GU32</li><li><i></i>Local residents</li></ul></div>
    <div class="pf-top"><span class="pf-dh">Top pages</span>
      <ol><li>What’s On<b>2,140</b></li><li>Parking and getting here<b>1,380</b></li><li>A great day out in Petersfield<b>960</b></li><li>Petersfield by train<b>610</b></li></ol></div>
  </div>
  <p class="pf-flag">Illustrative: these numbers are made up to show the format. Real figures start with the December baseline.</p>
</div>`;
}

export function petersfieldPage(){
  let mi=0;
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
    <div class="pf-obj-card" aria-live="polite">${OBJECTIVES.map((o,i)=>`<div data-pf-op="${i}"${i?' hidden':''}><span class="pf-k">Objective 0${i+1}</span><h3>${o[0]}</h3><div class="pf-obj-2"><div><b>How we deliver it</b><p>${o[1]}</p></div><div><b>How we measure it</b><p>${o[2]}</p></div></div></div>`).join('')}</div>
  </div>
</div></section>

<section class="pf-sec" id="year"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The year at a glance</span><h2 class="h2">Six seasonal campaigns, one connected story.</h2></div><div class="shead-r reveal" style="--i:1"><p>A draft framework for the 2027 Annual Marketing Plan, tested against data in December and agreed with the Council.</p></div></div>
  <div class="pf-year reveal" data-pf-year>
    <div class="pf-months" aria-hidden="true">${MONTHS.map(m=>`<span>${m}</span>`).join('')}</div>
    <div class="pf-camps" role="tablist" aria-label="Seasonal campaigns">${SEASONS.map((s,i)=>{const b=`<button type="button" role="tab" aria-selected="${!i}" data-pf-s="${i}"${s.span===1?' class="n1"':''} style="grid-column:${mi+1} / span ${s.span}"><b>${s.s}</b><span>${s.m}</span></button>`;mi+=s.span;return b;}).join('')}</div>
    <div class="pf-camp-card" aria-live="polite">${SEASONS.map((s,i)=>`<div data-pf-sp="${i}"${i?' hidden':''}><div><span class="pf-k">${s.m}</span><h3>${s.t}</h3><p>${s.f}</p></div>
      <ul class="pf-every"><li>Hero content</li><li>A way for businesses to join in</li><li>A paid social burst where it adds value</li><li>A website landing page or feature</li></ul></div>`).join('')}</div>
  </div>
  <div class="pf-two">
    <div class="reveal"><h3 class="pf-h3">Who we start with</h3><p class="pf-note">Our starting hypothesis, tested against data in month one.</p>
      <ul class="pf-cards">${AUDIENCES.map(([t,d])=>`<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul></div>
    <div class="reveal" style="--i:1"><h3 class="pf-h3">What every post connects to</h3><p class="pf-note">Four content pillars, so nothing is a random post.</p>
      <ul class="pf-cards">${PILLARS.map(([t,d])=>`<li><b>${t}</b><span>${d}</span></li>`).join('')}</ul></div>
  </div>
</div></section>

<section class="pf-sec dark pf-portal-sec" id="portal"><div class="grain" aria-hidden="true"></div><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The business request portal</span><h2 class="h2">One fair route in for every business. The Council approves everything.</h2></div><div class="shead-r reveal" style="--i:1"><p>Businesses and partners send events, offers, news and listing changes in one place. Each request is logged and goes to the Council before anything is published. Try it: send the request, then approve it as the Council.</p></div></div>
  ${requestPortal()}
  <p class="pf-flag on-dark">Working preview with made-up businesses. Nothing you send here goes anywhere.</p>
</div></section>

<section class="pf-sec"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">The Council’s project portal</span><h2 class="h2">The plan, the approvals and the reports, in one place.</h2></div><div class="shead-r reveal" style="--i:1"><p>Council Officers get their own login to our client portal: where the work is, what needs their sign-off, every document we deliver, and every monthly report.</p></div></div>
  <div class="reveal">${councilPortal()}</div>
  <p class="pf-flag">Preview of our live client portal, filled in with an illustrative Petersfield project.</p>
</div></section>

<section class="pf-sec soft"><div class="wrap">
  <div class="shead"><div class="reveal"><span class="eyebrow">Reporting</span><h2 class="h2">Two pages a month, and a dashboard you can open any day.</h2></div><div class="shead-r reveal" style="--i:1"><p>Headline numbers, what worked, what did not, business participation, paid spend and the plan for next month. Built on Meta Business Suite, Google Analytics 4, Search Console, UTM links and Looker Studio.</p></div></div>
  <div class="reveal">${dashboard()}</div>
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
function tabs(root:HTMLElement,btnAttr:string,panelAttr:string){
  const bs=[...root.querySelectorAll<HTMLButtonElement>(`[${btnAttr}]`)],ps=[...root.querySelectorAll<HTMLElement>(`[${panelAttr}]`)];
  const key=(a:string)=>a.replace(/^data-/,'').replace(/-(\w)/g,(_,c)=>c.toUpperCase());
  bs.forEach(b=>b.addEventListener('click',()=>{
    const v=b.dataset[key(btnAttr)];
    bs.forEach(x=>x.setAttribute('aria-selected',String(x===b)));
    ps.forEach(p=>{const on=p.dataset[key(panelAttr)]===v;p.hidden=!on;if(on){p.classList.remove('pf-in');void p.offsetWidth;p.classList.add('pf-in');}});
  }));
  bs.forEach((b,i)=>b.addEventListener('keydown',e=>{if(e.key!=='ArrowDown'&&e.key!=='ArrowRight'&&e.key!=='ArrowUp'&&e.key!=='ArrowLeft')return;e.preventDefault();const n=bs[(i+(e.key==='ArrowDown'||e.key==='ArrowRight'?1:-1)+bs.length)%bs.length];n.focus();n.click();}));
}

function wirePortal(root:HTMLElement){
  const form=root.querySelector<HTMLFormElement>('[data-pf-form]'),q=root.querySelector<HTMLElement>('[data-pf-queue]');
  const wait=root.querySelector<HTMLElement>('[data-pf-wait]'),done=root.querySelector<HTMLElement>('[data-pf-done]'),audit=root.querySelector<HTMLElement>('[data-pf-audit]');
  const flow=root.querySelector<HTMLElement>('.pf-flow');
  const count=()=>{wait.textContent=String(q.querySelectorAll('[data-state="wait"]').length);};
  const TYPE:Record<string,string>={event:'Event',offer:'Offer',news:'News',listing:'Listing change'};
  const WHERE:Record<string,string>={event:'What’s On and Facebook events',offer:'Instagram Stories and the offers page',news:'Facebook, Instagram and the blog',listing:'the business directory'};
  q.addEventListener('click',e=>{
    const b=(e.target as HTMLElement).closest('button');if(!b)return;
    const li=b.closest('li') as HTMLElement;const t=li.dataset.type||'event';
    if(b.hasAttribute('data-pf-approve')){
      li.dataset.state='done';li.querySelector('.pf-acts').outerHTML='<span class="pf-tag ok">Approved</span>';
      const sm=li.querySelector('small');sm.textContent=sm.textContent.replace(/ · .*$/,'')+` · approved, scheduled for ${WHERE[t]||'What’s On'}`;
      done.textContent=String(+done.textContent+1);
      audit.innerHTML=`<b>Logged:</b> approved by the Council Officer just now, and scheduled for ${WHERE[t]||'What’s On'}.`;
    }else if(b.hasAttribute('data-pf-change')){
      li.dataset.state='change';li.querySelector('.pf-acts').outerHTML='<span class="pf-tag">Changes asked</span>';
      audit.innerHTML='<b>Logged:</b> sent back to the business with the Council’s comments.';
    }
    count();
  });
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(form);const type=String(d.get('type')||'event');
    const biz=esc(String(d.get('biz')||'').trim()||'Your business'),title=esc(String(d.get('title')||'').trim()||'Untitled request'),when=esc(String(d.get('when')||'').trim());
    if(!d.get('ok')){audit.innerHTML='<b>Held:</b> the business needs to confirm photo permission before this can be sent.';return;}
    const li=document.createElement('li');li.dataset.state='wait';li.dataset.type=type;li.className='pf-new';
    li.innerHTML=`<div><em>${TYPE[type]}</em><b>${title}</b><small>${biz}${when?` · ${when}`:''} · just now</small></div><div class="pf-acts"><button type="button" data-pf-approve>Approve</button><button type="button" class="ghost" data-pf-change>Ask for changes</button></div>`;
    flow.classList.remove('go');void flow.offsetWidth;flow.classList.add('go');
    setTimeout(()=>{q.prepend(li);count();audit.innerHTML=`<b>Logged:</b> “${title}” from ${biz}, received just now. Waiting for Council approval.`;},650);
    const btn=form.querySelector<HTMLButtonElement>('button[type=submit] span');btn.textContent='Sent. Send another?';setTimeout(()=>{btn.textContent='Send for approval';},2600);
  });
}

function wireCouncil(root:HTMLElement){
  tabs(root,'data-pf-tab','data-pf-panel');
  root.querySelectorAll<HTMLButtonElement>('[data-pf-ok]').forEach(b=>b.addEventListener('click',()=>{
    const li=b.closest('li');li.classList.add('ok');li.querySelector('small').textContent='Approved just now';b.outerHTML='<span class="pf-tag ok">Approved</span>';
  }));
}

function wireCounts(root:HTMLElement){
  const els=[...root.querySelectorAll<HTMLElement>('[data-pf-count]')];
  const io=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;io.disconnect();root.classList.add('pf-on');const t0=performance.now();
    const f=(t:number)=>{const k=Math.min(1,(t-t0)/1400),ease=1-Math.pow(1-k,3);els.forEach(el=>{el.textContent=Math.round(+el.dataset.pfCount*ease).toLocaleString('en-GB');});if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);},{threshold:.3});
  io.observe(root);
}

export function initPetersfield(){
  const obj=document.querySelector<HTMLElement>('[data-pf-obj]');if(!obj)return;
  tabs(obj,'data-pf-o','data-pf-op');
  const yr=document.querySelector<HTMLElement>('[data-pf-year]');if(yr)tabs(yr,'data-pf-s','data-pf-sp');
  const rp=document.querySelector<HTMLElement>('[data-pf-rp]');if(rp)wirePortal(rp);
  const cp=document.querySelector<HTMLElement>('[data-pf-cp]');if(cp)wireCouncil(cp);
  const dash=document.querySelector<HTMLElement>('.pf-dash');if(dash)wireCounts(dash);
}
