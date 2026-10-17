/* =====================================================================
   QUICK SEARCH — ⌘K / Ctrl+K / "/" opens a jump-to box over every page,
   practice, service, case, product and insight. Results are plain links,
   so the router handles them like any other click.
   ===================================================================== */
import {CAPS,CASES,PRODUCTS,INSIGHTS,LANDINGS,INDUSTRIES} from './content';

type Item={t:string,s:string,h:string,k:string};
let items:Item[]|null=null;
/* one entry per title: a dedicated page (listed first) beats a mention */
const uniq=(a:Item[])=>{const seen=new Set<string>();return a.filter(i=>{const k=i.t.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});};
const build=():Item[]=>uniq([
  {t:'Check my website',s:'Free Webmins Score in 20 seconds',h:'/digitalsme',k:'Tool'},
  {t:'Website packages and prices',s:'Refresh, Rebuild and Grow',h:'/digitalsme#packages',k:'Tool'},
  {t:'Start a conversation',s:'Tell us the number you want to move',h:'/contact',k:'Contact'},
  {t:'Client login',s:'Your project, approvals and performance',h:'/portal',k:'Tool'},
  ...CAPS.map(c=>({t:c.t,s:c.line,h:'/capabilities/'+c.slug,k:'Practice'})),
  ...LANDINGS.map(L=>({t:L.eyebrow,s:L.desc,h:'/'+L.slug,k:'Service'})),
  ...CAPS.flatMap(c=>c.services.map(x=>({t:x.t,s:c.t,h:'/capabilities/'+c.slug,k:'Service'}))),
  ...CASES.map(c=>({t:c.head,s:c.client,h:'/work#'+c.id,k:'Work'})),
  ...PRODUCTS.map(p=>({t:p.t,s:p.line,h:'/products/'+p.slug,k:'Product'})),
  ...INDUSTRIES.map(x=>({t:x.t,s:x.d,h:'/industries#'+x.id,k:'Industry'})),
  ...INSIGHTS.map(i=>({t:i.t,s:i.d,h:'/insights/'+i.slug,k:'Insight'})),
  ...[['Work','/work'],['Approach','/approach'],['About','/about'],['Insights','/insights'],['Industries','/industries'],['Products','/products'],['Capabilities','/capabilities']].map(([t,h])=>({t,s:'Page',h,k:'Page'}))
]);
const norm=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g,'');
function score(it:Item,q:string){
  const t=norm(it.t),s=norm(it.s);if(!q)return 1;
  let n=0;for(const w of q.split(/\s+/).filter(Boolean)){
    if(t.startsWith(w))n+=6;else if(t.includes(' '+w))n+=4;else if(t.includes(w))n+=3;else if(s.includes(w))n+=1;else return 0;}
  return n;
}
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let box:HTMLElement,input:HTMLInputElement,list:HTMLElement,sel=0,last:Element|null=null;
function ensure(){
  if(box)return;
  box=document.createElement('div');box.className='pal';box.hidden=true;
  box.innerHTML=`<div class="pal-bg" data-pal-close></div><div class="pal-in" role="dialog" aria-modal="true" aria-label="Search the site">
    <div class="pal-top"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
    <input type="text" placeholder="Search services, work and insights" aria-label="Search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="pal-list"><kbd data-pal-close>esc</kbd></div>
    <ul class="pal-list" id="pal-list" role="listbox"></ul>
    <p class="pal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> to move</span><span><kbd>↵</kbd> to open</span></p></div>`;
  document.body.appendChild(box);
  input=box.querySelector('input');list=box.querySelector('.pal-list');
  input.addEventListener('input',paint);
  input.addEventListener('keydown',e=>{
    const as=[...list.querySelectorAll<HTMLAnchorElement>('a')];
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+as.length)%Math.max(1,as.length);mark(as);}
    else if(e.key==='Enter'&&as[sel]){e.preventDefault();as[sel].click();}
  });
  list.addEventListener('pointermove',e=>{const a=(e.target as HTMLElement).closest('a');if(!a)return;const as=[...list.querySelectorAll('a')];const i=as.indexOf(a as HTMLAnchorElement);if(i!==sel){sel=i;mark(as as HTMLAnchorElement[]);}});
  box.addEventListener('click',e=>{const t=e.target as HTMLElement;if(t.closest('[data-pal-close]'))close();else if(t.closest('a'))setTimeout(close,0);});
}
function mark(as:HTMLAnchorElement[]){as.forEach((a,i)=>{a.setAttribute('aria-selected',String(i===sel));if(i===sel)a.scrollIntoView({block:'nearest'});});}
function paint(){
  items??=build();
  const q=norm(input.value.trim());
  const res=items.map(it=>({it,n:score(it,q)})).filter(x=>x.n>0);
  if(q)res.sort((a,b)=>b.n-a.n);
  const top=res.slice(0,q?9:6);
  sel=0;
  list.innerHTML=top.length?top.map(({it},i)=>`<li><a href="${it.h}" role="option" aria-selected="${i===0}"><span class="pal-k">${it.k}</span><b>${esc(it.t)}</b><small>${esc(it.s.length>90?it.s.slice(0,88)+'…':it.s)}</small><i aria-hidden="true">→</i></a></li>`).join('')
    :`<li class="pal-none">Nothing found for “${esc(input.value)}”. <a href="/contact">Ask us instead</a></li>`;
}
export function openPalette(){
  ensure();last=document.activeElement;box.hidden=false;document.documentElement.classList.add('pal-open');
  input.value='';paint();requestAnimationFrame(()=>{box.classList.add('on');input.focus();});
}
function close(){
  if(!box||box.hidden)return;box.classList.remove('on');document.documentElement.classList.remove('pal-open');
  setTimeout(()=>{box.hidden=true;},200);(last as HTMLElement)?.focus?.();
}
export function initPalette(){
  addEventListener('keydown',e=>{
    const typing=(e.target as HTMLElement).closest?.('input,textarea,select,[contenteditable]');
    if((e.key==='k'||e.key==='K')&&(e.metaKey||e.ctrlKey)){e.preventDefault();box&&!box.hidden?close():openPalette();}
    else if(e.key==='/'&&!typing){e.preventDefault();openPalette();}
    else if(e.key==='Escape')close();
  });
  const b=document.getElementById('srch');b?.addEventListener('click',openPalette);
  if(b&&!/Mac|iP(hone|ad)/.test(navigator.platform))b.querySelector('kbd').textContent='Ctrl K';
}
