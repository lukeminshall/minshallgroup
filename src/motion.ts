/* =====================================================================
   MOTION + INTERACTION — everything that moves or responds.
   initPage() runs after every route render; all its listeners hang off
   an AbortController that is aborted on the next render. initGlobal()
   runs once (cursor). Content is visible by default: every effect fails
   toward showing content, and prefers-reduced-motion turns movement off.
   ===================================================================== */
export const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const FINE=window.matchMedia('(pointer:fine)').matches;
let ac:AbortController|null=null;
const cleanups:(()=>void)[]=[];
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

export function initPage(){
  ac?.abort();cleanups.splice(0).forEach(f=>f());
  ac=new AbortController();const sig={signal:ac.signal};
  document.body.dataset.route=location.pathname;
  reveals();scrub(sig);rotator();heroZoom(sig);heroField(sig);varFont(sig);velocityMarquee(sig);hscroll(sig);hoverPreview(sig);
  finder();filters();insightFilter();tabs(sig);stickySteps(sig);magnetic(sig);mobileCta(sig);
  dispatchEvent(new Event('mg:page'));
}
export function initGlobal(){cursor();}

/* ---------- scroll reveal ---------- */
function reveals(){
  const els=[...document.querySelectorAll<HTMLElement>('.reveal,.steps-row li')];
  if(RM||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(e=>io.observe(e));cleanups.push(()=>io.disconnect());
  const t=setTimeout(()=>els.forEach(e=>{if(e.getBoundingClientRect().top<innerHeight)e.classList.add('in');}),1800);
  cleanups.push(()=>clearTimeout(t));
}

/* ---------- scroll-scrubbed statement: words light up as you read ---------- */
function scrub(sig){
  const el=document.querySelector<HTMLElement>('[data-scrub]');if(!el||RM)return;
  el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>`<span class="sw">${w}</span>`).join(' ');
  const ws=[...el.querySelectorAll('.sw')];
  const upd=()=>{const r=el.getBoundingClientRect(),vh=innerHeight;
    const p=clamp((vh*.8-r.top)/(r.height+vh*.25));
    const lit=Math.round(p*ws.length);ws.forEach((w,i)=>w.classList.toggle('lit',i<lit));};
  addEventListener('scroll',upd,{passive:true,...sig});upd();
}

/* ---------- rotating phrase ---------- */
function rotator(){
  const r=document.getElementById('rot');if(!r||RM)return;
  const items=[...r.querySelectorAll('b')];let i=0;
  const iv=setInterval(()=>{const cur=items[i];i=(i+1)%items.length;cur.classList.remove('on');cur.classList.add('out');
    const nx=items[i];nx.classList.remove('out');nx.classList.add('on');setTimeout(()=>cur.classList.remove('out'),650);},2600);
  cleanups.push(()=>clearInterval(iv));
}

/* ---------- hero: the full stop grows until the screen is pink ---------- */
function heroZoom(sig){
  const hero=document.querySelector<HTMLElement>('[data-hero]');if(!hero)return;
  const dot=hero.querySelector<HTMLElement>('[data-zoomdot]'),pin=hero.querySelector<HTMLElement>('.hero2-pin');
  if(RM){hero.classList.add('static');return;}
  let need=60;
  const measure=()=>{dot.style.transform='';const r=dot.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
    const half=Math.max(cx,innerWidth-cx,cy,innerHeight-cy)*1.05;need=(half*2)/Math.max(4,r.width);};
  const upd=()=>{const r=hero.getBoundingClientRect(),run=r.height-innerHeight;const p=clamp(-r.top/Math.max(1,run));
    const z=clamp((p-.12)/.7);const e=z*z*z;                       /* ease-in: slow start, then rush */
    dot.style.transform=`scale(${1+(need-1)*e})`;
    pin.style.setProperty('--fade',String(1-clamp(z*2.2)));
    hero.classList.toggle('filled',z>=.999);};
  /* measure once the entrance animation has settled */
  const t=setTimeout(()=>{measure();upd();},1300);cleanups.push(()=>clearTimeout(t));
  addEventListener('scroll',upd,{passive:true,...sig});
  addEventListener('resize',()=>{measure();upd();},sig);
}

/* ---------- hero: a living field of points ----------
   A quiet grid that breathes, and bends towards the cursor in brand pink:
   the number moving. Starts after first paint, pauses off screen and in
   background tabs, and stays still for reduced motion. */
function heroField(sig){
  const cv=document.querySelector<HTMLCanvasElement>('[data-field]');if(!cv)return;
  const ctx=cv.getContext('2d');if(!ctx)return;
  let W=0,H=0,dpr=1,pts:number[]=[],gap=34,mx=-9999,my=-9999,tmx=-9999,tmy=-9999,on=false,raf=0,t0=performance.now(),lastF=0,touchT=0;
  const size=()=>{const r=cv.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;
    gap=W<700?30:36;pts=[];for(let y=gap/2;y<H;y+=gap)for(let x=gap/2;x<W;x+=gap)pts.push(x,y);};
  const draw=(now:number)=>{
    /* touch screens: 30fps is plenty and kinder to batteries; a touch fades after a moment */
    if(!FINE||W<900){if(now-lastF<33){if(on)raf=requestAnimationFrame(draw);return;}lastF=now;if(touchT&&now-touchT>1400){tmx=tmy=-9999;touchT=0;}}
    const t=(now-t0)/1000;mx+=(tmx-mx)*.12;my+=(tmy-my)*.12;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const R=W<700?140:220;
    for(let i=0;i<pts.length;i+=2){
      const bx=pts[i],by=pts[i+1];
      const w=Math.sin(bx*.012+t*.8)*Math.cos(by*.014-t*.6);          /* slow swell */
      let x=bx,y=by+w*5,dx=x-mx,dy=y-my,d=Math.sqrt(dx*dx+dy*dy),k=0;
      if(d<R){k=1-d/R;k*=k;x-=dx*k*.45;y-=dy*k*.45;}
      const r=.9+Math.max(0,w)*.7+k*2.6;
      ctx.fillStyle=k>.02?`rgba(255,46,99,${.25+k*.75})`:`rgba(255,255,255,${.09+Math.max(0,w)*.1})`;
      ctx.fillRect(x-r/2,y-r/2,r,r);
    }
    if(on&&!RM)raf=requestAnimationFrame(draw);
  };
  const start=()=>{if(on)return;on=true;raf=requestAnimationFrame(draw);},stop=()=>{on=false;cancelAnimationFrame(raf);};
  const boot=()=>{size();cv.classList.add('in');if(RM){draw(performance.now());return;}
    const io=new IntersectionObserver(([e])=>e.isIntersecting&&!document.hidden?start():stop());io.observe(cv);
    cleanups.push(()=>{io.disconnect();stop();});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start(),sig);
    addEventListener('resize',size,sig);
    addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();tmx=e.clientX-r.left;tmy=e.clientY-r.top;if(mx<-999){mx=tmx;my=tmy;}},{passive:true,...sig});
    document.addEventListener('pointerleave',()=>{tmx=tmy=-9999;},sig);
    cv.parentElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const r=cv.getBoundingClientRect();tmx=mx=e.clientX-r.left;tmy=my=e.clientY-r.top;touchT=performance.now();},{passive:true,...sig});};
  const ric=(window as any).requestIdleCallback||((f)=>setTimeout(f,300));
  const go=()=>ric(boot,{timeout:2500});let id:any;if(document.readyState==='complete')id=go();else addEventListener('load',()=>{id=go();},{once:true,...sig});cleanups.push(()=>{(window as any).cancelIdleCallback?.(id);clearTimeout(id);});
}

/* ---------- hero type that thickens and softens near the cursor ---------- */
function varFont(sig){
  const h=document.querySelector<HTMLElement>('[data-vf]');if(!h||!FINE||RM)return;
  const chars=[...h.querySelectorAll<HTMLElement>('.ch')];let mx=-9999,my=-9999,raf=0,live=false;
  const frame=()=>{raf=0;
    for(const c of chars){const r=c.getBoundingClientRect();const d=Math.hypot(r.left+r.width/2-mx,r.top+r.height/2-my);
      const k=live?clamp(1-d/260):0;const w=Math.round(300+k*500),soft=Math.round(k*100);
      c.style.fontVariationSettings=`"opsz" 144, "wght" ${w}, "SOFT" ${soft}, "WONK" ${k>.5?1:0}`;}};
  const req=()=>{if(!raf)raf=requestAnimationFrame(frame);};
  const host=h.closest('section');
  host.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;live=true;req();},sig);
  host.addEventListener('pointerleave',()=>{live=false;req();},sig);
}

/* ---------- huge marquee that speeds up and leans with scroll velocity ---------- */
function velocityMarquee(sig){
  const m=document.querySelector<HTMLElement>('[data-velomarq]');if(!m||RM)return;
  const track=m.querySelector<HTMLElement>('.bigmarq-track');let x=0,v=0,last=scrollY,dir=1,raf=0;
  const loop=()=>{const y=scrollY,dy=y-last;last=y;if(dy)dir=dy>0?1:-1;
    v+=(dy-v)*.12;const half=track.scrollWidth/2;
    x-=(1.1+Math.abs(v)*.35)*dir;if(x<=-half)x+=half;if(x>0)x-=half;
    track.style.transform=`translate3d(${x}px,0,0) skewX(${clamp(-v*.25,-12,12)}deg)`;
    raf=requestAnimationFrame(loop);};
  const io=new IntersectionObserver(([e])=>{cancelAnimationFrame(raf);if(e.isIntersecting){last=scrollY;raf=requestAnimationFrame(loop);}});
  io.observe(m);cleanups.push(()=>{io.disconnect();cancelAnimationFrame(raf);});
}

/* ---------- pinned horizontal capability panels ---------- */
function hscroll(sig){
  const sec=document.querySelector<HTMLElement>('[data-hscroll]');if(!sec)return;
  const track=sec.querySelector<HTMLElement>('[data-htrack]'),count=sec.querySelector('[data-hcount]');
  const panels=[...track.querySelectorAll<HTMLElement>('.hpanel:not(.hp-end)')];
  const on=()=>!RM&&innerWidth>=900;
  let dist=0;
  const measure=()=>{if(!on()){sec.style.height='';track.style.transform='';sec.classList.remove('pinned');return;}
    sec.classList.add('pinned');dist=Math.max(0,track.scrollWidth-innerWidth);sec.style.height=`${innerHeight+dist}px`;upd();};
  const upd=()=>{if(!on())return;const r=sec.getBoundingClientRect();const p=clamp(-r.top/Math.max(1,dist));
    track.style.transform=`translate3d(${-p*dist}px,0,0)`;
    const i=Math.min(panels.length-1,Math.floor(p*(panels.length+.6)));count.textContent=String(i+1).padStart(2,'0');};
  addEventListener('scroll',upd,{passive:true,...sig});addEventListener('resize',measure,sig);
  measure();document.fonts?.ready.then(measure);
  /* phones: native swipe, with the counter, dots and a focus effect following the card in view */
  const all=[...track.querySelectorAll<HTMLElement>('.hpanel')];
  const dots=document.createElement('div');dots.className='hdots';dots.setAttribute('aria-hidden','true');dots.innerHTML=all.map(()=>'<i></i>').join('');track.after(dots);
  const swipe=()=>{if(on())return;const mid=track.scrollLeft+track.clientWidth/2;let best=0,bd=1e9;
    all.forEach((p,i)=>{const c=p.offsetLeft+p.offsetWidth/2,d=Math.abs(c-mid);if(d<bd){bd=d;best=i;}});
    all.forEach((p,i)=>p.classList.toggle('dim',i!==best));[...dots.children].forEach((d,i)=>d.classList.toggle('on',i===best));
    count.textContent=String(Math.min(best,panels.length-1)+1).padStart(2,'0');};
  track.addEventListener('scroll',()=>requestAnimationFrame(swipe),{passive:true,...sig});swipe();
}

/* ---------- list rows with a preview that follows the cursor ---------- */
function hoverPreview(sig){
  const list=document.querySelector<HTMLElement>('[data-hoverlist]'),box=document.querySelector<HTMLElement>('[data-preview-box]');
  if(!list||!box||!FINE)return;
  const pvs=[...box.querySelectorAll<HTMLElement>('[data-pv]')];
  let x=0,y=0,tx=0,ty=0,raf=0,shown=false;
  const loop=()=>{const dx=tx-x;x+=dx*.16;y+=(ty-y)*.16;
    box.style.transform=`translate3d(${x}px,${y}px,0) rotate(${clamp(dx*.06,-8,8)}deg)`;raf=requestAnimationFrame(loop);};
  list.addEventListener('pointermove',e=>{tx=e.clientX+24;ty=e.clientY-120;if(!shown){x=tx;y=ty;}},sig);
  list.querySelectorAll<HTMLElement>('[data-preview]').forEach(a=>a.addEventListener('pointerenter',()=>{
    pvs.forEach(p=>p.classList.toggle('on',p.dataset.pv===a.dataset.preview));
    if(!shown){shown=true;box.classList.add('show');raf=requestAnimationFrame(loop);}},sig));
  const hide=()=>{shown=false;box.classList.remove('show');cancelAnimationFrame(raf);};
  list.addEventListener('pointerleave',hide,sig);
  addEventListener('scroll',()=>{if(!shown)return;const el=document.elementFromPoint(tx-24,ty+120);if(!el||!list.contains(el))hide();},{passive:true,...sig});
  cleanups.push(()=>{cancelAnimationFrame(raf);box.classList.remove('show');});
}

/* ---------- challenge finder ---------- */
function finder(){
  const root=document.querySelector('[data-finder]');if(!root)return;
  const btns=[...root.querySelectorAll<HTMLElement>('[data-f]')],panels=[...root.querySelectorAll<HTMLElement>('[data-fa]')];
  btns.forEach(b=>b.addEventListener('click',()=>{const i=b.dataset.f;
    btns.forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',String(on));});
    panels.forEach(p=>{const on=p.dataset.fa===i;p.hidden=!on;p.classList.toggle('on',on);});
  },{signal:ac.signal}));
}

/* ---------- work filters (also honours ?ind= and #case deep links) ---------- */
function filters(){
  const root=document.querySelector('[data-filters]');if(!root)return;
  const cases=[...document.querySelectorAll<HTMLElement>('.cases.grid .case')];
  const count=root.querySelector('[data-fcount]'),empty=document.querySelector<HTMLElement>('[data-empty]');
  const st={cap:'all',ind:new URLSearchParams(location.search).get('ind')||'all'};
  const apply=()=>{let n=0;
    cases.forEach(c=>{const ok=(st.cap==='all'||c.dataset.caps.split(' ').includes(st.cap))&&(st.ind==='all'||c.dataset.ind===st.ind);c.classList.toggle('out',!ok);if(ok)n++;});
    count.textContent=String(n);empty.hidden=n>0;
    root.querySelectorAll<HTMLElement>('[data-fcap]').forEach(b=>{const on=b.dataset.fcap===st.cap;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});
    root.querySelectorAll<HTMLElement>('[data-find]').forEach(b=>{const on=b.dataset.find===st.ind;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on));});};
  root.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('button');if(!b)return;
    if(b.dataset.fcap)st.cap=b.dataset.fcap;if(b.dataset.find)st.ind=b.dataset.find;apply();},{signal:ac.signal});
  document.querySelector('[data-freset]')?.addEventListener('click',()=>{st.cap='all';st.ind='all';apply();},{signal:ac.signal});
  apply();
  const id=location.hash.slice(1);const hit=id&&document.getElementById(id);
  if(hit){hit.classList.add('hit');(hit.querySelector('details') as HTMLDetailsElement).open=true;setTimeout(()=>hit.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}),500);}
}

/* ---------- industry tabs (deep-linkable via #id) ---------- */
function tabs(sig){
  const root=document.querySelector('[data-tabs]');if(!root)return;
  const btns=[...root.querySelectorAll<HTMLElement>('[data-tab]')],panels=[...root.querySelectorAll<HTMLElement>('.tab-panel')];
  const show=(id,push)=>{if(!panels.some(p=>p.id===id))return;
    btns.forEach(b=>{const on=b.dataset.tab===id;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});
    panels.forEach(p=>p.classList.toggle('on',p.id===id));
    if(push)history.replaceState(null,'','#'+id);};
  btns.forEach(b=>b.addEventListener('click',()=>{show(b.dataset.tab,true);if(innerWidth<1024)root.querySelector('.tab-panels').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});},sig));
  const h=location.hash.slice(1);if(h)show(h,false);
  addEventListener('hashchange',()=>show(location.hash.slice(1),false),sig);
}

/* ---------- sticky steps on /approach ---------- */
function stickySteps(sig){
  const steps=[...document.querySelectorAll<HTMLElement>('[data-ss]')];if(!steps.length)return;
  const idx=[...document.querySelectorAll<HTMLElement>('[data-ss-i]')],bar=document.querySelector<HTMLElement>('[data-ss-bar]');
  const set=i=>{steps.forEach((s,k)=>s.classList.toggle('on',k===i));idx.forEach((s,k)=>s.classList.toggle('on',k===i));bar?.style.setProperty('--sp',String((i+1)/steps.length));};
  let cur=-1;
  const upd=()=>{const mid=innerHeight/2;let best=0,bd=Infinity;
    steps.forEach((s,k)=>{const r=s.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-mid);if(d<bd){bd=d;best=k;}});
    if(best!==cur){cur=best;set(best);}};
  addEventListener('scroll',upd,{passive:true,...sig});upd();
}

/* ---------- magnetic buttons ---------- */
function magnetic(sig){
  if(!FINE||RM)return;
  document.querySelectorAll<HTMLElement>('.mag').forEach(b=>{
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform=`translate(${x*.18}px,${y*.3}px)`;},sig);
    b.addEventListener('pointerleave',()=>{b.style.transform='';},sig);
  });
}

/* ---------- insights: filter by topic ---------- */
function insightFilter(){
  const box=document.querySelector<HTMLElement>('[data-icards]');if(!box)return;
  const btns=[...document.querySelectorAll<HTMLButtonElement>('[data-itag]')];
  btns.forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.itag;
    btns.forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on));});
    box.querySelectorAll<HTMLElement>('[data-tag]').forEach(c=>{const show=t==='All'||c.dataset.tag===t;c.hidden=!show;if(show)c.classList.add('in');});}));
}

/* ---------- phones: one clear next step, always a thumb away ----------
   Appears once the hero has gone, hides near the footer call to action
   and on pages that are already the next step. */
function mobileCta(sig){
  const b=document.getElementById('mcta');if(!b)return;
  const p=location.pathname,sme=p.startsWith('/digitalsme');
  const off=p==='/contact'||p.startsWith('/portal')||p.startsWith('/tools')||p==='/digitalsme/terms';
  b.setAttribute('href',sme?'#quote':'/contact');b.querySelector('span').textContent=sme?'Build my quote':'Start a project';
  const foot=document.querySelector('.foot-cta');
  const upd=()=>{if(off){b.classList.remove('on');return;}
    const fr=foot?.getBoundingClientRect();const nearFoot=fr&&fr.top<innerHeight;
    const show=scrollY>innerHeight*.9&&!nearFoot&&!document.body.classList.contains('menu-open');
    b.classList.toggle('on',show);b.setAttribute('aria-hidden',String(!show));b.tabIndex=show?0:-1;};
  addEventListener('scroll',upd,{passive:true,...sig});upd();
}

/* ---------- the cursor is the brand full stop ----------
   A pink square that trails the pointer, grows over links and shows a
   label over anything with data-cursor. Fine pointers only. */
function cursor(){
  if(!FINE||RM)return;
  const c=document.createElement('div');c.className='cursor';c.setAttribute('aria-hidden','true');c.innerHTML='<span></span><em></em>';
  document.body.appendChild(c);document.documentElement.classList.add('has-cursor');
  const lbl=c.querySelector('em');let x=-100,y=-100,tx=-100,ty=-100;
  const sync=(t:HTMLElement)=>{if(!t)return;const lab=t.closest?.('[data-cursor]') as HTMLElement;
    const link=t.closest?.('a,button,summary,label,select');const field=t.closest?.('input,textarea');
    c.classList.toggle('label',!!lab);if(lab)lbl.textContent=lab.dataset.cursor;
    c.classList.toggle('link',!lab&&!!link);c.classList.toggle('text',!!field);};
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;c.classList.add('vis');sync(e.target as HTMLElement);},{passive:true});
  /* content moves under a still pointer when scrolling or changing page */
  const resync=()=>sync(document.elementFromPoint(tx,ty) as HTMLElement);
  addEventListener('scroll',resync,{passive:true});addEventListener('mg:page',resync);
  document.addEventListener('pointerleave',()=>c.classList.remove('vis'));
  addEventListener('pointerdown',()=>c.classList.add('down'));addEventListener('pointerup',()=>c.classList.remove('down'));
  const loop=()=>{x+=(tx-x)*.22;y+=(ty-y)*.22;c.style.transform=`translate3d(${x}px,${y}px,0)`;requestAnimationFrame(loop);};loop();
}
