/* =====================================================================
   CONTENT — every word on the site that is likely to change lives here.
   To add a case study, insight, capability or industry, add an entry to
   the relevant array: pages, navigation, filters, the sitemap and the
   prerendered HTML all pick it up automatically.
   Return figures are qualitative until each client signs off numbers.
   ===================================================================== */

/* The public address. The contact form also delivers here (api/contact.js). */
export const CONTACT={email:'hello@minshallgroup.com',linkedin:'https://www.linkedin.com/company/minshallgroup'};

/* ---------------- CAPABILITIES (the two practices: commercial strategy, then digital) ---------------- */
export const CAPS=[
  {slug:'strategy',n:'01',t:'Commercial Strategy',short:'Commercial strategy',gfx:'catchment',
    line:'Find where the growth is, and the route to it.',
    d:'Growth and commercial strategy, UK market entry, business cases, site selection, partnerships and go-to-market, each scoped to a financial outcome before we start.',
    lede:'We are hired to move a number and to be able to show how. What you get is a decision, a plan with named owners, and the evidence that it worked.',
    body:['Most organisations do not lack ideas. They lack a clear view of where the value actually sits, a plan that survives contact with operations, and somebody accountable for the result. That is the gap we work in.',
      'Every engagement starts by naming the outcome it is for: grow revenue, recover margin or unlock capital. Then we diagnose what is really true, design the route, and stay with it into delivery. When the plan needs a platform, a data product or a brand to be real, the rest of the group builds it.'],
    services:[
      {t:'Growth strategy',d:'Where the next pound of revenue comes from, ranked by size, speed and certainty, with a plan and owner for each.'},
      {t:'UK market entry',d:'For overseas companies bringing a product to the UK: market sizing, priority locations, pricing, partner programmes and measured pilots. Delivered in partnership with XV Capital Advisory.'},
      {t:'Business cases & investment',d:'Cases built to satisfy an investment committee or funder: modelled, evidenced and defensible line by line.'},
      {t:'Service & pathway redesign',d:'Mapping how work really flows, finding where it waits, and reconfiguring around the constraint to recover capacity.'},
      {t:'Bids & tenders',d:'Bids written to be scored against the scheme, with evidence behind every claim and a delivery model that holds up.'},
      {t:'Partnerships & commercialisation',d:'Turning facilities, expertise and research into packaged, sellable offerings and the partnerships that buy them.'},
      {t:'Site selection & catchment',d:'Drivetime catchments, population profiles, competitor mapping and site scoring for location and investment decisions.'},
      {t:'Go-to-market & brand',d:'Positioning, messaging and identity, and the launch plan that puts them in front of the people who buy.'},
      {t:'Sponsorship & commercial rights',d:'Commercial frameworks that turn audiences, venues and assets into sponsorship and partner income.'}],
    feature:{eyebrow:'Bringing businesses to the UK',h:'UK market entry, with XV Capital Advisory.',
      body:['XV Capital Advisory works with sportstech and healthtech companies looking to grow internationally. When those companies choose the UK, we run the entry on the ground: where to launch, who buys, at what price, through which partners, and how to prove it is working.',
        'The work is phased, and each phase ends with something the company can act on: a validated market and location model, a named target list, a business case its finance team will accept, a founding-partner programme, and a pilot with agreed measures. The company can stop, adjust or carry on at each step, so capital goes in one stage at a time.'],
      steps:[{t:'Validate',d:'Market size, priority locations and buyers confirmed on UK data.'},{t:'Prepare',d:'Target list, business case, pricing and partner terms.'},{t:'Pilot',d:'A measured pilot with founding partners, reported weekly.'},{t:'Scale',d:'A twelve-month rollout plan built on the pilot evidence.'}],
      partner:{name:'XV Capital Advisory',d:'Sportstech capital and advisory'},
      cases:['neurotech-uk','eventmaster']},
    returns:[{n:'Revenue',t:'New lines, better conversion',d:'Revenue from demand you have not been capturing and markets you have not entered.'},
      {n:'Margin',t:'Capacity returned',d:'Leakage removed from the pathways and processes that consume time without returning it.'},
      {n:'Capital',t:'Decisions de-risked',d:'Investment released by a case that stands up, and protected from the wrong site or the wrong bet.'}]},
  {slug:'digital',n:'02',t:'Digital',short:'Digital',gfx:'layers',
    line:'Build what the strategy needs.',
    d:'Digital strategy, products, platforms, portals, data and practical AI, built in usable slices and owned by you.',
    lede:'A small, senior product team that designs and ships real software: patient and customer front ends, portals, platforms and the integrations that tie them together.',
    body:['If a recommendation depends on a spreadsheet and the one person who knows how it works, it is fragile. We build the missing piece properly: designed around the people who will use it, connected to the systems you already run, and shipped into production with real authentication and an audit trail.',
      'We work in slices. Each one is usable and earning on its own, so the programme returns value long before it is complete. Two of our own products, DataLense and Straight Talking, started exactly this way.'],
    services:[
      {t:'Product discovery',d:'The one question the product must answer, the people it serves and the data model under it, agreed before a line of code.'},
      {t:'UX & UI design',d:'Interfaces designed with and for real users, prototyped, tested and handed to build as a living design system.'},
      {t:'Web platforms',d:'Fast, accessible, search-friendly websites and web apps that are easy for your own team to keep current.'},
      {t:'Apps & portals',d:'Booking, referral, patient, member and partner portals, built against the systems you already depend on.'},
      {t:'Integration & APIs',d:'Clinical, CRM, finance and booking systems connected so data stops being retyped and starts being trusted.'},
      {t:'Build, run & hand over',d:'We host and run it with a runbook, or hand it to your team with the keys, the schema and the documentation.'},
      {t:'Data & dashboards',d:'Pipelines, reference data and reporting that make every number traceable, and show where work sits and what it costs.'},
      {t:'AI & automation',d:'Practical AI and workflow automation where it reliably saves time or improves a decision, with governance built in.'},
      {t:'Small business websites',d:'Fixed-price websites from £495, priced and started online, for independent businesses.'}],
    returns:[{n:'Revenue',t:'Demand converted online',d:'Self-serve journeys that turn interest into bookings and bookings into revenue without a phone call.'},
      {n:'Margin',t:'Manual work removed',d:'Double entry, chasing and reconciliation designed out of the operation.'},
      {n:'Capital',t:'An asset you own',d:'Software, data and IP that sit on your balance sheet.'}]},
];

/* ---------------- THE THREE RETURNS ---------------- */
export const RETURNS=[
  {n:'01',t:'Grow revenue',gfx:'return',d:'New revenue lines, better conversion of the demand you already have, and commercial assets that were never properly monetised.'},
  {n:'02',t:'Recover margin',gfx:'ecg',d:'Reconfiguration and automation that remove leakage and return operational, clinical and commercial capacity to the work that pays.'},
  {n:'03',t:'Unlock capital',gfx:'dial',d:'Business cases, analysis and assets that release investment, protect it from the wrong decision and de-risk the next one.'}
];

/* ---------------- INDUSTRIES ---------------- */
export const INDUSTRIES=[
  {id:'health',focus:true,t:'Health',gfx:'pathway',d:'Consultancy for NHS and private providers, and for health businesses working with and selling into the NHS.',
    challenges:['Self-pay demand that arrives but does not convert','Referral-to-report pathways leaking capacity','Site and investment decisions made on instinct','Hearing from patients often enough to act on it'],
    caps:['strategy','digital','data-ai'],clients:['Prime Health','Medical Imaging Partnership','Housden Group','Technique Health']},
  {id:'sport',focus:true,t:'Sport',gfx:'pitch',d:'Governing bodies, clubs, events and sports businesses looking for new revenue.',
    challenges:['Commercial estate that is under-monetised','Ticketing that ends at the transaction','Sponsorship packages nobody is buying','Participation that does not grow the base'],
    caps:['strategy','brand-growth','digital'],clients:['Eventmaster','The Sponsor Collective','Propel Teams']},
  {id:'performance',focus:true,t:'Where health and sport meet',gfx:'ecg',d:'Sports medicine, performance and athlete health: the ground few firms can credibly cover from both sides.',
    challenges:['Clinical services that sport does not know how to buy','Performance data that never reaches a decision','Medical operations run on spreadsheets','New revenue from expertise the organisation already has'],
    caps:['strategy','digital'],clients:[]},
  {id:'education',focus:false,t:'Universities & research',gfx:'scatter',d:'Universities, incubators and research centres with assets that could earn.',
    challenges:['Research strength with no route to market','Facilities and services that are not commercialised','Delivery plans that need to unlock funding','Industry partners that are hard to find'],
    caps:['strategy','brand-growth','digital'],clients:['Leeds Beckett University','Northumbria University']},
  {id:'public',focus:false,t:'Public sector',gfx:'bracket',d:'NHS trusts, local authorities and public bodies working inside a framework.',
    challenges:['Tenders that should be won but are not','Obligations outrunning resources','Private patient income under-developed','Reporting that consumes the time it measures'],
    caps:['strategy','data-ai','digital'],clients:['Housden Group','Medical Imaging Partnership']},
  {id:'growth',focus:false,t:'Growth & private companies',gfx:'network',d:'Independent providers, operators, scale-ups and start-ups finding their next stage.',
    challenges:['A client base too narrow to grow from','A route to market that has not been built','Operations that will not scale with demand','A brand that undersells the business'],
    caps:['strategy','brand-growth','digital','data-ai'],clients:['Eventmaster','Technique Health','Propel Teams']}
];

/* ---------------- PRODUCTS (A Minshall Group company) ---------------- */
export const PRODUCTS=[
  {slug:'datalense',t:'DataLense',status:'Live',url:'https://datalense.org',gfx:'radar',
    line:'Healthcare commercial intelligence.',
    d:'Drivetime catchment scoring, competitor mapping and population health profiles for any UK site decision, before the capital is committed.'},
  {slug:'straight-talking',t:'Straight Talking',status:'First cohort · October 2026',gfx:'layers',
    line:'Say it straight. We’re listening.',
    d:'Patients scan a code where care happens and say how it felt, in under a minute. Services get a direct feedback loop, and patients hear from each other.'}
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
export const INSIGHTS:any[]=[
{slug:'selling-into-the-nhs-2026',tag:'Research',cap:'strategy',date:'2026-10-21',mins:6,
 t:'Selling into the NHS in 2026: the real routes to market',
 d:'The NHS still spends tens of billions a year outside its own organisations, but the buyers, the rules and the assurance bar have all changed. Here is what the evidence says about where to start.',
 stats:[
  {n:'£24.1bn',l:'DHSC purchase of healthcare from non-NHS bodies, 2024-25 (National Audit Office)'},
  {n:'Up to £10bn',l:'NHS technology and digital transformation investment by 2028-29, almost 50% up on 2025-26 (HM Treasury, Spending Review 2025)'},
  {n:'50%',l:'Cut to integrated care board headcounts approved in November 2025 (DHSC)'},
  {n:'3 years',l:'Evidence generation period attached to NICE early value assessment recommendations, e.g. HTG766, January 2026 (NICE)'}
 ],
 charts:[
  {t:'Where DHSC spending goes: largest cost lines, 2024-25',unit:'£bn',src:'NAO overview of DHSC 2024-25',bars:[
   {l:'Staff costs',v:98.5},
   {l:'Clinical supplies and services',v:27.5},
   {l:'Healthcare from non-NHS bodies',v:24.1}
  ]}
 ],
 body:[
  'Selling into the NHS has never been simple, and 2026 is a year of rebuilding. The national bodies are being reorganised, the procurement rules are new, and the assurance bar for digital products has just been reset. The money has not gone away. What has changed is who holds it, and the rules they must follow to spend it.',
  '## The money is real, and it sits in a few large lines',
  'In 2024-25 the Department of Health and Social Care spent £219.2 billion, or £204.7 billion after income, according to the National Audit Office. Three lines dominate: staff costs at £98.5 billion, clinical supplies and services at £27.5 billion, and the purchase of healthcare from non-NHS bodies at £24.1 billion.',
  '[[chart:0]]',
  'Looking forward, the Spending Review 2025 committed up to £10 billion to NHS technology and digital transformation by 2028-29, which the Treasury describes as an almost 50% increase from 2025-26. The NHS in England also receives 3.0% real terms growth in day-to-day spending over the period.',
  'What this means: there are substantial, recurring budgets that outside suppliers can win. But the technology money is tied to national priorities, such as the NHS App and a single patient record. A product that helps deliver those priorities is easier to fund than one that sits beside them.',
  '## The buyers are changing',
  'In November 2025 the government confirmed it would bring NHS England back into the Department of Health and Social Care within two years. It approved a 50% cut to integrated care board headcounts, with around 18,000 administrative posts abolished and a saving of £1 billion a year expected by the end of the Parliament. The Health Bill, summarised by DHSC in May 2026, would abolish NHS England in law and create a single patient record, which the government intends to make available to clinicians in some specialties from as early as mid-2027.',
  'Some national routes have already narrowed. NHS England now states that it cannot help initiate new call-off contracts from the Health Systems Support Framework, although existing call-offs remain in force.',
  'What this means: relationships built only with national teams are less durable than they were. Buying decisions increasingly sit with trusts and integrated care boards, and those boards have fewer people to evaluate new suppliers. Your proposition has to be quick to understand and quick to assure. Do not build a sales plan around a framework that is no longer open for new business.',
  '## Two rulebooks, depending on what you sell',
  'The Procurement Act 2023 governs most public purchasing of goods and non-clinical services. Its main provisions came into force on 24 February 2025, after the start date was moved from 28 October 2024. Notices now run through a central digital platform, an enhanced Find a Tender service with a Supplier Information Service, accessed through a single registration.',
  'Healthcare services follow a different regime. The Provider Selection Regime has applied since 1 January 2024 to NHS England, integrated care boards, NHS trusts, foundation trusts and local authorities when they arrange health care services. It allows three direct award processes, a most suitable provider process and a competitive process. One direct award route applies where the existing provider is performing well and the contract is not changing considerably.',
  'What this means: a software or device company is mostly dealing with the Procurement Act. A company delivering clinical services is dealing with the Provider Selection Regime, where a well-performing incumbent can be re-awarded without competition. New entrants in services need to know when contracts expire and must make the case for change well before decisions are taken.',
  'For physical products, NHS Supply Chain remains central. Its 2026-27 business plan commits to £1 billion of efficiency savings for the NHS by 2030 and aims for 75% of its frameworks to carry measurable sustainability benefits. Suppliers should expect value and carbon questions to sit alongside price.',
  '## Assurance is the entry ticket',
  'For digital products, the Digital Technology Assessment Criteria, known as DTAC, set the baseline. DTAC covers five areas: clinical safety, data protection, technical security, interoperability, and usability and accessibility. NHS England revised it with around 25% fewer questions, and the previous form should not be used from 6 April 2026. DTAC is used alongside the Data Security and Protection Toolkit.',
  'Clinical safety rests on two standards. DCB0129 applies to manufacturers of health IT systems and DCB0160 to the organisations deploying them. Both require a named Clinical Safety Officer, with a clinical risk management plan, hazard log and safety case report.',
  'What this means: arrive with the assurance pack already complete. A buyer with a thinner team will move faster on a product that has its DTAC submission, safety case and named Clinical Safety Officer in place than on one that promises to sort them out later.',
  '## Evidence sets the pace of adoption',
  'The NICE Evidence Standards Framework, last updated in 2022, sets out the evidence NHS evaluators expect for digital health technologies. It is not mandated, but it is designed for use in commissioning and purchasing decisions. NICE early value assessments go further. In January 2026, for example, NICE said eight digital technologies for hip or knee osteoarthritis can be used during a three-year evidence generation period and paid for from core NHS funding, provided they have DTAC approval. Companies must fund the evidence generation themselves, and NICE advises commissioners to reflect the review point when negotiating contract length and licence costs.',
  'What this means: an early value assessment can open the door to wider use, but it is a three-year commitment with real cost attached, and early contracts may be short. Plan the evidence programme, and the cash to run it, before you apply.',
  '## What to do first',
  'First, decide which rulebook applies to you. Products and software follow the Procurement Act, while clinical services follow the Provider Selection Regime, and each needs a different sales plan.',
  'Second, complete your assurance before you sell. That means the current DTAC form, DCB0129 documentation, a Data Security and Protection Toolkit submission and a named Clinical Safety Officer.',
  'Third, map your evidence against the NICE Evidence Standards Framework and be honest about the gaps. If an early value assessment is relevant, budget for three years of evidence generation.',
  'Fourth, register on the central digital platform and track the notices that matter to you. Then focus on a specific trust or integrated care board problem that links to a funded national priority, rather than a broad national pitch.',
  'Minshall Group helps health businesses, including overseas health tech firms, plan UK market entry and build a practical route to selling into the NHS.'
 ],
 sources:[
  {t:'National Audit Office, Department of Health and Social Care 2024-25 overview',u:'https://www.nao.org.uk/overviews/department-of-health-and-social-care-2024-25/'},
  {t:'HM Treasury, Spending Review 2025, June 2025',u:'https://www.gov.uk/government/publications/spending-review-2025-document/spending-review-2025-html'},
  {t:'DHSC, Billions to be redirected back into patient care with NHS reform, November 2025',u:'https://www.gov.uk/government/news/billions-to-be-redirected-back-into-patient-care-with-nhs-reform'},
  {t:'DHSC, Health Bill: summary fact sheet, 19 May 2026',u:'https://www.gov.uk/government/publications/health-bill-summary-fact-sheet/health-bill-summary-fact-sheet'},
  {t:'NHS England, Health Systems Support Framework',u:'https://www.england.nhs.uk/hssf/'},
  {t:'legislation.gov.uk, The Procurement Act 2023 (Commencement No. 3 and Transitional and Saving Provisions) (Amendment) Regulations 2024, SI 2024/959',u:'https://www.legislation.gov.uk/uksi/2024/959/made'},
  {t:'Cabinet Office, Procurement Act 2023: guidance documents, updated February 2026',u:'https://www.gov.uk/government/collections/procurement-act-2023-guidance-documents'},
  {t:'NHS England, NHS Provider Selection Regime',u:'https://www.england.nhs.uk/commissioning/how-commissioning-is-changing/nhs-provider-selection-regime/'},
  {t:'NHS Supply Chain, Business Plan 2026-2027',u:'https://www.supplychain.nhs.uk/about-us/business-plan/'},
  {t:'NHS England Digital, Digital Technology Assessment Criteria (DTAC) guidance for buyers and suppliers',u:'https://digital.nhs.uk/services/digital-technology-assessment-criteria-dtac'},
  {t:'NHS England, Digital clinical safety assurance, version 1.2, March 2025',u:'https://www.england.nhs.uk/long-read/digital-clinical-safety-assurance/'},
  {t:'NICE, Evidence standards framework for digital health technologies (ECD7), updated August 2022',u:'https://www.nice.org.uk/corporate/ecd7/chapter/introduction'},
  {t:'NICE, HTG766 Digital technologies for managing mild to moderate symptoms of hip or knee osteoarthritis: early value assessment, January 2026',u:'https://www.nice.org.uk/guidance/HTG766/chapter/1-recommendations'}
 ]},
{slug:'business-of-uk-sport-2026',tag:'Research',cap:'strategy',date:'2026-10-21',mins:5,
 t:'The business of UK sport, 2026: where the money is moving',
 d:'Record revenues, record audiences and record activity levels hide a sharper story. Value is shifting towards fans, partners, women’s sport and flexible participation, and it is concentrating as it moves.',
 stats:[
  {n:'£6.8bn',l:'Premier League clubs’ revenue in 2024/25, up 8% (Deloitte Annual Review of Football Finance 2026)'},
  {n:'+39%',l:'Growth in Women’s Super League clubs’ revenue to £90m in 2024/25 (Deloitte Annual Review of Football Finance 2026)'},
  {n:'397m',l:'Hours of women’s sport watched on UK television in 2025, a record (Women’s Sport Trust, BARB data)'},
  {n:'64.6%',l:'Adults in England meeting activity guidelines, November 2024 to November 2025 (Sport England Active Lives)'}
 ],
 charts:[
  {t:'Football revenue growth by stream, 2024/25',unit:'% change on 2023/24',src:'Deloitte Annual Review of Football Finance 2026, 2024/25 season',bars:[
   {l:'Premier League matchday',v:15},
   {l:'Premier League commercial',v:13},
   {l:'Premier League broadcast',v:2},
   {l:'WSL total revenue',v:39},
   {l:'WSL matchday',v:16},
   {l:'WSL broadcast',v:11},
   {l:'Championship total revenue',v:-2}
  ]},
  {t:'Who is active in England',unit:'% meeting Chief Medical Officers’ guidelines',src:'Sport England Active Lives: adults Nov 2024-25; children academic year 2024-25',bars:[
   {l:'All adults',v:64.6},
   {l:'Men',v:67.3},
   {l:'Women',v:62.2},
   {l:'Most affluent adults',v:73.2},
   {l:'Least affluent adults',v:53.8},
   {l:'Children and young people',v:49.1}
  ]}
 ],
 body:[
  'The headline numbers for UK sport look strong. Premier League clubs earned a record £6.8bn in 2024/25, adults in England are more active than at any point in the last decade, and women’s sport drew its biggest television audience on record in 2025.',
  'Look underneath, though, and the money is moving in specific directions. It is shifting from broadcast towards fans and partners, towards women’s sport, and towards the forms of activity people organise for themselves. It is also concentrating.',
  '## Football’s growth is now fan-led',
  'Deloitte’s Annual Review of Football Finance, published in July 2026, puts Premier League club revenue at £6.8bn in 2024/25, up 8%. The mix of that growth matters more than the total. Matchday revenue rose 15% to more than £1bn for the first time. Commercial revenue rose 13% to £2.4bn, the largest gain of any stream. Broadcast revenue, still the biggest single line at £3.4bn, grew by just 2%.',
  '[[chart:0]]',
  'The growth is not evenly shared. The big six account for 73% of Premier League commercial revenue. In the Championship, revenue fell 2% to £942m and pre-tax losses rose 12% to £355m. Even at the top, record income did not mean profit: Premier League clubs made a combined pre-tax loss of £948m, with wages at a record £4.4bn, or 65% of revenue.',
  'What this means: the next pound of growth in football is coming from people who attend, buy and partner, not from central media deals. Clubs and leagues outside the top tier cannot rely on broadcast to close the gap. They need to know their supporters properly, price and package matchday well, and sell partnerships on evidence of audience rather than league position.',
  '## Women’s sport is growing faster, from a smaller base',
  'Women’s Super League clubs generated £90m in 2024/25, up 39% from £65m, according to Deloitte. Commercial revenue was the largest stream at £41m, up £15m. Matchday income grew 16% to £14m and broadcast 11% to £11m. Two cautions sit alongside the growth. The top four clubs took 71% of revenue, up from 66%, and group income from parent organisations still made up 27% (£23.9m) of the total.',
  'Audiences are growing too. The Women’s Sport Trust’s end-of-year report, published in February 2026 using BARB data, records 397 million hours of women’s sport viewed on UK television in 2025, a record, with 48.0 million people reached, up from 45.2 million in 2024. The same report shows that two tournaments, the UEFA Women’s EURO and the Women’s Rugby World Cup, accounted for just over 60% of those viewing hours.',
  'The commercial signal is clear. The Trust found 28.9 million UK adults are aware of at least one women’s sport sponsorship, and 30% of consumers think more favourably of brands that support women’s sport through sponsorship, compared with 20% for men’s sport.',
  'What this means: women’s sport gives partners strong brand effects relative to its current awareness, and that is a real selling point. The task for governing bodies and clubs is converting tournament peaks into year-round domestic audiences, and building revenue that does not depend on a parent club or a single major event. That means owned data, season-long content and partnership packages built around the domestic calendar.',
  '## Participation is rising, but unevenly',
  'Sport England’s Active Lives Adult Survey for November 2024 to November 2025, released in April 2026, shows 64.6% of adults in England, around 30.9 million people, meeting the guideline of 150 minutes of activity a week. That is 859,000 more than the previous year. Running and fitness grew strongly, while activity fell among 16 to 34 year olds, a new trend.',
  'The gaps are widening. 73.2% of the most affluent adults are active, compared with 53.8% of the least affluent. Among children, the Active Lives Children and Young People Survey for the 2024-25 academic year, published in December 2025, found 49.1% meet the guideline of 60 minutes a day, the highest since the survey began, while 28.4% do less than an average of 30 minutes a day.',
  '[[chart:1]]',
  'What this means: demand for activity is healthy, but it is drifting towards flexible, self-organised formats and towards better-off households. Governing bodies whose model rests on affiliated club membership need products that meet people where they already are: casual formats, easy online booking, pay-as-you-play and digital membership. The fall among 16 to 34 year olds is a warning for anyone whose future fans and members sit in that age group.',
  '## Sport’s economic weight is steady, not growing',
  'The DCMS Economic Estimates for 2024, published as provisional figures in February 2026, put the sport sector’s gross value added at £20.6bn, 0.8% of UK GVA, down 0.3% on 2023. On the broader Sport Satellite Account definition, DCMS estimates that the wider sport sector directly contributed £63.2bn to the UK economy in 2024, with 1.3 million filled jobs.',
  'What this means: sport is a large and stable part of the economy, but in aggregate it is not expanding. Growth is a share game. The organisations that win will take audience, attention and partnership spend from others, and that requires sharper propositions and better evidence of value.',
  '## What to do next',
  'First, build the direct relationship. Matchday and commercial income are growing fastest in football, and both rely on knowing who your audience is. A single view of supporters and participants, built on consented data, is the foundation for ticketing, membership, retail and sponsorship.',
  'Second, sell partnerships on audience outcomes. Partners want reach, affinity and engagement they can measure. Women’s sport already has evidence of stronger brand effects. Every rights holder should be able to show who it reaches and what changes for a partner as a result.',
  'Third, design for how people now take part. Rising activity is being driven by flexible formats and is concentrating among the better-off. Governing bodies and clubs that offer simple, digital, low-commitment ways in will grow participation and open new revenue at the same time.',
  'Minshall Group works with governing bodies, clubs, events and sports businesses on commercial strategy and digital products that turn shifts like these into revenue.'
 ],
 sources:[
  {t:'Deloitte, Annual Review of Football Finance 2026: Premier League clubs, 8 July 2026',u:'https://www.deloitte.com/uk/en/services/consulting/research/annual-review-of-football-finance-premier-league-clubs.html'},
  {t:'Deloitte, Annual Review of Football Finance 2026: Women’s Super League, 8 July 2026',u:'https://www.deloitte.com/uk/en/services/consulting/research/annual-review-of-football-finance-womens-super-league.html'},
  {t:'Deloitte, Annual Review of Football Finance 2026: Football League clubs, 8 July 2026',u:'https://www.deloitte.com/uk/en/services/consulting/research/annual-review-of-football-finance-football-league-clubs.html'},
  {t:'Women’s Sport Trust, More Than a Moment: end-of-year visibility report 2025, February 2026',u:'https://www.womenssporttrust.com/wp-content/uploads/2026/02/WST-EndofYearReport-Feb26-FINAL.pdf'},
  {t:'Sport England, Active Lives Adult Survey November 2024-25 report, 23 April 2026',u:'https://www.sportengland.org/activelivesapril26'},
  {t:'Sport England, Active Lives Children and Young People Survey academic year 2024-25 report, 4 December 2025',u:'https://www.activenorfolk.org/app/uploads/2025/12/Active-Lives-Children-and-Young-People-Survey-academic-year-2024-25-report_.pdf'},
  {t:'DCMS, DCMS Sectors Economic Estimates: Gross Value Added 2024 (provisional), 5 February 2026',u:'https://www.gov.uk/government/statistics/dcms-economic-estimates-gva-2024-provisional/dcms-sectors-economic-estimates-gross-value-added-2024-provisional'},
  {t:'DCMS, Sport Satellite Account: employment and GVA estimates, 5 February 2026',u:'https://www.gov.uk/government/collections/sport-satellite-account-employment-and-gva-estimates'}
 ]},
{slug:'where-sport-meets-health-2026',tag:'Research',cap:'strategy',date:'2026-10-21',mins:6,
 t:'Where sport meets health: activity, inactivity and the opportunity in between (2026)',
 d:'England is more active than at any point in a decade, but the gains are going to people who were already likely to move. Meanwhile almost half a million adults wait for community MSK care. The opportunity lies in the ground between sport and the NHS.',
 stats:[
  {n:'64.6%',l:'Adults in England meeting the CMO activity guideline, Nov 2024 to Nov 2025 (Sport England Active Lives)'},
  {n:'28.4%',l:'Children in Years 1 to 11 doing less than 30 minutes of activity a day, 2024-25 academic year (Sport England Active Lives CYP)'},
  {n:'456,532',l:'Adults on community musculoskeletal waiting lists in England, August 2026 (NHS England CHS waiting lists)'},
  {n:'£8bn',l:'Modelled direct net healthcare savings from sport and physical activity in England, 2023/24 (Sport England social value model)'}
 ],
 charts:[
  {t:'The activity gap by affluence',unit:'% meeting CMO guidelines',src:'Sport England Active Lives: adults Nov 2024-25; children 2024-25 academic year',bars:[
   {l:'Adults, most affluent (NS-SEC 1-2)',v:73.2},
   {l:'Adults, least affluent (NS-SEC 6-8)',v:53.8},
   {l:'Children, most affluent families',v:58},
   {l:'Children, mid-affluence families',v:49},
   {l:'Children, least affluent families',v:45}
  ]},
  {t:'Largest adult community health waiting lists, England',unit:'patients waiting (thousands)',src:'NHS England, Community Health Services waiting lists, August 2026',bars:[
   {l:'Musculoskeletal service',v:456.5},
   {l:'Podiatry and podiatric surgery',v:113.1},
   {l:'Physiotherapy',v:49.3},
   {l:'Integrated rehabilitation',v:46.6},
   {l:'Continence and colostomy',v:44.3},
   {l:'Dietetics',v:35.8}
  ]}
 ],
 body:[
  'Sport and health are usually planned, funded and measured separately. The latest data suggests the most valuable ground sits between them: people who are not active enough, people whose bodies are already telling them so, and services that cannot yet keep up with demand.',
  '## More active, but not more equal',
  'Sport England’s Active Lives Adult Survey for November 2024 to November 2025, published in April 2026, found that 64.6% of adults in England met the Chief Medical Officers’ guideline of 150 minutes of moderate activity a week. That is around 30.9 million people and the highest level in a decade. Yet 24.7% of adults remain inactive, doing less than 30 minutes a week, only 0.3 percentage points lower than the year before.',
  'The averages hide a widening split. Of the most affluent adults (NS-SEC 1-2), 73.2% are active, compared with 53.8% of the least affluent (NS-SEC 6-8), and Sport England reports that the gap between the most and least deprived areas has grown over time. Adults with a disability or long-term health condition are active at 49.1%, and those aged 75 and over at 44.3%. The survey also flags a new fall in activity among 16 to 34 year olds.',
  'Children follow the same pattern. The Active Lives Children and Young People Survey for the 2024-25 academic year found that 49.1% of pupils in Years 1 to 11 met the guideline of 60 minutes a day, the highest since the survey began. But 28.4%, around 2.1 million, did less than 30 minutes a day. 58% of children from the most affluent families were active, against 45% from the least affluent.',
  '[[chart:0]]',
  'What this means: participation growth is being captured mainly by people who were already likely to move. The people who remain are older, less affluent and more likely to live with a health condition, and they are the least likely to respond to a conventional sport offer. Reaching them is a question of product design and partnership, not just promotion.',
  '## The value is large, and modelled',
  'Sport England’s social value model, produced with Sheffield Hallam University and partners and published in November 2025, estimates that community sport and physical activity generated £122.9 billion of social value in England in 2023/24. Within that it estimates around £8 billion of direct net savings to the healthcare system through prevented illness, nearly £6 billion in productivity gains from fewer sick days, and around 900,000 cases of back pain prevented each year. It also estimates that nearly £20 billion more social value would be generated if the least active groups matched the most active.',
  'These are modelled figures, built from Active Lives data and published evidence on the health effects of activity, not observed cash savings. The government’s 10 Year Health Plan, published in July 2025, uses a different estimate of £10.5 billion a year in NHS savings from physical activity, and states that inactivity remains stubbornly high for adults and children.',
  'What this means: the economic case for activity is no longer the obstacle. The obstacle is that the savings are spread across budgets and years. Providers that can show measurable outcomes for a defined population, in terms a commissioner or employer recognises, will win more than those quoting national totals.',
  '## Musculoskeletal demand is where the pressure shows',
  'Musculoskeletal health is where inactivity and health services meet most visibly. Government guidance, last updated in 2022, estimated that 30.1% of people in England lived with an MSK condition in 2017, and that 45% of people with a long-term MSK condition were inactive, compared with 20% of those without one.',
  'NHS England’s community health services data for August 2026, published in October, shows 456,532 adults waiting for community MSK services. That is almost half of the 940,725 adults waiting for any community service, and more than the next five largest adult services combined. Around 78,000 had waited more than 18 weeks. The MSK list stood at 425,796 in April 2026, a rise of about 7% in four months, although NHS England notes that the figures are unvalidated management information and that changes in provider submissions affect month-to-month comparisons.',
  '[[chart:1]]',
  'The cost reaches the workplace. The ONS estimates that 148.8 million working days were lost to sickness or injury in the UK in 2025. Musculoskeletal problems accounted for 14.6% of sickness absence occurrences, behind only minor illnesses and a broad other category.',
  'What this means: demand for MSK assessment, rehabilitation and reconditioning is outrunning NHS community capacity, and employers carry a direct cost. Sports medicine, physiotherapy and performance businesses already hold the skills this demand needs. The gap is usually in access, pathway design and evidence of outcomes, not in clinical capability. We found no authoritative national dataset on the growth of private physiotherapy and MSK provision, so we have not estimated its size here.',
  '## Policy is moving into the space between',
  'The 10 Year Health Plan commits to letting patients self-refer to MSK services, alongside talking therapies, podiatry and audiology, through a My Specialist tool in the NHS App. It describes the planned My Care service as a digital social prescriber, linking patients to voluntary, social enterprise and local government services. On activity, it sets out a place-based approach across government, with £250 million of investment into 100 places through Sport England and at least £400 million for local community sport facilities. It cites evidence that where investment in activity is designed with local people, inactivity rates are 2.5 percentage points lower than otherwise in the most deprived places.',
  'What this means: self-referral and digital routing will change how people arrive at MSK and activity services. Providers that are visible, bookable and able to report outcomes inside those routes will gain. Sports organisations with facilities and community trust in deprived areas have a stronger case for health-linked funding than at any point in recent years, provided they can show who they reach.',
  '## Where the opportunity sits',
  'Three practical conclusions follow. First, design for the inactive rather than the already active: older adults, people with long-term conditions and lower-income communities are where the remaining gains and the health value sit. Second, build pathways that carry people from MSK rehabilitation into sustained activity, so that treatment and prevention form one journey rather than two separate services. Third, measure in health and work terms, such as waits avoided, function regained and absence reduced, because that is the language of the budgets that benefit.',
  'The organisations best placed are those that can work across both worlds: clinically credible enough for the NHS and employers, and engaging enough to keep people moving. Minshall Group works with organisations across health and sport on strategy and digital delivery at exactly this meeting point.'
 ],
 sources:[
  {t:'Sport England, Active Lives Adult Survey November 2024-25 Report, April 2026 (headline summary by Herts Sport and Physical Activity Partnership)',u:'https://sportinherts.org.uk/newsfuse/uploads/documents/2026-May/2663-Actives-Lives-Adult-Headlines-24-25.pdf'},
  {t:'Sport England, Active Lives Children and Young People Survey academic year 2024-25 report, December 2025',u:'https://www.activenorfolk.org/app/uploads/2025/12/Active-Lives-Children-and-Young-People-Survey-academic-year-2024-25-report_.pdf'},
  {t:'Sheffield Hallam University, Social value of sport and physical activity 2023/24 (for Sport England), November 2025',u:'https://www.shu.ac.uk/news/all-articles/latest-news/social-value-of-sport-2025'},
  {t:'DHSC, Fit for the future: 10 Year Health Plan for England, July 2025',u:'https://www.gov.uk/government/publications/10-year-health-plan-for-england-fit-for-the-future/fit-for-the-future-10-year-health-plan-for-england-accessible-version'},
  {t:'NHS England, Community health services waiting lists 2026-27, August 2026 data, published October 2026',u:'https://www.england.nhs.uk/statistics/statistical-work-areas/community-health-services-waiting-lists/'},
  {t:'ONS, Sickness absence in the UK labour market: 2025, May 2026',u:'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/labourproductivity/articles/sicknessabsenceinthelabourmarket/2025'},
  {t:'OHID, Musculoskeletal health: applying All Our Health, updated March 2022',u:'https://www.gov.uk/government/publications/musculoskeletal-health-applying-all-our-health/musculoskeletal-health-applying-all-our-health'}
 ]},
{slug:'state-of-uk-digital-health-2026',tag:'Research',cap:'data-ai',date:'2026-10-18',mins:6,
 t:'The state of UK digital health, 2026',
 d:'Patients are using the NHS App more than ever, but the infrastructure behind it is moving more slowly. We look at the latest official data on what has changed, what has stalled, and what it means for providers and health tech firms.',
 stats:[{n:'39.1m',l:'People registered for the NHS App, end of August 2026'},{n:'+44%',l:'Year-on-year rise in NHS App login sessions, August 2026'},{n:'93%',l:'Secondary care trusts with an electronic patient record, DHSC, August 2026'},{n:'12,336',l:'Virtual ward beds in England, September 2026, down from 12,825 in March 2025'}],
 charts:[{t:'NHS App: use is growing faster than reach',unit:'% change on August 2025',src:'NHS England, NHS App Management Information, August 2026',bars:[{l:'Messages delivered',v:61},{l:'Login sessions',v:44},{l:'Distinct users logging in',v:27},{l:'Repeat prescriptions ordered',v:27},{l:'Registered users',v:8},{l:'New registrations',v:-5}]},{t:'Virtual ward capacity in England has stopped growing',unit:'beds',src:'NHS England, Virtual Ward Capacity and Occupancy statistics, national time series to September 2026',bars:[{l:'Sep 2024',v:12497},{l:'Mar 2025',v:12825},{l:'Sep 2025',v:12522},{l:'Mar 2026',v:12643},{l:'Sep 2026',v:12336}]}],
 body:['Digital health in England is running at two speeds in 2026. Patients are using the NHS App more than ever. The systems behind it, in hospitals, in community services and in the data that links them, are moving more slowly. For providers and health tech firms, most of the risk and most of the opportunity sit in that gap.','This briefing uses the latest official statistics available in October 2026, mostly for NHS England. Where the data is experimental or incomplete, we say so.','## The front door is open, and busy','At the end of August 2026, 39.1 million people were registered for the NHS App, up 8% on a year earlier. For scale, England has about 63.7 million GP-registered patients. Sign-ups are slowing, with 270,851 new registrations in August, 5% fewer than in August 2025.','Use is rising much faster. The app recorded 78.2 million login sessions in August, up 44% year on year. 15.5 million different people logged in during the month, up 27%, and 28.7 million used it at least once in the 12 months to August.','The core transactions are performing well. Patients ordered 7.6 million repeat prescriptions through the app in August, up 27%. Messages delivered to patients reached 36.5 million, up 61%, which shows providers adopting the app as a channel as much as it shows patient demand.','[[chart:0]]','What this means: the app has moved past the reach phase into the depth phase. From here, growth will come from what people can do in it rather than from how many people have it, and that puts the pressure on the services behind it. The 10 Year Health Plan, published in July 2025, says that by 2028 the app will be a full front door to the entire NHS. Prescription tracking shows the distance still to cover: by the end of August 2026 it was live in 3,264 pharmacy sites, 31% of the total.','## General practice has shifted, but not far','Of the 29.8 million appointments recorded in general practice in August 2026, 59.9% were face to face. A year earlier the figure was 62.8%. Online consultation tools are now part of routine access, with 9.5 million patient submissions recorded in July 2026, 6.1 million of them clinical. These are official statistics in development, and data from several suppliers was incomplete, so this is best read as a minimum.','What this means: demand already arrives digitally. The limit now is triage, workflow and clinical capacity, not the online form at the front.','## Records: nearly complete is not the same as joined up','In a letter dated August 2026, DHSC said 93% of secondary care trusts have an electronic patient record, and that £1.9bn has been invested since 2022 in digital foundations, including EPR rollout. The same letter repeats an earlier expectation that 96% of trusts would have an EPR by March 2026, a date that has now passed.','Coverage does not mean records are shared. The letter was a reply to a coroner’s concern that staff could not see records held by other organisations. The government’s answer is a single patient record, which DHSC says will start going live from 2028, beginning with maternity care.','What this means: for suppliers, the next few years in secondary care are about optimising, integrating and consolidating EPRs, with few new EPR sales. Any product that relies on clean, shared data should plan for fragmented data until at least the end of the decade.','## Virtual wards: proven in winter, flat on capacity','In September 2026 England had 12,336 virtual ward beds, against 12,522 a year earlier and 12,825 in March 2025. Occupancy follows the seasons. It reached 90% in January 2026, when 11,474 patients were on a virtual ward, and fell to 69% in September 2026. NHS England classes these figures as management information, and they are snapshot counts.','[[chart:1]]','What this means: when demand peaks, the virtual ward model is used, but capacity is not growing. Remote monitoring suppliers are competing for a flat market. They will win by showing admissions avoided and staff time released, trust by trust, rather than by relying on a national expansion programme.','## Money and the route to market','The June 2025 Spending Review committed up to £10 billion to NHS technology and digital transformation by 2028-29, an increase of almost 50% on 2025-26. That is the clearest statement of intent in years. Trust leaders still name money as the main constraint. In NHS Providers’ 2024 digital transformation survey, 73% cited funding and financial constraints as a top barrier, ahead of operational pressures (50%) and inadequate infrastructure such as poor wi-fi, old computers and multiple log-ins (38%).','Getting through assurance has become a little easier. NHS England’s updated Digital Technology Assessment Criteria form has 25% fewer questions, and buyers and suppliers were expected to have fully moved to it by 6 April 2026. DTAC remains the baseline that any supplier to the NHS has to meet.','## What has moved, and what has not','Some things have clearly moved: NHS App use, digital messaging, digital access to general practice and EPR coverage. Others have not: virtual ward capacity, data sharing between organisations, and digital budgets at trust level. The single patient record is still at least two years away. The national investment is real, but much of it has yet to reach the front line.','## What to do next','Providers should make sure the services behind the app can handle the demand it now creates, with messaging, booking and record access that work end to end. Health tech firms will find the market rewards products that fit what already exists, meaning the NHS App, the main EPRs and local data platforms, backed by evidence of capacity or cash savings at trust level. Minshall Group helps providers and health tech companies with UK market entry, data and digital delivery, if a second view on the evidence would help.'],
 sources:[{t:'NHS England, NHS App Management Information: August 2026, 25 September 2026',u:'https://digital.nhs.uk/data-and-information/publications/statistical/nhs-app-statistics/august-2026'},{t:'NHS England, Virtual Ward Capacity and Occupancy statistics, September 2026 and national time series, 8 October 2026',u:'https://www.england.nhs.uk/statistics/statistical-work-areas/virtual-ward/'},{t:'NHS England, Appointments in General Practice: August 2026, 24 September 2026',u:'https://digital.nhs.uk/data-and-information/publications/statistical/appointments-in-general-practice/august-2026'},{t:'NHS England, Appointments in General Practice: August 2025',u:'https://digital.nhs.uk/data-and-information/publications/statistical/appointments-in-general-practice/august-2025'},{t:'NHS England, Submissions via Online Consultation Systems in General Practice: July 2026, 27 August 2026',u:'https://digital.nhs.uk/data-and-information/publications/statistical/submissions-via-online-consultation-systems-in-general-practice/july-2026'},{t:'Department of Health and Social Care, response to Regulation 28 report, 25 August 2026',u:'https://www.judiciary.uk/wp-content/uploads/2026/09/2026-0376-Response-from-DHSC.pdf'},{t:'Department of Health and Social Care, Fit for the future: 10 Year Health Plan for England, executive summary, July 2025',u:'https://www.gov.uk/government/publications/10-year-health-plan-for-england-fit-for-the-future/fit-for-the-future-10-year-health-plan-for-england-executive-summary'},{t:'HM Treasury, Spending Review 2025, June 2025',u:'https://www.gov.uk/government/publications/spending-review-2025-document/spending-review-2025-html'},{t:'NHS Providers, Digital transformation survey 2024: key messages',u:'https://thenhsalliance.org/resources/digital-transformation-survey-2024/key-messages'},{t:'NHS Innovation Service, Updated NHS England DTAC form and guidance, 4 March 2026',u:'https://innovation.nhs.uk/news/updated-nhs-england-digital-technology-assessment-criteria-dtac-form-and-guidance/'}]},
{slug:'private-patients-pmi-and-self-pay-2026',tag:'Research',cap:'strategy',date:'2026-10-18',mins:6,
 t:'Who pays for private care now, and what it means for where providers build',
 d:'Private hospital admissions hit a fourth successive record in 2025, but the growth came from insurance while self-pay stood still. The early 2026 data suggests that is shifting again, and the regional pattern matters more than the national totals.',
 stats:[{n:'953,000',l:'Private hospital admissions in the UK, 2025 (PHIN)'},{n:'282,625',l:'Self-pay admissions in 2025, within 100 of the 2023 peak (PHIN)'},{n:'6.5m',l:'People covered by private medical insurance in 2024, 4.8m of them through work (ABI)'},{n:'7.4m',l:'NHS England RTT pathways waiting to start treatment, end of August 2026'}],
 charts:[{t:'Self-pay share of private admissions by region',unit:'% of admissions',src:'PHIN, private market update, June 2026 (calendar year 2025)',bars:[{l:'Wales',v:56},{l:'North East',v:47},{l:'Scotland',v:45},{l:'South West',v:41},{l:'Yorkshire and Humber',v:40},{l:'North West',v:35},{l:'South East',v:27},{l:'London',v:18}]},{t:'Top self-pay procedures',unit:'admissions',src:'PHIN, private market update, June 2026 (calendar year 2025)',bars:[{l:'Cataract surgery',v:49655},{l:'Hip replacement (primary)',v:15590},{l:'Knee replacement (primary)',v:8150},{l:'Inguinal hernia repair',v:6100},{l:'Upper GI endoscopy (diagnostic)',v:5820},{l:'Breast implants',v:5705}]}],
 body:['The UK private hospital market has never been busier. PHIN, the independent body that publishes private healthcare data, recorded 953,000 admissions in 2025, the fourth record year in a row. Behind that headline is a more useful story about who is paying, and it should shape where independent providers invest and what they choose to offer.',
 '## Insurance carried the growth in 2025',
 'Of those 953,000 admissions, 670,300 were funded by insurance and 282,625 by patients paying for themselves. Insured activity has climbed steadily, from 624,800 in 2023 to 664,815 in 2024 and 670,300 in 2025.',
 'The Association of British Insurers’ latest figures explain why. Insurers paid a record £4bn in private medical insurance claims in 2024, up 13% on 2023. Some 6.5 million people were covered, up 4%, and 4.8 million of them held cover through their employer. Workplace schemes alone generated £2.6bn of claims, up 16%. The number of people claiming rose 10% to 1.8 million.',
 'This is an employer-led market. Corporate cover is bought as a recruitment and retention tool and as a way of getting staff back to work faster. That makes insured demand sensitive to employment, payroll budgets and premium inflation, and it concentrates it where large employers and higher-paid jobs are.',
 '## Self-pay surged, then held',
 'Self-pay is the part of the market that changed most after the pandemic. PHIN’s series of admissions with a recorded patient sex, which covers the large majority of activity, shows self-pay rising from roughly 197,000 in 2019 to about 281,000 in 2023. That is an increase of more than 40%, compared with around 8% for insured admissions over the same four years.',
 'Then it stopped growing. Self-pay admissions were 282,710 in 2023, 282,080 in 2024 and 282,625 in 2025. PHIN noted that the 2025 total sat just 85 admissions below the 2023 peak. The surge was real and it has held, but for three years it has been a plateau rather than a trend line.',
 'The reason it has not fallen away is the NHS waiting list. At the end of August 2026 there were 7.4 million referral to treatment pathways waiting in England, relating to around 6.2 million patients. Only 65.2% had been waiting less than 18 weeks, against a 92% standard, and 113,339 had waited more than a year. Performance is improving, up 4.2 percentage points on a year earlier, and the list is 0.5% smaller. But it is improving slowly, and a patient facing a long wait for a hip or a cataract still has a strong reason to pay.',
 '## Early 2026: the balance tilts again',
 'The first quarter of 2026 suggests the plateau may be breaking. PHIN’s September 2026 update shows total admissions of 247,495, less than 1% higher than a year earlier. Within that, insured admissions fell 2.6%, the first fall in a first quarter for five years. Self-pay rose 7.7% to its highest quarterly level on record, taking 31% of all admissions.',
 'The driver was older patients and one procedure. Cataract surgery accounted for 46% of the increase in self-pay admissions, and self-pay cataract activity rose 21%. The 60 to 69 age group added more admissions than any other. It is one quarter of data, so it should not be overread, but it points in a clear direction: growth is coming from older people paying directly for high-volume, predictable procedures.',
 '[[chart:1]]',
 'The full-year 2025 self-pay list confirms the shape of demand. Cataract surgery led with 49,655 admissions, followed by primary hip replacement at 15,590 and primary knee replacement at 8,150. Hernia repair and diagnostic endoscopy follow, with cosmetic breast procedures also in the top ten. These are procedures with clear outcomes, fixed packages and long NHS waits, which is exactly what a self-paying patient can price and compare.',
 '## The regional picture is not the national one',
 'National totals hide very different markets. In 2025 London recorded 248,770 insured admissions against 55,755 self-pay, so only around 18% of its private activity was self-funded. In Wales the balance runs the other way: 17,930 self-pay admissions against 14,105 insured, a self-pay share of around 56%. The North East, Scotland, Northern Ireland, the South West and Yorkshire and the Humber all sit at 40% or above.',
 '[[chart:0]]',
 'Growth is also uneven. In the first quarter of 2026, self-pay admissions rose in every English region and by 9.5% across England, while falling 13.3% in Wales. Insured admissions fell in London, the South East, the South West and the East Midlands, but rose in five regions including the North West and Yorkshire and the Humber.',
 'In practice, outside London and the South East a large share of the private market depends on patients spending their own money. Those markets behave differently. They respond to price, to local NHS waiting times and to how easy it is to find and trust a provider.',
 '## What this means for providers',
 'Pricing comes first. A self-pay patient compares a package price against an NHS wait, often for a single procedure they will have once. Transparent, all-inclusive prices for cataracts, hips, knees and hernias are now the norm that patients expect, and finance options matter for older patients on fixed incomes.',
 'Service mix should follow the funding mix. Sites with a high self-pay share depend on a narrow set of high-volume procedures, which brings operational efficiency but also concentration risk if NHS waits fall in that specialty. Sites dependent on insured work need strong insurer recognition and consultant relationships, and should watch whether the first-quarter dip in insured activity persists.',
 'Location decisions need local evidence. The question is not whether private demand is growing nationally, but who in a given catchment is likely to pay, how, and for what. That depends on the local age profile, employer base, household wealth, NHS trust waiting times by specialty and the competing supply nearby.',
 'Marketing to self-pay patients is a different discipline from serving insurers. It is a consumer decision, often made by older patients and their families, researched online and influenced by price, reviews and travel time. Providers who treat it as a by-product of insured work will lose ground to those who treat it as a market in its own right.',
 '## Next steps',
 'Providers planning new capacity or reshaping existing sites should start by separating their insured and self-pay demand, then test each against local waiting times, demographics and competition rather than national averages. The 2026 data suggests the self-pay patient, particularly the older one, is where the next increment of growth sits. Minshall Group’s site selection and catchment analysis is built to answer exactly that local question.'],
 sources:[{t:'PHIN, Private healthcare market update, June 2026 (data for calendar year 2025), June 2026',u:'https://www.phin.org.uk/news/private-market-update-june-2026-uk'},{t:'PHIN, 953k admissions at UK private hospitals in 2025, June 2026',u:'https://www.phin.org.uk/press-releases/private-hospital-admissions-at-record-levels-for-4th-consecutive-year'},{t:'PHIN, Private healthcare market update, September 2026 (data to Q1 2026), September 2026',u:'https://www.phin.org.uk/news/private-market-update-sept-2026-uk'},{t:'PHIN, Older patients opting to pay direct for private cataract surgery, September 2026',u:'https://www.phin.org.uk/press-releases/older-patients-opting-to-pay-direct-for-private-cataract-surgery'},{t:'ABI, Insurers process record £4bn across individual and workplace health schemes (2024 data), 21 January 2026',u:'https://abi.org.uk/media-hub/news-post/insurers-process-record-4bn-across-individual-and-workplace-health-schemes'},{t:'NHS England, RTT waiting times statistical press notice, August 2026 data, 8 October 2026',u:'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/10/Aug26-RTT-statistical-press-notice-PDF-389K-vjgRdG.pdf'}]},
{slug:'state-of-adult-social-care-2026',tag:'Research',cap:'strategy',date:'2026-10-18',mins:6,
 t:'The state of adult social care in England, 2026: steadier on the surface, tighter underneath',
 d:'Vacancies are at a ten-year low, but the overseas recruitment that closed the gap has largely stopped, councils are still overspending and hospital discharge delays are rising. Here is what the latest data means for providers and investors.',
 stats:[{n:'6.2%',l:'Adult social care vacancy rate in 2025/26, the lowest since 2015/16 (Skills for Care)'},{n:'30,000',l:'International recruits starting direct care roles in 2025/26, down from 105,000 in 2023/24 (Skills for Care)'},{n:'£715m',l:'Council overspend on adult social care budgets in 2025/26 (ADASS Spring Survey 2026)'},{n:'13,600',l:'Patients a day still in hospital after they no longer met the criteria to reside, September 2026 average (NHS England)'}],
 charts:[{t:'International recruits starting direct care roles',unit:'people',src:'Skills for Care, size and structure report, June 2026 (2020/21 to 2025/26)',bars:[{l:'2020/21',v:15000},{l:'2021/22',v:25000},{l:'2022/23',v:75000},{l:'2023/24',v:105000},{l:'2024/25',v:50000},{l:'2025/26',v:30000}]},{t:'Patients in hospital who no longer meet the criteria to reside',unit:'average per day in September',src:'NHS England acute discharge sitrep, September 2022 to September 2026 (Minshall Group analysis of daily data)',bars:[{l:'Sep 2022',v:13347},{l:'Sep 2023',v:12372},{l:'Sep 2024',v:12517},{l:'Sep 2025',v:12815},{l:'Sep 2026',v:13647}]}],
 body:['On the headline numbers, adult social care in England looks steadier than at any point since the pandemic. Vacancies are at a ten-year low and the workforce is still growing. One layer down, the picture changes. Growth is slowing, the recruitment route that filled the gap has closed, councils are still overspending, and the hospital discharge backlog is getting worse.','For providers and investors, 2026 is a year to read the data carefully rather than the headlines. Here are the figures that matter most, and what they mean.','## The workforce: better today, harder tomorrow','Skills for Care’s latest estimates put filled posts at 1.59 million in 2025/26, up 22,000 (1.4%) on the year. That is the slowest growth in four years, against a peak of 4.9% in 2023/24. The vacancy rate fell to 6.2%, or around 96,000 vacant posts on an average day, the lowest since 2015/16. Turnover in the independent sector eased to 23.6%.','How that improvement happened matters. International recruitment did much of the work. Since 2022/23, around 255,000 people arrived from abroad to take direct care roles in the independent sector. After the April 2024 restrictions and the closure of the Health and Care Worker visa to overseas care worker applicants in July 2025, arrivals fell from 105,000 in 2023/24 to 30,000 in 2025/26. Only around 1,500 of last year’s recruits came through the care visa itself. The rest came via dependant, family and student routes.','[[chart:0]]','At the same time, the domestic workforce is shrinking. Posts filled by British nationals fell by 40,000 in 2025/26 and by 130,000 since 2020/21. British workers now fill 67.5% of posts, compared with 84.5% five years ago. Skills for Care estimates the sector will need 410,000 more posts by 2040 just to keep pace with the growing over-65 population.','What this means: today’s low vacancy rate is partly borrowed. It reflects a recruitment pipeline that has now closed and a cooler wider jobs market, with the UK vacancy rate at 2.2%. Transitional rules allow in-country applications from people already working in care until July 2028. After that, another lever goes. Workforce plans built on 2025/26 conditions are likely to prove optimistic.','The pressure is also uneven. The domiciliary care vacancy rate is 9.1%, more than double the rate in care homes with nursing (3.9%) and without nursing (3.8%). Home care is where the system most needs capacity, and it is where staff are hardest to find.','## Demand: a busy front door, a narrow one','The Department of Health and Social Care’s activity report for 2024/25 records 2.02 million requests for support from people new to social care, made by 1.39 million individuals. Of those requests, 71% led to no further action and 6% led to long-term support. At the end of March 2025, 672,000 people were receiving long-term support. ADASS’s 2026 Spring Survey reports that more than 400,000 people are waiting for an assessment, care and support, a direct payment or a review.','These figures come from a new client-level data collection and should not be compared with older returns. No further action can include advice and signposting. Even so, the shape is clear: a high volume of contact and a narrow route into funded long-term care.','What this means: need that councils do not meet does not disappear. It moves to unpaid carers, to people paying for themselves, or to hospitals. Providers should expect more self-funded and privately arranged demand, and more complex needs by the time council-funded people arrive.','## Money: rising costs, persistent overspends','Councils’ gross current spending on adult social care reached £29.4 billion in 2024/25, up £2.3 billion (9%) in cash terms. The average weekly cost of the residential or nursing care they fund rose 7% to £1,185.55. Even so, ADASS reports a £715 million overspend on adult social care budgets in 2025/26. Three quarters of directors say more people are presenting who are, or would previously have been, eligible for NHS Continuing Healthcare.','The gap between what councils and private payers are charged remains wide. LaingBuisson estimates that in 2024/25 councils paid an average of £908 a week for residential care, against £1,278 for private payers, a difference of £370 or about 41%. For nursing care the figures were £1,225 and £1,594, about 30% more. Private pay now accounts for £14.1 billion, or 55% of the independent residential care market, in 2025/26.','What this means: self-funders are, in effect, subsidising council placements. Care home economics therefore depend heavily on payer mix and local property wealth. A home with a strong private base can absorb low council rates. A home reliant on council placements in a less affluent area often cannot. For investors, payer mix is the most important variable in a care home’s resilience, and any reform that narrows the gap would test business models that rely on it.','## Hospital discharge: the bottleneck that is not shifting','NHS England’s daily discharge data shows that on an average day in September 2026, around 13,600 patients who no longer met the criteria to reside were still in hospital. That is about 58% of those ready to leave each day, and up from around 12,800 in September 2025. The September figure has now risen for three years in a row.','[[chart:1]]','Not every delay is about social care. Hospital processes, transport and family decisions all play a part. But a shortage of home care and care home places is a recurring cause, and the trend is going the wrong way.','What this means: providers that can accept discharges quickly, particularly for people with complex needs, are offering something the NHS is short of. That is a commercial opportunity. It is also a risk, because discharge funding is often short term and tied to winter pressures.','## What to watch next','The Care Quality Commission’s State of Care report for 2025/26 is due this autumn and will add a quality view to these capacity and funding figures. Skills for Care’s fuller annual report, published this month, covers pay and qualifications. Both matter, because commissioners and families increasingly choose on evidence of quality, not just availability.','For providers, the practical response is straightforward. Plan workforce around domestic supply and treat retention as the main recruitment strategy. Know your payer mix, and your local council’s fee trajectory, in detail. Be clear about whether discharge work is core business or opportunistic. And gather evidence of quality from the people who use your services and their families. Minshall Group supports providers with strategy and data work of this kind, and our Straight Talking product helps organisations hear directly from patients and families.'],
 sources:[{t:'Skills for Care, The size and structure of the adult social care sector and workforce in England, 2025/26, June 2026',u:'https://www.skillsforcare.org.uk/Adult-Social-Care-Workforce-Data/workforceintelligence/resources/Reports/National/The-size-and-structure-of-the-adult-social-care-sector-and-workforce-in-England-2026.pdf'},{t:'Skills for Care, Adult social care vacancy rate falls to lowest level in a decade as workforce grows, 24 June 2026',u:'https://www.skillsforcare.org.uk/news-and-events/news/adult-social-care-vacancy-rate-falls-to-lowest-level-in-a-decade-as-workforce-grows'},{t:'Department of Health and Social Care, Adult social care activity report 2024 to 2025: commentary, updated October 2026',u:'https://www.gov.uk/government/statistics/adult-social-care-activity-report-england-2024-to-2025/adult-social-care-activity-report-2024-to-2025-commentary'},{t:'Department of Health and Social Care, Adult social care finance report, England: 2024 to 2025, October 2025',u:'https://www.gov.uk/government/statistics/adult-social-care-finance-report-england-2024-to-2025/adult-social-care-finance-report-england-2024-to-2025'},{t:'ADASS, Spring Survey 2026: Rising adult social care needs leave councils £715 million over budget, July 2026',u:'https://www.adass.org.uk/adass-spring-survey-rising-adult-social-care-needs-leave-councils-715-million-over-budget/'},{t:'LaingBuisson, One in seven independent nursing homes charge over £1,800 a week to new admissions, 27 February 2025',u:'https://www.laingbuisson.com/press-releases/one-in-seven-independent-nursing-homes-charge-over-1800-a-week-to-new-admissions-as-increases-to-the-national-living-wage-uplifts-and-employers-national-insurance-contributions-drive-care-h/'},{t:'LaingBuisson, Care Homes for Older People UK Market Report, 36th edition, 22 April 2026',u:'https://go.laingbuisson.com/care-home-report-36'},{t:'NHS England, Acute discharge situation report, timeseries April 2021 to September 2026, published 8 October 2026',u:'https://www.england.nhs.uk/statistics/statistical-work-areas/discharge-delays/acute-discharge-situation-report/'},{t:'Care Quality Commission, State of Care (2025/26 edition forthcoming), accessed October 2026',u:'https://www.cqc.org.uk/publications/major-report/state-care'}]},
{slug:'nhs-elective-backlog-and-the-independent-sector-2026',tag:'Research',cap:'data-ai',date:'2026-10-18',mins:6,
 t:'The elective backlog in 2026: a target met, a plateau, and an independent sector in the wrong places',
 d:'England hit its 65% interim waiting time target in March 2026 and has not moved since. The latest data shows where the long waits are, where independent providers actually work, and why the two do not line up.',
 stats:[{n:'7.37m',l:'RTT pathways on the waiting list in England, end of August 2026 (about 6.2m individual patients)'},{n:'65.2%',l:'Pathways waiting under 18 weeks, August 2026, against a 92% constitutional standard'},{n:'113,339',l:'Pathways waiting over 52 weeks, August 2026, up from about 94,400 in March 2026'},{n:'24.7%',l:'Patients waiting six weeks or more for a key diagnostic test, August 2026, against a 1% standard'}],
 charts:[{t:'Share of waiting list pathways under 18 weeks, selected specialties',unit:'%',src:'NHS England RTT full extract, August 2026, reporting trusts only; Minshall Group analysis',bars:[{l:'Oral surgery',v:53.8},{l:'ENT',v:56.8},{l:'Plastic surgery',v:59.4},{l:'Gynaecology',v:59.6},{l:'Trauma and orthopaedics',v:60.9},{l:'All specialties',v:65.2},{l:'Ophthalmology',v:72.2}]},{t:'Share of completed admitted pathways delivered by non-NHS providers, by specialty',unit:'%',src:'NHS England RTT full extract, August 2026, provider basis; Minshall Group analysis',bars:[{l:'Ophthalmology',v:44.6},{l:'Trauma and orthopaedics',v:30.8},{l:'All specialties',v:17.5},{l:'General surgery',v:16.0},{l:'Gastroenterology',v:15.3},{l:'Oral surgery',v:11.1},{l:'Gynaecology',v:6.0},{l:'ENT',v:2.2}]}],
 body:['At the end of August 2026 there were 7.37 million referral to treatment pathways on the waiting list in England. Because some people wait on more than one pathway, NHS England estimates that this is about 6.2 million individual patients. The list is 0.5% smaller than a year earlier. That flat headline hides two things that matter for anyone selling into NHS elective care: progress has stalled since the spring, and the independent sector is concentrated in specialties that are no longer where the worst waits are.',
 '## A target met, then held rather than beaten',
 'The interim ambition for March 2026 was for 65% of patients to be waiting under 18 weeks. NHS England’s time series, which includes estimates for trusts that did not report, puts March 2026 at 65.3%. The target was met, narrowly.',
 'Five months later the position has not improved. In August 2026, 65.2% of pathways were within 18 weeks. That is 4.2 percentage points better than August 2025, but no better than March. Over the same five months the list grew from 7.11 million to 7.37 million pathways, and the number waiting more than 52 weeks rose from about 94,400 to 113,339. The constitutional standard is still 92%.',
 'The next step is harder. The Medium Term Planning Framework asks every trust to improve 18-week performance by at least 7%, or to reach 65%, whichever is greater, in 2026/27. The aim is a national figure of 70%, and 92% by the end of 2028/29. The activity mix makes that harder still. In the 12 months to August 2026, clock starts per working day rose 3.2% and completed pathways rose 2.2%. Completed admitted pathways actually fell 2.8%, while non-admitted pathways rose 3.5%. Growth is coming from outpatient work, not from operations.',
 '## Where the long waits sit',
 'Trauma and orthopaedics has the largest list, with about 851,000 pathways at reporting trusts and 60.9% within 18 weeks. It also has the most long waiters: 22,043 pathways over 52 weeks. Trauma and orthopaedics, gynaecology and ENT together account for 43% of all 52-week waits at reporting trusts. Oral surgery has the weakest 18-week performance of any major specialty, at 53.8%.',
 '[[chart:0]]',
 '## The independent sector: concentrated, and capped',
 'Our analysis of the August 2026 provider-level data shows that independent and other non-NHS providers delivered 17.5% of completed admitted pathways and 7.0% of non-admitted pathways. The admitted share is very uneven. It is 44.6% in ophthalmology and 30.8% in trauma and orthopaedics, but 6.0% in gynaecology and 2.2% in ENT.',
 '[[chart:1]]',
 'That is the mismatch. The sector is deep in high-volume, standardised day-case work, where it built its NHS business. It is shallow in two of the three specialties that hold the most 52-week waits.',
 'NHS volumes are also under pressure. The Independent Healthcare Providers Network (IHPN) reports that the sector’s share of NHS elective activity rose from about 7% before the pandemic to a peak of 10% in late 2024 and early 2025, then fell to 7.5% in February 2026. Its admitted activity that month was 22% lower than in February 2025. IHPN links the fall to integrated care boards (ICBs) using Activity Management Plans, which can put a hard cap on what a provider delivers. ICBs could use these from October 2025. IHPN also points to changes in how choice-based services are contracted. In April and May 2026, independent sector RTT activity was 9% lower than in the same months two years earlier. IHPN measures share differently from our provider cut, so the two series should not be compared directly. The direction is the same, though.',
 'Speed is not the problem. In August 2026, 75.4% of pathways waiting with non-NHS providers were within 18 weeks, compared with 64.4% at NHS providers. Commissioners are trading speed for control of the elective budget, and that is shaping the market.',
 '## Diagnostics: the front door is the bottleneck',
 'At the end of August 2026, 1.83 million people were waiting for one of the 15 key diagnostic tests. That is 149,300 more than a year earlier. Of these, 24.7% had waited six weeks or more. The standard is 1%, and the 2026/27 planning requirement is 20% or better, or an improvement of at least 3%. Tests performed rose to 2.51 million in the month.',
 'Community diagnostic centres are where capacity is growing fastest. They delivered 845,229 tests in August 2026, 22% more than in August 2025, and 8.77 million across 2025/26. National planning guidance expects their capacity to be fully used and their opening hours extended where possible. Whatever happens in elective surgery, there is clear demand for diagnostic throughput.',
 '## Yorkshire and the Humber: two markets in one region',
 'On a commissioner basis, West Yorkshire ICB had 70.5% of pathways within 18 weeks in August 2026, well above England. Some 12.7% of its patients’ waiting pathways were held by non-NHS providers, almost double the national figure of 6.6%. Humber and North Yorkshire ICB had 60.5% within 18 weeks and 6,114 pathways over 52 weeks. That is 2.7% of its list, against 1.5% across all reporting providers. South Yorkshire figures are not comparable this month because Sheffield Teaching Hospitals did not submit data.',
 '## What this means',
 'For independent providers, growth will not come from doing more of the same ophthalmology and orthopaedic volume. Activity plans are capping that. The opportunity is in specialties with long waits and little independent capacity, such as gynaecology, ENT and oral surgery, and in diagnostics, where demand is growing faster than activity. The case has to be made ICB by ICB, and it has to show value as well as speed.',
 'For health technology companies, including overseas firms entering the UK, the data points to productivity rather than capacity. Admitted activity is falling while referrals rise, so tools that validate waiting lists, manage referral demand, move follow-ups to patient-initiated pathways or increase diagnostic throughput address the binding constraint. A national 70% target with flat surgical activity will be met through better use of capacity or not at all.',
 'National averages are a poor guide to commercial decisions. Performance, long waits and independent sector penetration vary widely between neighbouring ICBs, even within one region. Providers should map their specialty mix against local waiting lists and contracting intentions before they set targets for 2027. Minshall Group’s DataLense healthcare commercial intelligence and market entry work are built for that kind of analysis.'],
 sources:[{t:'NHS England, Statistical press notice: NHS referral to treatment (RTT) waiting times data, August 2026, 8 October 2026',u:'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/10/Aug26-RTT-statistical-press-notice-PDF-389K-vjgRdG.pdf'},{t:'NHS England, RTT Overview Timeseries including estimates for missing trusts, April 2007 to August 2026, October 2026',u:'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/10/RTT-Overview-Timeseries-Including-Estimates-for-Missing-Trusts-Aug26-XLS-139K-vjgRdG.xlsx'},{t:'NHS England, RTT full CSV data file, August 2026 (specialty, provider and ICB analysis by Minshall Group), October 2026',u:'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/10/Full-CSV-data-file-Aug26-ZIP-3M-vjgRdG.zip'},{t:'NHS England, Medium term planning framework: delivering change together 2026/27 to 2028/29, October 2025',u:'https://www.england.nhs.uk/long-read/medium-term-planning-framework-delivering-change-together-2026-27-to-2028-29/'},{t:'IHPN, NHS Electives Insight: April 2026 (February 2026 data)',u:'https://www.ihpn.org.uk/nhs-electives-insight-april-2026/'},{t:'IHPN, NHS Electives Insight: July 2026 (2025/26 and April to May 2026 data)',u:'https://www.ihpn.org.uk/nhs-electives-insight-july-2026/'},{t:'NHS England, Diagnostic Waiting Times and Activity: August 2026 monthly report, 8 October 2026',u:'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/10/DWTA-August-2026-Report_FT0CD.pdf'},{t:'NHS England, Community diagnostic centre activity timeseries 2026/27, July 2021 to August 2026, October 2026',u:'https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/10/CDC-Activity-Timeseries-2026-27_August_FT0CD.xlsx'}]},
  {slug:'why-we-built-the-webmins-score',tag:'Digital',cap:'digital',date:'2026-10-18',mins:5,cta:{t:'Check my site, free',h:'/digitalsme',p:'Get your Webmins Score and the fixes that matter, in about 20 seconds.'},
    t:'Why we built the Webmins Score',
    d:'Speed tests tell you how fast a page loads. They do not tell a café owner whether the website brings in bookings. We wanted one honest number that does, so we built it.',
    stats:[{n:'6',l:'Things the score weighs up, from phone experience to what customers in your sector expect'},{n:'20s',l:'Roughly how long a check takes, free, with no sign-up'},{n:'3,628',l:'Yorkshire business websites we scored for our 2026 research'},{n:'61',l:'Their average Webmins Score out of 100'}],
    charts:[{t:'How the Webmins Score is weighted',unit:'% of the total score',src:'Minshall Group, Webmins Score method, October 2026',bars:[{l:'Experience on a phone',v:25},{l:'Findability in Google and AI search',v:20},{l:'Conversion into enquiries',v:20},{l:'Trust',v:15},{l:'Modern and relevant',v:10},{l:'Sector fit',v:10}]}],
    body:['Most small business owners have been told their website is slow, or that it scores 43 on some test, without being told what that means for the till. The tools are good at what they measure. Google’s own tests, for example, are excellent at page speed and technical quality. But a fast site with no opening hours, no reviews and no way to book is still losing customers, and a speed score will not tell you that.',
      'We kept running into this with clients. So we built a single score that asks the question owners actually care about: is this website helping my business win customers, compared with what people expect from a business like mine?',
      '## What it measures',
      'The Webmins Score is out of 100 and combines six things. Experience asks whether the site is quick and easy to use on a phone, where most local searches now happen. Findability asks whether Google and AI assistants can understand what the business is, where it is and what it offers. Trust looks for the signals that make a site feel current, safe and credible. Conversion asks whether a visitor can easily get in touch, book or buy. Modern and relevant checks for what people now expect a website to do.',
      'The sixth part is the one most checks leave out: sector fit. A café needs its menu, opening hours and a map. A builder needs a quote form, photos of past work and the areas they cover. A clinic needs online booking, prices and practitioners. We check for the seven essentials customers expect in each sector, so a site is judged against its own market, not a generic list.',
      '[[chart:0]]',
      'The weights reflect what moves enquiries. Experience counts most, because a site that is hard to use on a phone loses people before anything else matters. Findability and conversion come next, because being found and being easy to contact are the two halves of an enquiry. The total gives a grade: 85 and above is excellent, 70 and above is good, 50 and above needs work, and below 50 is falling behind.',
      '## Why one number',
      'A single score is a simplification, and we know it. We use it because it gives owners something they can act on and track. Every check also breaks the score into its parts and lists the specific fixes, in plain English, in the order they are likely to matter. The number starts the conversation. The fixes are the point.',
      'It also makes progress visible. Clients in our portal have their score re-checked every month, so they can see whether the changes are working rather than taking our word for it.',
      '## What it told us about Yorkshire',
      'To test the score at scale, we ran it on every independent Yorkshire business we could find that lists its own website: 3,628 sites were scored. The average was 61. Most sites were not broken. They had simply stopped keeping up.',
      'The gaps were consistent and fixable. 56% had no enquiry form on the homepage, 55% had no visitor analytics, and 47% gave Google and AI assistants no structured information about the business. Cafés, pubs and restaurants scored lowest, at 58 on average: only 17% showed reviews and 44% showed opening hours, two of the first things a customer looks for. Health, beauty and wellbeing sites scored best, at 65.',
      'None of those fixes needs a new website. Most take an afternoon.',
      '## How to use it',
      'Run the check on your own site. It takes about 20 seconds, it is free and there is no sign-up. Pick your sector, read the fixes, and start with the top one. If you would rather we did it, the check recommends the package that fits and you can price it on the same page.',
      'We also hold ourselves to it. Our own pages are checked with the same score we use on everyone else’s.'],
    sources:[{t:'Minshall Group, The state of Yorkshire’s small business websites 2026, October 2026',u:'https://minshallgroup.com/insights/state-of-yorkshire-small-business-websites-2026'},{t:'Minshall Group, free website check and Webmins Score',u:'https://minshallgroup.com/digitalsme'}]},
  {slug:'state-of-yorkshire-small-business-websites-2026',tag:'Research',cap:'digital',date:'2026-10-17',mins:6,custom:true,
    t:'The state of Yorkshire’s small business websites 2026',
    d:'We checked 3,628 independent business websites across Yorkshire. Sector by sector and town by town, here is how they score and what to fix first.',
    body:[]},
  {slug:'website-packages-for-small-businesses',tag:'News',cap:'digital',date:'2026-10-17',mins:3,
    t:'Website packages for small businesses, from £495',
    d:'Three fixed prices, paid in three stages, with no calls needed. Here is how it works.',
    body:['We have opened website packages for small and medium-sized businesses. The idea is simple: agency standards at prices a café, a builder or a clinic can justify.',
      '## Three packages',
      'Refresh, from £495, rewrites and modernises up to 10 pages. Rebuild, from £995, covers up to 50 pages and adds enquiry forms, analytics and search set-up. Grow, from £1,995, covers up to 100 pages and adds customer accounts, booking or quote journeys and content migration. Extra pages are £10 each.',
      '## How it works',
      'Start with the free website check. It scores your current site and recommends a package. Build your quote online in two minutes, then answer the onboarding questions in your own time. There is no kick-off call to book. You pay in three equal parts: to start, when you approve the design, and on completion.',
      '## You own it',
      'Every site is delivered on Vercel. You can take the code to your own platform within 30 days, or we host it and point your domain at it for £150 a year. There is no retainer and no lock-in.',
      'See the packages and the honest three-year cost comparison on our website page.']},
  {slug:'what-ai-search-means-for-small-business-websites',tag:'Digital',cap:'digital',date:'2026-10-17',mins:5,
    t:'What AI search means for small business websites',
    d:'People now ask assistants, not just search engines, where to eat or who to call. Here is how to make sure they can describe you accurately.',
    body:['More people now ask an AI assistant, or read an AI summary at the top of a search page, before they click anything. The assistant answers with whatever it can confidently find about your business. If your website does not say it clearly, the answer may come from somewhere else, or not at all.',
      '## Say the basic facts in plain text',
      'What you do, where you are, when you are open, how to book and how much things cost. Put them on the page as words, not only inside images or PDFs. Assistants and search engines read text far more reliably than pictures of text.',
      '## Add structured data',
      'Structured data is a short block of code that labels those facts for machines: your business type, address, opening hours, phone number and services. In our research, 47% of Yorkshire small business websites had none. It is invisible to visitors and takes minutes to add.',
      '## Keep it consistent everywhere',
      'Your name, address and phone number should match across your website, Google Business Profile and directories. Conflicting details make an assistant less confident about you.',
      '## Answer the questions people actually ask',
      'A short FAQ that answers real questions (do you take walk-ins, is there parking, do you cover my area) gives assistants something specific to quote.',
      'Our free website check now looks for structured data and the other signals assistants rely on, and compares you with what customers expect in your sector.']},
  {slug:'what-cafe-customers-look-for-before-they-visit',tag:'Digital',cap:'digital',date:'2026-10-17',mins:4,
    t:'What café customers look for before they visit',
    d:'Opening hours, a menu, reviews and a map. Most café websites in Yorkshire are missing at least one.',
    body:['Café, pub and restaurant websites had the lowest average score in our Yorkshire research, at 58 out of 100. The gaps were not about design. They were about the handful of things customers check before deciding to come in.',
      '## Opening hours, today',
      'Only 44% of the sites we checked showed opening hours. Put them on the homepage, and if you can, highlight today. It is the single most common reason people visit a café website.',
      '## The menu, as text',
      '55% had a menu on the site. A menu as text, with prices and dietary tags, is easier to read on a phone than a photographed card, and search engines can read it too.',
      '## Reviews',
      'Just 17% showed reviews. You do not need a widget: three short quotes from real customers, with their permission, do the job.',
      '## A map and a tap-to-call number',
      '39% had a map or directions, and 32% a tap-to-call phone number. Both take a minute to add and save a customer from giving up.',
      'Our concept café site shows all of this working together, and the free website check will tell you which of these your own site is missing.']},
  {slug:'how-trades-websites-win-more-quote-requests',tag:'Digital',cap:'digital',date:'2026-10-17',mins:4,
    t:'How trades websites win more quote requests',
    d:'Builders, plumbers and electricians are judged on trust before they are ever asked for a price. Here is what our research found missing.',
    body:['For a trades business, the website has one job: to make a stranger confident enough to ask for a quote. In our Yorkshire research, trades sites averaged 62 out of 100, and the gaps were mostly about trust.',
      '## Say where you work',
      'Only 8% of trades sites listed the areas they cover. A simple list of towns tells visitors you will travel to them, and helps you appear in local searches.',
      '## Show proof',
      '21% showed accreditations and 32% showed photos of past work. Trade memberships, insurance and before-and-after photos do more to win work than any slogan.',
      '## Make asking easy',
      'Half had a quote or enquiry form, and 44% a tap-to-call number. Put both near the top of the page. Many people will not phone, but they will fill in four fields.',
      '## Reviews',
      '29% showed reviews. A few genuine reviews, close to the quote form, reassure people at the moment they decide.',
      'Our concept builder’s site shows these working together, including a before-and-after slider. The free website check scores your own site against what customers expect from trades.']},
  {slug:'questions-to-ask-before-signing-a-clinic-lease',tag:'Data & AI',cap:'data-ai',date:'2026-10-17',mins:5,
    t:'Questions to ask before signing a clinic lease',
    d:'The wrong site is the most expensive mistake in independent healthcare. Six questions that should come before the rent negotiation.',
    body:['Site decisions in independent healthcare are often made on instinct, a rent quote and what someone already knows about the town. The lease then shapes the business for ten years. These six questions are worth answering first.',
      '## Who lives within a realistic drive?',
      'Use drivetime, not distance. A clinic two miles away across a river or a ring road can be further in practice than one five miles along a dual carriageway. Look at 10, 20 and 30 minutes.',
      '## What do they need?',
      'Age profile, long-term conditions, activity levels and car dependency all change demand for different services. Compare the catchment with similar ones, not just the national average.',
      '## Who is already there?',
      'Map every provider, NHS and independent. Note their services and how long their waits are. Long NHS waits nearby can signal self-pay demand.',
      '## Can you staff it?',
      'The clinicians you need must live within reach. Workforce is the question most site decisions forget.',
      '## Where is demand heading?',
      'A rising trend in a modest market can beat a large but flat one.',
      '## What do you not know?',
      'Every dataset has gaps. Ask what is missing, and treat confident numbers with no stated source with caution.',
      'DataLense answers these questions for any UK postcode. You can see a sample catchment report on our DataLense page.']},
  {slug:'cookie-consent-and-analytics-for-small-businesses',tag:'Digital',cap:'digital',date:'2026-10-17',mins:4,
    t:'Analytics and cookie consent: a plain-English guide for small businesses',
    d:'You can learn how people use your website without nagging them or breaking the rules. Here is the approach we use ourselves.',
    body:['Analytics tells you which pages work and where people give up. In our research, 55% of Yorkshire small business websites had none. Often the worry is cookies and consent. This is general guidance, not legal advice.',
      '## The rule in brief',
      'In the UK, you generally need consent before setting non-essential cookies, including analytics cookies. Strictly necessary storage, such as remembering a visitor’s cookie choice, does not need consent.',
      '## A simple approach',
      'Ask clearly, with an equally easy yes and no. Do not set analytics cookies until someone says yes. Let people change their mind with a link in the footer, and explain it in your privacy notice.',
      '## Cookie-free analytics',
      'Some tools, including Microsoft Clarity, can run without cookies until consent is given, so you still learn how pages are used without identifying repeat visitors. That is how this website works.',
      '## Write it down',
      'Your privacy notice should say what you use, what it collects, the cookies it sets and how to change your choice. Keep it short and specific.',
      'Every website we build includes analytics and a consent banner set up this way.']},
  {slug:'uk-market-entry-one-phase-at-a-time',tag:'Strategy',cap:'strategy',date:'2026-10-17',mins:5,
    t:'UK market entry, one phase at a time',
    d:'Overseas companies often arrive with a registered product and no channel. A phased entry lets you commit capital only as the evidence comes in.',
    body:['Overseas health technology and medtech companies often reach the UK with regulatory registration and early pilots, but no channel, pricing or proposition for the people who will actually buy. The temptation is to launch everywhere at once. A phased entry is usually safer and faster.',
      '## Start with where demand overlaps',
      'Find where the conditions you treat, the ability to pay and the right clinical partners overlap. That gives you a short list of priority locations, not a national launch.',
      '## Choose a route to market',
      'Direct to consumer, through clinics, through insurers or into the NHS each need a different proposition, price and evidence base. Pick one to prove first.',
      '## Recruit founding partners',
      'A small group of credible early partners, with clear pilot measures, creates the evidence and references the next phase needs.',
      '## Set the measures before you start',
      'Agree what success looks like for each phase, so the decision to commit more capital is made on results rather than momentum.',
      'We work alongside XV Capital Advisory on UK market entry for overseas companies. If you are planning a UK launch, we would be glad to talk it through.']},
  {slug:'knexu-is-now-minshall-group',tag:'News',cap:'strategy',date:'2026-10-16',mins:3,
    t:'Knexu is now Minshall Group',
    d:'Same people, same standards, a broader offer. Why we changed our name, and what it means for clients.',
    body:['Knexu is now Minshall Group. The people, the clients and the way we work are the same. What has changed is the size of the job we are asked to do, and the name now reflects it.',
      'Knexu started as a strategic growth agency for sport, health and wellbeing. Every engagement was scoped to a number: new revenue, recovered margin or unlocked capital. That has not changed, and it will not.',
      'What changed is what it took to move those numbers. A self-referral strategy needed a booking journey to make it real. A site decision needed a catchment model, so we built one, and it became DataLense. The push to hear from patients more often needed a simpler way for them to speak up, and that became Straight Talking. New services needed a position, a brand and a launch. Overseas companies asked us to take their products into the UK. Increasingly, the work spans strategy, digital, data and brand at once.',
      'Under one name that was built for consultancy, that breadth was hard to see. Minshall Group puts it on the surface: two practices, strategy and consultancy, digital and product, data, AI and automation, and brand, marketing and growth, working as one team, alongside the products we own and run.',
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
  {slug:'feedback-in-the-moment',tag:'Digital',cap:'digital',date:'2026-07-08',mins:4,
    t:'Feedback in the moment beats the survey nobody finishes',
    d:'Health and social care services are asked to hear from patients more often. The answer is a simpler way to speak up, at the point of care.',
    body:['Most patient feedback arrives late. A survey lands by email days or weeks after the visit, a small share of people reply, and by then the detail that mattered has faded. It satisfies a requirement and tells the service very little.',
      '## Ask in the moment',
      'The best time to hear how care felt is straight after it. A code on a stand, a card or a poster lets someone say how it went before they leave the building or the carer leaves their home. It takes less than a minute.',
      '## Keep it small',
      'One rating and a few words about that visit and the people involved. Not a questionnaire, and not wider than the experience itself. Small asks get answered.',
      '## Close the loop',
      'Feedback is only useful if it reaches the right person. Compliments should reach the team who earned them; concerns should go straight to someone who can act. Then tell people what changed: you said, we did.',
      '## Let patients hear each other',
      'Sharing what other patients have said, with their permission, builds trust and encourages the next person to speak up. Patient voices belong where patients are, not only in a report.',
      'That is the thinking behind Straight Talking, our patient feedback platform for NHS, independent and social care providers.']}
];

/* ---------------- CLIENTS (marquee) ---------------- */
export const CLIENTS=['Prime Health','Medical Imaging Partnership','Housden Group','Leeds Beckett University','Northumbria University','Eventmaster','The Sponsor Collective','Technique Health','Propel Teams'];

/* ---------------- LEGAL ---------------- */
export const LEGAL={trading:'Minshall Group',company:'Minshall Group Limited',number:'17529393',office:'66 Paul Street, London EC2A 4NA',reg:'England & Wales'};

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
      {t:'Patient feedback',d:'In-the-moment feedback from patients and people in care, routed straight to the right team, with Straight Talking as the platform.'},
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
      {q:'Do you only work in healthcare?',a:'No. Health and sport are where we go deepest, and we also work with universities, public bodies and growth companies. The approach carries across sectors.'},
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
      includes:['Up to 10 pages rewritten and refreshed','Modern, mobile-first design','News or blog section you can update','Speed and accessibility fixes','Page titles and descriptions for Google','Delivered on Vercel, ready to go live']},
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
  hosting:150,            /* per year: we host it and point the client's domain at it */
  handoverDays:30,        /* days after delivery to move the code to their own platform */
  /* Domains: api/domain.js asks every connected registrar (Vercel, GoDaddy)
     and the cheapest first-year price is shown, converted to pounds at
     usdToGbp where needed, rounded up, plus domainAdmin. With no registrar
     connected, or for endings they cannot price, the table below is used.
     Endings in neither are priced on request. Confirmed on the quote. */
  usdToGbp:0.8,
  domainAdmin:0,
  domains:{'.co.uk':15,'.uk':15,'.org.uk':15,'.com':10,'.org':10,'.net':11,'.co':24,'.io':12,'.london':35},
  domainTry:['.co.uk','.uk','.com','.org'],
  /* concept sites at public/examples/<slug>/ (fictional businesses, clearly labelled) */
  examples:[
    {slug:'cafe',score:96,name:'Larder & Loaf',sector:'Café and bakery',package:'refresh',features:['Menu with prices and dietary tags','Opening hours that highlight today','Table booking and cake orders','Reviews, map and Instagram']},
    {slug:'trades',score:96,name:'Brightwell Building Co.',sector:'Building and renovation',package:'rebuild',features:['Quote form above the fold','Services with “from” prices','Interactive before-and-after slider','Areas covered, reviews and FAQs']},
    {slug:'clinic',score:96,name:'Northgate Physio',sector:'Physiotherapy clinic',package:'grow',features:['Online booking with live time slots','Treatments, lengths and prices','Practitioner profiles and patient login','Insurer, parking and access details']}
  ],
  /* Why we do this: UK figures from DBT Business population estimates 2024. */
  why:{
    stats:[['99.8%','of UK businesses are small or medium-sized'],['3 in 5','private-sector jobs are in SMEs'],['Half','of private-sector turnover comes from SMEs']],
    points:[
      {t:'Agency standards, SME prices',d:'The same design, engineering and measurement we use for listed companies and the NHS, packaged so a café or a builder can afford it.'},
      {t:'Growth that stays local',d:'When a local business wins more customers online, that money is spent with local suppliers and pays local wages. That is the growth we want to help create.'},
      {t:'No lock-in, ever',d:'Fixed prices, no retainer and the code is yours. Take it anywhere within 30 days, or let us host it for £150 a year.'}
    ]
  },
  /* Honest cost comparison. DIY = a template builder on a business plan.
     Agency = typical UK small-agency ranges. Ours = package + £10 per
     extra page. 3-year totals include hosting/plan and a domain, not changes. */
  compare:[
    {id:'s',label:'Small site',pages:10,eg:'a café or salon',
      diy:{build:'£0 to £100',year:'£265',hours:'25 to 40 hours',changes:'Your time',total:'about £800',own:'Locked to the platform'},
      us:{build:'£495',year:'£165',hours:'About 2 hours of questions',changes:'Small fixes included at build; after launch, quoted first',total:'£990',own:'You own the code'},
      ag:{build:'£3,000 to £6,000',year:'£600 to £1,800',hours:'3 to 5 meetings',changes:'£60 to £95 an hour',total:'£4,800 to £11,400',own:'Often theirs until paid off'}},
    {id:'m',label:'Growing business',pages:50,eg:'a trades firm or clinic',
      diy:{build:'£0 to £200',year:'£300',hours:'80 to 120 hours',changes:'Your time',total:'about £1,100',own:'Locked to the platform'},
      us:{build:'£995',year:'£165',hours:'About 3 hours of questions',changes:'Small fixes included at build; after launch, quoted first',total:'£1,490',own:'You own the code'},
      ag:{build:'£8,000 to £15,000',year:'£1,200 to £3,000',hours:'6 to 10 meetings',changes:'£60 to £95 an hour',total:'£11,600 to £24,000',own:'Often theirs until paid off'}},
    {id:'l',label:'Established firm',pages:200,eg:'a multi-site or professional firm',
      diy:{build:'£0 to £300',year:'£400',hours:'250 hours or more',changes:'Your time',total:'about £1,500',own:'Locked to the platform'},
      us:{build:'£2,995',year:'£165',hours:'About 4 hours of questions',changes:'Small fixes included at build; after launch, quoted first',total:'£3,490',own:'You own the code'},
      ag:{build:'£30,000 or more',year:'£1,800 to £6,000',hours:'10 or more meetings',changes:'£75 to £120 an hour, or a retainer',total:'£35,400 or more',own:'Often theirs until paid off'}}
  ],
  stages:[{t:'To start',d:'Books your slot and starts discovery.'},{t:'Halfway',d:'When you approve the design and first pages.'},{t:'On completion',d:'When the site is live and signed off.'}]
};

/* ---------------- WEBMINS SCORE (site check) ----------------
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

/* old practice slugs now live inside the two practices */
const CAP_ALIAS:Record<string,string>={'data-ai':'digital','brand-growth':'strategy'};
const fixCaps=(a:string[])=>[...new Set(a.map(x=>CAP_ALIAS[x]||x))];
CASES.forEach((c:any)=>{c.caps=fixCaps(c.caps);});
FINDER.forEach((f:any)=>{f.caps=fixCaps(f.caps);});
INDUSTRIES.forEach((i:any)=>{i.caps=fixCaps(i.caps);});
INSIGHTS.forEach((a:any)=>{if(CAP_ALIAS[a.cap])a.cap=CAP_ALIAS[a.cap];});

/* ---------------- TEAM (home page "Who you'll work with") ----------------
   The section appears only when this list has at least one person.
   {name, role, bio, photo?: '/team/luke.webp', linkedin?: 'https://…'} */
export const TEAM:any[]=[];
