/* =====================================================================
   ROUTER — History API with clean URLs. Deep links and refreshes are
   served by prerendered HTML (scripts/prerender.mjs); the client takes
   over navigation, with a View Transition where the browser supports it.
   ===================================================================== */
import {P} from './pages';
import {ROUTES,DEFAULT_TITLE,DEFAULT_DESC,SITE} from './routes';
import {initPage} from './motion';
import {setActive} from './nav';
import {preselect,fitBrief} from './forms';
import {initSme} from './sme';
import {initDemos} from './demos';
import {initProspect} from './prospect';
import {portalGate} from './portal/gate';

const path=()=>location.pathname.replace(/\/+$/,'')||'/';

function setMeta(p){
  const r=ROUTES[p];const title=r?r.title:'Page not found | Minshall Group';const desc=r?r.description:DEFAULT_DESC;
  const url=SITE+(p==='/'?'/':p);
  document.title=title||DEFAULT_TITLE;
  const set=(sel,attr,val)=>{const el=document.querySelector(sel);if(el)el.setAttribute(attr,val);};
  set('meta[name="description"]','content',desc);
  set('link[rel="canonical"]','href',url);
  set('meta[property="og:url"]','content',url);
  set('meta[property="og:title"]','content',title);
  set('meta[property="og:description"]','content',desc);
  set('meta[name="twitter:title"]','content',title);
  set('meta[name="twitter:description"]','content',desc);
  let rob=document.querySelector('meta[name="robots"]');
  if(r&&r.noindex){if(!rob){rob=document.createElement('meta');rob.setAttribute('name','robots');document.head.appendChild(rob);}rob.setAttribute('content','noindex, nofollow');}else rob?.remove();
}

function paint(scroll=true){
  const p=path();
  document.getElementById('app').innerHTML=(P[p]||P['/404'])();
  setMeta(p);setActive(p);
  if(scroll&&!location.hash)window.scrollTo({top:0,behavior:'instant' as ScrollBehavior});
  if(location.hash){const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t)setTimeout(()=>t.scrollIntoView({behavior:'instant' as ScrollBehavior,block:'start'}),60);}
  initPage();preselect();fitBrief();initSme();initDemos();initProspect();
  portalGate();
}

/* page change: a navy curtain with the brand tile rises, the page swaps
   underneath, and the curtain lifts away. Skipped for reduced motion. */
const RMQ=matchMedia('(prefers-reduced-motion:reduce)');
let busy=false;
export function render(scroll=true){
  const cur=document.getElementById('curtain');
  if(RMQ.matches||!cur){paint(scroll);return;}
  if(busy){paint(scroll);return;}
  busy=true;
  const r=ROUTES[path()];document.getElementById('curtain-label').textContent=r?r.title.split(' | ')[0].split(' — ')[0]:'Minshall Group';
  cur.classList.remove('leave');cur.classList.add('cover');
  setTimeout(()=>{paint(scroll);cur.classList.add('leave');
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
  if(app.children.length){const p=path();setMeta(p);setActive(p);initPage();preselect();fitBrief();initSme();initDemos();initProspect();portalGate();}
  else paint(false);
}
