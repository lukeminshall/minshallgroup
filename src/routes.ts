/* =====================================================================
   ROUTES — canonical, indexable routes with per-page SEO metadata.
   Single source of truth for the client router (title/meta on navigation)
   and the build-time prerenderer (one HTML file per route + sitemap).
   Capability, product and insight routes are generated from content.ts.
   ===================================================================== */
import {CAPS,PRODUCTS,INSIGHTS,LANDINGS} from './content';

export const SITE='https://minshallgroup.com';
export const BRAND='Minshall Group';
export const DEFAULT_TITLE='Minshall Group | Healthcare, Digital & Strategy Consultancy UK';
export const DEFAULT_DESC='Minshall Group is a UK consultancy for strategy, healthcare, digital, data and brand. One senior team that finds the number, builds what moves it, and proves it moved.';

const t=s=>`${s} | ${BRAND}`;

export const ROUTES:Record<string,{title:string,description:string}>={
  '/':{title:DEFAULT_TITLE,description:DEFAULT_DESC},
  '/capabilities':{title:t('Capabilities — strategy, digital, data & AI, brand'),description:'Four practices, one team and one measure. Strategy & consultancy, digital & product, data, AI & automation, and brand, marketing & growth.'},
  '/industries':{title:t('Industries — Healthcare, Sport, Wellbeing, Universities & Public Sector'),description:'Deep experience in health and care, sport, wellbeing, universities, the public sector and growth companies, with capability that carries further.'},
  '/products':{title:t('Products — DataLense and Straight Talking'),description:'Products we own and operate, each born from client work: DataLense for healthcare commercial intelligence and Straight Talking for patient-reported outcomes.'},
  '/work':{title:t('Work — the challenge, what we did, and the return'),description:'Selected engagements across strategy, digital, data and brand, filterable by capability and industry.'},
  '/approach':{title:t('Approach — diagnose, design, build, grow'),description:'How we work: four stages, four engagement models and six principles we hold to, all organised around a single measurable outcome.'},
  '/insights':{title:t('Insights — where markets are moving'),description:'Short, opinionated pieces on strategy, data, AI, digital products and growth.'},
  '/about':{title:t('About — one team for the whole journey'),description:'Minshall Group, formerly Knexu, brings strategy, digital, data and brand together under one senior team, measured on the return.'},
  '/contact':{title:t('Contact — tell us the number you want to move'),description:'Start a conversation with Minshall Group. The outcome you want, the constraint in the way, and the date it has to change by.'}
};
/* search-facing titles for the practices: the phrase people type, first */
const CAP_SEO={strategy:'Strategy Consultancy & UK Market Entry',digital:'Digital Product, Web & Platform Development','data-ai':'Data, AI & Automation Consultancy','brand-growth':'Brand, Marketing & Growth Agency'};
CAPS.forEach(c=>{ROUTES['/capabilities/'+c.slug]={title:t(CAP_SEO[c.slug]||c.t),description:c.d};});
LANDINGS.forEach(L=>{ROUTES['/'+L.slug]={title:L.seoTitle,description:L.desc};});
ROUTES['/digitalsme']={title:t('Website Refresh for Small Businesses from £495'),description:'Free instant website check with your Webmins Score, then a fixed-price refresh from £495. Three packages, clear add-ons, paid in three stages. For UK small businesses.'};
ROUTES['/digitalsme/terms']={title:t('Website refresh offer terms'),description:'The terms that apply to the Minshall Group website refresh offer for small businesses.'};
ROUTES['/privacy']={title:t('Privacy notice'),description:'How Minshall Group (Knexu Limited) uses the information you give us through this website.'};
PRODUCTS.forEach(p=>{ROUTES['/products/'+p.slug]={title:t(p.t+' — '+p.line.replace(/\.$/,'')),description:p.d};});
INSIGHTS.forEach(i=>{ROUTES['/insights/'+i.slug]={title:t(i.t),description:i.d};});
