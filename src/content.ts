/* =====================================================================
   CONTENT — every word on the site that is likely to change lives here.
   To add a case study, insight, capability or industry, add an entry to
   the relevant array: pages, navigation, filters, the sitemap and the
   prerendered HTML all pick it up automatically.
   Return figures are qualitative until each client signs off numbers.
   ===================================================================== */

/* The public address. The contact form also delivers here (api/contact.js). */
export const CONTACT={email:'hello@minshallgroup.com'};

/* ---------------- CAPABILITIES (the four practices) ---------------- */
export const CAPS=[
  {slug:'strategy',n:'01',t:'Strategy & Consultancy',short:'Strategy',gfx:'catchment',
    line:'Find the number, and the route to it.',
    d:'Growth strategy, market entry, business cases and service redesign, each scoped to a financial outcome before we start.',
    lede:'We are hired to move a number and to be able to show how. What you get is a decision, a plan with named owners, and the evidence that it worked.',
    body:['Most organisations do not lack ideas. They lack a clear view of where the value actually sits, a plan that survives contact with operations, and somebody accountable for the result. That is the gap we work in.',
      'Every engagement starts by naming the outcome it is for: grow revenue, recover margin or unlock capital. Then we diagnose what is really true, design the route, and stay with it into delivery. When the plan needs a platform, a data product or a brand to be real, the rest of the group builds it.'],
    services:[
      {t:'Growth strategy',d:'Where the next pound of revenue comes from, ranked by size, speed and certainty, with a plan and owner for each.'},
      {t:'UK market entry',d:'For overseas companies bringing a product to the UK: market sizing, priority locations, pricing, partner programmes and measured pilots. Delivered in partnership with XV Capital Advisory.'},
      {t:'Business cases & investment',d:'Cases built to satisfy an investment committee or funder: modelled, evidenced and defensible line by line.'},
      {t:'Service & pathway redesign',d:'Mapping how work really flows, finding where it waits, and reconfiguring around the constraint to recover capacity.'},
      {t:'Bids & tenders',d:'Bids written to be scored against the scheme, with evidence behind every claim and a delivery model that holds up.'},
      {t:'Partnerships & commercialisation',d:'Turning facilities, expertise and research into packaged, sellable offerings and the partnerships that buy them.'}],
    feature:{eyebrow:'Bringing businesses to the UK',h:'UK market entry, with XV Capital Advisory.',
      body:['XV Capital Advisory works with sportstech and healthtech companies looking to grow internationally. When those companies choose the UK, we run the entry on the ground: where to launch, who buys, at what price, through which partners, and how to prove it is working.',
        'The work is phased, and each phase ends with something the company can act on: a validated market and location model, a named target list, a business case its finance team will accept, a founding-partner programme, and a pilot with agreed measures. The company can stop, adjust or carry on at each step, so capital goes in one stage at a time.'],
      steps:[{t:'Validate',d:'Market size, priority locations and buyers confirmed on UK data.'},{t:'Prepare',d:'Target list, business case, pricing and partner terms.'},{t:'Pilot',d:'A measured pilot with founding partners, reported weekly.'},{t:'Scale',d:'A twelve-month rollout plan built on the pilot evidence.'}],
      partner:{name:'XV Capital Advisory',d:'Sportstech capital and advisory'},
      cases:['neurotech-uk','eventmaster']},
    returns:[{n:'Revenue',t:'New lines, better conversion',d:'Revenue from demand you have not been capturing and markets you have not entered.'},
      {n:'Margin',t:'Capacity returned',d:'Leakage removed from the pathways and processes that consume time without returning it.'},
      {n:'Capital',t:'Decisions de-risked',d:'Investment released by a case that stands up, and protected from the wrong site or the wrong bet.'}]},
  {slug:'digital',n:'02',t:'Digital & Product',short:'Digital',gfx:'layers',
    line:'Build the thing the strategy needs.',
    d:'Product discovery, UX and UI, web platforms, apps, portals and integrations, built in usable slices and owned by you.',
    lede:'A small, senior product team that designs and ships real software: patient and customer front ends, portals, platforms and the integrations that tie them together.',
    body:['If a recommendation depends on a spreadsheet and the one person who knows how it works, it is fragile. We build the missing piece properly: designed around the people who will use it, connected to the systems you already run, and shipped into production with real authentication and an audit trail.',
      'We work in slices. Each one is usable and earning on its own, so the programme returns value long before it is complete. Two of our own products, DataLense and Straight Talking, started exactly this way.'],
    services:[
      {t:'Product discovery',d:'The one question the product must answer, the people it serves and the data model under it, agreed before a line of code.'},
      {t:'UX & UI design',d:'Interfaces designed with and for real users, prototyped, tested and handed to build as a living design system.'},
      {t:'Web platforms',d:'Fast, accessible, search-friendly websites and web apps that are easy for your own team to keep current.'},
      {t:'Apps & portals',d:'Booking, referral, patient, member and partner portals, built against the systems you already depend on.'},
      {t:'Integration & APIs',d:'Clinical, CRM, finance and booking systems connected so data stops being retyped and starts being trusted.'},
      {t:'Build, run & hand over',d:'We host and run it with a runbook, or hand it to your team with the keys, the schema and the documentation.'}],
    returns:[{n:'Revenue',t:'Demand converted online',d:'Self-serve journeys that turn interest into bookings and bookings into revenue without a phone call.'},
      {n:'Margin',t:'Manual work removed',d:'Double entry, chasing and reconciliation designed out of the operation.'},
      {n:'Capital',t:'An asset you own',d:'Software, data and IP that sit on your balance sheet.'}]},
  {slug:'data-ai',n:'03',t:'Data, AI & Automation',short:'Data & AI',gfx:'radar',
    line:'Turn data into decisions, and decisions into routine.',
    d:'Commercial intelligence, analytics, geospatial insight, practical AI and workflow automation that a busy team can actually run.',
    lede:'We help organisations see their market and their operation clearly, then use automation and AI where it reliably saves time or improves a decision, and nowhere else.',
    body:['Most of the data needed to make a better decision already exists. It is scattered across registers, systems and spreadsheets, and nobody has time to join it up. We build the pipelines, the reference sets and the dashboards a board can read in ten minutes.',
      'On AI we are deliberately practical. We start with the work itself: where is time being lost, where is a judgement being made badly, and what would a safe, auditable assistant change? If the honest answer is "nothing", we say so.'],
    services:[
      {t:'Commercial intelligence',d:'Market sizing, competitor mapping and demand modelling, joined into one view of where to play and how to win.'},
      {t:'Dashboards & reporting',d:'Operational and board reporting that shows where work sits, how long it has waited and what it is costing.'},
      {t:'Geospatial & catchment analysis',d:'Drivetime catchments, population profiles and site scoring for location and investment decisions.'},
      {t:'AI adoption',d:'Use-case discovery, safe pilots and copilots grounded in your own data, with governance built in from day one.'},
      {t:'Workflow automation',d:'Repetitive admin, triage and reconciliation automated end to end, with a human in the loop where it matters.'},
      {t:'Data foundations',d:'Pipelines, reference data and governance that make every number traceable to its source and coverage.'}],
    returns:[{n:'Revenue',t:'Sharper targeting',d:'Effort pointed at the markets, sites and customers most likely to pay back.'},
      {n:'Margin',t:'Hours given back',d:'Routine work automated so skilled people spend time on skilled work.'},
      {n:'Capital',t:'Better bets',d:'Investment decisions made on evidence that says what it does not know.'}]},
  {slug:'brand-growth',n:'04',t:'Brand, Marketing & Growth',short:'Brand & Growth',gfx:'funnel',
    line:'Make the market notice, and convert when it does.',
    d:'Brand strategy and identity, content, campaigns, search, CRM and sponsorship, all measured against the same commercial number.',
    lede:'Brand and marketing that are accountable to the commercial plan: a clear story, told consistently, to the right people, with every channel measured on what it returns.',
    body:['Great strategy fails quietly when nobody hears about it. We give organisations a sharper position, an identity that earns trust, and the content and campaigns that put it in front of the people who buy.',
      'Because the same team owns the strategy and the platforms, marketing is wired into the operation from day one. A campaign lands on a booking journey that converts, and the dashboard shows what it returned.'],
    services:[
      {t:'Brand strategy & identity',d:'Positioning, naming, messaging and visual identity that make a complex offer simple to understand and choose.'},
      {t:'Content & storytelling',d:'Case studies, thought leadership, video and web content that demonstrates what you know.'},
      {t:'Campaigns & launches',d:'Integrated launches for new services, sites and products, planned backwards from the commercial target.'},
      {t:'Search & performance',d:'SEO, paid search and social, managed to cost per acquisition.'},
      {t:'CRM & lifecycle',d:'Referrer, patient, member and customer journeys that nurture demand and bring people back.'},
      {t:'Sponsorship & partnerships',d:'Commercial frameworks that turn audiences and assets into sponsorship and partner income.'}],
    returns:[{n:'Revenue',t:'More of the right demand',d:'Qualified enquiries and bookings, attributed to the activity that created them.'},
      {n:'Margin',t:'Lower cost to acquire',d:'Spend moved from what is noisy to what actually converts.'},
      {n:'Capital',t:'Brand equity',d:'A reputation that raises prices, wins tenders and attracts partners.'}]}
];

/* ---------------- THE THREE RETURNS ---------------- */
export const RETURNS=[
  {n:'01',t:'Grow revenue',gfx:'return',d:'New revenue lines, better conversion of the demand you already have, and commercial assets that were never properly monetised.'},
  {n:'02',t:'Recover margin',gfx:'ecg',d:'Reconfiguration and automation that remove leakage and return operational, clinical and commercial capacity to the work that pays.'},
  {n:'03',t:'Unlock capital',gfx:'dial',d:'Business cases, analysis and assets that release investment, protect it from the wrong decision and de-risk the next one.'}
];

/* ---------------- INDUSTRIES ---------------- */
export const INDUSTRIES=[
  {id:'health',t:'Health & care',gfx:'pathway',d:'Independent diagnostics, NHS private patient units, provider groups and clinics.',
    challenges:['Self-pay demand that arrives but does not convert','Referral-to-report pathways leaking capacity','Site and investment decisions made on instinct','Patient-reported outcome obligations (PHIN, PROMs)'],
    caps:['strategy','digital','data-ai'],clients:['Prime Health','Medical Imaging Partnership','Housden Group','Technique Health']},
  {id:'sport',t:'Sport',gfx:'pitch',d:'Governing bodies, clubs, tournaments, events and the businesses that serve them.',
    challenges:['Commercial estate that is under-monetised','Ticketing that ends at the transaction','Sponsorship packages nobody is buying','Participation that does not grow the base'],
    caps:['strategy','brand-growth','digital'],clients:['Eventmaster','The Sponsor Collective','Propel Teams']},
  {id:'wellbeing',t:'Wellbeing & third sector',gfx:'wave',d:'Community wellness, charities and social enterprises delivering prevention and support.',
    challenges:['Income that depends on the next grant round','Impact that is real but hard to evidence','Prevention work disconnected from downstream care','Small teams with no data capacity'],
    caps:['strategy','data-ai','brand-growth'],clients:['Leeds Beckett University','Prime Health']},
  {id:'education',t:'Universities & research',gfx:'scatter',d:'Universities, incubators and research centres with assets that could earn.',
    challenges:['Research strength with no route to market','Facilities and services that are not commercialised','Delivery plans that need to unlock funding','Industry partners that are hard to find'],
    caps:['strategy','brand-growth','digital'],clients:['Leeds Beckett University','Northumbria University']},
  {id:'public',t:'Public sector',gfx:'bracket',d:'NHS trusts, local authorities and public bodies working inside a framework.',
    challenges:['Tenders that should be won but are not','Obligations outrunning resources','Private patient income under-developed','Reporting that consumes the time it measures'],
    caps:['strategy','data-ai','digital'],clients:['Housden Group','Medical Imaging Partnership']},
  {id:'growth',t:'Growth & private companies',gfx:'network',d:'Independent providers, operators, scale-ups and start-ups finding their next stage.',
    challenges:['A client base too narrow to grow from','A route to market that has not been built','Operations that will not scale with demand','A brand that undersells the business'],
    caps:['strategy','brand-growth','digital','data-ai'],clients:['Eventmaster','Technique Health','Propel Teams']}
];

/* ---------------- PRODUCTS (A Minshall Group company) ---------------- */
export const PRODUCTS=[
  {slug:'datalense',t:'DataLense',status:'Live',url:'https://datalense.org',gfx:'radar',
    line:'Healthcare commercial intelligence.',
    d:'Drivetime catchment scoring, competitor mapping and population health profiles for any UK site decision, before the capital is committed.'},
  {slug:'straight-talking',t:'Straight Talking',status:'First cohort · October 2026',gfx:'layers',
    line:'Patient-reported outcomes, done properly.',
    d:'One capture surface across the whole clinical journey, with PHIN and PROMs instruments layered on top, turning an obligation into evidence.'}
];

/* ---------------- CASE STUDIES ----------------
   caps: which practices were involved (drives the Work filters).
   ind:  industry id (see INDUSTRIES).                                    */
export const CASES=[
  {id:'prime-health',client:'Prime Health',ind:'health',caps:['strategy','digital','brand-growth'],gfx:'funnel',
    head:'A new revenue line, not a report',
    ch:'Access to diagnostics was gated behind traditional referral, capping direct demand and slowing patients down at the point of entry.',
    ap:'We designed self-referral pathways and the booking and access model around them, so patients could enter directly without loosening clinical governance.',
    ret:'A direct self-pay revenue line and higher conversion of the demand already arriving, with less pressure on traditional referral routes.'},
  {id:'neurotech-uk',client:'ASX-listed neurotechnology company',ind:'health',caps:['strategy','data-ai','brand-growth'],gfx:'catchment',status:'In progress',
    head:'Taking a medical wearable to the UK',
    ch:'A listed neurotechnology company had UK regulatory registration for its wearable muscle-sensing device and early pilots, but no UK channel, pricing or clinic-facing proposition.',
    ap:'Alongside XV Capital Advisory, we produced an independent UK market report: where affluence, self-pay demand and premium physiotherapy overlap, the priority locations, a clinic-led route to market and a founding-partner programme, with a phased entry plan and pilot measures.',
    ret:'An evidence-led route into the UK that lets the company commit capital one phase at a time.'},
  {id:'housden',client:'Housden Group',ind:'public',caps:['strategy','brand-growth'],gfx:'return',
    head:'NHS private patient units, run as a business',
    ch:'NHS Trusts sit on private patient units that under-serve the commercial opportunity, while still meeting the NHS obligation from the same estate.',
    ap:'Working as part of Housden Group, we support PPU growth across multiple Trusts: insurer and referrer engagement, pathway and access design, and the commercial case.',
    ret:'Private patient income grown inside the NHS framework, with PPUs run as a managed commercial operation.'},
  {id:'mip',client:'Medical Imaging Partnership',ind:'health',caps:['strategy','data-ai','digital'],gfx:'pathway',
    head:'Capacity recovered across a network',
    ch:'A multi-site imaging network carrying accessibility and efficiency drag across the referral-to-report pathway.',
    ap:'We mapped the real referral-to-report flow across sites, found where work waited, and reconfigured booking, handover and reporting around the constraint.',
    ret:'Enhanced patient pathways, improved access and recovered capacity across the network.'},
  {id:'eventmaster',client:'Eventmaster',ind:'sport',caps:['strategy','brand-growth','digital'],gfx:'area',
    head:'Every ticket, more revenue',
    ch:'Ticketing was procured as a payment tool, generating a transaction and nothing after it.',
    ap:'We built the strategy for its entry into the UK market, connecting ticketing to retail, fundraising and engagement, and optimised the pre-sale and post-event journey.',
    ret:'Revenue captured before, during and after the event, across grassroots and non-elite events.'},
  {id:'leeds-beckett',client:'Leeds Beckett University',ind:'education',caps:['strategy'],gfx:'grid',
    head:'Research, made fundable',
    ch:'A new sport and health technology incubator with no route from research to funded delivery.',
    ap:'We developed the business delivery plan through stakeholder engagement, knowledge development and delivery frameworks.',
    ret:'A roadmap built to unlock funding and industry partnership around otherwise stranded research.'},
  {id:'northumbria',client:'Northumbria University',ind:'education',caps:['strategy','brand-growth'],gfx:'scatter',
    head:'Campus expertise, packaged to sell',
    ch:'The Newcastle campus held facilities, services and expertise that could generate income but were not being commercialised.',
    ap:'We work with the university to monetise its services, packaging facilities and expertise into sellable offerings and taking them to market.',
    ret:'New commercial income from campus services and facilities that were previously untapped.'},
  {id:'sponsor-collective',client:'The Sponsor Collective',ind:'sport',caps:['brand-growth','strategy'],gfx:'pitch',
    head:'Idle assets into sponsorship income',
    ch:'Clubs sitting on commercial estate they could not convert into sponsorship income.',
    ap:'We built tailored sponsorship frameworks scaled from grassroots to elite, matched to what each club could realistically offer a sponsor.',
    ret:'New sponsorship revenue and improved financial stability from assets that were previously idle.'},
  {id:'technique-health',client:'Technique Health',ind:'growth',caps:['strategy','brand-growth'],gfx:'network',
    head:'Reshaped to scale',
    ch:'Structural challenges and a client base too narrow to grow from.',
    ap:'We resolved the underlying structural issues and redefined the client engagement model so it could scale.',
    ret:'A business reshaped and ready to expand into new markets.'},
  {id:'propel',client:'Propel Teams',ind:'growth',caps:['strategy','brand-growth'],gfx:'bracket',
    head:'A route to market for a cohort',
    ch:'Strong team management, but no structured route to market for the start-up cohort.',
    ap:'We provided mentorship and a structured commercial route to market for the cohort.',
    ret:'Team-management strength translated into high-value client solutions.'}
];

/* ---------------- CHALLENGE FINDER (home page) ---------------- */
export const FINDER=[
  {q:'Grow revenue',caps:['strategy','brand-growth','digital'],a:'Find the demand you are not capturing, build the journey that converts it, and tell the market it exists.',case:'prime-health'},
  {q:'Bring a business to the UK',caps:['strategy','data-ai','brand-growth'],a:'Where to launch, who buys, at what price and through which partners, then a measured pilot. Delivered with XV Capital Advisory.',case:'neurotech-uk'},
  {q:'Enter a new market',caps:['strategy','brand-growth'],a:'Research, positioning and a go-to-market plan, then the launch that puts it in front of buyers.',case:'eventmaster'},
  {q:'Fix an operation',caps:['strategy','data-ai','digital'],a:'Map how work really flows, recover the capacity it is losing, and automate what should never have been manual.',case:'mip'},
  {q:'Make a site or investment decision',caps:['data-ai','strategy'],a:'Catchment, competitor and population evidence joined into a case an investment committee can trust.',case:'leeds-beckett'},
  {q:'Build a platform or app',caps:['digital','data-ai'],a:'A senior product team shipping usable slices into production, connected to the systems you already run.',case:'prime-health'},
  {q:'Use AI safely',caps:['data-ai','digital'],a:'Find where time is lost, pilot safely on your own data, and govern it from day one.',case:'mip'},
  {q:'Refresh our brand',caps:['brand-growth','strategy'],a:'A sharper position, an identity that earns trust, and content that demonstrates what you know.',case:'technique-health'},
  {q:'Commercialise what we have',caps:['strategy','brand-growth'],a:'Package facilities, expertise and audiences into offerings someone will pay for, and find the buyer.',case:'northumbria'}
];

/* ---------------- APPROACH ---------------- */
export const STEPS=[
  {n:'01',t:'Diagnose',when:'Weeks 1–3',d:'We agree the number the work is accountable for, then establish what is actually true: where demand comes from, where work waits, what the market looks like from the customer’s side.',out:['The outcome and how it is measured','A diagnosis you can share with a board','The three moves most likely to pay back']},
  {n:'02',t:'Design',when:'Weeks 3–6',d:'Strategy, service, product and brand designed together, so the plan is buildable and the build is on-strategy. Scope is agreed, then defended.',out:['A plan with owners and leading indicators','Service and product blueprints','A locked scope for the first slice']},
  {n:'03',t:'Build',when:'Weeks 6–14',d:'The first usable slice goes live in a real environment: a pathway, a platform, a dashboard, a campaign. Demonstrated live, not screenshotted.',out:['A working slice in production','Real users, real data, real feedback','Evidence the number is moving']},
  {n:'04',t:'Grow',when:'Ongoing',d:'Extend slice by slice, optimise against the measure, and hand over with the keys when you are ready to run it yourselves.',out:['Reporting against the original number','Further slices on the same spine','A clean handover and runbook']}
];
export const MODELS=[
  {t:'Sprint',when:'2–4 weeks',d:'A focused diagnosis, business case, catchment analysis or brand sprint. One question, answered properly.'},
  {t:'Programme',when:'3–12 months',d:'Strategy through delivery across one or more practices, run against a single outcome with a named owner.'},
  {t:'Build & run',when:'Ongoing',d:'We design, build and operate a platform or data product for you, with service levels and a runbook.'},
  {t:'Embedded partner',when:'Flexible',d:'Senior commercial, product or marketing leadership embedded in your team, part-time, for as long as it is useful.'}
];
export const PRINCIPLES=[
  {t:'Name the number first',d:'Before scoping, we agree the outcome an engagement is accountable for and how it will be measured.'},
  {t:'Diagnosis before prescription',d:'We establish what is true before we recommend anything. The honest version is worth more.'},
  {t:'Senior people, on the work',d:'The people in the first meeting are the people doing the work. Specialists join on defined scope.'},
  {t:'Ship in slices',d:'Each piece is usable and returning on its own. Nothing sits in a six-month build with no outcome until the end.'},
  {t:'You own the asset',d:'Data models, code, content and IP belong to the client, documented and ready to hand over.'},
  {t:'Say so when we are wrong',d:'When a source fails or a hypothesis does not hold, we say so. A missing number beats a plausible wrong one.'}
];

/* ---------------- INSIGHTS ----------------
   Short, opinionated pieces. Add one by appending to this array: it gets
   its own page at /insights/<slug>, a card on /insights and the sitemap. */
export const INSIGHTS=[
  {slug:'knexu-is-now-minshall-group',tag:'News',cap:'strategy',date:'2026-10-16',mins:3,
    t:'Knexu is now Minshall Group',
    d:'Same people, same standards, a broader offer. Why we changed our name, and what it means for clients.',
    body:['Knexu is now Minshall Group. The people, the clients and the way we work are the same. What has changed is the size of the job we are asked to do, and the name now reflects it.',
      'Knexu started as a strategic growth agency for sport, health and wellbeing. Every engagement was scoped to a number: new revenue, recovered margin or unlocked capital. That has not changed, and it will not.',
      'What changed is what it took to move those numbers. A self-referral strategy needed a booking journey to make it real. A site decision needed a catchment model, so we built one, and it became DataLense. A patient-reported outcomes obligation needed a better way to capture the patient’s voice, and that became Straight Talking. New services needed a position, a brand and a launch. Overseas companies asked us to take their products into the UK. Increasingly, the work spans strategy, digital, data and brand at once.',
      'Under one name that was built for consultancy, that breadth was hard to see. Minshall Group puts it on the surface: four practices, strategy and consultancy, digital and product, data, AI and automation, and brand, marketing and growth, working as one team, alongside the products we own and run.',
      'There was also a practical reason to act now. We are exploring the sale of Knexusport, our athlete medical operations platform. Knexu and Knexusport share a name, and a sale would leave two separate businesses with almost the same brand. Recognising that conflict, we decided to make the move.',
      'For existing clients nothing changes. Your contacts and engagements carry straight over, and you can now reach us at hello@minshallgroup.com. Our knexu.co.uk email addresses keep working as normal.',
      'If you have a number that needs to move, we would like to hear about it.']},
  {slug:'five-signs-your-website-is-costing-you-enquiries',tag:'Digital',cap:'digital',date:'2026-10-17',mins:4,
    t:'Five signs your website is costing you enquiries',
    d:'Most small business websites do not fail loudly. They just quietly lose the people who were ready to get in touch.',
    body:['Most small business websites do not break. They just stop earning. Visitors arrive, cannot quite find what they need, and leave without telling you. Here are five signs it is happening to yours.',
      '<b>1. It is slow on a phone.</b> Most visitors now arrive on mobile. If your main content takes more than a few seconds to appear, a large share of them will leave before they read a word.',
      '<b>2. There is no simple way to get in touch.</b> Many people will not ring and will not write an email, but they will fill in a short form. If your phone number is not tappable and there is no form, you are relying on the most motivated visitors only.',
      '<b>3. Google cannot tell what you do.</b> Your page title and search description are the headline and the advert people see in search results. If they say "Home" or nothing at all, you are invisible for the searches that matter.',
      '<b>4. It looks out of date.</b> An old copyright year, broken links or photos from ten years ago quietly tell visitors the business may not be looked after either.',
      '<b>5. You have no idea what visitors do.</b> Without analytics you cannot see which pages work and where people drop off, so every change is a guess.',
      'None of these takes a big budget to fix. Run our <a class="ulink" href="/digitalsme">free instant website check</a> to see where your site stands in about twenty seconds, with plain-English fixes and a fixed price to put them right.']},
  {slug:'build-the-tool-not-the-deck',tag:'Strategy',cap:'strategy',date:'2026-10-01',mins:4,
    t:'Build the tool, not the deck',
    d:'If a recommendation only works when someone runs the analysis every month, a slide deck is the wrong deliverable.',
    body:['Consultancies default to the deck because it is the billable artefact. It is finished when it is presented, it is easy to scope, and it looks like work. But a surprising number of recommendations only hold if someone keeps doing the analysis behind them, every month, for years.',
      'Site prioritisation is the classic example. A one-off catchment study is out of date the moment a competitor opens. Capacity planning is another: the bottleneck moves as soon as you fix it. In both cases the valuable thing is the machine that keeps producing the answer.',
      'So we ask a simple question at the start of every engagement: will this need to be true next quarter as well? If the answer is yes, the deliverable is a tool, a dashboard or a pathway, built in a slice, owned by the client and kept current by the people who use it.',
      'That is why Minshall Group has a strategy practice and a digital practice under one roof. It is the only way we have found to leave something behind that keeps earning after we have gone.']},
  {slug:'your-catchment-is-probably-wrong',tag:'Data & AI',cap:'data-ai',date:'2026-09-12',mins:5,
    t:'Your catchment is probably wrong',
    d:'A five-mile radius is not a catchment. Two sites a mile apart can serve entirely different populations.',
    body:['Most site decisions in healthcare, leisure and retail still start with a circle on a map. It is quick and it feels objective. It is also wrong in almost every real location, because people do not travel as the crow flies.',
      'A drivetime catchment follows the road network. Put a river, a ring road or a one-way system in the way and two sites a mile apart can end up serving populations with different ages, incomes, health needs and competitors. The circle hides that; the drivetime shows it.',
      'The second problem is what gets measured inside the boundary. Population counts are easy. What matters is how the population deviates from comparable places: more long-term conditions, more car dependency, fewer competitors per head. Ranked deviation tells you why a site might work. A raw count only tells you it is busy.',
      'This is what DataLense was built to do. Whatever tool you use, ask one question before committing capital: would the answer change if the catchment followed the roads? Surprisingly often, it does.']},
  {slug:'practical-ai-starts-with-the-task',tag:'Data & AI',cap:'data-ai',date:'2026-08-20',mins:4,
    t:'Practical AI starts with the task, not the tool',
    d:'The organisations getting value from AI did not start with a model. They started with a queue of work nobody wanted to do.',
    body:['Every board has now asked what the organisation is doing about AI. The weakest answer is a pilot chosen because a vendor offered one. The strongest is a list of tasks: where skilled people spend hours on unskilled work, where judgements are made inconsistently, where a queue never quite clears.',
      'Start there and the technology choice becomes obvious, and often modest. Triage that reads an inbound referral and routes it. A first draft that a person checks and signs off. A reconciliation that runs overnight instead of on a Friday afternoon.',
      'Governance comes first. Every automated step should be explainable, logged and reversible, with a person accountable for it. That is what makes the second and third use case easy to approve.',
      'And sometimes the honest answer is that a better form, a cleaner process or a simple rule does the job. We would rather tell you that than sell you a model.']},
  {slug:'the-capture-rate-problem',tag:'Digital',cap:'digital',date:'2026-07-08',mins:4,
    t:'The capture-rate problem nobody names',
    d:'A validated outcome measure at a 12% response rate is weaker evidence than a well-designed journey capture at 60%.',
    body:['Healthcare has spent years perfecting the instruments used to measure patient outcomes, and very little time on the surface patients use to answer them. The result is a familiar pattern: an excellent questionnaire, sent once, by email, at the end, to a small share of patients who reply.',
      'From 2026 that matters more than ever. Patient-reported measures are part of what independent providers must publish, and participation itself is becoming a published metric. Low capture is no longer just a data-quality issue; it is visible.',
      'The fix is a design problem before it is a clinical one. Capture across the journey rather than at the end. Ask little and often. Make it effortless on a phone. Then layer the mandated instruments onto the same spine, so experience and outcome sit on one record.',
      'That is the thinking behind Straight Talking. The principle applies anywhere evidence is collected from people: optimise the surface first, then the instrument.']}
];

/* ---------------- CLIENTS (marquee) ---------------- */
export const CLIENTS=['Prime Health','Medical Imaging Partnership','Housden Group','Leeds Beckett University','Northumbria University','Eventmaster','The Sponsor Collective','Technique Health','Propel Teams'];

/* ---------------- LEGAL ---------------- */
export const LEGAL={trading:'Minshall Group',company:'Knexu Limited',number:'14536312',office:'148 The Rose Bowl, Portland Crescent, Leeds LS1 3HB',reg:'England & Wales'};

/* ---------------- SEARCH LANDING PAGES ----------------
   Focused pages for the searches we most want to be found for. Each gets
   its own URL, title, H1, FAQ (with FAQPage structured data) and sitemap
   entry. Keep one main phrase per page so pages do not compete.          */
export const LANDINGS=[
  {slug:'healthcare-consultancy',gfx:'pathway',
    seoTitle:'Healthcare Consultancy UK | Minshall Group',
    desc:'Healthcare consultancy for independent providers, diagnostics, NHS private patient units and health tech companies entering the UK. Strategy, digital, data and brand, measured by the return.',
    eyebrow:'Healthcare consultancy',
    title:'Healthcare consultancy, measured by the return',
    lede:'We help independent providers, diagnostics groups, NHS trusts and health tech companies grow revenue, recover capacity and make better investment decisions, then build what it takes to deliver.',
    whoH:'Who we work with',
    who:['Independent diagnostics and imaging networks','NHS trusts and private patient units','Private hospitals and clinic groups','Physiotherapy, MSK and sports medicine','Health tech and medtech companies entering the UK','Wellbeing and prevention providers'],
    whoBody:['Health is where our work started, and where the return is most direct. A self-referral pathway is a new revenue line. A reconfigured referral-to-report operation is recovered capacity. A catchment analysis that stands up is capital released, or protected, on a site decision.',
      'Because strategy, digital, data and brand sit in one team, the recommendation and the delivery do not get separated. When a pathway needs a booking journey, or a site decision needs a data model, we build it.'],
    services:[
      {t:'Self-pay and private patient growth',d:'Self-referral pathways, pricing and insurer and referrer engagement that open direct demand and convert more of what already arrives.'},
      {t:'Pathway and capacity redesign',d:'Referral-to-report and patient pathway mapping that finds where work waits and recovers clinical and administrative time.'},
      {t:'Site selection and catchment analysis',d:'Drivetime catchments, competitor mapping and population health profiles for any UK site decision, powered by DataLense.'},
      {t:'Business cases and investment',d:'Cases for boards, investment committees and funders, modelled and evidenced line by line.'},
      {t:'Patient-reported outcomes',d:'PHIN and PROMs capture designed for response rate first, with Straight Talking as the platform.'},
      {t:'UK market entry for health tech',d:'Market sizing, priority locations, clinic and hospital channels, pricing and measured pilots, delivered with XV Capital Advisory.'}],
    cases:['prime-health','mip','housden','neurotech-uk'],
    products:true,
    faq:[
      {q:'What does a healthcare consultancy do?',a:'A healthcare consultancy helps providers and health companies make better commercial and operational decisions: where demand is, how patients move through a service, where capacity is lost, where to invest and how to grow. We also build the tools, journeys and data products those decisions need.'},
      {q:'Do you work with NHS organisations?',a:'Yes. Working as part of Housden Group, we support the growth of NHS trust private patient units, and we work with providers that deliver NHS-funded activity in independent settings.'},
      {q:'Do you give clinical or regulatory advice?',a:'No. Clinical and regulatory judgements stay with clinicians and the organisations responsible for them. We work on the commercial, operational, data and digital side, alongside your clinical leads.'},
      {q:'How do you price an engagement?',a:'Usually phase by phase, against agreed deliverables, so you can stop, adjust or continue at the end of each stage. Every engagement is scoped to an outcome before it starts.'},
      {q:'Where are you based?',a:'Our registered office is in Leeds, and we work with clients across the UK, as well as overseas companies bringing products to the UK.'}]},
  {slug:'digital-consultancy',gfx:'layers',
    seoTitle:'Digital Consultancy UK | Product, Platforms, Data & AI | Minshall Group',
    desc:'Digital consultancy that designs and builds: product discovery, web platforms, apps, portals, integrations, data and practical AI. A senior team, shipping in usable slices, and you own what we build.',
    eyebrow:'Digital consultancy',
    title:'Digital consultancy that builds what it recommends',
    lede:'Digital strategy, product design, platforms, data and practical AI from one senior team. We ship in usable slices, connect to the systems you already run, and hand you the keys.',
    whoH:'What makes us different',
    who:['Senior people on the work, no junior bench','Strategy and build in one team','Shipped in usable slices, not a six-month silence','Production-grade from the first release','You own the code, data model and documentation','Practical about AI, with governance built in'],
    whoBody:['Many digital projects fail at the handover: the strategy firm leaves, the build firm starts from a brief that has lost the context, and nobody owns the outcome. We remove that handover.',
      'The same team that works out what the product has to achieve designs it, builds it and measures it. Two of our own products, DataLense and Straight Talking, started as client problems and are now live platforms.'],
    services:[
      {t:'Digital strategy and roadmaps',d:'What to build, in what order and why, tied to a commercial outcome and a realistic budget.'},
      {t:'Product discovery and UX',d:'Research, prototypes and tested interface design, handed to build as a living design system.'},
      {t:'Websites and web platforms',d:'Fast, accessible, search-friendly sites and web apps your own team can keep current.'},
      {t:'Apps, portals and booking journeys',d:'Patient, customer, member and partner portals built against the systems you already depend on.'},
      {t:'Data, dashboards and integration',d:'Pipelines, reporting and system integration so data stops being retyped and starts being trusted.'},
      {t:'Practical AI and automation',d:'Use-case discovery, safe pilots and automation of routine work, with a person accountable for every step.'}],
    cases:['prime-health','mip','eventmaster'],
    products:true,
    faq:[
      {q:'What does a digital consultancy do?',a:'A digital consultancy helps an organisation decide what technology to build or buy, then designs and delivers it: websites, platforms, apps, data and automation. We do both the advice and the build, so the two stay joined up.'},
      {q:'Do you build as well as advise?',a:'Yes. We design, build and run software and data products, including our own platforms DataLense and Straight Talking. Work ships in slices, each usable on its own.'},
      {q:'Who owns what you build?',a:'You do. The code, data model, exports and documentation belong to the client. Where we host, we hand over a runbook; where you host, we build to your environment.'},
      {q:'Do you only work in healthcare?',a:'No. Healthcare is a strength, but we also work in sport, wellbeing, universities, the public sector and growth companies. The approach carries across sectors.'},
      {q:'How do you approach AI?',a:'We start with the task: where time is lost or judgements are inconsistent. Then we pilot on your own data with clear governance. Sometimes the honest answer is a better form or process, and we will say so.'}]},
  {slug:'uk-market-entry',gfx:'catchment',
    seoTitle:'UK Market Entry for Health Tech, Medtech & Sports Tech | Minshall Group',
    desc:'UK market entry for overseas health tech, medtech and sports tech companies: market sizing, priority locations, partners, pricing and measured pilots, in partnership with XV Capital Advisory.',
    eyebrow:'UK market entry',
    title:'Bringing your product to the UK market',
    lede:'For overseas health tech, medtech and sports tech companies. We work out where to launch, who buys, at what price and through which partners, then run a measured pilot. Delivered in partnership with XV Capital Advisory.',
    whoH:'Who it is for',
    who:['Medtech and health tech companies with UK registration','Sports tech and performance companies','Digital health and wellbeing products','Companies choosing between direct sales and a UK partner','Boards that want evidence before committing capital','Founders who need a team on the ground in the UK'],
    whoBody:['The UK is an attractive market, but it does not behave like the US or Australia. Private healthcare, the NHS, physiotherapy, elite sport and universities each buy differently, and the right first customer is rarely the obvious one.',
      'We run UK entry in phases. Each one ends with something you can act on, so you commit capital a stage at a time: a validated market and location model, a named target list, a business case, a founding-partner programme and a pilot with agreed measures.'],
    services:[
      {t:'Market sizing and demand',d:'How big the opportunity really is, by segment and region, built from UK data rather than global estimates.'},
      {t:'Priority locations',d:'Where affluence, demand and the right providers overlap, ranked using DataLense catchment analysis.'},
      {t:'Route to market and partners',d:'Direct, distributor or partner-led, with the clinics, clubs, hospitals and channels that fit your product.'},
      {t:'Pricing and business case',d:'A UK price position and a customer business case that a provider’s finance lead will accept.'},
      {t:'Founding-partner programme',d:'Terms and incentives that give early partners a reason to commit and build demand with you.'},
      {t:'Pilot management',d:'Structured pilots with agreed measures, regular reporting and a twelve-month rollout plan at the end.'}],
    cases:['neurotech-uk','eventmaster'],
    products:false,
    faq:[
      {q:'Do you help with UK regulation?',a:'We do not give regulatory or clinical advice. We work alongside your regulatory advisers and build the commercial plan around your registration status and intended purpose.'},
      {q:'Who is XV Capital Advisory?',a:'XV Capital Advisory works with sportstech and healthtech companies looking to grow internationally. When those companies choose the UK, we run the entry on the ground together.'},
      {q:'How long does UK market entry take?',a:'A typical programme runs in four phases over about six months: validate, prepare, pilot and scale. You can stop, adjust or continue at the end of each phase.'},
      {q:'Can you act as our UK presence?',a:'Yes. We can provide part-time commercial leadership in the UK while you test the market, before you commit to a permanent team.'},
      {q:'Which sectors do you cover?',a:'Mostly private healthcare, physiotherapy and MSK, diagnostics, elite and professional sport, universities and wellbeing.'}]},
  {slug:'healthcare-site-selection',gfx:'radar',
    seoTitle:'Healthcare Site Selection & Catchment Analysis UK | Minshall Group',
    desc:'Healthcare site selection for clinics, diagnostics centres and private hospitals: drivetime catchments, competitor mapping, population health and market scoring, powered by DataLense.',
    eyebrow:'Healthcare site selection',
    title:'Know the site before you sign the lease',
    lede:'Drivetime catchment analysis, competitor mapping and population health profiles for clinics, diagnostics centres and private hospitals deciding where to open or expand.',
    whoH:'Who it is for',
    who:['Independent diagnostics and imaging','Private clinics and physiotherapy groups','Private hospitals and day-case units','NHS trusts planning private or community sites','Investors assessing healthcare property','Health tech companies choosing launch locations'],
    whoBody:['The wrong site is the most expensive mistake in healthcare. Too many location decisions are made on instinct, a rent quote and a five-mile circle on a map, even though people do not travel as the crow flies.',
      'We build the evidence around a real drivetime catchment: who lives there, how their health needs compare with similar places, who already competes for them, and whether the site can be staffed. The analysis runs on DataLense, our healthcare commercial intelligence platform, and every figure says what it does not know.'],
    services:[
      {t:'Drivetime catchments',d:'Catchments that follow the road network, so the analysis reflects how patients would really travel.'},
      {t:'Competitor and provider mapping',d:'Who already serves the area, what they offer and where the gaps are.'},
      {t:'Population health profile',d:'How the local population differs from comparable places, ranked, from public health and census data.'},
      {t:'Market score',d:'A weighted score across demand, competition, affluence and access, matched to the service you plan.'},
      {t:'Workforce check',d:'Whether the clinical and support workforce exists to staff the site.'},
      {t:'Investment case',d:'A site case your board, lender or investor can test line by line.'}],
    cases:['neurotech-uk'],
    products:true,
    faq:[
      {q:'What is a drivetime catchment?',a:'The area from which people can reach a site within a set travel time by road. Unlike a simple radius, it reflects rivers, ring roads and real routes, which can change who a site actually serves.'},
      {q:'Where does the data come from?',a:'Public sources including provider registers, census tables, deprivation indices, waiting-time publications and workforce returns, joined around your catchment.'},
      {q:'Can I use DataLense myself?',a:'Yes. DataLense is available at datalense.org. We can also run the analysis for you and turn it into a recommendation.'},
      {q:'Do you only look at one site?',a:'No. We can compare shortlisted sites side by side, or rank a whole region to find where to look first.'},
      {q:'Is this only for private providers?',a:'No. NHS organisations planning community or private services use the same evidence for different questions.'}]}
];

/* ---------------- DIGITAL SME OFFER (/digitalsme) ----------------
   Fixed starting prices, add-ons and payment stages. Edit here; the page,
   quote builder and terms all read from this object. Prices exclude VAT. */
export const SME={
  packages:[
    {id:'refresh',name:'Refresh',price:495,pages:10,weeks:'2 weeks',
      for:'Your site works, but it looks dated and says too little.',
      includes:['Up to 10 pages rewritten and refreshed','Modern, mobile-first design','News or blog section you can update','Speed and accessibility fixes','Page titles and descriptions for Google','Launch on our managed hosting']},
    {id:'rebuild',name:'Rebuild',price:995,pages:50,weeks:'3–4 weeks',popular:true,
      for:'You need a proper site that brings in enquiries.',
      includes:['Everything in Refresh, up to 50 pages','Enquiry forms delivered to your inbox','Visitor analytics with Microsoft Clarity','Google Search Console and sitemap set up','Before-and-after score report']},
    {id:'grow',name:'Grow',price:1995,pages:100,weeks:'5–6 weeks',
      for:'Your website needs to do more of the work for you.',
      includes:['Everything in Rebuild, up to 100 pages','Customer accounts and secure logins','Booking or quote-request journeys','Content moved across from your current site','30 days of post-launch support']}
  ],
  /* add-ons: `in` lists the packages that already include it */
  addons:[
    {id:'forms',t:'Enquiry and contact forms',d:'Forms that email you every enquiry.',price:75,in:['rebuild','grow']},
    {id:'analytics',t:'Visitor analytics (Clarity)',d:'See how people actually use your site.',price:50,in:['rebuild','grow']},
    {id:'accounts',t:'Customer accounts and logins',d:'Secure sign-in for clients or members.',price:250,in:['grow']},
    {id:'booking',t:'Booking or quote requests',d:'Let customers book or request a quote online.',price:150,in:['grow']},
    {id:'blog',t:'News or blog section',d:'A section you can update yourself.',price:0,in:['refresh','rebuild','grow']},
    {id:'copy',t:'Copywriting from scratch',d:'We write your key pages from a short interview.',price:150,in:[]},
    {id:'logo',t:'Logo and brand refresh',d:'A tidied logo, colours and type.',price:150,in:[]},
    {id:'gbp',t:'Google Business Profile set-up',d:'Show up properly in local search and Maps.',price:50,in:[]}
  ],
  extraPage:10,
  hosting:150,            /* per year, on the client's existing or new domain */
  /* Domains: api/domain.js asks every connected registrar (Vercel, GoDaddy)
     and the cheapest first-year price is shown, converted to pounds at
     usdToGbp where needed, rounded up, plus domainAdmin. With no registrar
     connected, or for endings they cannot price, the table below is used.
     Endings in neither are priced on request. Confirmed on the quote. */
  usdToGbp:0.8,
  domainAdmin:0,
  domains:{'.co.uk':15,'.uk':15,'.org.uk':15,'.com':10,'.org':10,'.net':11,'.co':24,'.io':12,'.london':35},
  domainTry:['.co.uk','.uk','.com','.org'],
  stages:[{t:'To start',d:'Books your slot and starts discovery.'},{t:'Halfway',d:'When you approve the design and first pages.'},{t:'On completion',d:'When the site is live and signed off.'}]
};

/* ---------------- MINSHALL SCORE (site check) ----------------
   Our own 0–100 website score. Pillars come from api/audit.js; industry
   fit is measured against what customers expect in each sector. Tune the
   weights and essentials here. Signal ids match api/audit.js readSignals. */
export const SCORE={
  weights:{experience:.25,findability:.2,trust:.15,conversion:.2,modern:.1,industry:.1},
  grades:[[85,'Excellent'],[70,'Good'],[50,'Needs work'],[0,'Falling behind']],
  pillars:[
    {id:'experience',t:'Experience',d:'Easy and quick to use on a phone'},
    {id:'findability',t:'Findability',d:'Google and AI search can understand it'},
    {id:'trust',t:'Trust',d:'Looks current, safe and credible'},
    {id:'conversion',t:'Conversion',d:'Turns visitors into enquiries'},
    {id:'modern',t:'Modern & relevant',d:'Does what people expect in 2026'}
  ],
  industries:[
    {id:'cafe',t:'Café, bar or restaurant',ess:[['menu','Menu on the site'],['hours','Opening hours'],['map','Map or directions'],['bookOrOrder','Book a table or order online'],['reviews','Reviews shown'],['instagram','Instagram linked'],['tel','Tap-to-call phone number']]},
    {id:'retail',t:'Shop or online retail',ess:[['ecommerce','Buy online'],['pricing','Prices shown'],['delivery','Delivery information'],['returns','Returns policy'],['reviews','Reviews shown'],['newsletter','Newsletter sign-up'],['social','Social links']]},
    {id:'trades',t:'Trades and construction',ess:[['tel','Tap-to-call phone number'],['form','Quote or enquiry form'],['accreditations','Accreditations shown'],['gallery','Photos of past work'],['reviews','Reviews shown'],['serviceAreas','Areas covered'],['address','Address or location']]},
    {id:'clinic',t:'Health, clinic or wellbeing',ess:[['booking','Book online'],['pricing','Prices shown'],['team','Practitioners introduced'],['reviews','Reviews shown'],['registration','Professional registration shown'],['privacy','Privacy notice'],['map','Map or directions']]},
    {id:'professional',t:'Professional services',ess:[['caseStudies','Case studies or clients'],['team','Team introduced'],['blog','News or insights'],['form','Enquiry form'],['linkedin','LinkedIn linked'],['ld','Structured data for search'],['address','Address or location']]},
    {id:'hospitality',t:'Hotel, venue or holiday let',ess:[['booking','Book online'],['rooms','Rooms or spaces described'],['gallery','Photo gallery'],['map','Map or directions'],['reviews','Reviews shown'],['pricing','Prices shown'],['video','Video tour']]},
    {id:'fitness',t:'Gym, fitness or sport',ess:[['timetable','Class timetable'],['membership','Membership options'],['booking','Book online'],['freeTrial','Free trial offer'],['pricing','Prices shown'],['reviews','Reviews shown'],['instagram','Instagram linked']]},
    {id:'charity',t:'Charity or community',ess:[['donate','Donate online'],['charityNo','Charity number shown'],['newsletter','Newsletter sign-up'],['blog','News or stories'],['social','Social links'],['form','Contact or volunteer form'],['privacy','Privacy notice']]},
    {id:'other',t:'Other business',ess:[['form','Enquiry form'],['tel','Tap-to-call phone number'],['reviews','Reviews shown'],['social','Social links'],['blog','News or updates'],['address','Address or location'],['ld','Structured data for search']]}
  ]
};
