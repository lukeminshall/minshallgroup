/* =====================================================================
   ROUTES — canonical, indexable routes with per-page SEO metadata.
   Single source of truth for the client router (title/meta on navigation)
   and the build-time prerenderer (one HTML file per route + sitemap).
   Capability, product and insight routes are generated from content.ts.
   ===================================================================== */
import {CAPS,PRODUCTS,INSIGHTS,LANDINGS,CASES} from './content';

export const SITE='https://minshallgroup.com';
export const BRAND='Minshall Group';
export const DEFAULT_TITLE='Minshall Group | Commercial Strategy & Digital for Health and Sport';
export const DEFAULT_DESC='Commercial strategy and digital for health and sport. We find where the growth is, build what it takes to get it, and stay until the number has moved.';

const t=s=>`${s} | ${BRAND}`;

export const ROUTES:Record<string,{title:string,description:string,noindex?:boolean,image?:string}>={
  '/':{title:DEFAULT_TITLE,description:DEFAULT_DESC},
  '/capabilities':{title:t('Capabilities — commercial strategy and digital'),description:'Two practices, one team and one measure: commercial strategy that finds where the growth is, and digital that builds what it takes, including data and practical AI.'},
  '/industries':{title:t('Sectors — Health and Sport'),description:'Commercial strategy and digital for NHS and private providers, health businesses selling into the NHS, and sport. We also work with universities and growth companies.'},
  '/products':{title:t('Products — DataLense and Straight Talking'),description:'Products we own and operate, each born from client work: DataLense for healthcare commercial intelligence and Straight Talking for in-the-moment patient feedback.'},
  '/work':{title:t('Work — the challenge, what we did, and the return'),description:'Selected engagements across strategy, digital, data and brand, filterable by capability and industry.'},
  '/approach':{title:t('Approach — diagnose, design, build, grow'),description:'How we work: four stages, four engagement models and six principles we hold to, all organised around a single measurable outcome.'},
  '/insights':{title:t('Insights — where markets are moving'),description:'Short, opinionated pieces on strategy, data, AI, digital products and growth.'},
  '/about':{title:t('About — one team for the whole journey'),description:'Minshall Group, formerly Knexu, brings strategy, digital, data and brand together under one senior team, measured on the return.'},
  '/start':{title:t('Start a project — build your brief, get a fixed quote'),description:'Strategy, data, digital or brand. Build your project brief online and get a short written proposal with a fixed price within two working days.'},
  '/contact':{title:t('Contact — tell us the number you want to move'),description:'Start a conversation with Minshall Group. The outcome you want, the constraint in the way, and the date it has to change by.'}
};
/* search-facing titles for the practices: the phrase people type, first */
const CAP_SEO={strategy:'Strategy Consultancy & UK Market Entry',digital:'Digital Product, Web & Platform Development','data-ai':'Data, AI & Automation Consultancy','brand-growth':'Brand, Marketing & Growth Agency'};
CAPS.forEach(c=>{ROUTES['/capabilities/'+c.slug]={title:t(CAP_SEO[c.slug]||c.t),description:c.d};});
LANDINGS.forEach(L=>{ROUTES['/'+L.slug]={title:L.seoTitle,description:L.desc};});
ROUTES['/digitalsme']={title:t('Website Refresh for Small Businesses from £495'),description:'Free instant website check with your Webmins Score, then a fixed-price refresh from £495. Three packages, clear add-ons, paid in three stages. For UK small businesses.'};
ROUTES['/digitalsme/terms']={title:t('Website refresh offer terms'),description:'The terms that apply to the Minshall Group website refresh offer for small businesses.'};
ROUTES['/privacy']={title:t('Privacy notice'),description:'How Minshall Group Limited uses the information you give us through this website.'};
ROUTES['/products/datalense/sample']={title:t('DataLense sample catchment report'),description:'See what a DataLense healthcare catchment report looks like: drivetime map, market score, competitors, population health, workforce and coverage status. Illustrative data.'};
ROUTES['/products/straight-talking/demo']={title:t('Straight Talking live demo'),description:'Give feedback as a patient and watch it reach the service, routed to the right person, and appear on the waiting-room screen. Made-up data.'};
PRODUCTS.forEach(p=>{ROUTES['/products/'+p.slug]={title:t(p.t+' — '+p.line.replace(/\.$/,'')),description:p.d};});
CASES.forEach(c=>{ROUTES['/work/'+c.id]={title:t(`${c.head.replace(/\.$/,'')}: ${c.client}`),description:c.ch};});
INSIGHTS.forEach(i=>{ROUTES['/insights/'+i.slug]={title:t(i.t),description:i.d};});

/* internal tools: prerendered so deep links work, but hidden from search and the sitemap */
ROUTES['/tools/prospect']={title:t('Prospect list'),description:'Internal tool.',noindex:true};
ROUTES['/petersfield']={title:t('Petersfield: our digital marketing tender response'),description:'Minshall Group’s response to Petersfield Town Council’s Tourism and Economic Development Digital Marketing tender.',noindex:true,image:'/og-petersfield.png'};
ROUTES['/portal']={title:t('Client portal'),description:'Log in to your Minshall Group project.',noindex:true};

/* Search snippets: keep titles to what Google shows (about 60 characters)
   and descriptions under 160. Drop the brand suffix before cutting words. */
/* hand-written titles where the automatic one would be cut short */
const SEO_TITLES:Record<string,string>={
  '/industries':'Sectors: health and sport, and where they meet',
  '/insights/cookie-consent-and-analytics-for-small-businesses':t('Cookie consent and analytics: a small business guide'),
  '/insights/where-sport-meets-health-2026':t('Where sport meets health: activity and MSK, 2026'),
  '/insights/business-of-uk-sport-2026':t('The business of UK sport, 2026'),
  '/insights/selling-into-the-nhs-2026':t('Selling into the NHS in 2026'),
  '/insights/state-of-adult-social-care-2026':t('The state of adult social care in England, 2026'),
  '/insights/nhs-elective-backlog-and-the-independent-sector-2026':t('The NHS elective backlog and the independent sector, 2026'),
  '/insights/private-patients-pmi-and-self-pay-2026':t('Private patients, PMI and self-pay in 2026'),
  '/work/neurotech-uk':t('Taking a medical wearable to the UK')
};
for(const [k,v] of Object.entries(SEO_TITLES))if(ROUTES[k])ROUTES[k].title=v;
const clip=(s:string,n:number)=>s.length<=n?s:s.slice(0,n-1).replace(/[\s,;:.]+\S*$/,'')+'…';
for(const k of Object.keys(ROUTES)){
  const r=ROUTES[k];let title=r.title.replace(/ — /g,': ');
  const suffix=` | ${BRAND}`;
  if(title.length>65&&title.endsWith(suffix)){const bare=title.slice(0,-suffix.length);title=bare.length<=65?bare:clip(bare,65);}
  r.title=title;r.description=clip(r.description,158);
}
