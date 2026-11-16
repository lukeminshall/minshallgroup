/* =====================================================================
   ROUTER — History API with clean URLs. Deep links and refreshes are
   served by prerendered HTML (scripts/prerender.mjs); the client takes
   over navigation, with a View Transition where the browser supports it.
   ===================================================================== */
import {initPage} from './motion';
import {setActive} from './nav';
import {preselect,fitBrief} from './forms';
import {portalGate} from './portal/gate';

/* The first page arrives prerendered, so the page text (every page on the site)
   is not needed until someone moves to another page. It loads the moment they
   point at, touch or tab to a link, and is kept from then on. */
type Site={P:Record<string,()=>string>,ROUTES:any,DEFAULT_TITLE:string,DEFAULT_DESC:string,SITE:string};
let site:Promise<Site>|null=null;
const loadSite=()=>site??=Promise.all([import('./pages'),import('./routes')]).then(([a,b])=>({P:a.P,ROUTES:b.ROUTES,DEFAULT_TITLE:b.DEFAULT_TITLE,DEFAULT_DESC:b.DEFAULT_DESC,SITE:b.SITE}));

/* Code for interactive pages loads only on the pages that have them, then runs in this order. */
const PAGE_CODE:[string,()=>Promise<any>,string][]=[
  ['#sme-form',()=>import('./sme'),'initSme'],
  ['#start-form',()=>import('./start'),'initStart'],
  ['[data-demo]',()=>import('./demos'),'initDemos'],
  ['#prospect',()=>import('./prospect'),'initProspect'],
  ['[data-pf-obj]',()=>import('./petersfield'),'initPetersfield'],
  ['[data-dg-price]',()=>import('./digbeth'),'initDigbeth'],
  ['[data-pf-year],[data-pf-rp],[data-pf-cp],.pf-dash,[data-pf-embed],[data-pf-copy]',()=>import('./place'),'initPlace'],
  ['[data-wt]',()=>import('./walkthrough'),'initWalkthrough'],
];
function initPageCode(){
  initPage();preselect();fitBrief();
  const need=PAGE_CODE.filter(([sel])=>document.querySelector(sel));
  if(need.length)Promise.all(need.map(([,load])=>load())).then(ms=>ms.forEach((m,i)=>m[need[i][2]]()));
  portalGate();
}

const path=()=>location.pathname.replace(/\/+$/,'')||'/';

function setMeta(p,{ROUTES,DEFAULT_TITLE,DEFAULT_DESC,SITE}:Site){
  const r=ROUTES[p];const title=r?r.title:'Page not found | Minshall Group';const desc=r?r.description:DEFAULT_DESC;
  const url=SITE+(p==='/'?'/':p),canon=r&&r.canonical?SITE+r.canonical:url;
  document.title=title||DEFAULT_TITLE;
  const set=(sel,attr,val)=>{const el=document.querySelector(sel);if(el)el.setAttribute(attr,val);};
  set('meta[name="description"]','content',desc);
  set('link[rel="canonical"]','href',canon);
  set('meta[property="og:url"]','content',url);
  set('meta[property="og:title"]','content',title);
  set('meta[property="og:description"]','content',desc);
  set('meta[name="twitter:title"]','content',title);
  set('meta[name="twitter:description"]','content',desc);
  let rob=document.querySelector('meta[name="robots"]');
  if(r&&r.noindex){if(!rob){rob=document.createElement('meta');rob.setAttribute('name','robots');document.head.appendChild(rob);}rob.setAttribute('content','noindex, nofollow');}else rob?.remove();
}

function paint(S:Site,scroll=true){
  const p=path();
  document.getElementById('app').innerHTML=(S.P[p]||S.P['/404'])();
  setMeta(p,S);setActive(p);
  if(scroll&&!location.hash)window.scrollTo({top:0,behavior:'instant' as ScrollBehavior});
  if(location.hash){const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t)setTimeout(()=>t.scrollIntoView({behavior:'instant' as ScrollBehavior,block:'start'}),60);}
  initPageCode();
}

/* page change: a navy curtain with the brand tile rises, the page swaps
   underneath, and the curtain lifts away. Skipped for reduced motion. */
const RMQ=matchMedia('(prefers-reduced-motion:reduce)');
let busy=false;
export async function render(scroll=true){
  const cur=document.getElementById('curtain');
  let S:Site;
  /* if the page text cannot be fetched, load the prerendered page instead */
  try{S=await loadSite();}catch{location.reload();return;}
  if(RMQ.matches||!cur){paint(S,scroll);return;}
  if(busy){paint(S,scroll);return;}
  busy=true;
  const r=S.ROUTES[path()];document.getElementById('curtain-label').textContent=r&&path()!=='/'?r.title.split(' | ')[0].split(' — ')[0].split(':')[0]:'';
  cur.classList.remove('leave');cur.classList.add('cover');
  setTimeout(()=>{paint(S,scroll);cur.classList.add('leave');
    setTimeout(()=>{cur.classList.remove('cover','leave');busy=false;},700);},560);
}

function onClick(e){
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const a=e.target?.closest?.('a');if(!a)return;
  const href=a.getAttribute('href');
  if(!href||!href.startsWith('/')||href.startsWith('//'))return;
  if(a.target&&a.target!=='_self')return;
  if(a.hasAttribute('download'))return;
  if(href.startsWith('/examples/'))return;
  const u=new URL(href,location.origin);
  const to=u.pathname.replace(/\/+$/,'')||'/';
  e.preventDefault();
  if(to===path()&&u.search===location.search){
    if(u.hash){history.replaceState(null,'',href);window.dispatchEvent(new HashChangeEvent('hashchange'));const t=document.getElementById(u.hash.slice(1));t?.scrollIntoView({behavior:'smooth'});}
    else window.scrollTo({top:0,behavior:'smooth'});
    return;
  }
  history.pushState(null,'',href);render();
}

export function initRouter(){
  document.addEventListener('click',onClick);
  addEventListener('popstate',()=>render(false));
  /* prerendered markup is already on the page: keep it and just wire it up,
     so entrance animations are not restarted. In dev there is none, so render. */
  const app=document.getElementById('app');
  if(app.children.length){setActive(path());initPageCode();}
  else loadSite().then(S=>paint(S,false));
  const warm=(e:Event)=>{const a=(e.target as HTMLElement)?.closest?.('a');const h=a?.getAttribute('href');if(h&&h.startsWith('/')&&!h.startsWith('//')&&!h.startsWith('/examples/'))loadSite();};
  for(const t of ['pointerover','touchstart','focusin'])document.addEventListener(t,warm,{passive:true});
}
